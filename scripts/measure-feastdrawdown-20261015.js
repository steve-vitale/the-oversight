#!/usr/bin/env node
// scripts/measure-feastdrawdown-20261015.js — SIM-FEASTDRAWDOWN arm measurement
// (loop B, 2026-10-15, food-economy axis — feast-AS-DRAWDOWN).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14):
//   Question: does the FEAST verb (the aidspoil driver's remaining
//     candidate — aid was KILLED AT PILOT as a clean null) cut absolute
//     fresh-rot vs PRISTINE? Own control in the SAME sweep (#247).
//   Lever (policy-side, scripts/policies/feastdrawdown.js, FEASTDRAWDOWN=1,
//     default OFF — zero src/js changes): wraps leadfeast as feastDrawdown.
//     Fresh-days > 4 + siege-gate clear → ONE hostFeast/day under the r13
//     allowance chain; floor NEVER below 3 fresh-days; no double-feast;
//     no displacement; no aid; no tribute; cause lines after confirmed verbs.
//   Conditions: CONTROL = pristine leadfeast (FEASTDRAWDOWN unset).
//     ARMED = feastDrawdown + FEASTDRAWDOWN=1. Identical seeds.
//     FEASTSCALE_R13=1 (the leadfeast road as briefed).
//   Road: 8 seeds (11/22/33/44/55/66/77/88), 180d death-aware.
//   Det-gate: 16/16 bit-identical both sides before trusting comparisons.
//     SMOKE=1 honesty gate before measuring.
//   PRIMARY: absolute fresh-rot kcal, armed <= 0.85 x control (aggregate
//     AND ex-near-zero range).
//   GUARDRAILS: starvation <= control+2; hungryDays <= control x 1.409;
//     rot/villager-day <= control x 1.335; no new death mode (n>=3);
//     national >= control-2; wave-5 unlocks <= control+2.
//   GO on primary + all guardrails, else KILL per §14.
//
// Kill-protocol degradation: INFO-SKIP if the layer file is absent.
//
// Usage:
//   SMOKE=1 node scripts/measure-feastdrawdown-20261015.js
//   FEASTSCALE_R13=1 LEVER=feastdrawdown-control SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     POLICIES=leadfeast OUT=evidence/2026-10-15/feastdrawdown-pilot-control.json PERSEED_DIR=evidence/2026-10-15/perseed-feastdrawdown-base \
//     node scripts/measure-feastdrawdown-20261015.js
//   FEASTDRAWDOWN=1 FEASTSCALE_R13=1 LEVER=feastdrawdown-armed ... POLICIES=feastDrawdown ... \
//     node scripts/measure-feastdrawdown-20261015.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.FEASTDRAWDOWN === '1';
let FD = null;
try { FD = require('./policies/feastdrawdown'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: feastdrawdown layer absent (killed or not yet built); status in evidence/2026-10-15/sim-feastdrawdown-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');
// NAMED-EXPORT UNWRAP (the prodthrottle lesson): the policy objects, not
// the module namespace.
const POLICY_REGISTRY = {
  leadfeast, // control: pristine (the RED proof asserts gate-off feastDrawdown == leadfeast)
  feastDrawdown: FD.feastDrawdown, // armed: leadfeast + the feast-as-drawdown driver
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

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// install per-run instruments
function instrument(Game) {
  const W = { inBy: {}, outBy: {}, rotFresh: 0, rotPreserved: 0, rotByDay: {},
    tributePaidKcal: 0, tributeWeeks: {}, starveDeaths: 0 };
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { if (kcal > 0) W.inBy[name || '?'] = (W.inBy[name || '?'] || 0) + kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
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
  const oPay = Game.payTribute;
  if (typeof oPay === 'function') Game.payTribute = function (linkId, kcal) {
    const r = oPay.apply(this, arguments);
    try {
      const wk = typeof this._week === 'function' ? this._week() : 0;
      W.tributePaidKcal += (r || 0);
      const links = typeof this.hierarchyState === 'function' ? this.hierarchyState() : [];
      const l = links.find(x => x && x.id === linkId);
      if (l && l.tributePaidWeek === wk) W.tributeWeeks[linkId + ':' + wk] = 1;
    } catch (e) {}
    return r;
  };
  // rot: classify at sweep time by foodState; attribute to the current day.
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

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'feastdrawdown-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const freshDaysSamples = [];
  let pantryPeak = 0, villagerDays = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      villagerDays += (((G.state.village || {}).roster || []).length) || 0;
      const d = gday(G);
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
  let fdFeasts = 0, fdFeastKcal = 0, fdGateHeld = 0, fsFeasts = 0;
  let gorgeNights = 0;
  try {
    if (runCtx) {
      fdFeasts = runCtx.fdFeasts || 0; fdFeastKcal = runCtx.fdFeastKcal || 0;
      fdGateHeld = runCtx.fdGateHeld || 0; fsFeasts = runCtx.fsFeasts || 0;
      gorgeNights = (Game.__fdGorgeDays || []).length;
    }
  } catch (e) {}
  const cliffDays = Object.keys(W.rotByDay).filter(d => W.rotByDay[d] > 10000).length;
  const cliffKcal = Object.values(W.rotByDay).filter(k => k > 10000).reduce((t, k) => t + k, 0);
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, starveDeaths: W.starveDeaths,
    inBy: W.inBy, outBy: W.outBy,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    villagerDays,
    cliffDays, cliffKcal: Math.round(cliffKcal),
    tributePaidKcal: Math.round(W.tributePaidKcal),
    tributeWeeks: Object.keys(W.tributeWeeks).length,
    hungryDays: hungry, throttleRedirects: redirects,
    fdFeasts, fdFeastKcal: Math.round(fdFeastKcal), fdGateHeld, fsFeasts, gorgeNights,
    freshDaysSamples, pantryPeak: Math.round(pantryPeak),
  };
}

function aggregate(runs) {
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const rotFresh = sum(r => r.rotFresh), rotPres = sum(r => r.rotPreserved);
  const rotShare = 100 * rotFresh / Math.max(1, rotFresh + rotPres);
  const daysAlive = sum(r => r.days);
  const vdays = sum(r => r.villagerDays);
  const rotPerDayAlive = Math.round(rotFresh / Math.max(1, daysAlive));
  const rotPerVillagerDay = rotFresh / Math.max(1, vdays);
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const byPolicy = {};
  for (const pid of [...new Set(runs.map(r => r.policy))]) {
    const rs = runs.filter(r => r.policy === pid);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    const rvd = rs.reduce((t, r) => t + r.villagerDays, 0);
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      rotFresh: rs.reduce((t, r) => t + r.rotFresh, 0),
      rotPerDayAlive: Math.round(rs.reduce((t, r) => t + r.rotFresh, 0) / Math.max(1, rs.reduce((t, r) => t + r.days, 0))),
      rotPerVillagerDay: rs.reduce((t, r) => t + r.rotFresh, 0) / Math.max(1, rvd),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      gorgeNights: rs.reduce((t, r) => t + r.gorgeNights, 0),
      tributeKcal: rs.reduce((t, r) => t + r.tributePaidKcal, 0),
      tributeWeeks: rs.reduce((t, r) => t + r.tributeWeeks, 0),
      redirects: rs.reduce((t, r) => t + (r.throttleRedirects || 0), 0),
      fdFeasts: rs.reduce((t, r) => t + r.fdFeasts, 0),
      fdFeastKcal: rs.reduce((t, r) => t + r.fdFeastKcal, 0),
      fsFeasts: rs.reduce((t, r) => t + r.fsFeasts, 0),
      fdGateHeld: rs.reduce((t, r) => t + r.fdGateHeld, 0),
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
    };
  }
  return {
    n: runs.length, rotFresh, rotPreserved: rotPres, rotSharePp: +rotShare.toFixed(1),
    rotPerDayAlive, rotPerVillagerDay,
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive. Unwrap check +
// live smoke per policy.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const want = ARMED ? ['feastDrawdown'] : ['leadfeast'];
  for (const pid of want) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`,
      base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
    check(`[${pid}] id`, /^(feastDrawdown|leadfeast)$/.test(base.id || ''), 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of want) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'feastdrawdown-smoke-' + pid, fullTelemetry: false });
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
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || (ARMED ? 'feastdrawdown-armed' : 'feastdrawdown-control');
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || (ARMED ? 'feastDrawdown' : 'leadfeast')).split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    if (pid === 'feastDrawdown' && !ARMED) throw new Error('feastDrawdown needs FEASTDRAWDOWN=1 (armed condition)');
    if (pid === 'leadfeast' && ARMED) throw new Error('leadfeast control needs FEASTDRAWDOWN unset (control condition)');
  }
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k/${(r.rotPreserved / 1000).toFixed(0)}k hungry=${r.hungryDays} fd=${r.fdFeasts}f/${(r.fdFeastKcal / 1000).toFixed(0)}k fs=${r.fsFeasts}f gate=${r.fdGateHeld} gorge=${r.gorgeNights}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotPreserved=${(agg.rotPreserved / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll} rot/vd=${agg.rotPerVillagerDay.toFixed(0)}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} maxWave=${b.maxWave} w5=${b.wave5} hungry=${b.hungryDays} starve=${b.starveDeaths} gorge=${b.gorgeNights} fd=${b.fdFeasts}f/${(b.fdFeastKcal / 1000).toFixed(0)}k fs=${b.fsFeasts}f gateHeld=${b.fdGateHeld} cliffs=${b.cliffDays}/${(b.cliffKcal / 1000).toFixed(0)}k peak=${(b.pantryPeak / 1000).toFixed(0)}k rot/vd=${b.rotPerVillagerDay.toFixed(0)}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, pids, days, armed: ARMED, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/${label}-${r.policy}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved, villagerDays: r.villagerDays,
        cliffDays: r.cliffDays, cliffKcal: r.cliffKcal,
        hungryDays: r.hungryDays, starveDeaths: r.starveDeaths,
        tributePaidKcal: r.tributePaidKcal, tributeWeeks: r.tributeWeeks,
        throttleRedirects: r.throttleRedirects,
        fdFeasts: r.fdFeasts, fdFeastKcal: r.fdFeastKcal, fdGateHeld: r.fdGateHeld,
        fsFeasts: r.fsFeasts, gorgeNights: r.gorgeNights,
        freshDaysSamples: r.freshDaysSamples, pantryPeak: r.pantryPeak,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
