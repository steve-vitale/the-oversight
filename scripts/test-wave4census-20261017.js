#!/usr/bin/env node
// test-wave4census-20261017.js — proof for sim-wave4census (2026-10-17).
//
// PRE-REGISTERED (binding per MEASUREMENT.md §14):
//   (a) ATTRIBUTION COMPLETENESS on fixtures: every taxonomy branch of
//       attributeRun (armor / weapons / tricks / veterans / multi /
//       standing / none-single / unlocked + the two loud-failure branches)
//       returns the known binding. 100% required — a miss is NO-GO.
//   (b) DET-GATE: instrumented vs bare trajectories byte-identical
//       (in-process pairs, 60d) on 2 policies x 2 seeds; 0 instrument errors.
//   (c) SMOKE: 12d instrumented run, schema-clean, 0 instrument errors.
// Any fail = NO-GO. Zero src/js, zero scripts/policies edits (read-only arm).
'use strict';

// Substrate env BEFORE requiring the sweep (its assertSubstrate reads these).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER'])
  process.env[k] = '1';

const assert = require('assert');
const { attributeRun, sampleReadiness, BARS } = require('./wave4census-lib-20261017');
const { runWave4census, assertSubstrate } = require('./wave4census-sweep-20261017');

const DEMAND = { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 };

// ---- fixture builder: hand-rolled snapshots with a KNOWN binding bar ----
function mkSnap(day, raw, peak, vals, short, ready) {
  return {
    day, raw, peak, err: 0,
    armored: vals.a, armed: vals.w, tricks: vals.t, veterans: vals.v,
    ready, short: short.slice(), demand: Object.assign({}, DEMAND),
  };
}
// deferral-day fixture: raw >= t4, not ready, peak 0.
function deferDays(n, shortSets, startDay) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const sh = shortSets[i % shortSets.length];
    out.push(mkSnap(startDay + i, 120, 0,
      { a: sh.includes('armor') ? 2 : 4, w: sh.includes('weapons') ? 3 : 6,
        t: sh.includes('tricks') ? 1 : 5, v: sh.includes('veterans') ? 0 : 3 },
      sh, false));
  }
  return out;
}

function t_attribution_fixtures() {
  // (1) veterans-only bind
  let a = attributeRun(deferDays(20, [['veterans']], 60), { t4: 100 });
  assert.strictEqual(a.binding, 'veterans', 'veterans-only');
  assert.strictEqual(a.deferDays, 20);
  // (2) armor-only
  a = attributeRun(deferDays(15, [['armor']], 70), { t4: 100 });
  assert.strictEqual(a.binding, 'armor', 'armor-only');
  // (3) weapons-only
  a = attributeRun(deferDays(15, [['weapons']], 70), { t4: 100 });
  assert.strictEqual(a.binding, 'weapons', 'weapons-only');
  // (4) tricks-only
  a = attributeRun(deferDays(15, [['tricks']], 70), { t4: 100 });
  assert.strictEqual(a.binding, 'tricks', 'tricks-only');
  // (5) co-bind: armor+veterans never clear together
  a = attributeRun(deferDays(25, [['armor', 'veterans']], 55), { t4: 100 });
  assert.strictEqual(a.binding, 'multi:armor+veterans', 'co-bind');
  // (6) standing: raw never reaches t4
  const standing = [];
  for (let d = 1; d <= 100; d++) standing.push(mkSnap(d, 40 + d * 0.4, 0, { a: 1, w: 2, t: 1, v: 0 }, ['armor', 'weapons', 'tricks', 'veterans'], false));
  a = attributeRun(standing, { t4: 100 });
  assert.strictEqual(a.binding, 'standing', 'standing-bind');
  assert.ok(a.evidence.maxRaw < 100, 'standing evidence: maxRaw < t4');
  // (7) none-single: the binding bar rotates
  a = attributeRun(deferDays(20, [['armor'], ['weapons']], 80), { t4: 100 });
  assert.strictEqual(a.binding, 'none-single', 'none-single');
  assert.ok(a.evidence.rotation.length >= 2, 'none-single documents the rotation');
  // (8) unlocked: peak reaches 4 mid-run
  const unlocked = deferDays(10, [['veterans']], 60);
  for (let d = 70; d <= 120; d++) unlocked.push(mkSnap(d, 130, 4, { a: 4, w: 6, t: 4, v: 2 }, [], true));
  a = attributeRun(unlocked, { t4: 100 });
  assert.strictEqual(a.binding, 'unlocked', 'unlocked');
  // (9) empty trajectory: LOUD failure, never silent
  assert.throws(() => attributeRun([], { t4: 100 }), /empty/, 'empty trajectory throws');
  // (10) errored snapshot: LOUD failure (voided run, not a guess)
  const errSnap = deferDays(5, [['veterans']], 60);
  errSnap[2].err = 1;
  assert.throws(() => attributeRun(errSnap, { t4: 100 }), /errored/, 'errored snapshot throws');
  // (11) maxVal reads the ENGINE's snapshot keys (armored/armed), not the
  // bar names — regression: the key-mapping bug zeroed armor/weapons.
  const mv = deferDays(10, [['armor', 'veterans']], 60);
  const amv = attributeRun(mv, { t4: 100 });
  assert.strictEqual(amv.maxVal.armor, 2, 'maxVal.armor reads armored');
  assert.strictEqual(amv.maxVal.weapons, 6, 'maxVal.weapons reads armed');
  assert.strictEqual(amv.maxVal.tricks, 5, 'maxVal.tricks');
  assert.strictEqual(amv.maxVal.veterans, 0, 'maxVal.veterans');
  assert.deepStrictEqual(amv.demandByBar, { armor: 4, weapons: 5, tricks: 3, veterans: 2 }, 'demandByBar re-keyed');
  console.log('  t1 attribution fixtures: 11/11 GREEN (all taxonomy branches + 2 loud-failure branches + key-mapping regression)');
}

async function t_detgate() {
  // in-process pairs: instrumented vs bare, same seed+policy, 60d.
  for (const [policyId, side, seed] of [
    ['leadfeast', 'control', 51977],
    ['belongfeast', 'control', 1060511],
  ]) {
    const a = await runWave4census(seed, policyId, side, { days: 60, instrumented: true, writeJson: false });
    const b = await runWave4census(seed, policyId, side, { days: 60, instrumented: false, writeJson: false });
    assert.strictEqual(a.instrumentErrors, 0, `${policyId} s${seed}: instrument errors`);
    assert.deepStrictEqual(a.hashes, b.hashes,
      `${policyId} s${seed}: trajectory hash mismatch (instrument not neutral)`);
    assert.strictEqual(a.gameDays, b.gameDays, `${policyId} s${seed}: gameDays diverged`);
    assert.strictEqual(a.maxWaveUnlocked, b.maxWaveUnlocked, `${policyId} s${seed}: wave unlock diverged`);
    console.log(`  t2 det-gate ${policyId}-${side}-s${seed}: byte-identical (${a.hashes.length} day-hashes)`);
  }
}

async function t_smoke() {
  const r = await runWave4census(730111, 'leadfeast', 'control',
    { days: 12, instrumented: true, writeJson: false });
  assert.strictEqual(r.instrumentErrors, 0, 'smoke: instrument errors');
  assert.ok(Array.isArray(r.snaps) && r.snaps.length === 12, 'smoke: 12 daily snapshots');
  const s0 = r.snaps[0];
  for (const k of ['day', 'raw', 'peak', 'armored', 'armed', 'tricks', 'veterans']) {
    assert.ok(typeof s0[k] === 'number' && Number.isFinite(s0[k]), `smoke schema ${k}`);
  }
  assert.ok(Array.isArray(s0.short), 'smoke schema short');
  assert.ok(s0.demand && s0.demand.armored === 4 && s0.demand.armorP === 15, 'smoke schema demand');
  assert.ok(BARS.every(b => ['armor', 'weapons', 'tricks', 'veterans'].includes(b)), 'BARS taxonomy');
  const live = sampleReadiness;
  assert.strictEqual(typeof live, 'function', 'sampleReadiness exported');
  console.log(`  t3 smoke: schema-clean, 12/12 snapshots, 0 errors, ready=${s0.ready}`);
}

async function main() {
  console.log('== test-wave4census-20261017 ==');
  assertSubstrate();
  t_attribution_fixtures();
  await t_detgate();
  await t_smoke();
  console.log('ALL GREEN');
}

main().catch(e => { console.error('PROOF FAILED:', e.message); process.exit(1); });
