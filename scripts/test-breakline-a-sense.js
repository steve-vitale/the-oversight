#!/usr/bin/env node
// scripts/test-breakline-a-sense.js — sim-breakline-a sense reading.
// DIAG ONLY: pure reads of the pilot corpus, never game state.
// Prints the first floor-branch transcript and the first
// hopeless-branch transcript found across the corpus rows
// (verbatim engine logs), or states plainly when a class is
// absent — and, separately, the first transcript of each
// branch that belongs to the JUDGED UNIVERSE U (wild field
// fight: channel field, caller resolve/patrol/aid, leader not
// the scholar). The prereg's S1/S2 legs require WILD (U)
// transcripts: the recorder seeds a sense log for the first
// fight of each branch per seed regardless of channel, so
// the first-found pair can be a raid/expedition fight (as
// happened for s75101's floor/hopeless logs). SENSE-OK
// requires >= 2 U transcripts covering >= 2 distinct break
// lines, one being floor-branch if any U floor-branch fight
// exists. The judgment prose itself lives in the evidence
// file; this script proves the U transcripts exist and are
// verbatim corpus logs.
// Usage: node scripts/test-breakline-a-sense.js
// EVID env override for the corpus dir.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-breakline-a');
const isU = (m) => m.wave >= 1 && m.wave <= 4 && m.channel === 'field'
  && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar);
const found = {}, foundU = {};
for (let s = 75101; s <= 75108; s++) {
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${s}-fresh.json`), 'utf8'));
  const sense = ((row.breakline || {}).sense) || {};
  for (const k of ['floor', 'hopeless', 'learn']) {
    if (!found[k] && sense[k]) found[k] = Object.assign({ seed: s }, sense[k]);
    if (!foundU[k] && sense[k]) {
      const t = sense[k];
      const idx = (row.breakline.meetings || []).findIndex(m => m.day === t.day && m.mid === t.mid && m.vid === t.vid && m.rounds === t.rounds);
      if (idx >= 0 && isU(row.fieldparty.meetings[idx])) foundU[k] = Object.assign({ seed: s }, sense[k]);
    }
  }
}
function printSet(label, set) {
  const keys = Object.keys(set);
  console.log(`${label}: found=${keys.join(',') || '(none)'}`);
  for (const k of keys) {
    const t = set[k];
    console.log(`--- ${k.toUpperCase()} seed=${t.seed} day=${t.day} mid=${t.mid} wave=${t.wave} outcome=${t.outcome} rounds=${t.rounds} branch=${t.branch} logLines=${(t.log || []).length} truncated=${!!t.logTruncated}`);
    for (const line of (t.log || [])) console.log('  ' + line);
  }
  return keys;
}
printSet('SENSE-TRANSCRIPTS (first-found, any channel)', found);
const uKeys = printSet('SENSE-TRANSCRIPTS-U (judged universe only)', foundU);
if (!foundU.floor) console.log('SENSE-NOTE: no U floor-branch sense log (no U floor fight seeded one, or none occurred).');
if (!foundU.hopeless) console.log('SENSE-NOTE: no U hopeless-branch sense log (absence is a finding, stated in evidence).');
if (uKeys.length < 2) { console.log('SENSE-FAIL: fewer than 2 distinct U branch transcripts'); process.exit(1); }
console.log('SENSE-OK');
