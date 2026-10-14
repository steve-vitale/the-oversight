#!/usr/bin/env node
// scripts/measure-feasttable-20261014.js — feasttable arm pilot measurement
// (loop B, 2026-10-14, food-economy axis, sim-findings FEAST-AS-TABLE-DOOR
// claimed): the feast-as-table-door isolation.
//
// Pre-registered (evidence/2026-10-14/sim-feasttable-b.md, §§9-12, 14):
//   Control: base courtship policies (leadcourt/belongseek, FEASTTABLE
//     unset) — 0 scholar feasts by construction. Armed: belongtable/
//     leadtable (FEASTTABLE=1) — candidate-gated, floor-honored major
//     feasts only; no tribute/aid changes.
//   PRIMARY: table-reach rate armed >= control + 2/8, identical seeds.
//   GUARDRAILS: starvation <= control+2; hungryDays <= control x 1.335;
//     national >= control-2; no new death mode.
//   Seeds 11/22/33/44 x leadcourt/belongseek, 180d death-aware.
//   Det-gate 16/16 both sides before trusting comparisons
//   (scripts/det-gate-feasttable-20261014.js). SMOKE=1 honesty gate.
//
// Usage:
//   SMOKE=1 node scripts/measure-feasttable-20261014.js
//   FEASTTABLE=1 SMOKE=1 node scripts/measure-feasttable-20261014.js
//   LEVER=ft-control SEEDS="11,22,33,44" DAYS=180 \
//     OUT=evidence/2026-10-14/ft-control.json PERSEED_DIR=evidence/2026-10-14/perseed-ft-control \
//     node scripts/measure-feasttable-20261014.js
//   FEASTTABLE=1 LEVER=ft-armed ... (same)
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ARMED = process.env.FEASTTABLE === '1'; // armed = the feast-as-table-door layer is on

// Kill-protocol degradation (feastdoor/r15/overdraw3 precedent): if the layer
// file is deleted post-kill, an "armed" measurement would silently measure
// the base policies under an armed label — refuse loudly instead. The
// control path (FEASTTABLE unset) still measures the pristine courtship
// road honestly.
if (ARMED && typeof require('./policies/feasttable').ftOn !== 'function') {
  console.log('INFO-SKIP: feasttable layer reverted per kill protocol; armed measurement unavailable post-decision — see evidence/2026-10-14/sim-feasttable-b.md');
  process.exit(0);
}
const FT = require('./policies/feasttable');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const POLICY_REGISTRY = ARMED
  ? { leadcourt: FT.leadtable, belongseek: FT.belongtable }
  : { leadcourt, belongseek };
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
  const { Game } = await loadGame({ seed, mode: 'feasttable-' + pid, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const origSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (origSetup) return origSetup(G, ctx); };
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everSeat: 'none', everFoodDeeds: false };
  // traced deed path: feast -> rung -> seat
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
  let fsFeasts = 0, fsArmedFeasts = 0, ftGateHeld = 0;
  try {
    if (runCtx) {
      fsFeasts = runCtx.fsFeasts || 0;
      fsArmedFeasts = runCtx.fsArmedFeasts || 0;
      ftGateHeld = runCtx.ftGateHeld || 0;
    }
  } catch (e) {}
  // traced deed path: a feast fired, THEN the surge-use rung marked at/after
  // the first feast, THEN the seat reached at/after the rung. (sentimentTaught
  // is teaching-driven, not feast-ordered, so it is reported, not ordered.)
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
    fsFeasts, fsArmedFeasts, ftGateHeld,
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
    ftGateHeld: sum(r => r.ftGateHeld),
    standing: {
      total: med(arr(r => r.standing.total)), war: med(arr(r => r.standing.war)),
      diplomacy: med(arr(r => r.standing.diplomacy)), plenty: med(arr(r => r.standing.plenty)),
      maxTotal: Math.max.apply(null, arr(r => r.standing.total).concat([0])),
    },
    deaths: runs.reduce((t, r) => { for (const k of Object.keys(r.deaths || {})) t[k] = (t[k] || 0) + r.deaths[k]; return t; }, {}),
    perPid: Object.keys(byPid).map(pid => ({ pid, n: byPid[pid].length, national: sum(r => r.policy === pid ? r.national : 0), table: sum(r => r.policy === pid ? r.table : 0), foodDeeds: sum(r => r.policy === pid ? r.foodDeeds : 0), traced: sum(r => r.policy === pid ? r.traced : 0), fsFeasts: sum(r => r.policy === pid ? r.fsFeasts : 0), ftGateHeld: sum(r => r.policy === pid ? r.ftGateHeld : 0) })),
  };
}

// INSTRUMENT-HONESTY GATE: policies must genuinely drive, and the measured
// contrast must be the feast. Unwrap check + live smoke per policy +
// gate-contrast fixtures: on a 6.2d contribution-armed candidate fixture the
// CONTROL fires nothing (the isolation baseline) and the ARMED side FIRES;
// on a 3.9d fixture the armed side HOLDS.
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
    const wantId = ARMED ? pid.replace('leadcourt', 'leadtable').replace('belongseek', 'belongtable') : pid;
    check(`[${pid}] policy id`, (base.id || '') === wantId, 'id=' + base.id);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    let dailyCalls = 0;
    const policy = Object.assign({}, base, { daily(G, ctx) { dailyCalls++; return base.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'feasttable-smoke-' + pid, fullTelemetry: false });
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
  function freshItem(Game, kcal, daysLeft) {
    const day = (Game.state.scholar || {}).day || 1;
    return { name: 'Foraged food', kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
  }
  async function gateFixture(freshDaysTarget, seed) {
    const { Game } = await loadGame({ seed, mode: 'feasttable-smoke-fix' });
    await setupGame(Game);
    Game.say = () => {}; Game.feedback = function () {};
    Game.state.scholar.day = 30; Game.dayPart = 2;
    const v = Game.state.village;
    const burn = 2400;
    v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
    v.pantry = [freshItem(Game, Math.round(freshDaysTarget * burn), 3)];
    v.lastRaidDay = 0;
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const base = POLICY_REGISTRY.leadcourt;
    base.setup(Game, ctx);
    base.upkeep(Game, ctx);
    return ctx;
  }
  {
    const high = await gateFixture(6.2, 93);
    if (ARMED) {
      check('[gate] armed FIRES on the 6.2d candidate fixture', (high.fsFeasts || 0) === 1 && (high.ftGateHeld || 0) === 0,
        `fsFeasts=${high.fsFeasts} ftGateHeld=${high.ftGateHeld}`);
      const low = await gateFixture(3.9, 91);
      check('[gate] armed HOLDS on the 3.9d fixture', (low.fsFeasts || 0) === 0 && (low.ftGateHeld || 0) >= 1,
        `fsFeasts=${low.fsFeasts} ftGateHeld=${low.ftGateHeld}`);
    } else {
      check('[gate] control fires NOTHING on the 6.2d candidate fixture (isolation baseline)',
        (high.fsFeasts || 0) === 0, `fsFeasts=${high.fsFeasts}`);
    }
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, feast contrast live — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || (ARMED ? 'ft-armed' : 'ft-control');
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
    console.log(`   days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} seat=${r.everSeat} traced=${r.traced} foodDeeds=${r.foodDeeds} feastPath=${JSON.stringify(r.deedPath)} fsFeasts=${r.fsFeasts} ftGateHeld=${r.ftGateHeld} standing=${r.standing.total}(w${r.standing.war}/d${r.standing.diplomacy}/p${r.standing.plenty})`);
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
