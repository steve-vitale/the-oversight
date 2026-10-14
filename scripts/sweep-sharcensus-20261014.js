#!/usr/bin/env node
// scripts/sweep-sharcensus-20261014.js — meal-census diagnostic suite.
// 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, landed throttle
// (no lever — this run is the INSTRUMENT), 180d death-aware.
//
// Pre-registered diagnostic GO (MEASUREMENT.md §§9-12, 14 apply to instruments):
//   the census attributes >=80% of starved-villager-days (ate < 0.6*need,
//   !fasting) to a named engine path with measured counts. A miss is NO-GO
//   on the instrument, never re-scored; metric review in the evidence file.
//
// Usage:
//   SMOKE=1 node scripts/sweep-sharcensus-20261014.js
//   DAYS=180 OUT=/tmp/sharcensus.json PERSEED_DIR=/tmp/sharcensus-perseed \
//     CENSUS_DIR=/tmp/sharcensus-census node scripts/sweep-sharcensus-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installShareCensus, classify } = require('./sharcensus-20261014');

const POLICY_REGISTRY = {
  // UNWRAP (#69): named exports — NEVER Object.assign({}, require(...)).
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
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

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'sharcensus-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const cen = installShareCensus(Game);
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
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  // classify every census row
  const rows = cen.rows.map(r => {
    const c = classify(r);
    return { day: r.day, vid: r.vid, name: r.name, order: r.order, trust: r.trust,
      trustFactor: r.trustFactor, healthBefore: r.healthBefore, healthAfter: r.healthAfter,
      hungerBefore: r.hungerBefore, hungerAfter: r.hungerAfter, away: r.away,
      rhythm: r.rhythm, kcalPerDay: r.kcalPerDay, need: Math.round(r.need),
      ate: Math.round(r.ate), drew: Math.round(r.drew), gave: Math.round(r.gave),
      ownEat: Math.round(r.ownEat || 0), fasting: r.fasting,
      pantryDrawCalled: r.pantryDrawCalled, spoiledCalled: r.spoiledCalled,
      spoiledTook: Math.round(r.spoiledTook || 0), packMealCalled: r.packMealCalled,
      pantryFreshBefore: Math.round(r.pantryFreshBefore), pantryFreshAfter: Math.round(r.pantryFreshAfter),
      path: r.path, starved: c.starved, starvePath: c.starvePath };
  });
  cen.uninstall();
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, hungryDays: hungry,
    skips: cen.skips.map(s => ({ day: s.day, vid: s.vid, name: s.name, path: s.path, trust: s.trust })),
    rows,
  };
}

function aggregate(runs) {
  const pathCounts = {}, starvePathCounts = {};
  let mealDays = 0, starvedDays = 0, starvedNamed = 0;
  let starvedTrustSum = 0, starvedFullPantry = 0; // #115 signature
  let fedTrustSum = 0, fedDays = 0;
  let gaveSum = 0, tookSum = 0;
  for (const r of runs) {
    for (const row of r.rows) {
      mealDays++;
      pathCounts[row.path] = (pathCounts[row.path] || 0) + 1;
      tookSum += row.drew; gaveSum += row.gave;
      if (row.starved) {
        starvedDays++;
        starvePathCounts[row.starvePath] = (starvePathCounts[row.starvePath] || 0) + 1;
        if (row.starvePath && row.starvePath !== 'other-short' && row.starvePath !== 'unknown-need') starvedNamed++;
        starvedTrustSum += (row.trust == null ? 10 : row.trust);
        if (row.pantryFreshBefore > 8000) starvedFullPantry++; // >4 fresh days
      } else if (!row.fasting) {
        fedDays++; fedTrustSum += (row.trust == null ? 10 : row.trust);
      }
    }
  }
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const deathCauses = {};
  for (const r of runs) for (const [k, n] of Object.entries(r.deaths || {})) deathCauses[k] = (deathCauses[k] || 0) + n;
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
    };
  }
  return {
    n: runs.length,
    mealDays, pathCounts,
    starvedDays, starvePathCounts,
    attributionCoverage: starvedDays ? +(starvedNamed / starvedDays).toFixed(3) : 1,
    starvedMeanTrust: starvedDays ? +(starvedTrustSum / starvedDays).toFixed(1) : null,
    fedMeanTrust: fedDays ? +(fedTrustSum / fedDays).toFixed(1) : null,
    starvedFullPantryShare: starvedDays ? +(starvedFullPantry / starvedDays).toFixed(3) : 0,
    tookKcal: Math.round(tookSum), gaveKcal: Math.round(gaveSum),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    deathCauses, byPolicy,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`,
      base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0, censusRows = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'sharcensus-smoke-' + pid, fullTelemetry: false });
    await setupGame(Game);
    const cen = installShareCensus(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    censusRows = cen.rows.length; cen.uninstall();
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check(`[${pid}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    check(`[${pid}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${pid}] >=1 policy-origin act (policyActs=${policyActs})`, policyActs > 0);
    check(`[${pid}] census recorded meal rows (rows=${censusRows})`, censusRows > 50,
      'the instrument must see the meal pipeline on a live run');
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, census observes — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'sharcensus';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const censusDir = process.env.CENSUS_DIR || null;
  if (censusDir) fs.mkdirSync(censusDir, { recursive: true });
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const t0 = Date.now();
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    const agg1 = aggregate([r]);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} ` +
      `meals=${agg1.mealDays} starved=${agg1.starvedDays} cov=${agg1.attributionCoverage} ` +
      `hungry=${r.hungryDays} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    if (censusDir) {
      fs.writeFileSync(`${censusDir}/${label}-${pid}-s${seed}-census.json`,
        JSON.stringify({ policy: pid, seed, days: r.days, endReason: r.endReason, rows: r.rows, skips: r.skips }));
    }
  }
  const agg = aggregate(rows);
  // slim rows for the aggregate JSON (full rows live in CENSUS_DIR)
  for (const r of rows) r.rows = r.rows.length;
  console.log(`\n=== ${label} === n=${agg.n}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} maxWave=${b.maxWave} hungry=${b.hungryDays}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, pids, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  const perSeedDir2 = perSeedDir;
  if (perSeedDir2) {
    fs.mkdirSync(perSeedDir2, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir2}/${label}-${r.policy}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        hungryDays: r.hungryDays,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir2);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { oneRun, aggregate };
