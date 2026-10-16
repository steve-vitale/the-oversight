#!/usr/bin/env node
// scripts/sweep-trajclose-20261016.js — SIM-TRAJCLOSE-B lineage-closure sweep
// (loop B, 2026-10-16, food-economy axis — aidspoil rot-driver diagnostic).
//
// Design: 8 seeds [11,22,33,44,55,66,77,88 — the ORIGINAL aidspoil seeds]
// x {leadfeast} x {pristine, driver} = 16 runs, 180d death-aware, pre-seat
// courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1. Own in-sweep control,
// identical seeds. Env gate flips in-process (the driver reads TRAJCLOSE at
// call time).
//
// PRE-REGISTRATION (binding, §14 — written BEFORE sims; full header in
// evidence/2026-10-16/sim-trajclose-b.md):
//   PRIMARY = driver-vs-pristine aggregate absolute fresh-rot kcal ratio.
//     GO if <= 0.7x (the 4x reproduces same-sweep) → trajectory metrics
//     become the mechanism hunt + a second measurement round.
//     KILL if ~1.0x (null) → lineage CLOSED: the 4x was cross-sweep drift.
//   TRAJECTORY METRICS (measured regardless): pantry-peak distributions
//     (daily pantry-kcal histogram armed vs control), day-type composition
//     (overstock-trigger days, aid days, feast days, siege-hold days),
//     event timing (day-of first aid/feast, rot accumulation curves).
//   GUARDRAILS: national >= control-2; starvation deaths <= control+2;
//     no new death mode (n>=3); median report-only.
//
// Usage:
//   SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-trajclose-20261016.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 LEVER=trajclose-full SEEDS=11,22,33,44,55,66,77,88 \
//     DAYS=180 OUT=evidence/2026-10-16/trajclose-sweep.json \
//     PERSEED_DIR=evidence/2026-10-16/perseed-trajclose \
//     node scripts/sweep-trajclose-20261016.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let TC = null;
try {
  TC = require('./policies/trajclose');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trajclose driver absent (diagnostic layer deleted post-measurement); status in evidence/2026-10-16/sim-trajclose-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');

const CELLS = [
  { key: 'pristine', cell: 'pristine', policy: leadfeast, gates: {} },
  { key: 'driver', cell: 'driver', policy: TC.trajLead, gates: { TRAJCLOSE: '1' } },
];
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const HIST_BINS = [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000]; // 9 bins

function setGates(gates) {
  delete process.env.TRAJCLOSE;
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

// install per-run instruments (rot classification)
function instrument(Game) {
  const W = { rotFresh: 0, rotPreserved: 0, rotByDay: {}, starveDeaths: 0 };
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
  const { Game } = await loadGame({ seed, mode: 'trajclose-' + cellDef.key, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const freshDaysSamples = [];
  const pantryHist = new Array(HIST_BINS.length + 1).fill(0);
  let pantryPeak = 0, villagerDays = 0, triggerDays = 0, feastDays = 0, prevFeastDay = -1;
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
      try {
        const fd0 = (G.state.scholar || {}).feastDay;
        if (fd0 !== undefined && fd0 !== prevFeastDay) { if (prevFeastDay >= 0 || fd0 > 0) feastDays++; prevFeastDay = fd0; }
      } catch (e) {}
      const pk = ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      if (pk > pantryPeak) pantryPeak = pk;
      let b = HIST_BINS.length;
      for (let i = 0; i < HIST_BINS.length; i++) { if (pk < HIST_BINS[i]) { b = i; break; } }
      pantryHist[b]++;
      if (d % 10 === 0) { try { freshDaysSamples.push(+G.pantryFreshDays().toFixed(1)); } catch (e) {} }
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
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  let tcAid = 0, tcAidKcal = 0, tcFeasts = 0, tcFeastKcal = 0, tcGateHeld = 0,
      tcFirstAidDay = -1, tcFirstFeastDay = -1, tcHoldDays = 0, tcFeastEvents = [];
  try {
    if (runCtx) {
      tcAid = runCtx.tcAid || 0; tcAidKcal = runCtx.tcAidKcal || 0;
      tcFeasts = runCtx.tcFeasts || 0; tcFeastKcal = runCtx.tcFeastKcal || 0;
      tcGateHeld = runCtx.tcGateHeld || 0;
      tcFirstAidDay = runCtx._tcFirstAidDay !== undefined ? runCtx._tcFirstAidDay : -1;
      tcFirstFeastDay = runCtx._tcFirstFeastDay !== undefined ? runCtx._tcFirstFeastDay : -1;
      tcHoldDays = (runCtx._tcHoldDays || []).length;
      tcFeastEvents = runCtx._tcFeastEvents || [];
    }
  } catch (e) {}
  const cliffDays = Object.keys(W.rotByDay).filter(d => W.rotByDay[d] > 10000).length;
  const cliffKcal = Object.values(W.rotByDay).filter(k => k > 10000).reduce((t, k) => t + k, 0);
  return {
    key: cellDef.key, cell: cellDef.cell, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths: W.starveDeaths,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    rotByDay: W.rotByDay,
    villagerDays, triggerDays, feastDays,
    pantryHist, pantryPeak: Math.round(pantryPeak),
    cliffDays, cliffKcal: Math.round(cliffKcal),
    hungryDays: hungry,
    tcAid, tcAidKcal: Math.round(tcAidKcal),
    tcFeasts, tcFeastKcal: Math.round(tcFeastKcal),
    tcGateHeld, tcHoldDays, tcFirstAidDay, tcFirstFeastDay,
    tcFeastEvents,
    freshDaysSamples,
  };
}

// SMOKE: both cells genuinely drive (15d on seed 11).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const cellDef of CELLS) {
    setGates(cellDef.gates);
    const base = cellDef.policy;
    check(`[${cellDef.key}] id`, /^(leadfeast|trajLead)$/.test(base.id || ''), 'id=' + base.id);
    check(`[${cellDef.key}] daily is a function`, typeof base.daily === 'function');
    let dailyCalls = 0, upkeepCalls = 0;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); },
      upkeep(G, ctx) { upkeepCalls++; return base.upkeep ? base.upkeep(G, ctx) : undefined; },
    });
    const { Game } = await loadGame({ seed: 11, mode: 'trajclose-smoke-' + cellDef.key, fullTelemetry: false });
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
  console.log('\nSMOKE GATE: both cells drive — safe to measure.');
}

async function main() {
  if (process.env.FEASTSCALE_R13 !== '1') { console.log('FEASTSCALE_R13=1 required'); process.exit(1); }
  process.env.SEATDRIVE = '0';
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'trajclose-full';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const rows = [];
  for (const cellDef of CELLS) {
    for (const seed of seeds) {
      const r = await oneRun(cellDef, seed, days);
      rows.push(r);
      console.log(`  [${r.key} s${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k trig=${r.triggerDays} aid=${r.tcAid}a/${(r.tcAidKcal / 1000).toFixed(0)}k feast=${r.tcFeasts}f/${(r.tcFeastKcal / 1000).toFixed(0)}k gate=${r.tcGateHeld}`);
    }
  }
  setGates(null);
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  for (const key of Object.keys(agg.byCell)) {
    const b = agg.byCell[key];
    console.log(`  ${key}: rot=${(b.rotFresh / 1000).toFixed(0)}k r/vd=${b.rotPerVillagerDay.toFixed(0)} nat=${b.national} tab=${b.table} win=${b.won} w5=${b.wave5} medD=${b.medianDays} trig=${b.triggerDays} aid=${b.tcAid}a feast=${b.tcFeasts}f feastDays=${b.feastDays}`);
  }
  const ratio = agg.byCell.driver.rotFresh / Math.max(1, agg.byCell.pristine.rotFresh);
  console.log(`\nPRIMARY driver/pristine fresh-rot ratio: ${ratio.toFixed(3)} (GO <= 0.7, KILL ~1.0)`);
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, days, armed: true, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/trajclose-${r.key}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, key: r.key, cell: r.cell, seed: r.seed,
        days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved, rotByDay: r.rotByDay,
        villagerDays: r.villagerDays, triggerDays: r.triggerDays, feastDays: r.feastDays,
        pantryHist: r.pantryHist, pantryPeak: r.pantryPeak,
        cliffDays: r.cliffDays, cliffKcal: r.cliffKcal,
        hungryDays: r.hungryDays, starveDeaths: r.starveDeaths, deaths: r.deaths,
        tcAid: r.tcAid, tcAidKcal: r.tcAidKcal,
        tcFeasts: r.tcFeasts, tcFeastKcal: r.tcFeastKcal,
        tcGateHeld: r.tcGateHeld, tcHoldDays: r.tcHoldDays,
        tcFirstAidDay: r.tcFirstAidDay, tcFirstFeastDay: r.tcFirstFeastDay,
        tcFeastEvents: r.tcFeastEvents,
        freshDaysSamples: r.freshDaysSamples,
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
    const ph = new Array(HIST_BINS.length + 1).fill(0);
    for (const r of rs) (r.pantryHist || []).forEach((c, i) => { ph[i] += c; });
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
      feastDays: rs.reduce((t, r) => t + r.feastDays, 0),
      pantryHist: ph,
      tcAid: rs.reduce((t, r) => t + r.tcAid, 0),
      tcAidKcal: rs.reduce((t, r) => t + r.tcAidKcal, 0),
      tcFeasts: rs.reduce((t, r) => t + r.tcFeasts, 0),
      tcFeastKcal: rs.reduce((t, r) => t + r.tcFeastKcal, 0),
      tcGateHeld: rs.reduce((t, r) => t + r.tcGateHeld, 0),
      tcHoldDays: rs.reduce((t, r) => t + r.tcHoldDays, 0),
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
      deaths: rs.reduce((m, r) => { for (const k of Object.keys(r.deaths || {})) m[k] = (m[k] || 0) + r.deaths[k]; return m; }, {}),
    };
  }
  return { n: rows.length, byCell };
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
