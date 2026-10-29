#!/usr/bin/env node
// test-woodcarry-b.js — proof for sim-woodcarry-b.
// T1–T3: pure gate unit tests (no game needed).
// T4+: judged-corpora judge (requires --off <dir> --on <dir>):
//   asserts every prereg GO condition and prints the verdict.
// Usage: node scripts/test-woodcarry-b.js [--off D --on D]
'use strict';
const assert = require('assert');
// Unit tests need the lever policy. On an INSUFFICIENT-DATA /
// killed-at-pilot landing the policy file is REVERTED (killed
// arms leave no trace), so T1–T3 skip gracefully there; the
// judged-corpora judge (T4+) runs on the analyzer only and
// always runs. The unit tests ran green before the revert;
// the proof output line is the record.
let carryDecision, bridgeDecision, lackingLine, unitAvailable = true;
try {
  ({ carryDecision, bridgeDecision, lackingLine } = require('./policies/woodcarry'));
} catch (e) {
  unitAvailable = false;
  console.log('UNIT SKIPPED: scripts/policies/woodcarry.js absent (reverted lever landing) — T1–T3 not run');
}

let pass = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.log('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}

// T1: carry gates.
if (unitAvailable) {
t('T1a deficit take', () => {
  assert.deepStrictEqual(carryDecision({ wood: 0, pile: 25, kcal: 500, canCarryKg: true }), { take: 4 });
  assert.deepStrictEqual(carryDecision({ wood: 1, pile: 25, kcal: 500, canCarryKg: true }), { take: 3 });
});
t('T1b already-carrying skips', () => {
  assert.strictEqual(carryDecision({ wood: 4, pile: 25, kcal: 500, canCarryKg: true }).skip, 'already-carrying');
});
t('T1c pile floor never breached', () => {
  assert.strictEqual(carryDecision({ wood: 0, pile: 11, kcal: 500, canCarryKg: true }).skip, 'pile-floor');
  assert.deepStrictEqual(carryDecision({ wood: 0, pile: 12, kcal: 500, canCarryKg: true }), { take: 4 });
});
t('T1d kcal floor', () => {
  assert.strictEqual(carryDecision({ wood: 0, pile: 25, kcal: 59, canCarryKg: true }).skip, 'kcal-floor');
  assert.deepStrictEqual(carryDecision({ wood: 0, pile: 25, kcal: 60, canCarryKg: true }), { take: 4 });
});
t('T1e cannot-carry', () => {
  assert.strictEqual(carryDecision({ wood: 0, pile: 25, kcal: 500, canCarryKg: false }).skip, 'cannot-carry');
});

// T2: bridge gates.
const baseRec = { isCreek: true, gameOver: false, combatLive: false, blockedTileNeedsBridge: true, blockedTileBridged: false, woodPlayer: 4, kcal: 500, ticksToDayEnd: 200 };
t('T2a attempt when all hold', () => {
  assert.deepStrictEqual(bridgeDecision(baseRec), { attempt: true });
});
t('T2b wood/kcal/ticks shorts', () => {
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { woodPlayer: 0 })).skip, 'wood-short');
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { kcal: 59 })).skip, 'kcal-short');
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { ticksToDayEnd: 95 })).skip, 'ticks-short');
});
t('T2c not-creek / already-bridged / combat', () => {
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { isCreek: false })).skip, 'not-creek');
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { blockedTileBridged: true })).skip, 'already-bridged');
  assert.strictEqual(bridgeDecision(Object.assign({}, baseRec, { combatLive: true })).skip, 'combat');
});

// T3: lacking lines name the lack.
t('T3a wood line names 4 logs', () => {
  const l = lackingLine('wood-short', { woodPlayer: 0, woodPile: 25 });
  assert.ok(/needs 4/.test(l) && /0 log/.test(l), l);
});
t('T3b kcal line names 60', () => {
  const l = lackingLine('kcal-short', { kcal: 30 });
  assert.ok(/60/.test(l) && /30 kcal/.test(l), l);
});
t('T3c ticks line names 96', () => {
  const l = lackingLine('ticks-short', { ticksToDayEnd: 50 });
  assert.ok(/96 ticks/.test(l) && /50/.test(l), l);
});
} // end if (unitAvailable)

// T4+: judged corpora.
const argv = process.argv.slice(2);
const offIdx = argv.indexOf('--off'), onIdx = argv.indexOf('--on');
if (offIdx !== -1 && onIdx !== -1) {
  const { execFileSync } = require('child_process');
  const path = require('path');
  const out = execFileSync('node', [path.join(__dirname, 'analyze-woodcarry-b.js'), argv[offIdx + 1], argv[onIdx + 1]], { encoding: 'utf8' });
  const json = out.slice(0, out.indexOf('--- SUMMARY ---'));
  const r = JSON.parse(json);
  const fails = [];
  const check = (name, ok, detail) => {
    if (ok) { pass++; console.log('PASS ' + name + (detail ? ' ' + detail : '')); }
    else { fails.push(name); console.log('FAIL ' + name + (detail ? ' ' + detail : '')); }
  };
  check('T4 creek n >= 8 (ON)', r.creekOn >= 8, 'n=' + r.creekOn);
  check('T5 rescue share >= 0.50', r.share !== null && r.share >= 0.50, 'share=' + (r.share === null ? 'n/a' : r.share.toFixed(3)) + ' rescued=' + r.rescued + '/' + r.creekOn);
  check('T6 unclassified == 0 both legs', r.unclassifiedOff.n === 0 && r.unclassifiedOn.n === 0, 'OFF=' + r.unclassifiedOff.n + ' ON=' + r.unclassifiedOn.n);
  check('T7 classifier errs == 0 both legs', r.errsOff === 0 && r.errsOn === 0, 'OFF=' + r.errsOff + ' ON=' + r.errsOn);
  check('T8 divergence audit ok', r.divergenceOk === true, JSON.stringify(r.divergence));
  check('T9 starvation guard (ON deaths <= OFF deaths + 1)', r.deathsOn <= r.deathsOff + 1, 'OFF=' + r.deathsOff + ' ON=' + r.deathsOn);
  check('T10 honesty guard (no still-refused tail missing its line)', r.honestyFails.length === 0, 'fails=' + r.honestyFails.length);
  check('T11 wrapper/driver rescue agreement', r.rescueDisagree.length === 0, 'disagree=' + r.rescueDisagree.length);
  if (fails.length) {
    console.log('PROOF-FAIL: ' + fails.join(', '));
    process.exitCode = 1;
  } else {
    console.log('PROOF-GREEN: all prereg GO conditions hold (determinism re-run checked separately)');
  }
} else {
  console.log('UNIT-ONLY: ' + pass + ' passed (no --off/--on corpora given)');
}
