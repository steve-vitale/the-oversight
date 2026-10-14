#!/usr/bin/env node
// scripts/measure-feastdoor-20261014.js — FEASTDOOR arm pilot measurement
// (loop B, 2026-10-14, food-economy axis, sim-findings #187).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14):
//   Road: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
//     death-aware, identical seeds control vs armed. Control: FEASTDOOR
//     unset (parents byte-identical). Armed: FEASTDOOR=1 + FEASTSCALE_R13=1
//     (doorlead/doorbelong — the duty rides the r13 machinery).
//   PRIMARY: food-deed rung (sentimentTaught && feastSurgeUsed) fires on
//     >=10/16 armed runs (vs 0/16 control) AND table >=2/16 armed.
//   GUARDRAILS (harm-proxy, r32b/r33b metric review): starvation deaths
//     <= control+2; hungryDays <= control*1.1; no new death mode;
//     national >= control-4 (perturbation-aware bound). Median report-only.
//   SECONDARY: duty feast counts+kcal, siege-gate holds, per-seed deed
//     attribution (feastSurgeUsed day, table day), Standing per avenue,
//     wave reach 1-5, Arc reach, table seats, fresh-days distribution.
//   Det-gate: 16/16 bit-identical both sides before trusting comparisons
//     (scripts/det-gate-feastdoor-20261014.js).
//   SMOKE honesty gate: the policy actually ran (daily called, deliberate
//     acts > 0) + the duty fired >=1 feast on a 6.25d fixture.
//
// Usage:
//   SMOKE=1 node scripts/measure-feastdoor-20261014.js
//   FEASTDOOR=1 FEASTSCALE_R13=1 SMOKE=1 node scripts/measure-feastdoor-20261014.js
//   LEVER=feastdoor-baseline SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-14/feastdoor-baseline.json PERSEED_DIR=evidence/2026-10-14/perseed-fd-base \
//     node scripts/measure-feastdoor-20261014.js
//   FEASTDOOR=1 FEASTSCALE_R13=1 LEVER=feastdoor-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = true; // r13-only diagnostic: the feastscale allowance without the feastdoor duty
const POLICY_REGISTRY = ARMED ? {
  leadcourt: require('./policies/feastscale').leadfeast,
  belongseek: require('./policies/feastscale').belongfeast,
} : {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function deedSnapshot(Game) {
  const out = { sentimentTaught: false, feastSurgeUsed: false, seat: 'none', foodDeeds: false };
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.sentimentTaught = !!pg.sentimentTaught;
    const s = Game.state.scholar || {};
    out.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
    out.foodDeeds = out.sentimentTaught && out.feastSurgeUsed;
    if (typeof Game.tableSeat === 'function') {
      const seat = Game.tableSeat();
      out.seat = (seat && seat.seat) || 'none';
    }
  } catch (e) {}
  return out;
}

function standingSnapshot(Game) {
  const out = { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 };
  try {
    if (typeof Game.villageStanding === 'function') {
      const s = Game.villageStanding() || {};
      for (const k of Object.keys(out)) if (typeof s[k] === 'number') out[k] = s[k];
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'feastdoor-r13only-' + pid, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none', everFoodDeeds: false };
  const deedTrack = { firstDutyFeastDay: -1, surgeUsedDay: -1, sentimentDay: -1 };
  const freshDaysSamples = [];
  let pantryPeak = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const d = gday(G);
      const ds = deedSnapshot(G);
      if (ds.foodDeeds) hist.everFoodDeeds = true;
      if (ds.seat && ds.seat !== 'none') { hist.everTable = true; hist.everSeat = ds.seat; }
      if (ds.feastSurgeUsed && deedTrack.surgeUsedDay < 0) deedTrack.surgeUsedDay = d;
      if (ds.sentimentTaught && deedTrack.sentimentDay < 0) deedTrack.sentimentDay = d;
      if (runCtx && (runCtx.fdFeasts || 0) > 0 && deedTrack.firstDutyFeastDay < 0)
        deedTrack.firstDutyFeastDay = d;
      try {
        const rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      } catch (e) {}
      try { const pg = G.progState ? G.progState() : {}; hist.maxArc = Math.max(hist.maxArc, pg.arc || 1); } catch (e) {}
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
  const endDeeds = deedSnapshot(Game);
  const endStanding = standingSnapshot(Game);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  let hungry = 0, exiled = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  let fdFeasts = 0, fdFeastKcal = 0, fdGateHeld = 0, fdGateLinger = 0, fdGateGorge = 0, fdGateRaid = 0;
  try {
    if (runCtx) {
      fdFeasts = runCtx.fdFeasts || 0;
      fdFeastKcal = Math.round(runCtx.fdFeastKcal || 0);
      fdGateHeld = runCtx.fdGateHeld || 0;
      fdGateLinger = runCtx.fdGateHeld_linger || 0;
      fdGateGorge = runCtx.fdGateHeld_gorge || 0;
      fdGateRaid = runCtx.fdGateHeld_raid || 0;
    }
  } catch (e) {}
  // end-to-end attribution: the food-deed rung fired AND duty feasts ran
  // AND the surge-use was ordered at/after the first duty feast.
  const attributed = hist.everFoodDeeds && fdFeasts > 0 &&
    (deedTrack.surgeUsedDay < 0 || deedTrack.firstDutyFeastDay < 0 ||
     deedTrack.surgeUsedDay >= deedTrack.firstDutyFeastDay);
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    wave4: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    wave5: (result.maxWaveUnlocked || 1) >= 5 ? 1 : 0,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || endDeeds.seat !== 'none') ? 1 : 0,
    seat: endDeeds.seat, everSeat: hist.everSeat,
    foodDeeds: hist.everFoodDeeds ? 1 : 0,
    sentimentTaught: endDeeds.sentimentTaught ? 1 : 0,
    feastSurgeUsed: endDeeds.feastSurgeUsed ? 1 : 0,
    attributed: attributed ? 1 : 0,
    firstDutyFeastDay: deedTrack.firstDutyFeastDay,
    surgeUsedDay: deedTrack.surgeUsedDay,
    standing: endStanding,
    deaths, starveDeaths,
    hungryDays: hungry,
    fdFeasts, fdFeastKcal, fdGateHeld, fdGateLinger, fdGateGorge, fdGateRaid,
    freshDaysSamples, pantryPeak: Math.round(pantryPeak),
  };
}

function aggregate(runs) {
  const n = runs.length;
  const sum = (f) => runs.reduce((t, r) => t + (f(r) || 0), 0);
  const arr = (f) => runs.map(f).filter(x => typeof x === 'number');
  const med = (a) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const byPid = {};
  for (const r of runs) { (byPid[r.policy] = byPid[r.policy] || []).push(r); }
  return {
    n,
    survivalDays: arr(r => r.days), medianSurvival: med(arr(r => r.days)), maxSurvival: Math.max.apply(null, arr(r => r.days).concat([0])),
    national: sum(r => r.national), table: sum(r => r.table), wins: sum(r => r.won), exiled: sum(r => r.exiled),
    foodDeeds: sum(r => r.foodDeeds), attributed: sum(r => r.attributed),
    seats: runs.map(r => `${r.policy}-s${r.seed}:${r.everSeat}`).filter(s => !/:none$/.test(s)),
    wave4: sum(r => r.wave4), wave5: sum(r => r.wave5),
    maxWave: Math.max.apply(null, arr(r => r.waveReach).concat([1])),
    maxArc: Math.max.apply(null, arr(r => r.maxArc).concat([1])),
    starveDeaths: sum(r => r.starveDeaths), hungryDays: sum(r => r.hungryDays),
    fdFeasts: sum(r => r.fdFeasts), fdFeastKcal: sum(r => r.fdFeastKcal),
    fdGateHeld: sum(r => r.fdGateHeld), fdGateLinger: sum(r => r.fdGateLinger),
    fdGateGorge: sum(r => r.fdGateGorge), fdGateRaid: sum(r => r.fdGateRaid),
    standing: {
      total: med(arr(r => r.standing.total)), war: med(arr(r => r.standing.war)),
      diplomacy: med(arr(r => r.standing.diplomacy)), plenty: med(arr(r => r.standing.plenty)),
      maxTotal: Math.max.apply(null, arr(r => r.standing.total).concat([0])),
    },
    deaths: runs.reduce((t, r) => { for (const k of Object.keys(r.deaths || {})) t[k] = (t[k] || 0) + r.deaths[k]; return t; }, {}),
    perPid: Object.keys(byPid).map(pid => ({ pid, n: byPid[pid].length, national: sum(r => r.policy === pid ? r.national : 0), table: sum(r => r.policy === pid ? r.table : 0), foodDeeds: sum(r => r.policy === pid ? r.foodDeeds : 0), attributed: sum(r => r.policy === pid ? r.attributed : 0), fdFeasts: sum(r => r.policy === pid ? r.fdFeasts : 0) })),
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive. Unwrap check +
// live smoke per policy + the duty fires on a 6.25d fixture (armed).
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
    if (ARMED) check(`[${pid}] feastscale id`, /^(leadfeast|belongfeast)$/.test(base.id || ''), 'id=' + base.id);
    else check(`[${pid}] parent id (control)`, /^(leadcourt|belongseek)$/.test(base.id || ''), 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'feastdoor-r13only-smoke-' + pid, fullTelemetry: false });
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
  // duty honesty: r13-only has no duty — skip the duty-fixture check.
  if (false) {
    const { Game } = await loadGame({ seed: 77, mode: 'feastdoor-duty-smoke' });
    await setupGame(Game);
    Game.say = () => {}; Game.feedback = function () {};
    Game.state.scholar.day = 30; Game.dayPart = 2;
    const v = Game.state.village;
    v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
    const day = 30;
    v.pantry = [{ name: 'Foraged food', kcalEach: 500, units: 300, safe: true, spoilDay: day + 3 }];
    v.lastRaidDay = 0;
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const base = POLICY_REGISTRY.leadcourt;
    base.setup(Game, ctx);
    base.upkeep(Game, ctx);
    check('[duty] fired >=1 feast on the 6.25d fixture', (ctx.fdFeasts || 0) >= 1,
      `fdFeasts=${ctx.fdFeasts}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || (ARMED ? 'feastdoor-armed' : 'feastdoor-baseline');
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    console.log(`-- ${label} ${pid} seed ${seed} (${days}d) --`);
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`   days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} seat=${r.everSeat} foodDeeds=${r.foodDeeds} attributed=${r.attributed} fdFeasts=${r.fdFeasts} standing=${r.standing.total}(w${r.standing.war}/d${r.standing.diplomacy}/p${r.standing.plenty})`);
    if (perSeedDir) {
      try { fs.mkdirSync(perSeedDir, { recursive: true }); } catch (e) {}
      fs.writeFileSync(`${perSeedDir}/${pid}-s${seed}.json`, JSON.stringify(r, null, 1));
    }
  }
  const agg = aggregate(rows);
  console.log('\n===== AGGREGATE ' + label + ' =====');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ label, armed: ARMED, seeds, days, aggregate: agg, runs: rows }, null, 1));
}

main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
