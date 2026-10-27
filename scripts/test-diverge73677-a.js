#!/usr/bin/env node
// scripts/test-diverge73677-a.js — sim-diverge73677-a proof validator
// (scale-onramp axis, 2026-10-27, arm sim-diverge73677-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Re-derives every number in evidence/2026-10-27/sim-diverge73677-a.md
// from the per-seed corpus rows under
// evidence/2026-10-27/perseed-diverge73677-a/ — it does not trust the
// evidence text, the sweep console output, or any summary file. Run:
//   node scripts/test-diverge73677-a.js
// Exit non-zero on any failed check. The binding pre-registration is
// evidence/2026-10-27/sim-diverge73677-a-prereg.md.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-27', 'perseed-diverge73677-a');
const { diffRows, summarizeRow } = require('./test-diverge73677-a-sweep');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.log(`FAIL ${label}${extra != null ? ' :: ' + extra : ''}`); }
}
function load(name) { return JSON.parse(fs.readFileSync(path.join(DIR, name), 'utf8')); }
function sha(name) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(DIR, name))).digest('hex'); }

const census = [1, 2, 3].map(r => load(`s73677-census-rep${r}.json`));
const transcript = [1, 2, 3].map(r => load(`s73677-transcript-armed-rep${r}.json`));
// Raidtrace corpus (the values this arm attempted to reproduce) lives in
// evidence/2026-10-27/perseed-raidtrace-a/ — read directly, never edited.
const raidC = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a', 's73677-armed.json'), 'utf8'));
const raidT = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a', 's73677-transcript-armed.json'), 'utf8'));

// 1. Raidtrace values as recorded (the values this arm attempted to reproduce).
ok(raidC.days === 152 && raidC.deathTotal === 41, 'raidtrace census row is 152d/41 deaths', `${raidC.days}d/${raidC.deathTotal}`);
ok(raidT.days === 168 && raidT.deathTotal === 44, 'raidtrace transcript row is 168d/44 deaths', `${raidT.days}d/${raidT.deathTotal}`);

// 2. Fresh reps on the current base: the reproduce arm's headline numbers.
for (let i = 0; i < 3; i++) {
  ok(census[i].days === 130 && census[i].deathTotal === 37 && census[i].won === 1,
    `census rep${i + 1} is 130d/37 deaths/won`, `${census[i].days}d/${census[i].deathTotal}/won=${census[i].won}`);
  ok(transcript[i].days === 130 && transcript[i].deathTotal === 37 && transcript[i].won === 1,
    `transcript rep${i + 1} is 130d/37 deaths/won`, `${transcript[i].days}d/${transcript[i].deathTotal}/won=${transcript[i].won}`);
}

// 3. Non-reproduction of the raidtrace values (the arm-1 result itself).
ok(census[0].days !== 152 || census[0].deathTotal !== 41, 'fresh census does NOT reproduce raidtrace census (152d/41)');
ok(transcript[0].days !== 168 || transcript[0].deathTotal !== 44, 'fresh transcript does NOT reproduce raidtrace transcript (168d/44)');

// 4. Within-mode determinism: byte-identical rows across reps (stronger
// than summary equality — includes fightIds, ticks, and all recorders).
for (const [label, files] of [['census', [1, 2, 3].map(r => `s73677-census-rep${r}.json`)],
  ['transcript', [1, 2, 3].map(r => `s73677-transcript-armed-rep${r}.json`)]]) {
  const hs = files.map(sha);
  ok(hs[0] === hs[1] && hs[1] === hs[2], `within-mode byte-identical rows: ${label}`, hs.join(' '));
}

// 5. Cross-mode trajectory agreement on every rep pair, with the only
// raw diff confined to fightId timestamp prefixes (w4dmg + nonworldkill
// raw-unequal, prefix-stripped-equal; every other section raw-equal).
for (let i = 0; i < 3; i++) {
  const d = diffRows(census[i], transcript[i]);
  ok(d.trajEq, `rep${i + 1} trajectory fields equal`);
  ok(d.deathsEq && d.facedEq && d.logEq && d.tsEq, `rep${i + 1} deaths/faced/kill-log/ts equal`);
  ok(d.tickDiffs.length === 0 && d.firstTickDiffDay == null, `rep${i + 1} zero tick diffs (firstTickDiffDay null)`, JSON.stringify(d.tickDiffs.slice(0, 3)));
  ok(d.wallsEq && d.wallsA.length === 3 && d.wallsB.length === 3, `rep${i + 1} walls 3 == 3 with identical details`);
  ok(d.secRaw.w4dmg === false && d.secRaw.nonworldkill === false, `rep${i + 1} raw diffs confined to w4dmg + nonworldkill`);
  ok(d.secStripped.w4dmg && d.secStripped.nonworldkill && d.secStripped.wave4enc && d.secStripped.spawnsrc && d.secStripped.fieldfinish,
    `rep${i + 1} all sections equal after fightId-prefix strip`);
  const sC = summarizeRow(census[i]), sT = summarizeRow(transcript[i]);
  ok(JSON.stringify(sC) === JSON.stringify(sT), `rep${i + 1} summaries identical`, JSON.stringify(sC));
}

// 6. The fightId timestamp signature itself: same random suffix, larger
// timestamp prefix in transcript mode (emit's Date.now() consumption).
{
  const fa = census[0].w4dmg.tbEnds[0].fightId, fb = transcript[0].w4dmg.tbEnds[0].fightId;
  const sufA = fa.split('_')[1], sufB = fb.split('_')[1];
  const tsA = parseInt(fa.slice(1).split('_')[0], 36), tsB = parseInt(fb.slice(1).split('_')[0], 36);
  ok(sufA === sufB, 'first tbEnd fightId random suffix identical across modes', `${fa} vs ${fb}`);
  ok(tsB > tsA, 'first tbEnd fightId timestamp prefix larger in transcript mode (clock consumed by emits)', `${fa} vs ${fb}`);
}

// 7. Prereg + evidence files exist (the run's paper trail, not its numbers).
for (const f of ['sim-diverge73677-a-prereg.md', 'sim-diverge73677-a.md']) {
  ok(fs.existsSync(path.join(REPO, 'evidence', '2026-10-27', f)), `evidence file present: ${f}`);
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
