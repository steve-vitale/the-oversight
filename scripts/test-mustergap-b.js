#!/usr/bin/env node
// test-mustergap-b.js — unit proof SKELETON for scripts/policies/mustergap.js
// (sim-mustergap-b). Committed with the prereg BEFORE any judged sim; the
// full case set lands in the next commit, before the driver runs.
// Intended proofs (see prereg): 0 roster/monster/link reads by the policy;
// commit fires only on a short, still-standing sounded muster; two-tap
// across two dailies; no commit when ready, spent, uncalled, or haven-full.
'use strict';
let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('PASS ' + name); }
  else { failures++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
check('skeleton loads (full cases follow)', true);
console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
