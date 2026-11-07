// competent-stageally-noinvites-b — bisection variant for sim-stageally-stab-b
// (run fleshout-loop-b-20261107T0530Z). POLICY-SIDE ONLY, zero src/js.
// Staged verbatim EXCEPT the party invites are removed: the rally fight
// hook + pending record stay, the daily hook is base competent only
// (no stageParty call). If neutralizing the invites cuts the staged flip
// rate by >=50%, the invite/conversation draws are the amplifier; if
// not, they are exonerated.
'use strict';
const base = require('./competent');
const competent = base.competent;
const RALLY = require('./competent-rally-bankkiller-b');
const STAGED = require('./competent-stageally-a');

const policy = Object.assign({}, RALLY.rallyPolicy, {
  id: 'competent-stageally-noinvites-b',
  desc: 'competent + round-1 rally in wave-4+ TB fights + pending record, WITHOUT the party-invite staging (bisection variant; DIAG only)',
  daily: function (Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
  },
  pending: STAGED.stagedPolicy.pending,
});

module.exports = { policy: policy };
