#!/usr/bin/env node
// test-preservesched-b.js — proof for sim-preservesched-b (DIAG only).
//
// Proves every measurement in evidence/2026-10-26/sim-preservesched-b.md
// by re-running scripts/analyze-preservesched-b.js on the committed
// inflow-b corpus and asserting the numbers exactly. Read-only: writes
// nothing into the repo. Exits non-zero on any mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./analyze-preservesched-b.js');

const failures = [];
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name + (detail !== undefined ? ' — ' + detail : ''));
  else { failures.push(name); console.log('FAIL ' + name + (detail !== undefined ? ' — ' + detail : '')); }
}

const out = analyze();
check('neutrality 327/289/38', out.neutrality.pass, JSON.stringify(out.neutrality));
check('attribution-flag reproduction (0 mismatches)', out.attrFlagMismatch === 0,
  'mismatches=' + out.attrFlagMismatch);
check('lag distribution 1x32/2x4/3x1/4x1',
  JSON.stringify(out.lagDistribution) === JSON.stringify({ 1: 32, 2: 4, 3: 1, 4: 1 }),
  JSON.stringify(out.lagDistribution));
check('median lag 1.0', out.medianLag === 1, 'median=' + out.medianLag);
// Coverage arithmetic recomputed independently from the rows.
const recomputed = out.rows38.filter(r =>
  (r.lag === 1 || r.lag === 2) && r.eligibleAny &&
  !!(r.firstBound && r.firstBound.racksFull === true)).length;
check('coverage arithmetic exact', recomputed === out.primary.explained &&
  out.primary.explained === 36 && out.primary.total === 38,
  'recomputed=' + recomputed + ' reported=' + out.primary.explained + '/38');
check('primary verdict GO at >=80% bar',
  out.primary.verdict === 'GO' && out.primary.coverage >= 0.80,
  'coverage=' + out.primary.coverage.toFixed(4));
// Trigger legs, each 38/38.
check('eligibleAny 38/38',
  out.rows38.filter(r => r.eligibleAny).length === 38);
check('first-bound racksFull 38/38',
  out.rows38.filter(r => r.firstBound && r.firstBound.racksFull === true).length === 38);
check('first-bound ctxOk 38/38',
  out.rows38.filter(r => r.firstBound && r.firstBound.ctxOk).length === 38);
check('throttleFirst 38/38',
  out.rows38.filter(r => r.throttleFirst === true).length === 38);
check('preservedFirst >= rackCap 38/38',
  out.rows38.filter(r => r.firstBound && r.preservedFirst >= r.firstBound.rackCap).length === 38);
// Stock-window variant recomputed.
const stockVar = out.rows38.filter(r =>
  (r.lag === 1 || r.lag === 2) && r.eligibleAny &&
  !!(r.firstBound && r.firstBound.racksFull === true) && r.stockWindowKcal > 0).length;
check('stock-window variant 36/38',
  stockVar === out.secondary.stockWindowVariant.explained && stockVar === 36,
  'variant=' + stockVar);
// Residuals are exactly the two named days.
const residuals = out.rows38.filter(r =>
  !((r.lag === 1 || r.lag === 2) && r.eligibleAny &&
    !!(r.firstBound && r.firstBound.racksFull === true)));
check('residuals exactly (9750,83) and (9750,84)',
  residuals.length === 2 &&
  residuals[0].seed === 9750 && residuals[0].day === 83 && residuals[0].lag === 3 &&
  residuals[1].seed === 9750 && residuals[1].day === 84 && residuals[1].lag === 4,
  JSON.stringify(residuals.map(r => [r.seed, r.day, r.lag])));
check('residuals have zero stock-window kcal',
  residuals.every(r => r.stockWindowKcal === 0));
// Corpus validity: 8 cap1 files, no truncation.
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-inflow-b-corpus');
const files = fs.readdirSync(dir).filter(f => /^inflow-b-cap1-.*\.json$/.test(f)).sort();
check('corpus has 8 cap1 files', files.length === 8, 'files=' + files.length);
let truncBad = 0, seedsOk = true;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (d.cookTruncated || d.eventTruncated || d.inflowTruncated) truncBad++;
  if (!out.seeds.includes(d.seed)) seedsOk = false;
}
check('no corpus truncation flags', truncBad === 0, 'flagged=' + truncBad);
check('corpus seeds match analysis', seedsOk && out.seeds.length === 8,
  'seeds=' + out.seeds.join(','));
// Wall numbers.
check('wall national/table/win 0/8', out.wall.national === 0 && out.wall.table === 0 && out.wall.win === 0);
check('wall wave4/wave5 0/8', out.wall.wave4 === 0 && out.wall.wave5 === 0);
check('wall median daysAlive 100 (censored)', out.wall.medianDaysAlive === 100,
  'daysAlive=' + out.wall.daysAlive.join(','));
// Corroboration: attributed days also lag 1-2 to prior inflow.
const attrLag12 = Object.entries(out.secondary.lagToPriorForAttributed)
  .filter(([k]) => k === '1' || k === '2').reduce((s, [, v]) => s + v, 0);
check('attributed lag-to-prior <=2 on 284/289', attrLag12 === 284, 'count=' + attrLag12);

if (failures.length) {
  console.log('PROOF FAILED: ' + failures.length + ' check(s) failed');
  process.exit(1);
}
console.log('PROOF GREEN: all sim-preservesched-b measurements reproduce exactly');
