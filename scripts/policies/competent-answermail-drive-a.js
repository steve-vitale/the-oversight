// competent-answermail-drive-a — the answer-the-mail DRIVE instrument
// (arm sim-answermail-drive-a, run fleshout-20261110T1215Z).
//
// competent VERBATIM. This policy NEVER answers mail itself — that is
// the point of the arm. The answering is done by the GAME, through the
// additive-only, default-OFF engine hook in src/js/hierarchy.js
// (_answermailDriveDaily, called from hierarchyDaily): when the node
// environment carries ANSWERMAIL_DRIVE=1, the village's available
// representative — a living villager who can walk out, never the player
// — answers the pending first gesture with a gift, tends LEAD links
// weekly when the pantry holds > 20,000 kcal, answers staged
// renegotiation beats with grain, and honors pending demands. In the
// browser `process` is undefined, so the hook can never fire there and
// shipped play is byte-identical with the drive off.
//
// The armed leg is therefore `competent` + ANSWERMAIL_DRIVE=1 in the
// driver environment; the control leg is `competent` with the env
// unset. The difference from the answermail-a policy is the ACTOR
// (engine daily tick, not the player bot), the GATE (a living available
// villager must exist — a dead bench means unanswered mail, counted in
// the drive stats), and the TIMING (the next daily tick after staging,
// not the same day). Same four verbs, same pantry gates — the isolated
// measurement is whether the villager-side drive seasons links.
//
// The hook records its stats on Game.state.answermailDrive (created
// only when the flag is on). driveStats() reads them back for the
// driver; null means the drive never ran (the control leg must show
// null on every seed — the drive-off proof).
//
// Explicitly NOT here: proposing links, answering counters, answering
// national/global beats, tribute manipulation, arrears calls. The
// instrument answers mail that arrives; it does not write new mail.
'use strict';
const { competent } = require('./competent');

function driveStats(Game) {
  try {
    const ds = ((Game || {}).state || {}).answermailDrive || null;
    return ds ? JSON.parse(JSON.stringify(ds)) : null;
  } catch (e) { return null; }
}

const drivePolicy = Object.assign({}, competent, {
  id: 'competent-answermail-drive-a',
  desc: 'competent verbatim; ANSWERMAIL_DRIVE=1 arms the engine hook that answers the mail (default OFF)',
  daily(Game, ctx) {
    competent.daily(Game, ctx);
  },
});

module.exports = { drivePolicy: drivePolicy, driveStats: driveStats };
