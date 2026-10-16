#!/usr/bin/env node
// scripts/sweep-aidfeastint-20261016.js — SIM-AIDFEASTINT-B factorial sweep
// (loop B, 2026-10-16, food-economy axis — aid×feast interaction diagnostic).
//
// Design: 2x2 factorial (cells {neither, aid-only, feast-only, both}) x
// 2 roads {leadfeast, belongfeast} x 8 FRESH seeds [3201-3208] = 64 runs,
// 180d death-aware, pre-seat courtship (SEATDRIVE=0 explicit),
// FEASTSCALE_R13=1. Own in-sweep comparisons: identical seeds across all
// 8 cells. Env gates flip per cell in-process (drivers read them at call
// time).
//
// PRE-REGISTRATION (binding, §14 — written BEFORE sims; full header in
// evidence/2026-10-16/sim-aidfeastint-b.md):
//   PRIMARY = interaction term on aggregate absolute fresh-rot kcal on the
//     LEAD road (the road the whole aidspoil lineage ran on):
//     I = (both/neither) / ((aid/neither) x (feast/neither)).
//     GO = I <= 0.7 (interaction exists and is rot-reducing).
//     KILL otherwise → verdict: driver-level trajectory effect, the verb
//     space is closed.
//   VALIDITY (engagement floor — the drawvol-confirm lesson: rare-event
//     levers need a channel-availability floor, not an absolute count):
//     the both-cell must engage comparably to the aidspoil driver's own
//     engagement (47 aids + 22 feasts on 8 leadfeast seeds): floor =
//     both-cell aggregate >= 24 aid verbs AND >= 8 driver feasts across the
//     16 both-cell runs, AND the overstock trigger (fresh-days > 4)
//     available on >= 32 run-days. If the floor is missed, the verdict is
//     "inconclusive — channel starved", NOT the trajectory verdict.
//   GUARDRAILS (per road vs own neither): national >= neither-2;
//     starvation deaths <= neither+2; hungryDays <= neither x 1.409;
//     no new death mode (n>=3); social-verb sanity: both-cell aid verbs >=
//     0.5 x aid-cell, both-cell driver feasts >= 0.5 x feast-cell;
//     median survival report-only.
//   SECONDARY: belong-road interaction (replication), wall numbers
//     (national/table/wins/exiled, Arc, waves 1-5, survival, death-cause
//     shares), per-seed rot ratios, trigger-availability vs engagement,
//     fresh-days distribution, pantry peaks, cliffs.
//
// Usage:
//   SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-aidfeastint-20261016.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 LEVER=aidfeastint-full SEEDS=3201,3202,3203,3204,3205,3206,3207,3208 \
//     DAYS=180 OUT=evidence/2026-10-16/aidfeastint-sweep.json \
//     PERSEED_DIR=evidence/2026-10-16/perseed-aidfeastint \
//     node scripts/sweep-aidfeastint-20261016.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let AD = null, FD = null;
try {
  AD = require('./policies/aiddrain');
  FD = require('./policies/feastdrawdown');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aid/feast drivers absent (diagnostic layers deleted post-measurement); status in evidence/2026-10-16/sim-aidfeastint-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast } = require('./policies/feastscale');

const AID_BOTH = AD.withAidDrain(FD.feastDrawdown, 'aidFeastBoth');
const AID_BOTH_BELONG = AD.withAidDrain(FD.feastBelongDrawdown, 'aidFeastBothBelong');

const CELLS = [
  { key: 'lead_neither', road: 'lead', cell: 'neither', policy: leadfeast, gates: {} },
  { key: 'lead_aid', road: 'lead', cell: 'aid', policy: AD.aidDrain, gates: { AIDDRAIN: '1' } },
  { key: 'lead_feast', road: 'lead', cell: 'feast', policy: FD.feastDrawdown, gates: { FEASTDRAWDOWN: '1' } },
  { key: 'lead_both', road: 'lead', cell: 'both', policy: AID_BOTH, gates: { AIDDRAIN: '1', FEASTDRAWDOWN: '1' } },
  { key: 'belong_neither', road: 'belong', cell: 'neither', policy: belongfeast, gates: {} },
  { key: 'belong_aid', road: 'belong', cell: 'aid', policy: AD.aidBelong, gates: { AIDDRAIN: '1' } },
  { key: 'belong_feast', road: 'belong', cell: 'feast', policy: FD.feastBelongDrawdown, gates: { FEASTDRAWDOWN: '1' } },
  { key: 'belong_both', road: 'belong', cell: 'both', policy: AID_BOTH_BELONG, gates: { AIDDRAIN: '1', FEASTDRAWDOWN: '1' } },
];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function setGates(gates) {
  delete process.env.AIDDRAIN; delete process.env.FEASTDRAWDOWN;
  for (const k of Object.keys(gates || {})) process.env[k] = gates[k];
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', breadth: 0, stage: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

// install per-run instruments (rot classification + sink attribution)
function instrument(Game) {
  const W = { inBy: {}, outBy: {}, rotFresh: 0, rotPreserved: 0, rotByDay: {},
    tributePaidKcal: 0, starveDeaths: 0 };
  let sinkOverride = null;
  const withSink = (sink, fnName) => {
    const o = Game[fnName];
    if (typeof o === 'function') Game[fnName] = function () {
      const prev = sinkOverride; sinkOverride = sink;
      try { return o.apply(this, arguments); } finally { sinkOverride = prev; }
    };
  };
  withSink('tribute', 'payTribute');
  withSink('aid-tend', 'tendLink');
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') Game._removePantryKcal = function () {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
  };
  const oDraw = Game.pantryDraw;
  if (typeof oDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    const r = oDraw.apply(this, arguments);
    try {
      if (sinkOverride === 'feast' && (r.taken || 0) > 0)
        W.outBy.feast = (W.outBy.feast || 0) + Math.round(r.taken);
    } catch (e) {}
    return r;
  };
  const oFeast = Game.hostFeast;
  if (typeof oFeast === 'function') Game.hostFeast = function () {
    const prev = sinkOverride; sinkOverride = 'feast';
    try { return oFeast.apply(this, arguments); } finally { sinkOverride = prev; }
  };
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      const d = gday(Game);
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') W.rotPreserved += k;
          else { W.rotFresh += k; W.rotByDay[d] = (W.rotByDay[d] || 0) + k; }
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  return W;
}

async function oneRun(cellDef, seed, days) {
  setGates(cellDef.gates);
  const base = cellDef.policy;
  const { Game } = await loadGame({ seed, mode: 'aidfeastint-' + cellDef.key, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const freshDaysSamples = [];
  let pantryPeak = 0, villagerDays = 0, triggerDays = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      villagerDays += (((G.state.village || {}).roster || []).length) || 0;
      const d = gday(G);
      try { if (G.pantryFreshDays() > 4) triggerDays++; } catch (e) {}
      if (d % 10 === 0) {
        try { freshDaysSamples.push(+G.pantryFreshDays().toFixed(1)); } catch (e) {}
        try {
          const pk = ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
          if (pk > pantryPeak) pantryPeak = pk;
        } catch (e) {}
      }
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
      if (/starv/i.test(k)) W.starveDeaths++;
    }
  } catch (e) {}
  let hungry = 0, redirects = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { redirects = (Game.state.village || {}).throttleRedirects || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  let adAid = 0, adAidKcal = 0, adGateHeld = 0, fdFeasts = 0, fdFeastKcal = 0, fdGateHeld = 0, gorgeNights = 0;
  try {
    if (runCtx) {
      adAid = runCtx.adAid || 0; adAidKcal = runCtx.adAidKcal || 0; adGateHeld = runCtx.adGateHeld || 0;
      fdFeasts = runCtx.fdFeasts || 0; fdFeastKcal = runCtx.fdFeastKcal || 0; fdGateHeld = runCtx.fdGateHeld || 0;
    }
    gorgeNights = ((Game.__adGorgeDays || []).length) + ((Game.__fdGorgeDays || []).length);
  } catch (e) {}
  const cliffDays = Object.keys(W.rotByDay).filter(d => W.rotByDay[d] > 10000).length;
  const cliffKcal = Object.values(W.rotByDay).filter(k => k > 10000).reduce((t, k) => t + k, 0);
  return {
    key: cellDef.key, road: cellDef.road, cell: cellDef.cell, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths: W.starveDeaths,
    inBy: W.inBy, outBy: W.outBy,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    rotByDay: W.rotByDay,
    villagerDays, triggerDays,
    cliffDays, cliffKcal: Math.round(cliffKcal),
    tributePaidKcal: Math.round(W.tributePaidKcal),
    hungryDays: hungry, throttleRedirects: redirects,
    adAid, adAidKcal: Math.round(adAidKcal), adGateHeld,
    fdFeasts, fdFeastKcal: Math.round(fdFeastKcal), fdGateHeld, gorgeNights,
    freshDaysSamples, pantryPeak: Math.round(pantryPeak),
  };
}

// SMOKE: every cell's policy genuinely drives (15d on seed 3201).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const cellDef of CELLS) {
    setGates(cellDef.gates);
    const base = cellDef.policy;
    check(`[${cellDef.key}] id`, /^(leadfeast|belongfeast|aidDrain|aidBelong|feastDrawdown|feastBelongDrawdown|aidFeastBoth|aidFeastBothBelong)$/.test(base.id || ''), 'id=' + base.id);
    check(`[${cellDef.key}] daily is a function`, typeof base.daily === 'function');
    let dailyCalls = 0, upkeepCalls = 0;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); },
      upkeep(G, ctx) { upkeepCalls++; return base.upkeep ? base.upkeep(G, ctx) : undefined; },
    });
    const { Game } = await loadGame({ seed: 3201, mode: 'aidfeastint-smoke-' + cellDef.key, fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${cellDef.key}] harness invoked daily (calls=${dailyCalls})`, dailyCalls > 0, `days=${result.days}`);
    check(`[${cellDef.key}] harness invoked upkeep (calls=${upkeepCalls})`, upkeepCalls > 0);
    check(`[${cellDef.key}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
  }
  setGates(null);
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: all 8 cells drive — safe to measure.');
}

async function main() {
  if (process.env.FEASTSCALE_R13 !== '1') { console.log('FEASTSCALE_R13=1 required'); process.exit(1); }
  process.env.SEATDRIVE = '0';
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'aidfeastint-full';
  const seeds = (process.env.SEEDS || '3201,3202,3203,3204,3205,3206,3207,3208').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const rows = [];
  for (const cellDef of CELLS) {
    for (const seed of seeds) {
      const r = await oneRun(cellDef, seed, days);
      rows.push(r);
      console.log(`  [${r.key} s${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k trig=${r.triggerDays} aid=${r.adAid}a/${(r.adAidKcal / 1000).toFixed(0)}k feast=${r.fdFeasts}f/${(r.fdFeastKcal / 1000).toFixed(0)}k gate=${r.adGateHeld + r.fdGateHeld}`);
    }
  }
  setGates(null);
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  for (const key of Object.keys(agg.byCell)) {
    const b = agg.byCell[key];
    console.log(`  ${key}: rot=${(b.rotFresh / 1000).toFixed(0)}k r/vd=${b.rotPerVillagerDay.toFixed(0)} nat=${b.national} tab=${b.table} win=${b.won} w5=${b.wave5} medD=${b.medianDays} trig=${b.triggerDays} aid=${b.adAid}a feast=${b.fdFeasts}f`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, days, armed: true, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/aidfeastint-${r.key}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, key: r.key, road: r.road, cell: r.cell, seed: r.seed,
        days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved, rotByDay: r.rotByDay,
        villagerDays: r.villagerDays, triggerDays: r.triggerDays,
        cliffDays: r.cliffDays, cliffKcal: r.cliffKcal,
        hungryDays: r.hungryDays, starveDeaths: r.starveDeaths, deaths: r.deaths,
        tributePaidKcal: r.tributePaidKcal, throttleRedirects: r.throttleRedirects,
        adAid: r.adAid, adAidKcal: r.adAidKcal, adGateHeld: r.adGateHeld,
        fdFeasts: r.fdFeasts, fdFeastKcal: r.fdFeastKcal, fdGateHeld: r.fdGateHeld,
        gorgeNights: r.gorgeNights,
        freshDaysSamples: r.freshDaysSamples, pantryPeak: r.pantryPeak,
        inBy: r.inBy, outBy: r.outBy,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

function aggregate(rows) {
  const byCell = {};
  for (const key of [...new Set(rows.map(r => r.key))]) {
    const rs = rows.filter(r => r.key === key);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    const rotFresh = rs.reduce((t, r) => t + r.rotFresh, 0);
    const vdays = rs.reduce((t, r) => t + r.villagerDays, 0);
    byCell[key] = {
      n: rs.length,
      rotFresh,
      rotPerVillagerDay: rotFresh / Math.max(1, vdays),
      rotPerDayAlive: Math.round(rotFresh / Math.max(1, rs.reduce((t, r) => t + r.days, 0))),
      won: rs.reduce((t, r) => t + r.won, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      triggerDays: rs.reduce((t, r) => t + r.triggerDays, 0),
      adAid: rs.reduce((t, r) => t + r.adAid, 0),
      adAidKcal: rs.reduce((t, r) => t + r.adAidKcal, 0),
      adGateHeld: rs.reduce((t, r) => t + r.adGateHeld, 0),
      fdFeasts: rs.reduce((t, r) => t + r.fdFeasts, 0),
      fdFeastKcal: rs.reduce((t, r) => t + r.fdFeastKcal, 0),
      fdGateHeld: rs.reduce((t, r) => t + r.fdGateHeld, 0),
      gorgeNights: rs.reduce((t, r) => t + r.gorgeNights, 0),
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
      deaths: rs.reduce((m, r) => { for (const k of Object.keys(r.deaths || {})) m[k] = (m[k] || 0) + r.deaths[k]; return m; }, {}),
    };
  }
  return { n: rows.length, byCell };
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
