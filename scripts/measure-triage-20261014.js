#!/usr/bin/env node
// scripts/measure-triage-20261014.js — PANTRY TRIAGE pilot measurement
// (fleshout-b, 2026-10-14, sim-findings #30).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9–12, 14):
//   PRIMARY metric = fresh-rot share = rot:fresh/(rot:fresh+rot:preserved) in
//     pp, summed over the 16-run suite (the r18b convention).
//   GO   = armed share >= 10pp below baseline on identical seeds.
//   KILL = share moves <5pp.
//   MECHANISM metric (pre-registered secondary): absolute fresh-rot kcal;
//     GO note = -15% vs baseline (isolates the lever's real contribution).
//   Guardrails (pre-register): median survival no worse than -10d;
//     laundering telemetry stays at 0 (spoilsmoke #82 warning — count
//     legit-preserved vs laundered kcal separately, never tune phantom food).
//   Horizon: 180d death-aware (WIN-PATH HORIZON 180). Seeds:
//     11/22/33/44/55/66/77/88 x leadcourt/belongseek, IDENTICAL seeds
//     before/after (before = pristine game.js, after = triage applied).
//
// Usage:
//   LEVER=triage-baseline SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" \
//     DAYS=180 OUT=/tmp/triage-before.json node scripts/measure-triage-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
// NOTE (2026-10-14): the registry MUST unwrap the policy object (`.leadcourt`).
// `require('./policies/leadcourt')` yields `{ leadcourt }` — without the
// unwrap, `policy.daily` is undefined and the suite silently runs policy-less
// (no staffing, no gardens, no cook duty). Caught mid-run when the cook-drive
// instrumentation read zero across 16 runs.
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

function instrument(Game) {
  const W = { rotFresh: 0, rotPreserved: 0, triageKcal: 0, triageRuns: 0,
    triageStoodDown: 0, launderedKcal: 0, dutyKcal: 0 };
  // triage throughput + laundering check (spoilsmoke #82): any stack that was
  // spoiled (raw boundary) at triage time and ends up preserved = laundered.
  const oTri = Game.eveningTriage;
  if (typeof oTri === 'function') Game.eveningTriage = function (v) {
    let spoiledBefore = null;
    try {
      spoiledBefore = new Set();
      for (const it of (((this.state.village || {}).pantry) || [])) {
        if (it && this.isSpoiled && this.isSpoiled(it, 0)) spoiledBefore.add(it);
      }
    } catch (e) {}
    const r = oTri.apply(this, arguments);
    try {
      W.triageKcal += (r && r.kcal) || 0;
      if (r && r.n > 0) W.triageRuns++;
      if (r && r.stoodDown) W.triageStoodDown++;
      for (const it of (((this.state.village || {}).pantry) || [])) {
        if (it && spoiledBefore && spoiledBefore.has(it) &&
            (it.foodState === 'preserved' || it.foodState === 'rendered')) {
          W.launderedKcal += (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return r;
  };
  // duty-drive throughput (for the interplay read: does the triage starve the drive?)
  const oResolve = Game.resolveOneAssignment;
  if (typeof oResolve === 'function') Game.resolveOneAssignment = function (vid, a) {
    let before = 0;
    try {
      if (a && a.task === 'cook') {
        for (const it of (((this.state.village || {}).pantry) || [])) {
          if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
            before += (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    const r = oResolve.apply(this, arguments);
    try {
      if (a && a.task === 'cook') {
        let after = 0;
        for (const it of (((this.state.village || {}).pantry) || [])) {
          if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
            after += (it.kcalEach || 0) * (it.units || 1);
        }
        W.dutyKcal += Math.max(0, after - before);
      }
    } catch (e) {}
    return r;
  };
  // rot: classify at sweep time by foodState (matches diag-kcal-r8-20261012)
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') W.rotPreserved += k;
          else W.rotFresh += k;
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  return W;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'triage-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (Game.state.village || {}).exiledCount || 0; } catch (e) {}
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    triageKcal: Math.round(W.triageKcal), triageRuns: W.triageRuns,
    triageStoodDown: W.triageStoodDown, launderedKcal: Math.round(W.launderedKcal),
    dutyKcal: Math.round(W.dutyKcal),
    hungryDays: hungry, exiled,
  };
}

function aggregate(runs) {
  const rotFresh = runs.reduce((t, r) => t + r.rotFresh, 0);
  const rotPres = runs.reduce((t, r) => t + r.rotPreserved, 0);
  const rotShare = 100 * rotFresh / Math.max(1, rotFresh + rotPres);
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const wins = runs.reduce((t, r) => t + r.won, 0);
  const national = runs.reduce((t, r) => t + r.national, 0);
  const table = runs.reduce((t, r) => t + r.table, 0);
  const maxWave = Math.max.apply(null, runs.map(r => r.waveReach).concat([1]));
  const byPolicy = {};
  for (const pid of [...new Set(runs.map(r => r.policy))]) {
    const rs = runs.filter(r => r.policy === pid);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      exiled: rs.reduce((t, r) => t + (r.exiled || 0), 0),
    };
  }
  return {
    n: runs.length, rotFresh, rotPreserved: rotPres, rotSharePp: +rotShare.toFixed(1),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDaysAll: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    wins, national, table, maxWave,
    triageKcal: runs.reduce((t, r) => t + r.triageKcal, 0),
    triageRuns: runs.reduce((t, r) => t + r.triageRuns, 0),
    triageStoodDown: runs.reduce((t, r) => t + r.triageStoodDown, 0),
    launderedKcal: runs.reduce((t, r) => t + r.launderedKcal, 0),
    dutyKcal: runs.reduce((t, r) => t + r.dutyKcal, 0),
    hungryDays: runs.reduce((t, r) => t + r.hungryDays, 0),
    exiled: runs.reduce((t, r) => t + (r.exiled || 0), 0),
    byPolicy,
  };
}

async function main() {
  const label = process.env.LEVER || 'triage';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k/${(r.rotPreserved / 1000).toFixed(0)}k triage=${(r.triageKcal / 1000).toFixed(0)}k duty=${(r.dutyKcal / 1000).toFixed(0)}k hungry=${r.hungryDays} laund=${r.launderedKcal}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotPreserved=${(agg.rotPreserved / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll} maxDays=${agg.maxDaysAll}`);
  console.log(`triage=${(agg.triageKcal / 1000).toFixed(1)}k over ${agg.triageRuns} runs (stoodDown ${agg.triageStoodDown}) duty=${(agg.dutyKcal / 1000).toFixed(1)}k laundered=${agg.launderedKcal}`);
  console.log(`wins=${agg.wins} national=${agg.national} table=${agg.table} maxWave=${agg.maxWave} hungryDays=${agg.hungryDays} exiled=${agg.exiled}`);
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ agg, rows }, null, 1));
}

main().catch(e => { console.error('SWEEP FAIL:', e && e.message); process.exit(1); });
