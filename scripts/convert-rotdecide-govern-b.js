#!/usr/bin/env node
// convert-rotdecide-govern-b.js — fresh-corpus -> govern-verdict.js input
// (sim-rotdecide-govern-b, 2026-10-24, oversight-flesh-out-loop-b, axis
// food-economy). Measurement/tooling only: zero src/js game changes.
//
// Reads ONLY the fresh rotdecide-govern corpus dir (default
// evidence/2026-10-24/rotdecide-govern-b-corpus/) and emits the
// {records: [...]} input scripts/govern-verdict.js expects:
//   {seed, parent: {pd0: {rot, days}, pd1: {rot, days}},
//    commit: {pd0: {rot, days}, pd1: {rot, days}}}
// where rot = rotFreshKcal + rotPreservedKcal and days = daysAlive.
//
// REFUSAL RULES (fail loudly, exit 2, never silently drop or impute):
//  - a per-seed file whose anchorCommit is not one of the two pre-registered
//    pair anchors is REFUSED (a foreign corpus file must never enter a
//    deciding input — this is what makes the corpus "fresh-only");
//  - a seed missing any of the four (anchor x side) cells is REFUSED;
//  - a file whose seed field disagrees with its filename seed is REFUSED;
//  - a 0-byte / unparseable file is REFUSED.
// Usage: node scripts/convert-rotdecide-govern-b.js [corpusDir] [outFile]
//   Defaults: corpusDir = evidence/2026-10-24/rotdecide-govern-b-corpus,
//   outFile = <corpusDir>/govern-input.json (written via the same
//   readback-checked write the sweep driver uses).
'use strict';
const fs = require('fs');
const path = require('path');

const PARENT = '1f24a4ef04a857d33138fd0845cfa83df688285c';
const COMMIT = '75fdd92587ad9d83bb12f05da535cdfb49255835';

function fatal(msg) {
  console.error('FATAL: ' + msg);
  process.exit(2);
}

function convert(corpusDir) {
  const files = fs.readdirSync(corpusDir)
    .filter((f) => f.startsWith('leg2drift-b-') && f.endsWith('.json'))
    .sort();
  const bySeed = new Map(); // seed -> {parent: {pd0,pd1}, commit: {pd0,pd1}}
  for (const f of files) {
    const m = f.match(/-s(\d+)\.json$/);
    if (!m) fatal(`unparseable corpus filename ${f}`);
    const fileSeed = parseInt(m[1], 10);
    let row;
    try {
      row = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    } catch (e) {
      fatal(`unparseable corpus file ${f}: ${e.message}`);
    }
    if (row.seed !== fileSeed) {
      fatal(`seed mismatch in ${f}: file says ${row.seed}, filename says ${fileSeed}`);
    }
    const anchor = row.anchorCommit;
    let anchorKey = null;
    if (anchor === PARENT) anchorKey = 'parent';
    else if (anchor === COMMIT) anchorKey = 'commit';
    else fatal(`foreign anchor in ${f}: anchorCommit ${anchor} is not the pre-registered pair`);
    const side = row.plentydepri === 1 ? 'pd1' : row.plentydepri === 0 ? 'pd0' : null;
    if (!side) fatal(`bad plentydepri in ${f}: ${row.plentydepri}`);
    if (!Number.isFinite(row.rotFreshKcal) || !Number.isFinite(row.rotPreservedKcal)
      || !Number.isFinite(row.daysAlive)) {
      fatal(`bad rot/days fields in ${f}`);
    }
    if (!bySeed.has(fileSeed)) bySeed.set(fileSeed, { seed: fileSeed, parent: {}, commit: {} });
    const rec = bySeed.get(fileSeed);
    if (rec[anchorKey][side]) fatal(`duplicate cell ${f}`);
    rec[anchorKey][side] = {
      rot: row.rotFreshKcal + row.rotPreservedKcal,
      days: row.daysAlive,
    };
  }
  const records = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
  for (const rec of records) {
    for (const anchorKey of ['parent', 'commit']) {
      for (const side of ['pd0', 'pd1']) {
        if (!rec[anchorKey][side]) {
          fatal(`seed ${rec.seed} missing cell ${anchorKey}/${side} (corpus incomplete)`);
        }
      }
    }
  }
  return { records };
}

function main() {
  const corpusDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'rotdecide-govern-b-corpus');
  const outFile = process.argv[3] || path.join(corpusDir, 'govern-input.json');
  if (!fs.existsSync(corpusDir)) fatal(`corpus dir missing: ${corpusDir}`);
  const out = convert(corpusDir);
  const data = JSON.stringify(out, null, 2) + '\n';
  fs.writeFileSync(outFile, data);
  const back = fs.readFileSync(outFile, 'utf8');
  if (back.length !== data.length) fatal(`readback length mismatch on ${outFile}`);
  console.log(`wrote ${outFile} (${out.records.length} records)`);
}

if (require.main === module) main();
module.exports = { convert, PARENT, COMMIT };
