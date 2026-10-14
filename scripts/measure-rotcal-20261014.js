#!/usr/bin/env node
// scripts/measure-rotcal-20261014.js — ROT A/A CALIBRATION (fleshout-b, 2026-10-14).
//
// Instrument-only: NO game-code changes. Runs the food-economy control suite
// TWICE in separate invocations and quantifies the fresh-rot noise floor.
//
// Pre-registered (evidence/2026-10-14/sim-rotcal-b.md header):
//   TASK: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
//     death-aware, landed-throttle control (no env gates set), identical
//     seeds both invocations. Two invocations = 32 runs total.
//   Per seed+policy per invocation: absolute fresh-rot kcal, fresh-rot per
//     villager-day, fresh-rot per day-alive, starvation deaths,
//     villager-days, days survived.
//   CALIBRATION: per-seed |Δ| between invocations for each rot form —
//     mean |Δ|, p90 |Δ|, max |Δ| for absolute kcal, per-villager-day,
//     per-day-alive. Bifurcating seeds flagged per seed-88-class
//     nondeterminism (sim-findings: fight-heavy trajectories carry genuine
//     rerun noise).
//   DIAGNOSTIC GO: >=14/16 seeds paired across both invocations AND the p90
//     |Δ| table published for all three rot forms AND a recommended
//     guardrail form written for future runs. A "GO" means the calibration
//     is publishable, not a lever landed.
//
// Usage:
//   SMOKE=1 node scripts/measure-rotcal-20261014.js        # instrument gate
//   INV=a node scripts/measure-rotcal-20261014.js           # invocation A
//   INV=b node scripts/measure-rotcal-20261014.js           # invocation B
//   CAL=1  node scripts/measure-rotcal-20261014.js          # analyze both
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

// named-export unwrap only (#69: Object.assign({}, require(...)) leaves
// policy.daily undefined and the suite silently runs policy-less).
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const POLICY_REGISTRY = { leadcourt, belongseek };

function stdSnapshot(Game) {
  const out = { won: false };
  try { out.won = !!Game.won; } catch (e) {}
  return out;
}

// rot instrumentation: classify at sweep time by foodState — preserved/
// rendered keep, everything else rots fresh (matches diag-kcal-r8-20261012
// and the hungerdepth measurement).
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

async function oneRun(seed, pid, days, inv) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'rotcal-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      if (String(d.cause || d.kind || 'unknown') === 'starvation') starveDeaths++;
    }
  } catch (e) {}
  // villager-days: summed daily roster length (samples.pop = [day, rosterLen])
  let villagerDays = 0;
  try {
    for (const row of (result.samples.pop || [])) villagerDays += (row[1] || 0);
  } catch (e) {}
  const daysAlive = result.days || 0;
  const rotFresh = Math.round(W.rotFresh);
  const rotPreserved = Math.round(W.rotPreserved);
  return {
    invocation: inv, policy: pid, seed,
    days: daysAlive, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    starveDeaths, villagerDays,
    starvePer100vd: villagerDays > 0 ? +(100 * starveDeaths / villagerDays).toFixed(3) : 0,
    rotFresh,
    rotFreshPerVd: villagerDays > 0 ? +(rotFresh / villagerDays).toFixed(3) : 0,
    rotFreshPerDayAlive: daysAlive > 0 ? +(rotFresh / daysAlive).toFixed(1) : 0,
    rotPreserved,
  };
}

// INSTRUMENT-HONESTY GATE (#69): SMOKE=1 fails loudly unless the policy is
// genuinely driving (unwrapped daily is a function; harness invokes it;
// >=1 policy-origin deliberate act fires). A policy-less suite stops here.
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
      base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s) — the suite would run policy-less.`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    const policy = Object.assign({}, base, { daily(G, ctx) { return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'rotcal-smoke-' + pid, fullTelemetry: false });
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

const PERSEED = 'evidence/2026-10-14/rotcal-aa-perseed';

// ---------- CALIBRATION ANALYZER ----------
function analyze() {
  const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const mean = (xs) => xs.reduce((t, x) => t + x, 0) / Math.max(1, xs.length);
  // p90 convention matches throttle-aa (calibrate-throttle-aa-20261014.js):
  // s[min(n-1, floor(0.9n))]
  const q = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const files = fs.readdirSync(PERSEED).filter(f => f.endsWith('.json'));
  const byInv = { a: [], b: [] };
  for (const f of files) {
    const r = JSON.parse(fs.readFileSync(PERSEED + '/' + f, 'utf8'));
    if (byInv[r.invocation]) byInv[r.invocation].push(r);
  }
  const key = (r) => r.policy + ':' + r.seed;
  const bMap = new Map(byInv.b.map(r => [key(r), r]));
  const pairs = byInv.a.map(r => [r, bMap.get(key(r))]).filter(([, b]) => b);
  const rel = (a, b) => (a > 0 ? Math.abs(b - a) / a : (b === 0 ? 0 : 1));
  const dAbs = pairs.map(([a, b]) => Math.abs(b.rotFresh - a.rotFresh));
  const dVd = pairs.map(([a, b]) => Math.abs(b.rotFreshPerVd - a.rotFreshPerVd));
  const dDay = pairs.map(([a, b]) => Math.abs(b.rotFreshPerDayAlive - a.rotFreshPerDayAlive));
  const dDays = pairs.map(([a, b]) => Math.abs(b.days - a.days));
  const relAbs = pairs.map(([a, b]) => rel(a.rotFresh, b.rotFresh));
  const relVd = pairs.map(([a, b]) => rel(a.rotFreshPerVd, b.rotFreshPerVd));
  const relDay = pairs.map(([a, b]) => rel(a.rotFreshPerDayAlive, b.rotFreshPerDayAlive));
  const stat = (xs) => ({ meanAbs: +mean(xs).toFixed(3), p90: +q(xs, 0.9).toFixed(3), max: +Math.max(...xs).toFixed(3) });
  const cal = {
    pairs: pairs.length,
    absoluteKcal: stat(dAbs),
    perVillagerDay: stat(dVd),
    perDayAlive: stat(dDay),
    relAbsolute: stat(relAbs), relPerVd: stat(relVd), relPerDayAlive: stat(relDay),
    dayNoise: { meanAbs: +mean(dDays).toFixed(1), p90: +q(dDays, 0.9).toFixed(1), max: Math.max(...dDays) },
    seeds: pairs.map(([a, b], i) => ({
      key: key(a), dAbs: Math.round(dAbs[i]), dVd: +dVd[i].toFixed(3), dDay: +dDay[i].toFixed(1),
      relVd: +relVd[i].toFixed(3), dDays: dDays[i],
      a: { days: a.days, starve: a.starveDeaths, vd: a.villagerDays, rotF: a.rotFresh },
      b: { days: b.days, starve: b.starveDeaths, vd: b.villagerDays, rotF: b.rotFresh },
    })),
  };
  // bifurcation flag: relative per-vd |Δ| > p90 of relPerVd (seed-88-class)
  const relCut = cal.relPerVd.p90;
  for (const s of cal.seeds) s.bifurcated = s.relVd > relCut || s.dDays > 10;
  fs.writeFileSync('evidence/2026-10-14/rotcal-calibration.json', JSON.stringify(cal, null, 1));
  console.log('=== ROT A/A CALIBRATION ===');
  console.log(`paired seeds: ${cal.pairs}/16 across invocations A and B`);
  console.log('\nform               | mean |Δ|      | p90 |Δ|       | max |Δ|');
  const row = (n, s) => console.log(`${n.padEnd(18)} | ${String(s.meanAbs).padStart(12)} | ${String(s.p90).padStart(11)} | ${String(s.max).padStart(10)}`);
  row('absolute kcal', cal.absoluteKcal);
  row('per villager-day', cal.perVillagerDay);
  row('per day-alive', cal.perDayAlive);
  console.log('\nrelative |Δ| (fraction of A value):');
  row('absolute kcal', cal.relAbsolute);
  row('per villager-day', cal.relPerVd);
  row('per day-alive', cal.relPerDayAlive);
  console.log(`\nday noise (survival): mean|Δ|=${cal.dayNoise.meanAbs}d p90=${cal.dayNoise.p90}d max=${cal.dayNoise.max}d`);
  console.log('\nper-seed |Δ| (bifurcated = rel|ΔrotPerVd| > p90 or |Δdays| > 10):');
  for (const s of cal.seeds) {
    console.log(`  ${s.key.padEnd(16)} dAbs=${String(s.dAbs).padStart(7)} dVd=${s.dVd} relVd=${s.relVd} dDays=${s.dDays} ${s.bifurcated ? '<< BIFURCATED' : ''}`);
  }
  console.log('\nrecommended guardrail (calibrated multiplier):');
  const m = +(1 + cal.relPerVd.p90).toFixed(3);
  console.log(`  armed_rot_per_vd <= control_rot_per_vd x ${m}   (p90 rel|Δ|=${cal.relPerVd.p90})`);
  console.log(`  (diagnostic GO: pairs=${cal.pairs}>=14 ? ${cal.pairs >= 14 ? 'YES' : 'NO'})`);
}

if (process.env.CAL === '1') { analyze(); return; }

// ---------- SWEEP ----------
(async () => {
  const INV = process.env.INV || 'a';
  if (!['a', 'b'].includes(INV)) { console.error('INV must be a or b'); process.exit(1); }
  // landed-throttle control only: refuse if any lever env gate is set
  for (const g of ['HUNGERDEPTH', 'HUNGERXEMPT', 'PRODTHROTTLE_OFF']) {
    if (process.env[g] !== undefined) { console.error(`ROT-A/A refuses: env gate ${g} is set — control must be landed-only`); process.exit(1); }
  }
  const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10));
  const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim());
  const DAYS = parseInt(process.env.DAYS || '180', 10);
  const OUT = process.env.OUT || ('evidence/2026-10-14/rotcal-' + INV + '.json');
  try { fs.mkdirSync(PERSEED, { recursive: true }); } catch (e) {}
  console.log(`ROT-A/A sweep INV=${INV} (landed throttle, no env gates) seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await oneRun(seed, pid, DAYS, INV);
      runs.push(r);
      fs.writeFileSync(`${PERSEED}/rotcal-${INV}-${pid}-s${seed}.json`, JSON.stringify(r, null, 1));
      console.log(`  [${pid} s${seed}] d=${r.days} ${r.endReason} starve=${r.starveDeaths} vd=${r.villagerDays} rotF=${r.rotFresh} rot/vd=${r.rotFreshPerVd} rot/d=${r.rotFreshPerDayAlive} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  const agg = {
    n: runs.length,
    rotFresh: runs.reduce((t, r) => t + r.rotFresh, 0),
    rotFreshPerVd: runs.reduce((t, r) => t + r.rotFresh, 0) / Math.max(1, runs.reduce((t, r) => t + r.villagerDays, 0)),
    starveDeaths: runs.reduce((t, r) => t + r.starveDeaths, 0),
    villagerDays: runs.reduce((t, r) => t + r.villagerDays, 0),
    medianDays: (() => { const d = runs.map(r => r.days).sort((a, b) => a - b); return d[Math.floor(d.length / 2)]; })(),
  };
  agg.side = INV; agg.seeds = SEEDS; agg.policies = POLICIES; agg.days = DAYS;
  fs.writeFileSync(OUT, JSON.stringify({ aggregate: agg, runs }, null, 1));
  console.log(`\nAGG [${INV}]: n=${agg.n} rotF=${agg.rotFresh} rotF/vd=${agg.rotFreshPerVd.toFixed(2)} starve=${agg.starveDeaths}/${agg.villagerDays}vd medD=${agg.medianDays}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
