// competent-fleerepair-a — flee-repair variant policy (arm sim-fleerepair-a,
// Loop A run fleshout-20261104T0115Z, axis scale-onramp).
//
// POLICY-SIDE ONLY. ZERO src/js changes. Changes NO default: competent.js
// defaults are untouched; this variant opts into existing gates plus the
// new flee-repair gate for measurement only. Landing any of it as default
// play is a coordinator/Steve call, never made here.
//
// Gates enabled by this variant (and ONLY by this variant):
//   COMPETENT_DIRECTIONAL_FLEE=1 — havenward barrier-push flee path
//     (the legacy walk-to-x-edge never pushes without DPS_RACE).
//   COMPETENT_EXIT_VERIFIED_FLEE=1 — legacy stuck-flee resolution +
//     consumed-push verification (legacy branch; kept on for symmetry).
//   COMPETENT_FLEE_REPAIR=1 — directional-branch repair in competent.js:
//     consumed push marks unfleeable; failed flee step falls through to
//     a strike when in range; 3 stuck directional turns mark unfleeable.
// DPS_RACE stays OFF (killed lever). No gate/price/deed change, no
// monster-flee change (players only).
'use strict';
process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
process.env.COMPETENT_FLEE_REPAIR = '1';
const base = require('./competent');
module.exports = { competent: base.competent, competentEat: base.competentEat };
