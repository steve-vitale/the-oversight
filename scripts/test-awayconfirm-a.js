#!/usr/bin/env node
// test-awayconfirm-a.js — proof for the sim-awayconfirm-a
// CASE-COUNT-SIZED CONFIRM instrument (2026-11-07, run fleshout-20261107T1205Z).
// Measurement only. Legs:
//   A. Sweep source deltas: 25-seed batches B1-B4 starting 98000,
//      exactly-one-batch refusal, 150d refusal, env asserts,
//      call-through registerDeath, meal wrapper, fixed competent,
//      meal-row dedupe (replace, last call wins).
//   B. Analyzer classify() rules on synthetic rows (windows never read;
//      B rule requires BOTH short draw AND short ate).
//   C. Gate (kcal AND fresh), daysSince, pickQuote (spiral-beats-name
//      delta), CONFIRM-GO rule (n>=8 AND shareA>=0.80 AND every named
//      mechanism >=2 cases + quoted; NO-GO ON SAMPLE when n<8 at cap;
//      count rule is a verdict gate, not a stopping condition).
//   D. Runner guards: B1-B4 lists, post-verdict refusal, stopping rule
//      (>= 8 at a batch boundary), 100-seed hard cap.
//   F. Analyzer report variables defined (adopt fix); verdict rule gates
//      on countRuleOk + quotedMechanismsOk.
//   G. C1 legs (staged doctored corpora in /tmp scratch, never the repo):
//      actually-run seed in another corpus fails loudly; planned-but-
//      unrun seed passes C1; C1 scans all dates (not just own date).
//   E. Live determinism leg: oneRun(98000, 150) in-process vs the
//      awayconfirm-a corpus file for that seed (death-row count + cause
//      multiset + mealRowCount + daySeries length + daysAlive identical,
//      no duplicate meal rows). Requires the corpus to exist (run the
//      runner first); leg E skips loudly (exit 0 with SKIP note) only
//      when the corpus file is absent. Leg E performs NO writes.
// Run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=<one batch, comma-separated>
//      DAYS=150 node scripts/test-awayconfirm-a.js
// (SEEDS/DAYS are required because requiring the sweep module runs its
// batch validation at load time, as in prior runs.)
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

let passed = 0;
function ok(name, cond) {
  assert(cond, 'FAILED: ' + name);
  passed++;
  console.log('ok ' + passed + ' - ' + name);
}

const ROOT = path.join(__dirname, '..');
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-awayconfirm-a.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-awayconfirm-a.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-awayconfirm-a.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 batches B1 98000-98024 B2 98025-98049 B3 98050-98074 B4 98075-98099 (25 seeds each)',
  /98000 \+ i/.test(sweepSrc) && /98025 \+ i/.test(sweepSrc) && /98050 \+ i/.test(sweepSrc) && /98075 \+ i/.test(sweepSrc)
  && /length: 25/.test(sweepSrc)
  && /BATCHES\.some\(b => isList\(b\)\)/.test(sweepSrc) && !/94421/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));
ok('A9 corpus path awayconfirm-a-corpus', /awayconfirm-a-corpus/.test(sweepSrc) && /awayconfirm-a-competent-s/.test(sweepSrc));

// --- B/C: classifier + gate + quotes (windows never read by classify) ---
const classifySrc = analyzerSrc.slice(analyzerSrc.indexOf('function classify'), analyzerSrc.indexOf('// pickQuote'));
ok('B0 classify never reads windows (#911)', !/sayWin|teleWin/.test(classifySrc));
ok('B0b B rule requires short draw AND short ate (self-fed fix)', /drawn < 0\.25/.test(classifySrc) && /ate.*< 0\.6/.test(classifySrc));
const { classify, pickQuote, daysSince, FULL_KCAL, FULL_FRESH, BATCHES } = require('./analyze-awayconfirm-a.js');
ok('C0 gate constants kcal=8000 fresh=3.0', FULL_KCAL === 8000 && FULL_FRESH === 3.0);
ok('C0b CONFIRM-GO rule: n>=8 AND shareA>=0.80 AND countRuleOk AND quotedMechanismsOk; NO-GO ON SAMPLE when n<8', /const go = n >= 8 && shareA >= 0\.80 && countRuleOk && quotedMechanismsOk/.test(analyzerSrc) && /CONFIRM-GO/.test(analyzerSrc) && /NO-GO-on-sample/.test(analyzerSrc));
ok('C0b2 count rule is a verdict gate (named mechanism A/B >= 2), not a stopping condition', /countRuleOk = countRuleNote/.test(analyzerSrc) && /count rule is a verdict gate, NOT a stopping condition/.test(analyzerSrc));
ok('C0c analyzer batches are 4x25 from 98000', BATCHES.length === 4 && BATCHES.every(b => b.length === 25) && BATCHES[0][0] === 98000 && BATCHES[3][24] === 98099);
ok('C0d corpus must be a batch-boundary prefix from 98000 (25/50/75/100 seeds)', /batch-boundary prefix/.test(analyzerSrc) && /98000/.test(analyzerSrc) && /seeds\.length % 25 !== 0/.test(analyzerSrc) && /seeds\.length > 100/.test(analyzerSrc));
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
ok('C4 pickQuote prefers a spiral/STARVING line over a name-only barter beat (confirm-b metric-review delta)', pickQuote({ whoName: 'Mason', sayWin: ['d14 Mason traded something with someone for something else.', 'd14 STARVING: health and energy falling. The spiral has started.'], teleWin: [] }).quote.includes('STARVING'));
ok('C4b pickQuote still prefers a name-bearing line when no spiral line exists', pickQuote({ whoName: 'Mason', sayWin: ['d20 Village meal: +2215 kcal', 'd20 Mason is hurt'], teleWin: [] }).quote.includes('Mason'));
ok('C4c pickQuote prefers a spiral line that also names the deceased over a spiral line alone', pickQuote({ whoName: 'Mason', sayWin: ['d14 STARVING: health and energy falling. The spiral has started.', 'd14 Mason is STARVING: health and energy falling.'], teleWin: [] }).quote.includes('Mason is STARVING'));
ok('C5 pickQuote empty windows -> empty quote', pickQuote({ whoName: 'X', sayWin: [], teleWin: [] }).quote === '');

// --- D: runner guards ---
ok('D1 runner carries B1-B4 lists (98000, 98025, 98050, 98075)', /98000/.test(runnerSrc) && /98025/.test(runnerSrc) && /98050/.test(runnerSrc) && /98075/.test(runnerSrc));
ok('D2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('D3 runner stopping rule is >= 8 at a batch boundary', /-ge 8/.test(runnerSrc) && /STOPPING RULE MET/.test(runnerSrc) && /fullpantry_count/.test(runnerSrc));
ok('D4 runner hard cap is 4 batches / 100 seeds', /B1.*B2.*B3.*B4/.test(runnerSrc) && /HARD CAP REACHED/.test(runnerSrc) && /100 seeds/.test(runnerSrc));
ok('D5 runner retries re-run the FULL batch (sweep accepts exactly one batch; missing-only lists are refused)', /always/i.test(runnerSrc) && /full batch/.test(runnerSrc) && !/run_seeds="\$\{miss/.test(runnerSrc));
ok('D6 runner stopping rule stops at n>=8 at a batch boundary; count rule is a verdict gate (runner text)', /for BATCH in "B1" "B2" "B3" "B4"/.test(runnerSrc) && /STOPPING RULE MET/.test(runnerSrc) && /count rule .* VERDICT gate/.test(runnerSrc));

// --- F (adoption): analyzer report variables are defined ---
ok('F1 analyzer defines batchCounts and countRuleOk (adopt fix for ReferenceError on batch-complete corpora)',
  /const batchCounts/.test(analyzerSrc) && /const countRuleOk/.test(analyzerSrc));
ok('F2 analyzer verdict gates on countRuleOk + quotedMechanismsOk (confirm rule, not casecount rule)',
  /const go = n >= 8 && shareA >= 0\.80 && countRuleOk && quotedMechanismsOk/.test(analyzerSrc)
  && /quotedMechanismsOk = \['A', 'B'\]/.test(analyzerSrc) && /countRuleNote = \['A', 'B'\]/.test(analyzerSrc));

// --- G: C1 legs (staged doctored corpora in /tmp scratch, never the repo) ---
// Stage a synthetic 25-seed B1 corpus (minimal valid per-seed files, zero
// deaths) plus a doctored "other corpus" dir under a scratch evidence root.
// G1: the other corpus carries an ACTUALLY-RUN seed (98000) -> analyzer
//   exits 2 naming the C1 hit. G2: the other corpus carries only a
//   PLANNED-but-unrun seed (98050, B3) -> C1 passes and the analyzer
//   completes (exit 0, NO-GO-on-sample on the zero-death corpus).
// G3: C1 scans all dates — the doctored dir sits under a different
//   dated folder than the staged corpus, and G1 still fires.
(function c1Legs() {
  const scratch = path.join('/tmp', 'awayconfirm-a-c1test-' + process.pid);
  const stagedCorpus = path.join(scratch, 'corpus');
  const stagedRoot = path.join(scratch, 'evidence');
  const otherCorpus = path.join(stagedRoot, '2026-10-24', 'some-other-corpus');
  fs.mkdirSync(stagedCorpus, { recursive: true });
  fs.mkdirSync(otherCorpus, { recursive: true });
  for (let s = 98000; s <= 98024; s++) {
    fs.writeFileSync(path.join(stagedCorpus, `awayconfirm-a-competent-s${s}.json`),
      JSON.stringify({ seed: s, policy: 'competent', plentydepri: 1, depositgate: 1, daysAlive: 150, deathRows: [], mealRows: [], daySeries: [], national: false, win: false, waveReach: [1] }));
  }
  const runAnalyzer = (otherSeed) => {
    for (const f of fs.readdirSync(otherCorpus)) fs.unlinkSync(path.join(otherCorpus, f));
    fs.writeFileSync(path.join(otherCorpus, 'other-competent-s' + otherSeed + '.json'),
      JSON.stringify({ seed: otherSeed, policy: 'competent', plentydepri: 1, depositgate: 1, daysAlive: 150, deathRows: [], mealRows: [], daySeries: [] }));
    try {
      const out = execFileSync('node', [path.join(__dirname, 'analyze-awayconfirm-a.js'), stagedCorpus, 'full'],
        { env: { ...process.env, C1_EVIDENCE_DIR: stagedRoot }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      return { code: 0, out: String(out) };
    } catch (e) {
      return { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') };
    }
  };
  const g1 = runAnalyzer(98000);
  ok('G1 C1 fails loudly on an actually-run seed in another corpus (exit 2, names 98000)', g1.code === 2 && /C1 hit: seed 98000/.test(g1.out));
  const g2 = runAnalyzer(98050);
  ok('G2 C1 passes on a planned-but-unrun seed (98050 in B3, not run) and the analyzer completes', g2.code === 0 && !/C1 hit/.test(g2.out) && /NO-GO-on-sample/.test(g2.out));
  ok('G3 C1 scans dated dirs other than the corpus date (doctored dir is 2026-10-24)', g1.code === 2 && /C1 hit/.test(g1.out));
  fs.rmSync(scratch, { recursive: true, force: true });
})();

// --- E: live determinism leg (in-memory only) ---
(async () => {
  const corpusFile = path.join(ROOT, 'evidence', '2026-11-07', 'awayconfirm-a-corpus', 'awayconfirm-a-competent-s98000.json');
  if (!fs.existsSync(corpusFile)) {
    console.log('SKIP E - awayconfirm-a corpus absent (run scripts/run-awayconfirm-a.sh first); static legs A-D/F/G still prove the rules');
    console.log(`PASS ${passed} legs (+E skipped, corpus absent)`);
    return;
  }
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.log('SKIP E - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
    console.log(`PASS ${passed} legs (+E skipped, env unset)`);
    return;
  }
  const ref = JSON.parse(fs.readFileSync(corpusFile, 'utf8'));
  const { oneRun } = require('./sweep-awayconfirm-a.js');
  const { perSeed } = await oneRun(98000, 150);
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
  console.log('ok E - live determinism vs corpus (seed 98000, 150d) + dedupe audit');
  console.log(`PASS ${passed + 1} legs`);
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
