// test-person-trust-bar-shape.js — proof for the r136 bar-shape adoption
// (journey-landing r136 prereg Q1a, per the r135 metric review).
//
// The adopted rule: baseline counts under 4 allow ±1 absolute; counts
// >= 4 stay ±25%; zero baseline still allows +2. This test requires the
// live withinTol from test-person-trust-20261108.js (which exports it and
// guards its main block behind require.main) and asserts the boundaries:
//   - the r129 flip (FORAGE 2 vs baseline 1) PASSES under the new rule
//     and FAILS under the old ±25% rule — the change does the work claimed;
//   - a 2-errand flip at count 1 (3 vs 1) still FAILS;
//   - a ±2 flip at count 2 (4 vs 2) still FAILS;
//   - large-count behavior is unchanged (±25% still binds).
//
// Usage: node scripts/test-person-trust-bar-shape.js
'use strict';
const { withinTol, withinTolOld } = require('./test-person-trust-20261108');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); }
}

// The r129 flip: FORAGE 2 vs baseline 1.
ok('r129 flip passes new rule (2 vs 1)', withinTol(2, 1) === true, 'got=' + withinTol(2, 1));
ok('r129 flip fails old rule (2 vs 1)', withinTolOld(2, 1) === false, 'got=' + withinTolOld(2, 1));
// Exact baseline still passes.
ok('exact count passes (1 vs 1)', withinTol(1, 1) === true);
ok('zero vs 1 passes new rule (0 vs 1)', withinTol(0, 1) === true);
// A 2-errand flip at count 1 still fails — the bar is not a waiver.
ok('2-errand flip still fails (3 vs 1)', withinTol(3, 1) === false, 'got=' + withinTol(3, 1));
// Count 2: ±1 absolute.
ok('one flip at count 2 passes (1 vs 2)', withinTol(1, 2) === true);
ok('one flip at count 2 passes (3 vs 2)', withinTol(3, 2) === true);
ok('two flips at count 2 fail (4 vs 2)', withinTol(4, 2) === false, 'got=' + withinTol(4, 2));
ok('two flips at count 2 fail (0 vs 2)', withinTol(0, 2) === false, 'got=' + withinTol(0, 2));
// Count 3: ±1 absolute (old rule admitted only exactly 3).
ok('one flip at count 3 passes (2 vs 3)', withinTol(2, 3) === true);
ok('one flip at count 3 passes (4 vs 3)', withinTol(4, 3) === true);
ok('two flips at count 3 fail (5 vs 3)', withinTol(5, 3) === false, 'got=' + withinTol(5, 3));
// Large counts: ±25% unchanged.
ok('large count inside 25% passes (200 vs 187)', withinTol(200, 187) === true);
ok('large count outside 25% fails (140 vs 187)', withinTol(140, 187) === false, 'got=' + withinTol(140, 187));
ok('large count just inside 25% passes (233 vs 187)', withinTol(233, 187) === true);
ok('large count just outside 25% fails (234 vs 187)', withinTol(234, 187) === false, 'got=' + withinTol(234, 187));
// Zero baseline: +2 absolute, unchanged.
ok('zero baseline allows +2 (2 vs 0)', withinTol(2, 0) === true);
ok('zero baseline rejects +3 (3 vs 0)', withinTol(3, 0) === false, 'got=' + withinTol(3, 0));

console.log(fail ? ('FAIL ' + fail + ' / pass ' + pass) : ('PASS all ' + pass));
process.exit(fail ? 1 : 0);
