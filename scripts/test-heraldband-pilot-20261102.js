#!/usr/bin/env node
// test-heraldband-pilot-20261102.js — proof for the sim-heraldband
// pilot band (run fleshout-20261102T2215Z, axis scale-onramp).
// Reads ONLY the committed per-seed JSON + the analyzer's
// analysis.json (no re-simulation). Asserts:
//   1. Corpus is exactly the 8 fresh band seeds, one file each.
//   2. Every per-seed row carries the actual sim tip as anchorCommit.
//   3. Analyzer invariants: problems 0, missing 0, orphan 0,
//      legs complete, titan join exactly one for the fled record.
//   4. Fight-positive yield = 1 (seed 98102 only) -> SCREEN TOO THIN.
//   5. Band summary derivation: per-seed call/class/flags and wall
//      numbers match the analysis.json wall block.
//   6. Sense facts for 98102: 12-allies line, fled outcome with
//      blades 12, 6 allies dead at fight end, player untouched.
//   7. 98107 pending class: herald still present on the last traced
//      day, so still-pending-at-cap, NOT departed-silent.
// Usage: node scripts/test-heraldband-pilot-20261102.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-02', 'perseed-heraldband-a');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
const files = fs.readdirSync(DIR).filter(f => f.startsWith('fo-') && f.endsWith('.json')).sort();
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const analysis = JSON.parse(fs.readFileSync(path.join(DIR, 'analysis.json'), 'utf8'));

check('corpus is 8 files', files.length === 8, 'got ' + files.length);
const seeds = recs.map(r => r.seed).sort((a, b) => a - b);
check('seeds are exactly 98101-98108', JSON.stringify(seeds) === JSON.stringify([98101, 98102, 98103, 98104, 98105, 98106, 98107, 98108]), seeds.join(','));
const anchors = [...new Set(recs.map(r => r.anchorCommit))];
check('single anchor across band', anchors.length === 1, anchors.join(','));
check('anchor is the prereg-commit tip (zero game-code change over base)',
  anchors[0] === '23db5b706923', anchors[0]);

check('analyzer problems = 0', analysis.totals.problems === 0, String(analysis.totals.problems));
check('analyzer missing = 0', analysis.totals.missingOutcomes === 0);
check('analyzer orphan = 0', analysis.totals.orphanOutcomes === 0);
check('analyzer leg1 complete', analysis.legs.leg1_complete === true);
check('analyzer leg2 no-false', analysis.legs.leg2_noFalse === true);
check('analyzer titan TB fights = 1', analysis.totals.titanTb === 1, String(analysis.totals.titanTb));

// Yield: seeds with >= 1 titan TB fight row joined to slain/fled.
let yieldSeeds = [];
recs.forEach(r => {
  const titanFights = (r.tbFights || []).filter(f => f.titan);
  const joined = titanFights.filter(f => f.titanOutcome &&
    (f.titanOutcome.outcome === 'slain' || f.titanOutcome.outcome === 'fled'));
  if (joined.length >= 1) yieldSeeds.push(r.seed);
});
check('fight-positive yield = 1 (98102 only)', JSON.stringify(yieldSeeds) === '[98102]', yieldSeeds.join(','));
check('verdict is SCREEN TOO THIN (problems 0, yield 1 < 2)',
  analysis.totals.problems === 0 && yieldSeeds.length >= 1 && yieldSeeds.length < 2);

// Per-seed secondary derivation.
function klass(r) {
  const ends = r.titanOutcomesEnd || [];
  if (ends.some(o => o.outcome === 'slain')) return 'slain';
  if (ends.some(o => o.outcome === 'fled')) return 'fled';
  if (r.callDay == null) return 'no-call';
  if (ends.some(o => o.outcome === 'refused')) return 'refused-only';
  const trace = r.dailyTrace || [];
  const last = trace[trace.length - 1];
  if (last && last.heraldPresent) return 'still-pending-at-cap';
  if (last && !last.heraldPresent) return 'departed-silent-or-pending';
  return 'pending-unknown';
}
const expected = { 98101: 'no-call', 98102: 'fled', 98103: 'no-call', 98104: 'no-call', 98105: 'no-call', 98106: 'no-call', 98107: 'still-pending-at-cap', 98108: 'no-call' };
recs.forEach(r => {
  check('seed ' + r.seed + ' class = ' + expected[r.seed], klass(r) === expected[r.seed], klass(r));
  check('seed ' + r.seed + ' errors = 0', (r.errors || []).length === 0, JSON.stringify(r.errors));
});
const wall = analysis.wall;
const nat = recs.filter(r => r.national).length;
const tab = recs.filter(r => r.table).length;
const won = recs.filter(r => r.won).length;
const w4 = recs.filter(r => r.wave4).length;
const w5 = recs.filter(r => r.wave5).length;
const surv = recs.map(r => r.gameDays).sort((a, b) => a - b);
const med = surv[Math.floor(surv.length / 2)];
check('wall national 0/8', nat === 0 && wall.national === 0);
check('wall table 8/8 (driver latch)', tab === 8 && wall.table === 8);
check('wall won 5/8', won === 5 && wall.won === 5);
check('wall wave4 5/8, wave5 0/8', w4 === 5 && w5 === 0 && wall.wave4 === 5 && wall.wave5 === 0);
check('wall median survival 90', med === 90 && wall.medianSurvival === 90, med + '/' + wall.medianSurvival);

// Sense facts for 98102.
const r2 = recs.find(r => r.seed === 98102);
const tf = (r2.tbFights || []).find(f => f.titan);
check('98102 titan fight day 68, routed/fled', tf && tf.day === 68 && tf.engineResult === 'routed' && tf.normalized === 'fled');
check('98102 sayLines open with 12-allies line',
  tf && tf.sayLines[0] === '🛡️ 12 allies join you on the field.', tf && tf.sayLines[0]);
check('98102 outcome detail blades = 12', tf && tf.titanOutcome && tf.titanOutcome.detail && tf.titanOutcome.detail.blades === 12);
check('98102 outcome source is end-snapshot', tf && tf.titanOutcomeSource === 'end-snapshot');
const deadAllies = (tf.fighters || []).filter(x => x.kind === 'ally' && !x.alive);
check('98102 coalition price: 6 of 12 allies dead', deadAllies.length === 6, deadAllies.map(x => x.name).join(','));
check('98102 player untouched at 100 HP',
  (tf.fighters || []).find(x => x.kind === 'player').hp === 100);
check('98102 herald alive at 44/700 (fled, not slain)',
  tf.monster.hp === 44 && tf.monster.maxHp === 700 && tf.monster.alive === true);
check('98102 closing line matches routed outcome',
  tf.sayLines[tf.sayLines.length - 1] === 'It comes apart — no one in reach, no one chasing. The fight ends; they melt back into the wilds.');
check('98102 transcript gap is honest (head+tail, dropped counted)',
  tf.sayDropped === 223 && tf.sayLines.length === 300, 'dropped=' + tf.sayDropped + ' kept=' + tf.sayLines.length);

// 98107 pending-class separation.
const r7 = recs.find(r => r.seed === 98107);
const last7 = (r7.dailyTrace || [])[(r7.dailyTrace || []).length - 1];
check('98107 call day 89, game won day 90', r7.callDay === 89 && r7.gameDays === 90 && r7.won === 1);
check('98107 herald present on last traced day (still pending, not departed)',
  last7 && last7.heraldPresent === true && last7.day === 90);
check('98107 no titan outcome records', (r7.titanOutcomesEnd || []).length === 0);

console.log('\nheraldband pilot proof: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
