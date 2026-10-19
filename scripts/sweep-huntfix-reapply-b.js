#!/usr/bin/env node
// scripts/sweep-huntfix-reapply-b.js — PILOT sweep for the engine-side
// hunt-detector wiring fix (sim-huntfix-reapply-b; re-apply of the killed
// sim-huntfix-b fix with the REVISED metric; findings #492/#535 lineage,
// huntroster-b named fix spec option 1).
//
// The wiring fix (huntTier data + two detector reads) only has behavioral
// effect where the hunt path is exercised. Both arms run the huntstaff
// staffing layer (HUNTSTAFF_LAYER=1 -> HUNTSTAFF=1 in-process): the control
// arm is the PRISTINE substrate (run with SWEEPROOT pointed at the control
// tree, same commit, no wiring fix), the armed arm runs with the fix.
// The ONLY code difference between arms is the wiring fix itself.
//
// Det-gate mode: HUNTSTAFF_LAYER=0 — with the staffing layer off, the hunt
// path is unreachable on bot policies (no assignments, no task-lead hunts),
// so control/armed per-seed JSONs must be byte-identical.
//
// PRE-REGISTRATION (binding; evidence/2026-10-19/sim-huntfix-reapply-b.md):
//   PRIMARY: staffing-channel hunt kcal/run — armed >= 1.15x control AND
//     absolute >= 10,000 kcal/run (both must hold).
//   GUARDRAILS: starvation deaths <= control+1 (paired per run); median
//     survival no worse than -10d; no new death mode (revised >=2-event
//     rule); wave-4 unlocks within +/-2/16 (report-only).
//   WATCH (not a kill gate): task-lead hunt kcal — the fix amplifies
//     task-lead jackpots ~1.4x per kill via eff (BEAR.md portion-law
//     bypass is backlog #643, Steve's design call PENDING). Measure both
//     channels, report the amplification honestly, never re-score on it.
//
// CHANNEL ATTRIBUTION: each villagerHuntResolve is attributed at resolve
// time by lead identity — vid === taskLeads.hunt -> task-lead channel;
// otherwise -> staffing channel. The killed run's total huntKcal made the
// ratio meaningless (task-lead jackpots dominated both arms); the staffing
// channel isolates what the wiring fix actually changes (competence of
// staffed hunters via the layer's assignBest ordering + the +20% stalk
// bonus on tier-1.4 staff).
//
// PRE-REGISTRATION (binding; evidence/2026-10-19/sim-huntfix-reapply-b.md):
//   PRIMARY: staffing-channel hunt kcal/run — armed >= 1.15x control AND
//     absolute >= 10,000 kcal/run (both must hold).
//   GUARDRAILS: starvation deaths <= control+1 (paired per run); median
//     survival no worse than -10d; no new death mode (revised >=2-event
//     rule); wave-4 unlocks within +/-2/16 (report-only).
//   WATCH: task-lead hunt kcal secondary (BEAR.md portion-law bypass,
//     backlog #643 — measure, report honestly, never re-score).
//   WALL (report): national/table/wins, wave 4-5 unlocks, median survival.
//
// DEATH INSTRUMENT (findings #517/#525, from b4): every tele('death')
// captures `kind`; villager counts filter kind person/villager only;
// dedup on (who,day,cause).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 HUNTSTAFF_LAYER=1 node scripts/sweep-huntfix-b.js
//   SWEEPROOT=<control-tree> ARMS=control OUT=<dir> ...   # control arm
//   SWEEPROOT=<this-tree>    ARMS=armed   OUT=<dir> ...   # armed arm
// Targeted: SEEDS="9501" POLICIES="leadfeast" ARMS="armed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sweep-huntfix-b.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.env.SWEEPROOT || path.join(__dirname, '..');

let HS;
try {
  HS = require(path.join(ROOT, 'scripts/policies/huntstaff'));
} catch (e) {
  console.log('INFO-SKIP: huntstaff policy absent at ' + ROOT + ' — sweep not run.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts/sim-harness'));
const { leadfeast, belongfeast } = require(path.join(ROOT, 'scripts/policies/feastscale'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [31601, 31602, 31603, 31604, 31605, 31606, 31607, 31608]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-huntfix-reapply-b');
const VERBOSE = process.env.VERBOSE === '1';
const LAYER = process.env.HUNTSTAFF_LAYER === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RUN_ID = process.env.RUN_ID || 'fleshout-loop-b-20261019T1530Z';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

// Hunter-substrate check (policy-side word list — identical in both trees,
// so the classification is arm-neutral).
function hunterOccOf(Game, who) {
  try {
    const p = Game.getPerson ? Game.getPerson(who) : null;
    const occ = String((p && p.formerOccupation) || '').toLowerCase();
    const match = HS.HUNTER_WORDS.some(w => occ.includes(w));
    return { occ: (p && p.formerOccupation) || '', name: (p && p.name) || who, match };
  } catch (e) { return { occ: '', name: who, match: false }; }
}

let rootHead = 'unknown';
try { rootHead = require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) {}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = LAYER ? HS.withHuntStaff(base, policyId + '+huntstaff', 'sweep') : base;
  if (LAYER) process.env.HUNTSTAFF = '1'; else delete process.env.HUNTSTAFF;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = {
    deaths: [], errors: 0,
    huntAssignAttempts: 0, huntResolves: 0, huntKcal: 0, huntKills: 0,
    staffingHuntResolves: 0, staffingHuntKcal: 0, staffingHuntKills: 0,
    taskLeadHuntResolves: 0, taskLeadHuntKcal: 0, taskLeadHuntKills: 0,
    villageLostDay: null,
  };
  try {
    const oAssign = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      try { if (task === 'hunt') t.huntAssignAttempts++; } catch (e) { t.errors++; }
      return oAssign.apply(this, arguments);
    };
    const oHunt = Game.villagerHuntResolve.bind(Game);
    Game.villagerHuntResolve = function (vid, eff) {
      // CHANNEL ATTRIBUTION (revised metric, re-apply run): attribute at
      // resolve time by hunt-domain lead identity. Task-lead hunts run the
      // lead's domain (resolveAssignments -> resolveOneAssignment(leadVid));
      // everything else is the staffing channel. Identical rule in both
      // arms — the comparison is honest.
      let isLead = false;
      try {
        const tl = (((Game.state || {}).village || {}).taskLeads) || {};
        isLead = tl.hunt != null && tl.hunt === vid;
      } catch (e) {}
      const r = oHunt.apply(this, arguments);
      try {
        const k = (r && typeof r.kcal === 'number') ? r.kcal : 0;
        t.huntResolves++;
        t.huntKcal += k;
        if (r && r.kcal > 0) t.huntKills++;
        if (isLead) {
          t.taskLeadHuntResolves++; t.taskLeadHuntKcal += k;
          if (r && r.kcal > 0) t.taskLeadHuntKills++;
        } else {
          t.staffingHuntResolves++; t.staffingHuntKcal += k;
          if (r && r.kcal > 0) t.staffingHuntKills++;
        }
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
  const taskLeadHuntDays = new Set();
  const oDaily = policy.daily;
  let huntAssignmentsFired = 0, runCtx = null;
  policy.daily = (G, ctx) => {
    try {
      runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0;
      // untouched-path premise lens: any day with a hunt taskLead.
      try {
        const tl = (((G.state || {}).village || {}).taskLeads) || {};
        for (const [task, leadVid] of Object.entries(tl)) {
          if (task === 'hunt' && leadVid) taskLeadHuntDays.add(gday(G));
        }
      } catch (e) { t.errors++; }
      if (t.villageLostDay == null) {
        try { if (G.villageLost) t.villageLostDay = gday(G); } catch (e) {}
      }
    } catch (e) { t.errors++; }
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
  const assignLog = (runCtx && runCtx._hsAssignLog) || [];
  const assignedVids = new Set(assignLog.map(a => a.vid));
  for (const d of t.deaths) d.assignedHunter = assignedVids.has(d.who);
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const isVillager = (d) => !d.player && (d.kind === 'person' || d.kind === 'villager');
  const causeCounts = {}, clsCounts = {}, hunterCauseCounts = {}, villCauseCounts = {};
  const seenPerson = new Set();
  let villagerDeathsDedup = 0, villagerStarvDeaths = 0;
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
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
  const out = {
    schema: 'huntfix-wall/1',
    runId: RUN_ID, rootHead,
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
    huntDutyLog: assignLog,
    huntAssignmentsFired,
    huntAssignAttempts: t.huntAssignAttempts,
    huntResolves: t.huntResolves,
    huntKcal: t.huntKcal,
    huntKills: t.huntKills,
    staffingHuntResolves: t.staffingHuntResolves,
    staffingHuntKcal: t.staffingHuntKcal,
    staffingHuntKills: t.staffingHuntKills,
    taskLeadHuntResolves: t.taskLeadHuntResolves,
    taskLeadHuntKcal: t.taskLeadHuntKcal,
    taskLeadHuntKills: t.taskLeadHuntKills,
    huntTaskLeadDays: taskLeadHuntDays.size,
    villageLostDay: t.villageLostDay,
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} huntRes=${out.huntResolves} huntKcal=${out.huntKcal} staffKcal=${out.staffingHuntKcal}(${out.staffingHuntResolves}) leadKcal=${out.taskLeadHuntKcal}(${out.taskLeadHuntResolves}) vDeaths=${villagerDeaths}(dedup ${villagerDeathsDedup}) vStarv=${villagerStarvDeaths} tlHunt=${out.huntTaskLeadDays} nat=${out.national} wave=${waveMax} err=${t.errors}`);
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
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.HUNTSTAFF;
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length, root: ROOT, rootHead }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
