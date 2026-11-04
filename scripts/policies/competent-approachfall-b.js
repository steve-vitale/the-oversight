// competent-approachfall-b — approach-fallback variant policy (arm
// sim-approachfall-b, Loop B run fleshout-loop-b-20261104T1030Z).
//
// POLICY-SIDE ONLY. ZERO src/js changes. Changes NO default: competent.js
// defaults are untouched; this variant opts into existing gates plus the
// new approach-fallback gate for measurement only. Landing any of it as
// default play is a coordinator/Steve call, never made here.
//
// Gates enabled by this variant (and ONLY by this variant):
//   COMPETENT_DIRECTIONAL_FLEE=1 — havenward barrier-push flee path
//     (same substrate as the fleerepair confirm's armed leg).
//   COMPETENT_EXIT_VERIFIED_FLEE=1 — legacy stuck-flee resolution +
//     consumed-push verification (kept on for symmetry with confirm).
//   COMPETENT_FLEE_REPAIR=1 — directional-branch flee repair (confirm).
//   COMPETENT_APPROACH_FALLBACK=1 — CLOSE THE DISTANCE blocked-step
//     fallback in competent.js: 3 consecutive zero-movement approach
//     steps mark the fight approach-blocked; a blocked fight re-picks
//     a reachable adjacent tile, else WAITS for the monster to move.
// DPS_RACE stays OFF (killed lever). No gate/price/deed change, no
// monster-flee change (players only).
'use strict';
process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
process.env.COMPETENT_FLEE_REPAIR = '1';
process.env.COMPETENT_APPROACH_FALLBACK = '1';
const base = require('./competent');
module.exports = { competent: base.competent, competentEat: base.competentEat };
