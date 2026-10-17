// policies/delegate.js — the delegating player layer (journey r12, 2026-10-17).
//
// withDelegate(base, id) layers task delegation onto a competent-derived
// policy. Each day-part, when the scholar (the leader) is at Haven, idle
// villagers get tasks matched to their occupation profile via
// Game.assignTask (the leader's core verb, talk-menu wired).
//
// WHY: the establishment leg (days 14-40) is the delegation window —
// specialists emerge when the leader puts the right hands on the right
// work. r11 (2026-10-17) found the competent policy never assigns tasks
// (asg={} empty on all seeds, all weeks), so the whole delegation economy
// goes unexercised in sims. This policy exercises it the way a real
// delegating player would: at dawn, face-to-face, by fit.
//
// DIEGETIC RULES (a real player could do exactly this):
//   - in-person only (via:'in-person'): the leader must be at Haven.
//     No remote assignment without the remoteAssign ability (engine gates it).
//   - wounded rest: hp < 40 -> 'rest' (the engine's own honesty rule).
//   - danger is real: 'hunt'/'patrol' go only to the able (hp >= 60 AND a
//     combat record or a combat occupation) — the leader doesn't feed
//     civilians to the treeline.
//   - fit first: specialistSkill(butcher/cook/preserver) -> 'cook';
//     fisherman/sailor -> 'fish'; farmers/gardeners -> 'garden';
//     the well-read -> 'teach'; crafters -> 'mend'; everyone else by need
//     (pantry low -> forage, water low -> water, else wood/stone).
//   - one assignment per villager per part; skip villagers who already
//     have one (engine deletes them after resolution).
//
// DETERMINISM: seeded policy RNG only (global.__policyRandom). Every
// Game call try/catch-guarded. Never mutates the shared policy object
// (sweep-compare shallow-copies per run).
'use strict';
const { competent } = require('./competent');

function prand() {
  try { return (global.__policyRandom || Math.random)(); } catch (e) { return Math.random(); }
}

function livingVillagers(Game) {
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}

function personOf(Game, vid) {
  try { return Game.getPerson(vid) || {}; } catch (e) { return {}; }
}

function hpOf(Game, vid) {
  try {
    const h = ((Game.state.village || {}).health || {})[vid];
    return (h === undefined || h === null) ? 100 : h;
  } catch (e) { return 100; }
}

function combatCred(Game, vid) {
  // a combat record or a combat occupation — the leader's honest read of
  // who can be asked to face the treeline.
  try {
    const ag = Game.agencyOf ? Game.agencyOf(vid) : null;
    const kills = (((ag || {}).stats || {})[vid] || {}).monsterKills || 0;
    if (kills > 0) return true;
  } catch (e) {}
  const occ = String((personOf(Game, vid).formerOccupation || '')).toLowerCase();
  return /(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/.test(occ);
}

function specOf(Game, vid) {
  const p = personOf(Game, vid);
  const out = {};
  try {
    for (const t of ['butcher', 'cook', 'preserver', 'spotter', 'builder'])
      out[t] = Game.specialistSkill ? (Game.specialistSkill(p, t) || 0) : 0;
  } catch (e) {}
  return out;
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

function waterDays(Game) {
  try {
    const v = Game.state.village || {};
    const liv = livingVillagers(Game).length + 1;
    const sup = ((v.water || {}).clean || 0) + ((v.water || {}).dirty || 0);
    return sup / (2 * Math.max(1, liv));
  } catch (e) { return 99; }
}

// pick a task for one villager. Returns a delegateTasks() task id or null
// (null = leave them to their own objectives this part).
function pickTask(Game, vid, spec) {
  const hp = hpOf(Game, vid);
  if (hp < 40) return 'rest';
  const p = personOf(Game, vid);
  const occ = String(p.formerOccupation || '').toLowerCase();
  // fit first — the specialist economy
  if ((spec.cook || 0) >= 2 || (spec.preserver || 0) >= 2) return 'cook';
  if (/fisherman|sailor|fisher/.test(occ)) return 'fish';
  if (/farmer|gardener|botanist|herbalist/.test(occ)) return 'garden';
  if (/carpenter|mechanic|engineer|tailor|seamstress/.test(occ)) return 'mend';
  if (/teacher|professor|librarian|nurse|doctor|midwife/.test(occ) && prand() < 0.5) return 'teach';
  // danger only for the able
  if (hp >= 60 && combatCred(Game, vid)) {
    const r = prand();
    if (r < 0.35) return 'patrol';
    if (r < 0.6) return 'hunt';
  }
  // everyone else by need
  const pantry = pantryKcal(Game);
  const wd = waterDays(Game);
  const r = prand();
  if (wd < 1.5) return 'water';
  if (pantry < 6000) return 'forage';
  if (r < 0.4) return 'wood';
  if (r < 0.55) return 'water';
  if (r < 0.7) return 'stone';
  if (r < 0.8) return 'scout';
  return 'forage';
}

function delegateBeat(Game, ctx) {
  if (!Game || Game.over) return 0;
  let atHaven = false;
  try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
  if (!atHaven) return 0; // in-person only — no remote control without the ability
  let asg = {};
  try { asg = (Game.state.village || {}).assignments || {}; } catch (e) {}
  let n = 0;
  for (const vid of livingVillagers(Game)) {
    if (asg[vid]) continue; // already has work this part
    let spec = {};
    try { spec = specOf(Game, vid); } catch (e) {}
    const task = pickTask(Game, vid, spec);
    if (!task) continue;
    let had = false;
    try { had = !!((Game.state.village || {}).assignments || {})[vid]; } catch (e) {}
    try { Game.assignTask(vid, task, { via: 'in-person' }); } catch (e) {}
    try {
      const rec = ((Game.state.village || {}).assignments || {})[vid];
      if (rec && !had) { n++; ctx['delegated_' + task] = (ctx['delegated_' + task] || 0) + 1; }
      else if (!rec && !had && task !== 'rest') { ctx.delegateRefused = (ctx.delegateRefused || 0) + 1; }
    } catch (e) {}
  }
  ctx.delegated = (ctx.delegated || 0) + n;
  return n;
}

function withDelegate(base, id) {
  const policy = Object.assign({}, base, { id });
  const baseUpkeep = base.upkeep, baseDaily = base.daily, baseFight = base.fight;
  policy.upkeep = function (Game, ctx) {
    if (baseUpkeep) { try { baseUpkeep(Game, ctx); } catch (e) {} }
    // delegate each part: assignments resolve per part, so re-issue to the idle.
    try { delegateBeat(Game, ctx); } catch (e) {}
  };
  policy.daily = function (Game, ctx) {
    if (baseDaily) { try { baseDaily(Game, ctx); } catch (e) {} }
  };
  if (baseFight) {
    policy.fight = function (Game, ctx) {
      try { return baseFight(Game, ctx); } catch (e) { return false; }
    };
  }
  return policy;
}

const delegate = withDelegate(competent, 'delegate');

module.exports = { withDelegate, delegate, delegateBeat };
