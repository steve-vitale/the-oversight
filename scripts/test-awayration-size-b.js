#!/usr/bin/env node
// test-awayration-size-b.js — proof for the sim-awayration-size-b DIAG instrument.
// (2026-10-24, backlog #942 follow-up to sim-fullpantry-diag-b. Measurement only.)
//
// Run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=94501,94502,94503,94504,94505,94506,94507,94508 DAYS=150 node scripts/test-awayration-size-b.js
// (SEEDS/DAYS are required because requiring the sweep module runs its
// PILOT/EXT/FULL seed-list validation at load time, as in fullpantry-b.)
//
// Legs (all must pass):
//   A. Sweep source deltas: PILOT/EXT/FULL seed refusal, 150d refusal,
//      env asserts, call-through registerDeath, villagerMealDay wrapper,
//      packKcal reseed-only capture + first-wins dedupe, fixed competent,
//      meal-row dedupe (replace, not push), corpus path.
//   B. Analyzer helpers on synthetic rows: packNeedStats quartiles,
//      streak increment/reset/gap, trailingAwayStreak, validatePackRows
//      (misaligned + duplicate detection), adequacy boundary, daysSince,
//      pickQuote, classify never reading windows.
//   C. Runner guards: pilot+extension lists, post-verdict refusal,
//      extension rule < 200 away days via AWAY_DAYS_TOTAL, whole-band retry.
//   D. Live seed-list refusal: spawning the sweep with a bad seed list
//      exits 2 before any sim runs.
//   E. Live determinism leg: oneRun(94501, 150) re-run produces a
//      byte-identical per-seed corpus file vs the pilot corpus.
//      Requires the pilot corpus to exist (run scripts/run-awayration-size-b.sh
//      first); leg E skips loudly (exit 0 with SKIP note) only when the
//      corpus file is absent, so the static legs still prove the rules.
//      Leg E performs NO writes to the corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

let passed = 0;
function ok(name, cond) {
  assert(cond, 'FAILED: ' + name);
  passed++;
  console.log('ok ' + passed + ' - ' + name);
}

const ROOT = path.join(__dirname, '..');
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-awayration-size-b.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-awayration-size-b.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-awayration-size-b.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 seed lists PILOT 94501-94508 + EXT 94509-94516', /94501, 94502, 94503, 94504, 94505, 94506, 94507, 94508/.test(sweepSrc)
  && /94509, 94510, 94511, 94512, 94513, 94514, 94515, 94516/.test(sweepSrc) && /isList\(PILOT\)/.test(sweepSrc) && /isList\(EXT\)/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 packKcal wrapper records ONLY at reseed (pre-call stale/absent)', /oPack = Game\.packKcal/.test(sweepSrc) && /isReseed = !pre \|\| pre\.day !== day/.test(sweepSrc));
ok('A9 pack first-wins dedupe (later same-day call skips, never overwrites)', /W\.packRows\.some/.test(sweepSrc) && /W\.packSkip\+\+/.test(sweepSrc) && /packDay/.test(sweepSrc));
ok('A10 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));
ok('A11 corpus path awayration-size-b-corpus', /awayration-size-b-corpus/.test(sweepSrc) && /awayration-size-b-competent-s/.test(sweepSrc));

// --- B: analyzer helpers on synthetic rows ---
const { classify, pickQuote, daysSince, isAdequate, packNeedStats, streaksForMeals, trailingAwayStreak, validatePackRows, PILOT, EXT } = require('./analyze-awayration-size-b.js');
ok('B0 analyzer seed lists', JSON.stringify(PILOT) === JSON.stringify([94501, 94502, 94503, 94504, 94505, 94506, 94507, 94508])
  && JSON.stringify(EXT) === JSON.stringify([94509, 94510, 94511, 94512, 94513, 94514, 94515, 94516]));
const classifySrc = analyzerSrc.slice(analyzerSrc.indexOf('function classify'), analyzerSrc.indexOf('function pickQuote'));
ok('B0b classify never reads windows (#911)', !/sayWin|teleWin/.test(classifySrc));
ok('B1 adequacy boundary: ate == 0.6*need is adequate', isAdequate({ ate: 1200, needEst: 2000 }) && !isAdequate({ ate: 1199, needEst: 2000 }));
const stats = packNeedStats([0.4, 0.5, 0.6, 0.7, 0.8]);
ok('B2 packNeedStats median/q1/q3/share<0.6', stats.n === 5 && stats.median === 0.6 && stats.q1 === 0.5 && stats.q3 === 0.7 && Math.abs(stats.shareLt06 - 0.4) < 1e-9);
const statsEven = packNeedStats([0.4, 0.8]);
ok('B3 packNeedStats even-n median averages middles', Math.abs(statsEven.median - 0.6) < 1e-9);
ok('B4 packNeedStats empty -> nulls', packNeedStats([]).n === 0 && packNeedStats([]).median === null);
const meals = (vid, days) => days.map(([day, away, ate, needEst]) => ({ vid, day, away, ate, needEst }));
const streakRows = meals('v1', [[1, true, 100, 2000], [2, true, 100, 2000], [3, false, 2000, 2000], [4, true, 100, 2000], [5, true, 100, 2000], [6, true, 100, 2000]]);
ok('B5 streak resets on haven row', streaksForMeals(streakRows).max === 3);
const gapRows = meals('v1', [[1, true, 100, 2000], [2, true, 100, 2000], [4, true, 100, 2000]]);
ok('B6 streak resets on calendar gap', streaksForMeals(gapRows).max === 2);
const adeqRows = meals('v1', [[1, true, 100, 2000], [2, true, 2000, 2000], [3, true, 100, 2000]]);
ok('B7 streak resets on adequate row', streaksForMeals(adeqRows).max === 1);
const trailRows = meals('v1', [[10, true, 2000, 2000], [11, true, 100, 2000], [12, true, 100, 2000], [13, true, 100, 2000]]);
ok('B8 trailingAwayStreak counts back to adequate row', trailingAwayStreak(trailRows, 13) === 3);
ok('B9 trailingAwayStreak 0 when last day adequate', trailingAwayStreak(meals('v1', [[12, true, 2000, 2000]]), 12) === 0);
ok('B10 trailingAwayStreak 0 with no rows', trailingAwayStreak([], 30) === 0);
ok('B11 validatePackRows flags misaligned row', validatePackRows([{ vid: 'v1', day: 5, packDay: 4 }]).misaligned === 1);
ok('B12 validatePackRows flags duplicate key', validatePackRows([{ vid: 'v1', day: 5, packDay: 5 }, { vid: 'v1', day: 5, packDay: 5 }]).duplicates === 1);
ok('B13 validatePackRows clean rows pass', (() => { const v = validatePackRows([{ vid: 'v1', day: 5, packDay: 5 }]); return v.misaligned === 0 && v.duplicates === 0; })());
const hist = meals('v1', [[10, false, 2000, 2000], [20, false, 100, 2000], [25, false, 0, 2000]]);
ok('B14 daysSinceAdequate', daysSince(hist, 'v1', 30, m => (m.ate || 0) >= 0.6 * (m.needEst || 2000)) === 20);
ok('B15 pickQuote prefers deceased-named line', pickQuote({ whoName: 'Mason', sayWin: ['d20 Village meal: +2215 kcal', 'd20 Mason is hurt'], teleWin: [] }).quote.includes('Mason'));
ok('B16 pickQuote empty windows -> empty quote', pickQuote({ whoName: 'X', sayWin: [], teleWin: [] }).quote === '');
ok('B17 classify A via away-at-death', classify({ who: 'v1', day: 30, ctx: { awayAtDeath: true } }, meals('v1', [[30, false, 100, 2000]])).cls === 'A');

// --- C: runner guards ---
ok('C1 runner carries PILOT + EXT lists', /94501/.test(runnerSrc) && /94509/.test(runnerSrc) && /94516/.test(runnerSrc));
ok('C2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('C3 runner extension rule is < 200 away days via analyzer', /-ge 200/.test(runnerSrc) && /AWAY_DAYS_TOTAL/.test(runnerSrc) && /pilot_away_days/.test(runnerSrc));
ok('C4 runner checks pack rows (packDay == day, deduped)', /packDay.*==.*day/.test(runnerSrc) && /duplicate pack row/.test(runnerSrc));
ok('C5 runner retries whole band, not partial lists (sweep guard)', /WHOLE phase band|whole band/.test(runnerSrc) && /sweep-awayration-size-b\.js/.test(runnerSrc));

// --- D: live seed-list refusal ---
{
  const r = spawnSync('node', [path.join(__dirname, 'sweep-awayration-size-b.js')], {
    env: { ...process.env, PLENTYDEPRI: '1', DEPOSITGATE: '1', SEEDS: '1,2,3', DAYS: '150' },
    encoding: 'utf8', timeout: 60000,
  });
  ok('D1 sweep refuses a non-PILOT/EXT/FULL seed list before simming', r.status === 2 && /exactly PILOT/.test((r.stderr || '') + (r.stdout || '')));
}

// --- E: live determinism leg (byte-identical corpus file) ---
(async () => {
  const corpusFile = path.join(ROOT, 'evidence', '2026-10-24', 'awayration-size-b-corpus', 'awayration-size-b-competent-s94501.json');
  if (!fs.existsSync(corpusFile)) {
    console.log('SKIP E - pilot corpus absent (run scripts/run-awayration-size-b.sh first); static legs A-D still prove the rules');
    console.log(`PASS ${passed} legs (+E skipped, corpus absent)`);
    return;
  }
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.log('SKIP E - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
    console.log(`PASS ${passed} legs (+E skipped, env unset)`);
    return;
  }
  const refBytes = fs.readFileSync(corpusFile, 'utf8');
  const ref = JSON.parse(refBytes);
  const { oneRun } = require('./sweep-awayration-size-b.js');
  const { perSeed } = await oneRun(94501, 150);
  assert.strictEqual(JSON.stringify(perSeed), refBytes, 'E byte-identical corpus mismatch: re-run of seed 94501 differs from the pilot corpus file');
  assert.strictEqual(perSeed.deathRows.length, ref.deathRows.length, 'E deathRowCount mismatch vs pilot corpus');
  assert.strictEqual(perSeed.mealRows.length, ref.mealRows.length, 'E mealRowCount mismatch vs pilot corpus');
  assert.strictEqual(perSeed.packRows.length, ref.packRows.length, 'E packRowCount mismatch vs pilot corpus');
  const seen = new Set();
  for (const m of perSeed.mealRows) {
    const k = m.vid + '|' + m.day;
    assert(!seen.has(k), 'E duplicate meal row ' + k + ' (dedupe failed)');
    seen.add(k);
  }
  const pseen = new Set();
  for (const p of perSeed.packRows) {
    const k = p.vid + '|' + p.day;
    assert(!pseen.has(k), 'E duplicate pack row ' + k + ' (first-wins failed)');
    assert(p.packDay === p.day, 'E misaligned pack row ' + k + ' (dawn alignment failed)');
    pseen.add(k);
  }
  for (const d of perSeed.deathRows) {
    for (const k of ['freshDays', 'pantryKcal', 'pantryFreshKcal', 'pantrySpoiledKcal', 'pantryItemCount', 'unknownKcal0Count', 'pop', 'hungry', 'awayAtDeath']) assert(d.ctx && d.ctx[k] !== undefined, 'E death ctx missing ' + k);
  }
  for (const m of perSeed.mealRows) {
    for (const k of ['vid', 'day', 'away', 'ate', 'drawn', 'fasting', 'hungerBefore', 'hungerAfter', 'healthBefore', 'healthAfter', 'needEst']) assert(m[k] !== undefined, 'E meal row missing ' + k);
  }
  for (const p of perSeed.packRows) {
    for (const k of ['vid', 'day', 'packKcal', 'packDay', 'needEst', 'hungerAtPack', 'temper', 'pantryKcalAtPack']) assert(p[k] !== undefined && p[k] !== null || k === 'hungerAtPack' || k === 'temper' || k === 'pantryKcalAtPack', 'E pack row missing ' + k);
  }
  console.log('ok E - live determinism: byte-identical corpus file (seed 94501, 150d) + dedupe/alignment audits');
  console.log(`PASS ${passed + 1} legs`);
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
