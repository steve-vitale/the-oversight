#!/usr/bin/env node
// test-arrearsscreen-a.js — corpus-only validator for sim-arrearsscreen-a.
// Recomputes the screen verdict from evidence/2026-11-02/
// perseed-arrearsscreen-a/screen-s*.json alone (no game load).
// Exit 0 = GO bars (a)(b)(d-corpus) pass AND waiting leg powered
// (>= 3 blocked with complete trajectories). Exit 2 = sweep/class
// bars pass but < 3 blocked (UNDER-POWERED for waiting — the screen
// yield itself is the verdict, not a failure). Exit 1 = NO-GO
// (bar (a) or (b) miss, or corpus incomplete/inconsistent).
// Usage: node scripts/test-arrearsscreen-a.js [corpusdir]
'use strict';
const fs = require('fs');
const path = require('path');
const CLS = require(path.join(__dirname, 'arrearsscreen-classify-20261102'));
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-02', 'perseed-arrearsscreen-a');
const EXPECTED = [];
for (let s = 97301; s <= 97324; s++) EXPECTED.push(s);

const fails = [];
const notes = [];
let rows = 0, blocked = 0, blockedFirstCheck = 0;
const classes = {};
const blockedSeeds = [];
const walls = { national: 0, table: 0, won: 0, wave4: 0, wave5: 0, gameDays: [] };
const endReasons = {};

for (const seed of EXPECTED) {
  const f = path.join(DIR, 'screen-s' + seed + '.json');
  if (!fs.existsSync(f)) { notes.push('missing corpus s' + seed); continue; }
  let c = null;
  try { c = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { fails.push('s' + seed + ': unparsable corpus'); continue; }
  rows++;
  // Seed class recomputed from rows, cross-checked against replay's.
  const recomputed = CLS.classifySeed(c.checkRows || [], c.skippedRows || [], c.heraldAttemptCount || 0);
  if (recomputed !== c.seedClass) fails.push('s' + seed + ': seedClass replay=' + c.seedClass + ' recomputed=' + recomputed);
  classes[c.seedClass] = (classes[c.seedClass] || 0) + 1;
  // Wall fields present on every seed.
  for (const k of ['national', 'table', 'won', 'wave4', 'wave5', 'gameDays', 'endReason', 'maxWave']) {
    if (c[k] == null) fails.push('s' + seed + ': wall field ' + k + ' missing');
  }
  if (typeof c.gameDays === 'number') walls.gameDays.push(c.gameDays);
  if (c.national) walls.national++;
  if (c.table) walls.table++;
  if (c.won) walls.won++;
  if (c.wave4) walls.wave4++;
  if (c.wave5) walls.wave5++;
  if (c.endReason) endReasons[c.endReason] = (endReasons[c.endReason] || 0) + 1;
  // Guardrails: never sounded (screen sounds nothing by construction —
  // the corpus must carry no sound marker), instrument errors 0.
  if ((c.instrumentErrors || []).length) fails.push('s' + seed + ': instrumentErrors ' + c.instrumentErrors.length);
  if ((c.musterErrs || 0) !== 0) fails.push('s' + seed + ': musterErrs ' + c.musterErrs);
  if (c.sounded || c.post) fails.push('s' + seed + ': unexpected sound payload in screen corpus');
  if (c.seedClass === 'arrears-blocked') {
    blocked++;
    blockedSeeds.push(seed);
    // (b) every blocked seed: first-block day + blocked links with numbers.
    const fb = CLS.firstBlockRow(c.checkRows || []);
    if (!fb) fails.push('s' + seed + ': class arrears-blocked but no blocked row recomputed');
    else {
      if (c.firstBlockDay !== fb.row.day) fails.push('s' + seed + ': firstBlockDay ' + c.firstBlockDay + ' != recomputed ' + fb.row.day);
      if (!(c.blockedLinks || []).length) fails.push('s' + seed + ': no blockedLinks');
      (c.blockedLinks || []).forEach(function (b) {
        if (!b.direction) fails.push('s' + seed + ': blocked link ' + b.villageId + ' missing direction');
        if (!(b.arrears > 0)) fails.push('s' + seed + ': blocked link ' + b.villageId + ' arrears not > 0');
        if (b.trust == null || b.opinion == null) fails.push('s' + seed + ': blocked link ' + b.villageId + ' missing trust/opinion');
      });
      if (c.checkRows && c.checkRows.length && CLS.classifyCheck(c.checkRows[0]).blocked) blockedFirstCheck++;
      // Waiting trajectory complete for every blocked link.
      (c.blockedLinks || []).forEach(function (b) {
        const series = (c.waitingSeries || {})[b.villageId];
        const sum = (c.waitingSummary || {})[b.villageId];
        if (!series || !sum) { fails.push('s' + seed + ': waiting trajectory missing for ' + b.villageId); return; }
        if (series[0] == null || series[0].day !== c.firstBlockDay) fails.push('s' + seed + ': waiting series for ' + b.villageId + ' does not start at firstBlockDay');
        if (sum.windowEnd !== Math.min(c.firstBlockDay + 30, (c.censusArrears || {}).lastCensusDay == null ? c.firstBlockDay : (c.censusArrears || {}).lastCensusDay)) fails.push('s' + seed + ': waiting window end mismatch for ' + b.villageId);
        if (sum.firstArrears !== b.arrears) fails.push('s' + seed + ': waiting firstArrears ' + sum.firstArrears + ' != block arrears ' + b.arrears + ' for ' + b.villageId);
        if (typeof sum.anyDecrease !== 'boolean' || typeof sum.clears !== 'boolean') fails.push('s' + seed + ': waiting summary flags missing for ' + b.villageId);
      });
    }
  } else {
    if ((c.blockedLinks || []).length) fails.push('s' + seed + ': non-blocked class carries blockedLinks');
  }
  // Non-blocked seeds must carry a named class (no silent nulls).
  if (!c.seedClass) fails.push('s' + seed + ': seedClass missing');
}

// (a) sweep complete: rows on >= 22/24.
if (rows < 22) fails.push('bar (a): rows on only ' + rows + '/24 seeds (need >= 22)');

walls.gameDays.sort((a, b) => a - b);
const median = walls.gameDays.length ? (walls.gameDays.length % 2 ? walls.gameDays[(walls.gameDays.length - 1) / 2] : (walls.gameDays[walls.gameDays.length / 2 - 1] + walls.gameDays[walls.gameDays.length / 2]) / 2) : null;

console.log('SCREEN VALIDATOR: rows=' + rows + '/24 blocked=' + blocked + ' (first-check blocked=' + blockedFirstCheck + ') classes=' + JSON.stringify(classes));
console.log('SCREEN VALIDATOR: blockedSeeds=' + JSON.stringify(blockedSeeds));
console.log('SCREEN VALIDATOR: wall national=' + walls.national + '/' + rows + ' table=' + walls.table + '/' + rows + ' won=' + walls.won + '/' + rows + ' wave4=' + walls.wave4 + '/' + rows + ' wave5=' + walls.wave5 + '/' + rows + ' median=' + median + ' max=' + (walls.gameDays.length ? walls.gameDays[walls.gameDays.length - 1] : null) + ' ends=' + JSON.stringify(endReasons));
if (notes.length) console.log('SCREEN VALIDATOR notes: ' + notes.join('; '));
if (fails.length) {
  console.log('SCREEN VALIDATOR: NO-GO (' + fails.length + ' fails)');
  fails.forEach(function (f) { console.log('  FAIL: ' + f); });
  process.exit(1);
}
if (blocked < 3) {
  console.log('SCREEN VALIDATOR: UNDER-POWERED for waiting (blocked ' + blocked + ' < 3) — bars (a)(b) pass, bar (c) VACUOUS, yield is the verdict');
  process.exit(2);
}
console.log('SCREEN VALIDATOR: GO (bars (a)(b)(c) pass)');
process.exit(0);
