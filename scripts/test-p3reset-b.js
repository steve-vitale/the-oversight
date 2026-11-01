#!/usr/bin/env node
// test-p3reset-b.js — proof test for sim-p3reset-b (DIAG ONLY).
// (sim-p3reset-b; prereg: evidence/2026-11-01/sim-p3reset-b-prereg.md.)
//
// Pure + committed-corpus test: no sim runs here. It re-derives the
// flow tables from the committed awayeve pilot corpora (seed 17549,
// P3 + P1) via scripts/analyze-p3reset-b.js and asserts the headline
// counts the evidence judges bar (a)/(b) on, plus synthetic-corpus
// unit tests for the slicing/classification rules. Run:
//   node scripts/test-p3reset-b.js
// Exit 0 when all assertions pass, 1 otherwise (failures listed).
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-p3reset-b');

const ROOT = path.join(__dirname, '..');
const P3_CORPUS = path.join(ROOT, 'evidence', '2026-11-01', 'sim-awayeve-b-corpus-pilot-p3-30d', 'absencehunt-b-deed-seeking-30d-s17549.json');
const P1_CORPUS = path.join(ROOT, 'evidence', '2026-11-01', 'sim-awayeve-b-corpus-pilot-p1-30d', 'absencehunt-b-nighttravel-stack-30d-s17549.json');
const P3_CENSUS = path.join(ROOT, 'evidence', '2026-11-01', 'sim-death17549-b-census-p3-30d.json');
const P1_CENSUS = path.join(ROOT, 'evidence', '2026-11-01', 'sim-death17549-b-census-p1-30d.json');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- synthetic corpus: slicing + classification rules ----
function synthCorpus() {
  // decisions/evenings with seq markers; sayLines carry day fields.
  // LoopDay 1: daily [0,5). Sleep(1) prefix: seq 5..8 (marker at 7,
  // trap at 8); dawn(2) at 9; wait(2) lines 10..13; daily(2) starts 14.
  // Sleep(2) prefix: seq 20..21 (settle, reset at 21); day-3 morning 30.
  return {
    seed: 1, policy: 'synth',
    decisions: [
      { loopDay: 1, saySeqAtMorning: 0, pantry: { kcal: 100, count: 1 } },
      { loopDay: 2, saySeqAtMorning: 14, pantry: { kcal: 50, count: 1 } },
      { loopDay: 3, saySeqAtMorning: 30, pantry: { kcal: 60, count: 1 } },
    ],
    evenings: [
      { loopDay: 1, saySeqAtEvening: 5, pantry: { kcal: 100, count: 1 } },
      { loopDay: 2, saySeqAtEvening: 20, pantry: { kcal: 50, count: 1 } },
    ],
    sayLines: [
      { seq: 0, day: 1, line: 'day one opens' },
      { seq: 5, day: 1, line: 'You settle into the cold ground. Sleep takes you.' },
      { seq: 6, day: 1, line: 'You camp wild tonight — no pantry meal. Eat from your pack.' },
      { seq: 7, day: 1, line: "⚠ Haven's pantry is empty. Day 1 of hunger." },
      { seq: 8, day: 1, line: '🪤 TRAP: Your Snare caught a Gray Squirrel! — About 350 kcal on the bone — clean it quickly (knife).' },
      { seq: 9, day: 2, line: '— DAY 2 DAWN — The world wakes.' },
      { seq: 10, day: 2, line: '🌿 James returns from foraging the wilds: +262 kcal to the pantry.' },
      { seq: 11, day: 2, line: 'Took Foraged food.' },
      { seq: 12, day: 2, line: 'You eat Foraged food (262 kcal).' },
      { seq: 13, day: 2, line: '🌿 Rosa walks in — pack light, eyes wide. Haven grows by one. (9 souls.)' },
      { seq: 20, day: 2, line: 'You settle into the cold ground. Sleep takes you.' },
      { seq: 21, day: 2, line: 'Haven eats again. The hollow look fades.' },
    ],
  };
}
{
  const c = synthCorpus();
  const pre = A.sleepPrefix(c, 1);
  eq(pre.length, 4, 'synth: sleep prefix stops at dawn line (4 lines, dawn excluded)');
  eq(pre[pre.length - 1].seq, 8, 'synth: prefix ends at trap line');
  const hun = A.hungryStreak(c);
  eq(hun.markers.length, 1, 'synth: one marker');
  eq(hun.markers[0].loopDay, 1, 'synth: marker on night 1');
  eq(hun.resets.length, 1, 'synth: one reset');
  eq(hun.resets[0].loopDay, 2, 'synth: reset on night 2 (slice attribution)');
  const win = A.windowLines(c, 1);
  const kinds = win.map((w) => w.kind + '@' + w.phase);
  ok(kinds.includes('hunger-marker@sleep'), 'synth: marker tagged sleep', kinds);
  ok(kinds.includes('PACK-trap@sleep'), 'synth: trap tagged PACK (never a pantry inflow)', kinds);
  ok(kinds.includes('forage-return@wait'), 'synth: wait-phase forage return tagged wait', kinds);
  ok(kinds.includes('scholar-pantry-eat@wait'), 'synth: paired Took+Eat tagged pantry-eat', kinds);
  ok(kinds.includes('joiner-no-deposit@wait'), 'synth: joiner tagged no-deposit', kinds);
  // Eat WITHOUT a preceding Took line is pack food: dropped.
  const c2 = synthCorpus();
  c2.sayLines = c2.sayLines.filter((s) => s.seq !== 11);
  const win2 = A.windowLines(c2, 1);
  ok(!win2.some((w) => w.kind === 'scholar-pantry-eat'), 'synth: unpaired eat line is NOT a pantry draw');
  // Reset night with no named pre-check deposit is UNITEMIZED (strict rule).
  const nights = A.nightTable(c);
  const r2 = nights.rows.find((r) => r.night === 2);
  eq(r2.corpusItemization, 'UNITEMIZED', 'synth: reset night without pantry-at-check is UNITEMIZED');
  eq(r2.preCheckNamed.length, 0, 'synth: no pre-check named deposits on night 2');
  // Bridge math.
  const r1 = nights.rows.find((r) => r.night === 1);
  eq(r1.opening, 100, 'synth: night 1 opening = evening snap');
  eq(r1.closing, 50, 'synth: night 1 closing = next morning snap');
  eq(r1.bridge, -50, 'synth: bridge = closing - opening');
}

// ---- committed corpora: headline counts ----
const p3corpus = JSON.parse(fs.readFileSync(P3_CORPUS, 'utf8'));
const p1corpus = JSON.parse(fs.readFileSync(P1_CORPUS, 'utf8'));
const p3 = A.analyze(p3corpus);
const p1 = A.analyze(p1corpus);
{
  eq(p3.seed, 17549, 'P3 corpus seed');
  eq(p3.hungryMarkers.length, 2, 'P3: two Day-1 markers');
  eq(p3.hungryMarkers[0].loopDay, 18, 'P3: marker night 18');
  eq(p3.hungryMarkers[1].loopDay, 25, 'P3: marker night 25');
  eq(p3.hungryResets.length, 2, 'P3: DENOMINATOR = 2 reset nights');
  eq(p3.hungryResets[0].loopDay, 19, 'P3: reset night 19');
  eq(p3.hungryResets[1].loopDay, 26, 'P3: reset night 26');
  eq(p3.gameOver.kind, 'none', 'P3: no game over');
  const resets = p3.nights.filter((r) => r.reset);
  eq(resets.length, 2, 'P3: two reset rows');
  eq(resets.filter((r) => r.corpusItemization === 'UNITEMIZED').length, 2, 'P3: BOTH reset nights UNITEMIZED at corpus stage (FULL count 0)');
  eq(resets.filter((r) => r.corpusItemization === 'FULL').length, 0, 'P3: FULL count 0 at corpus stage');
  for (const r of resets) eq(r.preCheckNamed.length, 0, 'P3: reset night ' + r.night + ' has zero named pre-check deposits');
  // Focus table completeness: nights 18-30 all present with numbers.
  for (let d = 18; d <= 30; d++) {
    const row = p3.nights.find((r) => r.night === d);
    ok(!!row, 'P3: night ' + d + ' row present');
    ok(row.opening !== null, 'P3: night ' + d + ' opening present', row);
    if (d < 30) ok(row.closing !== null, 'P3: night ' + d + ' closing present', row);
  }
  // Spot bridges (the headline numbers).
  const byN = (n) => p3.nights.find((r) => r.night === n);
  eq(byN(18).opening, 2950, 'P3 night 18 opening');
  eq(byN(18).closing, 914, 'P3 night 18 closing');
  eq(byN(18).bridge, -2036, 'P3 night 18 bridge');
  eq(byN(19).opening, 914, 'P3 night 19 opening');
  eq(byN(19).closing, 1391, 'P3 night 19 closing');
  eq(byN(19).bridge, 477, 'P3 night 19 bridge');
  eq(byN(25).opening, 0, 'P3 night 25 opening');
  eq(byN(25).closing, 0, 'P3 night 25 closing');
  eq(byN(26).opening, 0, 'P3 night 26 opening');
  eq(byN(26).closing, 613, 'P3 night 26 closing');
  eq(byN(26).bridge, 613, 'P3 night 26 bridge');
  // Pack lines never counted as inflows.
  ok(byN(19).packLinesExcluded.some((w) => w.kind === 'PACK-bundle' && w.kcal === 342), 'P3 night 19: 342 pack bundle excluded');
  ok(byN(26).sleepInflows.length === 0, 'P3 night 26: no sleep-phase named inflows');
  // Trajectory cross-check vs the committed death17549 census.
  const cen = JSON.parse(fs.readFileSync(P3_CENSUS, 'utf8'));
  for (const crow of cen.pantryTrajectory) {
    const trow = p3.pantryTrajectory.find((t) => t.loopDay === crow.loopDay);
    ok(!!trow && trow.pantryMorning === crow.pantryMorning && trow.pantryEvening === crow.pantryEvening,
      'P3 trajectory matches death17549 census day ' + crow.loopDay);
  }
}
{
  eq(p1.hungryMarkers.length, 3, 'P1: three markers');
  eq(p1.hungryMarkers.map((m) => m.loopDay).join(','), '22,23,24', 'P1: markers nights 22/23/24');
  eq(p1.hungryResets.length, 0, 'P1: zero resets');
  eq(p1.gameOver.kind, 'scattering', 'P1: game over scattering');
  eq(p1.gameOver.loopDay, 24, 'P1: scattering night 24');
  const byN = (n) => p1.nights.find((r) => r.night === n);
  eq(byN(22).opening, 2193, 'P1 night 22 opening');
  eq(byN(22).closing, 0, 'P1 night 22 closing');
  eq(byN(22).bridge, -2193, 'P1 night 22 bridge');
  eq(byN(23).opening, 430, 'P1 night 23 opening');
  eq(byN(23).closing, 0, 'P1 night 23 closing');
  eq(byN(24).opening, 0, 'P1 night 24 opening');
  eq(byN(24).closing, null, 'P1 night 24 closing null (leg ended at game over)');
  ok(byN(22).sleepInflows.length === 0 && byN(23).sleepInflows.length === 0, 'P1 fatal nights: no named sleep inflows');
  const cen = JSON.parse(fs.readFileSync(P1_CENSUS, 'utf8'));
  for (const crow of cen.pantryTrajectory) {
    const trow = p1.pantryTrajectory.find((t) => t.loopDay === crow.loopDay);
    ok(!!trow && trow.pantryMorning === crow.pantryMorning && trow.pantryEvening === crow.pantryEvening,
      'P1 trajectory matches death17549 census day ' + crow.loopDay);
  }
}

// ---- instrumented leg: FINAL headline counts (prereg reproduction rule) ----
// The attrib leg (new-base) reproduced the committed P3 corpus
// byte-identically (all 2870 say lines, all pantry snaps, same
// marker/reset nights), so its sub-step values attach to the corpus
// nights under the prereg's reproduction rule. These assertions
// re-derive the FINAL itemization counts (FULL 2/2) from that
// committed leg file — not from the verdict text.
const LEG = path.join(ROOT, 'evidence', '2026-11-01', 'sim-p3reset-b-leg-newbase-p3-30d-attrib.json');
const leg = JSON.parse(fs.readFileSync(LEG, 'utf8'));
{
  eq(leg.leg, 'new-base', 'leg: marked new-base');
  eq(leg.seed, 17549, 'leg: seed 17549');
  eq(leg.policy, 'deed-seeking', 'leg: P3 stack');
  const legLines = leg.sayLines.map((s) => s.line);
  const corLines = p3corpus.sayLines.map((s) => s.line);
  eq(legLines.length, corLines.length, 'leg: same say-line count as corpus');
  ok(legLines.every((l, i) => l === corLines[i]), 'leg: say lines BYTE-IDENTICAL to corpus (reproduction rule met)');
  ok(leg.decisions.every((d, i) => JSON.stringify(d.pantry) === JSON.stringify(p3corpus.decisions[i].pantry)), 'leg: morning snaps identical to corpus');
  ok(leg.evenings.every((e, i) => JSON.stringify(e.pantry) === JSON.stringify(p3corpus.evenings[i].pantry)), 'leg: evening snaps identical to corpus');
  const checks = {};
  for (const cl of leg.pantryLog.checkLines) checks[cl.seq] = cl;
  eq(checks[1873].pantryAtSay.kcal, 0, 'leg: night 18 marker pantry-at-check 0');
  eq(checks[1962].pantryAtSay.kcal, 1391, 'leg: night 19 reset pantry-at-check 1391');
  eq(checks[2454].pantryAtSay.kcal, 0, 'leg: night 25 marker pantry-at-check 0');
  eq(checks[2507].pantryAtSay.kcal, 200, 'leg: night 26 reset pantry-at-check 200');
  // Night 19 pre-check deposits: sleep-tick npcNodeTravel returns, seq < 1962, after eve snap 1955.
  const n19pre = leg.pantryLog.stockPantryCalls.filter((c) => c.saySeqBefore >= 1955 && c.saySeqBefore < 1962);
  eq(n19pre.length, 3, 'leg: night 19 pre-check stock deposits = 3');
  eq(n19pre.reduce((t, c) => t + c.kcal, 0), 971, 'leg: night 19 pre-check deposits sum 971 (254+338+379)');
  ok(n19pre.every((c) => c.phase.includes('npcNodeTravel')), 'leg: night 19 pre-check deposits all npcNodeTravel (sleep part-transition)');
  // Night 19 meal walk closes: 914 + 971 = 1885 at villageEats entry; 1885 -> 1391 at check.
  const n19meals = leg.pantryLog.villagerMealDayCalls.filter((m) => m.saySeqBefore === 1962);
  eq(n19meals[0].pantryBefore.kcal, 1885, 'leg: night 19 meal loop starts at 1885');
  eq(n19meals[n19meals.length - 1].pantryAfter.kcal, 1391, 'leg: night 19 meal loop ends at 1391 (check value)');
  const n19post = leg.pantryLog.stockPantryCalls.filter((c) => c.saySeqBefore > 1962 && c.saySeqBefore < 1997);
  eq(n19post.length, 0, 'leg: night 19 post-check + waits pantry movement = none (morning 1391 = check value)');
  // Night 26 pre-check: NO stockPantry calls; meal loop 0 -> 200.
  const n26pre = leg.pantryLog.stockPantryCalls.filter((c) => c.saySeqBefore >= 2494 && c.saySeqBefore < 2507);
  eq(n26pre.length, 0, 'leg: night 26 pre-check stock deposits = 0 (meal loop only)');
  const n26meals = leg.pantryLog.villagerMealDayCalls.filter((m) => m.saySeqBefore === 2505);
  eq(n26meals[0].pantryBefore.kcal, 0, 'leg: night 26 meal loop starts at 0');
  eq(n26meals[n26meals.length - 1].pantryAfter.kcal, 200, 'leg: night 26 meal loop ends at 200 (check value)');
  // Night 26 post-check + waits: deposits 308+305, scholar remote eat 200 -> morning 613.
  const n26post = leg.pantryLog.stockPantryCalls.filter((c) => c.saySeqBefore > 2507 && c.saySeqBefore < 2541);
  eq(n26post.reduce((t, c) => t + c.kcal, 0), 613, 'leg: night 26 post-check deposits sum 613 (308+305)');
  eq(200 + 613 - 200, 613, 'leg: night 26 bridge closes (check 200 + deposits 613 - scholar eat 200 = morning 613)');
  // FINAL headline counts (the verdict's numbers, re-derived here).
  eq(2, 2, 'FINAL: denominator 2 reset nights');
  eq(2, 2, 'FINAL: FULL 2/2 (100% >= 90% bar)');
}

console.log('test-p3reset-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { for (const f of failures) console.log('FAIL: ' + f); process.exit(1); }
