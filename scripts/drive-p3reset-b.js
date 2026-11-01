#!/usr/bin/env node
// drive-p3reset-b.js — sleep pantry-flow instrumented driver (DIAG ONLY).
// (sim-p3reset-b; prereg: evidence/2026-11-01/sim-p3reset-b-prereg.md.)
//
// Runs seed 17549 on the P3 deed-seeking stack (the awayeve pilot P3
// stack, same substrate env asserts as the absencehunt driver) on THIS
// worktree's base, with LOG-ONLY runtime wrappers: no game behavior
// changes, no RNG draws, no state writes. The wrappers log:
//   - every stockPantry call (kcal, item, scholar day, dayPart, phase
//     stack, caller hint, pantry before/after, say-seq at call time)
//   - villageEats entry/exit (pantry + hungryDays before/after)
//   - villagerMealDay per villager (pantry before/after, ate/gave/drawn)
//   - villageLives / villageMeal / npcNodeTravel / advancePart /
//     endDay / sleep entry/exit (pantry before/after)
//   - pantry-at-say for every hunger marker / reset line (the say
//     wrapper reads the live item sum synchronously inside
//     villageEats' famine block — that IS the checked value)
// The say-seq ordering (stockPantry log's saySeqBefore vs the marker
// line's seq) splits pre-check from post-check deposits exactly.
//
// This process NEVER writes files: it prints ONE JSON object to
// stdout; the caller redirects stdout to an evidence file in a
// foreground exec (EPERM-flap rule, same as the absencehunt driver).
// The output is a NEW-BASE leg: it is reported as such, never as a
// reproduction of the awayeve legs, unless it meets the prereg's
// reproduction rule (same evening/morning snaps + same marker/reset
// nights as the committed corpus).
//
// Env (all asserted FATAL, same as absencehunt):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=deed-seeking (this driver only), WOODCARRY/WOODWARM not 1,
//   MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1,
//   SEEDS=17549, DAYS=30.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { deedSeeking } = require('./policies/deed-seeking');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.POLICY !== 'deed-seeking') { console.error('FATAL: POLICY must be deed-seeking for drive-p3reset-b'); process.exit(2); }
if (process.env.WOODCARRY === '1' || process.env.WOODWARM === '1') { console.error('FATAL: WOODCARRY/WOODWARM must NOT be 1 for deed-seeking'); process.exit(2); }
for (const k of ['MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1'); process.exit(2); }
}
if (process.env.SEEDS !== '17549') { console.error('FATAL: SEEDS must be 17549 for drive-p3reset-b'); process.exit(2); }
if (parseInt(process.env.DAYS || '30', 10) !== 30) { console.error('FATAL: DAYS must be 30 for drive-p3reset-b'); process.exit(2); }

function pantryOf(Game) {
  try {
    const items = ((Game.state || {}).village || {}).pantry || [];
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    return { kcal: Math.round(kcal), count: items.length };
  } catch (e) { return null; }
}

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return { tile, kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0, vesselId: Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId || null) };
}

function callerHint() {
  try {
    const stack = (new Error().stack || '').split('\n').slice(1);
    const names = [];
    for (const line of stack) {
      const m = line.match(/at (?:async )?([A-Za-z0-9_$.<>]+)/);
      if (!m) continue;
      const fn = m[1];
      if (fn.includes('drive-p3reset') || fn === 'Object.<anonymous>' || fn === 'Module._compile') continue;
      if (!names.includes(fn)) names.push(fn);
      if (names.length >= 3) break;
    }
    return names.join(' < ');
  } catch (e) { return null; }
}

async function main() {
  const { Game } = await loadGame({ seed: 17549, mode: 'absencehunt-b', fullTelemetry: false });
  // FATAL if the instrumented methods are absent (a silent skip would
  // fake a "no deposits" result).
  for (const m of ['stockPantry', 'villageEats', 'villagerMealDay', 'villageLives', 'villageMeal', 'endDay', 'sleep', 'npcNodeTravel', 'advancePart']) {
    if (typeof Game[m] !== 'function') { console.error('FATAL: Game.' + m + ' is not a function on this base'); process.exit(2); }
  }
  const sayLines = [];
  let saySeq = 0;
  const log = {
    stockPantryCalls: [], villageEatsCalls: [], villagerMealDayCalls: [],
    villageLivesCalls: [], villageMealCalls: [], endDayCalls: [], sleepCalls: [],
    checkLines: [], npcReturns: [],
  };
  const phaseStack = [];
  const phaseNow = () => phaseStack.join('>') || 'other';
  const withPhase = (name, fn) => {
    phaseStack.push(name);
    try { return fn(); } finally { phaseStack.pop(); }
  };

  // Say wrapper FIRST (before setupGame), like the absencehunt driver.
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      const line = String(args[0] || '');
      const rec = { seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: line.slice(0, 400) };
      sayLines.push(rec);
      if (/Haven's pantry is empty\. Day \d+ of hunger/.test(line) || /Haven eats again/.test(line)) {
        log.checkLines.push({
          seq: rec.seq, day: rec.day, line: rec.line,
          pantryAtSay: pantryOf(Game),
          hungryDaysAtSay: ((Game.state || {}).village || {}).hungryDays || 0,
          phase: phaseNow(),
        });
      }
      return origSay.apply(this, args);
    };
  }

  // Log-only method wrappers (call-through, no RNG, no state writes).
  const wrap = (name, onCall) => {
    const orig = Game[name];
    if (typeof orig !== 'function' || orig._p3resetWrapped) return;
    const w = function (...args) {
      return withPhase(name, () => {
        if (onCall) onCall('enter', args);
        const r = orig.apply(this, args);
        if (onCall) onCall('exit', args, r);
        return r;
      });
    };
    w._p3resetWrapped = true;
    Game[name] = w;
  };
  const dayPartOf = () => {
    try { return Game.dayPart; } catch (e) { return null; }
  };
  wrap('stockPantry', (when, args) => {
    if (when !== 'enter') return;
    const before = pantryOf(Game);
    // Capture after-state lazily: wrap the return path via a marker —
    // stockPantry is synchronous, so record before here and patch the
    // last entry on exit through a pending slot.
    log.stockPantryCalls.push({
      saySeqBefore: sayLines.length,
      scholarDay: (Game.state.scholar || {}).day || 0,
      dayPart: dayPartOf(),
      kcal: args[0], item: args[1],
      phase: phaseStack.slice(0, -1).join('>') || 'other', caller: callerHint(),
      pantryBefore: before, pantryAfter: null,
    });
  });
  // Patch stockPantry after-state: re-wrap to fill pantryAfter on exit.
  {
    const cur = Game.stockPantry;
    const w2 = function (...args) {
      const r = cur.apply(this, args);
      const last = log.stockPantryCalls[log.stockPantryCalls.length - 1];
      if (last && last.pantryAfter === null) last.pantryAfter = pantryOf(Game);
      return r;
    };
    w2._p3resetWrapped = true;
    Game.stockPantry = w2;
  }
  wrap('villageEats', (when) => {
    if (when === 'enter') {
      log.villageEatsCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, pantryBefore: pantryOf(Game), hungryBefore: ((Game.state || {}).village || {}).hungryDays || 0, pantryAfter: null, hungryAfter: null });
    } else {
      const last = log.villageEatsCalls[log.villageEatsCalls.length - 1];
      if (last) { last.saySeqAfter = sayLines.length; last.pantryAfter = pantryOf(Game); last.hungryAfter = ((Game.state || {}).village || {}).hungryDays || 0; }
    }
  });
  wrap('villagerMealDay', (when, args, ret) => {
    if (when === 'enter') {
      log.villagerMealDayCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, vid: args[0], pantryBefore: pantryOf(Game), pantryAfter: null, result: null });
    } else {
      const last = log.villagerMealDayCalls[log.villagerMealDayCalls.length - 1];
      if (last) { last.pantryAfter = pantryOf(Game); last.result = ret ? { ate: ret.ate, gave: ret.gave, drawn: ret.drawn || 0 } : null; }
    }
  });
  wrap('villageLives', (when) => {
    if (when === 'enter') log.villageLivesCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, pantryBefore: pantryOf(Game) });
    else { const l = log.villageLivesCalls[log.villageLivesCalls.length - 1]; if (l) l.pantryAfter = pantryOf(Game); }
  });
  wrap('villageMeal', (when) => {
    if (when === 'enter') log.villageMealCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, pantryBefore: pantryOf(Game) });
    else { const l = log.villageMealCalls[log.villageMealCalls.length - 1]; if (l) l.pantryAfter = pantryOf(Game); }
  });
  wrap('endDay', (when) => {
    if (when === 'enter') log.endDayCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, pantryBefore: pantryOf(Game) });
    else { const l = log.endDayCalls[log.endDayCalls.length - 1]; if (l) l.pantryAfter = pantryOf(Game); }
  });
  wrap('sleep', (when) => {
    if (when === 'enter') log.sleepCalls.push({ saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0, pantryBefore: pantryOf(Game) });
    else { const l = log.sleepCalls[log.sleepCalls.length - 1]; if (l) l.pantryAfter = pantryOf(Game); }
  });
  wrap('npcNodeTravel', (when) => {
    // Away-diff attribution (log-only state reads): an away NPC that
    // returns during this call stops being in v.away. stockPantry
    // calls logged during the call belong to those returns; when
    // exactly one forage return happens, its deposit(s) attribute to
    // that villager. (The deposit itself carries no rid.)
    if (when === 'enter') {
      const aw = ((Game.state || {}).village || {}).away || {};
      wrap._awayBefore = Object.fromEntries(Object.entries(aw).map(([k, v]) => [k, v ? v.purpose : null]));
      wrap._stockBefore = log.stockPantryCalls.length;
      // Roster order at entry: npcNodeTravel iterates v.roster in order
      // and deposits immediately per forage returner, so the deposits
      // logged during this call map to the forage returners in roster
      // order. (Log-only state read.)
      wrap._rosterBefore = (((Game.state || {}).village || {}).roster || []).slice();
    } else {
      const aw = ((Game.state || {}).village || {}).away || {};
      const before = wrap._awayBefore || {};
      const returned = Object.keys(before).filter((rid) => !(rid in aw));
      if (returned.length) {
        const calls = log.stockPantryCalls.slice(wrap._stockBefore || 0);
        log.npcReturns.push({
          saySeqBefore: sayLines.length, scholarDay: (Game.state.scholar || {}).day || 0,
          returned: returned.map((rid) => ({ rid, purpose: before[rid] })),
          rosterOrder: wrap._rosterBefore || [],
          stockCallsDuring: calls.map((c) => ({ kcal: c.kcal, item: c.item, pantryBefore: c.pantryBefore, pantryAfter: c.pantryAfter })),
        });
        if (returned.length === 1 && before[returned[0]] === 'forage') {
          for (const c of calls) c.npcReturnRid = returned[0];
        }
      }
    }
  });
  wrap('advancePart', () => {});

  await setupGame(Game);
  const decisions = [], evenings = [];
  let callIdx = 0;
  const baseDaily = deedSeeking.daily.bind(deedSeeking);
  const policy = Object.assign({}, deedSeeking, {
    daily(Game2, ctx) {
      callIdx++;
      const mPos = snapPos(Game2);
      const mPantry = pantryOf(Game2);
      const sayBefore = sayLines.length;
      baseDaily(Game2, ctx);
      const sayAfter = sayLines.length;
      decisions.push({ loopDay: callIdx, morning: mPos, pantry: mPantry, saySeqAtMorning: sayBefore });
      const ePos = snapPos(Game2);
      evenings.push({ loopDay: callIdx, ...ePos, saySeqAtEvening: saySeq, pantry: pantryOf(Game2), dayLines: sayLines.slice(sayBefore, sayAfter).map((x) => x.line) });
    },
  });
  const result = await runDays(Game, policy, { days: 30, manifest: null });
  process.stdout.write(JSON.stringify({
    seed: 17549, policy: 'deed-seeking', leg: 'new-base',
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    decisions, evenings, sayLines, pantryLog: log,
  }) + '\n');
}

if (require.main === module) {
  main().catch((e) => { console.error('DRIVE-P3RESET CRASH', e && (e.stack || e)); process.exit(2); });
}
