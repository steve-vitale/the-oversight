#!/usr/bin/env node
// test-quotatrigger-a.js — validator reproducing the sim-quotatrigger-a
// verdict from the per-seed corpus alone (no game load, no re-sim).
// Prereg: evidence/2026-11-01/sim-quotatrigger-a-prereg.md.
// GO (pilot or confirm): trigger-defined rate >= 6/8 (pilot) / 9/12
// (confirm) — implemented as fraction >= 0.75; ready-after-commit
// among trigger-defined >= 2/3; guardrails hold on every sounded seed
// (link count unchanged, responders verified, instrument + muster
// errs 0). First-contact reporting checked, not a GO bar (it is a
// reporting duty). Exit 0 iff GO, 1 otherwise; always prints the full
// per-seed table so a FAIL is inspectable.
// Usage: node scripts/test-quotatrigger-a.js <prefix> [pilot|confirm]
//   corpus dir: evidence/2026-11-01/perseed-quotatrigger-a/<prefix>-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-01', 'perseed-quotatrigger-a');
const prefix = process.argv[2];
const mode = process.argv[3] || 'pilot';
if (!prefix) { console.error('usage: test-quotatrigger-a.js <prefix> [pilot|confirm]'); process.exit(2); }
const files = fs.readdirSync(DIR).filter(f => f.startsWith(prefix + '-s') && f.endsWith('.json')).sort();
if (!files.length) { console.error('NO CORPUS for prefix ' + prefix); process.exit(2); }
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
rows.sort((a, b) => a.seed - b.seed);
let fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}
const defined = rows.filter(r => r.triggerDefined);
const ready = defined.filter(r => r.post && r.post.readyAfter === true);
console.log('mode=' + mode + ' seeds=' + rows.length + ' triggerDefined=' + defined.length + ' ready=' + ready.length);
rows.forEach(function (r) {
  const p = r.post || {};
  const trig = r.triggerDefined ? ('day ' + p.day + ' yield ' + p.actualAllies + ' haven ' + p.havenAfter + ' ready ' + p.readyAfter) : ('UNDEFINED(' + r.triggerUndefinedReason + ') firstRef day ' + (r.firstRefusal ? r.firstRefusal.day : null));
  console.log('seed ' + r.seed + ': ' + trig + ' firstContact=' + r.firstContactDay + ' refusalsPre=' + r.refusalCountPre + ' maxWave=' + r.maxWave + ' nat=' + r.national + ' table=' + r.table + ' won=' + r.won + ' days=' + r.gameDays + ' end=' + r.endReason);
  if (r.triggerDefined) {
    check('s' + r.seed + ' trigger-snapshot-all-trusted', (p.snapshotLinks || []).length >= 1 && (p.snapshotLinks || []).every(l => (l.trust || 0) >= 70 && (l.opinion || 0) >= 10 && l.quota === 6), JSON.stringify(p.snapshotLinks));
    check('s' + r.seed + ' firstRefusal-reported', !!r.firstRefusal, 'firstRefusal present');
    check('s' + r.seed + ' links-unchanged', p.linkCountBefore != null && p.linkCountBefore === p.linkCountAfter, p.linkCountBefore + '->' + p.linkCountAfter);
    check('s' + r.seed + ' responders-verified', p.respondersVerified === true, JSON.stringify(p.responderProblems || []));
    check('s' + r.seed + ' instruments-clean', (r.instrumentErrors || []).length === 0 && (r.musterErrs || 0) === 0, 'instr=' + (r.instrumentErrors || []).length + ' muster=' + r.musterErrs);
    check('s' + r.seed + ' actual>=snapshot', (p.actualAllies || 0) >= (p.snapshotCallYield || 0), 'actual ' + p.actualAllies + ' snap ' + p.snapshotCallYield);
  } else {
    check('s' + r.seed + ' trigger-undefined-has-trajectory', (r.refusalTrajectory || []).length > 0 || r.triggerUndefinedReason === 'no-herald-attempt', r.triggerUndefinedReason);
  }
});
const triggerRate = rows.length ? defined.length / rows.length : 0;
const readyRate = defined.length ? ready.length / defined.length : 0;
check('GO trigger-rate>=0.75', triggerRate >= 0.75, defined.length + '/' + rows.length);
check('GO ready-among-defined>=2/3', defined.length === 0 ? false : readyRate >= 2 / 3, ready.length + '/' + defined.length);
const guardFails = fails.filter(f => /links-unchanged|responders-verified|instruments-clean/.test(f));
check('GO guardrails-all-sounded', guardFails.length === 0, guardFails.join(',') || 'all hold');
console.log('VERDICT ' + (fails.length ? 'NO-GO' : 'GO') + ' fails=' + fails.length);
process.exit(fails.length ? 1 : 0);
