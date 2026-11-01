#!/usr/bin/env node
// refusedband-trace-b.js — travel-refused band hunt driver (DIAG ONLY).
// (sim-refusedband-b; prereg: evidence/2026-10-31/
// sim-refusedband-b-prereg.md, committed BEFORE any judged leg.)
//
// Per seed per loop-day: a morning snap (state at the START of that day's
// daily() call), the base policy's daily() itself (unchanged behavior),
// and an evening snap (state after daily(), before the harness's sleep),
// plus ctx._ntLast travel record, ctx._wcLast (P1) and
// ctx._creekremedyLast (bare/trigger stacks) on the evening row, and
// that day's say lines. READ-ONLY with respect to game behavior: no verb
// calls, no state writes, no RNG draws beyond what the routine itself
// performs.
//
// Transport (EPERM-flap rule): this process NEVER writes files — it
// prints one JSON line per seed to stdout (a pre-opened fd). The caller
// redirects stdout to a .jsonl file in evidence/ in a foreground exec
// and splits it afterwards with an idle process
// (scripts/split-absencehunt-jsonl-b.js). Judged corpora are NEVER
// staged in /tmp.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY in {p1, bare, strandfix, waitsalign, selecttrim, deed-seeking}
//   P1 requires WOODCARRY=1, WOODWARM=1
//   bare/strandfix/waitsalign/selecttrim require CREEKREMEDY_DIAG=1,
//     WOODCARRY/WOODWARM unset/0, plus their own lever =1
//   deed-seeking requires all levers unset/0
//   MORNINGCARRY, WINDOWCARRY, FEDEVENING, COMPETENT_EVENING_DETOUR must NOT be 1
//   SEEDS (default 17601), DAYS in {30, 60}
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withCreekremedyDiag, newStore: newCrStore } = require('./policies/creekremedy-diag');
const { withStrandfix, newStore: newSfStore } = require('./policies/strandfix-ticks-diag');
const { withWaitsalign, newStore: newWaStore } = require('./policies/waitsalign-diag');
const { withSelecttrim, newStore: newStStore } = require('./policies/selecttrim-diag');
const { deedSeeking } = require('./policies/deed-seeking');

const POLICY = process.env.POLICY;
if (!['p1', 'bare', 'strandfix', 'waitsalign', 'selecttrim', 'deed-seeking'].includes(POLICY)) {
  console.error('FATAL: POLICY must be p1|bare|strandfix|waitsalign|selecttrim|deed-seeking'); process.exit(2);
}
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
for (const k of ['MORNINGCARRY', 'WINDOWCARRY', 'FEDEVENING', 'COMPETENT_EVENING_DETOUR']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a refusedband leg'); process.exit(2); }
}
function leverOff(k) { return process.env[k] === undefined || process.env[k] === '0'; }
if (POLICY === 'p1') {
  if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1 for p1'); process.exit(2); }
  if (process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 1 for p1'); process.exit(2); }
  for (const k of ['CREEKREMEDY_DIAG', 'STRANDFIX', 'WAITSALIGN_ASKSKIP', 'SELECTTRIM']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for p1'); process.exit(2); }
  }
} else if (POLICY === 'bare') {
  if (process.env.CREEKREMEDY_DIAG !== '1') { console.error('FATAL: CREEKREMEDY_DIAG must be 1 for bare'); process.exit(2); }
  for (const k of ['WOODCARRY', 'WOODWARM', 'STRANDFIX', 'WAITSALIGN_ASKSKIP', 'SELECTTRIM']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for bare'); process.exit(2); }
  }
} else if (POLICY === 'strandfix') {
  if (process.env.CREEKREMEDY_DIAG !== '1') { console.error('FATAL: CREEKREMEDY_DIAG must be 1 for strandfix'); process.exit(2); }
  if (process.env.STRANDFIX !== '1') { console.error('FATAL: STRANDFIX must be 1 for strandfix'); process.exit(2); }
  for (const k of ['WOODCARRY', 'WOODWARM', 'WAITSALIGN_ASKSKIP', 'SELECTTRIM']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for strandfix'); process.exit(2); }
  }
} else if (POLICY === 'waitsalign') {
  if (process.env.CREEKREMEDY_DIAG !== '1') { console.error('FATAL: CREEKREMEDY_DIAG must be 1 for waitsalign'); process.exit(2); }
  if (process.env.WAITSALIGN_ASKSKIP !== '1') { console.error('FATAL: WAITSALIGN_ASKSKIP must be 1 for waitsalign'); process.exit(2); }
  for (const k of ['WOODCARRY', 'WOODWARM', 'STRANDFIX', 'SELECTTRIM']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for waitsalign'); process.exit(2); }
  }
} else if (POLICY === 'selecttrim') {
  if (process.env.CREEKREMEDY_DIAG !== '1') { console.error('FATAL: CREEKREMEDY_DIAG must be 1 for selecttrim'); process.exit(2); }
  if (process.env.SELECTTRIM !== '1') { console.error('FATAL: SELECTTRIM must be 1 for selecttrim'); process.exit(2); }
  for (const k of ['WOODCARRY', 'WOODWARM', 'STRANDFIX', 'WAITSALIGN_ASKSKIP']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for selecttrim'); process.exit(2); }
  }
} else { // deed-seeking control
  for (const k of ['WOODCARRY', 'WOODWARM', 'CREEKREMEDY_DIAG', 'STRANDFIX', 'WAITSALIGN_ASKSKIP', 'SELECTTRIM']) {
    if (!leverOff(k)) { console.error('FATAL: ' + k + ' must NOT be 1 for deed-seeking'); process.exit(2); }
  }
}

const SEEDS = (process.env.SEEDS || '17601')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30 && DAYS !== 60) { console.error('FATAL: DAYS must be 30 or 60 for refusedband legs'); process.exit(2); }

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  const v = (Game.state || {}).village || {};
  let roadActive = null, roadOnRoad = null;
  try { roadActive = !!((Game.state || {}).road && Game.state.road.active); } catch (e) {}
  try { roadOnRoad = (Game.nomad && typeof Game.nomad.onRoad === 'function') ? !!Game.nomad.onRoad() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    havenPx: (v.px === undefined ? null : v.px), havenPy: (v.py === undefined ? null : v.py),
    kcal: Math.round(sch.kcal || 0),
    gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
    roadActive, roadOnRoad,
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

function buildBase() {
  if (POLICY === 'p1') {
    const wcStore = newStore();
    const base = withWoodcarry(nighttravel, wcStore);
    const wwStore = newWwStore();
    const warmed = withWoodwarm(base, wwStore);
    return { base: warmed, wcStore, wwStore, crStore: null, trigStore: null };
  }
  if (POLICY === 'bare') {
    const crStore = newCrStore();
    return { base: withCreekremedyDiag(nighttravel, 'creekremedy', 'nighttravel + creekremedy recorder', crStore), wcStore: null, wwStore: null, crStore, trigStore: null };
  }
  if (POLICY === 'strandfix') {
    const sfStore = newSfStore();
    const crStore = newCrStore();
    const inner = withStrandfix(nighttravel, sfStore);
    return { base: withCreekremedyDiag(inner, 'creekremedy', 'strandfix + creekremedy recorder', crStore), wcStore: null, wwStore: null, crStore, trigStore: sfStore };
  }
  if (POLICY === 'waitsalign') {
    const waStore = newWaStore();
    const crStore = newCrStore();
    const inner = withWaitsalign(nighttravel, waStore);
    return { base: withCreekremedyDiag(inner, 'creekremedy', 'waitsalign + creekremedy recorder', crStore), wcStore: null, wwStore: null, crStore, trigStore: waStore };
  }
  if (POLICY === 'selecttrim') {
    const stStore = newStStore();
    const crStore = newCrStore();
    const inner = withSelecttrim(nighttravel, stStore);
    return { base: withCreekremedyDiag(inner, 'creekremedy', 'selecttrim + creekremedy recorder', crStore), wcStore: null, wwStore: null, crStore, trigStore: stStore };
  }
  return { base: deedSeeking, wcStore: null, wwStore: null, crStore: null, trigStore: null };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'refusedband-b', fullTelemetry: false });
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
  const spawn = { pos: snapPos(Game), pantry: pantryKcal(Game) };
  const decisions = [], evenings = [];
  let callIdx = 0;
  const { base, wcStore, wwStore, crStore, trigStore } = buildBase();
  const baseDaily = base.daily.bind(base);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      const mPos = snapPos(Game2);
      const sayBefore = sayLines.length;
      baseDaily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      decisions.push({ loopDay: callIdx, morning: mPos, day: mPos.gameDay, saySeqAtMorning: sayBefore });
      const ePos = snapPos(Game2);
      const row = { loopDay: callIdx, ...ePos, saySeqAtEvening: saySeq };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.travelledHome = !!nt.travelledHome;
      }
      row.ntTravel = (ctx._ntLast && ctx._ntLast.travel) || null;
      row.ntHavenDistance = (ctx._ntLast && ctx._ntLast.havenDistance !== undefined) ? ctx._ntLast.havenDistance : null;
      row.ntBefore = (ctx._ntLast && ctx._ntLast.before) || null;
      row.woodcarry = ctx._wcLast || null;
      row.creekremedy = ctx._creekremedyLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
      row.pantry = pantryKcal(Game2);
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      row.dayLines = dayLines;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY, days: DAYS,
    spawn,
    woodcarryStore: wcStore ? { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused } : null,
    warmthStore: wwStore ? { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed } : null,
    creekremedyStore: crStore ? { records: crStore.records.length, errs: crStore.errs, errors: crStore.errors, classified: crStore.classified, unclassified: crStore.unclassified, otherRefused: crStore.otherRefused } : null,
    trigStore: trigStore ? { errs: trigStore.errs, errors: trigStore.errors } : null,
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
    console.error('refusedband policy=' + POLICY + ' days=' + DAYS + ' seed=' + seed + ' end=' + inst.endReason + ' daysAlive=' + inst.daysAlive + ' decisions=' + inst.decisions.length + ' evenings=' + inst.evenings.length + ' errs=' + inst.errCount + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' refusedband JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('REFUSEDBAND TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapPos };
