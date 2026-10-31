#!/usr/bin/env node
// absencehunt-trace-b.js — overnight-absence census driver (DIAG ONLY).
// (sim-absencehunt-b; prereg: evidence/2026-10-31/sim-absencehunt-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Per seed per loop-day: a morning snap (state at the START of that day's
// daily() call), the base policy's daily() itself (unchanged behavior),
// and an evening snap (state after daily(), before the harness's sleep),
// plus ctx counter deltas and that day's say lines. READ-ONLY with
// respect to game behavior: no verb calls, no state writes, no RNG draws
// beyond what the routine itself performs.
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
//   POLICY in {nighttravel-stack, competent, deed-seeking, nomadseek}
//   WOODCARRY/WOODWARM: P1 requires 1/1; P2/P3/P4 require unset/0
//   MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING must NOT be 1
//   SEEDS (default 15215), DAYS in {30, 60}
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { competent } = require('./policies/competent');
const { deedSeeking } = require('./policies/deed-seeking');
const { nomadseek } = require('./policies/nomadseek');

const POLICY = process.env.POLICY;
if (!['nighttravel-stack', 'competent', 'deed-seeking', 'nomadseek'].includes(POLICY)) {
  console.error('FATAL: POLICY must be nighttravel-stack|competent|deed-seeking|nomadseek'); process.exit(2);
}
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (POLICY === 'nighttravel-stack') {
  if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1 for nighttravel-stack'); process.exit(2); }
  if (process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 1 for nighttravel-stack'); process.exit(2); }
} else {
  if (process.env.WOODCARRY === '1' || process.env.WOODWARM === '1') { console.error('FATAL: WOODCARRY/WOODWARM must NOT be 1 for ' + POLICY); process.exit(2); }
}
for (const k of ['MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in an absencehunt leg'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30 && DAYS !== 60) { console.error('FATAL: DAYS must be 30 or 60 for absencehunt legs'); process.exit(2); }

const CTX_KEYS = ['forageTrips', 'tripHomeDetours', 'recoverDays', 'patrols', 'nomadMoves', 'nomadRoadDays', 'nomadJoins'];

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  const v = (Game.state || {}).village || {};
  let roadActive = null, roadOnRoad = null;
  try { roadActive = !!((Game.state || {}).road && Game.state.road.active); } catch (e) {}
  try { roadOnRoad = (Game.nomad && typeof Game.nomad.onRoad === 'function') ? !!Game.nomad.onRoad() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
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

function ctxCounters(ctx) {
  const out = {};
  for (const k of CTX_KEYS) out[k] = ctx[k] || 0;
  out.lastGiveDay = (ctx._lastGiveDay === undefined ? null : ctx._lastGiveDay);
  return out;
}

function buildBase() {
  if (POLICY === 'nighttravel-stack') {
    const wcStore = newStore();
    const base = withWoodcarry(nighttravel, wcStore);
    const wwStore = newWwStore();
    const warmed = withWoodwarm(base, wwStore);
    return { base: warmed, wcStore, wwStore };
  }
  if (POLICY === 'competent') return { base: competent, wcStore: null, wwStore: null };
  if (POLICY === 'deed-seeking') return { base: deedSeeking, wcStore: null, wwStore: null };
  return { base: nomadseek, wcStore: null, wwStore: null };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'absencehunt-b', fullTelemetry: false });
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
  const { base, wcStore, wwStore } = buildBase();
  const baseDaily = base.daily.bind(base);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      const mPos = snapPos(Game2);
      const mPantry = pantryKcal(Game2);
      const before = ctxCounters(ctx);
      const sayBefore = sayLines.length;
      baseDaily(Game2, ctx);
      const sayAfter = sayLines.length;
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      const after = ctxCounters(ctx);
      const delta = {};
      for (const k of CTX_KEYS) delta[k] = after[k] - before[k];
      decisions.push({
        loopDay: callIdx,
        morning: mPos, pantry: mPantry,
        day: mPos.gameDay,
        lastGiveDayBefore: before.lastGiveDay,
        lastGiveDayAfter: after.lastGiveDay,
        ctxDelta: delta,
        saySeqAtMorning: sayBefore,
      });
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
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
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
    seed, policy: POLICY, woodwarm: process.env.WOODWARM || null, woodcarry: process.env.WOODCARRY || null,
    days: DAYS,
    spawn,
    woodcarryStore: wcStore ? { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused } : null,
    warmthStore: wwStore ? { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed } : null,
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
    console.error('absencehunt policy=' + POLICY + ' days=' + DAYS + ' seed=' + seed + ' end=' + inst.endReason + ' daysAlive=' + inst.daysAlive + ' decisions=' + inst.decisions.length + ' evenings=' + inst.evenings.length + ' errs=' + inst.errCount + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' absencehunt JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('ABSENCEHUNT TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapPos };
