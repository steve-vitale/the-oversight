// policies/muster-sound-b.js — call-sounding muster policy (arm
// sim-muster-b, Loop B 20261124, axis winnability-chain). POLICY ONLY:
// zero src/js changes. Composes the four proven sounding legs over
// plain competent, in the order that makes each leg's precondition
// true before the next leg acts:
//
//   competent -> titanroute -> musterclose -> mustergap -> commitrefresh
//
//   titanroute: march to the heard lair tile + sound the call once
//     (Game.soundTitanCall('herald')).
//   musterclose: deepen ONE own link pre-call toward trusted-and-current
//     (trust >= 70, opinion >= 10, arrears 0) so it answers at quota 6.
//   mustergap: one two-tap commit-own episode after the call
//     (Game.titanCommitOwn('herald') twice in one daily).
//   commitrefresh: re-commit Haven blades after a drop below last-seen,
//     while the gate is unmet.
//
// Each leg keeps its own perception-law guardrails (heard lair line
// only; own links only; own muster record only; no monster/allied
// rosters read by any leg). No RNG is consumed by the legs, so arm /
// control trajectories differ ONLY through the sounding actions and
// their consequences. The control leg is the existing tbrefuse corpus
// (competent verbatim, same seeds 109310-109325, same 150d) — no
// control re-run; the before/after is paired per seed.
//
// The commit verb IS reachable from policy (mustergap and closedecay
// already call it from policy), so this stack judges the FULL 10
// (allied + Haven), never the allied leg only.
'use strict';

const { competent } = require('./competent');
const TR = require('./titanroute');
const MC = require('./musterclose');
const MG = require('./mustergap');
const CR = require('./commitrefresh');

function musterSoundB() {
  const rt = TR.withTitanRoute(competent, 'muster-sound-b-route', 'competent + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'muster-sound-b-close', 'muster-sound-b-route + musterclose deepening');
  const mg = MG.withMusterGap(mc, 'muster-sound-b-gap', 'muster-sound-b-close + mustergap commit-own');
  return CR.withCommitRefresh(mg, 'muster-sound-b', 'muster-sound-b-gap + commitrefresh');
}

module.exports = { musterSoundB };
