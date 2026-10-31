#!/usr/bin/env node
// patrolsilent-diag-20261031.js — patrol-silent seeds census instrument
// (sim-patrolsilent-a). MEASUREMENT ONLY. Env-gated on PSILDIAG=1.
// v2: caller parsing skips the sim-harness verb wrapper (Object.w).
// Contract: instrumentOn(), install(Game, t), uninstall,
// beginBeat(Game, t), endBeat(Game, t).
//
// Installs NO wrapper except Game.assignTask (call-through, ALL tasks,
// not just patrol — the pre-attempt funnel is visible only if every
// pick is recorded). Per upkeep beat (the sweep calls beginBeat
// before policy.upkeep and endBeat after), a snapshot row records:
//   - scholar presence: raw map coords vs village node, atHaven
//     computed EXACTLY as Game.playerAtHaven() (Manhattan <= 1,
//     village px/py default 4/4, map-missing defaults present)
//   - per living non-scholar roster member, the pickTask inputs:
//     hp, occupation, specialistSkill cook/preserver, combat-cred
//     components (raw agency monsterKills + combat-occupation
//     regex, identical to scripts/policies/delegate.js), trust,
//     pre-beat assignment, pre-beat taskLead sighting
//   - beat-boundary assignments + taskLeads maps (so deal/appeal /
//     task-lead patrols are visible even though they never call
//     assignTask)
//
// READ-ONLY DISCIPLINE (stricter than pocketdesign-diag):
// - Draws NO RNG, writes NO game state, returns original results.
// - Never calls a Game method that initializes state: NO agencyOf
//   (it creates stats entries), NO getPerson (it hydrates
//   background seeds), NO npcNode / npcInside / campPeopleIds /
//   partyMembers / stashState / agencyState / ensureVillagerPositions
//   / npcMaxDist / npcRangeProfile. Agency kills are read RAW from
//   state.village.agency.stats when that object already exists;
//   absent -> kills null, never a default 0 presented as measured.
// - Persons are read from data.villagers only; a roster id with no
//   data.villagers entry is recorded personMissing (never hydrated).
// - specialistSkill is pure (occupation + _src.foodXp reads) and is
//   called directly; failures record null, never throw.
// - playerAtHaven() itself is NOT called in beats (its semantics are
//   replicated from raw coords); the proof test asserts the
//   replication equals playerAtHaven() on a live game.
// - Every catch reports into t.psErrors (never thrown, never silent).
//
// Pure functions (shared with the analyzer, single source of truth):
// - atHavenOf(mapPx, mapPy, vPx, vPy, mapMissing)
// - combatOcc(occLower): combat-occupation regex from delegate.js
// - classifyBeatVillager(f): f = {hadAssignment, hp, specCook,
//   specPreserver, occLower, teachRollUnknown, cred, assignedTask}
//   -> 'already-assigned' | 'rest' | 'fit-cook' | 'fit-fish' |
//   'fit-garden' | 'fit-mend' | 'fit-teach?' | 'cred-eligible' |
//   'no-cred' | 'hp-low' | 'need-based' | 'unclassified'
//   NOTE: 'fit-teach?' and the danger/need split are PROBABILISTIC
//   in the policy (prand draws); the analyzer classifies from the
//   RECORDED assigned task, not from a re-simulation, so no
//   villager-beat is ever classified by re-rolling RNG. The pure
//   classifier exists so the proof test can pin the branch order.
'use strict';

function instrumentOn() { return process.env.PSILDIAG === '1'; }

function err(t, where, e) {
  try { t.psErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

// atHavenOf replicates Game.playerAtHaven() (game.js):
//   if (!this.map) return true;
//   hx = v.px ?? 4, hy = v.py ?? 4;
//   return |px-hx| + |py-hy| <= 1.
function atHavenOf(mapPx, mapPy, vPx, vPy, mapMissing) {
  if (mapMissing) return true;
  const hx = (vPx === undefined || vPx === null) ? 4 : vPx;
  const hy = (vPy === undefined || vPy === null) ? 4 : vPy;
  if (typeof mapPx !== 'number' || typeof mapPy !== 'number') return true;
  return Math.abs(mapPx - hx) + Math.abs(mapPy - hy) <= 1;
}

const COMBAT_OCC_RE = /(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/;
function combatOcc(occLower) {
  try { return COMBAT_OCC_RE.test(String(occLower || '')); } catch (e) { return false; }
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Classify ONE villager-beat from its recorded features + recorded
// assigned task (never from re-rolled RNG). Branch order mirrors
// delegate.js pickTask; the recorded task is authoritative, the
// features explain WHY that branch was reachable.
function classifyBeatVillager(f) {
  if (!f) return 'unclassified';
  if (f.hadAssignment) return 'already-assigned';
  if (f.assignedTask === null || f.assignedTask === undefined) return 'unclassified';
  const t = f.assignedTask;
  if (t === 'rest') return 'rest';
  if (t === 'cook') return 'fit-cook';
  if (t === 'fish') return 'fit-fish';
  if (t === 'garden') return 'fit-garden';
  if (t === 'mend') return 'fit-mend';
  if (t === 'teach') return 'fit-teach?';
  if (t === 'patrol' || t === 'hunt') return 'cred-eligible';
  // A need task with hp>=60 + cred means the danger branch WAS
  // evaluated (fit branches return early; danger falls through to
  // need when the patrol/hunt rolls miss) — danger-reached, not
  // danger-unreached. 'need-based' survives in the union only for
  // callers that classify without features.
  if ((f.hp === undefined || f.hp === null || f.hp < 60)) return 'hp-low';
  if (!f.cred) return 'no-cred';
  return 'cred-eligible';
}

function personRow(Game, vid) {
  const row = { vid, personMissing: false, dead: false, hp: null, occ: null,
    occLower: null, specCook: null, specPreserver: null, kills: null,
    agencyPresent: false, credOcc: false, credKills: false, cred: false,
    trust: null, hadAssignment: false, preTask: null, isPatrolLead: false };
  try {
    const data = Game.data || {};
    const p = (data.villagers || []).find(x => x && x.id === vid) || null;
    if (!p) { row.personMissing = true; return row; }
    try { row.dead = !!p.dead; } catch (e) {}
    if (row.dead) return row;
    try { row.occ = p.formerOccupation || null; } catch (e) {}
    row.occLower = String(row.occ || '').toLowerCase();
    row.credOcc = combatOcc(row.occLower);
    try {
      const h = ((Game.state || {}).village || {}).health || {};
      row.hp = (h[vid] === undefined || h[vid] === null) ? 100 : h[vid];
    } catch (e) { row.hp = 100; }
    try {
      if (Game.specialistSkill) {
        row.specCook = Game.specialistSkill(p, 'cook');
        row.specPreserver = Game.specialistSkill(p, 'preserver');
      }
    } catch (e) { row.specCook = null; row.specPreserver = null; }
    try {
      const ag = ((Game.state || {}).village || {}).agency || null;
      if (ag && ag.stats && ag.stats[vid] !== undefined && ag.stats[vid] !== null) {
        row.agencyPresent = true;
        const k = ag.stats[vid].monsterKills;
        row.kills = (typeof k === 'number') ? k : null;
      }
    } catch (e) {}
    row.credKills = (typeof row.kills === 'number' && row.kills > 0);
    row.cred = row.credOcc || row.credKills;
    try {
      const tr = ((Game.state || {}).village || {}).trust || {};
      row.trust = (tr[vid] === undefined || tr[vid] === null) ? 10 : tr[vid];
    } catch (e) { row.trust = 10; }
    try {
      const asg = ((Game.state || {}).village || {}).assignments || {};
      if (asg[vid]) { row.hadAssignment = true; row.preTask = asg[vid].task || null; }
    } catch (e) {}
    try {
      const leads = ((Game.state || {}).village || {}).taskLeads || {};
      row.isPatrolLead = (leads.patrol === vid);
    } catch (e) {}
  } catch (e) { row.personMissing = true; }
  return row;
}

function snapshotAssignments(Game) {
  const out = {};
  try {
    const asg = ((Game.state || {}).village || {}).assignments || {};
    for (const k of Object.keys(asg)) out[k] = (asg[k] && asg[k].task) || null;
  } catch (e) {}
  return out;
}

function snapshotLeads(Game) {
  const out = {};
  try {
    const leads = ((Game.state || {}).village || {}).taskLeads || {};
    for (const k of Object.keys(leads)) out[k] = leads[k];
  } catch (e) {}
  return out;
}

function install(Game, t) {
  if (!t.psBeats) t.psBeats = [];
  if (!t.psAssigns) t.psAssigns = [];
  if (!t.psErrors) t.psErrors = [];
  if (typeof t.psBeatSeq !== 'number') t.psBeatSeq = 0;
  t._psCurBeat = null;

  const origAssign = Game.assignTask;
  if (typeof origAssign !== 'function') { err(t, 'install.missing:assignTask', new Error('not a function')); return function uninstall() {}; }
  Game.assignTask = function (vid, task, opts) {
    const r = origAssign.apply(this, arguments);
    try {
      let assignedAfter = false;
      try {
        const a = (((Game.state || {}).village || {}).assignments || {})[vid];
        assignedAfter = !!(a && a.task === task);
      } catch (e) {}
      let retOk = null, retRefused = null;
      try {
        if (r && typeof r === 'object') {
          if (typeof r.ok === 'boolean') retOk = r.ok;
          if (typeof r.refused === 'boolean') retRefused = r.refused;
        }
      } catch (e) {}
      // Caller: skip this instrument's own frame AND the harness's
      // verb-telemetry wrapper (sim-harness.js: `const w = ...`,
      // reported as Object.w — it sits between every policy caller
      // and Game.assignTask in real sweeps, so the first raw frame
      // is always the wrapper, never the policy). v2 fix: without
      // this skip, every judged row read caller Object.w.
      let caller = null;
      try {
        const st = (new Error().stack || '').split('\n').slice(1);
        for (const line of st) {
          if (line.indexOf('patrolsilent-diag') !== -1) continue;
          if (line.indexOf('sim-harness') !== -1) continue;
          const m = line.match(/at ([^\s(]+)/);
          if (!m) continue;
          const fn = m[1];
          if (fn === 'Game.assignTask' || fn === 'Object.assignTask' || fn === 'Object.w') continue;
          caller = fn;
          break;
        }
      } catch (e) {}
      t.psAssigns.push({ beat: t._psCurBeat, day: dayOf(Game),
        part: (typeof Game.dayPart === 'number') ? Game.dayPart : null,
        vid: (vid === undefined || vid === null) ? null : String(vid),
        task: task || null, via: (opts && opts.via) || null,
        assignedAfter, retOk, retRefused, caller });
    } catch (e) { err(t, 'assign.after', e); }
    return r;
  };
  return function uninstall() {
    try { Game.assignTask = origAssign; } catch (e) {}
    try { t._psCurBeat = null; } catch (e) {}
  };
}

function beginBeat(Game, t) {
  const id = ++t.psBeatSeq;
  t._psCurBeat = id;
  const beat = { id, day: dayOf(Game),
    part: (typeof Game.dayPart === 'number') ? Game.dayPart : null,
    scholarPx: null, scholarPy: null, villagePx: null, villagePy: null,
    mapMissing: false, atHaven: null, location: null,
    roster: [], assignments: {}, taskLeads: {} };
  try {
    const st = Game.state || {};
    const v = st.village || {};
    beat.location = (typeof Game.location === 'string') ? Game.location : null;
    if (!Game.map) { beat.mapMissing = true; }
    else {
      beat.scholarPx = (typeof Game.map.px === 'number') ? Game.map.px : null;
      beat.scholarPy = (typeof Game.map.py === 'number') ? Game.map.py : null;
    }
    beat.villagePx = (v.px === undefined || v.px === null) ? null : v.px;
    beat.villagePy = (v.py === undefined || v.py === null) ? null : v.py;
    beat.atHaven = atHavenOf(beat.scholarPx, beat.scholarPy, beat.villagePx, beat.villagePy, beat.mapMissing);
    const sid = Game.villagerId;
    const roster = (v.roster || []).filter(x => x !== sid);
    beat.roster = roster.map(vid => personRow(Game, vid));
    beat.assignments = snapshotAssignments(Game);
    beat.taskLeads = snapshotLeads(Game);
  } catch (e) { err(t, 'beat.snapshot', e); }
  t.psBeats.push(beat);
  return id;
}

function endBeat(Game, t) {
  // Post-beat assignment map: the next beat's pre-map covers the
  // steady state; endBeat only closes the beat pointer so stray
  // assignTask calls outside upkeep (none expected in sims) are
  // tagged beat null rather than misattributed.
  t._psCurBeat = null;
}

module.exports = { instrumentOn, install, beginBeat, endBeat,
  atHavenOf, combatOcc, classifyBeatVillager };
