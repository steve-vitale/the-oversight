#!/usr/bin/env node
// test-lackingline-b.js — proof for sim-lackingline-b.
// T1: lacking-line unit tests (no game needed; the line
//   text itself is unit-proven here, exactly as in
//   test-woodcarry3-b.js T3).
// T2–T3: screen-census judge (requires --census <file>):
//   asserts the prereg INSUFFICIENT-DATA record — 60 seeds
//   screened, 3 ON creek evenings, 0 still-refused, 0 errs,
//   0 unclassified — and the gate diagnosis that no bridge
//   gate bound on any screened creek evening.
// T4: determinism (requires --det <orig> <rerun>:
//   byte-identical files for one ON seed); without --det
//   it is reported as NOT-CHECKED, not passed.
// Usage: node scripts/test-lackingline-b.js [--census F [--det A B]]
'use strict';
const fs = require('fs');
const assert = require('assert');
const { lackingLine } = require('./policies/woodcarry');

let pass = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.log('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}

// T1: the lines name the lack with live numbers.
t('T1a wood line names pack count and 4', () => {
  const l = lackingLine('wood-short', { woodPlayer: 2 });
  assert.ok(l.includes('2 log'), 'line: ' + l);
  assert.ok(l.includes('needs 4'), 'line: ' + l);
});
t('T1b kcal line names kcal and 60', () => {
  const l = lackingLine('kcal-short', { kcal: 30 });
  assert.ok(l.includes('30 kcal'), 'line: ' + l);
  assert.ok(l.includes('takes 60'), 'line: ' + l);
});
t('T1c ticks line names ticks and 96', () => {
  const l = lackingLine('ticks-short', { ticksToDayEnd: 40 });
  assert.ok(l.includes('40 ticks'), 'line: ' + l);
  assert.ok(l.includes('96 ticks'), 'line: ' + l);
});
t('T1d build/retry lines exist and name no false number', () => {
  assert.ok(lackingLine('build-refused', {}).includes('no bridge stands'));
  assert.ok(lackingLine('retry-refused', { hopReturnKind: 'block:creek' }).includes('block:creek'));
});

const argv = process.argv.slice(2);
const cIdx = argv.indexOf('--census');
const detIdx = argv.indexOf('--det');
if (cIdx !== -1) {
  const census = JSON.parse(fs.readFileSync(argv[cIdx + 1], 'utf8'));
  t('T2a screen covered 60 contiguous seeds 13300-13359', () => {
    assert.strictEqual(census.seedsScreened, 60);
    const seeds = census.perSeed.map((s) => s.seed);
    assert.strictEqual(seeds.length, 60);
    for (let i = 0; i < 60; i++) assert.strictEqual(seeds[i], 13300 + i);
  });
  t('T2b still-refused is 0 of 3 creek evenings', () => {
    assert.strictEqual(census.totalCreekEvenings, 3);
    assert.strictEqual(census.totalStillRefused, 0);
    assert.strictEqual(census.perSeed.reduce((a, s) => a + s.stillRefused, 0), 0);
  });
  t('T2c errs and unclassified are 0 on every screened seed', () => {
    for (const s of census.perSeed) {
      assert.strictEqual(s.errs, 0, 'seed ' + s.seed + ' errs');
      assert.strictEqual(s.unclassified, 0, 'seed ' + s.seed + ' unclassified');
    }
  });
  t('T3a no bridge gate bound on any screened creek evening', () => {
    const creek = census.perSeed.flatMap((s) => s.creek);
    assert.strictEqual(creek.length, 3);
    for (const e of creek) {
      assert.ok(e.woodPlayer >= 4, 'wood ' + e.woodPlayer);
      assert.ok(e.kcalLive >= 60, 'kcal ' + e.kcalLive);
      assert.ok(e.ticksToDayEnd >= 96, 'ticks ' + e.ticksToDayEnd);
    }
  });
  t('T3b all screened creek evenings rescued, no line owed', () => {
    const creek = census.perSeed.flatMap((s) => s.creek);
    for (const e of creek) {
      assert.strictEqual(e.rescued, true);
      assert.strictEqual(e.narration, null);
      assert.strictEqual(e.bridgeAttempted, true);
      assert.strictEqual(e.bridgeBuilt, true);
      assert.strictEqual(e.retryArrived, true);
    }
  });
  t('T3c funnel: 14 travel-refused of 1797 evenings', () => {
    const od = {};
    for (const s of census.perSeed) for (const [k, v] of Object.entries(s.outcomeDist || {})) od[k] = (od[k] || 0) + v;
    const total = Object.values(od).reduce((a, b) => a + b, 0);
    assert.strictEqual(total, 1797);
    assert.strictEqual(od['travel-refused'], 14);
    assert.strictEqual(od['out-of-reach'], 53);
  });
} else {
  console.log('CENSUS NOT-CHECKED (no --census given)');
}
if (detIdx !== -1) {
  const a = fs.readFileSync(argv[detIdx + 1]);
  const b = fs.readFileSync(argv[detIdx + 2]);
  t('T4 determinism re-run byte-identical', () => {
    assert.ok(a.equals(b), 'rerun differs from screen run');
  });
} else {
  console.log('T4 determinism NOT-CHECKED (no --det given)');
}
console.log('PROOF: ' + pass + ' checks passed' + (process.exitCode ? ' (WITH FAILURES)' : ''));
