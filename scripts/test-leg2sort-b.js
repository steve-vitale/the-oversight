#!/usr/bin/env node
// test-leg2sort-b.js — proof for sim-leg2sort-b (fleshout-loop-b-20261025T1430Z).
//
// The leg2decide analyzer printed its three "sorted:" display lines by
// sorting toFixed(3) STRINGS (bare .sort()), so lexicographic order won
// over numeric order whenever a value crossed 10 (e.g. "14.960" before
// "2.977"). The fix sorts the NUMBERS ((a, b) => a - b) and formats after.
//
// S1: synthetic corpus A — parent ratios 2.977, 14.960, 0.500, where
//   lexicographic ("0.500, 14.960, 2.977") differs from numeric
//   ("0.500, 2.977, 14.960"). Asserts the fixed parent line is numeric.
// S2: synthetic corpus B — commit ratios 2.000, 10.000, 0.500 with parent
//   ratios all 1.000, so per-seed steps are the same three values.
//   Asserts BOTH the commit line and the steps line are numeric
//   ("0.500, 2.000, 10.000", not "0.500, 10.000, 2.000").
// S3: deciding numbers on corpus B are untouched by the display change:
//   M(parent) = 1.000x, M(commit) = 2.000x, step 2.000x, STEP REFUTED.
//
// No repo writes: all synthetic corpora live under os.tmpdir().
// No game load needed (analyzer + file checks only). No jest surface.
// Exit 0 = all PASS; exit 1 = any FAIL (loud).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ANALYZE_DECIDE = path.join(__dirname, 'analyze-leg2decide-b.js');
const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function runAnalyzer(corpusDir) {
  try {
    return { rc: 0, out: execFileSync('node', [ANALYZE_DECIDE, corpusDir], { encoding: 'utf8', timeout: 60000 }) };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}
// row: daysAlive=100, so rotFreshKcal IS the rot/100d value.
function writeRow(dir, anchor, side, seed, rot100) {
  const short = anchor.slice(0, 8);
  const f = path.join(dir, `leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json`);
  fs.writeFileSync(f, JSON.stringify({
    seed, policy: 'leadfeast', plentydepri: side === 'pd1' ? 1 : 0, depositgate: 1,
    daysAlive: 100, villageDays: 100, rotFreshKcal: rot100, rotPreservedKcal: 0,
    depriKcal: 0, deathCauses: {}, national: false, table: false, win: false,
    waveReach: [1], medianSurvival: null, anchorCommit: anchor,
  }));
}
function buildCorpus(anchors) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leg2sort-test-'));
  for (const [sha, sides] of Object.entries(anchors)) {
    sides.pd0.forEach((v, i) => writeRow(dir, sha, 'pd0', 9000 + i, v));
    sides.pd1.forEach((v, i) => writeRow(dir, sha, 'pd1', 9000 + i, v));
  }
  return dir;
}
function sortedLine(out, prefix) {
  return out.split('\n').find(l => l.trim().startsWith(prefix)) || '';
}

// ---- S1: parent line, lexicographic != numeric ----
{
  // pd0 all 100; parent pd1 [297.7, 1496, 50] -> ratios 2.977, 14.960, 0.500.
  // Commit ratios all 1.000 (pd1 = pd0) so steps mirror parent reciprocals.
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100], pd1: [297.7, 1496, 50] },
    [COMMIT]: { pd0: [100, 100, 100], pd1: [100, 100, 100] },
  });
  const { rc, out } = runAnalyzer(dir);
  const line = sortedLine(out, 'parent ratios sorted:');
  check('S1 analyzer exits 0 on differing-order corpus', rc === 0, 'rc=' + rc);
  check('S1 parent line is numeric order 0.500, 2.977, 14.960',
    line.includes('parent ratios sorted: 0.500, 2.977, 14.960'), line);
  check('S1 parent line is NOT lexicographic order',
    !line.includes('0.500, 14.960, 2.977'), line);
}
// ---- S2: commit + steps lines, lexicographic != numeric ----
{
  // Parent ratios all 1.000; commit pd1 [200, 1000, 50] -> ratios
  // 2.000, 10.000, 0.500; steps = commit/parent = same three values.
  const dir = buildCorpus({
    [PARENT]: { pd0: [100, 100, 100], pd1: [100, 100, 100] },
    [COMMIT]: { pd0: [100, 100, 100], pd1: [200, 1000, 50] },
  });
  const { rc, out } = runAnalyzer(dir);
  const cline = sortedLine(out, 'commit ratios sorted:');
  const sline = sortedLine(out, 'per-seed steps sorted:');
  check('S2 analyzer exits 0', rc === 0, 'rc=' + rc);
  check('S2 commit line is numeric order 0.500, 2.000, 10.000',
    cline.includes('commit ratios sorted: 0.500, 2.000, 10.000'), cline);
  check('S2 steps line is numeric order 0.500, 2.000, 10.000',
    sline.includes('per-seed steps sorted: 0.500, 2.000, 10.000'), sline);
  check('S2 neither line is lexicographic order',
    !cline.includes('0.500, 10.000, 2.000') && !sline.includes('0.500, 10.000, 2.000'),
    cline + ' || ' + sline);
  // ---- S3: deciding numbers untouched on the same corpus ----
  check('S3 M(parent)=1.000 M(commit)=2.000 step=2.000 on corpus B',
    /M\(parent\) = 1\.000x \| M\(commit\) = 2\.000x \| MEDIAN STEP RATIO = 2\.000x/.test(out),
    out.split('\n').slice(0, 8).join(' | '));
  check('S3 verdict STEP REFUTED on corpus B', /VERDICT.*STEP REFUTED/.test(out), '');
}

console.log(`\ntest-leg2sort-b: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
