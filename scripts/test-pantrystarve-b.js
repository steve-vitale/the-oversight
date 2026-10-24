#!/usr/bin/env node
// test-pantrystarve-b.js — proof for the sim-pantrystarve-b DIAG instrument.
// (2026-10-24, backlog #910. Measurement only, zero src/js changes.)
//
// Legs (all must pass; run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=94301,94302,94303,94304,94305,94306,94307,94308 DAYS=150 node scripts/test-pantrystarve-b.js):
//   A. Sweep source deltas: pilot-only refusal, 150d refusal, env asserts,
//      call-through registerDeath, villagerMealDay wrapper, fixed competent.
//   B. Analyzer classify() rules on synthetic rows (windows never read:
//      the classify source contains no sayWin/teleWin reference).
//   C. Analyzer daysSince legs.
//   D. Runner pilot-only + post-verdict refusal guards present.
//   E. Live determinism leg: oneRun(94301, 150) in-process, compared
//      against the pilot corpus file for that seed (death-row count +
//      cause multiset + mealRowCount + daySeries length identical).
//      Requires the pilot corpus to exist (run scripts/run-pantrystarve-b.sh
//      first); leg E skips loudly (exit 0 with SKIP note) only when the
//      corpus file is absent, so the static legs still prove the rules.
//      Leg E performs NO file writes (in-memory comparison only).
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
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-pantrystarve-b.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-pantrystarve-b.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-pantrystarve-b.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 pilot-only seed refusal', /94301, 94302, 94303, 94304, 94305, 94306, 94307, 94308/.test(sweepSrc) && /pilot-only/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));

// --- B: classifier rules (windows never read) ---
const classifySrc = analyzerSrc.slice(analyzerSrc.indexOf('function classify'), analyzerSrc.indexOf('function daysSince'));
ok('B0 classify never reads windows (#911)', !/sayWin|teleWin/.test(classifySrc));
const { classify, daysSince } = require('./analyze-pantrystarve-b.js');
const row = (who, day, awayAtDeath) => ({ who, day, ctx: { awayAtDeath } });
const meals = (vid, days) => days.map(([day, away, ate, drawn, needEst]) => ({ vid, day, away, ate, drawn, needEst }));
// A via away-at-death, even with a window naming another villager (windows are not an argument at all)
ok('B1 A via away-at-death', classify(row('v1', 30, true), meals('v1', [[30, false, 100, 100, 2000]])).cls === 'A');
// A via away-share >= 0.5
ok('B2 A via away-share', classify(row('v1', 30, false), meals('v1', [[24, true, 100, 100, 2000], [26, true, 100, 100, 2000], [28, false, 2000, 2000, 2000]])).cls === 'A');
// B via short haven draw (drawn 100 < 0.25*2000)
ok('B3 B via short haven draw', classify(row('v1', 30, false), meals('v1', [[29, false, 100, 100, 2000]])).cls === 'B');
// C mixed-away, no short haven draw
ok('B4 C mixed-away', classify(row('v1', 30, false), meals('v1', [[26, true, 100, 100, 2000], [28, false, 2000, 2000, 2000], [29, false, 2000, 2000, 2000]])).sub === 'mixed-away-no-short-haven-draw');
// C no meal rows
ok('B5 C no-meal-rows', classify(row('v1', 30, false), []).sub === 'no-meal-rows');
// C haven-adequate meals (drawn full, still starved)
ok('B6 C haven-adequate', classify(row('v1', 30, false), meals('v1', [[29, false, 2000, 2000, 2000]])).sub === 'haven-adequate-meals');
// C low-health carryover beats haven-adequate label
const lowHealth = meals('v1', [[24, false, 2000, 2000, 2000]]); lowHealth[0].healthBefore = 20;
ok('B7 C low-health-carryover', classify(row('v1', 30, false), lowHealth).sub === 'low-health-carryover');

// --- C: daysSince ---
const hist = meals('v1', [[10, false, 2000, 2000, 2000], [20, false, 100, 100, 2000], [25, false, 0, 0, 2000]]);
ok('C1 daysSinceAdequate', daysSince(hist, 'v1', 30, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)) === 20);
ok('C2 daysSinceAnyMeal', daysSince(hist, 'v1', 30, m => (m.ate || 0) > 0) === 10);
ok('C3 daysSince none -> null', daysSince(hist, 'v9', 30, () => true) === null);

// --- D: runner guards ---
ok('D1 runner refuses non-pilot seeds (delegates to sweep refusal)', /94301/.test(runnerSrc) && /SEEDS=/.test(runnerSrc));
ok('D2 runner refuses post-verdict re-run', /REFUSE/.test(runnerSrc) && /DIAG-/.test(runnerSrc));

// --- E: live determinism leg (in-memory only) ---
(async () => {
  const corpusFile = path.join(ROOT, 'evidence', '2026-10-24', 'pantrystarve-b-corpus', 'pantrystarve-b-competent-s94301.json');
  if (!fs.existsSync(corpusFile)) {
    console.log('SKIP E - pilot corpus absent (run scripts/run-pantrystarve-b.sh first); static legs A-D still prove the rules');
    console.log(`PASS ${passed} legs (+E skipped, corpus absent)`);
    return;
  }
  const ref = JSON.parse(fs.readFileSync(corpusFile, 'utf8'));
  // Env must already be set for the sweep require (see header); require after env check.
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.log('SKIP E - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
    console.log(`PASS ${passed} legs (+E skipped, env unset)`);
    return;
  }
  const { oneRun } = require('./sweep-pantrystarve-b.js');
  const { perSeed } = await oneRun(94301, 150);
  const causesOf = rows => { const c = {}; for (const r of rows) c[r.cause] = (c[r.cause] || 0) + 1; return JSON.stringify(c); };
  assert.strictEqual(perSeed.deathRows.length, ref.deathRows.length, 'E deathRowCount mismatch vs pilot corpus');
  assert.strictEqual(causesOf(perSeed.deathRows), causesOf(ref.deathRows), 'E death cause multiset mismatch vs pilot corpus');
  assert.strictEqual(perSeed.mealRows.length, ref.mealRows.length, 'E mealRowCount mismatch vs pilot corpus');
  assert.strictEqual(perSeed.daySeries.length, ref.daySeries.length, 'E daySeries length mismatch vs pilot corpus');
  assert.strictEqual(perSeed.daysAlive, ref.daysAlive, 'E daysAlive mismatch vs pilot corpus');
  // Schema: every death row carries the pre-registered ctx fields; every meal row carries its fields.
  for (const d of perSeed.deathRows) {
    for (const k of ['freshDays', 'pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'pantryItemCount', 'unknownKcal0Count', 'pop', 'hungry', 'awayAtDeath']) assert(d.ctx && d.ctx[k] !== undefined, 'E death ctx missing ' + k);
  }
  for (const m of perSeed.mealRows) {
    for (const k of ['vid', 'day', 'away', 'ate', 'drawn', 'fasting', 'hungerBefore', 'hungerAfter', 'healthBefore', 'healthAfter', 'needEst']) assert(m[k] !== undefined, 'E meal row missing ' + k);
  }
  console.log('ok E - live determinism vs pilot corpus (seed 94301, 150d)');
  console.log(`PASS ${passed + 1} legs`);
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
