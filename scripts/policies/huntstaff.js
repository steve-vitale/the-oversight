// scripts/policies/huntstaff.js — hunt-duty staffing layer, REBUILT for arm
// sim-huntstaff-b4 (the per-pair-collapse-aware re-attempt of the killed
// hunt-staffing line; see evidence/2026-10-18/sim-huntstaff-b3.md "Metric
// review" for the b4 spec, and evidence/2026-10-17/sim-huntstaff-b2.md
// §"The layer" for the layer spec this rebuilds byte-for-spec-byte).
//
// What it does: on LEAN days, when the scholar is at Haven, staff ONE
// hunter-substrate villager (human-skill lane — this assigns LABOR, never
// an alien ability; no System slot, no magic) to the engine's 'hunt' task
// via the engine's own assignTask (HP/in-person/obedience gates stay as the
// last word).
//
// Gates:
//   (a) lean/starvation day: pantryFreshDays() < 4 (the engine's own
//       PRODTHROTTLE threshold) OR scholar kcal < 50% cap OR < 500.
//   (b) hunter-substrate ONLY (b4 pin): formerOccupation matches
//       HUNTER_WORDS, free (roster, alive, unassigned), HP>=40, trust>=40.
//       The layer NEVER assigns a non-substrate villager — assignBest's
//       occ-word score is a bonus, so the layer pre-gates eligibility
//       itself before calling assignBest.
//   (c) one hunter at a time: no existing 'hunt' assignment; once per day
//       (ctx-day key).
// Fires in the wrapper's upkeep + daily hooks (once per day) when the
// scholar is at Haven (in-person is the honest line).
//
// Gate: HUNTSTAFF=1 (default OFF; unset = pure delegation to the base
// policy, zero writes). Zero src/js changes. Policy-side only.
//
// Telemetry: ctx._hsAssignments + ctx._hsAssignLog — only written when
// the layer fires; gate-off: zero writes (the det-gate depends on this).
'use strict';

// Hunter-substrate word list (CORRECTED, from huntroster-b named fix spec
// §3 — the occupations the village would trust with a hunt).
const HUNTER_WORDS = [
  'hunting guide', 'fishing guide', 'trail crew', 'rancher',
  'forager', 'bush pilot', 'exterminator', 'soldier',
];

function layerOn() {
  return process.env.HUNTSTAFF === '1';
}

// leanDay: read-only. TRUE when the village is on a lean/starvation day.
function leanDay(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const cap = (typeof Game.kcalCap === 'function' ? Game.kcalCap() : 2400) || 2400;
    const kcal = s.kcal || 0;
    if (kcal < cap * 0.5 || kcal < 500) return true;
    if (typeof Game.pantryFreshDays === 'function' && Game.pantryFreshDays() < 4) return true;
    return false;
  } catch (e) { return false; }
}

// isHunterSubstrate: the b4 hunter-only gate. TRUE iff the villager's
// formerOccupation matches the hunter word-list (the engine has no
// separate hunter flag — the word-list IS the substrate definition).
function isHunterSubstrate(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p || p.dead) return false;
    const occ = String(p.formerOccupation || '').toLowerCase();
    return HUNTER_WORDS.some(w => occ.includes(w));
  } catch (e) { return false; }
}

// eligibleHunters: free (roster, alive, unassigned) + substrate + HP>=40
// + trust>=40. The HUNTER-ONLY gate — no other villager can pass.
function eligibleHunters(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const asg = v.assignments || {};
    const health = v.health || {};
    const trust = v.trust || {};
    const out = [];
    for (const id of roster) {
      if (id === Game.villagerId) continue;   // the scholar leads, doesn't hunt
      if (asg[id]) continue;                  // already assigned
      if (!isHunterSubstrate(Game, id)) continue;
      const hp = health[id] !== undefined ? health[id] : 100;
      if (hp < 40) continue;                  // the engine's own fitness line
      if ((trust[id] || 0) < 40) continue;
      out.push(id);
    }
    return out;
  } catch (e) { return []; }
}

// staffHunt(Game, ctx): the staffing handle. Returns the vid staffed, or
// null on any gate refusal / gate-off / engine refusal.
function staffHunt(Game, ctx) {
  if (!layerOn()) return null;      // default OFF: zero writes, pure pass-through
  ctx = ctx || {};
  let day = 0;
  try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  if (ctx._hsDay === day) return null;         // (c) once per day
  if (!leanDay(Game)) return null;             // (a) lean days only
  try { if (!Game.playerAtHaven || !Game.playerAtHaven()) return null; }
  catch (e) { return null; }                   // in-person is the honest line
  try {
    const asg = ((Game.state || {}).village || {}).assignments || {};
    if (Object.values(asg).some(a => a && a.task === 'hunt')) return null; // (c) one at a time
  } catch (e) { return null; }
  const cands = eligibleHunters(Game);
  if (!cands.length) return null;              // (b) nobody eligible
  // best villagerCompetence first (the CORRECTED staffing handle)
  cands.sort((x, y) => {
    const cx = (Game.villagerCompetence ? Game.villagerCompetence(x, 'hunt') : 1) || 0;
    const cy = (Game.villagerCompetence ? Game.villagerCompetence(y, 'hunt') : 1) || 0;
    return cy - cx;
  });
  const vid = cands[0];
  ctx._hsDay = day;                            // attempt once per day, whatever the engine says
  let r = null;
  try { r = Game.assignTask(vid, 'hunt', { via: 'in-person' }); } catch (e) { return null; }
  if (!r || r.refused) return null;            // engine's obedience/Haven line said no — honest miss
  ctx._hsAssignments = (ctx._hsAssignments || 0) + 1;
  ctx._hsAssignLog = ctx._hsAssignLog || [];
  let p = null;
  try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  ctx._hsAssignLog.push({
    day, vid,
    name: (p && p.name) || vid,
    occ: (p && p.formerOccupation) || '',
  });
  return vid;
}

// withHuntStaff(base, id, src): wrap a base policy's upkeep+daily hooks.
// Gate-off: pure delegation, zero writes (det-gate neutrality).
function withHuntStaff(base, id, src) {
  const wrapped = Object.assign({}, base, { id: id || base.id });
  for (const h of ['upkeep', 'daily']) {
    const orig = base[h];
    wrapped[h] = (G, ctx) => {
      if (layerOn()) { try { staffHunt(G, ctx || {}); } catch (e) {} }
      if (orig) return orig(G, ctx);
    };
  }
  return wrapped;
}

module.exports = {
  withHuntStaff, staffHunt, leanDay, isHunterSubstrate, eligibleHunters,
  layerOn, HUNTER_WORDS,
};
