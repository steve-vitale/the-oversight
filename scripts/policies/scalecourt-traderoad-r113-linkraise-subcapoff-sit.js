// scalecourt-traderoad-r113-linkraise-subcapoff-sit — journey-scale r245 POLICY ARM
// (2026-11-09, lane A).
//
// POLICY-SIDE ONLY. ZERO src/js changes. Clone of
// scalecourt-traderoad-r113-linkraise-sit.js (frozen; untouched) with
// ONE change: it composes the r245 sub-cap-off linkraise policy instead
// of the r113 one. The seatdrive + modalplay layers are reused via
// require (not a copy), composition order and env gates unchanged
// (SEATDRIVE=1, MODALPLAY=1 armed; see the base file's header).
'use strict';
const LR = require('./scalecourt-traderoad-r113-linkraise-subcapoff');
const SD = require('./seatdrive');
const MP = require('./modalplay');

const sitPolicy = SD.withSeatDrive(
  MP.withModalPlay(LR.linkraisePolicy,
    'scalecourt-traderoad-r113-linkraise-subcapoff-modalplay',
    'scalecourt-traderoad-r113-linkraise-subcapoff + modalplay (MODALPLAY=1): plays the table modal — the 7 doors by the proven strength/tie-break rule, beats by the drain precedent, never the trial'),
  'scalecourt-traderoad-r113-linkraise-subcapoff-sit',
  'scalecourt-traderoad-r113-linkraise-subcapoff + seatdrive (SEATDRIVE=1) + modalplay (MODALPLAY=1): takes the table seat when the invitation is pending (engine-default sitter), then plays the modal the same dawn'
);

module.exports = {
  sitPolicy: sitPolicy,
  linkraisePolicy: LR.linkraisePolicy,
  resetLinkraiseStats: LR.resetLinkraiseStats,
  linkraiseStats: LR.linkraiseStats,
  linkRaiseDrive: LR.linkRaiseDrive,
  COURT_READY: LR.COURT_READY,
};
