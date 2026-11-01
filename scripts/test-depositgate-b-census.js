#!/usr/bin/env node
// test-depositgate-b-census.js — proof tests for the depositgate census
// instrument (DIAG ONLY; sim-depositgate-b).
// NOTE: scripts/test-depositgate-b.js already exists (2026-10-22 adoption
// proof) and is NOT edited by this arm; this is the new census proof test.
//
// Default run: pure checks only (no game load, no file writes, no RNG).
//   node scripts/test-depositgate-b-census.js
// Live contrast run (also runs the pure checks first):
//   node scripts/test-depositgate-b-census.js --live [seed]
// Spawns the driver as separate processes (one harness per process) for
// one seed under DEPOSITGATE=0 and =1, and asserts: control eased total
// is exactly 0, armed accounting ties within tolerance, armed eased total
// > 0 (seed 51101 showed fire-eating lines under supplyleg). Live output
// goes to /tmp, never into evidence/ (proof output is not judged census).
'use strict';
const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { sumLedgerDays, deriveDays, scattered, analyzeSeed, verdictForBand, goCheck } = require('./analyze-depositgate-b');

let n = 0;
function check(actual, expected, label) {
  n++;
  assert.strictEqual(actual, expected, label + ': got ' + actual + ', want ' + expected);
}

// --- sumLedgerDays ---
check(sumLedgerDays({ 5: { shareEased: 100, returnEased: 2, bigHaulEased: 1, tributeWaived: 3000 } }).share, 100, 'ledger share');
check(sumLedgerDays({ 5: { shareEased: 100, returnEased: 2, bigHaulEased: 1, tributeWaived: 3000 } }).tributeWaived, 3000, 'ledger tribute kept separate');

// --- deriveDays: cumulative deltas, tribute never in easedFire ---
const mkSeed = (rows, extra) => Object.assign({
  seed: 51101, arm: 'armed', endReason: 'survived', daysAlive: rows.length,
  maxWaveUnlocked: 1, waveKills: {}, holdbacks: [], sayLines: [],
}, extra, { rows });
const rows3 = [
  { loopDay: 1, gameDay: 1, pantryKcal: 50000, morningPantryKcal: 50000, gateEngaged: true, cum: { share: 100, returnCount: 0, bigCount: 0, tributeWaived: 0, holdbackKcal: 50, intakeKcal: 150 } },
  { loopDay: 2, gameDay: 2, pantryKcal: 49000, morningPantryKcal: 49000, gateEngaged: true, cum: { share: 100, returnCount: 1, bigCount: 0, tributeWaived: 4000, holdbackKcal: 250, intakeKcal: 350 } },
  { loopDay: 3, gameDay: 3, pantryKcal: 49500, morningPantryKcal: 49500, gateEngaged: false, cum: { share: 300, returnCount: 1, bigCount: 0, tributeWaived: 4000, holdbackKcal: 250, intakeKcal: 550 } },
];
const d3 = deriveDays(mkSeed(rows3));
check(d3[0].easedFire, 150, 'day1 eased = share 100 + holdback 50');
check(d3[1].easedFire, 200, 'day2 eased = holdback 200 only');
check(d3[1].tributeWaivedDay, 4000, 'day2 tribute recorded');
check(d3[2].easedFire, 200, 'day3 eased = share 200 only');
check(d3[1].pantryDelta, -1000, 'day2 pantry fell');
check(d3[2].pantryDelta, 500, 'day3 pantry rose');

// --- analyzeSeed: fullWhileFalling, accounting, census completeness ---
const a3 = analyzeSeed(mkSeed(rows3, { holdbacks: [{ loopDay: 1 }, { loopDay: 2 }] }));
check(a3.easedTotal, 550, 'eased total');
check(a3.shareTotal, 300, 'share total');
check(a3.holdbackTotal, 250, 'holdback total');
check(a3.intakeTotal, 550, 'intake total ties');
check(a3.tributeTotal, 4000, 'tribute total separate');
check(a3.accountingOk, true, 'accounting ties within tolerance');
check(a3.accountingDiff, 0, 'accounting diff zero');
check(a3.engagedDays, 2, 'engaged days');
check(a3.fullWhileFalling, 1, 'one full-while-falling day (day2 engaged + fell)');
check(a3.censusComplete, true, 'census complete');
check(a3.collapsed, false, 'survived not collapsed');

// Accounting breach is caught, not smoothed.
const bad = analyzeSeed(mkSeed(rows3, { holdbacks: [] }));
bad.intakeTotal = 9999; // force a breach after analysis? No: recompute instead.
const rowsBad = JSON.parse(JSON.stringify(rows3));
rowsBad[2].cum.intakeKcal = 99999;
const aBad = analyzeSeed(mkSeed(rowsBad, { holdbacks: [{ loopDay: 1 }, { loopDay: 2 }] }));
check(aBad.accountingOk, false, 'accounting breach detected');

// Census incomplete when rows != daysAlive or gateEngaged missing.
const aInc = analyzeSeed(mkSeed(rows3, { daysAlive: 5 }));
check(aInc.censusComplete, false, 'rows != daysAlive incomplete');
const rowsNull = JSON.parse(JSON.stringify(rows3));
rowsNull[1].gateEngaged = null;
check(analyzeSeed(mkSeed(rowsNull)).censusComplete, false, 'null gateEngaged incomplete');

// --- scattered detection ---
check(scattered({ endReason: 'village-lost', sayLines: [] }), true, 'village-lost scatters');
check(scattered({ endReason: 'survived', sayLines: [{ line: 'The scattering, again.' }] }), true, 'say line scatters');
check(scattered({ endReason: 'survived', sayLines: [{ line: 'All is well.' }] }), false, 'no scatter line');

// --- preCollapse7 / engagedBeforeCollapse windows (collapse day excluded) ---
const rowsCol = [];
for (let i = 1; i <= 10; i++) {
  rowsCol.push({ loopDay: i, gameDay: i, pantryKcal: 50000 - i * 100, gateEngaged: i >= 8,
    cum: { share: i <= 3 ? 0 : (i - 3) * 100, returnCount: 0, bigCount: 0, tributeWaived: 0, holdbackKcal: 0, intakeKcal: i <= 3 ? 0 : (i - 3) * 100 } });
}
const aCol = analyzeSeed(mkSeed(rowsCol, { endReason: 'village-lost', daysAlive: 10, sayLines: [{ line: 'scattering' }] }));
check(aCol.collapsed, true, 'collapsed flag');
check(aCol.scattered, true, 'collapsed seed scattered');
check(aCol.preCollapse7, 600, 'preCollapse7 sums days 3..9 eased (6 days x 100)');
check(aCol.engagedBeforeCollapse, 2, 'engaged days 8,9 before collapse day 10');
check(aCol.fullWhileFalling, 3, 'engaged falling days 8,9,10');

// --- verdict rule: all three states ---
const vSup = verdictForBand([{ collapsed: true, preCollapse7: 500, fullWhileFalling: 1 }, { collapsed: false, preCollapse7: 0, fullWhileFalling: 0 }]);
check(vSup.verdict, 'SUPPORTED', 'supported verdict');
const vNot = verdictForBand([{ collapsed: true, preCollapse7: 0, fullWhileFalling: 3 }]);
check(vNot.verdict, 'NOT-SUPPORTED', 'not-supported when no pre-collapse easing');
const vNot2 = verdictForBand([{ collapsed: true, preCollapse7: 500, fullWhileFalling: 0 }]);
check(vNot2.verdict, 'NOT-SUPPORTED', 'not-supported when never falling-while-full');
const vUnj = verdictForBand([{ collapsed: false, preCollapse7: 0, fullWhileFalling: 2 }]);
check(vUnj.verdict, 'UNJUDGED', 'unjudged with no collapse');

// --- GO bars ---
const ctrl = { seed: 1, arm: 'control', easedTotal: 0, accountingOk: true, censusComplete: true };
const armGood = { seed: 1, arm: 'armed', easedTotal: 100, accountingOk: true, censusComplete: true };
check(goCheck([ctrl], [armGood]).go, true, 'GO passes');
const ctrlBad = Object.assign({}, ctrl, { easedTotal: 5 });
check(goCheck([ctrlBad], [armGood]).go, false, 'control easing breaks GO');
check(goCheck([ctrl], [Object.assign({}, armGood, { easedTotal: 0 })]).go, false, 'armed all-zero breaks GO');
check(goCheck([ctrl], [Object.assign({}, armGood, { accountingOk: false })]).go, false, 'accounting breach breaks GO');
check(goCheck([ctrl], [Object.assign({}, armGood, { censusComplete: false })]).go, false, 'incomplete census breaks GO');

console.log('test-depositgate-b-census: ' + n + ' pure checks passed');

// --- live contrast (only with --live) ---
if (process.argv.includes('--live')) {
  const seed = process.argv[process.argv.indexOf('--live') + 1] || '51101';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-live-'));
  const runArm = (dg) => {
    const out = path.join(tmp, 'arm' + dg + '.jsonl');
    const env = Object.assign({}, process.env, {
      POLICY: 'competent', COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0',
      DEPOSITGATE: String(dg), DAYS: '30', SEEDS: String(seed),
    });
    for (const k of ['WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) delete env[k];
    const r = spawnSync('node', ['scripts/depositgate-b-driver.js'], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) { console.error(r.stderr); throw new Error('driver arm ' + dg + ' exited ' + r.status); }
    // The in-memory parse below is authoritative; the /tmp record copy is
    // best-effort with EPERM-flap retries (2026-11-01: flap hit this very
    // write). Never let a record-copy failure fail the contrast itself.
    const parsed = JSON.parse(r.stdout.trim().split('\n')[0]);
    for (let attempt = 1; attempt <= 4; attempt++) {
      try { fs.writeFileSync(out, r.stdout); break; }
      catch (e) {
        if (attempt === 4) { console.error('live contrast: /tmp record copy failed after retries (in-memory result still authoritative): ' + e.message); break; }
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(10000, 2000 * attempt));
      }
    }
    return parsed;
  };
  const c0 = runArm(0);
  const c1 = runArm(1);
  const a0 = analyzeSeed(c0);
  const a1 = analyzeSeed(c1);
  let m = 0;
  const mcheck = (actual, expected, label) => { m++; assert.strictEqual(actual, expected, label + ': got ' + actual + ', want ' + expected); };
  mcheck(a0.easedTotal, 0, 'live control eased total is exactly 0');
  mcheck(a0.arm, 'control', 'live control arm label');
  mcheck(a1.arm, 'armed', 'live armed arm label');
  mcheck(a1.accountingOk, true, 'live armed accounting ties');
  mcheck(a1.censusComplete, true, 'live armed census complete');
  mcheck(a1.easedTotal > 0, true, 'live armed eased total > 0 on seed ' + seed);
  console.log('test-depositgate-b-census: live contrast seed=' + seed +
    ' control eased=' + a0.easedTotal + ' armed eased=' + a1.easedTotal +
    ' armed accountingDiff=' + a1.accountingDiff + ' (' + m + ' live checks passed)');
}
