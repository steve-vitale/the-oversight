#!/usr/bin/env node
// departdiag-trace-b.js — departure-gate census driver (DIAG ONLY).
// (sim-departdiag-b; prereg: evidence/2026-10-31/sim-departdiag-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Records, per seed per loop-day, the vessel's departure decision: the
// morning state, the routine conditions AS THE CODE SEES THEM (the real
// exported needTrip(Game, ctx) and recovering(Game, ctx) from
// scripts/policies/competent.js, called on the harness ctx at the start
// of the day's daily() call), and the evening outcome (position,
// nighttravel outcome, woodcarry bucket/rescued, warmth record, ctx
// counter deltas, that day's say lines).
//
// READ-ONLY with respect to game behavior, except for two instrument
// calls whose behavior-preservation is argued in the prereg and here:
//  - needTrip(Game, ctx) only reads pantry/scholar/ctx (competent.js
//    lines ~949-964); it writes nothing.
//  - recovering(Game, ctx) can clear ctx._recoverUntilDay to 0, but
//    only on paths where it returns false — the in-daily call would
//    return false and clear the same flag itself. A true return writes
//    nothing. The pre-daily call therefore leaves the in-daily call's
//    boolean and the terminal ctx state unchanged.
// No verb calls, no state writes, no RNG draws beyond what the routine
// itself performs. DIAG ONLY: no probe wiring, no policy file, no edits
// to any existing file.
//
// Transport (EPERM-flap rule): this process NEVER writes files — it
// prints one JSON line per seed to stdout (a pre-opened fd). The caller
// redirects stdout to a .jsonl file in evidence/ in a foreground exec
// and splits it afterwards with an idle process
// (scripts/split-departdiag-jsonl-b.js). Judged corpora are NEVER
// staged in /tmp.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING must NOT be 1
//   SEEDS (default 15215), DAYS=30
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { needTrip, recovering } = require('./policies/competent');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
for (const k of ['MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a departdiag leg'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for departdiag legs'); process.exit(2); }

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  const v = (Game.state || {}).village || {};
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    havenPx: (v.px === undefined ? null : v.px), havenPy: (v.py === undefined ? null : v.py),
    kcal: Math.round(sch.kcal || 0),
    hydration: (sch.hydration === undefined ? null : Math.round(sch.hydration)),
    waterLen: (Array.isArray(sch.water) ? sch.water.length : null),
    hp: (sch.hp === undefined ? null : sch.hp), maxHp: (sch.maxHp === undefined ? null : sch.maxHp),
    gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
  };
}

function pantryKcal(Game) {
  try {
    const items = ((Game.state || {}).village || {}).pantry || [];
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    return { kcal: Math.round(kcal), count: items.length };
  } catch (e) { return null; }
}

function packKnownKcal(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const day = sch.day || 0;
    let known = 0, all = 0;
    for (const it of (sch.inventory || [])) {
      if (!it || typeof it !== 'object') continue;
      const k = (it.kcalEach || 0) * (it.units || 0);
      all += k;
      let spoiled = false;
      try { spoiled = (typeof Game.isSpoiled === 'function') ? !!Game.isSpoiled(it) : ((it.spoilDay !== undefined && it.spoilDay !== null) ? it.spoilDay <= day : false); } catch (e) {}
      if ((it.kcalEach || 0) > 0 && it.edible !== false && !spoiled) known += k;
    }
    return { kcalKnown: Math.round(known), kcalAll: Math.round(all), items: (sch.inventory || []).length };
  } catch (e) { return null; }
}

function ctxCounters(ctx) {
  return {
    forageTrips: ctx.forageTrips || 0,
    tripHomeDetours: ctx.tripHomeDetours || 0,
    recoverDays: ctx.recoverDays || 0,
    lastGiveDay: (ctx._lastGiveDay === undefined ? null : ctx._lastGiveDay),
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const errs = [];
  const spawn = { pos: snapPos(Game), pack: packKnownKcal(Game), pantry: pantryKcal(Game) };
  const decisions = [], evenings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      const mPos = snapPos(Game2);
      const mPantry = pantryKcal(Game2);
      const mPack = packKnownKcal(Game2);
      let kcalCap = null;
      try { kcalCap = (typeof Game2.kcalCap === 'function') ? Game2.kcalCap() : null; } catch (e) { errs.push('kcalCap: ' + String(e && e.message).slice(0, 120)); }
      let needTripVal = null, needTripErr = null;
      try { needTripVal = !!needTrip(Game2, ctx); } catch (e) { needTripErr = String(e && e.message).slice(0, 160); errs.push('needTrip: ' + needTripErr); }
      let recoveringVal = null, recoveringErr = null;
      try { recoveringVal = !!recovering(Game2, ctx); } catch (e) { recoveringErr = String(e && e.message).slice(0, 160); errs.push('recovering: ' + recoveringErr); }
      const before = ctxCounters(ctx);
      const sayBefore = sayLines.length;
      warmed.daily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const after = ctxCounters(ctx);
      const ePos = snapPos(Game2);
      const delta = {
        forageTrips: after.forageTrips - before.forageTrips,
        tripHomeDetours: after.tripHomeDetours - before.tripHomeDetours,
        recoverDays: after.recoverDays - before.recoverDays,
      };
      decisions.push({
        loopDay: callIdx,
        morning: mPos, pantry: mPantry, pack: mPack, kcalCap,
        day: mPos.gameDay,
        lastGiveDayBefore: before.lastGiveDay,
        lastGiveDayAfter: after.lastGiveDay,
        needTrip: needTripVal, needTripErr,
        recovering: recoveringVal, recoveringErr,
        ctxDelta: delta,
        saySeqAtMorning: sayBefore,
      });
      const row = { loopDay: callIdx, ...ePos, saySeqAtEvening: saySeq };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.travelledHome = !!nt.travelledHome;
      }
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
      row.pack = packKnownKcal(Game2);
      row.pantry = pantryKcal(Game2);
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      row.dayLines = dayLines;
      row.ctxDelta = delta;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: process.env.POLICY, woodwarm: process.env.WOODWARM, woodcarry: process.env.WOODCARRY,
    spawn,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    errs, errCount: errs.length,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    decisions, evenings,
    sayLines,
  };
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('departdiag seed=' + seed + ' woodwarm=' + process.env.WOODWARM + ' end=' + inst.endReason + ' days=' + inst.daysAlive + ' decisions=' + inst.decisions.length + ' evenings=' + inst.evenings.length + ' errs=' + inst.errCount + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' departdiag JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('DEPARTDIAG TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance };
