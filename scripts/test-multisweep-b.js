#!/usr/bin/env node
// test-multisweep-b.js — proof tests for sim-multisweep-b.
// Pure checks (default): policy identity + guard helpers + analyzer
// primary/GO rules. Live modes (instrument proof, NON-JUDGED seed
// 51809 only): --live-control runs the driver baseline + armed and
// checks structure + analyzer; --live-det runs the armed driver twice
// and checks the analyzer census is identical. Live outputs go to
// /tmp only (new tests must not write into the repo).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

let n = 0;
function check(name, fn) {
  n++;
  try { fn(); console.log('ok ' + n + ' ' + name); }
  catch (e) { console.error('FAIL ' + n + ' ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

function pure() {
  const { competent } = require('./policies/competent');
  const { multisweep, _atHaven, _packFull } = require('./policies/competent-multisweep-b');
  check('variant id distinct, baseline untouched', () => {
    assert.strictEqual(multisweep.id, 'competent-multisweep-b');
    assert.strictEqual(competent.id, 'competent');
    assert.notStrictEqual(multisweep.daily, competent.daily);
    assert.strictEqual(multisweep.upkeep, competent.upkeep);
    assert.strictEqual(multisweep.fight, competent.fight);
  });
  check('packFull boundary 95%', () => {
    const stub = (kg, cap) => ({ packWeight: () => kg, packCapacity: () => cap });
    assert.strictEqual(_packFull(stub(19, 20)), true);
    assert.strictEqual(_packFull(stub(18.9, 20)), false);
    assert.strictEqual(_packFull(stub(0, 20)), false);
  });
  check('atHaven guards', () => {
    assert.strictEqual(_atHaven({ playerAtHaven: () => true }), true);
    assert.strictEqual(_atHaven({ playerAtHaven: () => false }), false);
    assert.strictEqual(_atHaven({}), false);
  });

  const { analyzeSeedMulti, compareBands, isStarvationDeath } = require('./analyze-multisweep-b');
  function fakeInst() {
    const day = (loopDay, successes, endPos) => ({
      loopDay, start: { day: loopDay, dayTicks: 384, pos: { x: 4, y: 4 }, packKg: 1, packCap: 20, candidates: [] },
      travels: [], tripEnd: null,
      end: { day: loopDay, dayTicks: 400, pos: endPos, packKg: 1, packCap: 20, candidates: [] },
      forages: Array.from({ length: successes }, () => ({ ok: true, sayDuring: [], ticksDelta: 16, added: [], unknownGains: [], tele: null })),
    });
    const ret = (loopDay, finished) => ({
      loopDay, day: loopDay, overAtEntry: false,
      packBefore: finished ? [{ name: 'Berry', plantId: 'berry', units: finished / 100, kcalEach: 100, hiddenKcal: null, foodKind: null, foodState: null, edible: true, lump: null }] : [],
      pantryBefore: 0, unloadKcal: 0, packAfter: [], pantryAfter: 0,
      gateEngagedAtEntry: 0, gateEngagedAtExit: 0, sayBefore: 0, sayAfter: 0,
    });
    return {
      seed: 51809, policy: 'competent', days: 30, daysAlive: 30, endReason: 'horizon',
      gameDays: 30, maxWaveUnlocked: 1, waveKills: {}, deaths: [],
      days: [day(1, 1, { x: 4, y: 4 }), day(2, 1, { x: 5, y: 4 })],
      homecomings: [ret(1, 100), ret(1, 300)], deposits: [], donates: [],
      forageTele: [], sayLines: [],
    };
  }
  check('primary takes FINAL live return per trip day, excludes no-return days', () => {
    const a = analyzeSeedMulti(fakeInst());
    assert.strictEqual(a.primaryN, 1);
    assert.strictEqual(a.primaryMeanFinished, 300);
    assert.strictEqual(a.noReturnTripDays, 1);
    assert.strictEqual(a.tripDays, 2);
    assert.strictEqual(a.oneTripShare, 1);
    assert.strictEqual(a.multiSweepShare, 0);
  });
  check('compareBands GO and cost bars', () => {
    const base = { primaryPooledMeanFinished: 1000, medianSurvival: 30, starvationDeaths: 0 };
    const go = { primaryPooledMeanFinished: 1300, medianSurvival: 30, starvationDeaths: 1 };
    assert.strictEqual(compareBands(base, go).go, true);
    assert.strictEqual(compareBands(base, go).ratio, 1.3);
    assert.strictEqual(compareBands(base, { primaryPooledMeanFinished: 1200, medianSurvival: 30, starvationDeaths: 0 }).go, false);
    assert.strictEqual(compareBands(base, { primaryPooledMeanFinished: 2000, medianSurvival: 30, starvationDeaths: 2 }).go, false);
    assert.strictEqual(compareBands(base, { primaryPooledMeanFinished: 2000, medianSurvival: 20, starvationDeaths: 0 }).go, false);
    assert.strictEqual(compareBands({ primaryPooledMeanFinished: 0, medianSurvival: 30, starvationDeaths: 0 }, go).go, false);
  });
  check('isStarvationDeath matcher', () => {
    assert.strictEqual(isStarvationDeath({ cause: 'starved' }), true);
    assert.strictEqual(isStarvationDeath({ reason: 'died of hunger' }), true);
    assert.strictEqual(isStarvationDeath({ cause: 'monster' }), false);
    assert.strictEqual(isStarvationDeath(null), false);
  });
}

function runDriver(policy, seed, outFile) {
  const env = Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0',
    POLICY: policy, DAYS: '30', SEEDS: String(seed),
  });
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) delete env[k];
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, 'multisweep-b-driver.js')], { env, encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) throw new Error('driver ' + policy + ' seed ' + seed + ' exit ' + r.status + ': ' + (r.stderr || '').slice(-500));
  fs.writeFileSync(outFile, r.stdout);
  const lines = r.stdout.split('\n').filter((l) => l.trim());
  assert.strictEqual(lines.length, 1, 'expected 1 jsonl line');
  return JSON.parse(lines[0]);
}

async function liveControl() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'multisweep-control-'));
  const base = runDriver('competent', 51809, path.join(dir, 'base.jsonl'));
  const armed = runDriver('competent-multisweep-b', 51809, path.join(dir, 'armed.jsonl'));
  assert.strictEqual(base.policy, 'competent');
  assert.strictEqual(armed.policy, 'competent-multisweep-b');
  assert.ok(base.days.length >= 1 && armed.days.length >= 1, 'loopDays recorded');
  assert.ok(base.homecomings.length >= 1, 'baseline homecomings recorded');
  // Analyzer runs on both control outputs.
  const { analyzeSeedMulti } = require('./analyze-multisweep-b');
  const ab = analyzeSeedMulti(base), aa = analyzeSeedMulti(armed);
  console.log('control baseline: tripDays=' + ab.tripDays + ' primary=' + ab.primaryMeanFinished + ' n=' + ab.primaryN);
  console.log('control armed: tripDays=' + aa.tripDays + ' primary=' + aa.primaryMeanFinished + ' n=' + aa.primaryN +
    ' extraTripDays=' + aa.extraTripDays + ' extraSuccessDays=' + aa.extraSuccessDays);
  console.log('control deaths shape: ' + JSON.stringify(base.deaths).slice(0, 300) + ' | ' + JSON.stringify(armed.deaths).slice(0, 300));
  console.log('control dir (tmp, not repo): ' + dir);
}

async function liveDet() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'multisweep-det-'));
  const a = runDriver('competent-multisweep-b', 51809, path.join(dir, 'a.jsonl'));
  const b = runDriver('competent-multisweep-b', 51809, path.join(dir, 'b.jsonl'));
  const { analyzeSeedMulti } = require('./analyze-multisweep-b');
  const aa = analyzeSeedMulti(a), ab = analyzeSeedMulti(b);
  const census = (x) => JSON.stringify({ tripDays: x.tripDays, primary: x.primaryMeanFinished, primaryN: x.primaryN,
    oneTrip: x.oneTripDays, multi: x.multiSweepDays, liveReturns: x.liveReturns, maxCombined: x.maxCombined,
    extraTripDays: x.extraTripDays, extraSuccessDays: x.extraSuccessDays });
  assert.strictEqual(census(aa), census(ab), 'armed control census identical across runs');
  console.log('live-det identical census: ' + census(aa));
}

if (require.main === module) {
  (async () => {
    pure();
    if (process.argv.includes('--live-control')) await liveControl();
    if (process.argv.includes('--live-det')) await liveDet();
    console.log('test-multisweep-b done, pure checks=' + n);
  })().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = {};
