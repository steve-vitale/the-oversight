#!/usr/bin/env node
// test-dipslide2-b.js — proof test for sim-dipslide2-b.
// (DIAG ONLY.) Pure checks run by default. --live replays the ALREADY
// JUDGED prior corpora through the NEW analyzer as a retrospective
// implementation check — it is NOT a judged result for this arm (the
// judged test is the fresh 513xx bands; see the prereg). --live takes an
// optional corpus path; with no argument it defaults to the prior
// confirm corpus (evidence/2026-11-01/sim-dipslide-confirm-b-armed.jsonl)
// and the pilot corpus (evidence/2026-11-01/sim-depositgate-b-armed.jsonl)
// resolved relative to this script, so a bare `--live` works (the
// 1430Z coordinator error class: a bare --live that demands an argument).
// No game load, no file writes, no RNG in pure mode.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed2, confirms2, confirmsOld, rateBar, summarize2 } = require('./analyze-dipslide2-b');
const { isCandidateDay, isEligibleCandidateDay } = require('./analyze-dipslide-b');

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) { console.log('ok - ' + name); }
  else { fails++; console.log('FAIL - ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// Build a synthetic seed JSON from a day->pantry map. Unspecified days
// default to 40000 (flat, never a candidate by itself). gateEngaged
// defaults true; pass engagedFalseDays (array) to break the run.
function makeSeed(series, opts) {
  opts = opts || {};
  const days = opts.days || 30;
  const rows = [];
  for (let d = 1; d <= days; d++) {
    const p = Object.prototype.hasOwnProperty.call(series, d) ? series[d] : 40000;
    rows.push({ loopDay: d, pantryKcal: p, freshDays: 10, gateEngaged: !(opts.engagedFalseDays || []).includes(d), hungryStreak: 0, alive: 12 });
  }
  return { seed: opts.seed || 90001, arm: 'armed', policy: 'competent', days,
    daysAlive: days, endReason: opts.endReason || 'survived', gameDays: days + 1,
    maxWaveUnlocked: 1, waveKills: {}, rows, sayLines: [] };
}

function runPure() {
  // A — bounce-and-refall (51207-shaped): old confirms, new rejects, scan continues.
  {
    const s = makeSeed({ 5: 40000, 6: 39000, 7: 38000, 8: 37000, 9: 35000, 10: 31000,
      11: 31500, 12: 30000, 13: 29000, 14: 28000, 15: 27000,
      16: 26000, 17: 25000, 18: 24000, 19: 23000 });
    const a = analyzeSeed2(s);
    check('A bounce candidate rejected by new rule', a.rejectedByRecovery.includes(10), a);
    check('A scan continues to later confirming candidate', a.candidateDay === 14 && a.confirmedDay === 19, a);
  }
  // B — monotonic slide (51210-shaped): new rule confirms.
  {
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 29000, 10: 28000, 11: 27000, 12: 26000, 13: 25000 });
    const a = analyzeSeed2(s);
    check('B monotonic slide confirms day 13 from candidate 8', a.candidateDay === 8 && a.confirmedDay === 13, a);
    check('B no recovery rejections', a.rejectedByRecovery.length === 0, a);
  }
  // C — flat step-down with intermediate above candidate (51211-shaped): rejects, stays quiet.
  {
    const s = makeSeed({ 1: 30000, 2: 30000, 3: 30000, 4: 30000,
      5: 32000, 6: 30500, 7: 30000, 8: 29000, 9: 28000, 10: 25000,
      11: 24000, 12: 24500, 13: 25200, 14: 24000, 15: 24900, 16: 23000 });
    const a = analyzeSeed2(s);
    check('C step-down candidate rejected', a.rejectedByRecovery.includes(10), a);
    check('C step-down never confirms', a.confirmedDay === null, a);
  }
  // D — endpoint above candidate: rejects under both rules.
  {
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 31000, 10: 32000, 11: 33000, 12: 34000, 13: 35000 });
    const a = analyzeSeed2(s);
    check('D endpoint-above rejects', a.confirmedDay === null && a.rejectedByRecovery.length === 0, a);
  }
  // E — D+5 outside final run: no confirm, level stand-down recorded.
  {
    const engagedFalseDays = [];
    for (let d = 13; d <= 30; d++) engagedFalseDays.push(d);
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 29000, 10: 28000, 11: 27000, 12: 26000 }, { engagedFalseDays });
    const a = analyzeSeed2(s);
    check('E confirm outside final run blocked', a.confirmedDay === null, a);
    check('E level stand-down is day 13', a.levelStandDown === 13, a);
  }
  // F — no-run seed: no fire, no run.
  {
    const engagedFalseDays = [];
    for (let d = 1; d <= 30; d++) engagedFalseDays.push(d);
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000 }, { engagedFalseDays });
    const a = analyzeSeed2(s);
    check('F no-run seed has no final run and no fire', a.finalRun === null && a.confirmedDay === null && a.falseFire === false, a);
  }
  // G — null pantry breaks the fall chain: day 10 not a candidate.
  {
    const s = makeSeed({ 5: 40000, 6: 39000, 7: 38000, 8: 37000, 9: null, 10: 31000,
      11: 30000, 12: 29000, 13: 28000, 14: 27000, 15: 26000 });
    const rows = s.rows;
    const i10 = rows.findIndex((r) => r.loopDay === 10);
    check('G null pantry breaks candidate chain', isCandidateDay(rows, i10) === false, null);
    check('G null pantry day is never eligible', isEligibleCandidateDay(rows, i10) === false, null);
  }
  // H — intermediate exactly AT candidate level kills (boundary: >= counts as recovery).
  {
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 30000, 10: 29000, 11: 28000, 12: 27000, 13: 26000,
      14: 25000, 15: 24000, 16: 23000, 17: 22000 });
    const a = analyzeSeed2(s);
    check('H equality intermediate kills candidate 8', a.rejectedByRecovery.includes(8), a);
    check('H scan continues to candidate 12 confirming 17', a.candidateDay === 12 && a.confirmedDay === 17, a);
  }
  // I — new rule is a subset of old rule (confirms2 => confirmsOld) on B's seed rows.
  {
    const s = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 29000, 10: 28000, 11: 27000, 12: 26000, 13: 25000 });
    const rows = s.rows;
    const byDay = new Map(rows.map((r, i) => [r.loopDay, i]));
    const i8 = byDay.get(8);
    check('I confirms2 implies confirmsOld', confirms2(rows, byDay, i8, 0, rows.length - 1) === true &&
      confirmsOld(rows, byDay, i8, 0, rows.length - 1) === true, null);
  }
  // J — rate-bar boundaries on analyzed-shaped objects.
  {
    const mk = (seed, falseFire) => ({ seed, censusValid: true, survived: true, finalRun: { startLoopDay: 1, endLoopDay: 30 }, falseFire });
    const band3of12 = [];
    for (let k = 0; k < 12; k++) band3of12.push(mk(91000 + k, k < 3));
    const band4of12 = [];
    for (let k = 0; k < 12; k++) band4of12.push(mk(92000 + k, k < 4));
    check('J 3/12 passes the 25% cap', rateBar(band3of12).pass === true, rateBar(band3of12));
    check('J 4/12 fails the 25% cap', rateBar(band4of12).pass === false, rateBar(band4of12));
    check('J S=0 is unjudged, not passed', rateBar([]).judged === false && rateBar([]).pass === null, rateBar([]));
    const noRun = [{ seed: 93001, censusValid: true, survived: true, finalRun: null, falseFire: false }];
    check('J no-run seed excluded from denominator', rateBar(noRun).judged === false, rateBar(noRun));
  }
  // K — summarize2 end-to-end: 4 survived synthetic seeds, 1 false => rate 0.25 pass + sensitivity.
  {
    const quiet = makeSeed({}, { seed: 94001 });
    const bSeed = makeSeed({ 3: 40000, 4: 39000, 5: 38000, 6: 37000, 7: 35000, 8: 30000,
      9: 29000, 10: 28000, 11: 27000, 12: 26000, 13: 25000 }, { seed: 94002 });
    const sum = summarize2([quiet, bSeed, makeSeed({}, { seed: 94003 }), makeSeed({}, { seed: 94004 })]);
    check('K summarize rate 1/4 passes', sum.bars.rate.pass === true && sum.bars.rate.rate === 0.25, sum.bars.rate);
    check('K summarize sensitivity true', sum.bars.sensitivityAnyConfirm === true, null);
    check('K summarize collapse earliness unjudged with 0 collapses', sum.bars.collapseEarliness.judged === false, null);
  }
  console.log('pure: ' + (checks - fails) + '/' + checks + ' checks passed');
  if (fails > 0) process.exit(1);
}

function readJsonl(p) {
  if (!fs.existsSync(p)) { console.error('LIVE FAIL: corpus missing: ' + p); process.exit(2); }
  return fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function runLive() {
  const root = path.resolve(__dirname, '..');
  const arg = process.argv[3];
  const confirmPath = arg || path.join(root, 'evidence/2026-11-01/sim-dipslide-confirm-b-armed.jsonl');
  const pilotPath = path.join(root, 'evidence/2026-11-01/sim-depositgate-b-armed.jsonl');
  const confirm = readJsonl(confirmPath);
  const sum = summarize2(confirm);
  const bySeed = new Map(sum.seeds.map((s) => [s.seed, s]));
  check('LIVE retrospective confirm false seeds are exactly 51204+51210',
    JSON.stringify(sum.bars.rate.falseSeeds) === JSON.stringify([51204, 51210]), sum.bars.rate);
  check('LIVE retrospective 51207 rejected by recovery at candidate 18',
    (bySeed.get(51207).rejectedByRecovery || []).includes(18), bySeed.get(51207).rejectedByRecovery);
  check('LIVE retrospective 51211 rejected by recovery at candidate 21',
    (bySeed.get(51211).rejectedByRecovery || []).includes(21), bySeed.get(51211).rejectedByRecovery);
  check('LIVE retrospective 51204/51210 not recovery-rejected on confirming candidate',
    !bySeed.get(51204).rejectedByRecovery.includes(bySeed.get(51204).candidateDay) &&
    !bySeed.get(51210).rejectedByRecovery.includes(bySeed.get(51210).candidateDay), null);
  check('LIVE retrospective rate 2/12 passes old cap (calibration only, NOT a verdict)',
    sum.bars.rate.pass === true && sum.bars.rate.rate === 2 / 12, sum.bars.rate);
  const pilot = readJsonl(pilotPath);
  const psum = summarize2(pilot);
  const pBy = new Map(psum.seeds.map((s) => [s.seed, s]));
  check('LIVE retrospective pilot 51101 still confirms day 13',
    pBy.get(51101).candidateDay === 8 && pBy.get(51101).confirmedDay === 13, pBy.get(51101));
  check('LIVE retrospective pilot 51103 still fires (residual disclosed)',
    pBy.get(51103).candidateDay === 8 && pBy.get(51103).confirmedDay === 13, pBy.get(51103));
  const again = summarize2(confirm);
  check('LIVE determinism: repeat analysis identical',
    JSON.stringify(again) === JSON.stringify(sum), null);
  console.log('live: ' + (checks - fails) + '/' + checks + ' checks passed');
  if (fails > 0) process.exit(1);
}

if (process.argv.includes('--live')) runLive();
else runPure();
