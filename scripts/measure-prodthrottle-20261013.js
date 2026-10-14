#!/usr/bin/env node
// scripts/measure-prodthrottle-20261013.js — PRODTHROTTLE pilot measurement
// (fleshout-b, 2026-10-13).
//
// Pre-registered (evidence header):
//   primary metric = fresh-rot share = rot:fresh/(rot:fresh+rot:preserved) in pp,
//     summed over the 16-run suite (8 seeds x leadcourt/belongseek)
//   GO   = -10pp vs identical-seed baseline AND starveDays (hungryDays) delta <= +1
//          AND median survival within +-10d AND tribute-paid not regressed
//          (tribute kcal + weeks-current vs baseline, courtship policies)
//   KILL = rot share moves <5pp, or starveDays worsen, or tribute misses
//          increase, or median regresses >10d.
//   horizon: 180d death-aware (pacing-law max); dead villages stop.
//   seeds: 11/22/33/44/55/66/77/88 x leadcourt/belongseek, IDENTICAL seeds both sides.
//
// Usage:
//   LEVER=prodthrottle-baseline SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" \
//     DAYS=180 OUT=/tmp/prodthrottle-before.json node scripts/measure-prodthrottle-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  // UNWRAP FIX (#69, 2026-10-14): the policy modules export { leadcourt } /
  // { belongseek } named objects. Object.assign({}, require(...)) on the raw
  // module yields {leadcourt:{...}} — policy.daily undefined and the suite
  // SILENTLY RUNS POLICY-LESS. Unwrap the named export, exactly like
  // sweep-spoilsmoke-20261014.js line 13.
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

// install per-run instruments (no Error().stack sniffing — that perturbs trajectories)
function instrument(Game) {
  const W = { inBy: {}, outBy: {}, rotFresh: 0, rotPreserved: 0,
    tributePaidKcal: 0, tributeWeeks: {}, arrearsEnd: 0, arrearsLinks: 0 };
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { if (kcal > 0) W.inBy[name || '?'] = (W.inBy[name || '?'] || 0) + kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
  // sink override without stack sniffing: wrap the obligation entry points
  let sinkOverride = null;
  const withSink = (sink, fnName) => {
    const o = Game[fnName];
    if (typeof o === 'function') Game[fnName] = function () {
      const prev = sinkOverride; sinkOverride = sink;
      try { return o.apply(this, arguments); } finally { sinkOverride = prev; }
    };
  };
  withSink('tribute', 'payTribute');
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') Game._removePantryKcal = function (kcal) {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
  };
  // tribute week tracking: record (linkId, week) when a week becomes current
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
  // rot: classify at sweep time by foodState — preserved/rendered keep,
  // everything else rots fresh (matches diag-kcal-r8-20261012)
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
  const { Game } = await loadGame({ seed, mode: 'prodthrottle-' + pid, fullTelemetry: false });
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
  // end-state arrears (subordinate links where we pay)
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    for (const l of links) {
      if (l && l.status === 'active' && l.subordinate === 'home' && (l.arrears || 0) > 0) {
        W.arrearsEnd += (l.arrears || 0);
        W.arrearsLinks++;
      }
    }
  } catch (e) {}
  let hungry = 0, redirects = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { redirects = (Game.state.village || {}).throttleRedirects || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths, inBy: W.inBy, outBy: W.outBy,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    tributePaidKcal: Math.round(W.tributePaidKcal),
    tributeWeeks: Object.keys(W.tributeWeeks).length,
    arrearsEnd: Math.round(W.arrearsEnd), arrearsLinks: W.arrearsLinks,
    hungryDays: hungry, throttleRedirects: redirects,
  };
}

function aggregate(runs) {
  const rotFresh = runs.reduce((t, r) => t + r.rotFresh, 0);
  const rotPres = runs.reduce((t, r) => t + r.rotPreserved, 0);
  const rotShare = 100 * rotFresh / Math.max(1, rotFresh + rotPres);
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
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      tributeKcal: rs.reduce((t, r) => t + r.tributePaidKcal, 0),
      tributeWeeks: rs.reduce((t, r) => t + r.tributeWeeks, 0),
      arrearsEnd: rs.reduce((t, r) => t + r.arrearsEnd, 0),
      arrearsLinks: rs.reduce((t, r) => t + r.arrearsLinks, 0),
      redirects: rs.reduce((t, r) => t + (r.throttleRedirects || 0), 0),
    };
  }
  return {
    n: runs.length, rotFresh, rotPreserved: rotPres, rotSharePp: +rotShare.toFixed(1),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE (#69, 2026-10-14): the 2026-10-13 prodthrottle
// pilot silently ran policy-less because the unwrap bug left policy.daily
// undefined. SMOKE=1 runs a short live smoke per policy BEFORE any pilot
// spend and FAILS LOUDLY unless the policy is genuinely driving:
//   (1) policy.daily is a function after unwrap (both policies);
//   (2) the harness actually invokes policy.daily (meanPolicyCallsPerDay > 0);
//   (3) >=1 policy-origin deliberate act happens (a policy act key lands in
//       the pacing rows — policy isn't just present, it's DOING things).
// A policy-less suite would have policyCalls=0 and no policy: acts —
// the smoke turns that silence into a hard stop.
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
    const { Game } = await loadGame({ seed: 11, mode: 'prodthrottle-smoke-' + pid, fullTelemetry: false });
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
  const label = process.env.LEVER || 'prodthrottle';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k/${(r.rotPreserved / 1000).toFixed(0)}k hungry=${r.hungryDays} trib=${(r.tributePaidKcal / 1000).toFixed(1)}k/${r.tributeWeeks}w redir=${r.throttleRedirects}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotPreserved=${(agg.rotPreserved / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} maxWave=${b.maxWave} hungry=${b.hungryDays} trib=${(b.tributeKcal / 1000).toFixed(1)}k/${b.tributeWeeks}w arrears=${(b.arrearsEnd / 1000).toFixed(1)}k/${b.arrearsLinks} redir=${b.redirects}`);
  }
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, seeds, pids, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  // per-seed JSON (telemetry-check schema: national/table/wins/exiled as
  // top-level numbers; r20b convention)
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/${label}-${r.policy}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
        hungryDays: r.hungryDays, tributePaidKcal: r.tributePaidKcal,
        tributeWeeks: r.tributeWeeks, throttleRedirects: r.throttleRedirects,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { oneRun, aggregate };
