#!/usr/bin/env node
// test-patchrot-b.js — proof tests for sim-patchrot-b.
// Pure checks (default): rotation window/penalty math, menu reweighting
// (fresh objects, fresh-before-resting order), and analyzer GO/NO-GO
// boundaries. Live modes on NON-JUDGED seed 51909 only (never a judged
// seed): --live-control runs the patchrot driver once and asserts the
// rotation actually engaged; --live-det runs it twice and asserts an
// identical census. Judged seeds are 51901-51908; control 51909 and
// confirm reserve 51921-51932 are never judged by this file.
'use strict';
const assert = require('assert');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

function pure() {
  const p = require('./policies/competent-patchrot-b');
  const { _isResting, _adjustedDistance, _adjustedTargets, _tileKey } = p;
  check('window: age 0 and 1 resting, age 2+ fresh', () => {
    const v = { [_tileKey(4, 3)]: 10 };
    assert.strictEqual(_isResting(v, 4, 3, 10), true);
    assert.strictEqual(_isResting(v, 4, 3, 11), true);
    assert.strictEqual(_isResting(v, 4, 3, 12), false);
    assert.strictEqual(_isResting(v, 4, 3, 13), false);
    assert.strictEqual(_isResting({}, 4, 3, 10), false);
  });
  check('penalty: resting +99, fresh unchanged', () => {
    const v = { [_tileKey(4, 3)]: 10 };
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 1 }, v, 10), 100);
    assert.strictEqual(_adjustedDistance({ x: 5, y: 3, d: 2 }, v, 10), 2);
    assert.strictEqual(_adjustedDistance({ x: 4, y: 3, d: 1 }, v, 12), 1);
  });
  check('menu: fresh objects out, fresh sorts before nearer resting tile', () => {
    const v = { [_tileKey(4, 3)]: 10 };
    const menu = [{ x: 4, y: 3, d: 1 }, { x: 5, y: 3, d: 2 }];
    const adj = _adjustedTargets(menu, v, 10);
    assert.notStrictEqual(adj[0], menu[0]);
    assert.strictEqual(menu[0].d, 1); // input untouched
    const sorted = adj.slice().sort((a, b) => a.d - b.d);
    assert.strictEqual(sorted[0].x, 5); // fresh tile wins despite d=2 vs 1
    assert.strictEqual(sorted[1].x, 4);
  });
  check('menu: all-fresh band is identity on d', () => {
    const adj = _adjustedTargets([{ x: 1, y: 1, d: 3 }], {}, 5);
    assert.strictEqual(adj[0].d, 3);
  });
  check('policy exports frozen window + penalty', () => {
    assert.strictEqual(p.PATCHROT_WINDOW, 2);
    assert.strictEqual(p.PATCHROT_PENALTY, 99);
    assert.strictEqual(p.patchrot.id, 'competent-patchrot-b');
  });
  const a = require('./analyze-patchrot-b');
  const base = { failedTripDayShare: 0.67, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 };
  check('compare: GO needs share -0.10 AND haul not down AND costs clean', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.57, meanDailyHaul: 600, starvationDeaths: 1, medianSurvival: 30 });
    assert.strictEqual(c.go, true);
    assert.strictEqual(c.shareDelta, -0.1);
  });
  check('compare: share miss by a point is NO-GO', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.58, meanDailyHaul: 900, starvationDeaths: 0, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
  });
  check('compare: haul down rescues nothing', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 599.9, starvationDeaths: 0, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
  });
  check('compare: cost miss blocks GO', () => {
    const c = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 900, starvationDeaths: 3, medianSurvival: 30 });
    assert.strictEqual(c.go, false);
    const c2 = a.compareBands(base, { failedTripDayShare: 0.40, meanDailyHaul: 900, starvationDeaths: 1, medianSurvival: 20 });
    assert.strictEqual(c2.go, false);
  });
  console.log('pure: ' + pass + ' checks green');
}

async function liveControl() {
  process.env.POLICY = 'competent-patchrot-b';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '51909';
  const d = require('./patchrot-b-driver');
  const inst = await d.oneInstance(51909);
  assert.strictEqual(inst.policy, 'competent-patchrot-b');
  assert.ok(inst.days.length >= 1, 'at least one loopDay');
  const daysWithPatch = inst.days.filter((x) => x.patchrot);
  assert.ok(daysWithPatch.length > 0, 'patchrot day records present');
  const visited = Math.max(0, ...inst.days.map((x) => (x.patchrot || {}).visitedTiles || 0));
  assert.ok(visited > 0, 'rotation visited map engaged (visitedTiles > 0)');
  const forages = inst.days.reduce((t, x) => t + (x.forages || []).length, 0);
  assert.ok(forages > 0, 'forage attempts recorded');
  console.log('live-control: loopDays=' + inst.days.length + ' forages=' + forages +
    ' visitedTiles=' + visited + ' end=' + inst.endReason);
}

function census(inst) {
  return JSON.stringify({
    seed: inst.seed, policy: inst.policy, loopDays: inst.days.length,
    forages: inst.days.map((x) => [(x.forages || []).map((f) => (f.ok ? 1 : 0)).join('')]),
    homecomings: inst.homecomings.length,
    daysAlive: inst.daysAlive, endReason: inst.endReason,
  });
}

async function liveDet() {
  process.env.POLICY = 'competent-patchrot-b';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '51909';
  const d = require('./patchrot-b-driver');
  const a = await d.oneInstance(51909);
  const b = await d.oneInstance(51909);
  assert.strictEqual(census(a), census(b), 'identical census across runs');
  console.log('live-det: identical census, loopDays=' + a.days.length);
}

async function main() {
  if (process.argv.includes('--live-control')) await liveControl();
  else if (process.argv.includes('--live-det')) await liveDet();
  else pure();
  if (process.exitCode !== 1) console.log('test-patchrot-b: GREEN');
}
if (require.main === module) main().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
