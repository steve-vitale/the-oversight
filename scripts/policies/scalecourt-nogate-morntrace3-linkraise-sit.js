// scalecourt-nogate-morntrace3-linkraise-sit — journey-scale r109 POLICY ARM
// (2026-11-07, lane A).
//
// POLICY-SIDE ONLY. ZERO src/js changes, no changes to any existing policy
// file. Composes the r108 linkraise policy with the two proven table
// drivers, reused via require (not a copy):
//   seatdrive.js  — withSeatDrive: at dawn, when Game.tablePreview() is
//                   ready, takes the seat via the REAL Game.tableTakeSeat()
//                   (guard-classified; SEATDRIVE=0 opts out).
//   modalplay.js  — withModalPlay: at dawn, drains a pending table modal
//                   via the REAL Game.chooseTableOption() (door rule =
//                   highest-strength EARNED door per the engine's own
//                   tableEarnedPaths() pricing, tie-break
//                   beloved/feared/relay/assimilated/defiant/witness/
//                   indispensable; beats by the drain precedent, NEVER
//                   the trial — MODALPLAY=1 opts in).
//
// COMPOSITION ORDER (deliberate): withSeatDrive OUTSIDE withModalPlay, so
// the sit opens the modal and the drain plays it the SAME dawn (the
// seatdrive-stack placement precedent — seatdrive outside windefer).
// The seat-taker is NEVER chosen by this policy: tableTakeSeat() with no
// sitter id uses the engine default (the player character), exactly as an
// unchosen sitting does in the real game (Steve 2026-10-26, item 495:
// only the player chooses who takes the seat).
//
// Env gates, set explicitly by the r109 driver per leg:
//   BASELINE (SIT=0): SEATDRIVE=0, MODALPLAY unset -> both layers pure
//     delegation, byte-identical to r108's armed (linkraise) policy.
//   ARMED (default): SEATDRIVE=1, MODALPLAY=1 -> sit + drain live.
// The driver sets these before any seed runs; the layers also read env
// at call time, so a stray env cannot silently arm a baseline leg — the
// proof pins the delegation (RED phase) for both gates.
'use strict';
const LR = require('./scalecourt-nogate-morntrace3-linkraise');
const SD = require('./seatdrive');
const MP = require('./modalplay');

const sitPolicy = SD.withSeatDrive(
  MP.withModalPlay(LR.linkraisePolicy,
    'scalecourt-linkraise-modalplay',
    'scalecourt-linkraise + modalplay (MODALPLAY=1): plays the table modal — the 7 doors by the proven strength/tie-break rule, beats by the drain precedent, never the trial'),
  'scalecourt-linkraise-sit',
  'scalecourt-linkraise + seatdrive (SEATDRIVE=1) + modalplay (MODALPLAY=1): takes the table seat when the invitation is pending (engine-default sitter), then plays the modal the same dawn'
);

module.exports = {
  sitPolicy: sitPolicy,
  linkraisePolicy: LR.linkraisePolicy,
  resetLinkraiseStats: LR.resetLinkraiseStats,
  linkraiseStats: LR.linkraiseStats,
  linkRaiseDrive: LR.linkRaiseDrive,
  COURT_READY: LR.COURT_READY,
};
