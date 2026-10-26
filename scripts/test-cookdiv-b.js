#!/usr/bin/env node
// test-cookdiv-b.js — proof test for rule Y (cook-diversity rotation).
// (sim-cookdiv-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// T1 (fixtures, runs BEFORE any sweep): parser checks, voiceless-run
// computation, distinct-cook computation, and the rule-Y logic mirror
// (yieldSim — a mirror of the game.js R branch + ROTATE, NOT the game
// code itself; the corpus assertions in T2 test the real code).
// T2 (corpus, runs AFTER the sweep): neutrality FIRST (R-vs-Y numerics
// identical, say unchanged, worked == resolutions), then the GO bars
// from the pre-registered header. No classified number is judged if
// neutrality fails: the test exits nonzero at the neutrality leg.
//
// Usage: node scripts/test-cookdiv-b.js [--corpus] [--confirm]
//   (no --corpus: T1 only)
'use strict';
const fs = require('fs');
const path = require('path');
const { distinctCooks, maxVoicelessRun, median, sameNums, yieldSim, analyze, goEval } = require('./analyze-cookdiv-b');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass += 1; }
  else { fail += 1; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
// Parser mirrors (same regexes as scripts/sweep-cookdiv-b.js).
function cookOf(text) {
  const m = String(text || '').match(/^🍲 (\S+) cooked for the haven/);
  if (m) return m[1];
  const m2 = String(text || '').match(/so (\S+) left the fresh pile/);
  return m2 ? m2[1] : '?';
}
function keptKcalOf(text) {
  const m = String(text || '').match(/\(([\d,]+) kcal kept/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

// ---- T1: fixtures ----
ok('T1 cookOf first name', cookOf('🍲 Miguel cooked for the haven — meals stretched.') === 'Miguel');
ok('T1 cookOf fallback', cookOf('x so Grace left the fresh pile') === 'Grace');
ok('T1 keptKcalOf', keptKcalOf('The racks are already full (17,191 kcal kept — more') === 17191);
ok('T1 keptKcalOf null', keptKcalOf('🍲 Miguel cooked for the haven — meals stretched.') === null);
ok('T1 distinct 2 cooks', (() => {
  const d = distinctCooks([{ cook: 'Miguel' }, { cook: 'Miguel' }, { cook: 'Grace' }]);
  return d.count === 2 && d.shares.Miguel === 2 && d.shares.Grace === 1;
})());
ok('T1 distinct 1 cook', distinctCooks([{ cook: 'Miguel' }, { cook: 'Miguel' }]).count === 1);
ok('T1 voiceless 6 boundary', maxVoicelessRun([1, 2, 3, 4, 5, 6, 7, 8], [1, 8]) === 6);
ok('T1 voiceless 7 over', maxVoicelessRun([1, 2, 3, 4, 5, 6, 7, 8], [1]) === 7);
ok('T1 voiceless empty', maxVoicelessRun([], []) === 0);
ok('T1 voiceless gaps do not break run', maxVoicelessRun([1, 5, 9, 13], [1]) === 3);
ok('T1 median odd', median([31, 100, 90]) === 90);
ok('T1 median even', median([31, 100]) === 65.5);
ok('T1 sameNums identical', sameNums(
  { daysAlive: 100, preserveVillagerBatches: 5, preserveVillagerResolutions: 3, deaths: 1, rank: 'national', national: true, table: false, win: false, waveReach: [1, 2] },
  { daysAlive: 100, preserveVillagerBatches: 5, preserveVillagerResolutions: 3, deaths: 1, rank: 'national', national: true, table: false, win: false, waveReach: [1, 2] }) === null);
ok('T1 sameNums delta named', sameNums(
  { daysAlive: 100, preserveVillagerBatches: 5, preserveVillagerResolutions: 3, deaths: 1, rank: 'national', national: true, table: false, win: false, waveReach: [1, 2] },
  { daysAlive: 90, preserveVillagerBatches: 5, preserveVillagerResolutions: 3, deaths: 1, rank: 'national', national: true, table: false, win: false, waveReach: [1, 2] }) === 'daysAlive');
// Yield mirror: two cooks alternating, figure changes every day — the
// second cook must get voices (distinct 2), never just the first.
ok('T1 yield alternates on change days', (() => {
  const days = [];
  for (let d = 1; d <= 6; d++) days.push({ day: d, cooks: ['miguel', 'grace'], fig: 1000 + d });
  const r = yieldSim(days);
  const cooks = new Set(r.voices.map(v => v.cook));
  return cooks.size === 2 && r.voices.length === 6;
})());
// Yield mirror: single cook, frozen figure — voice must return by the
// reminder threshold; max voiceless run never exceeds 6.
ok('T1 yield single-cook frozen bounded', (() => {
  const days = [];
  for (let d = 1; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 5000 });
  const r = yieldSim(days);
  return r.maxVoiceless <= 6 && r.voices.length >= 3; // initial + reminders
})());
// Yield mirror: single cook, changing figure — the cook yields to
// nobody, so days go silent until the threshold forces a voice;
// coverage still holds (max voiceless <= 6).
ok('T1 yield single-cook changing bounded', (() => {
  const days = [];
  for (let d = 1; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 1000 + d });
  const r = yieldSim(days);
  return r.maxVoiceless <= 6;
})());
// Yield mirror: reminder always speaks even for the last speaker.
ok('T1 yield reminder speaks for last speaker', (() => {
  const days = [{ day: 1, cooks: ['miguel'], fig: 5000 }];
  for (let d = 2; d <= 8; d++) days.push({ day: d, cooks: ['miguel'], fig: 5000 });
  const r = yieldSim(days);
  return r.voices.some(v => v.day === 8 && v.cook === 'miguel');
})());
console.log(`T1: ${pass} PASS / ${fail} FAIL`);
if (fail) process.exit(2);

// ---- T2: corpus (neutrality FIRST) ----
if (!process.argv.includes('--corpus')) {
  console.log('T1 only (no --corpus).');
  process.exit(0);
}
const confirm = process.argv.includes('--confirm');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-cookdiv-b-corpus');
let rows;
try {
  rows = analyze(dir, confirm);
} catch (e) {
  console.log('FAIL: T2 corpus load — ' + e.message);
  process.exit(2);
}
const expect = confirm ? 16 : 8;
ok(`T2 ${expect} seeds present`, rows.length === expect, `got ${rows.length}`);
ok('T2 every seed has B-aux', rows.every(r => r.B !== null));
// NEUTRALITY LEG (binding order): no GO bar is evaluated if this fails.
let neutral = true;
for (const r of rows) {
  if (r.numDelta !== null) { neutral = false; console.log(`FAIL: T2 neutrality seed ${r.seed} delta ${r.numDelta}`); }
  if (r.R.say !== r.Y.say) { neutral = false; console.log(`FAIL: T2 say seed ${r.seed} R ${r.R.say} vs Y ${r.Y.say}`); }
  if (r.R.worked !== r.R.res || r.Y.worked !== r.Y.res) { neutral = false; console.log(`FAIL: T2 worked != resolutions seed ${r.seed}`); }
  if (r.R.say > 1000 || r.Y.say > 1000) { neutral = false; console.log(`FAIL: T2 say cap seed ${r.seed}`); }
}
if (neutral) { pass += 1; console.log('T2 neutrality leg: PASS (numerics identical, say unchanged, worked == resolutions, under cap)'); }
else { fail += 1; console.log('T2 neutrality leg: FAIL — no GO bar judged'); process.exit(2); }
// GO bars (only reached on a clean neutrality leg).
const ev = goEval(rows, confirm);
for (const [k, b] of Object.entries(ev.bars)) ok('T2 GO bar ' + k, b.pass, b.detail);
if (ev.perSeedCollapse.length) console.log('NOTE: per-seed voice collapse (named, not a bar): ' + ev.perSeedCollapse.join('; '));
console.log(`T2: rows ${rows.length}, band R ${ev.bandR} -> Y ${ev.bandY}, median ${ev.medR} -> ${ev.medY}d, starvation ${ev.starvR} -> ${ev.starvY}`);
console.log(`TOTAL: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
