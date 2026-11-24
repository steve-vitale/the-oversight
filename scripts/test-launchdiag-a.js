// scripts/test-launchdiag-a.js — proof test for sub-arm (1a):
// pick-early-return delay-vs-wall (prereg §3, bar 3 instrument
// validity). Proves the INSTRUMENT; the evidence file judges the
// bars. Reads only; never writes into the repo.
//   node scripts/test-launchdiag-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-launchdiag-a'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

// 1. Frozen 14-day set: re-extract from the frozen analysis JSON and
// compare to the analyzer's frozen table (prereg §1) — no drift.
const frozenAnalysis = JSON.parse(fs.readFileSync(
  path.join(REPO, 'evidence', '2026-11-23', 'musterask-a-analysis.json'), 'utf8'));
const extracted = [];
for (const ps of frozenAnalysis.perSeed) {
  for (const e of (ps.neverScored || [])) {
    if (e.cause === 'never-asked:pick-early-return') {
      extracted.push({ seed: ps.seed, day: e.day, vid: e.vid, stage: e.stage, target: e.target });
    }
  }
}
extracted.sort(function (a, b) { return (a.seed - b.seed) || (a.day - b.day) || (a.vid < b.vid ? -1 : 1); });
const frozenTable = analyzer.JUDGED_14.map(function (j) {
  return { seed: j.seed, day: j.day, vid: j.vid, stage: j.stage, target: j.target };
}).sort(function (a, b) { return (a.seed - b.seed) || (a.day - b.day) || (a.vid < b.vid ? -1 : 1); });
check('frozen-14-set-matches-prereg', JSON.stringify(extracted) === JSON.stringify(frozenTable),
  'extracted ' + extracted.length + ' vs table ' + frozenTable.length);

// 2. Analyzer selftest green.
check('analyzer-selftest-green', analyzer.selftest());

// 3. Full run over the frozen corpora: cross-check + wall + errors.
const dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-musterask-a-ctl');
const frozenPath = path.join(REPO, 'evidence', '2026-11-23', 'musterask-a-analysis.json');
const result = analyzer.analyzeDir(dir, frozenPath);
check('crosscheck-neverScored-8of8', result.crossCheck.seedsCompared === 8 &&
  result.crossCheck.neverScoredMatch === 8 &&
  result.crossCheck.neverScoredMismatch.length === 0,
  JSON.stringify(result.crossCheck));
check('crosscheck-wall-matches-frozen', result.crossCheck.wallMatch === true,
  JSON.stringify(result.wallNumbers));
check('wall-numbers-frozen', result.wallNumbers.wins === 0 && result.wallNumbers.national === 0 &&
  result.wallNumbers.wave5 === 3 && result.wallNumbers.wave4 === 8 &&
  result.wallNumbers.medianSurvival === 150 && result.wallNumbers.villagesLost === 2 &&
  result.wallNumbers.totalDeaths === 778, JSON.stringify(result.wallNumbers));
check('instrument-errors-0', result.instrumentErrors === 0);
check('judged-14-rows', result.judged.length === 14 && result.judgedSet === 14);
check('delay-wall-split-sums', result.delay + result.wall + result.unclassified === 14,
  'delay ' + result.delay + ' wall ' + result.wall + ' unclassified ' + result.unclassified);

// 4. Determinism: run twice, byte-identical classification output.
const again = analyzer.analyzeDir(dir, frozenPath);
check('determinism-byte-identical',
  JSON.stringify(result) === JSON.stringify(again));

// 5. Amendment 1 applied: the henry_zhang d120 day is named (not
// unclassified) via the dawn cause underneath the EOD label.
const henry = result.judged.filter(function (j) { return j.vid === 'henry_zhang'; })[0];
check('amend1-henry-named', henry && henry.cls === 'wall-other-dawn-cause' &&
  henry.proof && henry.proof.eodCause === 'never-asked:holder-not-scored',
  henry ? JSON.stringify(henry) : 'missing');

console.log('test-launchdiag-a: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
