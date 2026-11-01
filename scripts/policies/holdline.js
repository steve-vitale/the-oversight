// holdline — hold-the-line crew policy (sim-stay-a, axis scale-onramp,
// run fleshout-loop-a-20261101T1555Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: HOLDLINE unset or not
// '1' → daily delegates to tableseat-nowait.daily with NO hold-line
// behavior at all (the det-gate in scripts/test-sim-stay-a-policy.js
// pins that: off daily is tableseat-nowait.daily, and the sweep's
// holdline-off leg must reproduce the baseline leg exactly).
//
// WHAT THIS IS — and what it is NOT (read before judging it):
// The 1415Z wave-4 corpus (sim-wave4leth-a, 67 offered fights) has
// ZERO scholar-led fights, and field-fight flee is ENGINE MORALE
// (vBreak, hopeless trajectory, learn intent, HP floor —
// src/js/fieldFights.js), not a player choice. There is NO honest
// policy mechanism for "never voluntarily flees": opts.noFlee seals
// contest arenas only, and wrapping the engine fight entry to
// mutate opts would be a game-code change smuggled through a
// wrapper. This policy does NOT do that, and does NOT claim to hold
// any line inside a fight.
//
// The ONE policy-reachable staying input is crew composition:
// resolvePatrol / resolveWildMonsterEncounter / aidFight /
// lingererSortie build fieldFight allies SOLELY from
// Game._outdoorCrew (resolveAssignments snapshot of assignments with
// task patrol/scout/hunt/forage), trust-sorted, allyVids capped at 2,
// and the engine NEVER reads tile co-location for party-up
// (fieldparty-form-diag, 2026-10-28). Crew membership IS the
// engine's presence model ("villagers on outdoor tasks are out in
// the wild together this part"). A bigger crew raises engage-intent
// (intent is 'engage' iff trick known OR allies > 0, else 'learn' —
// learn-intent villagers withdraw at round >= 3 when not winning)
// and shout availability (hopeless + allies > 0 + intent != learn).
// At most ONE ally ever joins, and joined allies are never targeted
// (0/65 fights with allyTaken > 0 on 1415Z) — this layer changes
// neither fact; it only widens the candidate pool the engine
// already reads.
//
// WHAT THE LAYER DOES (HOLDLINE=1, after the base daily, so base
// water/wood/garden/fish assignments keep priority):
//   - Only when Game.playerAtHaven() (assignTask's in-person rule;
//     away days attempt nothing and count as away, never forced).
//   - Only roster villagers who are alive, not the scholar, and NOT
//     currently assigned (never steals a base assignment).
//   - At most 2 NEW patrol assignments per day (cap). assignTask
//     refusals (obedience, fitness, away) counted, never retried
//     same day, never overridden.
//   - No other behavior: no gear, no food, no movement, no fight
//     interception, no fight-function wrap, no opts mutation.
//   - It does NOT touch villager ammo: no scholar policy can express
//     NPC pack management (sim-ammo-a, 2026-10-31), and the dawn
//     at-home top-up game-code lever was tried and KILLED. The
//     scholar's own arrowCraft already lives in competent and is
//     untouched here.
//
// A GO verdict means GO CANDIDATE as an instrument, default-OFF
// only — landing this as competent play is a coordinator/Steve
// call, NOT made by this arm. No default flips.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

const HL_MAX_NEW_PER_DAY = 2;
const HL_TASK = 'patrol';

function holdlineOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.HOLDLINE) || '0') === '1'; } catch (e) { return false; }
}
function hlGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function hlRoster(Game) {
  try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
}
function hlAssignments(Game) {
  try { return (Game.state.village || {}).assignments || {}; } catch (e) { return {}; }
}
function hlIsAlive(Game, vid) {
  try {
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p) return !p.dead;
    }
  } catch (e) {}
  // getPerson absent or silent: do not assume death; the obedience /
  // fitness gates in assignTask still apply, and assignTask itself
  // refuses the scholar. Roster membership is the only hard filter.
  return true;
}

// holdlineCrewLayer(Game, ctx): the single honest layer. Returns a
// counts object; never throws into the base daily.
function holdlineCrewLayer(Game, ctx) {
  const counts = { attempts: 0, assigned: 0, refused: 0, away: 0, skippedAssigned: 0 };
  try {
    if (!Game || typeof Game.assignTask !== 'function') return counts;
    let atHaven = false;
    try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { atHaven = false; }
    if (!atHaven) { counts.away = 1; return counts; }
    const scholarId = Game.villagerId || null;
    const asg = hlAssignments(Game);
    for (const vid of hlRoster(Game)) {
      if (counts.assigned >= HL_MAX_NEW_PER_DAY) break;
      if (scholarId && vid === scholarId) continue;
      if (asg[vid]) { counts.skippedAssigned++; continue; }
      if (!hlIsAlive(Game, vid)) continue;
      counts.attempts++;
      let r = null;
      try { r = Game.assignTask(vid, HL_TASK, { via: 'in-person' }); } catch (e) { r = null; }
      if (r && r.ok !== false) counts.assigned++;
      else counts.refused++;
    }
  } catch (e) { /* layer never throws: counts carry what happened */ }
  try {
    if (ctx) {
      ctx.hlAttempts = (ctx.hlAttempts || 0) + counts.attempts;
      ctx.hlAssigned = (ctx.hlAssigned || 0) + counts.assigned;
      ctx.hlRefused = (ctx.hlRefused || 0) + counts.refused;
      ctx.hlAwayDays = (ctx.hlAwayDays || 0) + (counts.away ? 1 : 0);
    }
  } catch (e) {}
  return counts;
}

const holdline = Object.assign({}, tableseatNowait, {
  id: 'holdline',
  desc: 'tableseat-nowait + hold-line crew layer (assign up to 2 free villagers to patrol per Haven day; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!holdlineOn()) return tableseatNowait.daily(Game, ctx);
    const r = tableseatNowait.daily(Game, ctx);
    try { holdlineCrewLayer(Game, ctx); } catch (e) {}
    return r;
  },
});

module.exports = { holdline, holdlineOn, holdlineCrewLayer, HL_MAX_NEW_PER_DAY, HL_TASK };
