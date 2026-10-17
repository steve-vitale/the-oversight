'use strict';
// scripts/policies/huntstaff.js — hunt-duty staffing layer (arm sim-huntstaff-b2).
//
// REBUILT 2026-10-17 for the sim-huntstaff-b2 re-run. Zero src/js changes.
// Policy-side staffing for the hunt-duty blank (finding #492: the base policy
// never assigns 'hunt'; 0/672 in the census).
//
// Spec (evidence/2026-10-17/sim-huntstaff-b.md §"The layer (built per the
// corrected spec)" — unchanged from the killed sim-huntstaff-b pilot; the b
// pilot was killed at pilot on a metric-broken median-survival gate (§14
// escape hatch), NOT on a mechanism failure: 48 assignments fired, 41 kills,
// 177k kcal, zero hunt-attributable deaths):
//
//   HUNTSTAFF=1 gate (default OFF; unset = pure delegation to the base policy).
//   counterPlay-adjacent assignBest('hunt', corrected hunter word list)
//   with gates:
//   (a) lean/starvation day: pantryFreshDays() < 4 (the engine's own
//       PRODTHROTTLE threshold) OR scholar kcal < 50% cap OR < 500.
//   (b) hunter-substrate villager: free (roster, alive, unassigned),
//       formerOccupation matches the CORRECTED word list (from
//       sim-huntroster-b named fix spec §3 — NOT the ghost-occupation list
//       of the old huntduty spec, which matches only 'infantry soldier'),
//       HP>=40 (read from village.health the engine's own way), trust>=40
//       (avoids the 40% reluctant roll; the engine's trust-20 gate, HP
//       gate and in-person gate still enforce themselves).
//   (c) one hunter at a time: no existing 'hunt' assignment; once per day
//       (ctx-day key).
//
// The pass fires in the wrapper's upkeep + daily hooks when the scholar is
// at Haven (in-person assignment is the engine's honest line).
//
// Canon (read before touching): CANON.md (hunting is human-skill lane — the
// layer assigns LABOR, never an alien ability), PRESERVATION.md (the kill
// lands 'Game meat' in the pantry, first rung of the preservation ladder),
// BEAR.md (the safety argument for gates b/c), TIME-ECONOMY.md (assignTask
// is a 2-tick social move).
//
// Gate-off neutrality: staffHunt returns null before touching ctx or the
// engine when HUNTSTAFF is unset. The det-gate (test-huntstaff-b2.js Part B)
// pins wrapped-off trajectories byte-identical to pristine.

// CORRECTED staffing handle (sim-huntroster-b named fix spec §3). Ghost
// occupations from the old huntduty list ('hunter','tracker','ranger',
// 'poacher','marine') deliberately do NOT match — e.g. 'tracker' alone
// matches nothing here.
const HUNTER_WORDS = ['hunting guide', 'fishing guide', 'trail crew',
  'rancher', 'forager', 'bush pilot', 'exterminator', 'soldier'];

function layerOn() { return process.env.HUNTSTAFF === '1'; }

function leanDay(G) {
  try {
    if (G.pantryFreshDays && G.pantryFreshDays() < 4) return true; // engine's own PRODTHROTTLE line
    const s = (G.state && G.state.scholar) || {};
    const kcal = s.kcal || 0;
    if (kcal < 500) return true;                                  // starving scholar
    try {
      if (G.kcalCap && kcal < 0.5 * G.kcalCap()) return true;     // eating into the buffer
    } catch (e) {}
    return false;
  } catch (e) { return false; }
}

function isHunterSubstrate(G, vid) {
  // SUBSTRATE = background only: does this villager's occupation belong to
  // the corrected hunter word list? The point-in-time eligibility gates
  // (free/alive/HP/trust) are applied separately in hunterCandidates —
  // this mirrors the killed b pilot's proven fixture contract.
  try {
    const p = (G.getPerson ? G.getPerson(vid) : null) || {};
    const occ = String(p.formerOccupation || '').toLowerCase();
    return HUNTER_WORDS.some(w => occ.includes(w));   // corrected list only
  } catch (e) { return false; }
}

function hunterCandidates(G) {
  // Gate (b): free (roster, alive, unassigned) + hunter-substrate
  // + HP>=40 + trust>=40.
  try {
    const v = (G.state && G.state.village) || {};
    const asg = v.assignments || {};
    const out = [];
    for (const id of (v.roster || [])) {
      if (id === G.villagerId) continue;                          // never the scholar
      if (asg[id]) continue;                                      // not free
      if (!isHunterSubstrate(G, id)) continue;
      const hp = (v.health || {})[id];
      if (typeof hp === 'number' && hp < 40) continue;             // wounded don't walk the treeline
      const trust = (v.trust || {})[id];
      if (typeof trust === 'number' && trust < 40) continue;      // avoid the 40% reluctant roll
      try { const p = G.getPerson ? G.getPerson(id) : null; if (p && p.dead) continue; } catch (e) {}
      out.push(id);
    }
    return out;
  } catch (e) { return []; }
}

// staffHunt(G, ctx): one firing of the staffing pass. Returns the assigned
// vid on success, null on gate-off or any refusal. Gate OFF: returns null
// before ANY ctx or Game write (det-gate neutrality). Fires at most once
// per game-day (ctx._hsDay key).
function staffHunt(G, ctx) {
  if (!layerOn()) return null;                                    // gate-off: zero writes, zero RNG
  const day = ((G.state && G.state.scholar) || {}).day || 0;
  if (ctx && ctx._hsDay === day) return null;                     // once per day
  if (!leanDay(G)) return null;                                   // gate (a): lean days only
  try {
    if (G.playerAtHaven && !G.playerAtHaven()) return null;       // in-person is the honest line
  } catch (e) { return null; }
  const v = (G.state && G.state.village) || {};
  const asg = v.assignments || {};
  for (const k of Object.keys(asg)) {                             // gate (c): one hunter at a time
    if (asg[k] && asg[k].task === 'hunt') return null;
  }
  const cands = hunterCandidates(G);
  if (!cands.length) return null;
  // counterPlay-adjacent assignBest: hunter-substrate villagers, best
  // villagerCompetence for 'hunt' first.
  cands.sort((a, b) => {
    let sa = 0, sb = 0;
    try { if (G.villagerCompetence) sa = G.villagerCompetence(a, 'hunt') || 0; } catch (e) {}
    try { if (G.villagerCompetence) sb = G.villagerCompetence(b, 'hunt') || 0; } catch (e) {}
    return sb - sa;
  });
  const vid = cands[0];
  if (ctx) ctx._hsDay = day;                                      // day key consumed on attempt
  let r = null;
  try { r = G.assignTask(vid, 'hunt', { via: 'in-person' }); } catch (e) { return null; }
  const refused = (r === null) || (r && r.refused);
  if (refused) return null;                                       // engine's gates (trust/HP/obedience) are the last word
  if (ctx) {                                                      // telemetry only on an accepted fire
    ctx._hsAssignments = (ctx._hsAssignments || 0) + 1;
    const log = ctx._hsAssignLog = ctx._hsAssignLog || [];
    let name = vid, occ = '';
    try {
      const p = G.getPerson ? G.getPerson(vid) : null;
      if (p) { name = p.name || vid; occ = p.formerOccupation || ''; }
    } catch (e) {}
    log.push({ day, vid, name, occ });                            // hunter-fate instrument reads this
  }
  return vid;
}

// withHuntStaff(base, id, tag): wrap a base policy. The upkeep + daily hooks
// fire the staffing pass BEFORE the base policy's own hooks (once per day
// via the ctx-day key), then delegate to the base hooks unchanged.
// Gate OFF: staffHunt returns null with zero side effects — the wrapped
// policy is trajectory-neutral vs the pristine base.
function withHuntStaff(base, id, tag) {
  const wrapped = Object.assign({}, base, { id: id || ((base && base.id) + '+huntstaff') });
  const oUpkeep = base.upkeep, oDaily = base.daily;
  wrapped.upkeep = function (Game, ctx) {
    staffHunt(Game, ctx);
    let r;
    if (oUpkeep) r = oUpkeep(Game, ctx);
    return r;
  };
  wrapped.daily = function (Game, ctx) {
    staffHunt(Game, ctx);
    let r;
    if (oDaily) r = oDaily(Game, ctx);
    return r;
  };
  return wrapped;
}

module.exports = {
  HUNTER_WORDS,
  layerOn, leanDay, isHunterSubstrate, hunterCandidates, staffHunt, withHuntStaff,
};
