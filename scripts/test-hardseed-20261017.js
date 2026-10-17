#!/usr/bin/env node
// test-hardseed-20261017.js — proof for sim-hardseed (seed 1940809 autopsy).
// READ-ONLY: every input lives inside this tree; nothing is written.
// 1. DET-GATE (GREEN): the 4 canonical traces (sweep-time substrate, oldsub)
//    byte-match the sweep's stored hash trajectories — independent re-check,
//    not just the recorded field.
// 2. ATTRIBUTION COMPLETENESS: every aggregate death has a named deathLog
//    entry; binned causes match the deaths aggregate exactly.
// 3. SMOKE: all 4 runs village-lost in the day 45-55 window.
// 4. RED (gate not vacuous): the current-master exhibit FAILS the gate, and a
//    synthetic one-char mutation of a reference hash is caught — the gate
//    cannot pass a moved substrate.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const TREE = path.join(__dirname, '..');
const TR = path.join(TREE, 'evidence', '2026-10-17', 'perseed-hardseed-s1940809');
const REF = path.join(TREE, 'evidence', '2026-10-17', 'perseed-wincensus-c');
const SEED = 1940809;

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { fail++; console.log(`  FAIL ${name} — ${e.message}`); }
};

const combos = ['leadfeast-armed', 'leadfeast-control', 'belongfeast-armed', 'belongfeast-control'];

// 1. DET-GATE re-verified: canonical traces byte-match the sweep's trajectories.
for (const c of combos) {
  check(`detgate byte-identical: ${c}`, () => {
    const t = read(path.join(TR, `hardseed-${c}-s${SEED}.json`));
    const r = read(path.join(REF, `${c}-s${SEED}.json`));
    assert.strictEqual(t.detgate, 'PASS', 'recorded detgate field');
    assert.deepStrictEqual(t.hashes, r.hashes, 'hash trajectories byte-identical');
    assert.ok(t.hashes.length >= 45, `hash count ${t.hashes.length}`);
  });
}

// 2. ATTRIBUTION COMPLETENESS on fixtures.
const bin = (d) => String(d.cause || d.kind || 'unknown');
for (const c of combos) {
  check(`attribution complete: ${c}`, () => {
    const t = read(path.join(TR, `hardseed-${c}-s${SEED}.json`));
    const log = t.deathLog, agg = t.deaths;
    const total = Object.values(agg).reduce((a, b) => a + b, 0);
    assert.strictEqual(log.length, total, `deathLog ${log.length} == aggregate ${total}`);
    for (const e of log) {
      assert.ok(e.day >= 1 && e.day <= 60, `day ${e.day}`);
      assert.ok(e.name && e.name !== '?', 'named');
      assert.ok(e.kind && e.kind !== '?', 'kinded');
      assert.ok(e.cause && e.cause !== '?', 'caused');
    }
    const binned = {};
    for (const e of log) binned[bin(e)] = (binned[bin(e)] || 0) + 1;
    assert.deepStrictEqual(binned, agg, 'binned causes match aggregate');
  });
}

// 3. SMOKE: all four village-lost in the day-50 window.
for (const c of combos) {
  check(`smoke village-lost ~d50: ${c}`, () => {
    const t = read(path.join(TR, `hardseed-${c}-s${SEED}.json`));
    assert.strictEqual(t.endReason, 'village-lost');
    assert.ok(t.gameDays >= 45 && t.gameDays <= 55, `gameDays ${t.gameDays}`);
    assert.strictEqual(t.seed, SEED);
  });
}

// 4a. RED: current-master exhibit fails the gate (substrate moved).
check('RED: current-master exhibit fails det-gate', () => {
  const t = read(path.join(TR, `hardseed-leadfeast-armed-currentmaster-s${SEED}.json`));
  const r = read(path.join(REF, `leadfeast-armed-s${SEED}.json`));
  assert.strictEqual(t.detgate, 'FAIL', 'recorded detgate field');
  assert.notDeepStrictEqual(t.hashes, r.hashes, 'trajectories differ on current master');
  assert.notStrictEqual(t.gameDays, r.gameDays, 'outcomes differ on current master');
});

// 4b. RED: the comparison is not vacuous — a one-char mutation is caught.
check('RED: one-char hash mutation caught', () => {
  const r = read(path.join(REF, `leadfeast-armed-s${SEED}.json`));
  const mutated = r.hashes.slice();
  mutated[5] = mutated[5].slice(0, 10) + 'X' + mutated[5].slice(11);
  assert.notDeepStrictEqual(mutated, r.hashes);
});

console.log(`\ntest-hardseed: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
