#!/usr/bin/env node
// waitsalign-nightwatch-b.js — night-by-night sleep log for
// the strand legs (sim-waitsalign-a). PURE LOGGING wrappers:
// Game.sleep and Game.doAction('wait') are wrapped to record
// before/after (day, dayTicks, tbfight, pendingEncounter,
// activeContest) plus the say lines spoken during sleep. No
// state edits, no RNG draws, no trajectory change — the leg
// underneath is the same waitsalign-trace-b stack (mode from
// WAITSALIGN, same substrate gates). Output: one JSON per
// seed under evidence/2026-10-31/
// sim-waitsalign-a-nightwatch-<guard|on>-<mode>/.
// WHY: the corpus scan (P1) leaves three ON-control nights
// unexplained by the refused/accepted sleep dichotomy
// (d16 eve 273 -> morning 128; d20 eve 401 -> morning 256;
// d22 eve 419 -> morning 256). The sleep loop can also be
// INTERRUPTED mid-loop (fight / encounter / contest grab /
// tent wreck -> woke, no day roll), and the morning then
// depends on the interruption clock. This driver measures
// exactly that: sleep outcome per night + the 3 waits after
// it, so each anomalous morning gets a recorded cause.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withPressb, newStore: newPbStore } = require('./policies/pressb-diag');
const { withSelecttrim, newStore: newStStore } = require('./policies/selecttrim-diag');
const { withWaitsalign, newStore: newWaStore } = require('./policies/waitsalign-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 0 or 1'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.PRESSB !== '0' && process.env.PRESSB !== '1') { console.error('FATAL: PRESSB must be 0 or 1'); process.exit(2); }
if (process.env.WAITSALIGN !== '0' && process.env.WAITSALIGN !== '1' && process.env.WAITSALIGN !== '2') { console.error('FATAL: WAITSALIGN must be 0, 1 or 2'); process.exit(2); }
const MODE = process.env.WAITSALIGN;
const MODE_NAME = MODE === '0' ? 'control' : MODE === '1' ? 'trim' : 'askskip';
if (MODE === '1') process.env.SELECTTRIM = '1';
if (MODE === '2') process.env.WAITSALIGN_ASKSKIP = '1';
const SEEDS = (process.env.SEEDS || '15215').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '25', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-waitsalign-a-nightwatch-' + (process.env.WOODWARM === '1' ? 'on' : 'guard') + '-' + MODE_NAME);

function dayTicksOf(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function fightFlags(Game) {
  let tb = false, pe = false, ac = false;
  try { tb = !!(Game.tbfight && !Game.tbfight.over); } catch (e) {}
  try { pe = !!Game.pendingEncounter; } catch (e) {}
  try { ac = !!(Game.state && Game.state.activeContest); } catch (e) {}
  return { tbfight: tb, pendingEncounter: pe, activeContest: ac };
}
function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return { mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my), tile,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0 };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  const nights = [];
  let currentNight = null;
  let waitSeq = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 30000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  {
    const origSleep = Game.sleep;
    Game.sleep = function (...args) {
      const before = { day: (Game.state.scholar || {}).day || 0, dayTicks: dayTicksOf(Game), flags: fightFlags(Game) };
      const sayBefore = sayLines.length;
      const r = origSleep.apply(this, args);
      const after = { day: (Game.state.scholar || {}).day || 0, dayTicks: dayTicksOf(Game), flags: fightFlags(Game) };
      const lines = sayLines.slice(sayBefore).map((x) => x.line);
      currentNight = { sleepBefore: before, sleepAfter: after,
        sleepLines: lines.filter((l) => /sleep|dawn|wake|too late|rested|frozen|start/i.test(l)).slice(0, 12),
        sleepLineCount: lines.length, waits: [] };
      waitSeq = [];
      nights.push(currentNight);
      return r;
    };
  }
  {
    const origDoAction = Game.doAction;
    Game.doAction = function (kind, ...rest) {
      if (kind === 'wait' && currentNight && currentNight.waits.length < 3) {
        const before = { day: (Game.state.scholar || {}).day || 0, dayTicks: dayTicksOf(Game), flags: fightFlags(Game) };
        const r = origDoAction.call(this, kind, ...rest);
        const after = { day: (Game.state.scholar || {}).day || 0, dayTicks: dayTicksOf(Game), flags: fightFlags(Game) };
        currentNight.waits.push({ before, after });
        return r;
      }
      return origDoAction.call(this, kind, ...rest);
    };
  }
  await setupGame(Game);
  const evenings = [], mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const probedN = nighttravel;
  const stStore = newStStore();
  const waStore = newWaStore();
  let modeLayer = probedN;
  if (MODE === '1') modeLayer = withSelecttrim(probedN, stStore);
  else if (MODE === '2') modeLayer = withWaitsalign(probedN, waStore);
  const base = withWoodcarry(modeLayer, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const pbStore = newPbStore();
  const dayPolicy = withPressb(warmed, pbStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m, morningDayTicks: dayTicksOf(Game2) });
      }
      dayPolicy.daily(Game2, ctx);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, ...pos };
      row.woodcarry = ctx._wcLast || null;
      row.eveningOutcome = (ctx._ntLast || {}).outcome || 'policy-no-record';
      row.pressbAttempt = (pbStore.attempts || []).find((a) => a.loopDay === callIdx) || null;
      row.selecttrimTrim = (stStore.trims || []).find((h) => h.loopDay === callIdx) || null;
      row.waitsalignAsk = (waStore.asks || []).find((h) => h.loopDay === callIdx) || null;
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningDayTicks = mRow ? mRow.morningDayTicks : null;
      row.eveningDayTicks = dayTicksOf(Game2);
      row.gameOver = !!Game2.over;
      evenings.push(row);
      // Join is done post-hoc below: nights are recorded in
      // sleep order, so evening loopDay L -> nights[L-1]
      // (nights[0] follows evening 1). No per-row index is
      // needed here.
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  // Join: night k follows evening loopDay k+1? Sleep is called
  // after daily loopDay k, so nights[k-1] follows evening k.
  // The daily wrapper tags row.nightIndex AFTER the sleep of
  // the PREVIOUS loop-day already happened, so the correct
  // join is: evening loopDay L -> nights[L-1] (0-based).
  const joined = evenings.map((e) => {
    const n = nights[e.loopDay - 1] || null;
    const nextM = mornings.find((m) => m.loopDay === e.loopDay + 1) || null;
    return { loopDay: e.loopDay, gameDay: e.gameDay, eve: e.eveningDayTicks,
      eveningCell: e.mx + ',' + e.my, eveningOutcome: e.eveningOutcome,
      nextMorning: nextM ? nextM.morningDayTicks : null,
      nextMorningCell: nextM ? (nextM.mx + ',' + nextM.my) : null,
      nextMorningGameDay: nextM ? nextM.gameDay : null,
      sleep: n ? { before: n.sleepBefore, after: n.sleepAfter, lines: n.sleepLines } : null,
      waits: n ? n.waits : null };
  });
  return { seed, mode: MODE_NAME, daysAlive: result.days, endReason: result.endReason,
    deaths: (result.samples && result.samples.deaths) || [], evenings, mornings, nights: joined };
}

(async () => {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    // Print FIRST: under an EPERM flap the write below may fail,
    // and the night table must survive in stdout regardless.
    for (const j of inst.nights) {
      if (j.sleep && j.sleep.before && j.eve !== undefined) {
        const s = j.sleep;
        console.log('night-after-d' + j.loopDay + ' eve=' + j.eve + ' sleep ' + s.before.dayTicks + '->' + s.after.dayTicks
          + ' day ' + s.before.day + '->' + s.after.day + ' flagsBefore=' + JSON.stringify(s.before.flags)
          + ' waits=' + (j.waits || []).map((w) => w.before.dayTicks + '->' + w.after.dayTicks).join(',')
          + ' morning=' + j.nextMorning + ' lines=' + JSON.stringify(s.lines || []));
      }
    }
    const name = `waitsalign-nightwatch-s${seed}.json`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 30)) console.log('nightwatch seed=' + seed + ' written nights=' + inst.nights.length);
    else { console.error('NIGHTWATCH WRITE PENDING ' + name + ' — table above is the record; re-run to persist'); process.exit(3); }
  }
})().catch((e) => { console.error('NIGHTWATCH CRASH', e && (e.stack || e)); process.exit(2); });
