#!/usr/bin/env node
// scripts/measure-famredirect-20261014.js — FAMINEREDIRECT pilot measurement
// (fleshout-b, 2026-10-14).
//
// PRE-REGISTERED (evidence header, §§9–12 + 14 binding):
//   PRIMARY   = starvation deaths per 100 villager-days (sp100vd), summed
//               over the 16-run suite (8 seeds x leadcourt/belongseek).
//               GO = armed <= control - 0.144 (one-sided; 0.144 = p90
//               |Δsp100vd| from the throttle-aa A/A calibration).
//   GUARDRAILS: median survival >= control - 3d; national >= control - 2;
//               exiled <= control; rot per villager-day <= 1.2x control
//               (report-only if it binds — a famine lever legitimately
//               raises production).
//   KILL = primary misses, or any guardrail binds (other than rot).
//   HORIZON: 180d death-aware (dead villages stop, +10d tail max).
//   SEEDS: 11/22/33/44/55/66/77/88 x leadcourt/belongseek, 16 runs/side,
//          IDENTICAL seeds both sides.
//   CONTROL = FAMINEREDIRECT unset; ARMED = FAMINEREDIRECT=1.
//   INSTRUMENT HONESTY: SMOKE=1 gate before sweep spend (fail loudly if
//          policy-less); named-export policy unwrap (#69); per-side shape
//          assertion (control: env unset + mechanism provably inert —
//          famineRedirects === 0 across all runs; armed: env set + the
//          redirect fires at thin pantry in >=1 run).
//   A miss is NO-GO — never re-scored mid-run.
//
// Usage:
//   FAM_SIDE=control SMOKE=1 node scripts/measure-famredirect-20261014.js
//   FAM_SIDE=control SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" \
//     DAYS=180 OUT=/tmp/famredirect-control.json PERSEED_DIR=evidence/2026-10-14/famredirect-control-perseed \
//     node scripts/measure-famredirect-20261014.js
//   FAM_SIDE=armed FAMINEREDIRECT=1 ...same... node scripts/measure-famredirect-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SIDE = (process.env.FAM_SIDE || 'control').trim();
// The env gate is the side selector. Force it decisively so a leaked shell
// env can never silently flip a side.
if (SIDE === 'armed') process.env.FAMINEREDIRECT = '1';
else delete process.env.FAMINEREDIRECT;

const POLICY_REGISTRY = {
  // UNWRAP FIX (#69, 2026-10-14): named exports, never Object.assign({},
  // require(...)) — that yields {leadcourt:{...}} and the suite runs
  // policy-less (policy.daily undefined).
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
  const { Game } = await loadGame({ seed, mode: 'famredirect-' + SIDE + '-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWaveSeen: 1 };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.arc >= 2) hist.maxWaveSeen = Math.max(hist.maxWaveSeen, 2);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (d.cause === 'starvation' && (d.kind === 'villager' || d.kind === 'person') && !d.player) starveDeaths++;
    }
  } catch (e) {}
  // villager-days: pop snapshots are every 10 days; subtract one scholar-day
  // per game day. Identical seeds make the approximation symmetric.
  let villagerDays = 0;
  try {
    for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0) * 10;
    villagerDays = Math.max(1, villagerDays - (result.gameDays || 0));
  } catch (e) {}
  let hungry = 0, redirects = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { redirects = (Game.state.village || {}).famineRedirects || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const waveReach = result.maxWaveUnlocked || hist.maxWaveSeen || 1;
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths, villagerDays,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    hungryDays: hungry, famineRedirects: redirects,
  };
}

function aggregate(runs) {
  const starveDeaths = runs.reduce((t, r) => t + (r.starveDeaths || 0), 0);
  const villagerDays = runs.reduce((t, r) => t + (r.villagerDays || 0), 0);
  const sp100vd = 100 * starveDeaths / Math.max(1, villagerDays);
  const rotFresh = runs.reduce((t, r) => t + r.rotFresh, 0);
  const rotPreserved = runs.reduce((t, r) => t + r.rotPreserved, 0);
  const rotTotal = rotFresh + rotPreserved;
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
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
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      starveDeaths: rs.reduce((t, r) => t + (r.starveDeaths || 0), 0),
      villagerDays: rs.reduce((t, r) => t + (r.villagerDays || 0), 0),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      redirects: rs.reduce((t, r) => t + (r.famineRedirects || 0), 0),
      rotFresh: rs.reduce((t, r) => t + r.rotFresh, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
    };
  }
  return {
    n: runs.length, starveDeaths, villagerDays, sp100vd: +sp100vd.toFixed(3),
    rotFresh, rotPreserved, rotPerVDay: +(rotTotal / Math.max(1, villagerDays)).toFixed(1),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    wins: runs.reduce((t, r) => t + r.won, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE (#69, 2026-10-14): SMOKE=1 runs a short live smoke
// per policy BEFORE any pilot spend and FAILS LOUDLY unless the policy is
// genuinely driving: (1) policy.daily is a function after unwrap; (2) the
// harness actually invokes policy.daily; (3) >=1 policy-origin deliberate
// act happens (a 'policy:' act key lands in the pacing rows).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
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
    const { Game } = await loadGame({ seed: 11, mode: 'famredirect-smoke-' + pid, fullTelemetry: false });
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
    check(`[${pid}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0, `days=${result.days}`);
    check(`[${pid}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
    check(`[${pid}] >=1 policy-origin deliberate act (policyActs=${policyActs})`, policyActs > 0);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s) — the policy is present but not driving. Fix before measuring.`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = (process.env.LEVER || 'famredirect') + '-' + SIDE;
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} starve=${r.starveDeaths} vd=${r.villagerDays} hungry=${r.hungryDays} redir=${r.famineRedirects}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`starveDeaths=${agg.starveDeaths} villagerDays=${agg.villagerDays} sp100vd=${agg.sp100vd} medianDays=${agg.medianDaysAll}`);
  console.log(`national=${agg.national} table=${agg.table} wins=${agg.wins} exiled=${agg.exiled} rot/vday=${agg.rotPerVDay}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} maxWave=${b.maxWave} arc=${b.maxArc} starve=${b.starveDeaths} redir=${b.redirects} rot=${(b.rotFresh / 1000).toFixed(1)}k exiled=${b.exiled}`);
  }
  // PER-SIDE SHAPE ASSERTION: control must be provably inert (env unset,
  // zero redirects across all runs); armed must show the redirect firing.
  const totalRedir = rows.reduce((t, r) => t + (r.famineRedirects || 0), 0);
  const envNow = process.env.FAMINEREDIRECT;
  let shapeOk = false;
  if (SIDE === 'control') {
    shapeOk = (envNow === undefined) && totalRedir === 0;
    console.log(`  SHAPE control: FAMINEREDIRECT unset=${envNow === undefined} totalRedir=${totalRedir} -> ${shapeOk ? 'INERT (good)' : 'VIOLATED (bad)'}`);
  } else {
    shapeOk = (envNow === '1') && totalRedir > 0;
    console.log(`  SHAPE armed: FAMINEREDIRECT=1=${envNow === '1'} totalRedir=${totalRedir} -> ${shapeOk ? 'FIRES (good)' : 'VIOLATED (bad)'}`);
  }
  if (!shapeOk) { console.log('SHAPE STOP: per-side mechanism shape violated — do not trust this side.'); process.exit(1); }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, side: SIDE, envGate: envNow === undefined ? 'unset' : envNow, seeds, pids, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/${label}-${r.policy}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        starveDeaths: r.starveDeaths, villagerDays: r.villagerDays,
        hungryDays: r.hungryDays, famineRedirects: r.famineRedirects,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { oneRun, aggregate };
