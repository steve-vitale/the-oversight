// breakline-lib — branch + flag break classifiers for sim-breakline-a.
// Pure functions over recorder rows; no game loads, no RNG, no writes.
//
// BRANCH classifier (the headline census): classifies by ENGINE BRANCH,
// using log-line booleans the breakline recorder computes from rec.log
// at record time (capLine / hopelessLine / learnLine) plus rec flags.
//   KILL: outcome vKill.
//   CAP: rounds >= 15 AND cap line present (sub = vFlee/mFlee outcome).
//   DRIVE-OFF: outcome mFlee, no cap line.
//   PARTY-DEATH: outcome vDie.
//   HOPELESS-BRANCH: vFlee + hopeless line ("sees how this ends").
//   LEARN-BRANCH: vFlee + learn line ("has seen enough").
//   TRICK-EXIT: vFlee + fleeWise.
//   FLOOR-BRANCH: vFlee + none of the above (the fleeAt floor check,
//     fieldFights.js:1625), sub = floor-hopeless-true/false.
//   OTHER: none of the above.
// Priority is first-match-wins in the order above. Note the hopeless
// branch can also set fleeLearn (intent learn), and the floor branch
// sets fleeHopeless = the round's hopeless value — so branch and
// flag taxonomies agree on KILL/CAP/DRIVE-OFF/PARTY-DEATH but split
// the vFlee pool differently BY DESIGN (see classifyFlags).
//
// FLAG classifier (the w4dpr2-lib classifyBreak taxonomy, re-expressed
// over stored booleans so waves 1-2 classify without a stored log):
// same priority order as classifyBreak, with capLine substituted for
// the log scan. The fixtures prove classifyFlags == classifyBreak on
// every wave-3/4 fought fight in the w4dpr2 corpus (where both exist).
'use strict';

function classifyBranch(f) {
  if (!f) return { reason: 'OTHER', sub: 'null' };
  if (f.outcome === 'vKill') return { reason: 'KILL', sub: 'vKill' };
  if ((f.rounds | 0) >= 15 && f.capLine) return { reason: 'CAP', sub: String(f.outcome) };
  if (f.outcome === 'mFlee') return { reason: 'DRIVE-OFF', sub: ((f.trickLog || []).length ? 'trick' : 'breakline') };
  if (f.outcome === 'vDie') return { reason: 'PARTY-DEATH', sub: 'vDie' };
  if (f.outcome === 'vFlee' && f.hopelessLine) return { reason: 'HOPELESS-BRANCH', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && f.learnLine) return { reason: 'LEARN-BRANCH', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && f.fleeWise) return { reason: 'TRICK-EXIT', sub: 'vFlee' };
  if (f.outcome === 'vFlee') return { reason: 'FLOOR-BRANCH', sub: f.fleeHopeless ? 'floor-hopeless-true' : 'floor-hopeless-false' };
  return { reason: 'OTHER', sub: String(f.outcome) };
}

// Mirror of w4dpr2-lib.classifyBreak over stored booleans. In
// classifyBreak, TRICK-EXIT is checked AFTER LEARN-WITHDRAWAL and
// requires fleeWise && vFlee with neither flag set (the HOPELESS and
// LEARN checks come first); WOUND-FLOOR is vFlee with neither flag.
function classifyFlags(f) {
  if (!f) return { reason: 'OTHER', sub: 'null' };
  if (f.outcome === 'vKill') return { reason: 'KILL', sub: 'vKill' };
  if ((f.rounds | 0) >= 15 && f.capLine) return { reason: 'CAP', sub: String(f.outcome) };
  if (f.outcome === 'mFlee') return { reason: 'DRIVE-OFF', sub: ((f.trickLog || []).length ? 'trick' : 'breakline') };
  if (f.outcome === 'vDie') return { reason: 'PARTY-DEATH', sub: 'vDie' };
  if (f.outcome === 'vFlee' && f.fleeHopeless) return { reason: 'HOPELESS', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && f.fleeLearn && !f.fleeHopeless) return { reason: 'LEARN-WITHDRAWAL', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && f.fleeWise) return { reason: 'TRICK-EXIT', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && !f.fleeHopeless && !f.fleeLearn) return { reason: 'WOUND-FLOOR', sub: 'vFlee' };
  return { reason: 'OTHER', sub: String(f.outcome) };
}

module.exports = { classifyBranch, classifyFlags };
