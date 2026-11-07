// finishersize-instrument-20261106.js — finisher-size recorder (arm
// sim-finishersize-a, run fleshout-20261107T0221Z). Scripts only, zero src/js.
//
// Layers on the grind instrument (which layers partydamage) and decorates
// each field-fight row with the finisher-size audit fields the engine
// records on `rec` (see fieldFights.js, sim-finishersize-a):
//   fsMetBelowBreak / fsMeetHp / fsMeetFrac / fsEntryVhpFrac / fsIntent /
//   fsNoCommitWhy — the contact evaluation, present whenever the
//   contact-finish branch is evaluated (wave >= 3, beast below break line).
//   fsCommitKind ('met-below-break' vs twoblow's unset kind) /
//   fsCommitMhp / fsCommitStrike / fsCommitRounds / fsLapsed — the commit.
// On pre-change code these fields are absent and read as false/null; the
// analyzer treats that as "no commit" and derives below-break meetings
// from entryFrac / contactFinishAttempted, which exist in both legs.
//
// The wrapper adds zero RNG draws and zero game-state writes; a recording
// failure is counted in instrumentErrors and the original result is
// returned untouched. Usage mirrors grind-instrument: install(Game) returns
// the base (with .t); snapshot/finalize/uninstall are the base's.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const GRIND = require(path.join(REPO, 'scripts', 'grind-instrument-20261106'));

function install(Game) {
  const base = GRIND.install(Game);
  const t = base.t;
  const innerFF = Game.fieldFight;
  if (typeof innerFF !== 'function') { t.instrumentErrors.push('fieldFight-missing-fs'); return base; }
  Game.fieldFight = function (vid, mdef, m, opts) {
    const before = (t.fieldFights || []).length;
    let rec = null;
    try { rec = innerFF.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const rows = t.fieldFights || [];
      if (rows.length > before) {
        const row = rows[rows.length - 1];
        row.fsMetBelowBreak = !!(rec && rec.fsMetBelowBreak);
        row.fsMeetHp = (rec && rec.fsMeetHp != null) ? rec.fsMeetHp : null;
        row.fsMeetFrac = (rec && rec.fsMeetFrac != null) ? rec.fsMeetFrac : null;
        row.fsEntryVhpFrac = (rec && rec.fsEntryVhpFrac != null) ? +Number(rec.fsEntryVhpFrac).toFixed(3) : null;
        row.fsIntent = (rec && rec.intent != null) ? String(rec.intent) : null;
        row.fsNoCommitWhy = (rec && rec.fsNoCommitWhy != null) ? String(rec.fsNoCommitWhy) : null;
        row.fsCommitKind = (rec && rec.committedFinishKind != null) ? String(rec.committedFinishKind) : null;
        row.fsCommitMhp = (rec && rec.fsCommitMhp != null) ? rec.fsCommitMhp : null;
        row.fsCommitStrike = (rec && rec.fsCommitStrike != null) ? rec.fsCommitStrike : null;
        row.fsCommitRounds = (rec && rec.fsCommitRounds != null) ? (rec.fsCommitRounds | 0) : null;
        row.fsLapsed = !!(rec && rec.fsLapsed);
        row.fsCommittedRounds = (rec && rec.committedRounds != null) ? (rec.committedRounds | 0) : null;
      }
    } catch (e) { t.instrumentErrors.push('fieldFight-fs-row: ' + String(e.message).slice(0, 80)); }
    return rec;
  };

  const origUninstall = base.uninstall;
  base.uninstall = function () {
    try { Game.fieldFight = innerFF; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return base;
}

module.exports = { install: install };
