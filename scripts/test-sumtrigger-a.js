#!/usr/bin/env node
// test-sumtrigger-a.js — validator reproducing the sim-sumtrigger-a
// verdict from the per-seed corpus alone (no game load, no re-sim).
// Prereg: evidence/2026-11-02/sim-sumtrigger-a-prereg.md.
// GO (pilot, all must hold): trigger defined >= 6/8; sounded yield
// (allies + Haven) >= 10 on EVERY sounded seed; projectedAllies ==
// soundedAllies on every sounded seed; fight outcome + muster
// casualties recorded for every sounded call; guardrails hold on
// every sounded seed (link count unchanged, responders verified,
// instrument + muster errs 0, projection errors 0); median
// gameDays >= baseline median (quotatrigger corpus, recomputed
// here, expected 108). Exit 0 iff GO, 1 otherwise; always prints
// the full per-seed table so a FAIL is inspectable.
// Usage: node scripts/test-sumtrigger-a.js <prefix>
//   corpus dir: evidence/2026-11-02/perseed-sumtrigger-a/<prefix>-s<seed>.json
//   baseline dir: evidence/2026-11-01/perseed-quotatrigger-a/pilot-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-sumtrigger-a');
const BASE = path.join(REPO, 'evidence', '2026-11-01', 'perseed-quotatrigger-a');
const prefix = process.argv[2];
if (!prefix) { console.error('usage: test-sumtrigger-a.js <prefix>'); process.exit(2); }
const files = fs.readdirSync(DIR).filter(f => f.startsWith(prefix + '-s') && f.endsWith('.json')).sort();
if (!files.length) { console.error('NO CORPUS for prefix ' + prefix); process.exit(2); }
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
rows.sort((a, b) => a.seed - b.seed);
let fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
// Baseline median from the quotatrigger corpus (identical seeds).
let baseMedian = null;
try {
  const bf = fs.readdirSync(BASE).filter(f => f.startsWith('pilot-s') && f.endsWith('.json'));
  const bd = bf.map(f => JSON.parse(fs.readFileSync(path.join(BASE, f), 'utf8')));
  baseMedian = median(bd.map(r => r.gameDays));
} catch (e) { baseMedian = null; }
console.log('seeds=' + rows.length + ' baselineMedian=' + baseMedian);

const defined = rows.filter(r => r.triggerDefined);
const deathShares = {};
let deathTotal = 0;
rows.forEach(function (r) {
  (r.deaths || []).forEach(function (d) {
    const c = (d && d.cause) || 'unknown';
    deathShares[c] = (deathShares[c] || 0) + 1;
    deathTotal++;
  });
});
rows.forEach(function (r) {
  const p = r.post || {};
  const fo = r.fightOutcome;
  const trig = r.triggerDefined
    ? ('day ' + p.day + ' proj ' + p.projectedAllies + '+' + p.projectedHaven + '=' + p.projectedTotal + ' naive ' + p.naiveTotalAtTrigger + ' actual ' + p.actualAllies + ' haven ' + p.havenAfter + ' ready ' + p.readyAfter + ' foughtSameDay ' + (fo ? fo.foughtSameDay.join(',') : null) + ' slain ' + (fo ? fo.heraldSlain : null))
    : ('UNDEFINED(' + r.triggerUndefinedReason + ') maxFaithful ' + r.maxFaithfulTotal + ' day ' + r.maxFaithfulDay + ' firstProj ' + (r.firstProjection ? (r.firstProjection.alliesProj + '+' + r.firstProjection.havenProj + '=' + r.firstProjection.total) : null));
  console.log('seed ' + r.seed + ': ' + trig + ' firstContact=' + r.firstContactDay + ' projRows=' + r.projectionCount + ' maxWave=' + r.maxWave + ' nat=' + r.national + ' table=' + r.table + ' won=' + r.won + ' days=' + r.gameDays + ' end=' + r.endReason);
  if (r.triggerDefined) {
    check('s' + r.seed + ' sounded-yield>=10', (p.actualAllies || 0) + (p.havenAfter || 0) >= 10, 'allies ' + p.actualAllies + ' haven ' + p.havenAfter);
    check('s' + r.seed + ' projected==sounded', p.projectedAllies === p.actualAllies && p.projectedHaven === p.havenAfter, 'proj ' + p.projectedAllies + '+' + p.projectedHaven + ' vs actual ' + p.actualAllies + '+' + p.havenAfter);
    check('s' + r.seed + ' ready-after-commit', p.readyAfter === true, String(p.readyAfter));
    check('s' + r.seed + ' outcome-recorded', !!fo && Array.isArray(fo.foughtSameDay) && typeof fo.heraldSlain === 'boolean' && Array.isArray(fo.responderFates) && fo.responderFates.length === (p.actualAllies || 0) && Array.isArray(fo.havenFates), fo ? ('fought ' + fo.foughtSameDay.join(',') + ' slain ' + fo.heraldSlain + ' fates ' + fo.responderFates.length + '/' + p.actualAllies + ' havenFates ' + fo.havenFates.length) : 'no fightOutcome');
    check('s' + r.seed + ' links-unchanged', p.linkCountBefore != null && p.linkCountBefore === p.linkCountAfter, p.linkCountBefore + '->' + p.linkCountAfter);
    check('s' + r.seed + ' responders-verified', p.respondersVerified === true, JSON.stringify(p.responderProblems || []));
    check('s' + r.seed + ' instruments-clean', (r.instrumentErrors || []).length === 0 && (r.musterErrs || 0) === 0 && (p.interceptorErrors || []).length === 0, 'instr=' + (r.instrumentErrors || []).length + ' muster=' + r.musterErrs + ' interceptor=' + (p.interceptorErrors || []).length);
    const projErrs = (p.projectionTrajectory || []).reduce((n, row) => n + (row.errors || []).length, 0);
    check('s' + r.seed + ' projection-errors-0', projErrs === 0, 'projErrs=' + projErrs);
    check('s' + r.seed + ' first-projection-row-present', !!r.firstProjection, 'firstProj ' + (r.firstProjection ? r.firstProjection.day : null));
    check('s' + r.seed + ' sounded-once', (r.projectionTrajectory || []).filter(row => row.ready).length >= 1, 'readyRows=' + (r.projectionTrajectory || []).filter(row => row.ready).length);
  } else {
    check('s' + r.seed + ' trigger-undefined-has-trajectory', (r.projectionTrajectory || []).length > 0 || r.triggerUndefinedReason === 'no-herald-attempt', r.triggerUndefinedReason + ' projRows=' + (r.projectionTrajectory || []).length);
  }
});
const triggerRate = rows.length ? defined.length / rows.length : 0;
check('GO trigger-rate>=6/8', defined.length >= 6, defined.length + '/' + rows.length);
const med = median(rows.map(r => r.gameDays));
check('GO median-survival>=baseline', baseMedian != null && med >= baseMedian, 'median ' + med + ' baseline ' + baseMedian);
const guardFails = fails.filter(f => /links-unchanged|responders-verified|instruments-clean|projection-errors-0/.test(f));
check('GO guardrails-all-sounded', guardFails.length === 0, guardFails.join(',') || 'all hold');
const outcomeFails = fails.filter(f => /outcome-recorded/.test(f));
check('GO outcomes-recorded-all-sounded', outcomeFails.length === 0, outcomeFails.join(',') || 'all recorded');
const yieldFails = fails.filter(f => /sounded-yield|projected==sounded|ready-after-commit/.test(f));
check('GO yield-bars-all-sounded', yieldFails.length === 0, yieldFails.join(',') || 'all hold');
// Wall summary (bands kept separate from baseline; never pooled).
const w = (fn) => rows.filter(fn).length;
console.log('WALL pilot(sum): national=' + w(r => r.national) + '/' + rows.length + ' table=' + w(r => r.table) + ' won=' + w(r => r.won) + ' wave4=' + w(r => r.maxWave >= 4) + ' wave5=' + w(r => r.maxWave >= 5) + ' medianDays=' + med + ' maxDays=' + Math.max(...rows.map(r => r.gameDays)) + ' ends=' + JSON.stringify(rows.reduce((m, r) => { m[r.endReason] = (m[r.endReason] || 0) + 1; return m; }, {})));
console.log('DEATH-CAUSES pilot(sum): total=' + deathTotal + ' ' + JSON.stringify(deathShares));
// Naive-vs-faithful divergence: seeds where naive ever hit 10 but faithful never did.
rows.forEach(function (r) {
  const naiveHit = (r.projectionTrajectory || []).some(row => row.naiveTotal >= 10);
  const faithfulHit = (r.projectionTrajectory || []).some(row => row.ready);
  if (naiveHit && !faithfulHit) console.log('DIVERGENCE seed ' + r.seed + ': naive>=10 but faithful never ready (maxFaithful ' + r.maxFaithfulTotal + ')');
});
console.log('VERDICT ' + (fails.length ? 'NO-GO' : 'GO') + ' fails=' + fails.length);
process.exit(fails.length ? 1 : 0);
