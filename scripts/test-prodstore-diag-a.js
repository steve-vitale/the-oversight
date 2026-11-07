#!/usr/bin/env node
// test-prodstore-diag-a.js — proof for the prodstore-a diagnosis instruments.
// Legs: guard refusals (seeds/days/env/lever-flag), oneRun structure + dedupe,
// determinism (same seed twice => identical per-seed JSON), analyzer runs on a
// small corpus and prints the binding-constraint + baseline lines, flow
// accounting residual stays small (the wrappers measure what they claim),
// L9 armed 5-day run engages the throttle no more and eases no more than
// baseline, L10 unset run is byte-identical to the Phase-A baseline run,
// L11 pilot sweep refuses to run unarmed.
// Uses seed 96201 at 5 days only (smoke scale); the judged 8-seed 150d corpus
// is produced by the sweep, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
delete process.env.PRODSTORE_LEVER;
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const SWEEP = path.join(__dirname, 'sweep-prodstore-diag-a.js');
const PILOT = path.join(__dirname, 'sweep-prodstore-pilot-a.js');
const ANALYZE = path.join(__dirname, 'analyze-prodstore-diag-a.js');
const TMP = path.join('/tmp', 'prodstore-diag-a-test-' + process.pid);

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function runSweep(env, expectCode) {
  const r = cp.spawnSync(process.execPath, [SWEEP], {
    env: Object.assign({}, process.env, env), encoding: 'utf8', timeout: 60000,
  });
  return r.status;
}

(async () => {
  // L1-L4: guard refusals (spawned; each must exit 2 without running sims).
  leg('L1 bad seeds refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '1,2,3', DAYS: '150' }), 2);
  });
  leg('L2 bad days refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '100' }), 2);
  });
  leg('L3 missing env refused', () => {
    const env = Object.assign({}, process.env);
    delete env.PLENTYDEPRI;
    const r = cp.spawnSync(process.execPath, [SWEEP], {
      env: Object.assign(env, { SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '150' }),
      encoding: 'utf8', timeout: 60000,
    });
    assert.strictEqual(r.status, 2);
  });
  leg('L4 lever flag set refused', () => {
    assert.strictEqual(runSweep({ SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '150', PRODSTORE_LEVER: '1' }), 2);
  });

  const { oneRun, writeRobust } = require('./sweep-prodstore-diag-a.js');
  let first = null, second = null;
  await aleg('L5 oneRun(96201, 5d) structure', async () => {
    first = await oneRun(96201, 5);
    const ps = first.perSeed;
    assert.strictEqual(ps.seed, 96201);
    assert.strictEqual(ps.policy, 'competent');
    assert.ok(Array.isArray(ps.daySeries) && ps.daySeries.length === 5, 'daySeries length 5, got ' + ps.daySeries.length);
    assert.ok(Array.isArray(ps.flowSeries) && ps.flowSeries.length > 0, 'flowSeries non-empty');
    assert.ok(Array.isArray(ps.mealRows), 'mealRows array');
    // dedupe: no duplicate (vid,day) keys in stored rows
    const keys = ps.mealRows.map(r => r.vid + '|' + r.day);
    assert.strictEqual(new Set(keys).size, keys.length, 'mealRows deduped');
    // snapshot fields present
    const d0 = ps.daySeries[0];
    for (const k of ['pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'preservedKcal',
      'freshDays', 'pantryCapKcal', 'throttleEngaged', 'throttleRedirects',
      'throttleExemptDepth', 'plentyDepriKcal', 'depositGateKcal', 'pop', 'assignments']) {
      assert.ok(k in d0, 'daySeries has ' + k);
    }
    assert.ok(Array.isArray(ps.deathRows), 'deathRows array');
    // flow fields present
    const f0 = ps.flowSeries[0];
    for (const k of ['stocked', 'stored', 'pantryAdd', 'donated', 'league', 'drawn',
      'spoiledDrawn', 'spoiledSwept', 'takeBulk', 'produced', 'need', 'ate', 'ownEat', 'gave', 'resolved']) {
      assert.ok(k in f0, 'flowSeries has ' + k);
    }
  });
  await aleg('L6 determinism: same seed twice => identical per-seed JSON', async () => {
    second = await oneRun(96201, 5);
    assert.strictEqual(JSON.stringify(second.perSeed), JSON.stringify(first.perSeed));
    assert.strictEqual(JSON.stringify(second.diag), JSON.stringify(first.diag));
  });
  await aleg('L7 analyzer runs on a 5-day corpus and prints verdict lines', async () => {
    // Write through the sweep's writeRobust: EPERM-flap denial is STICKY per
    // process once a write fails, so in-process retries are futile (30/30
    // failed 2026-11-07 while fresh processes wrote fine). writeRobust spawns
    // a fresh child per attempt.
    fs.mkdirSync(TMP, { recursive: true });
    writeRobust(path.join(TMP, 'prodstore-a-competent-s96201.json'), JSON.stringify(first.perSeed));
    const r = cp.spawnSync(process.execPath, [ANALYZE, TMP], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    assert.ok(/D1 PRODUCTION vs BURN/.test(r.stdout), 'D1 section printed');
    assert.ok(/D7 STARVATION/.test(r.stdout), 'D7 section printed');
    assert.ok(/BINDING CONSTRAINT/.test(r.stdout), 'binding constraint printed');
    assert.ok(/BASELINE FOR PHASE B/.test(r.stdout), 'baseline printed');
    assert.ok(/ACCOUNTING CLOSURE/.test(r.stdout), 'closure printed');
  });
  await aleg('L8 flow accounting residual is small on the 5-day seed', async () => {
    // residual = Δpantry - (inflows - outflows), SHIFTED windows (see the
    // analyzer: snapshot D is pre-meal-D, so meals of day D land after it).
    // The wrappers should capture nearly all pantry movement (cook
    // conversion losses + direct pushes only).
    const days = first.perSeed.daySeries, flows = first.perSeed.flowSeries;
    const n = days.length;
    const sumF = (fn, from, to) => flows.filter(f => f.day >= from && f.day <= to).reduce((t, f) => t + fn(f), 0);
    const dPantry = (days[n - 1].pantryKcal || 0) - (days[0].pantryKcal || 0);
    const inTot = sumF(f => Object.values(f.stocked || {}).reduce((a, b) => a + b, 0), 2, n)
      + sumF(f => (f.stored || 0) + (f.league || 0), 1, n - 1)
      + sumF(f => (f.pantryAdd || 0) + (f.donated || 0), 2, n);
    const outTot = sumF(f => (f.drawn || 0) + (f.drawGap || 0) + (f.spoiledDrawn || 0), 1, n - 1)
      + sumF(f => (f.spoiledSwept || 0) + (f.takeBulk || 0) + (f.removedKcal || 0), 2, n);
    const residual = dPantry - (inTot - outTot);
    // Bar is outflow-relative: inflows are small early (the village self-feeds;
    // the pantry's movement is dominated by outflows), so an inflow-relative
    // bar would fail on a healthy instrument. The instrument must capture
    // >=90% of pantry movement.
    const share = outTot ? Math.abs(residual) / outTot : 0;
    const drawGap = flows.reduce((t, f) => t + (f.drawGap || 0), 0);
    const removedKcal = flows.reduce((t, f) => t + (f.removedKcal || 0), 0);
    console.log('    residual=' + residual + ' inflows=' + inTot + ' outflows=' + outTot + ' drawGap=' + drawGap + ' removedKcal=' + removedKcal + ' share=' + (100 * share).toFixed(1) + '% of outflows');
    assert.ok(share < 0.10, 'residual share < 10% of outflows, got ' + (100 * share).toFixed(1) + '%');
  });

  // L9: armed 5-day run (PRODSTORE_LEVER=1) engages the throttle on no MORE
  // days than baseline and eases no MORE kcal — the lever only ever raises
  // the plenty bar, so the stand-down can only shrink. The threshold is read
  // from process.env at call time, so toggling it in-process between oneRun
  // calls is a faithful arm/disarm (same seed, same RNG stream).
  await aleg('L9 armed run: throttle days <= baseline, easing <= baseline', async () => {
    const baseDays = first.perSeed.daySeries;
    const baseEngaged = baseDays.filter(d => d.throttleEngaged).length;
    const baseEasing = (baseDays[baseDays.length - 1].plentyDepriKcal || 0)
      + (baseDays[baseDays.length - 1].depositGateKcal || 0);
    process.env.PRODSTORE_LEVER = '1';
    let armed;
    try { armed = await oneRun(96201, 5); } finally { delete process.env.PRODSTORE_LEVER; }
    const armDays = armed.perSeed.daySeries;
    const armEngaged = armDays.filter(d => d.throttleEngaged).length;
    const armEasing = (armDays[armDays.length - 1].plentyDepriKcal || 0)
      + (armDays[armDays.length - 1].depositGateKcal || 0);
    console.log('    baseline engaged=' + baseEngaged + ' easing=' + baseEasing
      + ' | armed engaged=' + armEngaged + ' easing=' + armEasing);
    assert.ok(armEngaged <= baseEngaged, 'armed engaged days (' + armEngaged + ') <= baseline (' + baseEngaged + ')');
    assert.ok(armEasing <= baseEasing, 'armed easing (' + armEasing + ') <= baseline (' + baseEasing + ')');
  });
  // L10: unset run after an armed run in the same process is byte-identical
  // to the Phase-A baseline run — off = baseline, no state leaks across arms.
  await aleg('L10 unset run byte-identical to baseline', async () => {
    delete process.env.PRODSTORE_LEVER;
    const third = await oneRun(96201, 5);
    assert.strictEqual(JSON.stringify(third.perSeed), JSON.stringify(first.perSeed));
    assert.strictEqual(JSON.stringify(third.diag), JSON.stringify(first.diag));
  });
  // L11: the pilot sweep refuses to run unarmed (guard inverted vs diagnosis).
  leg('L11 pilot sweep refuses without PRODSTORE_LEVER=1', () => {
    const r = cp.spawnSync(process.execPath, [PILOT], {
      env: Object.assign({}, process.env, { SEEDS: '96201,96202,96203,96204,96205,96206,96207,96208', DAYS: '150' }),
      encoding: 'utf8', timeout: 60000,
    });
    assert.strictEqual(r.status, 2, 'pilot exit 2 unarmed, got ' + r.status);
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
