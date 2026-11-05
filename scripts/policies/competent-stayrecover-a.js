// competent-stayrecover-a — staying variant policy (arm sim-stayrecover-a,
// build "longer staying in fights", Steve order 2026-11-05).
//
// POLICY-SIDE except for the one engine verb it calls
// (Game.tbEatRations in src/js/game.js). Changes NO default:
// competent.js defaults are untouched; this variant opts into the
// confirmed flee-repair gates PLUS the new in-fight recovery gate,
// for measurement only. Landing any of it as default play is a
// coordinator/Steve call, never made here.
//
// Gates enabled by this variant (and ONLY by this variant):
//   COMPETENT_DIRECTIONAL_FLEE=1 — havenward barrier-push flee path.
//   COMPETENT_EXIT_VERIFIED_FLEE=1 — consumed-push verification.
//   COMPETENT_FLEE_REPAIR=1 — directional-branch flee repair
//     (confirmed by this arm's replication panel before the R leg
//     is judged; if confirm fails, this variant is not used).
//   COMPETENT_RECOVER=1 — in-fight recovery: a hurt fighter eats
//     from the day ration (250 kcal -> +25 HP, costs the action)
//     when a monster is in range and not one strike from death.
// DPS_RACE stays OFF (killed lever). APPROACH_FALLBACK stays OFF
// (landed separately; not a confound here). No gate/price/deed
// change, no damage/HP change, no monster-flee change.
'use strict';
process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
process.env.COMPETENT_FLEE_REPAIR = '1';
process.env.COMPETENT_RECOVER = '1';
const base = require('./competent');
module.exports = { competent: base.competent, competentEat: base.competentEat };
