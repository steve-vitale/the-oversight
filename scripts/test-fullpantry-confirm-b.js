#!/usr/bin/env node
// test-fullpantry-confirm-b.js — proof for the sim-fullpantry-confirm-b DIAG instrument.
// (2026-10-24, backlog #910 follow-up to sim-pantrystarve-b. Measurement only.)
//
// Legs (all must pass; run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=94421,94422,94423,94424,94425,94426,94427,94428 DAYS=150 node scripts/test-fullpantry-confirm-b.js):
// (SEEDS/DAYS are required because requiring the sweep module runs its
// pilot/EXT/FULL seed-list validation at load time, as in pantrystarve-b.)
//   A. Sweep source deltas: PILOT/EXT/FULL seed refusal, 150d refusal,
//      env asserts, call-through registerDeath, villagerMealDay wrapper,
//      fixed competent, meal-row dedupe (replace, not push).
//   B. Analyzer classify() rules on synthetic rows (windows never read;
//      B rule requires BOTH short draw AND short ate — the self-fed fix).
//   C. Analyzer full-pantry gate (kcal AND fresh), daysSince, pickQuote, CONFIRM-GO rule (n>=8 + shareA>=0.80, no small-sample qualifier).
//   D. Runner guards: pilot+extension lists, post-verdict refusal, <8 rule.
//   E. Live determinism leg: oneRun(94421, 150) in-process, compared
//      against the pilot corpus file for that seed (death-row count +
//      cause multiset + mealRowCount + daySeries length identical +
//      no duplicate meal rows). Requires the pilot corpus to exist
//      (run scripts/run-fullpantry-confirm-b.sh first); leg E skips loudly
//      (exit 0 with SKIP note) only when the corpus file is absent, so
//      the static legs still prove the rules. Leg E performs NO writes.
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
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-fullpantry-confirm-b.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-fullpantry-confirm-b.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-fullpantry-confirm-b.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 seed lists PILOT 94421-94428 + EXT 94429-94436', /94421, 94422, 94423, 94424, 94425, 94426, 94427, 94428/.test(sweepSrc)
  && /94429, 94430, 94431, 94432, 94433, 94434, 94435, 94436/.test(sweepSrc) && /isList\(PILOT\)/.test(sweepSrc) && /isList\(EXT\)/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));
ok('A9 corpus path fullpantry-confirm-b-corpus', /fullpantry-confirm-b-corpus/.test(sweepSrc) && /fullpantry-confirm-b-competent-s/.test(sweepSrc));

// --- B/C: classifier + gate + quotes (windows never read by classify) ---
const classifySrc = analyzerSrc.slice(analyzerSrc.indexOf('function classify'), analyzerSrc.indexOf('// pickQuote'));
ok('B0 classify never reads windows (#911)', !/sayWin|teleWin/.test(classifySrc));
ok('B0b B rule requires short draw AND short ate (self-fed fix)', /drawn < 0\.25/.test(classifySrc) && /ate.*< 0\.6/.test(classifySrc));
const { classify, pickQuote, daysSince, FULL_KCAL, FULL_FRESH } = require('./analyze-fullpantry-confirm-b.js');
ok('C0 gate constants kcal=8000 fresh=3.0', FULL_KCAL === 8000 && FULL_FRESH === 3.0);
ok('C0b CONFIRM-GO rule: n>=8 AND shareA>=0.80, no small-sample qualifier', /n >= 8 && shareA >= 0\.80/.test(analyzerSrc) && /CONFIRM-GO/.test(analyzerSrc) && !/GO-small-sample/.test(analyzerSrc));
ok('C0c CONFIRM verdict prints CONFIRM-GO/NO-GO (not DIAG-GO)', /VERDICT:.*CONFIRM-GO/.test(analyzerSrc));
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
// daysSince
const hist = meals('v1', [[10, false, 2000, 2000, 2000], [20, false, 100, 100, 2000], [25, false, 0, 0, 2000]]);
ok('C1 daysSinceAdequate', daysSince(hist, 'v1', 30, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)) === 20);
ok('C2 daysSinceAnyMeal', daysSince(hist, 'v1', 30, m => (m.ate || 0) > 0) === 10);
ok('C3 daysSince none -> null', daysSince(hist, 'v9', 30, () => true) === null);
// pickQuote: names the deceased, prefers STARVING; empty windows -> ''
ok('C4 pickQuote prefers deceased-named line', pickQuote({ whoName: 'Mason', sayWin: ['d20 Village meal: +2215 kcal', 'd20 Mason is hurt'], teleWin: [] }).quote.includes('Mason'));
ok('C5 pickQuote empty windows -> empty quote', pickQuote({ whoName: 'X', sayWin: [], teleWin: [] }).quote === '');

// --- D: runner guards ---
ok('D1 runner carries PILOT + EXT lists', /94421/.test(runnerSrc) && /94429/.test(runnerSrc) && /94436/.test(runnerSrc));
ok('D2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('D3 runner extension rule is < 8 full-pantry deaths', /-ge 8/.test(runnerSrc) && /fullpantry_count/.test(runnerSrc) && /freshDays.*3\.0/.test(runnerSrc));

// --- E: live determinism leg (in-memory only) ---
(async () => {
  const corpusFile = path.join(ROOT, 'evidence', '2026-10-24', 'fullpantry-confirm-b-corpus', 'fullpantry-confirm-b-competent-s94421.json');
  if (!fs.existsSync(corpusFile)) {
    console.log('SKIP E - pilot corpus absent (run scripts/run-fullpantry-confirm-b.sh first); static legs A-D still prove the rules');
    console.log(`PASS ${passed} legs (+E skipped, corpus absent)`);
    return;
  }
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.log('SKIP E - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
    console.log(`PASS ${passed} legs (+E skipped, env unset)`);
    return;
  }
  const ref = JSON.parse(fs.readFileSync(corpusFile, 'utf8'));
  const { oneRun } = require('./sweep-fullpantry-confirm-b.js');
  const { perSeed } = await oneRun(94421, 150);
  const causesOf = rows => { const c = {}; for (const r of rows) c[r.cause] = (c[r.cause] || 0) + 1; return JSON.stringify(c); };
  assert.strictEqual(perSeed.deathRows.length, ref.deathRows.length, 'E deathRowCount mismatch vs pilot corpus');
  assert.strictEqual(causesOf(perSeed.deathRows), causesOf(ref.deathRows), 'E death cause multiset mismatch vs pilot corpus');
  assert.strictEqual(perSeed.mealRows.length, ref.mealRows.length, 'E mealRowCount mismatch vs pilot corpus');
  assert.strictEqual(perSeed.daySeries.length, ref.daySeries.length, 'E daySeries length mismatch vs pilot corpus');
  assert.strictEqual(perSeed.daysAlive, ref.daysAlive, 'E daysAlive mismatch vs pilot corpus');
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
  console.log('ok E - live determinism vs pilot corpus (seed 94421, 150d) + dedupe audit');
  console.log(`PASS ${passed + 1} legs`);
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
