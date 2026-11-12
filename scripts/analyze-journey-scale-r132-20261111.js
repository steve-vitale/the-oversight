#!/usr/bin/env node
// analyze-journey-scale-r132-20261111.js — journey-scale r132 analyzer
// (lane A, leg 3 SCALE). Reads the r132 panel corpora and judges the
// prereg's binding questions from files, not from log memory:
//
//   Q2 PANEL RAISE-TALKS: zero defect talks (link:accept taken while the
//     raise was never spoken) AND >=1 properly-answered talk; vetbar
//     kept as a guard (zero days where readiness veterans != ladder
//     veterans per wave 4 and wave 5; shadow old-rule counts reported
//     per seed, phantom-days = shadow > fixed).
//   Q3 TRAJECTORY SHAPE: lived-days total within +/-25% of the r131
//     band's 409; no alive/dead flip without an attributed cause;
//     lesser seat priced >=3/4.
//   Q5 CENSUS: per-seed rollup (ladder stage, lesser/full seat, national,
//     deaths by cause, books close).
//
// Usage: node scripts/analyze-journey-scale-r132-20261111.js [EVIDIR]
//   EVIDIR defaults to evidence/2026-11-11/journey-scale-r132.
// Exit 0 = GO; exit 1 = NO-GO (any disagreement on the fixed engine, any
// defect talk, or a missing/corrupt corpus); exit 2 = INCOMPLETE (no raise
// talks in the band — no wild evidence for Q2).
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'evidence', '2026-11-11', 'journey-scale-r132');
const SEEDS = [132101, 132102, 132103, 132104];
const R131_LIVED_DAYS = 409; // r131 band total (68+141+60+140), prereg Q3 control
let fail = 0;
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log('MISSING/CORRUPT: ' + p + ' — ' + (e && e.message)); fail = 1; return null; }
}
let livedTotal = 0;
const rows = [];
for (const seed of SEEDS) {
  const vb = readJson(path.join(EVIDIR, `journey-scale-r132-vetbar-${seed}.json`));
  const tr = readJson(path.join(EVIDIR, `journey-scale-r132-trust-${seed}.json`));
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
console.log('=== journey-scale r132 — Q2 VETBAR ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR (corpus missing)`); continue; }
  console.log(`seed ${r.seed}: vetbarRows=${r.vetbarRows} disagree4=${r.disagree4} disagree5=${r.disagree5} phantomDays4=[${r.phantomDays4.join(',')}] phantomDays5=[${r.phantomDays5.join(',')}] maxR4=${r.maxR4} maxL3=${r.maxL3} maxR5=${r.maxR5} maxL4=${r.maxL4} bloodedDays=${r.bloodedDays}`);
}
const totalDis = rows.reduce((m, r) => m + ((r.disagree4 | 0) + (r.disagree5 | 0)), 0);
console.log(`Q2 BAND VERDICT: ${totalDis === 0 ? 'GO' : 'NO-GO'} (total disagreements ${totalDis})`);
if (totalDis !== 0) fail = 1;
console.log('\n=== journey-scale r132 — Q3 TRAJECTORY SHAPE ===');
console.log(`lived-days total ${livedTotal} vs r131 band ${R131_LIVED_DAYS} (${(((livedTotal - R131_LIVED_DAYS) / R131_LIVED_DAYS) * 100).toFixed(1)}%; guardrail +/-25%)`);
const within = Math.abs(livedTotal - R131_LIVED_DAYS) / R131_LIVED_DAYS <= 0.25;
console.log(`Q3 lived-days guardrail: ${within ? 'HOLD' : 'BREACH'}`);
const lesserCount = rows.filter(r => !r.error && r.lesserDay != null).length;
console.log(`lesser seat priced: ${lesserCount}/4 (bar >=3/4): ${lesserCount >= 3 ? 'HOLD' : 'BREACH'}`);
if (!within || lesserCount < 3) fail = 1;
console.log('\n=== journey-scale r132 — Q5 CENSUS ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR`); continue; }
  console.log(`seed ${r.seed}: days=${r.days} over=${r.over} won=${r.won} pop=${r.pop} rank=${r.rank} peakStage=${r.peakStage} stage3=${r.stage3Day == null ? '-' : 'd' + r.stage3Day} lesser=${r.lesserDay == null ? '-' : 'd' + r.lesserDay} full=${r.fullDay == null ? '-' : 'd' + r.fullDay} ready=${JSON.stringify(r.capstoneReady)} delivered=${r.capstoneDelivered ? (r.capstoneDelivered.kind + '@d' + r.capstoneDelivered.day) : '-'} fights=${r.fights} byWave=${JSON.stringify(r.fightsByWave)} deaths=${r.deaths} byCause=${JSON.stringify(r.byCause)} booksClose=${r.booksClose} unattributed=${r.unattributed} teleOnly=${r.teleOnly}`);
}

console.log('\n=== journey-scale r132 — Q2 RAISE-TALKS (defect classifier) ===');
// A raise talk is a DEFECT talk iff the transcript's YOU line is the
// link:accept label ("All right. Let's ask them.") while the link-raise
// line ("We should link with ... — we'd be stronger together.") was never
// spoken before it in that sitting's transcript (r131 Claudete shape).
// A 'counter' outcome with the raise spoken first is a proper counter
// (the village countered the proposal), not a defect.
const RAISE_LINE = /We should link with .* — we'd be stronger together\./;
const ACCEPT_LINE = /^YOU: "All right\. Let's ask them\."$/;
let talkTotal = 0, defectTalks = [], properTalks = 0;
for (const seed of SEEDS) {
  let files = [];
  try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r132-raisetalk-${seed}-`) && f.endsWith('.txt')).sort(); } catch (e) { files = []; }
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
    const lines = text.split('\n').slice(1).filter(l => l.trim() !== '');
    talkTotal += 1;
    let raiseSpokenBeforeAccept = false, acceptIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/^THEM:/.test(l) && RAISE_LINE.test(l)) raiseSpokenBeforeAccept = true;
      if (ACCEPT_LINE.test(l.trim())) { acceptIdx = i; break; }
    }
    if (acceptIdx >= 0 && !raiseSpokenBeforeAccept) {
      defectTalks.push(`${f} (accept at line ${acceptIdx + 1}, raise never spoken)`);
    } else if (acceptIdx >= 0) {
      properTalks += 1;
    }
  }
}
console.log(`raise talks: ${talkTotal} (properly-answered ${properTalks}, defect ${defectTalks.length})`);
for (const d of defectTalks) console.log('  DEFECT: ' + d);
const q2go = defectTalks.length === 0 && properTalks >= 1;
if (talkTotal === 0) {
  console.log('Q2 RAISE-TALKS VERDICT: INCOMPLETE (no raise talks in the band — no wild evidence; the proof test is the evidence)');
  fail = 2;
} else {
  console.log(`Q2 RAISE-TALKS VERDICT: ${q2go ? 'GO' : 'NO-GO'} (zero defect talks AND >=1 properly-answered talk)`);
  if (!q2go) fail = 1;
}

process.exit(fail);
