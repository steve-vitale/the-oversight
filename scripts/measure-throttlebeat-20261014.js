#!/usr/bin/env node
// scripts/measure-throttlebeat-20261014.js — THROTTLEBEAT det-gate + counter measurement
// (fleshout-b, 2026-10-14, sim-throttlebeat).
//
// THE ARM: re-land the hunger-depth exemption's safety evidence (the
// v.throttleExemptDepth counter + the "hungry eat first" narration beat)
// ON TOP of the shipped always-on code (1a44a2c8): narration + counter
// ONLY, no behavior change. The exemption is env-independent now.
//
// Pre-registered (evidence/2026-10-14/sim-throttlebeat-b.md header):
//   GO (conjunctive):
//     1. Counter: increments on exemption nights (measured across the
//        16-run sweep; zero on non-exemption nights).
//     2. Narration: the beat fires on exemption nights, reads as a village
//        feeding moment (sense-tested, 2-3 transcripts read for meaning).
//     3. Det-gate: 16/16 identical-seed gameplay trajectories byte-identical
//        before/after.
//   Horizon: 180d death-aware; seeds 11/22/33/44/55/66/77/88 x
//     leadcourt/belongseek, IDENTICAL seeds before/after.
//   A miss is NO-GO per S14 — behavior drift is never re-scored.
//
// Usage:
//   SIDE=before OUT=evidence/2026-10-14/throttlebeat-before.json node scripts/measure-throttlebeat-20261014.js
//   SIDE=after  OUT=evidence/2026-10-14/throttlebeat-after.json  node scripts/measure-throttlebeat-20261014.js
//   SIDE=aa     OUT=evidence/2026-10-14/throttlebeat-aa.json     node scripts/measure-throttlebeat-20261014.js
//   SMOKE=1 node scripts/measure-throttlebeat-20261014.js   # instrument gate
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  // named-export unwrap only (#69).
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

function instrument(Game) {
  const W = { rotFresh: 0, rotPreserved: 0 };
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
  const { Game } = await loadGame({ seed, mode: 'throttlebeat-' + pid, fullTelemetry: false });
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
  let villagerDays = 0;
  try {
    for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0);
  } catch (e) {}
  let hungry = 0, redirects = 0, exempt = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { redirects = (Game.state.village || {}).throttleRedirects || 0; } catch (e) {}
  try { exempt = (Game.state.village || {}).throttleExemptDepth || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const starveDeaths = deaths.starvation || 0;
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths, villagerDays,
    starvePer100vd: villagerDays > 0 ? +(100 * starveDeaths / villagerDays).toFixed(3) : 0,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    hungryDays: hungry, throttleRedirects: redirects, throttleExemptDepth: exempt,
  };
}

function aggregate(runs) {
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const starve = runs.reduce((t, r) => t + r.starveDeaths, 0);
  const vd = runs.reduce((t, r) => t + r.villagerDays, 0);
  return {
    n: runs.length,
    rotFresh: runs.reduce((t, r) => t + r.rotFresh, 0),
    rotPreserved: runs.reduce((t, r) => t + r.rotPreserved, 0),
    starveDeaths: starve,
    villagerDays: vd,
    starvePer100vd: vd > 0 ? +(100 * starve / vd).toFixed(3) : 0,
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.wins, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    wave4: runs.filter(r => r.waveReach >= 4).length,
    wave5: runs.filter(r => r.waveReach >= 5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
    hungryDays: runs.reduce((t, r) => t + r.hungryDays, 0),
    throttleRedirects: runs.reduce((t, r) => t + r.throttleRedirects, 0),
    throttleExemptDepth: runs.reduce((t, r) => t + r.throttleExemptDepth, 0),
    exemptRuns: runs.filter(r => r.throttleExemptDepth > 0).length,
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`,
      base && typeof base.daily === 'function',
      'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s) — the suite would run policy-less.`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'throttlebeat-smoke-' + pid, fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check(`[${pid}] harness invokes policy.daily (meanCalls/day>0)`, meanCalls > 0, 'mean=' + meanCalls);
    check(`[${pid}] >=1 policy-origin deliberate act`, policyActs > 0, 'policyActs=' + policyActs);
  }
  console.log(fails.length ? `\nSMOKE STOP: ${fails.length} failure(s)` : '\nSMOKE GREEN — policies genuinely drive');
  process.exit(fails.length ? 1 : 0);
}

if (process.env.SMOKE === '1') { smokeGate(); return; }

(async () => {
  const SIDE = process.env.SIDE || 'after';
  const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10));
  const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim());
  const DAYS = parseInt(process.env.DAYS || '180', 10);
  const OUT = process.env.OUT || ('evidence/2026-10-14/throttlebeat-' + SIDE + '.json');
  const PERSEED = OUT.replace(/\.json$/, '-perseed');
  try { fs.mkdirSync(PERSEED, { recursive: true }); } catch (e) {}
  console.log(`THROTTLEBEAT sweep SIDE=${SIDE} seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await oneRun(seed, pid, DAYS);
      runs.push(r);
      const f = PERSEED + `/throttlebeat-${SIDE}-${pid}-s${seed}.json`;
      fs.writeFileSync(f, JSON.stringify(r, null, 1));
      console.log(`  [${pid} s${seed}] d=${r.days} ${r.endReason} starve=${r.starveDeaths} vd=${r.villagerDays} sp100=${r.starvePer100vd} rotF=${r.rotFresh} redir=${r.throttleRedirects} exempt=${r.throttleExemptDepth} hungry=${r.hungryDays} nat=${r.national} w4=${r.waveReach >= 4 ? 1 : 0} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  const agg = aggregate(runs);
  agg.side = SIDE; agg.seeds = SEEDS; agg.policies = POLICIES; agg.days = DAYS;
  fs.writeFileSync(OUT, JSON.stringify({ aggregate: agg, runs }, null, 1));
  console.log(`\nAGG [${SIDE}]: n=${agg.n} sp100=${agg.starvePer100vd} (starve=${agg.starveDeaths}/${agg.villagerDays}vd)` +
    ` rotF=${agg.rotFresh} medD=${agg.medianDays} maxD=${agg.maxDays} nat=${agg.national} tab=${agg.table} won=${agg.wins}` +
    ` exiled=${agg.exiled} w4=${agg.wave4} w5=${agg.wave5} hungry=${agg.hungryDays} redir=${agg.throttleRedirects} exempt=${agg.throttleExemptDepth} exemptRuns=${agg.exemptRuns}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
