// test-departsafe-rejudge-a.js — PROOF TEST, arm sim-departsafe-rejudge-a
// (Loop A run fleshout-20261123T1815Z, axis scale-onramp).
// Proves the amended bid-inclusive det-gate bound (prereg §2):
//   bound = min(first extra depart call, first non-skipped safety
//   effect, first party_launch bid divergence), under the
//   order-insensitive canonicalization (detgate-order-a, d0ed41382).
// §A: firstBidDivergenceDay unit checks on staged raw rows.
// §B: LIVE case on the frozen corpus (band 107601-107616): the bid
//   values per seed and contrast, the 107611 gate passing under the
//   amended bound on BOTH contrasts, and the 107601/107605 bounds
//   unchanged.
// §C: metric counting is untouched by the bound change — launches
//   and deaths on the frozen corpus reproduce the frozen departsafe
//   judgment exactly (counting reads raw rows).
// Reads only; writes nothing into the repo.
// Usage: node scripts/test-departsafe-rejudge-a.js (exit 0 iff 100%).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dawnchoke = require(path.join(REPO, 'scripts', 'analyze-dawnchoke-a.js'));
const analyzeSeed = dawnchoke.analyzeSeed;
const detGateForSeed = dawnchoke.detGateForSeed;
const firstBidDivergenceDay = dawnchoke.firstBidDivergenceDay;
const CORPUS = path.join(REPO, 'evidence', '2026-11-23');
const SEEDS = [];
for (let s = 107601; s <= 107616; s++) SEEDS.push(s);

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; } else { fail++; console.log('FAIL: ' + name); }
}
function loadLeg(leg, filemode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(CORPUS, 'perseed-departsafe-a-' + leg,
      'dawnchoke-a-s' + seed + '-dawnchoke-a-' + filemode + '.json');
    rows.push(analyzeSeed(JSON.parse(fs.readFileSync(fp, 'utf8'))));
  }
  return rows;
}
// Staged raw rows (same shapes as the driver records).
function bidRow(day, vid, o) {
  return Object.assign({ day: day, part: 0, vid: vid, pickKind: 'EXPEDITION',
    winPlanAction: 'party_launch', override: 'win_plan:party_launch', deferred: null,
    commitKind: 'EXPEDITION', commitWinPlanAction: 'party_launch', commitDay: day }, o || {});
}
function waitBid(day, vid, o) {
  return Object.assign({ day: day, part: 3, vid: vid, pickKind: 'HAVEN_CHORE',
    winPlanAction: 'party_wait', override: 'win_plan:party_wait', deferred: null,
    commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'party_wait', commitDay: day }, o || {});
}
function brainCall(day, vid, o) {
  return Object.assign({ day: day, part: 0, vid: vid, source: 'brain',
    commitWinPlanAction: 'party_launch', commitKind: 'EXPEDITION', result: 'launch',
    planStage: 'party', planTarget: 'eulogy', planNeedWave: 4,
    profile: 'wanderer', occupation: 'sign_painter' }, o || {});
}

// ---- §A: firstBidDivergenceDay unit checks ----
(function () {
  const ctlA = { raw: { scorePicks: [waitBid(64, 'desmond')], departCalls: [] } };
  const armA = { raw: { scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
      commitKind: null, commitWinPlanAction: null, commitDay: null })],
    departCalls: [brainCall(65, 'desmond', { part: 2, result: 'normal',
      commitWinPlanAction: null, commitKind: null })] } };
  check('A1 deferred bid: first bid divergence day 64 (107611 shape)',
    firstBidDivergenceDay(ctlA, armA) === 64);
  const ctlB = { raw: { scorePicks: [waitBid(79, 'zoltan')], departCalls: [] } };
  const armB = { raw: { scorePicks: [bidRow(79, 'zoltan')],
    departCalls: [brainCall(79, 'zoltan', { planTarget: 'eater' })] } };
  check('A2 same-day bid: first bid divergence day 79',
    firstBidDivergenceDay(ctlB, armB) === 79);
  const ctlC = { raw: { scorePicks: [], departCalls: [] } };
  const armC = { raw: { scorePicks: [bidRow(30, 'bob')],
    departCalls: [brainCall(30, 'bob', { planTarget: 'deer', planNeedWave: 3 })] } };
  check('A3 non-wave-4+ bid does not count (null)',
    firstBidDivergenceDay(ctlC, armC) == null);
  const armD = { raw: { scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
      commitKind: null, commitWinPlanAction: null, commitDay: null })], departCalls: [] } };
  check('A4 bid with no wave-4+ call on its execution day does not count (null)',
    firstBidDivergenceDay(ctlA, armD) == null);
  const ctlE = { raw: { scorePicks: [bidRow(64, 'desmond')], departCalls: [] } };
  const armE = { raw: { scorePicks: [bidRow(64, 'desmond', { part: 1 })],
    departCalls: [brainCall(64, 'desmond')] } };
  check('A5 ctl bidding party_launch for the same vid/day is not a divergence (null)',
    firstBidDivergenceDay(ctlE, armE) == null);
  const ctlF = { raw: { scorePicks: [], departCalls: [] } };
  const armF = { raw: { scorePicks: [], departCalls: [] } };
  check('A6 no bids at all (null)', firstBidDivergenceDay(ctlF, armF) == null);
})();

// ---- §B: live case on the frozen corpus ----
(function () {
  const ctlRows = loadLeg('ctl', 'ctl');
  const liftRows = loadLeg('lift', 'arm');
  const armRows = loadLeg('arm', 'arm');
  const expectedBid = { 107601: 79, 107605: 37, 107611: 64 };
  for (let i = 0; i < SEEDS.length; i++) {
    const seed = SEEDS[i];
    const detArm = detGateForSeed(ctlRows[i], armRows[i]);
    const detLift = detGateForSeed(ctlRows[i], liftRows[i]);
    const exp = (expectedBid[seed] == null) ? null : expectedBid[seed];
    check('B1 seed ' + seed + ' arm firstBidDivergenceDay == ' + exp,
      detArm.firstBidDivergenceDay === exp);
    check('B2 seed ' + seed + ' lift firstBidDivergenceDay == ' + exp,
      detLift.firstBidDivergenceDay === exp);
    check('B3 seed ' + seed + ' det-gate passes under the amended bound (arm)',
      detArm.pass === true);
    check('B4 seed ' + seed + ' det-gate passes under the amended bound (lift)',
      detLift.pass === true);
  }
  const i611 = SEEDS.indexOf(107611);
  const d611a = detGateForSeed(ctlRows[i611], armRows[i611]);
  const d611l = detGateForSeed(ctlRows[i611], liftRows[i611]);
  check('B5 107611 arm: bound 64, firstExtra 65, firstSafety 66, firstDiv 64',
    d611a.bound === 64 && d611a.firstExtraDepartDay === 65 && d611a.firstSafetyDay === 66 &&
    d611a.firstDivergenceDay === 64 && d611a.mismatches.length === 0);
  check('B6 107611 lift: bound 64, firstExtra 65, firstSafety null, firstDiv 64',
    d611l.bound === 64 && d611l.firstExtraDepartDay === 65 && d611l.firstSafetyDay == null &&
    d611l.firstDivergenceDay === 64 && d611l.mismatches.length === 0);
  const i601 = SEEDS.indexOf(107601);
  const d601 = detGateForSeed(ctlRows[i601], armRows[i601]);
  check('B7 107601 bound unchanged at 79 (bid 79 = extra 79 = safety 79 = div 79)',
    d601.bound === 79 && d601.firstBidDivergenceDay === 79 &&
    d601.firstExtraDepartDay === 79 && d601.firstSafetyDay === 79 &&
    d601.firstDivergenceDay === 79);
  const i605 = SEEDS.indexOf(107605);
  const d605 = detGateForSeed(ctlRows[i605], armRows[i605]);
  check('B8 107605 bound unchanged at 37 (bid 37 = extra 37 = safety 37 = div 37)',
    d605.bound === 37 && d605.firstBidDivergenceDay === 37 &&
    d605.firstExtraDepartDay === 37 && d605.firstSafetyDay === 37 &&
    d605.firstDivergenceDay === 37);
})();

// ---- §C: metric counting reproduces the frozen judgment exactly ----
(function () {
  const ctlRows = loadLeg('ctl', 'ctl');
  const liftRows = loadLeg('lift', 'arm');
  const armRows = loadLeg('arm', 'arm');
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  check('C1 launches ctl 14 / lift 35 / arm 33 (frozen judgment)',
    sum(ctlRows, function (r) { return r.launchesN; }) === 14 &&
    sum(liftRows, function (r) { return r.launchesN; }) === 35 &&
    sum(armRows, function (r) { return r.launchesN; }) === 33);
  check('C2 total deaths ctl 1234 / lift 1287 / arm 1292 (frozen judgment)',
    sum(ctlRows, function (r) { return r.deaths; }) === 1234 &&
    sum(liftRows, function (r) { return r.deaths; }) === 1287 &&
    sum(armRows, function (r) { return r.deaths; }) === 1292);
  check('C3 instrument errors 0 on all 48 seed files',
    sum(ctlRows, function (r) { return r.errors; }) === 0 &&
    sum(liftRows, function (r) { return r.errors; }) === 0 &&
    sum(armRows, function (r) { return r.errors; }) === 0);
})();

console.log('departsafe re-judge proof test: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail === 0 ? 0 : 1);
