#!/usr/bin/env node
// scripts/measure-sharepol-20261014.js — SHAREPOL pilot measurement (fleshout-b, 2026-10-14).
//
// THE ARM: sim-findings #115 — the throttle's starvation cost is DISTRIBUTIONAL
// (trust-gated sharing), not buffer depth. sharepol layers proactive
// person-to-person sharing (Game.giveFood(vid,'meal')) onto leadcourt/belongseek.
// Proof: scripts/test-sharepol-20261014.js (RED gate-off byte-identical, GREEN
// intake-measured).
//
// Pre-registered (evidence/2026-10-14/sim-sharepol-b.md header, MEASUREMENT §§9-12, 14):
//   PRIMARY: starvation deaths per 100 villager-days, armed <= control
//     (ONE-SIDED improvement vs the landed-throttle control).
//   GUARDRAILS:
//     median survival: armed_median >= control_median - 3d (A/A calibrated, one-sided)
//     national: armed >= control - 2
//     exiled: armed - control <= 0
//   A miss is NO-GO — never re-scored against a friendlier metric mid-run.
//   Horizon: 180d death-aware (dead villages stop, 10d tail).
//   Seeds: 11/22/33/44/55/66/77/88 x leadcourt/belongseek, IDENTICAL seeds both
//     sides (16 runs/side). This 16-run pilot IS the gate (no confirm spend).
//   CONTROL: landed throttle on current tip + BARE policies (SHAREPOL unset).
//   ARMED: same tree + withShare layer (SHAREPOL=1). Same tree, identical seeds,
//     env-var only.
//   Determinism caveat (#113): DETERM=1 gate first — same seed+policy twice
//     in-process must be bit-identical, else quantify spread and require
//     effect > spread.
//
// Usage:
//   SIDE=control OUT=evidence/2026-10-14/sharepol-control.json node scripts/measure-sharepol-20261014.js
//   SIDE=armed OUT=evidence/2026-10-14/sharepol-armed.json SHAREPOL=1 node scripts/measure-sharepol-20261014.js
//   SMOKE=1 node scripts/measure-sharepol-20261014.js   # instrument gate
//   DETERM=1 node scripts/measure-sharepol-20261014.js  # determinism gate
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { withShare } = require('./policies/sharepol');

const POLICY_REGISTRY = {
  // named-export unwrap only (#69: Object.assign({}, require(...)) leaves
  // policy.daily undefined and the suite silently runs policy-less).
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

// per-run instruments (no stack sniffing — that perturbs trajectories)
function instrument(Game) {
  const W = { inBy: {}, outBy: {}, rotFresh: 0, rotPreserved: 0,
    tributePaidKcal: 0, tributeWeeks: {} };
  let sinkOverride = null;
  const oPay = Game.payTribute;
  if (typeof oPay === 'function') Game.payTribute = function () {
    const prev = sinkOverride; sinkOverride = 'tribute';
    try { return oPay.apply(this, arguments); } finally { sinkOverride = prev; }
  };
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') Game._removePantryKcal = function (kcal) {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
  };
  const oPayT = Game.payTribute;
  if (typeof oPayT === 'function') Game.payTribute = function (linkId, kcal) {
    const r = oPayT.apply(this, arguments);
    try {
      const wk = typeof this._week === 'function' ? this._week() : 0;
      W.tributePaidKcal += (r || 0);
      const links = typeof this.hierarchyState === 'function' ? this.hierarchyState() : [];
      const l = links.find(x => x && x.id === linkId);
      if (l && l.tributePaidWeek === wk) W.tributeWeeks[linkId + ':' + wk] = 1;
    } catch (e) {}
    return r;
  };
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

function buildPolicy(pid, side) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const bare = Object.assign({}, base);
  if (side === 'armed') return withShare(bare);
  return bare;
}

async function oneRun(seed, pid, days, side) {
  const policy = buildPolicy(pid, side);
  const { Game } = await loadGame({ seed, mode: 'sharepol-' + side + '-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = policy.daily;
  const ctxOut = {};
  // ctx is REUSED across days (shareGifts accumulates on it) — track deltas,
  // not the running total (summing the total each day inflates quadratically).
  let lastGifts = 0, lastUnits = 0, maxGiftsDay = 0;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    let r;
    if (origDaily) { try { r = origDaily(G, ctx); } catch (e) {} }
    // the share layer writes ctx.shareGifts/ctx.shareUnits — carry the
    // per-day DELTAS out (ctx is reused across days; the layer's counter
    // is cumulative, so diff against the last seen value).
    try {
      const cur = ctx.shareGifts || 0, curU = ctx.shareUnits || 0;
      const dG = Math.max(0, cur - lastGifts), dU = Math.max(0, curU - lastUnits);
      ctxOut.shareGifts = (ctxOut.shareGifts || 0) + dG;
      ctxOut.shareUnits = (ctxOut.shareUnits || 0) + dU;
      if (dG > maxGiftsDay) maxGiftsDay = dG;
      lastGifts = cur; lastUnits = curU;
    } catch (e) {}
    return r;
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
  let hungry = 0, hungryStreakMax = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
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
    tributePaidKcal: Math.round(W.tributePaidKcal),
    tributeWeeks: Object.keys(W.tributeWeeks).length,
    hungryDays: hungry,
    shareGifts: ctxOut.shareGifts || 0, shareUnits: ctxOut.shareUnits || 0,
    maxGiftsDay,
  };
}

function trajHash(r) {
  return crypto.createHash('sha1').update(JSON.stringify(r)).digest('hex').slice(0, 16);
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
    shareGifts: runs.reduce((t, r) => t + r.shareGifts, 0),
    shareUnits: runs.reduce((t, r) => t + r.shareUnits, 0),
    tributeKcal: runs.reduce((t, r) => t + r.tributePaidKcal, 0),
    tributeWeeks: runs.reduce((t, r) => t + r.tributeWeeks, 0),
  };
}

// INSTRUMENT-HONESTY GATE (#69): SMOKE=1 runs a short live smoke per policy
// BEFORE any sweep spend and FAILS LOUDLY unless the policy is genuinely
// driving (unwrapped daily is a function; harness invokes it;
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
      base && typeof base.daily === 'function',
      'typeof=' + (base && typeof base.daily));
    const layered = withShare(Object.assign({}, base));
    check(`[${pid}] withShare keeps daily a function (gate-off)`,
      layered && typeof layered.daily === 'function');
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s) — the suite would run policy-less.`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'sharepol-smoke-' + pid, fullTelemetry: false });
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

// DETERMINISM GATE (#113): same seed+policy twice in-process must be
// bit-identical before trusting an identical-seed comparison. Reports the
// gate verdict; on failure quantifies per-seed spread for the noise budget.
async function determGate() {
  console.log('DETERM GATE: seed 11 leadcourt + seed 44 belongseek, control side, twice each in-process');
  const fails = [];
  for (const [seed, pid] of [[11, 'leadcourt'], [44, 'belongseek']]) {
    const r1 = await oneRun(seed, pid, 180, 'control');
    const r2 = await oneRun(seed, pid, 180, 'control');
    const h1 = trajHash(r1), h2 = trajHash(r2);
    const same = h1 === h2;
    console.log(`  [${pid} s${seed}] run1 d=${r1.days} starve=${r1.starveDeaths} sp100=${r1.starvePer100vd} hash=${h1}`);
    console.log(`  [${pid} s${seed}] run2 d=${r2.days} starve=${r2.starveDeaths} sp100=${r2.starvePer100vd} hash=${h2}`);
    console.log(`  ${same ? 'PASS' : 'FAIL'} bit-identical ${same ? '' : `(Δdays=${r2.days - r1.days}, Δstarve=${r2.starveDeaths - r1.starveDeaths})`}`);
    if (!same) fails.push(`${pid}-s${seed}`);
  }
  console.log(fails.length
    ? `\nDETERM GATE: ${fails.length} pair(s) DIVERGED — identical-seed before/after is NOT controlled on these seeds; effect must exceed the measured spread.`
    : '\nDETERM GATE GREEN — control suite reproduces bit-identically in-process.');
  process.exit(fails.length ? 1 : 0);
}

if (process.env.SMOKE === '1') { smokeGate(); return; }
if (process.env.DETERM === '1') { determGate(); return; }

(async () => {
  const SIDE = process.env.SIDE || 'armed';
  const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10));
  const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim());
  const DAYS = parseInt(process.env.DAYS || '180', 10);
  const OUT = process.env.OUT || ('evidence/2026-10-14/sharepol-' + SIDE + '.json');
  const PERSEED = OUT.replace(/\.json$/, '-perseed');
  try { fs.mkdirSync(PERSEED, { recursive: true }); } catch (e) {}
  // per-side shape assertion: the env gate must match the declared side
  const envOn = process.env.SHAREPOL === '1';
  if (SIDE === 'control' && envOn) { console.error('SIDE=control requires SHAREPOL unset — refusing to run'); process.exit(1); }
  if (SIDE === 'armed' && !envOn) { console.error('SIDE=armed requires SHAREPOL=1 — refusing to run'); process.exit(1); }
  console.log(`SHAREPOL sweep SIDE=${SIDE} (SHAREPOL=${process.env.SHAREPOL || 'unset'}) seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await oneRun(seed, pid, DAYS, SIDE);
      runs.push(r);
      const f = PERSEED + `/sharepol-${SIDE}-${pid}-s${seed}.json`;
      fs.writeFileSync(f, JSON.stringify(r, null, 1));
      console.log(`  [${pid} s${seed}] d=${r.days} ${r.endReason} starve=${r.starveDeaths} vd=${r.villagerDays} sp100=${r.starvePer100vd} gifts=${r.shareGifts} maxDay=${r.maxGiftsDay} hungry=${r.hungryDays} nat=${r.national} w4=${r.waveReach >= 4 ? 1 : 0} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  const agg = aggregate(runs);
  agg.side = SIDE;
  agg.seeds = SEEDS;
  agg.policies = POLICIES;
  agg.days = DAYS;
  fs.writeFileSync(OUT, JSON.stringify({ aggregate: agg, runs }, null, 1));
  console.log(`\nAGG [${SIDE}]: n=${agg.n} sp100=${agg.starvePer100vd} (starve=${agg.starveDeaths}/${agg.villagerDays}vd)` +
    ` rotF=${agg.rotFresh} medD=${agg.medianDays} maxD=${agg.maxDays} nat=${agg.national} tab=${agg.table} won=${agg.wins}` +
    ` exiled=${agg.exiled} w4=${agg.wave4} w5=${agg.wave5} hungry=${agg.hungryDays} gifts=${agg.shareGifts} units=${agg.shareUnits}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
