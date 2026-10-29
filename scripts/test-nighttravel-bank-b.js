#!/usr/bin/env node
// test-nighttravel-bank-b.js — bank-staging proof for
// sim-nighttravel-bank-b (prereg:
// evidence/2026-10-28/sim-nighttravel-bank-b-prereg.md,
// committed BEFORE any scan or judged run).
//
// Usage:
//   node scripts/test-nighttravel-bank-b.js --scan <scan.json>
//     [--range 11000,11511] [--exclude 10800,10991]
//
// Checks (B1-B8), all from the scan JSON alone — no judged
// corpus, no policy-leg data, so staging cannot peek at
// conversion outcomes:
//   B1 scan seeds lie inside the declared scan range.
//   B2 no scan seed lies in the excluded already-judged range.
//   B3 qualifier order is (nearHomeAway desc, seed asc).
//   B4 every qualifier has nearHomeAway >= 2.
//   B5 pilot = first 8 qualifiers, extension = next 8.
//   B6 confirm = all remaining qualifiers; full staging
//      requires bank >= 24 (confirm >= 8), otherwise the
//      prereg short-bank branch is reported, not fudged.
//   B7 bands are disjoint and cover exactly the qualifier
//      order prefix (pilot+extension+confirm = bank).
//   B8 no band seed is outside the qualifier order.
// Exits 0 only if every check passes; prints the bands.
'use strict';
const fs = require('fs');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const scanFile = arg('scan', null);
if (!scanFile) { console.error('usage: --scan <scan.json> [--range lo,hi] [--exclude lo,hi]'); process.exit(2); }
const [rLo, rHi] = arg('range', '11000,11511').split(',').map((x) => parseInt(x.trim(), 10));
const [xLo, xHi] = arg('exclude', '10800,10991').split(',').map((x) => parseInt(x.trim(), 10));
const scan = JSON.parse(fs.readFileSync(scanFile, 'utf8'));
const fails = [];
const ok = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
};
const rows = scan.rows || [];
const quals = scan.qualifiers || [];
ok('B1 scan range', rows.every((r) => r.seed >= rLo && r.seed <= rHi),
  `${rows.length} rows in ${rLo}-${rHi}`);
ok('B2 excluded judged range', rows.every((r) => r.seed < xLo || r.seed > xHi),
  `none in ${xLo}-${xHi}`);
const sorted = quals.slice().sort((a, b) => (b.nearHomeAway - a.nearHomeAway) || (a.seed - b.seed));
ok('B3 qualifier order', JSON.stringify(quals.map((q) => q.seed)) === JSON.stringify(sorted.map((q) => q.seed)),
  quals.map((q) => `${q.seed}:${q.nearHomeAway}`).join(','));
ok('B4 min-near 2', quals.every((q) => q.nearHomeAway >= 2), `${quals.length} qualifiers`);
const pilot = quals.slice(0, 8).map((q) => q.seed);
const extension = quals.slice(8, 16).map((q) => q.seed);
const confirm = quals.slice(16).map((q) => q.seed);
ok('B5 pilot 8 + extension 8 (or fewer if bank short)',
  pilot.length === Math.min(8, quals.length) && extension.length === Math.min(8, Math.max(0, quals.length - 8)),
  `pilot ${pilot.join(',')} | extension ${extension.join(',')}`);
const full = quals.length >= 24;
ok('B6 confirm staging', full ? confirm.length >= 8 : confirm.length === Math.max(0, quals.length - 16),
  full ? `full staging, confirm ${confirm.length} >= 8` : `short-bank branch, bank ${quals.length}, confirm skipped-with-note (rest ${confirm.length})`);
const all = pilot.concat(extension, confirm);
ok('B7 bands disjoint + cover bank', all.length === quals.length && new Set(all).size === all.length,
  `bank ${quals.length} = pilot ${pilot.length} + extension ${extension.length} + confirm ${confirm.length}`);
ok('B8 bands from qualifier order only', JSON.stringify(all) === JSON.stringify(quals.map((q) => q.seed)),
  'no hand-picked seed');
console.log('--- bands ---');
console.log('pilot: ' + pilot.join(','));
console.log('extension: ' + extension.join(','));
console.log('confirm: ' + confirm.join(','));
console.log(`bank: ${quals.length} qualifiers (${full ? 'FULL STAGING' : 'SHORT-BANK BRANCH'})`);
if (fails.length) { console.error('BANK PROOF FAILED: ' + fails.join(', ')); process.exit(1); }
console.log('BANK PROOF GREEN (B1-B8)');
