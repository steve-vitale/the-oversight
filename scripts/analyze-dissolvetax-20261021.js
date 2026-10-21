#!/usr/bin/env node
// analyze-dissolvetax-20261021.js — taxonomy table + wall numbers for
// sim-dissolvetax. Reads evidence/2026-10-21/perseed-dissolvetax/.
// Usage: node scripts/analyze-dissolvetax-20261021.js [evid-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-21', 'perseed-dissolvetax');

const files = fs.readdirSync(EVID).filter(f => /^dissolvetax-.*-s\d+\.json$/.test(f) && !/census/.test(f));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

const classes = ['primary-foreign-collapse', 'sub-drift', 'arrears-disqualify', 'raid-burn', 'schism', 'other', 'unexplained'];
const byClass = {}; const byClassLead = {}; const byClassBelong = {};
for (const c of classes) { byClass[c] = []; byClassLead[c] = []; byClassBelong[c] = []; }
let totalLosses = 0, unexplained = 0, instrumentErrors = 0;

for (const r of rows) {
  instrumentErrors += (r.instrumentErrors || []).length;
  for (const a of (r.attributions || [])) {
    totalLosses++;
    const c = classes.indexOf(a.class) >= 0 ? a.class : 'other';
    byClass[c].push(r.seed + '/' + r.base + ' d' + a.d + ' ' + (a.sub || '') + ' :: ' + a.evidence);
    if (r.base === 'leadfeast') byClassLead[c].push(r.seed);
    else byClassBelong[c].push(r.seed);
    if (c === 'unexplained') unexplained++;
  }
}

console.log('# sim-dissolvetax — taxonomy table\n');
console.log('runs: ' + rows.length + ' | realm losses: ' + totalLosses + ' | unexplained: ' + unexplained + ' | instrumentErrors: ' + instrumentErrors + '\n');
console.log('| class | all | leadfeast | belongfeast |');
console.log('|---|---|---|---|');
for (const c of classes) {
  console.log('| ' + c + ' | ' + byClass[c].length + ' | ' + byClassLead[c].join(',') + ' | ' + byClassBelong[c].join(',') + ' |');
}
console.log('\n## per-loss evidence\n');
for (const c of classes) {
  if (!byClass[c].length) continue;
  console.log('### ' + c + ' (' + byClass[c].length + ')');
  for (const e of byClass[c]) console.log('- ' + e);
  console.log('');
}

// Wall numbers (secondary metric, report-don't-judge).
let nat = 0, ever = 0, tab = 0, won = 0, w4 = 0, w5 = 0, ex = 0, surv = [];
for (const r of rows) {
  nat += r.national; ever += r.everNational; tab += r.table; won += r.won; ex += r.exiled;
  if (r.wave4) w4++; if (r.wave5) w5++;
  surv.push(r.gameDays);
}
surv.sort((a, b) => a - b);
const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
console.log('## wall numbers (n=' + rows.length + ')');
console.log('national end-state ' + nat + '/' + rows.length + ' | ever ' + ever + '/' + rows.length +
  ' | table ' + tab + ' | won ' + won + ' | wave4 ' + w4 + ' | wave5 ' + w5 + ' | exiled ' + ex +
  ' | median survival ' + med + 'd | max ' + Math.max.apply(null, surv) + 'd');
