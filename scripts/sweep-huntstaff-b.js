#!/usr/bin/env node
// scripts/sweep-huntstaff-b.js — PILOT sweep for the hunt-duty staffing layer (arm sim-huntstaff-b).
//
// 8 fresh seeds x {leadfeast,belongfeast} x {control,armed}, 180d death-aware,
// FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT. In-sweep control: identical seeds.
//
// Pre-registered (binding, evidence/2026-10-17/sim-huntstaff-b.md):
//   PRIMARY: hunt-duty assignments armed >= 8 across 16 armed runs AND
//     >= 4 of 8 seeds engage (>=1 assignment), vs control == 0.
//   GUARDRAILS (every-gate): starvation deaths armed <= control+2,
//     villager deaths armed <= control, no new death mode, det-gate
//     byte-identical gate-off, national >= control-2,
//     median survival >= control-10d.
//   A miss is NO-GO, never re-scored mid-run.
// Wall metrics: win rate, vesting/national reach, Arc reach, wave reach 1-5,
// four-realm formation, median/max survival, death-cause shares.
//
// Instruments (read-only wraps: zero RNG draws, zero state writes, zero
// src/js and zero scripts/policies changes; applied identically to all
// arms): assignTask attempts (hunt count), villagerHuntResolve (kcal +
// resolution count), death/eat telemetry.
// Per-seed panel JSONs (schema 'huntstaff-wall/1') for §15.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-huntstaff-b.js
// Targeted: SEEDS="7801" POLICIES="leadfeast" ARMS="armed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sweep-huntstaff-b.js
'use strict';
const fs = require('fs');
const path = require('path');
let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  // INFO-SKIP (kill protocol, sim-huntstaff-b NO-GO 2026-10-17): the layer
  // was deleted zero-trace per the killed-arm protocol
  // (evidence/2026-10-17/sim-huntstaff-b.md). This sweep is kept as the
  // instrument; it skips honestly instead of crashing. The re-run
  // (sim-huntstaff-b2) rebuilds the layer from the evidence spec.
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent (layer killed per sim-huntstaff-b verdict) — sweep not run.');
  process.exit(0);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7801, 7802, 7803, 7804, 7805, 7806, 7807, 7808]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntstaff');
const VERBOSE = process.env.VERBOSE === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = arm === 'armed' ? HS.withHuntStaff(base, policyId + '+huntstaff', 'sweep') : base;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = {
    deaths: [], errors: 0,
    huntAssignAttempts: 0, huntResolves: 0, huntKcal: 0, huntKills: 0,
  };
  // read-only instrument wraps (no RNG draws, no state writes)
  try {
    const oAssign = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      try { if (task === 'hunt') t.huntAssignAttempts++; } catch (e) { t.errors++; }
      return oAssign.apply(this, arguments);
    };
    const oHunt = Game.villagerHuntResolve.bind(Game);
    Game.villagerHuntResolve = function (vid, eff) {
      const r = oHunt.apply(this, arguments);
      try {
        t.huntResolves++;
        t.huntKcal += (r && typeof r.kcal === 'number') ? r.kcal : 0;
        if (r && r.kcal > 0) t.huntKills++;
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player), cls: deathClass(cause) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  let huntAssignmentsFired = 0;
  policy.daily = (G, ctx) => {
    try { huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) { t.errors++; }
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    try { huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) {}
    return r;
  };
  let result;
  if (VERBOSE) { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }
  else { await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }); }
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {};
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const villagerDeaths = t.deaths.filter(d => !d.player).length;
  const out = {
    schema: 'huntstaff-wall/1',
    runId: 'fleshout-b-20261017T1940Z',
    seed, policyId, arm, days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    starvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION').length,
    playerStarvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    playerDeaths: t.deaths.filter(d => d.player).length,
    villagerDeaths,
    causeCounts, clsCounts,
    huntAssignmentsFired,           // layer ctx telemetry (armed only)
    huntAssignAttempts: t.huntAssignAttempts, // instrument: every hunt assignTask
    huntResolves: t.huntResolves,   // instrument: villagerHuntResolve calls
    huntKcal: t.huntKcal,           // instrument: sum of hunt-return kcal
    huntKills: t.huntKills,         // instrument: resolves with kcal > 0
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} huntRes=${out.huntResolves} huntKcal=${out.huntKcal} starvD=${out.starvationDeaths} vDeaths=${villagerDeaths} nat=${out.national} wave=${waveMax} err=${t.errors}`);
  return out;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required EXPLICITLY.'); process.exit(2); }
  const all = [];
  for (const seed of SEEDS) {
    for (const p of POLICIES) {
      for (const a of ARMS) {
        if (a === 'armed') process.env.HUNTSTAFF = '1'; else delete process.env.HUNTSTAFF;
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.HUNTSTAFF;
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
