'use strict';
// test-exphurt-24-a.js — proof for scripts/sweep-exphurt-24-a.js +
// the 24-a prereg judgment rule (sim-exphurt-24-a, run
// fleshout-20261104T1836Z, axis food-economy). Must be green BEFORE
// the judged sims. No game code, no RNG, no harness load: the sweep
// module is required only for its exported BAND/validateSeeds
// (its main block is guarded by require.main, so requiring it runs
// no sim). Metric libs are the unchanged prior-arm libs.
const assert = require('assert');
// The sweep module enforces its shipped-default env gates at load
// (same gates the judged run sets); the test process sets them
// explicitly before requiring it, and sets DAYS so the module's
// own DAYS check passes. Requiring it runs no sim (main guarded).
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.DAYS = '100';
// The sweep validates its SEEDS env at load (top-level gate, not
// just in the runner); give it exactly the pre-registered band so
// the require succeeds. The candidate-list tests below exercise
// validateSeeds() itself against other lists.
process.env.SEEDS = [...Array(24)].map((_, i) => 99933 + i).join(',');
const sweep = require('./sweep-exphurt-24-a');
const clib = require('./exphurt-confirm-a-lib');
const exlib = require('./exphurt-a-lib');

let n = 0;
const eq = (a, b, msg) => { n++; assert.deepStrictEqual(a, b, msg); };

// BAND: exactly the pre-registered single un-staged band, 24 seeds.
const BAND = [...Array(24)].map((_, i) => 99933 + i);
eq(sweep.BAND, BAND, 'BAND is exactly 99933-99956');
eq(sweep.BAND.length, 24, 'BAND has 24 seeds');
eq(sweep.DAYS, 100, 'DAYS is exactly 100');

// validateSeeds: accepts exactly the band, refuses everything else.
eq(sweep.validateSeeds(BAND), true, 'accepts the exact band');
eq(sweep.validateSeeds([99917, 99918, 99919, 99920, 99921, 99922, 99923, 99924]), false, 'refuses confirm HALF1');
eq(sweep.validateSeeds([99925, 99926, 99927, 99928, 99929, 99930, 99931, 99932]), false, 'refuses confirm HALF2');
eq(sweep.validateSeeds([99901, 99902, 99903, 99904, 99905, 99906, 99907, 99908]), false, 'refuses prior pilot band');
eq(sweep.validateSeeds(BAND.slice(0, 23)), false, 'refuses a 23-seed prefix');
eq(sweep.validateSeeds([...BAND, 99957]), false, 'refuses band plus one extra seed');
eq(sweep.validateSeeds([]), false, 'refuses empty list');
eq(sweep.validateSeeds(BAND.slice().reverse()), false, 'refuses reversed band (order matters)');
const prior = new Set([...Array(32)].map((_, i) => 99901 + i));
eq(BAND.some((s) => prior.has(s)), false, 'band shares no seed with any prior band 99901-99932');

// D-last denominator rule (unchanged confirm lib): expedition cases
// with BOTH durations present at last hurt; missing excluded.
const dCases = [
  { purpose: 'expedition', expedDurationAtLastHurt: 10, awayDuration: 12 },
  { purpose: 'expedition', expedDurationAtLastHurt: null, awayDuration: 12 },
  { purpose: 'expedition', expedDurationAtLastHurt: 10, awayDuration: null },
  { purpose: 'visit', expedDurationAtLastHurt: 1, awayDuration: 12 },
];
eq(clib.summarizeLastHurt(dCases).disconnectDenomLastHurt, 1, 'D-last denominator is both-present expedition cases only');

// M1 rule (unchanged exphurt lib): announced expedition returns only;
// the M1 denominator excludes silent returns (those live in M1-all).
const mCases = [
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [{ isExpeditionReturn: true, mentionsHurt: false }] },
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [] },
];
const S = exlib.summarize(mCases);
eq(S.rhWithExpeditionLine, 1, 'M1 denominator is announced expedition returns only');
eq(S.M1, 0, 'M1 is 0 when the one announced line omits hurt');
eq(clib.m1All(mCases).M1All, 0, 'M1-all counts the silent return as a miss');

// Prereg verdict rule, verbatim from sim-exphurt-24-a-prereg.md:
// D-last < 8 -> INSUFFICIENT-DATA; D-last >= 8 and M1 <= 0.20 -> GO
// (SPEC-READY); D-last >= 8 and M1 > 0.20 -> NO-GO; null M1 with
// D-last >= 8 -> INSUFFICIENT-DATA (never GO on a null M1).
function judge(dLastDenom, m1) {
  if (dLastDenom < 8) return 'INSUFFICIENT-DATA';
  if (m1 == null) return 'INSUFFICIENT-DATA';
  if (m1 <= 0.20) return 'GO';
  return 'NO-GO';
}
eq(judge(7, 0), 'INSUFFICIENT-DATA', 'D-last 7 is insufficient even at M1 0');
eq(judge(8, 0), 'GO', 'D-last 8 + M1 0 is GO');
eq(judge(8, 0.20), 'GO', 'M1 exactly 0.20 is GO (threshold inclusive)');
eq(judge(8, 0.21), 'NO-GO', 'M1 above 0.20 is NO-GO');
eq(judge(12, null), 'INSUFFICIENT-DATA', 'null M1 is never GO');
eq(judge(0, 0), 'INSUFFICIENT-DATA', 'zero denominator is insufficient, not GO');

console.log(`test-exphurt-24-a: ${n}/${n} green`);
