#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71/r84)
// r107 (2026-11-06). Clone of the r105 driver loop, NO teaching intervention:
// competent policy only, so lessons are natural (NPC->NPC, NPC->player).
// Question (see prereg): does staffing hunts — via the existing landed
// default-OFF huntstaff layer (sim-huntstaff-b4 + refusestaff repair),
// wrapped around the same competent policy — change the establishment
// funnel (pantry, survival, field_dressing fires) on identical seeds
// 1501-1504? The policy is ALWAYS withHuntStaff(competent,
// 'competent-hunt'); HUNTSTAFF=1 fires the layer, unset = gate-off
// (M0: gate-off must reproduce the r105-driver control exactly).
// Arm-only capture: ctx hunt-staff logs + end eligibility snapshot.
// Instruments are read-only wraps + a per-dawn material trace: Game.craft
// (armor attempts), Game.villagerArmorCraftDay (NPC craft-beat calls),
// stash / player-pack / NPC-pack materials per dawn, PLUS r105 duty-use
// wraps: villagerHuntResolve (field_dressing), villagerCareTick (triage
// reach / herbal holders), healerRounds (wound care actor),
// villagerTreatTick (unasked easing), resolveOneAssignment cook branch
// (preserve_food at the smoke racks). Every wrap calls the original exactly
// once, logs after, and draws no RNG. No new telemetry rows, no src/js.
// Usage: SEEDS=1501 DAYS=42 node scripts/journey-establishment-r107-20261106.js
//   EVID defaults to evidence/2026-11-06 in this repo checkout.
//   HUNTSTAFF=1 arms the hunt-staffing layer; unset = gate-off control leg.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-11-06');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { withHuntStaff, isHunterSubstrate, leanDay, personHp, woundWithin } = require('./policies/huntstaff');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1501]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r107:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
function livingVids(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(id => !isDead(Game, id)); } catch (e) { return []; }
}

// --- r105 HOLDINGS SNAPSHOT (read-only; see prereg) ---
// Per roster villager: raw granted System slots, owned union, raw skills,
// raw XP record. Raw reads ONLY — skillsKnownBy seeds background skills
// (a state write) and must never run before the play loop; npcOwnedIds is
// a pure Set union (verified in src/js/tracks.js). Null = no record yet.
function holdingsSnap(Game) {
  const v = Game.state.village || {};
  const out = [];
  for (const id of (v.roster || [])) {
    let granted = null, owned = null, skills = null, xp = null;
    try { const g = ((v.npcAbilities || {})[id] || null); granted = g ? g.slice() : []; } catch (e) {}
    try { owned = (typeof Game.npcOwnedIds === 'function') ? (Game.npcOwnedIds(id) || []) : null; } catch (e) {}
    try { const s = ((v.npcSkills || {})[id] || null); skills = s ? s.slice() : []; } catch (e) {}
    try { const x = ((v.npcXp || {})[id] || null); xp = x ? JSON.parse(JSON.stringify(x)) : null; } catch (e) {}
    out.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id), granted, owned, skills, xp });
  }
  return out;
}

// --- R101 teaching intervention (one dawn convo/day, player-teaches only) ---
function teachLivingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  } catch (e) { return []; }
}
function teachTrust(Game, vid) {
  try { const t = ((Game.state.village || {}).trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return null; }
}
function attemptTeach(Game, day, startIdx) {
  // Returns {record, lines, nextStartIdx}. Never throws: every failure is a record.
  const living = teachLivingVids(Game);
  if (!living.length) return { record: { day, kind: 'error', error: 'no living villagers' }, lines: [], nextStartIdx: 0 };
  const rotated = living.slice(startIdx % living.length).concat(living.slice(0, startIdx % living.length));
  let candidate = null;
  for (let i = 0; i < rotated.length; i++) {
    const vid = rotated[i];
    let gaps = [];
    try { gaps = (typeof Game.teachableSkills === 'function') ? (Game.teachableSkills('player', vid) || []) : []; } catch (e) { gaps = []; }
    let okSkills = [];
    try { okSkills = gaps.filter(sid => { try { return Game.canTeachSkill('player', vid, sid).ok; } catch (e) { return false; } }); } catch (e) { okSkills = []; }
    if (okSkills.length) { candidate = { vid, skill: okSkills[0], rotIdx: i }; break; }
  }
  if (!candidate) {
    const gateCounts = {};
    const details = [];
    for (const vid of living) {
      let gaps = [];
      try { gaps = (typeof Game.teachableSkills === 'function') ? (Game.teachableSkills('player', vid) || []) : []; } catch (e) { gaps = []; }
      let why = 'no-gap';
      if (gaps.length) {
        try { const chk = Game.canTeachSkill('player', vid, gaps[0]); why = chk.ok ? 'ok-but-unpicked?' : (chk.why || '?'); } catch (e) { why = 'error:' + e.message; }
      }
      gateCounts[why] = (gateCounts[why] || 0) + 1;
      details.push({ name: nameOf(Game, vid), why, trust: teachTrust(Game, vid), gaps: gaps.slice(0, 3) });
    }
    return { record: { day, kind: 'nocandidate', gateCounts, details }, lines: [], nextStartIdx: (startIdx + 1) % living.length };
  }
  const { vid, skill } = candidate;
  const nm = nameOf(Game, vid);
  let knewBefore = null;
  try { knewBefore = Game.npcKnowsSkill ? !!Game.npcKnowsSkill(vid, skill) : null; } catch (e) {}
  const lines = [];
  const menusVisited = [];
  try {
    let r = Game.startConvo(vid);
    lines.push(`TEACH d${day} ${nm}: OPENING: ${r.line}`);
    let picked = null;
    const seenMenus = new Set();
    let morePages = 0;
    for (let turn = 0; turn < 14; turn++) {
      const choices = (r.choices && r.choices.length) ? r.choices : [];
      menusVisited.push(choices.map(ch => ch.id));
      if (r.ended || !choices.length) { lines.push('TEACH (convo ended before a teach offer)'); break; }
      const teachChoice = choices.find(ch => String(ch.id || '').indexOf('skill_teach:') === 0);
      if (teachChoice) { picked = teachChoice; break; }
      const sig = choices.map(ch => ch.id).join('|');
      if (seenMenus.has(sig)) { lines.push('TEACH (menu repeats: pagination loop)'); break; }
      seenMenus.add(sig);
      const pickPref = (pred, prefs) => {
        const cands = choices.filter(pred);
        if (!cands.length) return null;
        for (const pf of prefs) { const hit = cands.find(ch => String(ch.id).indexOf(pf) >= 0); if (hit) return hit; }
        return cands[0];
      };
      let next = pickPref(ch => String(ch.id || '').indexOf('ans:') === 0, ['honest_pass', 'a_vague', 'a_deflect']);
      if (!next) next = pickPref(ch => String(ch.id || '').indexOf('gq:') === 0, ['unsure', 'honest_pass']);
      if (!next) next = choices.find(ch => ch.id === 'dlg:subject' || ch.id === 'subject');
      if (!next && morePages < 4) { next = choices.find(ch => ch.id === 'menu:more'); if (next) morePages++; }
      if (!next) next = choices.find(ch => ch.id === 'dlg:more');
      if (!next) { lines.push('TEACH (navigation exhausted: no teach offer, no answer, no subject, no more page)'); break; }
      lines.push(`TEACH YOU: [${next.id}] ${(next.label || '').slice(0, 60)}`);
      r = Game.convoTurn(vid, next.id);
      lines.push(`TEACH THEM: ${r.line == null ? '(null)' : r.line}`);
    }
    if (!picked) {
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) lines.push('TEACH closing: ' + end.line); } catch (e) { lines.push('TEACH endConvo: ' + e.message); }
      return { record: { day, kind: 'nomenu', vid: String(vid), name: nm, skill, menusVisited }, lines, nextStartIdx: (startIdx + candidate.rotIdx + 1) % living.length };
    }
    lines.push(`TEACH YOU: [${picked.id}] ${(picked.label || '').slice(0, 80)}`);
    r = Game.convoTurn(vid, picked.id);
    lines.push(`TEACH THEM: ${r.line == null ? '(null)' : r.line}`);
    let knowsAfter = null;
    try { knowsAfter = Game.npcKnowsSkill ? !!Game.npcKnowsSkill(vid, picked.id.split(':')[1]) : null; } catch (e) {}
    try { const end = Game.endConvo(vid, 'done'); if (end && end.line) lines.push('TEACH closing: ' + end.line); } catch (e) { lines.push('TEACH endConvo: ' + e.message); }
    return { record: { day, kind: 'lesson', vid: String(vid), name: nm, skill: picked.id.split(':')[1], knewBefore, knowsAfter, line: (r.line == null ? null : String(r.line).slice(0, 300)), menusVisited }, lines, nextStartIdx: (startIdx + candidate.rotIdx + 1) % living.length };
  } catch (e) {
    try { Game.endConvo(vid, 'done'); } catch (e2) {}
    lines.push('TEACH ERROR: ' + e.message);
    return { record: { day, kind: 'error', vid: String(vid), name: nm, skill, error: e.message }, lines, nextStartIdx: (startIdx + 1) % living.length };
  }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  // r107 ARM: the hunt-staffing layer is ALWAYS wrapped around competent;
  // HUNTSTAFF=1 fires it, unset = gate-off (M0: must reproduce control).
  const policy = withHuntStaff(competent, 'competent-hunt');
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  const waveSysLines = [];
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); const txt = String(a[0] == null ? '' : a[0]); (dayLines[d] = dayLines[d] || []).push('SYS: ' + txt); if (/wave|ledger/i.test(txt)) waveSysLines.push({ day: d, line: txt.slice(0, 300) }); } catch (e) { warnOnce('sysSay', e); }
    };
  }

  // --- Armor instruments (read-only wraps; originals called exactly once) ---
  const craftLog = [];
  let craftWrap = false;
  if (typeof Game.craft === 'function') {
    const _c = Game.craft.bind(Game);
    craftWrap = true;
    Game.craft = function (item) {
      const r = _c.apply(this, arguments);
      try {
        if (item === 'bark_armor' || item === 'hide_armor') {
          let ret = null;
          try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
          craftLog.push({ day: nowDay(Game), item: String(item), ret: (ret || '').slice(0, 300) });
        }
      } catch (e) {}
      return r;
    };
  }
  const npcCraftLog = [];
  let npcCraftWrap = false;
  if (typeof Game.villagerArmorCraftDay === 'function') {
    const _n = Game.villagerArmorCraftDay.bind(Game);
    npcCraftWrap = true;
    Game.villagerArmorCraftDay = function (...a) {
      let beforeStash = '', beforeCd = '';
      try { beforeStash = JSON.stringify(((Game.state.village || {}).stash || {}).materials || {}); } catch (e) {}
      try { beforeCd = JSON.stringify((Game.state.village || {}).avCraftCd || {}); } catch (e) {}
      const r = _n.apply(this, a);
      try {
        let ret = null;
        try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
        let afterStash = '', afterCd = '';
        try { afterStash = JSON.stringify(((Game.state.village || {}).stash || {}).materials || {}); } catch (e) {}
        try { afterCd = JSON.stringify((Game.state.village || {}).avCraftCd || {}); } catch (e) {}
        // Attempt = materials consumed or cooldown set, even when the roll fails (made=0).
        const attempted = (afterStash !== beforeStash) || (afterCd !== beforeCd);
        npcCraftLog.push({ day: nowDay(Game), ret: (ret || '').slice(0, 300), attempted });
      } catch (e) {}
      return r;
    };
  }

  // --- r105 DUTY-USE wraps (read-only; originals called exactly once, log
  // after, no RNG draws inside any wrap). The medic filter mirrored here is
  // the game's own (occupation regex + severity gate) — see prereg.
  const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
  function medicsMirror(Game) {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      if (String(id) === String(Game.villagerId)) return false;
      let p = null; try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) return false;
      const msick = (v.sick || {})[id];
      if (msick && (msick.severity || 1) >= 2) return false;
      return MED_OCC.test(String(p.formerOccupation || ''));
    }).map(id => {
      let heldTriage = null, heldHerbal = null, occ = '?';
      try { heldTriage = !!(Game.npcHasAbility && Game.npcHasAbility(id, 'triage')); } catch (e) {}
      try { heldHerbal = !!(Game.npcHasAbility && Game.npcHasAbility(id, 'herbal_remedy')); } catch (e) {}
      try { const p = Game.getPerson(id); occ = (p && p.formerOccupation) || '?'; } catch (e) {}
      return { vid: String(id), name: nameOf(Game, id), occ, heldTriage, heldHerbalRemedy: heldHerbal };
    });
  }
  function preservedKcal(Game) {
    let t = 0;
    try { for (const it of ((Game.state.village || {}).pantry || [])) if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) t += (it.kcalEach || 0) * (it.units || 1); } catch (e) {}
    return t;
  }
  // 1. Hunt duty — field_dressing (villagerHuntResolve frac 0.60 -> 0.78).
  const huntLog = [];
  let huntWrap = false;
  if (typeof Game.villagerHuntResolve === 'function') {
    const _h = Game.villagerHuntResolve.bind(Game);
    huntWrap = true;
    Game.villagerHuntResolve = function (vid, eff) {
      const r = _h.apply(this, arguments);
      try {
        let held = null;
        try { held = !!(Game.npcHasAbility && Game.npcHasAbility(vid, 'field_dressing')); } catch (e) {}
        huntLog.push({ day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid), heldFieldDressing: held, kcal: (r && r.kcal) || 0, aid: (r && r.aid) || null });
      } catch (e) {}
      return r;
    };
  }
  // 2. Disease tending — triage reach / herbal holders (villagerCareTick).
  const careLog = [];
  let careWrap = false, careCalls = 0;
  if (typeof Game.villagerCareTick === 'function') {
    const _c = Game.villagerCareTick.bind(Game);
    careWrap = true;
    Game.villagerCareTick = function () {
      careCalls++;
      let sickBefore = null, medics = null;
      try { sickBefore = JSON.parse(JSON.stringify((Game.state.village || {}).sick || {})); } catch (e) {}
      try { medics = medicsMirror(Game); } catch (e) {}
      const r = _c.apply(this, arguments);
      try {
        const sickAfter = (Game.state.village || {}).sick || {};
        let tends = 0; const tended = [];
        for (const id of Object.keys(sickBefore || {})) {
          const b = (sickBefore[id] && sickBefore[id].daysLeft) || 0;
          const a = (sickAfter[id] && sickAfter[id].daysLeft) || 0;
          if (a < b) { tends += (b - a); tended.push({ vid: String(id), name: nameOf(Game, id), before: b, after: a }); }
        }
        careLog.push({ day: nowDay(Game), medics: medics || [], sickBefore: Object.keys(sickBefore || {}).length, tends, tended });
      } catch (e) {}
      return r;
    };
  }
  // 3. Wound care — healerRounds actor (campHealerId occupation gate).
  const healerLog = [];
  let healerWrap = false, healerCalls = 0;
  if (typeof Game.healerRounds === 'function') {
    const _hr = Game.healerRounds.bind(Game);
    healerWrap = true;
    Game.healerRounds = function () {
      healerCalls++;
      let hpBefore = null, cgHere = null, cgHaven = null;
      try { hpBefore = JSON.parse(JSON.stringify((Game.state.village || {}).health || {})); } catch (e) {}
      try { cgHere = Game.campHealerId ? Game.campHealerId('here') : null; } catch (e) {}
      try { cgHaven = Game.campHealerId ? Game.campHealerId('haven') : null; } catch (e) {}
      const r = _hr.apply(this, arguments);
      try {
        if (r) {
          const hpAfter = (Game.state.village || {}).health || {};
          const before = (hpBefore && hpBefore[r]) || 0;
          const after = hpAfter[r];
          const caregiver = cgHere || cgHaven || null;
          let heldHerbal = null, heldTriage = null;
          try { if (caregiver) heldHerbal = !!(Game.npcHasAbility && Game.npcHasAbility(caregiver, 'herbal_remedy')); } catch (e) {}
          try { if (caregiver) heldTriage = !!(Game.npcHasAbility && Game.npcHasAbility(caregiver, 'triage')); } catch (e) {}
          healerLog.push({ day: nowDay(Game), patient: String(r), patientName: nameOf(Game, r), hpBefore: before, hpAfter: after == null ? null : after,
            caregiver: caregiver == null ? null : String(caregiver), caregiverName: caregiver == null ? null : nameOf(Game, caregiver),
            caregiverHere: cgHere == null ? null : String(cgHere), caregiverHaven: cgHaven == null ? null : String(cgHaven),
            ambiguousCaregiver: !!(cgHere && cgHaven && String(cgHere) !== String(cgHaven)),
            caregiverHeldHerbalRemedy: heldHerbal, caregiverHeldTriage: heldTriage });
        }
      } catch (e) {}
      return r;
    };
  }
  // 4. Unasked easing — villagerTreatTick (player's sickness, scholar side).
  const treatLog = [];
  let treatWrap = false, treatCalls = 0;
  if (typeof Game.villagerTreatTick === 'function') {
    const _t = Game.villagerTreatTick.bind(Game);
    treatWrap = true;
    Game.villagerTreatTick = function () {
      treatCalls++;
      let healer = null, sickBefore = null, medics = null;
      try { healer = Game.campHealerName ? Game.campHealerName() : null; } catch (e) {}
      try { medics = medicsMirror(Game); } catch (e) {}
      // Raw statuses read: sickDiseases() calls seList(), which LAZY-INITs
      // scholar.statuses (a state write) — never call it from a wrap.
      try { sickBefore = JSON.stringify((Game.state.scholar || {}).statuses || []); } catch (e) {}
      const r = _t.apply(this, arguments);
      try {
        let sickAfter = null;
        try { sickAfter = JSON.stringify((Game.state.scholar || {}).statuses || []); } catch (e) {}
        treatLog.push({ day: nowDay(Game), healer, medics: medics || [], playerSickBefore: sickBefore, playerSickAfter: sickAfter, changed: sickBefore !== sickAfter });
      } catch (e) {}
      return r;
    };
  }
  // 5. Cook duty — preserve_food at the smoke racks (resolveOneAssignment).
  const cookLog = [];
  let cookWrap = false;
  if (typeof Game.resolveOneAssignment === 'function') {
    const _roa = Game.resolveOneAssignment.bind(Game);
    cookWrap = true;
    Game.resolveOneAssignment = function (vid, a) {
      const isCook = !!(a && a.task === 'cook');
      let pre = null, sayBefore = 0;
      if (isCook) {
        try {
          const d = nowDay(Game);
          sayBefore = (dayLines[d] || []).length;
          let spec = null, holds = null, occ = '?';
          try {
            let p = null;
            try { const vp = (typeof Game.villagePeople === 'function') ? Game.villagePeople() : []; p = vp.find(x => String(x.id) === String(vid)) || null; } catch (e) {}
            if (!p) { try { p = Game.getPerson(vid); } catch (e) {} }
            occ = (p && p.formerOccupation) || '?';
            spec = (Game.specialistSkill && p) ? Game.specialistSkill(p, 'preserver') : null;
          } catch (e) {}
          try { const sk = ((Game.state.village.npcSkills || {})[vid] || []); holds = sk.indexOf('preserve_food') >= 0; } catch (e) {}
          pre = { preservedBefore: preservedKcal(Game), spec, holds, occ };
        } catch (e) {}
      }
      const r = _roa.apply(this, arguments);
      try {
        if (isCook && pre) {
          const d = nowDay(Game);
          let rackLines = [];
          try { rackLines = (dayLines[d] || []).slice(sayBefore).filter(l => /smoke rack|preserved|racks/i.test(String(l))).map(l => String(l).slice(0, 200)); } catch (e) {}
          cookLog.push({ day: d, vid: String(vid), name: nameOf(Game, vid), occ: pre.occ, specPreserver: pre.spec, holdsPreserveFood: pre.holds,
            preservedKcalBefore: pre.preservedBefore, preservedKcalAfter: preservedKcal(Game), rackLines });
        }
      } catch (e) {}
      return r;
    };
  }
  function matSnap() {
    try {
      const v = Game.state.village || {};
      const stash = Object.assign({}, (v.stash && v.stash.materials) || {});
      const pack = {};
      for (const it of ((Game.state.scholar || {}).inventory || [])) {
        if (it && it.material) pack[it.material] = (pack[it.material] || 0) + (it.units || 0);
      }
      const npcTotal = {};
      const npcDetail = [];
      for (const id of livingVids(Game)) {
        let p = null;
        try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
        if (!p) continue;
        const mats = {};
        const armor = [];
        for (const it of (p.items || [])) {
          if (!it) continue;
          if (it.material) { mats[it.material] = (mats[it.material] || 0) + (it.units || 0); }
          if (it.itemId === 'bark_armor' || it.itemId === 'hide_armor') armor.push(it.itemId);
        }
        for (const eq of Object.values(p.equipped || {})) {
          if (eq && (eq.itemId === 'bark_armor' || eq.itemId === 'hide_armor') && !armor.includes(eq.itemId)) armor.push(eq.itemId);
        }
        for (const m of Object.keys(mats)) npcTotal[m] = (npcTotal[m] || 0) + mats[m];
        if (Object.keys(mats).length || armor.length) npcDetail.push({ vid: String(id), name: nameOf(Game, id), mats, armor });
      }
      return { day: nowDay(Game), stash, pack, npcTotal, npcDetail };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }

  const daily = [];
  const matTrace = [];
  // r107 FIX 2b: per-dawn lean/eligibility trace — names the gate that holds
  // when assignments are zero (lean day? trust? HP? wound? Haven?).
  const leanTrace = [];
  // r107 FIX 2: ever-substrate set — villagers ever hunter-substrate while
  // alive (the end snapshot masks dead hunters; see prereg).
  const huntEligEverSet = new Set();
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let holdingsStart = null;
  try { holdingsStart = holdingsSnap(Game); } catch (e) { holdingsStart = null; }
  let deadTail = 0;
  const teachDays = [];
  const teachLines = [];
  let teachStartIdx = 0;
  for (let d = 1; d <= DAYS; d++) {
    if (Game.over) break;
    // r103: NO teaching intervention — natural lessons only (r99/r101 question is settled).
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    try { matTrace.push(matSnap()); } catch (e) { warnOnce('matSnap', e); }
    // r107 FIX 2: per-dawn ever-substrate capture — isHunterSubstrate is a
    // pure read (getPerson + occupation word match; no RNG, no Game writes).
    try { for (const id of livingVids(Game)) { try { if (isHunterSubstrate(Game, id)) huntEligEverSet.add(String(id)); } catch (e) {} } } catch (e) { warnOnce('eligEver', e); }
    // r107 FIX 2b: per-dawn lean/eligibility trace — leanDay, playerAtHaven,
    // personHp and woundWithin are pure reads (queries + state reads; no
    // RNG, no Game writes). Names the gate that holds on zero-assignment
    // seeds. Runs in both legs; M0 re-verified after this change.
    try {
      const lean = leanDay(Game);
      let atHaven = null; try { atHaven = Game.playerAtHaven ? !!Game.playerAtHaven() : null; } catch (e) {}
      const subs = [];
      for (const id of livingVids(Game)) {
        let isSub = false; try { isSub = isHunterSubstrate(Game, id); } catch (e) {}
        if (!isSub) continue;
        let trust = null; try { trust = ((Game.state.village || {}).trust || {})[id]; } catch (e) {}
        let hp = null; try { hp = personHp(Game, ctx, id, nowDay(Game)); } catch (e) {}
        let w2 = null; try { w2 = !!woundWithin(ctx, id, nowDay(Game), 2); } catch (e) {}
        subs.push({ name: nameOf(Game, id), trust: trust === undefined ? null : trust, hp, wounded2d: w2 });
      }
      leanTrace.push({ day: nowDay(Game), lean, atHaven, subs });
    } catch (e) { warnOnce('leanTrace', e); }
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    let wv = null, lp2 = null;
    try { wv = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
    try { lp2 = Game.waveLedgerPoints ? Game.waveLedgerPoints(2) : null; } catch (e) {}
    daily.push({ day: nowDay(Game), alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over, wave: wv, ledger2: lp2 });
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  // r99: skill-economy rows (read-only slice of telemetry).
  const SKILL_TYPES = ['skill_lesson','skill_taught','villager_skill','villager_grant','villager_level_up','villager_seek_knowledge'];
  const skillRows = [];
  const resolveWho = (w) => {
    if (w == null) return null;
    if (w === 'player') return 'player';
    try { const n = nameOf(Game, w); return n || String(w); } catch (e) { return String(w); }
  };
  for (const t of tele) {
    if (!t || SKILL_TYPES.indexOf(t.type) < 0) continue;
    // Emission shapes (from src, not assumed): skill_lesson {teacher,learner,skill};
    // villager_skill {vid,skill}; skill_taught {ability} with NO actor;
    // villager_seek_knowledge {vid,teacher,ability}; villager_grant {vid,ability};
    // villager_level_up {vid,track}. tele() itself adds day/type only.
    let skill = null; try { skill = t.skill || t.ability || t.track || t.skillId || t.name || t.id || null; } catch (e) {}
    skillRows.push({ day: t.day, type: t.type,
      who: resolveWho(t.vid != null ? t.vid : (t.teacher != null ? t.teacher : null)),
      teacher: resolveWho(t.teacher), learner: resolveWho(t.learner),
      skill: skill == null ? null : String(skill).slice(0,80) });
  }
  const skillCounts = {}; for (const r of skillRows) skillCounts[r.type] = (skillCounts[r.type] || 0) + 1;
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  // r107 FIX 1: native guardrails + c3 summary keys (the r106 post-hoc
  // derivation, now written by the driver so step 14 needs no injection).
  const STARV_WORDS = ['starvat', 'hunger', 'thirst', 'dehydrat'];
  const starvationDeaths = deaths.filter(d => STARV_WORDS.some(w => String(d.cause || '').toLowerCase().includes(w))).length;
  const guardrails = { deaths: deaths.length, popAlive: daily.length ? daily[daily.length - 1].alive : null, pantryKcal: Math.round(pantryKcal(Game)) };
  const c3 = { starvationDeaths };
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    let ownedArmor = []; try { ownedArmor = ((p && p.items) || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
    let known = null;
    try {
      const k = p && (p.knownPlants || p.known || p.codex);
      known = k ? (Array.isArray(k) ? k.length : Object.keys(k).length) : null;
    } catch (e) {}
    let skills = null;
    try { if (typeof Game.skillsKnownBy === 'function') skills = Game.skillsKnownBy(id) || []; } catch (e) {}
    if (skills == null) { try { const sk = p && (p.skills || p.learnedSkills || p.knownSkills); if (sk) skills = Array.isArray(sk) ? sk.map(String).slice(0, 20) : Object.keys(sk).slice(0, 20); } catch (e) {} }
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, ownedArmor, knownCount: known, skills });
  }
  // r105: holdings snapshot at end + the player's own owned abilities.
  let holdingsEnd = null;
  try { holdingsEnd = holdingsSnap(Game); } catch (e) { holdingsEnd = null; }
  let playerAbilitiesEnd = null;
  try { playerAbilitiesEnd = (typeof Game.ownedAbilityIds === 'function') ? (Game.ownedAbilityIds() || []) : null; } catch (e) {}
  // Player armor + recipes.
  let playerPackArmor = [];
  try { playerPackArmor = ((Game.state.scholar || {}).inventory || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
  let playerEquipped = [];
  try { const sp = Game.getPerson ? Game.getPerson(Game.villagerId) : null; playerEquipped = Object.values((sp && sp.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
  let playerRecipes = null;
  try { const rc = ((Game.state.codex || {}).recipes) || {}; playerRecipes = { bark_armor: (rc.bark_armor || {}).level || 0, hide_armor: (rc.hide_armor || {}).level || 0 }; } catch (e) {}
  const contestTele = tele.filter(t => t && typeof t.type === 'string' && /contest/i.test(t.type)).map(t => ({ day: t.day, type: t.type, id: t.id || null, result: t.outcome || t.result || null }));
  const contestCounts = {};
  for (const t of contestTele) contestCounts[t.type] = (contestCounts[t.type] || 0) + 1;

  // People check: 2 held convos at end of run (first two living
  // non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  convoLines.push('=== r107 PEOPLE CHECK (2 held convos, end of run; no teaching intervention this run) ===');
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  if (Game.over) convoLines.push('(people check skipped: game over — r81 driver flaw fixed, no post-collapse sample)');
  for (const vid of (Game.over ? [] : living.slice(0, 2))) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  const teleTypes = {};
  for (const t of tele) { const k = (t && t.type) || '?'; teleTypes[k] = (teleTypes[k] || 0) + 1; }
  const teleAll = tele.map((t, seq) => {
    const o = { seq, day: (t && t.day) || null, type: (t && t.type) || '?' };
    if (t) for (const k of Object.keys(t)) { if (k === 'day' || k === 'type') continue; const v = t[k]; o[k] = (typeof v === 'string') ? v.slice(0, 120) : (typeof v === 'number' || typeof v === 'boolean' ? v : (v == null ? null : String(v).slice(0, 120))); }
    return o;
  });
  let playerCodexSkills = null, avCraftEnd = null;
  try { playerCodexSkills = JSON.parse(JSON.stringify(((Game.state.codex || {}).skills) || {})); } catch (e) {}
  try { avCraftEnd = JSON.parse(JSON.stringify(((Game.state.village || {}).avCraft) || {})); } catch (e) {}
  // r107 ARM CAPTURE: the layer's own ctx logs (assignments / refusals /
  // wounds) + an end-of-run eligibility snapshot (read-only reads; the
  // snapshot diagnoses a zero-assignment panel by naming which gate held).
  let huntStaff = null, huntEligEnd = null;
  try {
    huntStaff = {
      layerOn: process.env.HUNTSTAFF === '1',
      assignments: ctx._hsAssignments || 0,
      assignLog: ctx._hsAssignLog || [],
      refusalLog: ctx._hsRefusalLog || [],
      woundLog: ctx._hsWoundLog || [],
    };
  } catch (e) { huntStaff = { error: e.message }; }
  try {
    const vv = Game.state.village || {};
    huntEligEnd = (vv.roster || []).map(id => {
      let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      let sub = null; try { sub = isHunterSubstrate(Game, id); } catch (e) {}
      return { id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
        occ: (p && p.formerOccupation) || '?', isHunterSubstrate: sub,
        trust: ((vv.trust || {})[id] === undefined ? null : vv.trust[id]),
        hp: ((vv.health || {})[id] === undefined ? null : vv.health[id]),
        assignedTask: (((vv.assignments || {})[id] || {}).task) || null };
    });
  } catch (e) { huntEligEnd = null; }
  // r107 FIX 2: materialize the ever-substrate capture (read-only; a hunter
  // dead by the end stays visible here even though the end snapshot says
  // isHunterSubstrate=false for the dead).
  let huntEligEver = null;
  try {
    huntEligEver = Array.from(huntEligEverSet).map(id => {
      let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      return { id: String(id), name: nameOf(Game, id), dead: isDead(Game, id), occ: (p && p.formerOccupation) || '?' };
    });
  } catch (e) { huntEligEver = null; }
  const out = { seed, run: 'r107', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus, holdingsStart, holdingsEnd, playerAbilitiesEnd,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, matTrace, craftLog, craftWrap, npcCraftLog, npcCraftWrap,
    huntLog, huntWrap, careLog, careWrap, careCalls, healerLog, healerWrap, healerCalls,
    treatLog, treatWrap, treatCalls, cookLog, cookWrap,
    huntStaff, huntEligEnd, huntEligEver, leanTrace, guardrails, c3,
    playerPackArmor, playerEquipped, playerRecipes,
    contestTele: contestTele.slice(0, 100), contestCounts, waveSysLines: waveSysLines.slice(0, 60), teleTypes, skillRows: skillRows.slice(0, 500), skillCounts, teachDays, teleAll, playerCodexSkills, avCraftEnd };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r107-seed${seed}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(EVID, `journey-establishment-r107-convo-seed${seed}.txt`), convoLines.join('\n'));
  const teachSum = teachDays.reduce((a, r) => { a[r.kind] = (a[r.kind] || 0) + 1; return a; }, {});
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} pantryEnd=${out.pantryKcalEnd} craftLog=${craftLog.length} npcCraftCalls=${npcCraftLog.length} contests=${JSON.stringify(contestCounts)} skills=${skillRows.length} teach=${JSON.stringify(teachSum)} hunt=${huntLog.length}(${huntLog.filter(h => h.kcal > 0).length} kills) care=${careLog.length}(${careLog.reduce((a, c) => a + (c.tends || 0), 0)} tends) healer=${healerLog.length} treat=${treatLog.length} cook=${cookLog.length} hsAssign=${(huntStaff && huntStaff.assignments) || 0} hsRefuse=${(huntStaff && (huntStaff.refusalLog || []).length) || 0}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
