#!/usr/bin/env node
// scripts/measure-tribdisc-20261014.js — TRIBDISC arm pilot measurement
// (loop B, 2026-10-14, food-economy axis, claims the tribgate kill-side
// finding as its own arm).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14) — BINDING:
//   Road: 4 seeds (11/22/33/44) x leadfeast/belongfeast (FEASTSCALE_R13=1
//     substrate both sides), 180d death-aware, identical seeds control vs
//     armed. Control RE-MEASURED on current tip (tribgate-b numbers are
//     sanity check only).
//   Control: TRIBDISC unset (triblead/tribbelong wrappers, gate-off —
//     det-gate proved byte-identical to the parent policies).
//   Armed: TRIBDISC=1 (healthy-pantry early-in-full tribute verb; fragile
//     pantries stay on base-discipline timing; tribute verb only).
//   Det-gate: bit-identical rerun gate before trusting comparisons.
//   PRIMARY: armed tribute arrears notes <= control x 0.5 AND armed
//     (missed+thin) weeks <= control x 0.7 (identical seeds).
//   GUARDRAILS: starvation <= control+2; hungryDays <= control x 1.335
//     (noise bound); national >= control-2; median >= control-10d;
//     no new death mode.
//   GO on primary + all guardrails, else KILL per §14.
//
// Usage:
//   SMOKE=1 node scripts/measure-tribdisc-20261014.js
//   FEASTSCALE_R13=1 LEVER=tribdisc-baseline SEEDS="11,22,33,44" DAYS=180 \
//     OUT=/tmp/td-base.json PERSEED_DIR=evidence/2026-10-14/perseed-tribdisc-base \
//     node scripts/measure-tribdisc-20261014.js
//   FEASTSCALE_R13=1 TRIBDISC=1 LEVER=tribdisc-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('INFO-SKIP: FEASTSCALE_R13=1 required (the measured substrate)');
  process.exit(0);
}
const ARMED = process.env.TRIBDISC === '1';
const TD = require('./policies/tribdisc');
if (typeof TD.gateOn !== 'function') {
  console.log('INFO-SKIP: tribdisc layer absent (reverted per kill protocol); armed measurement unavailable post-kill');
  process.exit(0);
}
const FS = require('./policies/feastscale');
const POLICY_REGISTRY = {
  leadfeast: ARMED ? TD.triblead : FS.leadfeast,
  belongfeast: ARMED ? TD.tribbelong : FS.belongfeast,
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
    tributePaidKcal: 0, tributeWeeks: {}, tribPay: {}, starveDeaths: 0 };
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { if (kcal > 0) W.inBy[name || '?'] = (W.inBy[name || '?'] || 0) + kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
  const oPay = Game.payTribute;
  if (typeof oPay === 'function') Game.payTribute = function (linkId, kcal) {
    const r = oPay.apply(this, arguments);
    try {
      const wk = typeof this._week === 'function' ? this._week() : 0;
      W.tributePaidKcal += (r || 0);
      const links = typeof this.hierarchyState === 'function' ? this.hierarchyState() : [];
      const l = links.find(x => x && x.id === linkId);
      const key = linkId + ':' + wk;
      const rec = W.tribPay[key] || (W.tribPay[key] = { paid: 0, owed: (l && l.tributeKcalPerWeek) || 0, full: false });
      rec.paid += (r || 0);
      if (l && l.tributePaidWeek === wk) { rec.full = true; W.tributeWeeks[key] = 1; }
    } catch (e) {}
    return r;
  };
  // rot: classify at sweep time by foodState; attribute to the current day
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

// paid/thin/missed per (link, week) from link histories + instrumented pays.
function tributeClass(Game, W) {
  const out = { full: 0, thin: 0, missed: 0, arrearsNotes: 0 };
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    const endDay = gday(Game);
    for (const link of links) {
      if (!link || link.subordinate !== 'haven') continue;
      let formedDay = 0, brokenDay = null;
      for (const h of (link.history || [])) {
        if (!h) continue;
        if (h.kind === 'formed' && typeof h.day === 'number') formedDay = h.day;
        if (h.kind === 'broken' && typeof h.day === 'number') brokenDay = h.day;
        if (h.kind === 'arrears') out.arrearsNotes++;
      }
      if (link.status === 'broken' && brokenDay === null) brokenDay = endDay;
      const lastDay = brokenDay !== null ? brokenDay : endDay;
      const startWeek = Math.floor(formedDay / 7) + 1; // first FULL week
      const endWeek = Math.floor(lastDay / 7);
      for (let wk = startWeek; wk <= endWeek; wk++) {
        const rec = W.tribPay[link.id + ':' + wk];
        if (rec && rec.full) out.full++;
        else if (rec && rec.paid > 0) out.thin++;
        else out.missed++;
      }
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'tribdisc-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  // capture the policy ctx (tribdisc verb counters)
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  const freshDaysSamples = [];
  let pantryPeak = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      try { const wu = G.unlockedWave ? G.unlockedWave() : 1; hist.maxWave = Math.max(hist.maxWave, wu || 1); } catch (e) {}
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
  let tdEarly = 0, tdEarlyKcal = 0, tdFragile = 0;
  try { if (runCtx) { tdEarly = runCtx.tdEarly || 0; tdEarlyKcal = runCtx.tdEarlyKcal || 0; tdFragile = runCtx.tdFragile || 0; } } catch (e) {}
  const trib = tributeClass(Game, W);
  const cliffDays = Object.keys(W.rotByDay).filter(d => W.rotByDay[d] > 10000).length;
  const cliffKcal = Object.values(W.rotByDay).filter(k => k > 10000).reduce((t, k) => t + k, 0);
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, wins: end.won ? 1 : 0, exiled,
    waveReach: Math.max(hist.maxWave, result.maxWaveUnlocked || 1),
    everW4: hist.maxWave >= 4 ? 1 : 0, everW5: hist.maxWave >= 5 ? 1 : 0,
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
    tribFull: trib.full, tribThin: trib.thin, tribMissed: trib.missed, tribArrearsNotes: trib.arrearsNotes,
    hungryDays: hungry, throttleRedirects: redirects,
    tdEarly, tdEarlyKcal: Math.round(tdEarlyKcal), tdFragile,
    freshDaysSamples, pantryPeak: Math.round(pantryPeak),
  };
}

function aggregate(runs) {
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const rotFresh = sum(r => r.rotFresh), rotPres = sum(r => r.rotPreserved);
  const rotShare = 100 * rotFresh / Math.max(1, rotFresh + rotPres);
  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const byPolicy = {};
  for (const pid of [...new Set(runs.map(r => r.policy))]) {
    const rs = runs.filter(r => r.policy === pid);
    const da = rs.map(r => r.days).sort((a, b) => a - b);
    const deaths = {};
    for (const r of rs) for (const k of Object.keys(r.deaths || {})) deaths[k] = (deaths[k] || 0) + r.deaths[k];
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: da.length ? da[Math.floor(da.length / 2)] : 0,
      maxDays: da.length ? da[da.length - 1] : 0,
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      everW4: rs.reduce((t, r) => t + r.everW4, 0),
      everW5: rs.reduce((t, r) => t + r.everW5, 0),
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      hungryDays: rs.reduce((t, r) => t + r.hungryDays, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      tributeKcal: rs.reduce((t, r) => t + r.tributePaidKcal, 0),
      tributeWeeks: rs.reduce((t, r) => t + r.tributeWeeks, 0),
      tribFull: rs.reduce((t, r) => t + r.tribFull, 0),
      tribThin: rs.reduce((t, r) => t + r.tribThin, 0),
      tribMissed: rs.reduce((t, r) => t + r.tribMissed, 0),
      tribArrearsNotes: rs.reduce((t, r) => t + r.tribArrearsNotes, 0),
      redirects: rs.reduce((t, r) => t + (r.throttleRedirects || 0), 0),
      tdEarly: rs.reduce((t, r) => t + r.tdEarly, 0),
      tdEarlyKcal: rs.reduce((t, r) => t + r.tdEarlyKcal, 0),
      tdFragile: rs.reduce((t, r) => t + r.tdFragile, 0),
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
      deaths,
    };
  }
  return {
    n: runs.length, rotFresh, rotPreserved: rotPres, rotSharePp: +rotShare.toFixed(1),
    medianDaysAll: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    byPolicy,
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive.
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
    if (ARMED) check(`[${pid}] tribdisc id`, /^trib/.test(base.id || ''), 'id=' + base.id);
    else check(`[${pid}] parent id (control)`, /^(leadfeast|belongfeast)$/.test(base.id || ''), 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'tribdisc-smoke-' + pid, fullTelemetry: false });
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
  const label = process.env.LEVER || (ARMED ? 'tribdisc-armed' : 'tribdisc-baseline');
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} hungry=${r.hungryDays} starve=${r.starveDeaths} trib=${r.tribFull}f/${r.tribThin}t/${r.tribMissed}m td=${r.tdEarly}e/${r.tdFragile}g rot=${(r.rotFresh / 1000).toFixed(0)}k`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll}`);
  for (const pid of pids) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} w4=${b.everW4} w5=${b.everW5} maxWave=${b.maxWave} hungry=${b.hungryDays} starve=${b.starveDeaths} trib=${b.tribFull}f/${b.tribThin}t/${b.tribMissed}m arrearsNotes=${b.tribArrearsNotes} td=${b.tdEarly}e/${b.tdFragile}g`);
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
        waveReach: r.waveReach, everW4: r.everW4, everW5: r.everW5, maxArc: r.maxArc, maxRank: r.maxRank,
        rotFresh: r.rotFresh, rotPreserved: r.rotPreserved,
        cliffDays: r.cliffDays, cliffKcal: r.cliffKcal,
        hungryDays: r.hungryDays, starveDeaths: r.starveDeaths,
        tributePaidKcal: r.tributePaidKcal, tributeWeeks: r.tributeWeeks,
        tribFull: r.tribFull, tribThin: r.tribThin, tribMissed: r.tribMissed, tribArrearsNotes: r.tribArrearsNotes,
        throttleRedirects: r.throttleRedirects,
        tdEarly: r.tdEarly, tdEarlyKcal: r.tdEarlyKcal, tdFragile: r.tdFragile,
        freshDaysSamples: r.freshDaysSamples, pantryPeak: r.pantryPeak,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
