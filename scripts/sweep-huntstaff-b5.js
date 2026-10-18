#!/usr/bin/env node
// scripts/sweep-huntstaff-b5.js — bear/boar engagement measurement sweep
// (arm sim-huntstaff-b5, loop B, run fleshout-loop-b-20261018T1530Z).
//
// PRE-REGISTRATION (binding; evidence/2026-10-18/sim-huntstaff-b5.md):
//   QUESTION: with hunt duties staffed, do boar/bear enter the village's
//     kill orbit, and is bear-hunt engagement survivable?
//   PRIMARY (binding): hunt-duty boar+bear ENGAGEMENTS (duties resolving
//     with picked prey wild_boar or black_bear — kill or stalk-miss) >= 6
//     across the armed side. Control expected ~0 (measured, not gated).
//   ENGAGEMENT (kill-fast): hunt duties assigned >= 8 armed side.
//     If 0 duties assigned at pilot, KILL.
//   GUARDRAILS:
//     - Assigned-hunter deaths <= control+2 per-pair, WOUND-CHAIN
//       attribution (lesson #535: death within ~7d of a wounding hunt
//       resolve, fatal-condition onset after the wound, counts as
//       hunt-attributable even if the cause string says 'sickness').
//     - Median survival >= control-10d. No new death mode.
//     - det-gate byte-identical (gate-off vs base; armed+observation vs
//       armed — test-huntstaff-b5.js Part B).
//   HORIZON: 180d death-aware. SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0
//     EXPLICIT, mode leanwinter. SEEDS: 105101-105104 (killaudit clean
//     baseline) + 107201-107204 (fresh, verified zero evidence-usage).
//     2 policies x 2 arms x 8 seeds = 32 runs, own paired control.
//   A miss is NO-GO, never re-scored mid-run.
//
// DEATH INSTRUMENT (findings #517/#525): every tele('death') record
// captures `kind`; villager counts filter kind person/villager only;
// counts dedup on (who,day,cause).
// FINDING #528: per-day v.taskLeads snapshot alongside the assignTask wrap
// (engine hunt duties bypass assignTask).
//
// ENGAGEMENT INSTRUMENT (new this arm): scripts/policies/huntengage.js
// observeGame wraps villagerHuntResolve (records aid/kill/source for every
// resolve — the module OWNS the b2-b4 hunt totals too, so no double wrap)
// and hurtVillager (records 'hunting'-cause wounds for the wound-chain
// instrument). Read-only: zero RNG draws, zero Game state writes — the
// det-gate pins armed+observation byte-identical to armed. Installed on
// BOTH arms so control-side task-lead engagements are measured too.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-huntstaff-b5.js
// Targeted: SEEDS="105101" POLICIES="leadfeast" ARMS="armed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sweep-huntstaff-b5.js
'use strict';
const fs = require('fs');
const path = require('path');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer not rebuilt. Sweep not run.');
  process.exit(0);
}
let HE;
try {
  HE = require('./policies/huntengage');
} catch (e) {
  console.log('FAIL: scripts/policies/huntengage.js absent — the b5 engagement instrument is the arm.');
  process.exit(1);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [105101, 105102, 105103, 105104, 107201, 107202, 107203, 107204]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-huntstaff-b5');
const VERBOSE = process.env.VERBOSE === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RUN_ID = 'fleshout-loop-b-20261018T1530Z';

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
    huntAssignAttempts: 0,
    encounters: [],   // wild-encounter telemetry (b3/b4 continuity)
    leanDays: [],      // per-day {day, lean}
    taskLeadsDays: [], // finding #528: per-day v.taskLeads snapshot
    villageLostDay: null,
  };
  // Engagement + wound observation (huntengage.js OWNS the hunt totals —
  // no second villagerHuntResolve wrap). Read-only, no RNG, no state
  // writes; installed on BOTH arms (det-gate: armed+observation ≡ armed).
  try { HE.observeGame(Game, t); } catch (e) { t.errors++; }
  try {
    const oAssign = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      try { if (task === 'hunt') t.huntAssignAttempts++; } catch (e) { t.errors++; }
      return oAssign.apply(this, arguments);
    };
    const oEnc = Game.resolveWildMonsterEncounter.bind(Game);
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let day = 0, tx = null, ty = null, mid = null;
      try { day = gday(Game); tx = num(m && m.tx); ty = num(m && m.ty); mid = m && m.id; } catch (e) { t.errors++; }
      t.inWildEncounter = true;
      let r;
      try { r = oEnc.apply(this, arguments); }
      finally { t.inWildEncounter = false; }
      try {
        t.encounters.push({ day, tx, ty, monster: mid, vid, via: 'wild' });
      } catch (e) { t.errors++; }
      return r;
    };
    try {
      const oFF = Game.fieldFight.bind(Game);
      Game.fieldFight = function (vid, mdef, m, opts) {
        const r = oFF.apply(this, arguments);
        try {
          if (t.inWildEncounter) {
            t.encounters.push({
              day: gday(Game), tx: num(m && m.tx), ty: num(m && m.ty),
              monster: (mdef && mdef.id) || (m && m.id) || null,
              vid, via: 'wild-fight',
              allies: (opts && typeof opts.allies === 'number') ? opts.allies : null,
              allyVids: (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice(0, 4) : [],
              outcome: r && r.outcome, rounds: r && r.rounds, vTaken: r && r.vTaken,
            });
          }
        } catch (e) { t.errors++; }
        return r;
      };
    } catch (e) { t.errors++; }
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
            hunterOcc: ho.match,
            cause, kind: data && (data.kind == null ? null : String(data.kind)),
            player: !!(data && data.player), cls: deathClass(cause),
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
    try {
      runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0;
      t.leanDays.push({ day: gday(G), lean: !!HS.leanDay(G) });
      try {
        const tl = (((G.state || {}).village || {}).taskLeads) || {};
        t.taskLeadsDays.push({ day: gday(G), leads: Object.assign({}, tl) });
      } catch (e) { t.errors++; }
      if (t.villageLostDay == null) {
        try { if (G.villageLost) t.villageLostDay = gday(G); } catch (e) { /* not lost */ }
      }
    } catch (e) { t.errors++; }
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) { /* keep village */ }
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) { /* keep */ }
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) { /* keep */ }
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) { /* keep */ }
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    try { runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) { t.errors++; }
    return r;
  };
  let result;
  if (VERBOSE) { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }
  else { await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }); }
  // Hunter-fate instrument with lesson #535 WOUND-CHAIN attribution:
  // an assigned-hunter death within ~7d of a wounding hunt resolve counts
  // as hunt-attributable even when the cause string says 'sickness' (the
  // fatal condition's onset followed the wound).
  const assignLog = (runCtx && runCtx._hsAssignLog) || [];
  const assignedVids = new Set(assignLog.map(a => a.vid));
  for (const d of t.deaths) d.assignedHunter = assignedVids.has(d.who);
  const woundChain = (vid, dayDied) => (t.huntWounds || []).some(w =>
    w.vid === vid && dayDied - w.day > 0 && dayDied - w.day <= 7);
  const assignedHunterDeaths = assignLog.map(a => {
    const d = t.deaths.find(x => x.who === a.vid && (x.kind === 'person' || x.kind === 'villager' || x.player));
    if (!d) return { vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day, dayDied: null, cause: null, huntAttributable: false, woundChain: false };
    const regexAttr = /hunt/i.test(String(d.cause));
    const wc = woundChain(a.vid, d.day);
    return {
      vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day,
      dayDied: d.day, cause: d.cause,
      huntAttributableRegex: regexAttr, woundChain: wc,
      huntAttributable: regexAttr || wc,   // lesson #535
    };
  });
  const assignDays = [...new Set(assignLog.map(a => a.day))].sort((x, y) => x - y);
  const leanDayRows = t.leanDays.map(ld => ({ day: ld.day, lean: ld.lean, assigned: assignDays.includes(ld.day) }));
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const isVillager = (d) => !d.player && (d.kind === 'person' || d.kind === 'villager');
  const causeCounts = {}, clsCounts = {}, hunterCauseCounts = {}, villCauseCounts = {};
  const seenPerson = new Set();
  let villagerDeathsDedup = 0, villagerStarvDeaths = 0;
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (causeCounts[d.cls] || 0) + 1;
    if (d.hunterOcc && !d.player) hunterCauseCounts[k] = (hunterCauseCounts[k] || 0) + 1;
    if (isVillager(d)) {
      villCauseCounts[k] = (villCauseCounts[k] || 0) + 1;
      const dk = d.who + '|' + d.day + '|' + d.cause;
      if (!seenPerson.has(dk)) { seenPerson.add(dk); villagerDeathsDedup++; }
      if (d.cls === 'STARVATION') villagerStarvDeaths++;
    }
  }
  const villagerDeaths = t.deaths.filter(isVillager).length;
  const monsterKills = t.deaths.filter(d => d.kind === 'monster' || d.kind === 'animal').length;
  const bb = t.bbEngagements || [];
  const out = {
    schema: 'huntstaff-wall/5',
    runId: RUN_ID,
    seed, policyId, arm, days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    starvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION').length,
    villagerStarvationDeaths: villagerStarvDeaths,
    playerStarvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    playerDeaths: t.deaths.filter(d => d.player).length,
    villagerDeaths,
    villagerDeathsDedup,
    villagerCauseCounts: villCauseCounts,
    monsterKillsInDeathStream: monsterKills,
    causeCounts, clsCounts,
    hunterDeaths: t.deaths.filter(d => d.hunterOcc && !d.player).length,
    hunterCauseCounts,
    deaths: t.deaths,
    encounters: t.encounters,
    leanDayRows,
    huntDutyLog: assignLog,
    assignedHunterDeaths,
    huntAssignmentsFired,
    huntAssignAttempts: t.huntAssignAttempts,
    huntResolves: t.huntResolves || 0,
    huntKcal: t.huntKcal || 0,
    huntKills: t.huntKills || 0,
    // boar/bear engagement instrument (PRIMARY):
    bbEngagements: bb.length,
    bbKills: bb.filter(e => e.killed).length,
    bbEngageRows: bb,
    bbKcal: bb.filter(e => e.killed).reduce((s, e) => s + (e.kcal || 0), 0),
    huntWounds: t.huntWounds || [],
    taskLeadsDays: t.taskLeadsDays,
    villageLostDay: t.villageLostDay,
    instrumentErrors: (t.errors | 0) + (t.instrumentErrors | 0),
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} huntRes=${out.huntResolves} bbEng=${out.bbEngagements}(kills ${out.bbKills}) vDeaths=${villagerDeaths}(dedup ${villagerDeathsDedup}) mkStream=${monsterKills} vStarv=${villagerStarvDeaths} enc=${t.encounters.length} nat=${out.national} wave=${waveMax} err=${out.instrumentErrors}`);
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
