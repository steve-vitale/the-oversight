#!/usr/bin/env node
// scripts/measure-feastexposure-20261015.js — feast fight-exposure gate arm
// pilot measurement (flesh-out loop A, 2026-10-15, scale-onramp axis).
//
// Pre-registered (evidence/2026-10-15/sim-feastexposure.md, §§9-12, 14):
//   Substrate (BOTH sides): belongfeast/leadfeast (FEASTSCALE_R13=1) —
//     candidate-gated, floor-honored feasts on the courtship road.
//   Control: FEASTEXPOSURE unset — the substrate road ungated (draws faced
//     unconditionally, the feasttable-b behavior).
//   Armed: FEASTEXPOSURE=1 — belongexposure/leadexposure: the
//     fight-exposure gate (face the feast draw only on favorable odds,
//     else the watch drives it off; per-window cap once the deed marks).
//   PRIMARY: armed table >= 3/16 (feasttable-b hit 5/16 ungated; the gate
//     must keep the door open), identical seeds.
//   GUARDRAILS: national >= control-2/16 (the killed harm, must not
//     recur); median >= control-10d; starvation/hungryDays within noise;
//     no new death mode (n>=3).
//   Seeds 11/22/33/44 x leadcourt/belongseek pilot (8/side); confirm
//     12-16/side (11/22/33/44/55/66/77/88) only on pilot GO. 180d
//     death-aware. Det-gate 16/16 both sides before trusting comparisons
//     (scripts/det-gate-feastexposure-20261015.js). SMOKE=1 honesty gate.
//
// Usage:
//   SMOKE=1 FEASTSCALE_R13=1 node scripts/measure-feastexposure-20261015.js
//   SMOKE=1 FEASTSCALE_R13=1 FEASTEXPOSURE=1 node scripts/measure-feastexposure-20261015.js
//   FEASTSCALE_R13=1 LEVER=fx-control SEEDS="11,22,33,44" DAYS=180 \
//     OUT=evidence/2026-10-15/fx-control.json PERSEED_DIR=evidence/2026-10-15/perseed-fx-control \
//     node scripts/measure-feastexposure-20261015.js
//   FEASTSCALE_R13=1 FEASTEXPOSURE=1 LEVER=fx-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.FEASTEXPOSURE === '1'; // armed = the fight-exposure gate is on

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('MEASURE STOP: FEASTSCALE_R13=1 is required — without the substrate both sides would silently measure the feastless courtship road.');
  process.exit(2);
}
// Kill-protocol degradation: if the layer file is deleted post-kill, an
// "armed" measurement would silently measure the substrate under an armed
// label — refuse loudly instead.
let FE;
try {
  FE = require('./policies/feastexposure');
} catch (e) {
  if (ARMED) {
    console.log('INFO-SKIP: feastexposure layer reverted per kill protocol; armed measurement unavailable post-decision — see evidence/2026-10-15/sim-feastexposure.md');
    process.exit(0);
  }
}
if (ARMED && (!FE || typeof FE.layerOn !== 'function')) {
  console.log('INFO-SKIP: feastexposure layer reverted per kill protocol; armed measurement unavailable post-decision — see evidence/2026-10-15/sim-feastexposure.md');
  process.exit(0);
}
const FS = require('./policies/feastscale');
const POLICY_REGISTRY = ARMED
  ? { leadcourt: FE.leadexposure, belongseek: FE.belongexposure }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
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

function waveLedger(Game) {
  try {
    return [1, 2, 3, 4].map(w => (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(w) | 0) : 0);
  } catch (e) { return [0, 0, 0, 0]; }
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'feastexposure-' + pid, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none', everFoodDeeds: false };
  const deedTrack = { firstFeastDay: -1, surgeUsedDay: -1, sentimentDay: -1, seatDay: -1, seat: 'none' };
  const bestWP = [0, 0, 0, 0];
  const freshDaysSamples = [];
  let pantryPeak = 0;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const d = gday(G);
      const ds = deedSnapshot(G);
      if (ds.foodDeeds) hist.everFoodDeeds = true;
      if (ds.seat && ds.seat !== 'none') {
        hist.everTable = true; hist.everSeat = ds.seat;
        if (deedTrack.seatDay < 0) { deedTrack.seatDay = d; deedTrack.seat = ds.seat; }
      }
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
        const wp = waveLedger(G);
        for (let i = 0; i < 4; i++) bestWP[i] = Math.max(bestWP[i], wp[i] || 0);
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
  let fsFeasts = 0, fsArmedFeasts = 0;
  let exposureAssessed = 0, exposureLeft = 0, exposureDriven = 0, exposureDrivenUsed = 0;
  try {
    if (runCtx) {
      fsFeasts = runCtx.fsFeasts || 0;
      fsArmedFeasts = runCtx.fsArmedFeasts || 0;
      exposureAssessed = runCtx.exposureAssessed || 0;
      exposureLeft = runCtx.exposureLeft || 0;
      exposureDriven = runCtx.exposureDriven || 0;
      exposureDrivenUsed = runCtx.exposureDrivenUsed || 0;
    }
  } catch (e) {}
  const traced = hist.everTable && deedTrack.firstFeastDay >= 0 &&
    deedTrack.surgeUsedDay >= deedTrack.firstFeastDay &&
    deedTrack.seatDay >= deedTrack.surgeUsedDay;
  return {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, exiled,
    waveReach: result.maxWaveUnlocked || 1,
    wave4: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    wave5: (result.maxWaveUnlocked || 1) >= 5 ? 1 : 0,
    bestWP,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || endDeeds.seat !== 'none') ? 1 : 0,
    seat: endDeeds.seat, everSeat: hist.everSeat,
    foodDeeds: hist.everFoodDeeds ? 1 : 0,
    sentimentTaught: endDeeds.sentimentTaught ? 1 : 0,
    feastSurgeUsed: endDeeds.feastSurgeUsed ? 1 : 0,
    traced: traced ? 1 : 0,
    deedPath: Object.assign({}, deedTrack),
    standing: endStanding,
    deaths, starveDeaths,
    hungryDays: hungry,
    fsFeasts, fsArmedFeasts,
    exposureAssessed, exposureLeft, exposureDriven, exposureDrivenUsed,
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
    foodDeeds: sum(r => r.foodDeeds), traced: sum(r => r.traced),
    seats: runs.map(r => `${r.policy}-s${r.seed}:${r.everSeat}${r.traced ? '(traced)' : '(untraced)'}`).filter(s => !/:none/.test(s)),
    wave4: sum(r => r.wave4), wave5: sum(r => r.wave5),
    maxWave: Math.max.apply(null, arr(r => r.waveReach).concat([1])),
    maxArc: Math.max.apply(null, arr(r => r.maxArc).concat([1])),
    starveDeaths: sum(r => r.starveDeaths), hungryDays: sum(r => r.hungryDays),
    fsFeasts: sum(r => r.fsFeasts), fsArmedFeasts: sum(r => r.fsArmedFeasts),
    exposureAssessed: sum(r => r.exposureAssessed), exposureLeft: sum(r => r.exposureLeft),
    exposureDriven: sum(r => r.exposureDriven), exposureDrivenUsed: sum(r => r.exposureDrivenUsed),
    standing: {
      total: med(arr(r => r.standing.total)), war: med(arr(r => r.standing.war)),
      diplomacy: med(arr(r => r.standing.diplomacy)), plenty: med(arr(r => r.standing.plenty)),
      maxTotal: Math.max.apply(null, arr(r => r.standing.total).concat([0])),
    },
    deaths: runs.reduce((t, r) => { for (const k of Object.keys(r.deaths || {})) t[k] = (t[k] || 0) + r.deaths[k]; return t; }, {}),
    perPid: Object.keys(byPid).map(pid => ({ pid, n: byPid[pid].length, national: sum(r => r.policy === pid ? r.national : 0), table: sum(r => r.policy === pid ? r.table : 0), foodDeeds: sum(r => r.policy === pid ? r.foodDeeds : 0), traced: sum(r => r.policy === pid ? r.traced : 0), fsFeasts: sum(r => r.policy === pid ? r.fsFeasts : 0), exposureDriven: sum(r => r.policy === pid ? r.exposureDriven : 0) })),
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive; the named export
// must unwrap (#69); the gate contrast must be live on a real draw
// fixture: on an unfavorable draw (unknown heckler, pessimistic prior)
// the ARMED side's gate drives it off (exposureDriven=1) while the CONTROL
// side never gates (exposureAssessed stays undefined — the road faces it
// ungated, exactly the feasttable-b behavior).
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
    const wantId = ARMED
      ? pid.replace('leadcourt', 'leadexposure').replace('belongseek', 'belongexposure')
      : pid.replace('leadcourt', 'leadfeast').replace('belongseek', 'belongfeast');
    check(`[${pid}] policy id`, (base.id || '') === wantId, 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'feastexposure-smoke-' + pid, fullTelemetry: false });
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
  // gate-contrast fixture: live feasted buff + unfavorable pending draw
  async function gateFixture() {
    const { Game } = await loadGame({ seed: 77, mode: 'feastexposure-smoke-fix' });
    await setupGame(Game);
    Game.say = () => {}; Game.feedback = function () {};
    const s = Game.state.scholar;
    s.day = 30; Game.dayPart = 3;
    s.health = 100; s.hp = 100;
    s.feastBuff = { untilDay: 32, untilPart: 0, used: false, mult: 1.5 };
    s.feastDraw = { monsterId: 'heckler', veteran: false, day: 30 }; // unknown -> pessimistic prior
    Game.pendingEncounter = true;
    Game.pendingMonsterId = 'heckler';
    const ctx = {};
    const base = POLICY_REGISTRY.leadcourt;
    if (base.setup) base.setup(Game, ctx);
    base.upkeep(Game, ctx);
    return ctx;
  }
  {
    const ctx = await gateFixture();
    if (ARMED) {
      check('[gate] armed DRIVES OFF the unfavorable draw (exposureDriven=1)',
        (ctx.exposureDriven || 0) === 1, `exposureDriven=${ctx.exposureDriven} assessed=${ctx.exposureAssessed}`);
    } else {
      check('[gate] control never gates (exposureAssessed stays undefined)',
        ctx.exposureAssessed === undefined, `exposureAssessed=${ctx.exposureAssessed}`);
    }
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, named exports unwrap, gate contrast live — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || (ARMED ? 'fx-armed' : 'fx-control');
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    console.log(`-- ${label} ${pid} seed ${seed} (${days}d) --`);
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    console.log(`   days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} seat=${r.everSeat} traced=${r.traced} foodDeeds=${r.foodDeeds} feastPath=${JSON.stringify(r.deedPath)} fsFeasts=${r.fsFeasts}/${r.fsArmedFeasts} exp=${r.exposureAssessed}(L${r.exposureLeft}/D${r.exposureDriven}/DU${r.exposureDrivenUsed}) standing=${r.standing.total}(w${r.standing.war}/d${r.standing.diplomacy}/p${r.standing.plenty})`);
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
