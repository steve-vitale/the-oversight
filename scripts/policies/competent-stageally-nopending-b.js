// competent-stageally-nopending-b — NULL-CONTROL bisection variant for
// sim-stageally-stab-b (run fleshout-loop-b-20261107T0530Z). POLICY-SIDE
// ONLY, zero src/js. Staged verbatim EXCEPT the pending hook returns
// false without recording. The pending hook is record-only (it never
// delays, declines, or moves the scholar), so this variant MUST measure
// the same flip rate as staged: a different rate falsifies the method,
// not the game. If it matches staged, the method is sound and the
// rally/invite bisection can be read.
'use strict';
const STAGED = require('./competent-stageally-a');

const policy = Object.assign({}, STAGED.stagedPolicy, {
  id: 'competent-stageally-nopending-b',
  desc: 'competent + companion-staging + rally, WITHOUT the pending-encounter record (null-control bisection variant; DIAG only)',
  pending: function (Game, ctx) { return false; },
});

module.exports = { policy: policy };
