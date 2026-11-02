#!/usr/bin/env node
// test-heraldcontact-a.js — CORPUS VALIDATOR for sim-heraldcontact-a.
// Reproduces the verdict from the corpus alone (no game load):
// per-seed classification, reason split, wall numbers, transcript
// presence, and the pre-registered DIAG-GO bars (a)–(e, minus the
// src/js purity check, which is a git check at report time).
// Exit 0 on DIAG-GO, exit 2 on NO-GO, exit 1 on corpus errors.
// Usage: node scripts/test-heraldcontact-a.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const { classify } = require('./heraldcontact-classify');

const dir = process.argv[2];
if (!dir) { console.error('usage: test-heraldcontact-a.js <corpus-dir>'); process.exit(1); }
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('VALIDATOR STOP: no corpus files in ' + dir); process.exit(1); }

const rows = [];
for (const f of files) {
  const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const c = classify(rec);
  const deaths = {};
  for (const d of (rec.deaths || [])) { const k = (d && (d.cause || d.kind)) || 'unknown'; deaths[k] = (deaths[k] || 0) + 1; }
  rows.push({ seed: rec.seed, code: c.code, why: c.why,
    attempts: rec.attemptCount || 0,
    firstAttempt: rec.firstAttempt || null,
    firstReadiness: rec.firstReadiness || null,
    milestones: rec.milestones || {},
    national: rec.national || 0, table: rec.table || 0, won: rec.won || 0,
    wave4: rec.wave4 || 0, wave5: rec.wave5 || 0,
    gameDays: rec.gameDays || 0, endReason: rec.endReason || null,
    heraldLineCount: (rec.heraldLines || []).length,
    instrumentErrors: (rec.instrumentErrors || []).length,
    interceptorErrors: (rec.interceptorErrors || []).length,
    deaths: deaths });
}
rows.sort((a, b) => a.seed - b.seed);

const split = {};
for (const r of rows) split[r.code] = (split[r.code] || 0) + 1;
const nonAtt = rows.filter(r => r.code !== 'ATTEMPTED');
const unclassified = rows.filter(r => r.code === 'UNCLASSIFIED').length;
const top = Object.entries(split).filter(([k]) => k !== 'ATTEMPTED').sort((a, b) => b[1] - a[1])[0] || [null, 0];
const domShare = nonAtt.length ? top[1] / nonAtt.length : 0;
const days = rows.map(r => r.gameDays).sort((a, b) => a - b);
const median = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
const nat = rows.filter(r => r.national).length, tab = rows.filter(r => r.table).length,
  won = rows.filter(r => r.won).length, w4 = rows.filter(r => r.wave4).length,
  w5 = rows.filter(r => r.wave5).length, att = rows.filter(r => r.code === 'ATTEMPTED').length;
const errSeeds = rows.filter(r => r.instrumentErrors + r.interceptorErrors > 0).map(r => r.seed);

console.log('seeds=' + rows.map(r => r.seed).join(','));
for (const r of rows) {
  console.log(`s${r.seed} ${r.code} att=${r.attempts} firstAtt=${r.firstAttempt ? r.firstAttempt.day + '/' + r.firstAttempt.cls : 'none'} firstReady=${r.firstReadiness ? r.firstReadiness.day + '/total' + r.firstReadiness.total + '/ready' + r.firstReadiness.ready : 'none'} wave4day=${r.milestones.wave4Day} regionalDay=${r.milestones.regionalDay} omenStart=${r.milestones.omenStartDay} stage2=${r.milestones.omenStage2Day} present=${r.milestones.firstPresentDay}..${r.milestones.lastPresentDay} nat=${r.national} table=${r.table} won=${r.won} w4=${r.wave4} w5=${r.wave5} days=${r.gameDays} end=${r.endReason} heraldLines=${r.heraldLineCount} errs=${r.instrumentErrors}+${r.interceptorErrors}`);
}
console.log('split=' + JSON.stringify(split));
console.log(`wall: n=${rows.length} national=${nat} table=${tab} won=${won} wave4=${w4} wave5=${w5} attempted=${att} median=${median} max=${days[days.length - 1]} errSeeds=${errSeeds.join(',') || 'none'}`);
console.log(`bar(a) coverage: classified=${rows.length - unclassified}/${rows.length} unclassified=${unclassified} -> ${rows.length - unclassified >= 7 && unclassified <= 1 ? 'PASS' : 'FAIL'}`);
console.log(`bar(b) split: nonAttempters=${nonAtt.length} dominant=${top[0]} ${top[1]} (${(domShare * 100).toFixed(0)}%) -> ${domShare >= 0.5 || nonAtt.length === 0 ? 'PASS(dominant)' : 'PASS(split-table)'}`);
console.log('bar(c) proof: this validator ran + unit proof is a separate script (both must be green)');
console.log('bar(d) purity: git check at report time (zero src/js changes required)');
console.log(`bar(e) walls: per-seed table above -> ${rows.length === 8 ? 'PASS' : 'FAIL'}`);

const aPass = (rows.length - unclassified) >= 7 && unclassified <= 1;
const ePass = rows.length === 8;
if (aPass && ePass) { console.log('VERDICT: DIAG-GO'); process.exit(0); }
console.log('VERDICT: NO-GO');
process.exit(2);
