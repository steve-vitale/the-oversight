#!/usr/bin/env node
// test-rotsucc-b.js — proof test for rule S (first-candidate-slot rotation).
// (sim-rotsucc-b, 2026-10-26, oversight-flesh-out-loop-b).
//
// T1 (fixtures, runs BEFORE any sweep): parser checks, voiceless-run
// computation, distinct-cook computation, and the rule-S logic mirror
// (slotSim — a mirror of the game.js R branch + SLOT, NOT the game
// code itself; the corpus assertions in T2 test the real code).
// T2 (corpus, runs AFTER the sweep): neutrality FIRST (R-vs-Y numerics
// identical, say unchanged, worked == resolutions), then the GO bars
// from the pre-registered header. No classified number is judged if
// neutrality fails: the test exits nonzero at the neutrality leg.
//
// Usage: node scripts/test-rotsucc-b.js [--corpus] [--confirm]
//   (no --corpus: T1 only)
'use strict';
const fs = require('fs');
const path = require('path');
const { distinctCooks, maxVoicelessRun, median, sameNums, slotSim, analyze, goEval } = require('./analyze-rotsucc-b');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass += 1; }
  else { fail += 1; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
// Parser mirrors (same regexes as scripts/sweep-rotsucc-b.js).
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
// Slot mirror: two cooks present every day, figure changes every day —
// the slot alternates holders, both cooks must get voices every day.
ok('T1 slot alternates on change days', (() => {
  const days = [];
  for (let d = 1; d <= 6; d++) days.push({ day: d, cooks: ['miguel', 'grace'], fig: 1000 + d });
  const r = slotSim(days);
  const cooks = new Set(r.voices.map(v => v.cook));
  return cooks.size === 2 && r.voices.length === 6;
})());
// Slot mirror: single cook, frozen figure — identical to R: initial +
// reminders, max voiceless run never exceeds 6.
ok('T1 slot single-cook frozen bounded', (() => {
  const days = [];
  for (let d = 1; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 5000 });
  const r = slotSim(days);
  return r.maxVoiceless <= 6 && r.voices.length >= 3; // initial + reminders
})());
// Slot mirror: single cook, changing figure — identical to R: a voice
// every day (this is where Y went silent; S must not).
ok('T1 slot single-cook changing every day', (() => {
  const days = [];
  for (let d = 1; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 1000 + d });
  const r = slotSim(days);
  return r.voices.length === 20 && r.maxVoiceless === 0;
})());
// Slot mirror: THE TRAP CASE — second cook present day 1 only, then
// absent; figure changes every day. Rotation must not stall: the
// absent holder costs one silent day, never a run (contrast Y, which
// would yield every day into the void until the reminder threshold).
ok('T1 slot absent second cook cannot stall', (() => {
  const days = [{ day: 1, cooks: ['miguel', 'grace'], fig: 1001 }];
  for (let d = 2; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 1000 + d });
  const r = slotSim(days);
  return r.maxVoiceless === 1 && r.voices.length === 10;
})());
// Slot mirror: frozen figure + absent second cook — the rescue voice
// must fire on the 7th silent day even when the holder is absent, so
// the voiceless run never exceeds 6.
ok('T1 slot frozen + absent holder rescue bounded', (() => {
  const days = [{ day: 1, cooks: ['miguel', 'grace'], fig: 5000 }];
  for (let d = 2; d <= 20; d++) days.push({ day: d, cooks: ['miguel'], fig: 5000 });
  const r = slotSim(days);
  return r.maxVoiceless <= 6;
})());
// Slot mirror: holder fixed at advance time — a candidate appended
// mid-day must not shift today's holder (miguel first, grace appended
// as a later candidate day 1; day 2 holder must be grace, not miguel).
ok('T1 slot holder fixed for the day', (() => {
  const days = [
    { day: 1, cooks: ['miguel', 'grace'], fig: 1001 },
    { day: 2, cooks: ['miguel', 'grace'], fig: 1002 },
  ];
  const r = slotSim(days);
  return r.voices.length === 2 && r.voices[1].cook === 'grace';
})());
console.log(`T1: ${pass} PASS / ${fail} FAIL`);
if (fail) process.exit(2);

// ---- T2: corpus (neutrality FIRST) ----
if (!process.argv.includes('--corpus')) {
  console.log('T1 only (no --corpus).');
  process.exit(0);
}
const confirm = process.argv.includes('--confirm');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-rotsucc-b-corpus');
let rows;
try {
  rows = analyze(dir, confirm);
} catch (e) {
  console.log('FAIL: T2 corpus load — ' + e.message);
  process.exit(2);
}
const expect = 8;
ok(`T2 ${expect} seeds present`, rows.length === expect, `got ${rows.length}`);
ok('T2 every seed has B-aux', rows.every(r => r.B !== null));
// NEUTRALITY LEG (binding order): no GO bar is evaluated if this fails.
let neutral = true;
for (const r of rows) {
  if (r.numDelta !== null) { neutral = false; console.log(`FAIL: T2 neutrality seed ${r.seed} delta ${r.numDelta}`); }
  if (r.R.say !== r.S.say) { neutral = false; console.log(`FAIL: T2 say seed ${r.seed} R ${r.R.say} vs S ${r.S.say}`); }
  if (r.R.worked !== r.R.res || r.S.worked !== r.S.res) { neutral = false; console.log(`FAIL: T2 worked != resolutions seed ${r.seed}`); }
  if (r.R.say > 1000 || r.S.say > 1000) { neutral = false; console.log(`FAIL: T2 say cap seed ${r.seed}`); }
}
if (neutral) { pass += 1; console.log('T2 neutrality leg: PASS (numerics identical, say unchanged, worked == resolutions, under cap)'); }
else { fail += 1; console.log('T2 neutrality leg: FAIL — no GO bar judged'); process.exit(2); }
// GO bars (only reached on a clean neutrality leg).
const ev = goEval(rows, confirm);
for (const [k, b] of Object.entries(ev.bars)) ok('T2 GO bar ' + k, b.pass, b.detail);
if (ev.perSeedCollapse.length) console.log('NOTE: per-seed voice collapse (named, not a bar): ' + ev.perSeedCollapse.join('; '));
console.log(`T2: rows ${rows.length}, band R ${ev.bandR} -> S ${ev.bandS}, median ${ev.medR} -> ${ev.medS}d, starvation ${ev.starvR} -> ${ev.starvS}`);
console.log(`TOTAL: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
