#!/usr/bin/env node
// test-nowalkin-20261025.js — journey-endgame r50 proof for the
// CAPABLE_NOWALKIN_W4 rule (scripts/policies/capable.js ACTION_PLAN).
// The rule declines peacemaker.walk_in ONLY when a wave-4+ monster is in
// the fight and the env gate is set; everything else is byte-identical
// behavior. No game harness needed: ACTION_PLAN entries are pure
// functions of the turn read I.
// Usage: node scripts/test-nowalkin-20261025.js  (exit 0 = all pass)
'use strict';
const { ACTION_PLAN } = require('./policies/capable');

const walkIn = ACTION_PLAN['peacemaker.walk_in'];
if (typeof walkIn !== 'function') { console.error('FAIL: peacemaker.walk_in plan missing'); process.exit(1); }

function mockI(waves, outmatched) {
  return {
    outmatched: !!outmatched,
    mons: waves.map(w => ({ mdef: { wave: w }, key: 'm_' + w })),
    n: () => 0,
  };
}
let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = got === want;
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: got=${got} want=${want}`);
}

delete process.env.CAPABLE_NOWALKIN_W4;
check('gate off + wave 4 + outmatched -> 8.5', walkIn(mockI([4], true)), 8.5);
check('gate off + wave 2 + outmatched -> 8.5', walkIn(mockI([2], true)), 8.5);
check('gate off + not outmatched -> null', walkIn(mockI([4], false)), null);

process.env.CAPABLE_NOWALKIN_W4 = '1';
check('gate on + wave 4 + outmatched -> null (declined)', walkIn(mockI([4], true)), null);
check('gate on + wave 5 + outmatched -> null (declined)', walkIn(mockI([5], true)), null);
check('gate on + wave 2 + outmatched -> 8.5 (still talks)', walkIn(mockI([2], true)), 8.5);
check('gate on + mixed waves 2+4 + outmatched -> null', walkIn(mockI([2, 4], true)), null);
check('gate on + no monsters + outmatched -> 8.5 (no wave-4 present)', walkIn(mockI([], true)), 8.5);
check('gate on + wave 4 + not outmatched -> null (base rule)', walkIn(mockI([4], false)), null);
check('gate on + monster without mdef + outmatched -> 8.5 (no wave known)', walkIn([{ key: 'm_x' }].length ? { outmatched: true, mons: [{ key: 'm_x' }], n: () => 0 } : null), 8.5);

delete process.env.CAPABLE_NOWALKIN_W4;
check('gate restored off + wave 4 -> 8.5 (no leak)', walkIn(mockI([4], true)), 8.5);

console.log(`\nnowalkin proof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
