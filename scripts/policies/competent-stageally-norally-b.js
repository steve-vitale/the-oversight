// competent-stageally-norally-b — bisection variant for sim-stageally-stab-b
// (run fleshout-loop-b-20261107T0530Z). POLICY-SIDE ONLY, zero src/js.
// Staged verbatim EXCEPT the rally is removed: daily staging (party
// invites at haven) + pending record stay, the fight hook is base
// competent. If neutralizing the rally cuts the staged flip rate by
// >=50%, the rally is the amplifier; if not, it is exonerated.
// The pending hook is the staged policy's own (record-only).
'use strict';
const base = require('./competent');
const competent = base.competent;
const STAGED = require('./competent-stageally-a');

const policy = Object.assign({}, competent, {
  id: 'competent-stageally-norally-b',
  desc: 'competent + companion-staging (party invites at haven) + pending record, WITHOUT the round-1 rally (bisection variant; DIAG only)',
  daily: function (Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    STAGED.stageParty(Game, ctx);
  },
  pending: STAGED.stagedPolicy.pending,
});

module.exports = { policy: policy };
