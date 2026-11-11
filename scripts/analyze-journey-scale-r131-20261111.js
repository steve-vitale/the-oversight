#!/usr/bin/env node
// analyze-journey-scale-r131-20261111.js — journey-scale r131 analyzer
// (lane A, leg 3 SCALE). Reads the r131 panel corpora and judges the
// prereg's binding questions from files, not from log memory:
//
//   Q2 PANEL VETBAR: zero days where readiness veterans != ladder
//     veterans (per wave 4 and wave 5) on the fixed engine; shadow
//     old-rule counts reported per seed (phantom-days = shadow > fixed).
//   Q3 TRAJECTORY SHAPE: lived-days total within +/-25% of the r130
//     band's 473; no alive/dead flip without an attributed cause;
//     lesser seat priced >=3/4.
//   Q5 CENSUS: per-seed rollup (ladder stage, lesser/full seat, national,
//     deaths by cause, books close).
//
// Usage: node scripts/analyze-journey-scale-r131-20261111.js [EVIDIR]
//   EVIDIR defaults to evidence/2026-11-11/journey-scale-r131.
// Exit 0 = Q2 GO (zero disagreements); exit 1 = Q2 NO-GO (any
// disagreement on the fixed engine) or a missing/corrupt corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'evidence', '2026-11-11', 'journey-scale-r131');
const SEEDS = [131101, 131102, 131103, 131104];
const R130_LIVED_DAYS = 473; // r130 band total (140+97+95+141), prereg Q3 control
let fail = 0;
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log('MISSING/CORRUPT: ' + p + ' — ' + (e && e.message)); fail = 1; return null; }
}
let livedTotal = 0;
const rows = [];
for (const seed of SEEDS) {
  const vb = readJson(path.join(EVIDIR, `journey-scale-r131-vetbar-${seed}.json`));
  const tr = readJson(path.join(EVIDIR, `journey-scale-r131-trust-${seed}.json`));
  if (!vb || !tr) { rows.push({ seed, error: true }); continue; }
  const daily = vb.daily || [];
  const disagree4 = daily.filter(r => r.r4 !== r.l3);
  const disagree5 = daily.filter(r => r.r5 !== r.l4);
  const ph4 = daily.filter(r => (r.shadow4 | 0) > (r.r4 | 0));
  const ph5 = daily.filter(r => (r.shadow5 | 0) > (r.r5 | 0));
  const maxR4 = daily.reduce((m, r) => Math.max(m, (r.r4 | 0)), 0);
  const maxL3 = daily.reduce((m, r) => Math.max(m, (r.l3 | 0)), 0);
  const maxR5 = daily.reduce((m, r) => Math.max(m, (r.r5 | 0)), 0);
  const maxL4 = daily.reduce((m, r) => Math.max(m, (r.l4 | 0)), 0);
  const bloodedDays = daily.filter(r => r.blooded).length;
  const c = tr.census || {};
  const lc = c.ladderChain || {};
  const dc = c.deathCensus || {};
  livedTotal += (c.day | 0);
  rows.push({
    seed, days: c.day, over: !!c.over, won: !!c.won, pop: (c.popAlive | 0) + '/' + (c.popTotal | 0),
    vetbarRows: daily.length, disagree4: disagree4.length, disagree5: disagree5.length,
    phantomDays4: ph4.map(r => r.day), phantomDays5: ph5.map(r => r.day),
    maxR4, maxL3, maxR5, maxL4, bloodedDays,
    peakStage: lc.peakStage, stage3Day: lc.stage3Day, lesserDay: lc.seatLesserDay, fullDay: lc.seatFullDay,
    capstoneReady: lc.capstoneReady, capstoneDelivered: lc.capstoneDelivered,
    fights: lc.fights, fightsByWave: lc.fightsByWave,
    deaths: dc.deaths, byCause: dc.byCause, booksClose: !!dc.booksClose,
    unattributed: dc.unattributed, teleOnly: dc.teleOnly,
    rank: c.scaleRank,
  });
}
console.log('=== journey-scale r131 — Q2 VETBAR ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR (corpus missing)`); continue; }
  console.log(`seed ${r.seed}: vetbarRows=${r.vetbarRows} disagree4=${r.disagree4} disagree5=${r.disagree5} phantomDays4=[${r.phantomDays4.join(',')}] phantomDays5=[${r.phantomDays5.join(',')}] maxR4=${r.maxR4} maxL3=${r.maxL3} maxR5=${r.maxR5} maxL4=${r.maxL4} bloodedDays=${r.bloodedDays}`);
}
const totalDis = rows.reduce((m, r) => m + ((r.disagree4 | 0) + (r.disagree5 | 0)), 0);
console.log(`Q2 BAND VERDICT: ${totalDis === 0 ? 'GO' : 'NO-GO'} (total disagreements ${totalDis})`);
if (totalDis !== 0) fail = 1;
console.log('\n=== journey-scale r131 — Q3 TRAJECTORY SHAPE ===');
console.log(`lived-days total ${livedTotal} vs r130 band ${R130_LIVED_DAYS} (${(((livedTotal - R130_LIVED_DAYS) / R130_LIVED_DAYS) * 100).toFixed(1)}%; guardrail +/-25%)`);
const within = Math.abs(livedTotal - R130_LIVED_DAYS) / R130_LIVED_DAYS <= 0.25;
console.log(`Q3 lived-days guardrail: ${within ? 'HOLD' : 'BREACH'}`);
const lesserCount = rows.filter(r => !r.error && r.lesserDay != null).length;
console.log(`lesser seat priced: ${lesserCount}/4 (bar >=3/4): ${lesserCount >= 3 ? 'HOLD' : 'BREACH'}`);
if (!within || lesserCount < 3) fail = 1;
console.log('\n=== journey-scale r131 — Q5 CENSUS ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR`); continue; }
  console.log(`seed ${r.seed}: days=${r.days} over=${r.over} won=${r.won} pop=${r.pop} rank=${r.rank} peakStage=${r.peakStage} stage3=${r.stage3Day == null ? '-' : 'd' + r.stage3Day} lesser=${r.lesserDay == null ? '-' : 'd' + r.lesserDay} full=${r.fullDay == null ? '-' : 'd' + r.fullDay} ready=${JSON.stringify(r.capstoneReady)} delivered=${r.capstoneDelivered ? (r.capstoneDelivered.kind + '@d' + r.capstoneDelivered.day) : '-'} fights=${r.fights} byWave=${JSON.stringify(r.fightsByWave)} deaths=${r.deaths} byCause=${JSON.stringify(r.byCause)} booksClose=${r.booksClose} unattributed=${r.unattributed} teleOnly=${r.teleOnly}`);
}
process.exit(fail ? 1 : 0);
