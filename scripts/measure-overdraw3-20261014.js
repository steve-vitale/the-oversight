#!/usr/bin/env node
// scripts/measure-overdraw3-20261014.js — OVERDRAW3 arm pilot measurement
// (fleshout-b ARM 2, 2026-10-14, food-economy axis — sim-findings #199).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14):
//   Question: the R2 drawdown was KILLED because its aid/tribute verbs
//     drained the least-perishable end first (_removePantryKcal). This arm
//     routes every verb through pantryDraw's soonest-spoiling-first
//     ordering. Does the drawdown now cut absolute fresh-rot without
//     starving the village?
//   Road: 8 seeds (11/22/33/44 pilot) or 16 (full) x leadcourt/belongseek,
//     180d death-aware, identical seeds control vs armed. Control:
//     OVERDRAW3 unset (parent policies). Armed: OVERDRAW3=1 (overdraw3
//     layer: overlead/overbelong). Both sides run on current master WITH
//     the landed prodthrottle — the question is overdraw3's MARGINAL
//     drawdown on top of it.
//   Det-gate: bit-identical rerun gate before trusting comparisons
//     (scripts/det-gate-overdraw3-20261014.js).
//   PRIMARY: absolute fresh-rot kcal, armed <= 0.85 x control
//     (identical seeds; prodthrottle precedent).
//   GUARDRAILS: armed rot-per-villager-day <= control x 1.335 (r25b rotcal
//     A/A noise calibration); national >= control-2; median >= control-10d;
//     no new death mode.
//   SECONDARY: drawdown events (aid/feast/early-tribute counts + kcal),
//     fresh-days distribution, pantry peaks, overstock-cliff events
//     (>10k fresh-rot kcal in a single day), per-day rot.
//   GO on primary + all guardrails, else KILL per §14. The layer file is
//     DELETED on a kill; the proof, sweep, det-gate and sense scripts stay
//     as instruments.
//
// Usage:
//   SMOKE=1 node scripts/measure-overdraw3-20261014.js
//   LEVER=overdraw3-baseline SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=/tmp/os-base.json PERSEED_DIR=evidence/2026-10-14/perseed-overdraw3-base \
//     node scripts/measure-overdraw3-20261014.js
//   OVERDRAW3=1 LEVER=overdraw3-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.OVERDRAW3 === '1';
let OVERLAYER = null;
if (ARMED) {
  try { OVERLAYER = require('./policies/overdraw3'); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.log('INFO-SKIP: overdraw3 layer deleted per kill protocol (NO-GO at pilot); pilot data pre-kill in evidence/2026-10-14/sim-overdraw32-b.md');
      process.exit(0);
    }
    throw e;
  }
}
const POLICY_REGISTRY = ARMED ? {
  // UNWRAP: overdraw3 exports { overlead, overbelong } named objects.
  leadcourt: OVERLAYER.overlead,
  belongseek: OVERLAYER.overbelong,
} : {
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
  if (typeof oRem === 'function') Game._removePantryKcal = function (kcal) {
    const sink = sinkOverride || 'obligation';
    const r = oRem.apply(this, arguments);
    try { W.outBy[sink] = (W.outBy[sink] || 0) + (r || 0); } catch (e) {}
    return r;
  };
  // OVERDRAW3: the layer's verbs pre-draw through pantryDraw (fresh-first)
  // and only mirror _removePantryKcal for engine accounting. Attribute the
  // real pre-draw kcal to the sink the layer sets on Game.__od3Sink.
  const oDraw = Game.pantryDraw;
  if (typeof oDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    const r = oDraw.apply(this, arguments);
    try {
      const sink = Game.__od3Sink;
      if (sink && (r.taken || 0) > 0) W.outBy[sink] = (W.outBy[sink] || 0) + Math.round(r.taken);
    } catch (e) {}
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
  // rot: classify at sweep time by foodState; attribute to the current day
  // (overdraw3-cliff events = single days with >10k fresh rot).
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
  const { Game } = await loadGame({ seed, mode: 'overdraw3-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  // capture the policy ctx (overdraw3 verb counters + predation track)
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const freshDaysSamples = [];
  let pantryPeak = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
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
  // overdraw3 verb telemetry + gorge nights (guardrail)
  let osAid = 0, osAidKcal = 0, osFeasts = 0, osFeastKcal = 0, osTribute = 0, osTributeKcal = 0, osGateHeld = 0;
  let gorgeNights = 0, gorgeKcal = 0;
  try {
    if (runCtx) {
      osAid = runCtx.osAid || 0; osAidKcal = runCtx.osAidKcal || 0;
      osFeasts = runCtx.osFeasts || 0; osFeastKcal = runCtx.osFeastKcal || 0;
      osTribute = runCtx.osTribute || 0; osTributeKcal = runCtx.osTributeKcal || 0;
      osGateHeld = runCtx.osGateHeld || 0;
      const gns = (runCtx._predTrack || {}).gorgeNights || [];
      gorgeNights = gns.length;
      gorgeKcal = gns.reduce((t, g) => t + (g.totalGorged || 0), 0);
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
    cliffDays, cliffKcal: Math.round(cliffKcal),
    tributePaidKcal: Math.round(W.tributePaidKcal),
    tributeWeeks: Object.keys(W.tributeWeeks).length,
    hungryDays: hungry, throttleRedirects: redirects,
    osAid, osAidKcal: Math.round(osAidKcal), osFeasts, osFeastKcal: Math.round(osFeastKcal),
    osTribute, osTributeKcal: Math.round(osTributeKcal), osGateHeld,
    gorgeNights, gorgeKcal: Math.round(gorgeKcal),
    freshDaysSamples, pantryPeak: Math.round(pantryPeak),
  };
}

function aggregate(runs) {
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const rotFresh = sum(r => r.rotFresh), rotPres = sum(r => r.rotPreserved);
  const rotShare = 100 * rotFresh / Math.max(1, rotFresh + rotPres);
  const daysAlive = sum(r => r.days);
  const rotPerDayAlive = Math.round(rotFresh / Math.max(1, daysAlive));
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
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      rotPerDayAlive: Math.round(rs.reduce((t, r) => t + r.rotFresh, 0) / Math.max(1, rs.reduce((t, r) => t + r.days, 0))),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      gorgeNights: rs.reduce((t, r) => t + r.gorgeNights, 0),
      gorgeKcal: rs.reduce((t, r) => t + r.gorgeKcal, 0),
      tributeKcal: rs.reduce((t, r) => t + r.tributePaidKcal, 0),
      tributeWeeks: rs.reduce((t, r) => t + r.tributeWeeks, 0),
      redirects: rs.reduce((t, r) => t + (r.throttleRedirects || 0), 0),
      osAid: rs.reduce((t, r) => t + r.osAid, 0),
      osAidKcal: rs.reduce((t, r) => t + r.osAidKcal, 0),
      osFeasts: rs.reduce((t, r) => t + r.osFeasts, 0),
      osFeastKcal: rs.reduce((t, r) => t + r.osFeastKcal, 0),
      osTribute: rs.reduce((t, r) => t + r.osTribute, 0),
      osTributeKcal: rs.reduce((t, r) => t + r.osTributeKcal, 0),
      osGateHeld: rs.reduce((t, r) => t + r.osGateHeld, 0),
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
    };
  }
  return {
    n: runs.length, rotFresh, rotPreserved: rotPres, rotSharePp: +rotShare.toFixed(1),
    rotPerDayAlive,
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive (see
// measure-prodthrottle-20261013.js). Unwrap check + live smoke per policy.
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
    if (ARMED) check(`[${pid}] overdraw3 id`, /^over/.test(base.id || ''), 'id=' + base.id);
    else check(`[${pid}] parent id (control)`, /^(leadcourt|belongseek)$/.test(base.id || ''), 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'overdraw3-smoke-' + pid, fullTelemetry: false });
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
  const label = process.env.LEVER || (ARMED ? 'overdraw3-armed' : 'overdraw3-baseline');
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} rot=${(r.rotFresh / 1000).toFixed(0)}k/${(r.rotPreserved / 1000).toFixed(0)}k hungry=${r.hungryDays} os=${r.osAid}a/${r.osFeasts}f/${r.osTribute}t gorge=${r.gorgeNights}`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotPreserved=${(agg.rotPreserved / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} maxWave=${b.maxWave} hungry=${b.hungryDays} starve=${b.starveDeaths} gorge=${b.gorgeNights}/${(b.gorgeKcal / 1000).toFixed(0)}k os=${b.osAid}a/${b.osFeasts}f/${b.osTribute}t osKcal=${((b.osAidKcal + b.osFeastKcal + b.osTributeKcal) / 1000).toFixed(0)}k gateHeld=${b.osGateHeld} cliffs=${b.cliffDays}/${(b.cliffKcal / 1000).toFixed(0)}k peak=${(b.pantryPeak / 1000).toFixed(0)}k`);
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
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
        cliffDays: r.cliffDays, cliffKcal: r.cliffKcal,
        hungryDays: r.hungryDays, starveDeaths: r.starveDeaths,
        tributePaidKcal: r.tributePaidKcal, tributeWeeks: r.tributeWeeks,
        throttleRedirects: r.throttleRedirects,
        osAid: r.osAid, osAidKcal: r.osAidKcal, osFeasts: r.osFeasts, osFeastKcal: r.osFeastKcal,
        osTribute: r.osTribute, osTributeKcal: r.osTributeKcal, osGateHeld: r.osGateHeld,
        gorgeNights: r.gorgeNights, gorgeKcal: r.gorgeKcal,
        freshDaysSamples: r.freshDaysSamples, pantryPeak: r.pantryPeak,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
