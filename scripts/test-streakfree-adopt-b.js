#!/usr/bin/env node
// test-streakfree-adopt-b.js — adoption measurement proof for
// sim-streakfree-adopt-b (DIAG ONLY). Pure reads over the committed
// tracer corpus + summary; no game load, no file writes, no RNG.
// It re-derives the judged verdict from the tracer corpus with the
// committed analyzer and asserts it matches the committed summary:
// INSUFFICIENT-DATA driven by survivor drift on seed 83013, with the
// still-collapsing exclusions, the cost-leg count, and the
// cross-check all pinned. It does NOT re-judge any leg.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeedStreakfree, summarizeStreakfree } = require('./analyze-streakfree-b.js');

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-03');
const tracer = fs.readFileSync(path.join(DIR, 'sim-streakfree-adopt-b-tracer.jsonl'), 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));
const summary = JSON.parse(fs.readFileSync(path.join(DIR, 'sim-streakfree-adopt-b-summary.json'), 'utf8'));
const screen = fs.readFileSync(path.join(DIR, 'screen-tmp-streakfree-b', 'screen.jsonl'), 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));

const ROLES = {
  83014: 'candidate', 83019: 'candidate', 83020: 'candidate', 83055: 'candidate',
  83111: 'candidate', 83126: 'candidate', 83140: 'candidate', 83149: 'candidate',
  83163: 'candidate', 83189: 'candidate',
  83001: 'cost', 83002: 'cost', 83003: 'cost', 83004: 'cost', 83005: 'cost',
  83006: 'cost', 83007: 'cost', 83008: 'cost', 83009: 'cost', 83010: 'cost',
  83011: 'cost', 83012: 'cost', 83013: 'cost', 83015: 'cost', 83016: 'cost', 83017: 'cost',
};

let n = 0;
function check(name, cond) {
  n++;
  if (!cond) { console.error('FAIL ' + name); process.exitCode = 1; }
  else console.log('PASS ' + name);
}

// Screen corpus integrity: full fresh band, in order, rows verified.
check('screen: 200 lines, seeds 83001-83200 in order',
  screen.length === 200 && screen.every((s, i) => s.seed === 83001 + i));
check('screen: rows.length == daysAlive on all 200',
  screen.every((s) => s.rows.length === s.daysAlive));
check('tracer: 26 legs in prereg order (10 candidates + 16 survivors)',
  tracer.length === 26 && tracer.map((s) => s.seed).join(',') ===
  '83014,83019,83020,83055,83111,83126,83140,83149,83163,83189,83001,83002,83003,83004,83005,83006,83007,83008,83009,83010,83011,83012,83013,83015,83016,83017');
check('tracer: rows.length == daysAlive on all 26',
  tracer.every((s) => s.rows.length === s.daysAlive));

// Re-derived verdict matches the committed summary exactly.
const re = summarizeStreakfree(tracer, ROLES);
check('verdict re-derives as INSUFFICIENT-DATA', re.verdict === 'INSUFFICIENT-DATA');
check('summary verdict matches re-derivation', summary.verdict === re.verdict);
check('still-collapsing: 8 seeds', JSON.stringify(re.stillCollapsing) ===
  JSON.stringify([83014, 83019, 83020, 83055, 83111, 83149, 83163, 83189]));
check('excluded by still-collapsing rule: 83126, 83140',
  JSON.stringify(re.excludedCandidates) === JSON.stringify([83126, 83140]));
check('survivor drift: 83013 newly collapses on tracer',
  JSON.stringify(re.newlyCollapsingCost) === JSON.stringify([83013]));
check('traced survivors: 15', re.costSurvivors.length === 15);
check('cost: variant fires on 4/15 traced survivors (26.7% > 25% bar)',
  JSON.stringify(re.firingCostSurvivors) === JSON.stringify([83001, 83002, 83005, 83011]));
check('cost leg false in re-derivation', re.legs.costLeg === false);
check('cross-check: 0 mismatches on 26/26', re.crossCheckMismatches.length === 0);
check('fire leg true on still-collapsing 8/8', re.legs.fireLeg === true);
check('tie leg true on still-collapsing 8/8', re.legs.tieLeg === true);
check('strict leg true (6/8 strictly beat (c))', re.legs.strictLeg === true);
check('lead-one leg true (7/8 lead >= 1)', re.legs.leadOneLeg === true);
check('count gate true (8 >= 4)', re.legs.countGate === true);
check('survivor gate true (15 >= 12)', re.legs.survivorGate === true);

// Spot values pinned from the judged table.
const bySeed = new Map(re.seeds.map((s) => [s.seed, s]));
check('83055 is the sole lead-0 (death-knell) firing',
  bySeed.get(83055).v.lead === 0 &&
  re.seeds.filter((s) => s.role === 'candidate' && s.collapsing && s.v.lead === 0).length === 1);
check('83014 variant fires via F one day before (e*)',
  bySeed.get(83014).v.day === 18 && bySeed.get(83014).v.clause === 'F-fallback' &&
  bySeed.get(83014).e.day === 19);
check('mean lead variant 3.75 vs (c) 2.875 on still-collapsing',
  re.seeds.filter((s) => s.role === 'candidate' && s.collapsing)
    .reduce((a, s) => a + s.v.lead, 0) / 8 === 3.75 &&
  re.seeds.filter((s) => s.role === 'candidate' && s.collapsing)
    .reduce((a, s) => a + s.c.lead, 0) / 8 === 2.875);
check('analyzer per-seed analysis is deterministic (re-run matches summary seeds)',
  re.seeds.every((s) => {
    const m = summary.seeds.find((x) => x.seed === s.seed);
    return m && (m.v ? m.v.day : null) === (s.v ? s.v.day : null) && m.collapsing === s.collapsing;
  }));

console.log(n + ' checks, ' + (process.exitCode ? 'FAILURES' : 'all passed'));
