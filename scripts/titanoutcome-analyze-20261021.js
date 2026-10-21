#!/usr/bin/env node
// titanoutcome-analyze-20261021.js — attribution analysis for the
// sim-titanoutcome corpus (evidence/2026-10-21/perseed-titanoutcome/).
//
// Judges the pre-registered PRIMARY: >=95% attribution of titan coalition
// engagements on >=12 wave-4-unlocked runs, 0 unexplained, 0
// instrumentErrors. Prints the wall numbers + the class taxonomy +
// cross-check residuals. Never re-scores (§14): the verdict is printed
// against the written gate; doubts go in the evidence file's metric review.
//
// Usage: node scripts/titanoutcome-analyze-20261021.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-21', 'perseed-titanoutcome');

const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_')) : [];
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const w4 = rows.filter(r => r.wave4 === 1);
let enc = 0, unexpl = 0, xunexpl = 0, errs = 0, recs = 0;
const byClass = {};
for (const r of rows) {
  enc += r.encounters | 0;
  unexpl += r.unexplained | 0;
  xunexpl += (r.crossCheck && r.crossCheck.unexplained ? r.crossCheck.unexplained.length : 0);
  errs += (r.instrumentErrors || []).length;
  recs += (r.gameRecords || []).length;
  for (const [k, v] of Object.entries(r.byClass || {})) byClass[k] = (byClass[k] || 0) + v;
}
const attrRate = enc ? (100 * (enc - unexpl) / enc) : null;

console.log('== sim-titanoutcome attribution ==');
console.log(`runs: ${rows.length}, wave-4-unlocked: ${w4.length}`);
console.log(`titan encounters: ${enc}, game-side records: ${recs}`);
console.log('classes:', JSON.stringify(byClass));
console.log(`attribution: ${enc - unexpl}/${enc}${attrRate == null ? '' : ` = ${attrRate.toFixed(1)}%`}`);
console.log(`unexplained (instrument): ${unexpl}`);
console.log(`unexplained (cross-check): ${xunexpl}`);
console.log(`instrumentErrors: ${errs}`);
console.log('');
console.log('PRIMARY (written gate: >=95% attribution on >=12 wave-4-unlocked runs, 0 unexplained, 0 instrumentErrors):');
const go = w4.length >= 12 && attrRate != null && attrRate >= 95 && unexpl === 0 && xunexpl === 0 && errs === 0;
console.log(go ? 'GO' : 'NO-GO');
if (w4.length < 12) console.log(`  - wave-4-unlocked runs ${w4.length} < 12 (eligibility assumption)`);
if (attrRate != null && attrRate < 95) console.log(`  - attribution ${attrRate.toFixed(1)}% < 95%`);
if (unexpl) console.log(`  - ${unexpl} unexplained instrument encounters`);
if (xunexpl) console.log(`  - ${xunexpl} cross-check residuals`);
if (errs) console.log(`  - ${errs} instrument errors`);
// residuals for the evidence file
for (const r of rows) {
  const xu = (r.crossCheck && r.crossCheck.unexplained) || [];
  if (xu.length) console.log(`  residual ${r.policy} s${r.seed}:`, JSON.stringify(xu.slice(0, 3)));
}
