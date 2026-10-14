#!/usr/bin/env node
// Proof test: psycho violence wiring (Steve 2026-10-13)
// Verifies the wiring exists via source inspection.
// RED mode: run against pre-change code (via git stash) to confirm tests fail.
// GREEN: run against current code to confirm tests pass.
//
// Usage: node scripts/test-psycho-violence-20261013.js [--red]

const fs = require('fs');
const path = require('path');

const RED = process.argv.includes('--red');
const srcDir = path.join(__dirname, '..', 'src', 'js');

function src(f) {
  return fs.readFileSync(path.join(srcDir, f), 'utf8');
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    const result = fn();
    if (RED) {
      // In RED mode, the feature should NOT exist — test passes if fn throws
      failed++;
      console.log('  ✗ ' + name + ': RED mode expected failure but got success');
    } else {
      passed++;
      console.log('  ✓ ' + name);
    }
  } catch (e) {
    if (RED) {
      passed++;
      console.log('  ✓ ' + name + ' (RED: correctly absent)');
    } else {
      failed++;
      console.log('  ✗ ' + name + ': ' + e.message);
    }
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

console.log('Psycho Violence Wiring Tests' + (RED ? ' [RED mode]' : ''));

test('psychoViolenceTick method defined in corruption.js', () => {
  const s = src('corruption.js');
  assert(s.includes('psychoViolenceTick()'), 'method not defined');
  assert(s.includes('PSYCHO VIOLENCE'), 'section header missing');
});

test('corruptionTick calls psychoViolenceTick', () => {
  const s = src('corruption.js');
  // Find the corruptionTick method definition (not the psychoViolenceTick def)
  const tickStart = s.indexOf('corruptionTick() {');
  assert(tickStart > 0, 'corruptionTick not found');
  const tickSection = s.slice(tickStart, tickStart + 2000);
  assert(tickSection.includes('psychoViolenceTick'), 'corruptionTick does not call psychoViolenceTick');
});

test('psycho escalation has 3 stages (theft -> threat -> attack)', () => {
  const s = src('corruption.js');
  assert(s.includes('STAGE 0 -> 1'), 'stage 0->1 missing');
  assert(s.includes('STAGE 1 -> 2'), 'stage 1->2 missing');
  assert(s.includes('STAGE 2 -> 3'), 'stage 2->3 missing');
});

test('psycho violence integrates with justice ladder (recordCrime)', () => {
  const s = src('corruption.js');
  const pvStart = s.indexOf('psychoViolenceTick()');
  const pvSection = s.slice(pvStart, pvStart + 8000);
  assert(pvSection.includes("recordCrime('theft'"), 'theft not recorded as crime');
  assert(pvSection.includes("recordCrime('threat'"), 'threat not recorded as crime');
  assert(pvSection.includes("recordCrime('assault'"), 'assault not recorded as crime');
});

test('apVillagerRetaliate method defined in alienPlayers.js', () => {
  const s = src('alienPlayers.js');
  assert(s.includes('apVillagerRetaliate:'), 'method not defined');
  assert(s.includes('VILLAGER RETALIATION'), 'section header missing');
});

test('alien kill path calls apVillagerRetaliate', () => {
  const s = src('alienPlayers.js');
  assert(s.includes('this.apVillagerRetaliate(pid, victim)'), 'kill path does not call retaliate');
});

test('retaliation uses fieldFight', () => {
  const s = src('alienPlayers.js');
  const rStart = s.indexOf('apVillagerRetaliate:');
  const rSection = s.slice(rStart, rStart + 5000);
  assert(rSection.includes('fieldFight'), 'retaliation does not use fieldFight');
});

test('hostile visitor flag in betrayal.js', () => {
  const s = src('betrayal.js');
  assert(s.includes('visitor.hostile'), 'hostile flag not set');
  assert(s.includes('HOSTILE WANDERER'), 'section header missing');
});

test('hostileVisitorTick method defined', () => {
  const s = src('betrayal.js');
  assert(s.includes('hostileVisitorTick()'), 'method not defined');
});

test('betrayalDaily calls hostileVisitorTick', () => {
  const s = src('betrayal.js');
  const bdStart = s.indexOf('betrayalDaily()');
  assert(bdStart > 0, 'betrayalDaily not found');
  const bdSection = s.slice(bdStart, bdStart + 2000);
  assert(bdSection.includes('hostileVisitorTick'), 'betrayalDaily does not call hostileVisitorTick');
});

test('hostile visitor violence is rare (low probabilities)', () => {
  const s = src('betrayal.js');
  const hvStart = s.indexOf('hostileVisitorTick()');
  const hvSection = s.slice(hvStart, hvStart + 4000);
  // Hostile flag: 3% of visitors
  assert(hvSection.includes('0.03') || s.includes('R() < 0.03'), 'hostile rate not ~3%');
  // Only 30% of hostile visitors act
  assert(hvSection.includes('0.30'), 'act rate not ~30%');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
