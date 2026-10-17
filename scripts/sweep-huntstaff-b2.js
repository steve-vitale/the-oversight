#!/usr/bin/env node
// scripts/sweep-huntstaff-b2.js — PILOT sweep for the REBUILT hunt-duty
// staffing layer (arm sim-huntstaff-b2, the §14 escape-hatch re-run of
// sim-huntstaff-b which was killed at pilot on a METRIC-BROKEN median
// gate — evidence/2026-10-17/sim-huntstaff-b.md).
//
// CORRECTED PRE-REGISTRATION (binding; evidence/2026-10-17/sim-huntstaff-b2.md):
//   PRIMARY: hunt-duty assignments armed >= 8 across 16 armed runs AND
//     >= 4 of 8 seeds engage (>=1 assignment), vs control == 0.
//   GUARDRAILS (every-gate): starvation deaths armed <= control+2,
//     villager deaths armed <= control, no new death mode, det-gate
//     byte-identical gate-off, national >= control-2,
//     |mean paired survival delta| <= 20d (NOISE-SCALED: the b pilot's
//     paired deltas spanned -69..+81d, mean -0.25d — the old +/-10d median
//     gate sat an order of magnitude below the substrate's combat-noise
//     band and false-fired on noise).
//   A miss is NO-GO, never re-scored mid-run.
// Wall metrics: win rate, vesting/national reach, Arc reach, wave reach 1-5,
// four-realm formation, median/max survival, death-cause shares.
//
// INSTRUMENTS (read-only wraps: zero RNG draws, zero state writes, zero
// src/js and zero scripts/policies changes; applied identically to all
// arms):
//   - assignTask attempts (hunt count), villagerHuntResolve (kcal +
//     resolution count), death/eat telemetry (as in the b sweep).
//   - HUNTER-FATE instrument (findings #508/#509): do hunters die faster —
//     exposure vs layer-pulling-defenders? Every death records the dead
//     villager's occupation and hunter-substrate flag (corrected word list);
//     armed runs record the full hunt-duty assignment log; the analyzer
//     compares hunter-occupation death rates armed vs control and classifies
//     assigned-hunter deaths (hunt-attributable vs ordinary combat).
// Per-seed panel JSONs (schema 'huntstaff-wall/2') for §15.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-huntstaff-b2.js
// Targeted: SEEDS="7811" POLICIES="leadfeast" ARMS="armed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sweep-huntstaff-b2.js
'use strict';
const fs = require('fs');
const path = require('path');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer not rebuilt yet. Sweep not run.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7811, 7812, 7813, 7814, 7815, 7816, 7817, 7818]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntstaff-b2');
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

// Hunter-substrate check for the FATE instrument: occupation word-list only
// (the eligibility gates HP/trust/free are point-in-time; a dead hunter is
// classified by background). Mirrors HS.isHunterSubstrate's word list.
function hunterOccOf(Game, who) {
  try {
    const p = Game.getPerson ? Game.getPerson(who) : null;
    const occ = String((p && p.formerOccupation) || '').toLowerCase();
    const match = HS.HUNTER_WORDS.some(w => occ.includes(w));
    return { occ: (p && p.formerOccupation) || '', name: (p && p.name) || who, match };
  } catch (e) { return { occ: '', name: who, match: false }; }
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
          const who = data && data.who;
          const ho = hunterOccOf(Game, who);
          t.deaths.push({
            day: gday(Game), who, name: ho.name, occ: ho.occ,
            hunterOcc: ho.match, // corrected word-list background
            cause, player: !!(data && data.player), cls: deathClass(cause),
          });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  let huntAssignmentsFired = 0, runCtx = null;
  policy.daily = (G, ctx) => {
    try { runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) { t.errors++; }
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
    try { runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) {}
    return r;
  };
  let result;
  if (VERBOSE) { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }
  else { await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }); }
  // Hunter-fate instrument: mark deaths of ever-assigned hunters.
  const assignLog = (runCtx && runCtx._hsAssignLog) || [];
  const assignedVids = new Set(assignLog.map(a => a.vid));
  for (const d of t.deaths) d.assignedHunter = assignedVids.has(d.who);
  const assignedHunterDeaths = assignLog.map(a => {
    const d = t.deaths.find(x => x.who === a.vid);
    return d ? { vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day, dayDied: d.day, cause: d.cause, huntAttributable: /hunt/i.test(String(d.cause)) }
             : { vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day, dayDied: null, cause: null, huntAttributable: false };
  });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {}, hunterCauseCounts = {};
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
    if (d.hunterOcc && !d.player) hunterCauseCounts[k] = (hunterCauseCounts[k] || 0) + 1;
  }
  const villagerDeaths = t.deaths.filter(d => !d.player).length;
  const out = {
    schema: 'huntstaff-wall/2',
    runId: 'fleshout-b-20261017T2130Z',
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
    hunterDeaths: t.deaths.filter(d => d.hunterOcc && !d.player).length,
    hunterCauseCounts,
    deaths: t.deaths,                       // enriched: name/occ/hunterOcc/assignedHunter
    huntDutyLog: assignLog,                 // armed: every accepted hunt-duty assignment
    assignedHunterDeaths,                   // hunter-fate instrument (#508/#509)
    huntAssignmentsFired,                   // layer ctx telemetry (armed only)
    huntAssignAttempts: t.huntAssignAttempts, // instrument: every hunt assignTask
    huntResolves: t.huntResolves,           // instrument: villagerHuntResolve calls
    huntKcal: t.huntKcal,                   // instrument: sum of hunt-return kcal
    huntKills: t.huntKills,                 // instrument: resolves with kcal > 0
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} huntRes=${out.huntResolves} huntKcal=${out.huntKcal} hunterD=${out.hunterDeaths} starvD=${out.starvationDeaths} vDeaths=${villagerDeaths} nat=${out.national} wave=${waveMax} err=${t.errors}`);
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
