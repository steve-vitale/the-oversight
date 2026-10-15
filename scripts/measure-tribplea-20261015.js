#!/usr/bin/env node
// scripts/measure-tribplea-20261015.js — TRIBPLEA arm pilot measurement
// (loop B, 2026-10-15, food-economy axis, claims sim-findings #258/#261).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14) — BINDING:
//   Road: 8 seeds (11/22/33/44/55/66/77/88) x belongseek ONLY (the plea is a
//     Haven-subordinate verb — belong-only by construction), 180d
//     death-aware, identical seeds control vs armed. Control RE-MEASURED on
//     current tip in THIS sweep (#247 — never inherit a baseline).
//   Control: TRIBPLEA unset (tribplea wrapper, gate-off — det-gate proved
//     byte-identical to the parent policy).
//   Armed: TRIBPLEA=1 (renegotiation plea via the EXISTING engine verb
//     Game.renegotiateLink — tribute *0.75 floor 500, trust -5 either way —
//     issued when the bond is in arrears AND (hungryStreak>=3 OR the
//     succession-grief window is open), gated age>=14d trust>=30).
//   Det-gate: bit-identical rerun gate before trusting comparisons.
//   PRIMARY: armed starvation deaths <= control AND armed hungryDays <=
//     control x 0.85 (identical seeds).
//   CO-PRIMARY: armed tribute arrears kcal posted <= control x 0.70.
//   GUARDRAILS: primary-link trust >= control-10; median survival >=
//     control-10d; national >= control-2/8; rot per-villager-day <= control x
//     1.335 (rotcal band); no new death mode (n>=3 per #216).
//   GO on primary + co-primary + all guardrails, else KILL per §14.
//
// Usage:
//   SMOKE=1 node scripts/measure-tribplea-20261015.js
//   LEVER=tribplea-baseline SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=/tmp/tp-base.json PERSEED_DIR=evidence/2026-10-15/perseed-tribplea-base \
//     node scripts/measure-tribplea-20261015.js
//   TRIBPLEA=1 LEVER=tribplea-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.TRIBPLEA === '1';
let TH;
try {
  TH = require('./policies/tribplea');
} catch (e) {
  console.log('INFO-SKIP: tribplea layer absent (deleted per kill protocol); armed measurement unavailable post-kill — see evidence/2026-10-15/sim-tribplea-b.md');
  process.exit(0);
}
const { belongseek } = require('./policies/belongseek');
const POLICY_REGISTRY = {
  belongseek: ARMED ? TH.tribplea : belongseek,
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
    tributePaidKcal: 0, tributeWeeks: {}, tribPay: {}, starveDeaths: 0,
    villDays: 0, sayRing: [], pleaLines: [] };
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (s) {
    try {
      const line = String(s);
      W.sayRing.push('d' + gday(Game) + ' ' + line);
      if (W.sayRing.length > 2000) W.sayRing.shift(); // ring buffer: keeps the tail
      if (/humbled itself|renegotiat|better terms|chewing on the last round|The ledger breathes/i.test(line))
        W.pleaLines.push('d' + gday(Game) + ' ' + line);
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
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
// Arrears kcal posted: parsed from the engine's 'Tribute short X/Y kcal'
// notes (hierarchy.js) — the shortfall posted that week, summed per side.
function tributeClass(Game, W) {
  const out = { full: 0, thin: 0, missed: 0, arrearsNotes: 0, arrearsKcal: 0 };
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
        if (h.kind === 'arrears') {
          out.arrearsNotes++;
          const m = /Tribute short ([\d,]+)\/([\d,]+) kcal/.exec(String(h.note || ''));
          if (m) {
            const paid = parseInt(m[1].replace(/,/g, ''), 10) || 0;
            const owed = parseInt(m[2].replace(/,/g, ''), 10) || 0;
            if (owed > paid) out.arrearsKcal += (owed - paid);
          }
        }
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
  const { Game } = await loadGame({ seed, mode: 'tribplea-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  // capture the policy ctx (tribstreak verb counters)
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
      try { W.villDays += ((G.state.village || {}).roster || []).length; } catch (e) {}
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
  let tpPlea = 0, tpPleaSuccess = 0, tpPleaFailed = 0;
  let tpHoldNoArrears = 0, tpHoldCrisis = 0, tpHoldLink = 0, tpHoldTable = 0, tpHoldUnreadable = 0;
  try {
    if (runCtx) {
      tpPlea = runCtx.tpPlea || 0; tpPleaSuccess = runCtx.tpPleaSuccess || 0; tpPleaFailed = runCtx.tpPleaFailed || 0;
      tpHoldNoArrears = runCtx.tpHoldNoArrears || 0; tpHoldCrisis = runCtx.tpHoldCrisis || 0;
      tpHoldLink = runCtx.tpHoldLink || 0; tpHoldTable = runCtx.tpHoldTable || 0;
      tpHoldUnreadable = runCtx.tpHoldUnreadable || 0;
    }
  } catch (e) {}
  // primary-link trust at run end (guardrail) + active sub-link count
  let subTrust = null, subLinksActive = 0;
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    const act = links.filter(l => l && l.status === 'active' && l.subordinate === 'haven' && !l.kind);
    subLinksActive = act.length;
    if (act.length) subTrust = Math.round(act.reduce((s, l) => s + (l.trust | 0), 0) / act.length);
  } catch (e) {}
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
    tribFull: trib.full, tribThin: trib.thin, tribMissed: trib.missed,
    tribArrearsNotes: trib.arrearsNotes, tribArrearsKcal: Math.round(trib.arrearsKcal),
    hungryDays: hungry, throttleRedirects: redirects,
    tpPlea, tpPleaSuccess, tpPleaFailed,
    tpHoldNoArrears, tpHoldCrisis, tpHoldLink, tpHoldTable, tpHoldUnreadable,
    subTrust, subLinksActive, villDays: W.villDays || 0, pleaLines: (W.pleaLines || []).slice(0, 60),
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
      tribArrearsKcal: rs.reduce((t, r) => t + (r.tribArrearsKcal || 0), 0),
      redirects: rs.reduce((t, r) => t + (r.throttleRedirects || 0), 0),
      tpPlea: rs.reduce((t, r) => t + (r.tpPlea || 0), 0),
      tpPleaSuccess: rs.reduce((t, r) => t + (r.tpPleaSuccess || 0), 0),
      tpPleaFailed: rs.reduce((t, r) => t + (r.tpPleaFailed || 0), 0),
      tpHoldNoArrears: rs.reduce((t, r) => t + (r.tpHoldNoArrears || 0), 0),
      tpHoldCrisis: rs.reduce((t, r) => t + (r.tpHoldCrisis || 0), 0),
      tpHoldLink: rs.reduce((t, r) => t + (r.tpHoldLink || 0), 0),
      tpHoldTable: rs.reduce((t, r) => t + (r.tpHoldTable || 0), 0),
      tpHoldUnreadable: rs.reduce((t, r) => t + (r.tpHoldUnreadable || 0), 0),
      villDays: rs.reduce((t, r) => t + (r.villDays || 0), 0),
      rotPerVd: 0, // filled below
      subTrustMean: (() => { const ts = rs.map(r => r.subTrust).filter(x => x != null); return ts.length ? +(ts.reduce((a, b) => a + b, 0) / ts.length).toFixed(1) : null; })(),
      subTrustN: rs.filter(r => r.subTrust != null).length,
      cliffDays: rs.reduce((t, r) => t + r.cliffDays, 0),
      cliffKcal: rs.reduce((t, r) => t + r.cliffKcal, 0),
      pantryPeak: Math.max.apply(null, rs.map(r => r.pantryPeak).concat([0])),
      deaths,
    };
  }
  for (const pid of Object.keys(byPolicy)) {
    const b = byPolicy[pid];
    const rs = runs.filter(r => r.policy === pid);
    b.rotPerVd = b.villDays > 0 ? +(rs.reduce((t, r) => t + (r.rotFresh || 0), 0) / b.villDays).toFixed(1) : 0;
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
    if (ARMED) check(`[${pid}] tribplea id`, base.id === 'tribplea-20261015', 'id=' + base.id);
    else check(`[${pid}] parent id (control)`, base.id === 'belongseek', 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'tribplea-smoke-' + pid, fullTelemetry: false });
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
  const label = process.env.LEVER || (ARMED ? 'tribplea-armed' : 'tribplea-baseline');
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rank=${r.maxRank} hungry=${r.hungryDays} starve=${r.starveDeaths} trib=${r.tribFull}f/${r.tribThin}t/${r.tribMissed}m arrears=${(r.tribArrearsKcal / 1000).toFixed(1)}k plea=${r.tpPlea}s${r.tpPleaSuccess}/f${r.tpPleaFailed} trust=${r.subTrust} rot=${(r.rotFresh / 1000).toFixed(0)}k`);
  }
  const agg = aggregate(rows);
  console.log(`\n=== ${label} === n=${agg.n}`);
  console.log(`rotFresh=${(agg.rotFresh / 1000).toFixed(1)}k rotShare=${agg.rotSharePp}pp medianDays=${agg.medianDaysAll}`);
  for (const pid of Object.keys(agg.byPolicy)) {
    const b = agg.byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} nat=${b.national} tab=${b.table} w4=${b.everW4} w5=${b.everW5} maxWave=${b.maxWave} hungry=${b.hungryDays} starve=${b.starveDeaths} trib=${b.tribFull}f/${b.tribThin}t/${b.tribMissed}m arrearsNotes=${b.tribArrearsNotes} arrearsKcal=${(b.tribArrearsKcal / 1000).toFixed(1)}k plea=${b.tpPlea}s${b.tpPleaSuccess}/f${b.tpPleaFailed} holds=nA${b.tpHoldNoArrears}/c${b.tpHoldCrisis}/l${b.tpHoldLink}/t${b.tpHoldTable} trust=${b.subTrustMean}(n=${b.subTrustN}) rot/vd=${b.rotPerVd}`);
  }
  if (outFile) {
    fs.writeFileSync(outFile, JSON.stringify({ label, armed: ARMED, runs: rows, agg }, null, 1));
    console.error('wrote ' + rows.length + ' runs to ' + outFile);
  }
  const perSeedDir = process.env.PERSEED_DIR || null;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const r of rows) {
      fs.writeFileSync(perSeedDir + `/tribplea-${r.policy}-${r.seed}.json`, JSON.stringify({
        policy: r.policy, seed: r.seed, days: r.days, endReason: r.endReason,
        won: r.won, everW4: r.everW4, everW5: r.everW5, maxRank: r.maxRank, national: r.national,
        table: r.table, deaths: r.deaths, starveDeaths: r.starveDeaths,
        tribFull: r.tribFull, tribThin: r.tribThin, tribMissed: r.tribMissed,
        tribArrearsNotes: r.tribArrearsNotes, tribArrearsKcal: r.tribArrearsKcal, tributePaidKcal: r.tributePaidKcal,
        hungryDays: r.hungryDays, throttleRedirects: r.throttleRedirects,
        tpPlea: r.tpPlea, tpPleaSuccess: r.tpPleaSuccess, tpPleaFailed: r.tpPleaFailed,
        tpHoldNoArrears: r.tpHoldNoArrears, tpHoldCrisis: r.tpHoldCrisis, tpHoldLink: r.tpHoldLink,
        tpHoldTable: r.tpHoldTable, tpHoldUnreadable: r.tpHoldUnreadable,
        subTrust: r.subTrust, subLinksActive: r.subLinksActive, villDays: r.villDays,
        pleaLines: r.pleaLines,
        freshDaysSamples: r.freshDaysSamples, pantryPeak: r.pantryPeak,
      }, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
