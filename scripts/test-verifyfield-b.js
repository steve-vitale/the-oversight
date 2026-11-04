#!/usr/bin/env node
// test-verifyfield-b.js — proof for sim-verifyfield-b (DIAG ONLY).
// Pure functions + a read of the reused 2130Z tracer corpus; no game
// load, no file writes, no RNG, no judged-seed substitution.
// Proves: (1) the SETTLED verification field from the prereg —
// rows contiguous in loopDay 1..N AND (N == daysAlive OR
// (village-lost AND N == daysAlive - 1 AND gameDays == N)) —
// including the gameDays-field rejection case (a complete
// survivor whose gameDays exceeds its row count still verifies);
// (2) the (v**) tie-miss mechanism on a synthetic series (a store
// hovering at 0.87-0.90 of peak lets (c) fire before (e**));
// (3) the judged corpus counts recomputed live from the 2130Z
// tracer corpus with the reused cost analyzer: 12 collapsing +
// 16 survivors, fire 12/12, tie 11/12 (sole miss 83248),
// strict 10/12, lead-one 10/12, cost 1/16, cross-check 0
// mismatches, verdict PILOT-NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeedStreakfreeCost, summarizeStreakfreeCost } = require('./analyze-streakfree-cost-b');

let n = 0, fails = 0;
function check(name, cond, extra) {
  n++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + extra : '')); }
}

// Settled verification field, exactly as fixed in the prereg.
function verifySettled(sj) {
  const rows = (sj.rows || []).slice().sort((a, b) => a.loopDay - b.loopDay);
  const N = rows.length;
  for (let i = 0; i < N; i++) if (rows[i].loopDay !== i + 1) return false;
  if (N === sj.daysAlive) return true;
  if (sj.endReason === 'village-lost' && N === sj.daysAlive - 1 && sj.gameDays === N) return true;
  return false;
}
function mkLeg({ seed, daysAlive, endReason, gameDays, loopDays }) {
  return { seed, daysAlive, endReason, gameDays, rows: loopDays.map((d) => ({ loopDay: d })) };
}

// (1) Settled-field synthetic cases.
check('verify: survivor complete 30/30 passes',
  verifySettled(mkLeg({ seed: 1, daysAlive: 30, endReason: 'survived', gameDays: 30, loopDays: Array.from({ length: 30 }, (_, i) => i + 1) })));
check('verify: survivor complete 30 rows with gameDays 31 passes (gameDays rejected as field)',
  verifySettled(mkLeg({ seed: 2, daysAlive: 30, endReason: 'survived', gameDays: 31, loopDays: Array.from({ length: 30 }, (_, i) => i + 1) })));
check('verify: survivor complete 30 rows with gameDays 32 passes (83208 shape)',
  verifySettled(mkLeg({ seed: 3, daysAlive: 30, endReason: 'survived', gameDays: 32, loopDays: Array.from({ length: 30 }, (_, i) => i + 1) })));
check('verify: survivor short 29/30 fails',
  !verifySettled(mkLeg({ seed: 4, daysAlive: 30, endReason: 'survived', gameDays: 30, loopDays: Array.from({ length: 29 }, (_, i) => i + 1) })));
check('verify: village-lost exact 20/20 passes',
  verifySettled(mkLeg({ seed: 5, daysAlive: 20, endReason: 'village-lost', gameDays: 20, loopDays: Array.from({ length: 20 }, (_, i) => i + 1) })));
check('verify: village-lost loss-day 19/20 with gameDays 19 passes (83373/83377 shape)',
  verifySettled(mkLeg({ seed: 6, daysAlive: 20, endReason: 'village-lost', gameDays: 19, loopDays: Array.from({ length: 19 }, (_, i) => i + 1) })));
check('verify: village-lost loss-day 19/20 with gameDays 20 fails corroboration',
  !verifySettled(mkLeg({ seed: 7, daysAlive: 20, endReason: 'village-lost', gameDays: 20, loopDays: Array.from({ length: 19 }, (_, i) => i + 1) })));
check('verify: village-lost 18/20 fails (two short, not a loss day)',
  !verifySettled(mkLeg({ seed: 8, daysAlive: 20, endReason: 'village-lost', gameDays: 18, loopDays: Array.from({ length: 18 }, (_, i) => i + 1) })));
check('verify: gapped series fails even at the right count',
  !verifySettled(mkLeg({ seed: 9, daysAlive: 20, endReason: 'village-lost', gameDays: 19, loopDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20] })));

// (2) Synthetic tie-miss series (83248 mechanism, synthetic numbers).
function synthRows(pantries) {
  return pantries.map((p, i) => ({ loopDay: i + 1, pantryKcal: p, gateEngaged: false, hungryStreak: 1 }));
}
// S day1 20000; early falls, plateau, then 0.89/0.88/0.87 hover days 8-10,
// then a deeper fall day 11. (c) fires day 10 (3 consecutive falls,
// 17400 <= 0.90*20000); (v**) waits until day 11 (16000 <= 0.85*20000).
const tieMiss = {
  seed: 999201, endReason: 'village-lost', days: 30, daysAlive: 20,
  deaths: [{ day: 14, cause: 'starvation' }],
  rows: synthRows([20000, 19000, 18500, 18000, 18000, 18000, 18000, 17800, 17600, 17400, 16000, 15000]),
};
const tm = analyzeSeedStreakfreeCost(tieMiss);
check('synthetic tie-miss: (c) fires day 10', tm.c && tm.c.day === 10, JSON.stringify(tm.c));
check('synthetic tie-miss: (v**) fires day 11', tm.v && tm.v.day === 11, JSON.stringify(tm.v));
check('synthetic tie-miss: tie fails, strict fails', tm.leadComparison.beatsOrTies === false && tm.leadComparison.strictlyBeats === false, JSON.stringify(tm.leadComparison));
// Synthetic tie-pass via cliff: pantry collapses to 0.60 of peak on day 9.
const tiePass = {
  seed: 999202, endReason: 'village-lost', days: 30, daysAlive: 20,
  deaths: [{ day: 14, cause: 'starvation' }],
  rows: synthRows([20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 12000, 11000]),
};
const tp = analyzeSeedStreakfreeCost(tiePass);
check('synthetic tie-pass: (v**) E2 fires day 9 before (c)', tp.v && tp.v.day === 9 && tp.v.clause === 'E2-cliff', JSON.stringify(tp.v));
check('synthetic tie-pass: tie holds', tp.leadComparison.beatsOrTies === true);

// (3) Live corpus counts, recomputed with the reused analyzer.
const corpusPath = path.join(__dirname, '..', 'evidence', '2026-11-03', 'sim-streakfree-cost-b-tracer.jsonl');
const corpus = fs.readFileSync(corpusPath, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
check('corpus: 28 legs', corpus.length === 28, 'got ' + corpus.length);
const roles = {};
for (const s of [83230, 83248, 83263, 83272, 83281, 83284, 83286, 83336, 83341, 83373, 83377, 83379]) roles[String(s)] = 'candidate';
for (let s = 83201; s <= 83216; s++) roles[String(s)] = 'cost';
check('corpus: membership matches prereg (12 candidates + 16 cost)',
  corpus.every((sj) => roles[String(sj.seed)] != null) && Object.keys(roles).length === 28);
const unverified = corpus.filter((sj) => !verifySettled(sj)).map((sj) => sj.seed);
check('corpus: all 28 legs verify under the settled field', unverified.length === 0, 'unverified: ' + unverified.join(','));
const summary = summarizeStreakfreeCost(corpus, roles);
check('corpus: still-collapsing 12', summary.stillCollapsing.length === 12, JSON.stringify(summary.stillCollapsing));
check('corpus: cost survivors 16', summary.costSurvivors.length === 16);
check('corpus: no excluded candidates, no newly collapsing cost',
  summary.excludedCandidates.length === 0 && summary.newlyCollapsingCost.length === 0);
check('corpus: fire leg holds', summary.legs.fireLeg === true);
check('corpus: tie leg fails', summary.legs.tieLeg === false);
check('corpus: strict leg holds', summary.legs.strictLeg === true);
check('corpus: lead-one leg holds', summary.legs.leadOneLeg === true);
check('corpus: cost leg holds', summary.legs.costLeg === true);
check('corpus: cross-check leg holds', summary.legs.crossCheckLeg === true);
check('corpus: verdict PILOT-NO-GO', summary.verdict === 'PILOT-NO-GO', summary.verdict);
const coll = summary.seeds.filter((s) => s.collapsing);
const tieMisses = coll.filter((s) => !s.leadComparison.beatsOrTies).map((s) => s.seed);
check('corpus: sole tie miss is 83248', JSON.stringify(tieMisses) === '[83248]', JSON.stringify(tieMisses));
const strictN = coll.filter((s) => s.leadComparison.strictlyBeats).length;
check('corpus: strict 10/12', strictN === 10, 'got ' + strictN);
const leadOneN = coll.filter((s) => s.v != null && s.v.lead >= 1).length;
check('corpus: lead-one 10/12', leadOneN === 10, 'got ' + leadOneN);
check('corpus: firing cost survivors exactly [83201]', JSON.stringify(summary.firingCostSurvivors) === '[83201]', JSON.stringify(summary.firingCostSurvivors));
const deathKnell = coll.filter((s) => s.v != null && s.v.lead === 0).map((s) => s.seed).sort((a, b) => a - b);
check('corpus: death-knell firings are 83281 and 83373', JSON.stringify(deathKnell) === '[83281,83373]', JSON.stringify(deathKnell));
const meanV = coll.reduce((t, s) => t + s.v.lead, 0) / coll.length;
const meanC = coll.reduce((t, s) => t + s.c.lead, 0) / coll.length;
check('corpus: mean lead (v**) 3.5 vs (c) 2.33', Math.abs(meanV - 3.5) < 1e-9 && Math.abs(meanC - 28 / 12) < 1e-9, meanV + ' vs ' + meanC);

console.log(n - fails + '/' + n + ' checks passed');
if (fails) process.exit(1);
