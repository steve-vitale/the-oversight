'use strict';
// competent-routeblock-b.js — ROUTE-BLOCKAGE policy variant
// (sim-routeblock-b, Loop B food-economy arm, 2026-11-01).
//
// Prereg: evidence/2026-11-01/sim-routeblock-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// FROZEN RULE (one sentence, from the prereg): during competent.daily
// only, turn ON the three creekpath gates that are OFF in the foraging
// path — COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND, and
// COMPETENT_STANDING_HOME — and restore the previous env values in a
// finally, so the baseline policy object is byte-identical outside
// this wrapper's daily window.
//
// WHAT EACH GATE CHANGES (competent.js, read 2026-11-01; the gates
// already exist there as env switches, this file only flips them):
//   - COMPETENT_ROUTE_AROUND=1: any walkTo refused step triggers a BFS
//     route-around over travelBlockage-clean orthogonal steps, walking
//     the first step of the found path. Without it walkTo stops dead
//     at the refused step. This affects ALL walkTo callers (trips,
//     stone runs, vine seeks, feast patrol), not just returns.
//   - COMPETENT_TRIPHOME_ROUTE_AROUND=1: forage-trip return legs
//     (walkHome call sites in forageTripSeedFirst) run walkTo with
//     the detour flag set for that leg only; detour steps taken are
//     banked in ctx.tripHomeDetours. Without it returns use plain
//     walkTo and stop dead at a refusal.
//   - COMPETENT_STANDING_HOME=1: end-of-daily goHomeStanding — a
//     villager who ends the day away from the haven (tile check
//     alone, not the playerAtHaven narration gate), not inside a
//     tent, with the haven on this board, walks home via walkHome
//     (so with the trip-home gate also on, the standing walk
//     detours). Banks ctx.standingHomeDays / standingHomeDetours.
//     Without it there is NO standing go-home rule: the villager
//     simply stays away, even starving with a clear hop home.
// FALLBACK when a gate cannot help: route-around returns false when
// no BFS path exists and walkTo stops exactly as with the gate OFF;
// goHomeStanding's guards skip (game over, combat, tent, haven not
// on board). ON permits detours; it never forces movement.
//
// ENGAGEMENT COUNTING: competent.js already banks tripHomeDetours,
// standingHomeDays, and standingHomeDetours in ctx; the driver reads
// per-day deltas. General walkTo route-around steps (stone runs,
// vine seeks, feast patrol) are NOT banked by competent.js, so their
// engagement is not counted separately — a stated caveat in the
// prereg, not a number this arm invents.
const { competent } = require('./competent');

const ROUTEBLOCK_GATES = [
  'COMPETENT_ROUTE_AROUND',
  'COMPETENT_TRIPHOME_ROUTE_AROUND',
  'COMPETENT_STANDING_HOME',
];

// Run fn with all three gates ON, restoring previous env values
// afterwards (including after a throw). Exported for tests.
function withGates(fn) {
  const prev = {};
  for (const k of ROUTEBLOCK_GATES) prev[k] = process.env[k];
  for (const k of ROUTEBLOCK_GATES) process.env[k] = '1';
  try {
    return fn();
  } finally {
    for (const k of ROUTEBLOCK_GATES) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}

const routeblock = Object.assign({}, competent, {
  id: 'competent-routeblock-b',
  desc: 'competent + route-blockage gates: ROUTE_AROUND + TRIPHOME_ROUTE_AROUND + STANDING_HOME on during daily only (sim-routeblock-b)',
  daily(Game, ctx) {
    withGates(() => competent.daily(Game, ctx));
  },
});

module.exports = {
  routeblock, ROUTEBLOCK_GATES, _withGates: withGates,
};
