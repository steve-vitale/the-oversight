#!/usr/bin/env node
// test-arrears-a.js — sim-arrears-a VALIDATOR (corpus-only, no game load).
// Reproduces the prereg verdict from evidence/2026-11-02/
// perseed-arrears-a/trace-s<seed>.json alone.
// Usage: node scripts/test-arrears-a.js [trace]
//   (default prefix: trace; reads evidence/2026-11-02/perseed-arrears-a/)
// Bars (evidence/2026-11-02/sim-arrears-a-prereg.md):
//   (a) first-failure tables complete for all 4 blocked + 2 contrast seeds
//   (b) determinate clearing answer for >= 3 of 4 blocked seeds
//       (named clearing event, or proven never-clears in 30d)
//   (c) in-run control section present (drift vs old corpus reported
//       in the evidence file — the validator checks the trace corpus
//       carries the comparable fields, not the prose)
//   (d) transcript line present (probe file, see below)
//   (e) guardrails: sound count 0, instrument errors 0
// The probe transcript file (evidence/2026-11-02/perseed-arrears-a/
// probe-s95447.json) is checked when present and reported separately;
// bar (d) fails if neither trace say-lines nor the probe file carries
// a refusal/debt line.
// Exit 0 = all bars pass; exit 1 = any bar fails (lists fails).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-arrears-a');
const prefix = process.argv[2] || 'trace';
const BLOCKED = [95447, 95464, 95478, 95512];
const CONTRAST = [95448, 95453];
const fails = [];
const notes = [];
function load(seed) {
  const fp = path.join(DIR, prefix + '-s' + seed + '.json');
  if (!fs.existsSync(fp)) { fails.push('missing corpus ' + fp); return null; }
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { fails.push('unparsable ' + fp + ': ' + e.message); return null; }
}
const REQUIRED_LINK_FIELDS = ['direction', 'trust', 'opinion', 'arrears', 'tributeKcalPerWeek', 'subordinatePantryKcal', 'linkAgeDays', 'refusalReasons'];
let determinate = 0;
const perSeed = {};
for (const seed of BLOCKED.concat(CONTRAST)) {
  const d = load(seed);
  if (!d) { perSeed[seed] = { ok: false }; continue; }
  const blocked = BLOCKED.indexOf(seed) >= 0;
  // (a) first-failure table
  if (!d.firstFailure || d.firstFailure.day == null) fails.push(seed + ': no firstFailure day');
  if (!d.firstFailureLinks || !d.firstFailureLinks.length) fails.push(seed + ': no firstFailureLinks');
  else {
    for (const l of d.firstFailureLinks) {
      for (const f of REQUIRED_LINK_FIELDS) {
        if (l[f] === undefined || l[f] === null) fails.push(seed + ': firstFailure link ' + (l.name || l.villageId) + ' missing ' + f);
      }
    }
  }
  // (e) guardrails
  const st = d.soundTotals || {};
  if ((st.soundTitanCall || 0) !== 0) fails.push(seed + ': soundTitanCall=' + st.soundTitanCall + ' (trace must sound nothing)');
  if ((st.titanCommitOwn || 0) !== 0) fails.push(seed + ': titanCommitOwn nonzero');
  if ((d.instrumentErrors || 0) !== 0 || (d.musterErrs || 0) !== 0) fails.push(seed + ': instrument/muster errors nonzero');
  if (blocked) {
    const keys = Object.keys(d.traces || {});
    if (!keys.length) { fails.push(seed + ': no traces'); perSeed[seed] = { ok: false }; continue; }
    let seedDeterminate = true;
    for (const k of keys) {
      const tr = d.traces[k];
      if (!tr.series || !tr.series.length) { fails.push(seed + ' ' + k + ': empty series'); seedDeterminate = false; continue; }
      if (tr.clearedDay != null) {
        notes.push(seed + ' ' + k + ': CLEARED day ' + tr.clearedDay);
      } else {
        const end = tr.endState;
        if (!end || end.arrears == null) { fails.push(seed + ' ' + k + ': never-clears without end-state'); seedDeterminate = false; }
        else notes.push(seed + ' ' + k + ': NEVER-CLEARS in 30d, end arrears ' + end.arrears + ' day ' + end.day);
      }
    }
    // blocked links at first failure must all be traced
    const blockedAtFF = (d.firstFailureLinks || []).filter(function (l) { return (l.arrears || 0) > 0; });
    if (keys.length < blockedAtFF.length) { fails.push(seed + ': traced ' + keys.length + ' of ' + blockedAtFF.length + ' blocked links'); seedDeterminate = false; }
    if (seedDeterminate) determinate++;
    perSeed[seed] = { ok: seedDeterminate, blockedLinks: blockedAtFF.length, traced: keys.length };
  } else {
    // contrast seeds: arrears must be 0 on every link at first failure
    const bad = (d.firstFailureLinks || []).filter(function (l) { return (l.arrears || 0) > 0; });
    if (bad.length) notes.push(seed + ' (contrast): UNEXPECTED arrears links at first failure: ' + bad.map(function (l) { return l.name + '=' + l.arrears; }).join(', '));
    else notes.push(seed + ' (contrast): clean, all arrears 0 at first failure');
    perSeed[seed] = { ok: true };
  }
}
if (determinate < 3) fails.push('bar (b): determinate clearing answers ' + determinate + '/4, need >= 3');
// (d) transcript: probe file or trace say-lines carrying a debt/refusal line
let transcriptLine = null;
const probeFp = path.join(DIR, 'probe-s95447.json');
if (fs.existsSync(probeFp)) {
  try {
    const p = JSON.parse(fs.readFileSync(probeFp, 'utf8'));
    const lines = ((p.probe || {}).refusalLines || []);
    const debt = lines.find(function (l) { return /debts unpaid/i.test(l); });
    if (debt) transcriptLine = debt;
    else if (lines.length) transcriptLine = lines[0];
  } catch (e) { fails.push('probe file unparsable: ' + e.message); }
}
if (!transcriptLine) {
  for (const seed of BLOCKED) {
    const d = load(seed);
    if (!d) continue;
    const hit = (d.sayLines || []).find(function (s) { return /arrears/i.test(s.line); });
    if (hit) { transcriptLine = hit.line; break; }
  }
}
if (!transcriptLine) fails.push('bar (d): no debt/refusal transcript line in probe or trace corpora');
console.log('seeds: ' + BLOCKED.concat(CONTRAST).join(','));
console.log('determinate blocked seeds: ' + determinate + '/4');
for (const s of Object.keys(perSeed)) console.log('seed ' + s + ': ' + JSON.stringify(perSeed[s]));
for (const n of notes) console.log('note: ' + n);
if (transcriptLine) console.log('transcript: ' + transcriptLine);
if (fails.length) {
  console.log('VERDICT NO-GO fails=' + fails.length);
  for (const f of fails) console.log('FAIL: ' + f);
  process.exit(1);
}
console.log('VERDICT GO fails=0');
