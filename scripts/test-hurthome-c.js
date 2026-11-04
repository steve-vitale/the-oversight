'use strict';
// test-hurthome-c.js — proof for the sim-hurthome-fix-c retrospective
// case coverage fix (ordered by sim-hurthome-fix-b's metric review:
// a hurt-return line firing without an open case must open a case
// retrospectively, the line itself being the event record).
// Pure lib logic only: no harness, no RNG.
// Usage: node scripts/test-hurthome-c.js
const assert = require('assert');
const lib = require('./hurthome-b-lib');

let pass = 0;
function check(name, fn) { fn(); pass += 1; console.log('ok - ' + name); }

check('retro opens a case whose event is the return tick', () => {
  const open = new Map();
  const r = lib.retroCase(open, 'v1', 42, 3, 'expedition', 5, 'Fernando');
  assert.strictEqual(r.action, 'opened');
  assert.strictEqual(r.case.eventDay, 42);
  assert.strictEqual(r.case.eventPart, 3);
  assert.strictEqual(r.case.source, 'retro-line');
  assert.strictEqual(r.case.censorNote, 'retroLineCase');
  assert.strictEqual(r.case.purpose, 'expedition');
  assert.strictEqual(r.case.hpAtEvent, 5);
  assert.strictEqual(r.case.outcome, 'open');
});
check('retro case closes returned-hurt at latency 0 in the same tick', () => {
  const open = new Map();
  lib.retroCase(open, 'v1', 42, 3, 'expedition', 5, 'Fernando');
  const c = lib.closeReturned(open, 'v1', 42, 3, 5, null);
  assert.strictEqual(c.outcome, 'returned-hurt');
  assert.strictEqual(lib.latencyParts(c), 0);
});
check('retro refuses when a case is already open', () => {
  const open = new Map();
  lib.hurtStep(open, 'v1', 42, 1, { sinceDay: 40, sincePart: 0, purpose: 'expedition' }, 5, {});
  const r = lib.retroCase(open, 'v1', 42, 3, 'expedition', 5, 'Fernando');
  assert.strictEqual(r.action, 'none');
  assert.strictEqual(open.get('v1').source, 'hurtVillager');
});
check('retro refuses LEAVE walk-outs', () => {
  const open = new Map();
  const r = lib.retroCase(open, 'v1', 42, 3, 'leave', 5, 'Raj');
  assert.strictEqual(r.action, 'none');
  assert.strictEqual(open.size, 0);
});
check('retro refuses non-hurt hp', () => {
  const open = new Map();
  for (const hp of [0, 8, 50, null]) {
    assert.strictEqual(lib.retroCase(open, 'v1', 42, 3, 'forage', hp, 'X').action, 'none');
  }
  assert.strictEqual(open.size, 0);
});
check('retro case does not disturb the open-case map for other villagers', () => {
  const open = new Map();
  lib.hurtStep(open, 'v1', 42, 1, { sinceDay: 40, sincePart: 0, purpose: 'forage' }, 4, {});
  lib.retroCase(open, 'v2', 42, 3, 'hunt', 6, 'Boris');
  assert.strictEqual(open.size, 2);
  assert.strictEqual(open.get('v1').source, 'hurtVillager');
  assert.strictEqual(open.get('v2').source, 'retro-line');
});

console.log(`test-hurthome-c: ${pass}/${pass} green`);
