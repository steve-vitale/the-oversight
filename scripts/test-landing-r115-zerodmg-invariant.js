// Proof test for the r115 R82 killing-blow fix (Q1, pre-registered).
// Invariant: a damage entry with sourceLabel 'you' IS a scholar strike
// landing — game.js:37329 is inside tbPlayerStrike, the only tbDamage call
// with that label. So any fight whose log carries 'you' damage MUST also
// carry >=1 player-strike entry.
//
// The old R82 wrapper resolved the current fight entry AFTER the strike,
// but a killing blow ends the fight inside tbPlayerStrike (tbEnd sets
// endResult), so the entry was already closed and the killing strike was
// dropped from the log. The r113 corpus proves the bug live: 4 fights
// carry 'you' damage with 0 recorded strikes (1065 d10, 1066 d17 x2,
// 1066 d23). The r115 driver captures the entry BEFORE the call, so on
// the r115 panel this invariant must hold on every fight.
//
// Usage: node scripts/test-landing-r115-zerodmg-invariant.js <census-dir>
//   r113 corpus (before): FAILS with 4 violations — the recorded bug.
//   r115 panel  (after):  PASSES with 0 violations — the fix works.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dir = process.argv[2];
assert(dir, 'usage: node scripts/test-landing-r115-zerodmg-invariant.js <census-dir>');
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();
assert(files.length > 0, 'no census files in ' + dir);

let fights = 0, violations = [];
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const x of (c.fights81 || [])) {
    fights++;
    const log = x.fightLog || [];
    const strikes = log.filter(e => e.turn === 'player-strike').length;
    const youDmg = log.filter(e => e.turn === 'damage' && e.sourceLabel === 'you')
      .reduce((a, e) => a + (e.applied || 0), 0);
    if (youDmg > 0 && strikes === 0) {
      violations.push('seed ' + c.seed + ' d' + x.day + ': youDmg=' + youDmg + ' with 0 recorded strikes (end=' + x.endResult + ')');
    }
  }
}
console.log('invariant check: ' + files.length + ' census files, ' + fights + ' fights, violations: ' + violations.length);
for (const v of violations) console.log('  VIOLATION: ' + v);
assert.strictEqual(violations.length, 0, 'killing strikes must be logged (R82 fix); violations: ' + violations.join(' | '));
console.log('test-landing-r115-zerodmg-invariant: PASS (' + fights + ' fights, 0 violations)');
