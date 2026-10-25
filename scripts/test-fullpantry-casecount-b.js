#!/usr/bin/env node
// test-fullpantry-casecount-b.js — proof for the sim-fullpantry-casecount-b
// CASE-COUNT instrument (2026-10-24, run fleshout-loop-b-20261025T0030Z).
// Measurement only. Legs:
//   A. Sweep source deltas: 32-seed batches B1-B4 starting 94601
//      (shifted +100 from 94501 after the awayration-size-b collision),
//      exactly-one-batch refusal, 150d refusal, env asserts,
//      call-through registerDeath, meal wrapper, fixed competent,
//      meal-row dedupe (replace, last call wins).
//   B. Analyzer classify() rules on synthetic rows (windows never read;
//      B rule requires BOTH short draw AND short ate).
//   C. Gate (kcal AND fresh), daysSince, pickQuote, CASECOUNT-GO rule
//      (n>=8 AND shareA>=0.80; NO-GO ON SAMPLE when n<8 at cap).
//   D. Runner guards: B1-B4 lists, post-verdict refusal, stopping rule
//      (>= 8 at a batch boundary), 128-seed hard cap.
//   E. Live determinism leg: oneRun(94601, 150) in-process vs the
//      casecount corpus file for that seed (death-row count + cause
//      multiset + mealRowCount + daySeries length + daysAlive identical,
//      no duplicate meal rows). Requires the corpus to exist (run the
//      runner first); leg E skips loudly (exit 0 with SKIP note) only
//      when the corpus file is absent. Leg E performs NO writes.
// Run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=<one batch, comma-separated>
//      DAYS=150 node scripts/test-fullpantry-casecount-b.js
// (SEEDS/DAYS are required because requiring the sweep module runs its
// batch validation at load time, as in prior runs.)
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0;
function ok(name, cond) {
  assert(cond, 'FAILED: ' + name);
  passed++;
  console.log('ok ' + passed + ' - ' + name);
}

const ROOT = path.join(__dirname, '..');
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-fullpantry-casecount-b.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-fullpantry-casecount-b.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-fullpantry-casecount-b.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 batches B1 94601-94632 B2 94633-94664 B3 94665-94696 B4 94697-94728',
  /94601 \+ i/.test(sweepSrc) && /94633 \+ i/.test(sweepSrc) && /94665 \+ i/.test(sweepSrc) && /94697 \+ i/.test(sweepSrc)
  && /BATCHES\.some\(b => isList\(b\)\)/.test(sweepSrc) && !/94421/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));
ok('A9 corpus path fullpantry-casecount-b-corpus', /fullpantry-casecount-b-corpus/.test(sweepSrc) && /fullpantry-casecount-b-competent-s/.test(sweepSrc));

// --- B/C: classifier + gate + quotes (windows never read by classify) ---
const classifySrc = analyzerSrc.slice(analyzerSrc.indexOf('function classify'), analyzerSrc.indexOf('// pickQuote'));
ok('B0 classify never reads windows (#911)', !/sayWin|teleWin/.test(classifySrc));
ok('B0b B rule requires short draw AND short ate (self-fed fix)', /drawn < 0\.25/.test(classifySrc) && /ate.*< 0\.6/.test(classifySrc));
const { classify, pickQuote, daysSince, FULL_KCAL, FULL_FRESH, BATCHES } = require('./analyze-fullpantry-casecount-b.js');
ok('C0 gate constants kcal=8000 fresh=3.0', FULL_KCAL === 8000 && FULL_FRESH === 3.0);
ok('C0b CASECOUNT-GO rule: n>=8 AND shareA>=0.80, NO-GO ON SAMPLE when n<8', /n >= 8 && shareA >= 0\.80/.test(analyzerSrc) && /CASECOUNT-GO/.test(analyzerSrc) && /NO-GO-on-sample/.test(analyzerSrc));
ok('C0c analyzer batches are 4x32 from 94601', BATCHES.length === 4 && BATCHES.every(b => b.length === 32) && BATCHES[0][0] === 94601 && BATCHES[3][31] === 94728);
ok('C0d corpus must be a batch-boundary prefix from 94601', /batch-boundary prefix/.test(analyzerSrc) && /94601/.test(analyzerSrc));
const row = (who, day, awayAtDeath) => ({ who, day, ctx: { awayAtDeath } });
const meals = (vid, days) => days.map(([day, away, ate, drawn, needEst]) => ({ vid, day, away, ate, drawn, needEst }));
ok('B1 A via away-at-death', classify(row('v1', 30, true), meals('v1', [[30, false, 100, 100, 2000]])).cls === 'A');
ok('B2 A via away-share', classify(row('v1', 30, false), meals('v1', [[24, true, 100, 100, 2000], [26, true, 100, 100, 2000], [28, false, 2000, 2000, 2000]])).cls === 'A');
ok('B3 B via genuine short haven meal (drawn+ate short)', classify(row('v1', 30, false), meals('v1', [[29, false, 100, 100, 2000]])).cls === 'B');
ok('B4 NOT B when self-fed (drawn short, ate adequate)', classify(row('v1', 30, false), meals('v1', [[29, false, 2000, 100, 2000]])).cls !== 'B');
ok('B5 C mixed-away', classify(row('v1', 30, false), meals('v1', [[26, true, 100, 100, 2000], [28, false, 2000, 2000, 2000], [29, false, 2000, 2000, 2000]])).sub === 'mixed-away-no-short-haven-draw');
ok('B6 C no-meal-rows', classify(row('v1', 30, false), []).sub === 'no-meal-rows');
ok('B7 C haven-adequate', classify(row('v1', 30, false), meals('v1', [[29, false, 2000, 2000, 2000]])).sub === 'haven-adequate-meals');
const lowHealth = meals('v1', [[24, false, 2000, 2000, 2000]]); lowHealth[0].healthBefore = 20;
ok('B8 C low-health-carryover', classify(row('v1', 30, false), lowHealth).sub === 'low-health-carryover');
const hist = meals('v1', [[10, false, 2000, 2000, 2000], [20, false, 100, 100, 2000], [25, false, 0, 0, 2000]]);
ok('C1 daysSinceAdequate', daysSince(hist, 'v1', 30, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)) === 20);
ok('C2 daysSinceAnyMeal', daysSince(hist, 'v1', 30, m => (m.ate || 0) > 0) === 10);
ok('C3 daysSince none -> null', daysSince(hist, 'v9', 30, () => true) === null);
ok('C4 pickQuote prefers deceased-named line', pickQuote({ whoName: 'Mason', sayWin: ['d20 Village meal: +2215 kcal', 'd20 Mason is hurt'], teleWin: [] }).quote.includes('Mason'));
ok('C5 pickQuote empty windows -> empty quote', pickQuote({ whoName: 'X', sayWin: [], teleWin: [] }).quote === '');

// --- D: runner guards ---
ok('D1 runner carries B1-B4 lists (94601, 94633, 94665, 94697)', /94601/.test(runnerSrc) && /94633/.test(runnerSrc) && /94665/.test(runnerSrc) && /94697/.test(runnerSrc));
ok('D2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('D3 runner stopping rule is >= 8 at a batch boundary', /-ge 8/.test(runnerSrc) && /STOPPING RULE MET/.test(runnerSrc) && /fullpantry_count/.test(runnerSrc));
ok('D4 runner hard cap is 4 batches / 128 seeds', /B1.*B2.*B3.*B4/.test(runnerSrc) && /HARD CAP REACHED/.test(runnerSrc) && /128 seeds/.test(runnerSrc));
ok('D5 runner retries re-run the FULL batch (sweep accepts exactly one batch; missing-only lists are refused)', /always/i.test(runnerSrc) && /full batch/.test(runnerSrc) && !/run_seeds="\$\{miss/.test(runnerSrc));

// --- F (adoption): analyzer report variables are defined ---
ok('F1 analyzer defines batchCounts and countRuleOk (adopt fix for ReferenceError on batch-complete corpora)',
  /const batchCounts/.test(analyzerSrc) && /const countRuleOk/.test(analyzerSrc));

// --- E: live determinism leg (in-memory only) ---
(async () => {
  const corpusFile = path.join(ROOT, 'evidence', '2026-10-24', 'fullpantry-casecount-b-corpus', 'fullpantry-casecount-b-competent-s94601.json');
  if (!fs.existsSync(corpusFile)) {
    console.log('SKIP E - casecount corpus absent (run scripts/run-fullpantry-casecount-b.sh first); static legs A-D still prove the rules');
    console.log(`PASS ${passed} legs (+E skipped, corpus absent)`);
    return;
  }
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.log('SKIP E - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
    console.log(`PASS ${passed} legs (+E skipped, env unset)`);
    return;
  }
  const ref = JSON.parse(fs.readFileSync(corpusFile, 'utf8'));
  const { oneRun } = require('./sweep-fullpantry-casecount-b.js');
  const { perSeed } = await oneRun(94601, 150);
  const causesOf = rows => { const c = {}; for (const r of rows) c[r.cause] = (c[r.cause] || 0) + 1; return JSON.stringify(c); };
  assert.strictEqual(perSeed.deathRows.length, ref.deathRows.length, 'E deathRowCount mismatch vs corpus');
  assert.strictEqual(causesOf(perSeed.deathRows), causesOf(ref.deathRows), 'E death cause multiset mismatch vs corpus');
  assert.strictEqual(perSeed.mealRows.length, ref.mealRows.length, 'E mealRowCount mismatch vs corpus');
  assert.strictEqual(perSeed.daySeries.length, ref.daySeries.length, 'E daySeries length mismatch vs corpus');
  assert.strictEqual(perSeed.daysAlive, ref.daysAlive, 'E daysAlive mismatch vs corpus');
  const seen = new Set();
  for (const m of perSeed.mealRows) {
    const k = m.vid + '|' + m.day;
    assert(!seen.has(k), 'E duplicate meal row ' + k + ' (dedupe failed)');
    seen.add(k);
  }
  for (const d of perSeed.deathRows) {
    for (const k of ['freshDays', 'pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'pantryItemCount', 'unknownKcal0Count', 'pop', 'hungry', 'awayAtDeath']) assert(d.ctx && d.ctx[k] !== undefined, 'E death ctx missing ' + k);
  }
  for (const m of perSeed.mealRows) {
    for (const k of ['vid', 'day', 'away', 'ate', 'drawn', 'fasting', 'hungerBefore', 'hungerAfter', 'healthBefore', 'healthAfter', 'needEst']) assert(m[k] !== undefined, 'E meal row missing ' + k);
  }
  console.log('ok E - live determinism vs corpus (seed 94601, 150d) + dedupe audit');
  console.log(`PASS ${passed + 1} legs`);
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
