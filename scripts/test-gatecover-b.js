#!/usr/bin/env node
// test-gatecover-b.js — PURE proof tests for sim-gatecover-b.
// No game load, no judged seeds, no file writes. Run:
//   node scripts/test-gatecover-b.js
// Exit 0 iff every check passes; each failure prints its name.
'use strict';
const { marginRecovery, gateEngagedFromConditions, gateFailReason } = require('./analyze-gatecover-b');
const { recoveryAfterConfirmation } = require('./analyze-falsefire-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function series(days, vals) {
  // days: first loopDay; vals: pantry per evening, null = missing evening
  return vals.map((v, k) => ({ loopDay: days + k, pantryKcal: v }));
}

// --- Margin recovery: the 51316 shape (+5 kcal single bounce) is noise.
{
  // candidate level 21250, confirmed day 14; day 15 = 21255 (+5), day 16 = 21158 (below)
  const s = series(15, [21255, 21158, 20874, 20480, 17700, 17925, 16500, 18289, 17500, 15700]);
  const m = marginRecovery(s, 14, 21250);
  check('51316-like +5 single bounce is NOT a margin recovery', m.recovered === false && m.recoveryDay == null, m);
  const settled = recoveryAfterConfirmation(s, 14, 21250);
  check('51316-like bounce IS a settled recovery (subset relation)', settled.recoveredWithin10 === true && settled.recoveryDay === 15, settled);
}
// --- Margin breach: the 51602 shape (+20.7%) still counts as recovery.
{
  const s = series(23, [15579, 16000, 16930, 16401, 22097, 21421, 30148, 29000, 28000, 27000]);
  const m = marginRecovery(s, 22, 18300);
  check('51602-like margin breach IS a margin recovery on day 27', m.recovered === true && m.recoveryDay === 27 && m.reason === 'margin', m);
}
// --- Sustained tiny pair counts (durability), even below the margin.
{
  const s = series(15, [21255, 21260, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000]);
  const m = marginRecovery(s, 14, 21250);
  check('sustained tiny pair IS a margin recovery on second day', m.recovered === true && m.recoveryDay === 16 && m.reason === 'sustained', m);
}
// --- Single at-level evening, undone next evening, is noise.
{
  const s = series(15, [21250, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000]);
  const m = marginRecovery(s, 14, 21250);
  check('single at-level evening alone is NOT a margin recovery', m.recovered === false, m);
}
// --- Two separated tiny bounces are noise (never sustained, never margin).
{
  const s = series(15, [21255, 20000, 21260, 20000, 19000, 18000, 17000, 16000, 15000, 14000]);
  const m = marginRecovery(s, 14, 21250);
  check('two separated tiny bounces are NOT a margin recovery', m.recovered === false, m);
}
// --- Missing evening breaks a sustained pair.
{
  const s = [{ loopDay: 15, pantryKcal: 21255 }, { loopDay: 16, pantryKcal: null },
             { loopDay: 17, pantryKcal: 21260 }, { loopDay: 18, pantryKcal: 20000 },
             { loopDay: 19, pantryKcal: 19000 }, { loopDay: 20, pantryKcal: 18000 },
             { loopDay: 21, pantryKcal: 17000 }, { loopDay: 22, pantryKcal: 16000 },
             { loopDay: 23, pantryKcal: 15000 }, { loopDay: 24, pantryKcal: 14000 }];
  const m = marginRecovery(s, 14, 21250);
  check('missing evening breaks sustained pair', m.recovered === false, m);
}
// --- No recovery in a full horizon: sustained slide, not censored.
{
  const s = series(15, [20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000, 11000]);
  const m = marginRecovery(s, 14, 21250);
  check('full horizon below level: no recovery, not censored', m.recovered === false && m.censored === false && m.observedEvenings === 10, m);
}
// --- Short horizon, no recovery: censored.
{
  const s = series(25, [14000, 13000, 12000, 11000, 10000, 9000]);
  const m = marginRecovery(s, 24, 15072);
  check('short horizon, no recovery: censored', m.recovered === false && m.censored === true && m.observedEvenings === 6, m);
}
// --- Exactly 105% counts as a margin breach (>=, not >).
{
  const s = series(15, [22313, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000]);
  // 1.05 * 21250 = 22312.5, so 22313 breaches; 22312 would not.
  const m = marginRecovery(s, 14, 21250);
  check('exactly-at-105% (rounded up) breaches', m.recovered === true && m.reason === 'margin', m);
  const s2 = series(15, [22312, 20000, 19000, 18000, 17000, 16000, 15000, 14000, 13000, 12000]);
  const m2 = marginRecovery(s2, 14, 21250);
  check('just below 105% single evening is noise', m2.recovered === false, m2);
}
// --- Gate-condition truth table (src/js/game.js: prodThrottleEngaged
// = freshDays > 4 AND hungryStreak < 3; gate = gateOn AND that).
check('gate: fresh 4.10, streak 1, on -> engaged (51608 day 11)', gateEngagedFromConditions(true, 4.10, 1) === true);
check('gate: fresh 3.39, streak 0, on -> disengaged (51608 day 12)', gateEngagedFromConditions(true, 3.39, 0) === false);
check('gate: fresh 10.98, streak 6, on -> disengaged, hunger-exempt (51608 day 25)', gateEngagedFromConditions(true, 10.98, 6) === false);
check('gate: fresh exactly 4.0 -> disengaged (strict >)', gateEngagedFromConditions(true, 4.0, 0) === false);
check('gate: fresh 4.01, streak 0 -> engaged (hairline above)', gateEngagedFromConditions(true, 4.01, 0) === true);
check('gate: gate off -> disengaged whatever the pantry', gateEngagedFromConditions(false, 10, 0) === false);
check('gate: streak exactly 3 -> disengaged', gateEngagedFromConditions(true, 5, 3) === false);
check('gate: streak 2, plenty -> engaged', gateEngagedFromConditions(true, 5, 2) === true);
check('fail reason: day 12 shape is not-plenty', gateFailReason(true, 3.39, 0) === 'not-plenty');
check('fail reason: day 25 shape is hunger-exempt', gateFailReason(true, 10.98, 6) === 'hunger-exempt');
check('fail reason: engaged shape reports engaged', gateFailReason(true, 4.10, 1) === 'engaged');
check('fail reason: both fail reports not-plenty+exempt', gateFailReason(true, 3.0, 4) === 'not-plenty+exempt');

console.log('test-gatecover-b: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
