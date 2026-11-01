#!/usr/bin/env node
// test-routeblock-b.js — proof tests for sim-routeblock-b.
// Pure checks (default): gate set/restore semantics (all three gates
// ON inside the window, previous values restored after, including
// after a throw), policy id, and analyzer GO/NO-GO boundaries.
// Live modes on NON-JUDGED seed 52009 only (never a judged seed):
// --live-control runs the routeblock driver once and asserts the
// routeblock day records are present; --live-det runs it twice and
// asserts an identical census. Judged seeds are 52001-52008;
// control 52009 and confirm reserve 52021-52032 are never judged
// by this file.
'use strict';
const assert = require('assert');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

function pure() {
  const p = require('./policies/competent-routeblock-b');
  const { _withGates, ROUTEBLOCK_GATES } = p;
  check('gate list: exactly the three creekpath gates', () => {
    assert.deepStrictEqual(ROUTEBLOCK_GATES, [
      'COMPETENT_ROUTE_AROUND',
      'COMPETENT_TRIPHOME_ROUTE_AROUND',
      'COMPETENT_STANDING_HOME',
    ]);
  });
  check('withGates: all three ON inside, unset restored after', () => {
    for (const k of ROUTEBLOCK_GATES) delete process.env[k];
    let seen = null;
    _withGates(() => { seen = ROUTEBLOCK_GATES.map((k) => process.env[k]); });
    assert.deepStrictEqual(seen, ['1', '1', '1']);
    for (const k of ROUTEBLOCK_GATES) assert.strictEqual(process.env[k], undefined);
  });
  check('withGates: pre-existing values preserved, not clobbered', () => {
    process.env.COMPETENT_ROUTE_AROUND = '0';
    delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
    process.env.COMPETENT_STANDING_HOME = 'custom';
    _withGates(() => {
      assert.strictEqual(process.env.COMPETENT_ROUTE_AROUND, '1');
      assert.strictEqual(process.env.COMPETENT_TRIPHOME_ROUTE_AROUND, '1');
      assert.strictEqual(process.env.COMPETENT_STANDING_HOME, '1');
    });
    assert.strictEqual(process.env.COMPETENT_ROUTE_AROUND, '0');
    assert.strictEqual(process.env.COMPETENT_TRIPHOME_ROUTE_AROUND, undefined);
    assert.strictEqual(process.env.COMPETENT_STANDING_HOME, 'custom');
    delete process.env.COMPETENT_ROUTE_AROUND;
    delete process.env.COMPETENT_STANDING_HOME;
  });
  check('withGates: restores after a throw, and rethrows', () => {
    for (const k of ROUTEBLOCK_GATES) delete process.env[k];
    assert.throws(() => _withGates(() => { throw new Error('boom'); }), /boom/);
    for (const k of ROUTEBLOCK_GATES) assert.strictEqual(process.env[k], undefined);
  });
  check('policy id + desc name the arm', () => {
    assert.strictEqual(p.routeblock.id, 'competent-routeblock-b');
    assert.ok(/routeblock/i.test(p.routeblock.desc));
  });
  const a = require('./analyze-routeblock-b');
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

function setLiveEnv() {
  process.env.POLICY = 'competent-routeblock-b';
  process.env.COMPETENT_FEAST = '0'; process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0'; process.env.DEPOSITGATE = '0'; process.env.DAYS = '30';
  process.env.SEEDS = '52009';
}

async function liveControl() {
  setLiveEnv();
  const d = require('./routeblock-b-driver');
  const inst = await d.oneInstance(52009);
  assert.strictEqual(inst.policy, 'competent-routeblock-b');
  assert.ok(inst.days.length >= 1, 'at least one loopDay');
  const daysWithRb = inst.days.filter((x) => x.routeblock);
  assert.ok(daysWithRb.length > 0, 'routeblock day records present');
  const forages = inst.days.reduce((t, x) => t + (x.forages || []).length, 0);
  assert.ok(forages > 0, 'forage attempts recorded');
  const standing = inst.days.reduce((t, x) => t + ((x.routeblock || {}).standingHomeDays || 0), 0);
  const tripDet = inst.days.reduce((t, x) => t + ((x.routeblock || {}).tripHomeDetours || 0), 0);
  console.log('live-control: loopDays=' + inst.days.length + ' forages=' + forages +
    ' standingHomeDays=' + standing + ' tripHomeDetours=' + tripDet + ' end=' + inst.endReason);
}

function census(inst) {
  return JSON.stringify({
    seed: inst.seed, policy: inst.policy, loopDays: inst.days.length,
    forages: inst.days.map((x) => [(x.forages || []).map((f) => (f.ok ? 1 : 0)).join('')]),
    routeblock: inst.days.map((x) => x.routeblock || null),
    homecomings: inst.homecomings.length,
    daysAlive: inst.daysAlive, endReason: inst.endReason,
  });
}

async function liveDet() {
  setLiveEnv();
  const d = require('./routeblock-b-driver');
  const a = await d.oneInstance(52009);
  const b = await d.oneInstance(52009);
  assert.strictEqual(census(a), census(b), 'identical census across runs');
  console.log('live-det: identical census, loopDays=' + a.days.length);
}

async function main() {
  if (process.argv.includes('--live-control')) await liveControl();
  else if (process.argv.includes('--live-det')) await liveDet();
  else pure();
  if (process.exitCode !== 1) console.log('test-routeblock-b: GREEN');
}
if (require.main === module) main().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
