#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R31 — SPECIALIST-STAFFING SIGNAL FOLLOW-UP (2026-10-24).
// Rotation index 1 (establishment). Base: master@1f24a4ef0.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §14 — a miss is NO-GO, never re-scored mid-run).
//   Question: r20 (2026-10-20) measured 0/61 cook-duty smoke events at
//     specialist rate — the ⭐ signal didn't exist; the r20 fix put
//     preserver-2+ at 1.3 natural on cook duty ("a natural — good pick").
//     On the current base, with the competent policy's own "staff the smoke
//     racks" rule PLUS a staffing-revisit rule (the honest competent-player
//     behavior r20's metric-review proposed: re-check cook staffing when a
//     better specialist frees up), does the division of knowledge route
//     specialists to the racks?
//   Interesting-finding bar: seed 82's Carlos the Fisherman (preserver 3)
//     getting the racks; any specialist-rate smoke events; the signal
//     existing but staffing equilibrium (fisher always fishing) keeping
//     the specialist away — either is an interesting, game-level finding.
//   Seeds: 61/82/103/124 (matched r15–r30). Horizon: 42d (+death-aware 10d
//     tail, same as r20 for M1/M2 comparability). Policy: competent PINNED,
//     landed env defaults (PLENTYDEPRI/DEPOSITGATE ON).
//   Binding metrics:
//     M1 (NPC processing exists): preserved kcal via cook-duty smoke branch
//       >0 on >=3/4 seeds (r20's M1 — machinery still fires on this base).
//     M2a (signal): every living preserver-2+ at day 35 has
//       villagerCompetence(vid,'cook') >= 1.3. GO if all such villagers on
//       >=3/4 seeds; NO-GO otherwise.
//     M2b (behavior): >=1 cook-duty smoke event staffed by a worker with
//       specialistSkill('preserver') >= 2. GO if >=2/4 seeds; NO-GO if 0/4;
//       1/4 = METRIC-REVIEW (the bar is directional for a 4-seed pilot).
//     M3 (food guardrail, r27 standing bar): zero leg-window (day>=15)
//       starvation/hunger/thirst deaths AND maxCrisisStreak < 3 (crisis day =
//       hungryStreak>=3 AND pantry+pack < alive*2000).
//     M4 (people): 8 held convos (2/seed: cook + best specialist), 0
//       senseless, 0 fabricated history, 0 null renders (hand sense-read).
//   Observed, non-binding: opportunity days (cook on duty blind while a
//     preserver-2+ lives on another task); plentydepri/depositgate ledgers;
//     pantry traces; restaff events; contest counts.
//   Guardrails: no softlock through d42 (+tail); wave-2 gate >= d8;
//     death-aware stop; pilot smoke.
// Usage: SEEDS=82 DAYS=42 node scripts/journey-establishment-r31-20261024.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const REVISIT_DAYS = [15, 20, 25, 30, 35];

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r31:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function packKcal(Game) {
  try {
    return (((Game.state.scholar || {}).inventory) || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryPreservedKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .filter(i => i && (i.foodState === 'preserved' || i.foodState === 'rendered'))
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryUnitAtom(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((m, i) => Math.max(m, (i.kcalEach || 0)), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
function specSkillOf(Game, vid, task) {
  try { return (Game.specialistSkill ? Game.specialistSkill(Game.getPerson(vid) || {}, task) : 0) || 0; }
  catch (e) { return 0; }
}
function competenceOf(Game, vid, task) {
  try { return (Game.villagerCompetence ? Game.villagerCompetence(vid, task) : 1.0) || 1.0; }
  catch (e) { return 1.0; }
}
function assignmentOf(Game, vid) {
  try { return ((Game.state.village || {}).assignments || {})[vid] || null; } catch (e) { return null; }
}
function freeVillagers(Game) {
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    return livingVids(Game).filter(id => id !== 'player' && !asg[id]);
  } catch (e) { return []; }
}
// Census: living villagers -> occupation + per-task skill + practice + competence.
function census(Game) {
  const out = [];
  for (const vid of livingVids(Game)) {
    let p = {};
    try { p = Game.getPerson(vid) || {}; } catch (e) {}
    const skills = {};
    for (const t of ['butcher', 'cook', 'preserver']) skills[t] = specSkillOf(Game, vid, t);
    let occKnown = null;
    try { occKnown = Game.occupationLabel ? Game.occupationLabel(vid) : null; } catch (e) {}
    out.push({
      id: String(vid).slice(0, 8), name: nameOf(Game, vid),
      formerOccupation: p.formerOccupation || p.occupation || '?',
      occLabelKnown: !!occKnown,
      skills, foodXp: p.foodXp || {},
      cookDuty: !!((assignmentOf(Game, vid) || {}).task === 'cook'),
      competenceCook: competenceOf(Game, vid, 'cook'),
    });
  }
  return out;
}

// The staffing-revisit rule (r20 metric-review proposal, now honest policy):
// on revisit days, if cook duty is held by someone with preserver skill < 2
// while a FREE living villager has preserver >= 2, re-staff (rest old, assign
// new). Face-to-face only — the engine's honest line. Recorded as restaffs.
function staffingRevisit(Game, records) {
  try {
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return null;
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    const cooks = Object.keys(asg).filter(id => (asg[id] || {}).task === 'cook');
    const bestFree = freeVillagers(Game)
      .map(id => ({ id, skill: specSkillOf(Game, id, 'preserver') }))
      .filter(c => c.skill >= 2)
      .sort((a, b) => b.skill - a.skill)[0] || null;
    if (!bestFree) return null;
    const cookSkill = (vid) => specSkillOf(Game, vid, 'preserver');
    const blindCooks = cooks.filter(id => cookSkill(id) < 2);
    if (!blindCooks.length) return null; // racks already in specialist hands
    // Rest the least-skilled blind cook, assign the specialist.
    const oldId = blindCooks.sort((a, b) => cookSkill(a) - cookSkill(b))[0];
    const oldSkill = cookSkill(oldId);
    let restOk = false, asgOk = false;
    try { Game.assignTask(oldId, 'rest', { via: 'in-person' }); restOk = true; } catch (e) { warnOnce('revisit.rest', e); }
    try {
      const r = Game.assignTask(bestFree.id, 'cook', { via: 'in-person' });
      asgOk = !!(r && r.ok !== false);
    } catch (e) { warnOnce('revisit.assign', e); }
    const rec = { day: nowDay(Game), oldId: String(oldId).slice(0, 8), oldName: nameOf(Game, oldId),
      oldSkill, newId: String(bestFree.id).slice(0, 8), newName: nameOf(Game, bestFree.id),
      newSkill: bestFree.skill, restOk, asgOk };
    records.push(rec);
    return rec;
  } catch (e) { warnOnce('revisit', e); return null; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  // ---- instrumentation ----
  const dayLines = {};
  const assignments = [];   // {day, vid, name, task, ok}
  const resolutions = [];   // {day, vid, name, task} from resolveOneAssignment
  const smokeEvents = [];   // {day, vid, name, skill, keptKcalParsed, deltaPreserved}
  const restaffs = [];      // staffing-revisit records
  const opportunityDays = new Set(); // day: cook on duty with preserver<2 while a living preserver-2+ exists
  const contests = [];      // contest_end records
  let pilotDay = null;
  const waveDay = {};

  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  const _assignTask = Game.assignTask ? Game.assignTask.bind(Game) : null;
  if (_assignTask) {
    Game.assignTask = function (vid, task, opts) {
      const r = _assignTask(vid, task, opts);
      try { assignments.push({ day: nowDay(Game), vid: String(vid).slice(0, 8), name: nameOf(Game, vid), task, ok: !!(r && (r.ok !== false)) }); }
      catch (e) { warnOnce('assignTask', e); }
      return r;
    };
  }
  const _resolve = Game.resolveOneAssignment ? Game.resolveOneAssignment.bind(Game) : null;
  if (_resolve) {
    Game.resolveOneAssignment = function (vid, a) {
      const d = nowDay(Game);
      const task = (a && a.task) || '?';
      let prePreserved = 0;
      if (task === 'cook') { try { prePreserved = pantryPreservedKcal(Game); } catch (e) {} }
      let daySayMark = 0;
      try { daySayMark = (dayLines[d] || []).length; } catch (e) {}
      const r = _resolve(vid, a);
      try {
        resolutions.push({ day: d, vid: String(vid).slice(0, 8), name: nameOf(Game, vid), task });
        if (task === 'cook') {
          const lines = (dayLines[d] || []).slice(daySayMark);
          const postPreserved = pantryPreservedKcal(Game);
          for (const l of lines) {
            if (/worked the smoke racks too/.test(l)) {
              const m = l.match(/~([\d,]+) kcal/);
              smokeEvents.push({ day: d, vid: String(vid).slice(0, 8), name: nameOf(Game, vid),
                skill: specSkillOf(Game, vid, 'preserver'),
                keptKcalParsed: m ? parseInt(m[1].replace(/,/g, ''), 10) : null,
                deltaPreserved: Math.round(postPreserved - prePreserved) });
            }
          }
        }
      } catch (e) { warnOnce('resolveOneAssignment', e); }
      return r;
    };
  }
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try { if (!wasPilotAired && Game.state.pilotAired) pilotDay = nowDay(Game); }
      catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }
  const _tele0 = Game.tele;
  Game.tele = function (type, data) {
    const r = _tele0.apply(this, arguments);
    try {
      if (type === 'contest_end') {
        contests.push({ day: nowDay(Game), cid: (data && data.id) || '?', outcome: (data && data.outcome) || '?' });
      }
    } catch (e) { warnOnce('tele.contest_end', e); }
    return r;
  };

  const censusStart = census(Game);
  let foodTrace = [];
  let crisisStreak = 0, maxCrisisStreak = 0;
  let compSignal = null; // day-35 snapshot for M2a

  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    // r31: the staffing-revisit rule (competent leader re-checks the racks).
    if (REVISIT_DAYS.indexOf(nowDay(Game)) >= 0) { try { staffingRevisit(Game, restaffs); } catch (e) { warnOnce('revisitDay', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    // opportunity-day census: cook blind on duty while a living specialist exists
    try {
      const v = Game.state.village || {};
      const asg = v.assignments || {};
      const cookIds = Object.keys(asg).filter(id => (asg[id] || {}).task === 'cook');
      const cookBlind = cookIds.some(id => specSkillOf(Game, id, 'preserver') < 2);
      const specAlive = livingVids(Game).some(id => specSkillOf(Game, id, 'preserver') >= 2);
      if (cookIds.length && cookBlind && specAlive) opportunityDays.add(nowDay(Game));
    } catch (e) { warnOnce('opportunity', e); }
    if (nowDay(Game) >= 35 && compSignal === null) {
      // M2a: the ⭐ signal snapshot — every living preserver-2+ should read >=1.3 on cook duty
      const rows = [];
      for (const id of livingVids(Game)) {
        if (specSkillOf(Game, id, 'preserver') >= 2) {
          rows.push({ id: String(id).slice(0, 8), name: nameOf(Game, id),
            skill: specSkillOf(Game, id, 'preserver'),
            competenceCook: competenceOf(Game, id, 'cook') });
        }
      }
      compSignal = { day: nowDay(Game), rows };
    }
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      const gd = nowDay(Game);
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
    // daily food census + crisis streak (r27 standing bar, r29 M2)
    try {
      let hs = 0;
      try { hs = (Game.progState ? Game.progState() : {}).hungryStreak || 0; } catch (e2) { warnOnce('hungryStreak', e2); }
      const p = Math.round(pantryKcal(Game)), pk = Math.round(packKcal(Game));
      foodTrace.push({ day: nowDay(Game), pantryKcal: p, packKcal: pk, atom: pantryUnitAtom(Game), alive: liv, hungryStreak: hs });
      const crisis = hs >= 3 && (p + pk) < liv * 2000;
      crisisStreak = crisis ? crisisStreak + 1 : 0;
      if (crisisStreak > maxCrisisStreak) maxCrisisStreak = crisisStreak;
    } catch (e) { warnOnce('foodTrace', e); }
  }

  // ---- end-of-run capture ----
  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  const censusEnd = census(Game);

  // ---- M1 (NPC processing exists): preserved kcal from the cook-duty smoke branch ----
  const m1preservedKcal = smokeEvents.reduce((a, e) => a + (e.deltaPreserved > 0 ? e.deltaPreserved : (e.keptKcalParsed || 0)), 0);
  const m1 = { smokeEvents: smokeEvents.length, preservedKcal: m1preservedKcal,
    cookResolutions: resolutions.filter(r => r.task === 'cook').length,
    verdict: smokeEvents.length > 0 ? 'GO' : 'NO-GO' };
  // ---- M2a (signal) / M2b (behavior) ----
  const m2aRows = (compSignal && compSignal.rows) || [];
  const m2aMisses = m2aRows.filter(r => r.competenceCook < 1.3);
  const m2a = { preserver2plus: m2aRows.length, misses: m2aMisses.length,
    rows: m2aRows.map(r => ({ name: r.name, skill: r.skill, competenceCook: r.competenceCook })),
    verdict: m2aMisses.length === 0 ? 'GO' : 'NO-GO' };
  const specEvents = smokeEvents.filter(e => e.skill >= 2);
  const m2b = { specSmokeEvents: specEvents.length, of: smokeEvents.length,
    specKcal: specEvents.reduce((a, e) => a + (e.deltaPreserved > 0 ? e.deltaPreserved : (e.keptKcalParsed || 0)), 0),
    workers: specEvents.slice(0, 6).map(e => ({ day: e.day, name: e.name, skill: e.skill })),
    verdict: specEvents.length > 0 ? 'GO' : 'NO-GO' };
  // ---- M3 (food guardrail, r27 standing bar) ----
  const starvation = deaths.filter(t => t.day >= 15 && /starvat|hunger|thirst/.test(String(t.cause || '')));
  const m3 = { starvationDeaths: starvation.length, maxCrisisStreak,
    verdict: (starvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO' };
  // ---- guardrails ----
  const atomNow = pantryUnitAtom(Game);
  const mG = { reachedDay: nowDay(Game), over: !!Game.over,
    pantryUnitAtom: atomNow, atomOk: atomNow <= 500,
    waveUnlockDays: waveDay, wave2GateOk: (waveDay[2] == null) || waveDay[2] >= 8,
    popAlive: livingVids(Game).length, pantryEnd: Math.round(pantryKcal(Game)),
    preservedEnd: Math.round(pantryPreservedKcal(Game)),
    deaths: deaths.length, contestsFired: contests.length, pilotDay,
    restaffs: restaffs.length, opportunityDays: Array.from(opportunityDays).sort((a, b) => a - b) };

  // ---- transcripts (r31 root-cause: dump day lines when TRANSCRIPT_DAYS set) ----
  if (process.env.TRANSCRIPT_DAYS) {
    const days = new Set(process.env.TRANSCRIPT_DAYS.split(',').map(s => parseInt(s, 10)));
    const tpPath = EVID + `/journey-establishment-r31-transcript-seed${seed}.txt`;
    let tp = [`=== seed ${seed} — day lines (TRANSCRIPT_DAYS=${process.env.TRANSCRIPT_DAYS}) ===`];
    for (const d of Array.from(days).sort((a, b) => a - b)) {
      tp.push(`\n----- day ${d} -----`);
      for (const l of (dayLines[d] || [])) tp.push(l);
    }
    try { fs.writeFileSync(tpPath, tp.join('\n')); } catch (e) { warnOnce('tpWrite', e); }
  }

  // ---- M4: people — 2 held convos per seed (cook + best specialist, else
  // first living villagers), no-repeat driver (r30 discipline) ----
  const convoPath = EVID + `/journey-establishment-r31-convo-seed${seed}.txt`;
  const convoLines = [];
  const asgEnd = ((Game.state.village || {}).assignments || {});
  const cookVid = Object.keys(asgEnd).find(id => (asgEnd[id] || {}).task === 'cook');
  const bestSpec = livingVids(Game)
    .map(id => ({ id, s: specSkillOf(Game, id, 'preserver') }))
    .filter(c => c.s >= 2).sort((a, b) => b.s - a.s)[0];
  const convoTargets = [];
  if (cookVid) convoTargets.push({ vid: cookVid, why: 'cook-on-duty' });
  if (bestSpec && String(bestSpec.id).slice(0, 8) !== String(cookVid).slice(0, 8))
    convoTargets.push({ vid: bestSpec.id, why: 'best-preserver' });
  for (const vid of livingVids(Game)) {
    if (convoTargets.length >= 2) break;
    if (convoTargets.some(t => String(t.vid) === String(vid))) continue;
    convoTargets.push({ vid, why: 'fellow-villager' });
  }
  const STRUCT = { leave: 1, bye: 1, goon: 1, 'menu:more': 1, deflect_q: 1, honest_pass: 1, silence: 1 };
  for (const t of convoTargets.slice(0, 2)) {
    const vid = t.vid;
    const nm = nameOf(Game, vid);
    const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
    convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} role=${t.why} preserver=${specSkillOf(Game, vid, 'preserver')} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const fresh = (id) => choices.find(ch => ch.id === id) && !seen[id];
        let pick = null;
        if (fresh('ask:personal')) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => !STRUCT[ch.id] && !seen[ch.id] && ch.id !== 'leave' && ch.id !== 'bye')
          || null;
        if (!pick) break;
        seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }
  const nullConvoLines = convoLines.filter((l, i) => {
    if (!/^THEM: (null|undefined)\s*$/.test(l) && !/^(OPENING|closing): (null|undefined)$/.test(l)) return false;
    const nxt = convoLines[i + 1] || '';
    return nxt.indexOf('(quiet close') !== 0;
  });
  const m4 = { convos: convoTargets.length, nullLineCount: nullConvoLines.length,
    verdict: nullConvoLines.length === 0 ? 'GO' : 'NO-GO' };

  // ---- telemetry baseline keys ----
  const wk = (() => { try { return (Game.state.waveKills || {}); } catch (e) { return {}; } })();
  const killTotal = Object.values(wk).reduce((a, b) => a + (b || 0), 0);
  const metrics = {
    contestFinal: { held: contests.length },
    codexKillSummary: { waveKills: wk, total: killTotal },
    pilotAired: pilotDay,
    deaths: deaths.length,
    popAlive: livingVids(Game).length,
    pantryKcal: Math.round(pantryKcal(Game)),
    specPreservedKcal: m1preservedKcal,
  };

  const out = { seed, run: 'r31', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    metrics, m1, m2a, m2b, m3, m4,
    guardrails: mG,
    censusStart, censusEnd,
    restaffs, opportunityDayCount: opportunityDays.size,
    smokeEvents: smokeEvents.slice(0, 40),
    assignments: assignments.slice(0, 60),
    deaths, convoPath, ctxNotes: ctx.notes.slice(0, 10) };
  const outPath = EVID + `/journey-establishment-r31-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }
  return { seed, outPath, m1, m2a, m2b, m3, m4, guardrails: mG,
    smokeSample: smokeEvents.slice(0, 4).map(e => ({ day: e.day, name: e.name, skill: e.skill, kcal: e.deltaPreserved || e.keptKcalParsed })) };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r31 seed=${seed} ---`);
    const r = await runSeed(seed);
    results.push(r);
    console.log(JSON.stringify({ seed,
      m1: r.m1, m2a: r.m2a, m2b: r.m2b, m3: r.m3, m4: r.m4,
      guardrails: r.guardrails, smokeSample: r.smokeSample }, null, 1));
    console.log('analysis: per-seed JSON + convos written; compose the r31 note by hand');
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
