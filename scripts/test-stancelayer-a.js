#!/usr/bin/env node
// test-stancelayer-a.js — corpus validator for sim-stancelayer-a.
// Reproduces the verdict from the corpus alone (no game load).
// Usage: node scripts/test-stancelayer-a.js <corpus-dir>
// Expects <corpus-dir>/sl-s97301.json and sl-s97307.json, each a
// replay stdout line {"seed": N, "sl": {...}}.
// Checks (prereg bars):
//  (a) COVERAGE: every day 59–91 on 97301 labeled, 0 UNCLASSIFIED.
//  (b) GATE-NAMED: step days 73/85/87 resolved, attempt days
//      78/89 resolved, 0 GATE-UNRESOLVED / ATTEMPT-UNRESOLVED.
//  (c) REPRODUCIBILITY: 0815Z milestones for both seeds.
//  (d) instrument errors empty (mt/travel/interceptor).
//  (f) wall fields present per seed (never pooled).
'use strict';
const fs = require('fs');
const path = require('path');
const { classifySeed } = require('./stancelayer-classify');

const dir = process.argv[2];
if (!dir) { console.error('STANCELAYER-VALIDATOR STOP: corpus dir arg required.'); process.exit(2); }
function load(seed) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, 'sl-s' + seed + '.json'), 'utf8'));
  return raw.sl || raw.le || raw;
}
let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const s1 = load(97301);
const m1 = s1.milestones || {};
check('97301 wave4Day 48', m1.wave4Day === 48, m1.wave4Day);
check('97301 stage2Day 59', m1.omenStage2Day === 59, m1.omenStage2Day);
check('97301 present 59..91', m1.firstPresentDay === 59 && m1.lastPresentDay === 91, [m1.firstPresentDay, m1.lastPresentDay]);
check('97301 lair 8,4', s1.lairTile && s1.lairTile.x === 8 && s1.lairTile.y === 4, s1.lairTile);
check('97301 attempts 4 on days 78/89', s1.attemptCount === 4 &&
  JSON.stringify((s1.attempts || []).map(function (a) { return a.day; })) === JSON.stringify([78, 78, 78, 89]),
  (s1.attempts || []).map(function (a) { return a.day; }));
check('97301 mtErrors empty', (s1.mtErrors || []).length === 0, s1.mtErrors);
check('97301 travelErrors empty', (s1.travelErrors || []).length === 0, s1.travelErrors);
check('97301 interceptorErrors empty', (s1.interceptorErrors || []).length === 0, s1.interceptorErrors);

const v1 = classifySeed(s1, 59, 91);
check('97301 coverage 0 UNCLASSIFIED', v1.unclassifiedDays.length === 0, v1.unclassifiedDays);
check('97301 step days include 73/85/87',
  [73, 85, 87].every(function (d) { return v1.stepDays.some(function (s) { return s.day === d; }); }),
  v1.stepDays);
check('97301 step days 0 GATE-UNRESOLVED', v1.unresolvedStepDays.length === 0, v1.unresolvedStepDays);
check('97301 attempt days 78/89 resolved',
  JSON.stringify(v1.attemptDays.map(function (s) { return s.day; })) === JSON.stringify([78, 89]) &&
  v1.unresolvedAttemptDays.length === 0, v1.attemptDays);
check('97301 attempt sub-labels', v1.attemptDays.every(function (s) {
  return s.sub === 'COINCIDED-AT-DAWN' || s.sub === 'CLOSED-IN-DAY';
}), v1.attemptDays);

const s7 = load(97307);
const m7 = s7.milestones || {};
check('97307 wave4Day 116', m7.wave4Day === 116, m7.wave4Day);
check('97307 stage2Day 129', m7.omenStage2Day === 129, m7.omenStage2Day);
check('97307 present 129..152', m7.firstPresentDay === 129 && m7.lastPresentDay === 152, [m7.firstPresentDay, m7.lastPresentDay]);
check('97307 lair 7,4', s7.lairTile && s7.lairTile.x === 7 && s7.lairTile.y === 4, s7.lairTile);
check('97307 attempts 0', s7.attemptCount === 0, s7.attemptCount);
check('97307 mtErrors empty', (s7.mtErrors || []).length === 0, s7.mtErrors);

for (const s of [s1, s7]) {
  check('seed ' + s.seed + ' wall fields present',
    s.national != null && s.table != null && s.won != null && s.gameDays != null && s.endReason != null,
    { national: s.national, table: s.table, won: s.won, gameDays: s.gameDays, endReason: s.endReason });
}

console.log('--- day table 97301 (59–91) ---');
for (const d of v1.days) {
  console.log('day ' + d.day + ' ' + d.label + (d.sub ? '/' + d.sub : '') + ' ' + JSON.stringify(d.detail));
}
console.log('stancelayer-validator: ' + (checks - fails) + '/' + checks + ' checks pass');
process.exit(fails ? 1 : 0);
