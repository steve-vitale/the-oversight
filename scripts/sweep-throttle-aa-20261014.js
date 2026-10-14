#!/usr/bin/env node
// THROTTLE A/A REPEAT (fleshout-b, 2026-10-14).
//
// Variance calibration for the throttle-confirm NO-GO guardrails
// (evidence/2026-10-14/sim-throttleconfirm-b.md, metric review points 2, 3, 6).
// Runs the LANDED throttle (current tip, UNCHANGED) TWICE on the same seed
// set; the A/A delta distribution measures the suite's own noise floor, so
// guardrails can be variance-calibrated instead of hand-set.
//
// This sweep = one A-run. Run TWICE with AANAME=a and AANAME=b.
//   AANAME=a SEEDS="101,202,303,404,505,606,707,808" POLICIES="leadcourt,belongseek" \
//     DAYS=180 OUT=evidence/2026-10-14/throttle-aa-a.json \
//     PERSEED_DIR=evidence/2026-10-14/throttle-aa-perseed-a \
//     node scripts/sweep-throttle-aa-20261014.js
//
// INSTRUMENT-ONLY: no game-code changes. Same harness patterns as
// scripts/measure-prodthrottle-20261013.js (which is asserted SMOKE-green),
// plus per-run villager-days (denominator for the starvation-rate metric)
// and per-seed wall-clock (finding #109 perf logging).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  // UNWRAP FIX (#69): unwrap the named export or the suite silently runs policy-less.
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

// install per-run instruments (mirrors measure-prodthrottle-20261013.js)
function instrument(Game) {
  const W = { inBy: {}, outBy: {}, rotFresh: 0, rotPreserved: 0,
    tributePaidKcal: 0, tributeWeeks: {}, arrearsEnd: 0, arrearsLinks: 0 };
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
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') Game._removePantryKcal = function (kcal) {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
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

// villager-days from the harness pop samples ([day, rosterLen] every 10 days).
// Denominator-aware metric: starvation deaths per 100 villager-days.
function villagerDays(samples, days) {
  const pop = (samples && samples.pop) || [];
  let vd = 0;
  for (const [d, p] of pop) {
    const span = Math.min(10, Math.max(0, days - d));
    vd += span * (p || 0);
  }
  return Math.round(vd);
}

async function oneRun(seed, pid, days) {
  const t0 = Date.now();
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
  const vd = villagerDays(result.samples, result.days);
  const starveDeaths = Object.entries(deaths)
    .filter(([k]) => /starv|hunger|famine/i.test(k)).reduce((t, [, n]) => t + n, 0);
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    deaths,
    starveDeaths, villagerDays: vd,
    starvePer100vd: vd > 0 ? +(100 * starveDeaths / vd).toFixed(3) : 0,
    rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
    tributePaidKcal: Math.round(W.tributePaidKcal),
    tributeWeeks: Object.keys(W.tributeWeeks).length,
    arrearsEnd: Math.round(W.arrearsEnd), arrearsLinks: W.arrearsLinks,
    hungryDays: hungry, throttleRedirects: redirects,
    wallClockSec: +((Date.now() - t0) / 1000).toFixed(1),
  };
}

function aggregate(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const byPolicy = {};
  for (const pid of [...new Set(rows.map(r => r.policy))]) {
    const rs = rows.filter(r => r.policy === pid);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    byPolicy[pid] = {
      n: rs.length,
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      villagerDays: rs.reduce((t, r) => t + r.villagerDays, 0),
    };
  }
  return {
    n: rows.length,
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    totalStarve: rows.reduce((t, r) => t + r.starveDeaths, 0),
    totalVD: rows.reduce((t, r) => t + r.villagerDays, 0),
    rotFresh: rows.reduce((t, r) => t + r.rotFresh, 0),
    byPolicy,
  };
}

async function main() {
  const aa = process.env.AANAME || 'a';
  const label = 'throttle-aa-' + aa;
  const seeds = (process.env.SEEDS || '101,202,303,404,505,606,707,808').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const t0 = Date.now();
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} starve=${r.starveDeaths} vd=${r.villagerDays} rotF=${(r.rotFresh / 1000).toFixed(0)}k hungry=${r.hungryDays} redir=${r.throttleRedirects} wall=${r.wallClockSec}s`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n} medianDays=${agg.medianDaysAll} maxDays=${agg.maxDays}`);
  console.log(`starve=${agg.totalStarve} villagerDays=${agg.totalVD} (${(100 * agg.totalStarve / Math.max(1, agg.totalVD)).toFixed(2)}/100vd) rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k`);
  console.log(`wall total=${((Date.now() - t0) / 60000).toFixed(1)} min`);
  if (outFile) { fs.writeFileSync(outFile, JSON.stringify({ label, aa, seeds, pids, days, agg, rows, when: new Date().toISOString() }, null, 1)); console.error('wrote ' + outFile); }
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      const p = `${perSeedDir}/${label}-${r.policy}-s${r.seed}.json`;
      fs.writeFileSync(p, JSON.stringify({
        label, policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        waveReach: r.waveReach, maxArc: r.maxArc, maxRank: r.maxRank,
        starveDeaths: r.starveDeaths, villagerDays: r.villagerDays,
        starvePer100vd: r.starvePer100vd, deaths: r.deaths,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
        hungryDays: r.hungryDays, throttleRedirects: r.throttleRedirects,
        wallClockSec: r.wallClockSec,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { oneRun, villagerDays };
