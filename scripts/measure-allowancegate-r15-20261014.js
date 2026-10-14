#!/usr/bin/env node
// scripts/measure-allowancegate-r15-20261014.js — ALLOWANCEGATE r15 pilot
// measurement (loop B, 2026-10-14, food-economy axis, sim-findings #187
// claimed: FEASTDOOR'S CALIBRATED PRICE next arm).
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9-12, 14):
//   Substrate: the shared r13-only baseline (8 seeds 11/22/33/44/55/66/77/88
//     x leadfeast/belongfeast, FEASTSCALE_R13=1, 180d death-aware). The
//     coordinator's sim-feastbase-b.json measured the PRISTINE substrate
//     instead (15/35/151 = the pristine fingerprint, feastSurgeUsed 0/16 —
//     FEASTSCALE_R13 was not set), so this sweep measures its own paired
//     r13-only control on identical seeds; the shared file is a cross-check
//     only. Judged against the paired control, never the shared file.
//   Road: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
//     death-aware, IDENTICAL seeds control vs armed. BOTH sides run the r13
//     feast layer (FEASTSCALE_R13=1). Control: ALLOWANCEGATE unset (the
//     r13-only allowance as measured). Armed: ALLOWANCEGATE=1 (the pantry-
//     state gate: the allowance may not fire when pantry fresh-days < 2;
//     suppressed feasts postpone, never displace).
//   PRIMARY: armed starvation deaths <= control - 5 AND armed hungryDays
//     <= control x 1.409 (the A/A noise-calibrated ceiling).
//   GUARDRAILS: national >= control - 4 (perturbation-aware); table >=
//     control - 2 (the price ceiling, inside the [1,2,3] noise band); no
//     new death mode; median report-only.
//   SECONDARY: allowance feast counts (fsFeasts, fsArmedFeasts), gate holds
//     (agGateHeld), per-seed deed attribution, Standing per avenue, wave
//     reach 1-5, Arc reach, table seats, fresh-days trajectory, death-cause
//     shares, exiled.
//   Det-gate: 16/16 bit-identical both sides before trusting comparisons
//     (scripts/det-gate-allowancegate-r15-20261014.js).
//   SMOKE honesty gate: the policy actually ran (daily called, deliberate
//     acts > 0) + gate-contrast fixtures (thin-fresh: control FIRES / armed
//     HOLDS; deep-fresh: both fire).
//
// Usage:
//   FEASTSCALE_R13=1 SMOKE=1 node scripts/measure-allowancegate-r15-20261014.js
//   FEASTSCALE_R13=1 ALLOWANCEGATE=1 SMOKE=1 node scripts/measure-allowancegate-r15-20261014.js
//   FEASTSCALE_R13=1 LEVER=ag15-control SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=evidence/2026-10-14/ag15-control.json PERSEED_DIR=evidence/2026-10-14/perseed-ag15-control \
//     node scripts/measure-allowancegate-r15-20261014.js
//   FEASTSCALE_R13=1 ALLOWANCEGATE=1 LEVER=ag15-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.ALLOWANCEGATE === '1'; // armed = the pantry-state gate is on

// Kill-protocol degradation: if the layer file was deleted post-kill, an
// "armed" measurement would silently measure the un-gated allowance under
// an armed label — refuse loudly instead. The control path still measures
// the r13-only substrate honestly.
let AG = null;
if (ARMED) {
  try { AG = require('./policies/allowancegate'); }
  catch (e) {
    console.log('INFO-SKIP: allowancegate layer absent (reverted per kill protocol); armed measurement unavailable post-kill — see evidence/2026-10-14/sim-allowancegate-b.md');
    process.exit(0);
  }
  if (typeof AG.gateOn !== 'function') {
    console.log('INFO-SKIP: allowancegate layer present but gateOn missing — refusing to measure under an armed label');
    process.exit(0);
  }
}
const FS = require('./policies/feastscale');
const POLICY_REGISTRY = ARMED
  ? { leadcourt: AG.leadgate, belongseek: AG.belonggate }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
// FEASTSCALE_R13=1 on BOTH sides; ALLOWANCEGATE=1 only when armed
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
  const { Game } = await loadGame({ seed, mode: 'allowancegate-r15-' + pid, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none', everFoodDeeds: false };
  const deedTrack = { firstFeastDay: -1, surgeUsedDay: -1, sentimentDay: -1 };
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
      if (runCtx && (runCtx.fsFeasts || 0) > 0 && deedTrack.firstFeastDay < 0)
        deedTrack.firstFeastDay = d;
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
  let fsFeasts = 0, fsArmedFeasts = 0, agGateHeld = 0;
  try {
    if (runCtx) {
      fsFeasts = runCtx.fsFeasts || 0;
      fsArmedFeasts = runCtx.fsArmedFeasts || 0;
      agGateHeld = runCtx.agGateHeld || 0;
    }
  } catch (e) {}
  const attributed = hist.everFoodDeeds && fsFeasts > 0 &&
    (deedTrack.surgeUsedDay < 0 || deedTrack.firstFeastDay < 0 ||
     deedTrack.surgeUsedDay >= deedTrack.firstFeastDay);
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
    firstFeastDay: deedTrack.firstFeastDay,
    surgeUsedDay: deedTrack.surgeUsedDay,
    standing: endStanding,
    deaths, starveDeaths,
    hungryDays: hungry,
    fsFeasts, fsArmedFeasts, agGateHeld,
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
    fsFeasts: sum(r => r.fsFeasts), fsArmedFeasts: sum(r => r.fsArmedFeasts),
    agGateHeld: sum(r => r.agGateHeld),
    standing: {
      total: med(arr(r => r.standing.total)), war: med(arr(r => r.standing.war)),
      diplomacy: med(arr(r => r.standing.diplomacy)), plenty: med(arr(r => r.standing.plenty)),
      maxTotal: Math.max.apply(null, arr(r => r.standing.total).concat([0])),
    },
    deaths: runs.reduce((t, r) => { for (const k of Object.keys(r.deaths || {})) t[k] = (t[k] || 0) + r.deaths[k]; return t; }, {}),
    perPid: Object.keys(byPid).map(pid => ({ pid, n: byPid[pid].length, national: sum(r => r.policy === pid ? r.national : 0), table: sum(r => r.policy === pid ? r.table : 0), foodDeeds: sum(r => r.policy === pid ? r.foodDeeds : 0), attributed: sum(r => r.policy === pid ? r.attributed : 0), fsFeasts: sum(r => r.policy === pid ? r.fsFeasts : 0), agGateHeld: sum(r => r.policy === pid ? r.agGateHeld : 0) })),
  };
}

// thin-fresh fixture: fresh-days ~1.67, total kcal deep via pemmican.
async function thinFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'ag15-smoke-fix' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30; Game.dayPart = 2;
  const v = Game.state.village, day = 30, burn = 2400;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [
    { name: 'Foraged food', kcalEach: 500, units: Math.ceil(1.5 * burn / 500), safe: true, spoilDay: day + 3 },
    { name: 'Pemmican bars', foodKind: 'pemmican', kcalEach: 500, units: 120, safe: true, spoilDay: day + 120 },
  ];
  v.lastRaidDay = 0;
  return Game;
}

// deep-fresh fixture: fresh-days ~6.2.
async function deepFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'ag15-smoke-fix' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30; Game.dayPart = 2;
  const v = Game.state.village, day = 30;
  let cost = 4800;
  try { cost = (Game.feastPlan() || {}).cost || 4800; } catch (e) {}
  const burn = Math.ceil(cost * 1.6 / 6.2);
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [{ name: 'Foraged food', kcalEach: 500, units: Math.ceil(6.2 * burn / 500), safe: true, spoilDay: day + 3 }];
  v.lastRaidDay = 0;
  return Game;
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive. Unwrap check +
// live smoke per policy + gate-contrast fixtures (thin-fresh: control
// FIRES / armed HOLDS; deep-fresh: both fire).
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
    check(`[${pid}] policy id`, /^(lead|belong)(feast|gate)$/.test(base.id || ''), 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'ag15-smoke-' + pid, fullTelemetry: false });
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
  // GATE CONTRAST HONESTY: thin-fresh -> control FIRES / armed HOLDS;
  // deep-fresh -> both fire.
  {
    const Game = await thinFixture(91);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const base = POLICY_REGISTRY.leadcourt;
    base.setup(Game, ctx);
    base.upkeep(Game, ctx);
    if (ARMED) {
      check('[gate] armed HOLDS on the thin-fresh fixture', (ctx.fsFeasts || 0) === 0 && (ctx.agGateHeld || 0) >= 1,
        `fsFeasts=${ctx.fsFeasts} agGateHeld=${ctx.agGateHeld}`);
    } else {
      check('[gate] control FIRES on the thin-fresh fixture', (ctx.fsFeasts || 0) === 1 && (ctx.agGateHeld || 0) === 0,
        `fsFeasts=${ctx.fsFeasts} agGateHeld=${ctx.agGateHeld}`);
    }
    const G2 = await deepFixture(93);
    const ctx2 = { _tribHist: [{ day: 29, kcal: 2000 }] };
    POLICY_REGISTRY.leadcourt.setup(G2, ctx2);
    POLICY_REGISTRY.leadcourt.upkeep(G2, ctx2);
    check('[gate] fires on the deep-fresh fixture (' + (ARMED ? 'armed' : 'control') + ')', (ctx2.fsFeasts || 0) === 1,
      `fsFeasts=${ctx2.fsFeasts}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || (ARMED ? 'ag15-armed' : 'ag15-control');
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
    console.log(`   days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} seat=${r.everSeat} foodDeeds=${r.foodDeeds} attributed=${r.attributed} fsFeasts=${r.fsFeasts} agGateHeld=${r.agGateHeld} starve=${r.starveDeaths} hungry=${r.hungryDays} standing=${r.standing.total}(w${r.standing.war}/d${r.standing.diplomacy}/p${r.standing.plenty})`);
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
