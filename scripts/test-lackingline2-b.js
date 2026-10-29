#!/usr/bin/env node
// test-lackingline2-b.js — proof for sim-lackingline2-b.
// T1: lacking-line unit tests (no game needed; the line
//   text itself is unit-proven here, exactly as in
//   test-woodcarry3-b.js T3 / test-lackingline-b.js T1).
// T2–T3: banking-census judge (requires --census <file>):
//   asserts the prereg INSUFFICIENT-DATA (banking
//   shortfall) record — 400 contiguous seeds 13400–13799,
//   exactly 7 qualifiers in screen order, 34 OFF creek
//   evenings, 7 episodes, 0 errs, 0 unclassified — and
//   the verdict logic (7 < 8-seed floor, so no judged ON
//   leg exists).
// T4: banked-corpus guard (requires --corpus <dir>):
//   exactly the 7 qualifier files, each with >= 1 creek
//   record, and no lever lacking-line string in any of
//   them (OFF legs never say the line).
// Usage: node scripts/test-lackingline2-b.js [--census F --corpus D]
'use strict';
const fs = require('fs');
const path = require('path');
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
const dIdx = argv.indexOf('--corpus');
const EXPECTED_BANK = [13421, 13473, 13480, 13556, 13592, 13703, 13714];
if (cIdx !== -1) {
  const census = JSON.parse(fs.readFileSync(argv[cIdx + 1], 'utf8'));
  t('T2a screen covered 400 contiguous seeds 13400-13799', () => {
    assert.strictEqual(census.seedsScreened, 400);
    const seeds = census.perSeed.map((s) => s.seed);
    assert.strictEqual(seeds.length, 400);
    for (let i = 0; i < 400; i++) assert.strictEqual(seeds[i], 13400 + i);
    assert.deepStrictEqual(census.seedRange, [13400, 13799]);
  });
  t('T2b exactly 7 qualifiers, in screen order', () => {
    assert.strictEqual(census.qualifierCount, 7);
    assert.deepStrictEqual(census.qualifiers, EXPECTED_BANK);
    assert.deepStrictEqual(census.bank, EXPECTED_BANK);
  });
  t('T2c 34 OFF creek evenings in 7 episodes', () => {
    assert.strictEqual(census.totalCreekEvenings, 34);
    assert.strictEqual(census.totalEpisodes, 7);
    for (const s of census.perSeed) {
      if (s.qualifier) assert.strictEqual(s.episodeCount, 1, 'seed ' + s.seed);
      else assert.strictEqual(s.creekEvenings, 0, 'seed ' + s.seed);
    }
  });
  t('T2d errs and unclassified are 0 on every screened seed', () => {
    for (const s of census.perSeed) {
      assert.strictEqual(s.errs, 0, 'seed ' + s.seed + ' errs');
      assert.strictEqual(s.unclassified, 0, 'seed ' + s.seed + ' unclassified');
    }
  });
  t('T3a full-screen funnel: 11945 evenings, 77 travel-refused', () => {
    const od = {};
    for (const s of census.perSeed) for (const [k, v] of Object.entries(s.outcomeDist || {})) od[k] = (od[k] || 0) + v;
    const total = Object.values(od).reduce((a, b) => a + b, 0);
    assert.strictEqual(total, 11945);
    assert.strictEqual(od['travel-refused'], 77);
    assert.strictEqual(od['out-of-reach'], 297);
  });
  t('T3b verdict logic: 7 qualifiers below the 8-seed floor', () => {
    assert.ok(census.qualifierCount < 8, 'floor met — verdict logic broken');
    assert.ok(census.qualifierCount >= 1, 'no bank at all');
  });
  t('T3c no judged ON corpus dir exists (no post-hoc judged leg)', () => {
    const onDir = path.join(path.dirname(argv[cIdx + 1]), 'sim-lackingline2-b-corpus-on');
    assert.ok(!fs.existsSync(onDir), 'ON corpus dir exists: ' + onDir);
  });
} else {
  console.log('CENSUS NOT-CHECKED (no --census given)');
}
if (dIdx !== -1) {
  const dir = argv[dIdx + 1];
  t('T4a banked corpus dir holds exactly the 7 qualifier files', () => {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    assert.strictEqual(files.length, 7);
    for (const s of EXPECTED_BANK) {
      assert.ok(files.includes('woodcarry3-b-nighttravel-s' + s + '.json'), 'missing seed ' + s);
    }
  });
  t('T4b each banked corpus holds >= 1 OFF creek record', () => {
    for (const s of EXPECTED_BANK) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, 'woodcarry3-b-nighttravel-s' + s + '.json'), 'utf8'));
      const n = (inst.evenings || []).filter((e) => e.woodcarry && e.woodcarry.outcome === 'travel-refused' && e.woodcarry.bucket === 'creek').length;
      assert.ok(n >= 1, 'seed ' + s + ' creek records ' + n);
    }
  });
  t('T4c no lever lacking-line string in any banked OFF corpus', () => {
    for (const s of EXPECTED_BANK) {
      const text = fs.readFileSync(path.join(dir, 'woodcarry3-b-nighttravel-s' + s + '.json'), 'utf8');
      assert.ok(!text.includes('No bridge tonight'), 'seed ' + s);
      assert.ok(!text.includes('logs would not lash'), 'seed ' + s);
      assert.ok(!text.includes('bridge stands, but the way home'), 'seed ' + s);
    }
  });
} else {
  console.log('CORPUS NOT-CHECKED (no --corpus given)');
}
console.log('PROOF: ' + pass + ' checks passed' + (process.exitCode ? ' (WITH FAILURES)' : ''));
