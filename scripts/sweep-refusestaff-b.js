#!/usr/bin/env node
// scripts/sweep-refusestaff-b.js — re-staffing repair measurement sweep
// (arm sim-refusestaff-b, loop B, run fleshout-loop-b-20261018T1653Z).
//
// POLICY-vs-POLICY on IDENTICAL seeds: the FIXED HUNTSTAFF layer
// (./policies/huntstaff — the sim-refusestaff-b repair: person-level HP
// gate + refuse re-assignment within 2d of a wounding resolve) vs the
// LANDED HUNTSTAFF layer (control — extracted from 259e30160, the
// sim-huntstaff-b4 GO commit; HUNTSTAFF=1 on BOTH arms).
//
// PRE-REGISTRATION (binding; evidence/2026-10-18/sim-refusestaff-b.md):
//   PRIMARY: re-staff-through-wounds events on the fixed side = 0/16 —
//     a re-staff within 2d of a wounding resolve (type A), or any
//     assignment when person-level health is declining (type B:
//     post-wound hp < 40 within 7d, map >= 40 — the mask case) —
//     while duty engagement (duties fired) >= control count.
//     GO at 8-seed pilot; then confirm 12-16. NO-GO = kill protocol
//     (revert the policy change, commit instruments + evidence).
//   GUARDRAILS: median survival >= control-10d; starvation deaths <=
//     control+2 (paired per seed x policy); no new death mode (dedup on
//     (who,day,cause), person-kind only, thirst/dehydration
//     canonicalized — #515/#517/#525/#544); wound-chain attribution
//     lens (#535): assigned-hunter death within 7d of a wounding
//     resolve where the fatal condition's onset followed the wound
//     counts as hunt-attributable.
//   HORIZON: 180d death-aware (+10d tail max). SUBSTRATE:
//     FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT, mode leanwinter.
//   SEEDS: 6201-6208 (6202 used 2026-10-13 by a journey-deepening run —
//     different substrate; paired design controls for seed effects).
//   2 policies x 2 arms x 8 seeds = 32 runs, own paired control.
//   A miss is NO-GO, never re-scored mid-run (§14).
//   §15: balanced panel via scripts/build-refusestaff-panels-b.js.
//
// DEATH INSTRUMENT (findings #517/#525): every tele('death') record
// captures `kind`; villager counts filter kind person/villager only;
// counts dedup on (who,day,cause). Thirst/dehydration canonicalized
// (#544). FINDING #528: per-day v.taskLeads snapshot alongside the
// assignTask wrap.
//
// WOUND INSTRUMENT: scripts/policies/huntengage.js observeGame wraps
// villagerHuntResolve + hurtVillager on BOTH arms (read-only, no RNG,
// no state writes; hpAfter added sim-refusestaff-b). The analyzer's
// re-staff events are computed from THIS independent instrument, not
// the layer's own ledger — no self-grading.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-refusestaff-b.js
// Targeted: SEEDS="6201" POLICIES="leadfeast" ARMS="fixed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sweep-refusestaff-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const CONTROL_SHA = '259e30160'; // sim-huntstaff-b4 GO — the landed layer

let HS_FIXED;
try {
  HS_FIXED = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer killed zero-trace. Sweep not run.');
  process.exit(0);
}
// The landed control, extracted from git (pinned sha) into tmp —
// never committed; the corpus records the sha.
function landedLayer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-landed-'));
  const f = path.join(dir, 'huntstaff-landed.js');
  const src = execSync(`git -C ${path.join(__dirname, '..')} show ${CONTROL_SHA}:scripts/policies/huntstaff.js`,
    { encoding: 'utf8', maxBuffer: 1 << 20 });
  fs.writeFileSync(f, src);
  return require(f);
}
const HS_LANDED = landedLayer();

let HE;
try {
  HE = require('./policies/huntengage');
} catch (e) {
  console.log('FAIL: scripts/policies/huntengage.js absent — the wound instrument is required.');
  process.exit(1);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [6201, 6202, 6203, 6204, 6205, 6206, 6207, 6208]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'fixed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-refusestaff-b');
const VERBOSE = process.env.VERBOSE === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RUN_ID = 'fleshout-loop-b-20261018T1653Z';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
const THIRST_RE = /thirst|dehydrat/i; // #544: canonicalize thirst-strings
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  if (THIRST_RE.test(c)) return 'THIRST';
  return 'OTHER';
}
function canonCause(cause) { // #544: 'thirst' and 'dehydration' are the same death
  const c = String(cause == null ? '' : cause);
  return THIRST_RE.test(c) ? 'thirst' : c;
}

function hunterOccOf(Game, HS, who) {
  try {
    const p = Game.getPerson ? Game.getPerson(who) : null;
    const occ = String((p && p.formerOccupation) || '').toLowerCase();
    const match = HS.HUNTER_WORDS.some(w => occ.includes(w));
    return { occ: (p && p.formerOccupation) || '', name: (p && p.name) || who, match };
  } catch (e) { return { occ: '', name: who, match: false }; }
}

async function oneRun(seed, policyId, arm) {
  const HS = arm === 'fixed' ? HS_FIXED : HS_LANDED;
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = HS.withHuntStaff(base, policyId + '+huntstaff', 'sweep');
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = {
    deaths: [], errors: 0,
    huntAssignAttempts: 0,
    encounters: [],
    leanDays: [],
    taskLeadsDays: [],
    villageLostDay: null,
  };
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
      try { t.encounters.push({ day, tx, ty, monster: mid, vid, via: 'wild' }); }
      catch (e) { t.errors++; }
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
          const ho = hunterOccOf(Game, HS, who);
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
  // as hunt-attributable even when the cause string says 'sickness'.
  const assignLog = (runCtx && runCtx._hsAssignLog) || [];
  const refusalLog = (runCtx && runCtx._hsRefusalLog) || [];
  const woundLog = (runCtx && runCtx._hsWoundLog) || []; // fixed side: the layer's own ledger
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
  // RE-STAFF-THROUGH-WOUNDS events (PRIMARY instrument) — computed from
  // the INDEPENDENT wound instrument (HE.observeGame), never from the
  // layer's own ledger (no self-grading):
  //   type A: assignment within 2d after a wounding hunt resolve.
  //   type B: assignment when person-level health is declining — a wound
  //     with post-wound hp < 40 within 7d, while the map read >= 40 at
  //     assign time (the mask case; the engine's own <40 gate guarantees
  //     the map side for every logged assignment).
  const wounds = t.huntWounds || [];
  const restaffEvents = [];
  for (const a of assignLog) {
    for (const w of wounds) {
      if (w.vid !== a.vid) continue;
      const dd = a.day - w.day;
      if (dd > 0 && dd <= 2) {
        restaffEvents.push({ type: 'A', vid: a.vid, name: a.name, dayAssigned: a.day, woundDay: w.day, woundDmg: w.dmg, woundHpAfter: w.hpAfter });
      } else if (dd > 2 && dd <= 7 && w.hpAfter != null && w.hpAfter < 40) {
        restaffEvents.push({ type: 'B', vid: a.vid, name: a.name, dayAssigned: a.day, woundDay: w.day, woundDmg: w.dmg, woundHpAfter: w.hpAfter });
      }
    }
  }
  const assignDays = [...new Set(assignLog.map(a => a.day))].sort((x, y) => x - y);
  const leanDayRows = t.leanDays.map(ld => ({ day: ld.day, lean: ld.lean, assigned: assignDays.includes(ld.day) }));
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const isVillager = (d) => !d.player && (d.kind === 'person' || d.kind === 'villager');
  const causeCounts = {}, clsCounts = {}, hunterCauseCounts = {}, villCauseCounts = {};
  const seenPerson = new Set();
  let villagerDeathsDedup = 0, villagerStarvDeaths = 0;
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : canonCause(d.cause); // #544 canonicalized
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
    if (d.hunterOcc && !d.player) hunterCauseCounts[k] = (hunterCauseCounts[k] || 0) + 1;
    if (isVillager(d)) {
      villCauseCounts[k] = (villCauseCounts[k] || 0) + 1;
      const dk = d.who + '|' + d.day + '|' + canonCause(d.cause);
      if (!seenPerson.has(dk)) { seenPerson.add(dk); villagerDeathsDedup++; }
      if (d.cls === 'STARVATION') villagerStarvDeaths++;
    }
  }
  const villagerDeaths = t.deaths.filter(isVillager).length;
  const monsterKills = t.deaths.filter(d => d.kind === 'monster' || d.kind === 'animal').length;
  const out = {
    schema: 'huntstaff-wall/6',
    runId: RUN_ID,
    controlLayerSha: arm === 'control' ? CONTROL_SHA : null,
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
    refusalLog,
    woundLedgerLog: woundLog,
    restaffEvents,
    restaffEventCount: restaffEvents.length,
    assignedHunterDeaths,
    huntAssignmentsFired,
    huntAssignAttempts: t.huntAssignAttempts,
    huntResolves: t.huntResolves || 0,
    huntKcal: t.huntKcal || 0,
    huntKills: t.huntKills || 0,
    huntWounds: wounds,
    taskLeadsDays: t.taskLeadsDays,
    villageLostDay: t.villageLostDay,
    instrumentErrors: (t.errors | 0) + (t.instrumentErrors | 0),
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} refusals=${refusalLog.length} restaff=${out.restaffEventCount} vDeaths=${villagerDeaths}(dedup ${villagerDeathsDedup}) vStarv=${villagerStarvDeaths} nat=${out.national} wave=${waveMax} err=${out.instrumentErrors}`);
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
        process.env.HUNTSTAFF = '1'; // BOTH arms are the layer — fixed vs landed
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.HUNTSTAFF;
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
