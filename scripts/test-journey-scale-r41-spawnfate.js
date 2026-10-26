#!/usr/bin/env node
// scripts/test-journey-scale-r41-spawnfate.js — proof test for the r41
// spawnfate sweep. Re-derives every per-seed fate partition from the
// corpus rows on disk (via the sweep module's own classifyFate) and
// asserts the summary.json numbers equal the recomputation, the band
// totals match, and the verdict follows the pre-registered rule
// (FATE-GO iff fully-partitioned seeds >= 6). Exit 1 on any mismatch.
// Usage: node scripts/test-journey-scale-r41-spawnfate.js
//   (EVID env overrides the corpus dir; default
//   evidence/2026-10-26/journey-scale-r41-spawnfate.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyFate, SEEDS } = require('./test-spawnfate-diag');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} :: ${detail || ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'journey-scale-r41-spawnfate');
  const summary = JSON.parse(fs.readFileSync(path.join(evidDir, 'summary.json'), 'utf8'));
  const rows = [];
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fate.json`);
    if (!fs.existsSync(fn)) { console.log(`MISSING ${fn}`); continue; }
    rows.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
  }
  check('corpus 8 rows', rows.length === 8, `got ${rows.length}`);
  check('all rows have spawnfate census days', rows.every(r => Array.isArray(r.spawnfate.days) && r.spawnfate.days.length > 0));
  check('all rows have spawnsrc spawns', rows.every(r => Array.isArray(r.spawnsrc.spawns)));
  for (const seed of SEEDS) {
    const row = rows.find(r => r.seed === seed);
    if (!row) { check(`seed ${seed} row present`, false); continue; }
    const c = classifyFate(row);
    const s = summary.perSeed.find(p => p.seed === seed);
    check(`seed ${seed} fates match summary`, !!s && eq(c.fates, s.fates),
      `recomputed ${JSON.stringify(c.fates)} vs summary ${s ? JSON.stringify(s.fates) : 'missing'}`);
    check(`seed ${seed} partition sums to spawns4`, c.spawns4 === Object.values(c.fates).reduce((t, n) => t + n, 0),
      `spawns4=${c.spawns4} sum=${Object.values(c.fates).reduce((t, n) => t + n, 0)}`);
    check(`seed ${seed} never counts match`, !!s && c.neverFought === s.neverFought && eq(c.neverFateCounts, s.neverFateCounts));
    check(`seed ${seed} fullyPartitioned match`, !!s && c.fullyPartitioned === s.fullyPartitioned);
    check(`seed ${seed} near-player match`, !!s && eq(c.nearPlayer, s.nearPlayer));
  }
  const bandFates = {};
  for (const p of summary.perSeed) for (const k of Object.keys(p.fates)) bandFates[k] = (bandFates[k] || 0) + p.fates[k];
  check('band fates match summary', eq(bandFates, summary.bandFates));
  const fullyN = summary.perSeed.filter(p => p.fullyPartitioned).length;
  check('fully-partitioned count matches summary', summary.fullyPartitionedSeeds === fullyN);
  const expected = (fullyN >= 6) ? 'FATE-GO' : 'FATE-NO-GO';
  check('verdict follows rule (>= 6 fully-partitioned)', summary.verdict === expected,
    `fully=${fullyN} verdict=${summary.verdict}`);
  console.log(`\nPROOF test-journey-scale-r41-spawnfate: ${pass} PASS, ${fail} FAIL`);
  if (fail) process.exit(1);
}
if (require.main === module) main();
