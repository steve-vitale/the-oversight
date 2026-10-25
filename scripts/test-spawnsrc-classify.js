#!/usr/bin/env node
// scripts/test-spawnsrc-classify.js — unit proof for the spawnsrc
// classifier (sim-spawnsrc-a). No harness, no game load: requires the
// policy module's pure classify() and asserts every source branch.
// Exit 1 on any failure.
'use strict';
const { classify } = require('./policies/spawnsrc-diag');
const cases = [
  // [mdef, opts, flagStack, hint, expected]
  [{ id: 'x' }, {}, ['maintain'], '', 'maintain'],
  [{ id: 'x' }, {}, ['checkEncounter', 'maintain'], '', 'maintain'],
  [{ id: 'x' }, { titan: true }, [], '', 'scripted-titan'],
  ['hushwolf', { stance: 'circle' }, [], '', 'scripted-hushwolf'],
  [{ id: 'x' }, { stance: 'fearful', hp: 10 }, [], '', 'fled-recovery'],
  [{ id: 'x' }, { beamPhase: 'grounded' }, [], '', 'trap'],
  [{ id: 'bulldozer', name: 'Bulldozer', wave: 1, hp: [20, 20] }, {}, ['checkEncounter'], '', 'tile-entry'],
  [{ id: 'bulldozer', veteran: false }, {}, ['checkEncounter'], '', 'wanderer-contact'],
  [{ id: 'x' }, {}, ['checkEncounter'], '', 'wanderer-contact'],
  [{ id: 'x', foo: 'bar' }, {}, ['checkEncounter'], '', 'checkEncounter-other'],
  [{ id: 'x' }, {}, [], '', 'unknown'],
  [{ id: 'x', foo: 'bar' }, {}, [], 'checkEncounter,worldTick', 'checkEncounter-other'],
  [{ id: 'x' }, {}, [], 'maintainWorldMonsters,worldTick', 'maintain'],
];
let fail = 0;
for (const [mdef, opts, stack, hint, want] of cases) {
  const got = classify(mdef, opts, stack, hint);
  const ok = got === want;
  if (!ok) fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} classify(${JSON.stringify(mdef)}, ${JSON.stringify(opts)}, ${JSON.stringify(stack)}, '${hint}') = '${got}' (want '${want}')`);
}
if (fail) { console.error(`CLASSIFY: ${fail} failures`); process.exit(1); }
console.log(`CLASSIFY: ${cases.length}/${cases.length} pass`);
