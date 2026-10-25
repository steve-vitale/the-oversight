#!/usr/bin/env node
// test-packtail-b.js — proof for the sim-packtail-b TAIL PACK re-try.
// (2026-10-25, oversight-flesh-out-loop-b; axis food-economy.)
//
// Run: PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=94901,...,94908 DAYS=150 node scripts/test-packtail-b.js
// (SEEDS/DAYS are required because requiring the sweep module runs its
// BAND seed-list validation at load time, as in prior awayration arms.)
//
// Legs (all must pass):
//   A. Sweep source deltas: BAND 94901-94908 refusal, 150d refusal,
//      env asserts, call-through registerDeath, villagerMealDay wrapper,
//      packKcal reseed-only capture + first-wins dedupe, packMeal wrapper
//      (want/poolAtMeal/take, reads only, no RNG), fixed competent,
//      meal-row dedupe (replace, not push), corpus path.
//   B. Analyzer helpers on synthetic rows: statsOf quartiles/mean,
//      streaks, trailingAwayStreak, validatePackRows, classifyBinding
//      (binding iff dawn pack < dayWant; coverage = drawn/want),
//      banned-band guard (pilot never intersects banned bands).
//   C. Runner guards: BAND list, two phases (baseline|armed),
//      post-verdict refusal, whole-band retry, analyzer + panel attempt
//      on the armed phase.
//   D. Live seed-list refusal: spawning the sweep with a bad seed list
//      exits 2 before any sim runs.
//   E. Live game-code legs (godpath lib, seeded): floor-only top-up on a
//      binding day, non-binding meal unchanged (pantry untouched),
//      theft shape (victim short by exactly the stolen amount on
//      divisible items), empty-pantry meal unchanged, second same-day
//      meal draws no second top-up, packKcal alone never tops up
//      (dawnKcal recorded, topUpDone false).
//   F. Live determinism leg (RUNS FIRST, before any other game load):
//      oneRun(94901, 150) re-run produces a byte-identical per-seed
//      corpus file vs the ARMED band corpus. Requires the armed corpus
//      to exist (run the armed phase first); leg F skips loudly (exit 0
//      with SKIP note) only when the corpus file is absent, so the
//      other legs still prove the rules. Leg F performs NO writes to
//      the corpus. ORDER: F before E — a prior godpath load leaks a
//      foreign RNG stream into the sweep's module-captured Math.random
//      and the re-run diverges.
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
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-awayration-packtail-b.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-awayration-packtail-b.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-awayration-packtail-b.sh'), 'utf8');
const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 seed list BAND 94901-94908', /const BAND = \[94901/.test(sweepSrc) && /94908\]/.test(sweepSrc) && /isList\(BAND\)/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 packKcal wrapper records ONLY at reseed (pre-call stale/absent)', /oPack = Game\.packKcal/.test(sweepSrc) && /isReseed = !pre \|\| pre\.day !== day/.test(sweepSrc));
ok('A9 pack first-wins dedupe (later same-day call skips, never overwrites)', /W\.packRows\.some/.test(sweepSrc) && /W\.packSkip\+\+/.test(sweepSrc) && /packDay/.test(sweepSrc));
ok('A10 packMeal wrapper records want/poolAtMeal/take, calls through', /oPackMeal = Game\.packMeal/.test(sweepSrc) && /poolAtMeal = Game\.packKcal\(vid\)/.test(sweepSrc) && /oPackMeal\.apply\(this, arguments\)/.test(sweepSrc) && /packMealRows/.test(sweepSrc));
ok('A11 packMeal wrapper draws nothing (no pantryDraw/packSpend in wrapper)', (() => {
  const i = sweepSrc.indexOf('oPackMeal = Game.packMeal');
  const seg = sweepSrc.slice(i, sweepSrc.indexOf('const policy = Object.assign', i));
  return !/pantryDraw|packSpend/.test(seg);
})());
ok('A12 corpus path sim-packtail-b-corpus + packtail-b filenames', /sim-packtail-b-corpus/.test(sweepSrc) && /packtail-b-competent-s/.test(sweepSrc));

// --- B: analyzer helpers on synthetic rows ---
const { isAdequate, statsOf, validatePackRows, streaksForMeals, trailingAwayStreak, classifyBinding, BAND, BANNED } = require('./analyze-awayration-packtail-b.js');
ok('B0 analyzer seed list BAND 94901-94908', JSON.stringify(BAND) === JSON.stringify([94901, 94902, 94903, 94904, 94905, 94906, 94907, 94908]));
ok('B0b pilot band never intersects banned bands', !BAND.some(s => BANNED.includes(s)) && BANNED.includes(94801) && BANNED.includes(94701) && BANNED.includes(94501));
ok('B1 adequacy boundary: ate == 0.6*need is adequate', isAdequate({ ate: 1200, needEst: 2000 }) && !isAdequate({ ate: 1199, needEst: 2000 }));
const st = statsOf([0.4, 0.5, 0.6, 0.7, 0.8]);
ok('B2 statsOf median/q1/q3/mean/share==1.0', st.n === 5 && st.median === 0.6 && st.q1 === 0.5 && st.q3 === 0.7 && Math.abs(st.mean - 0.6) < 1e-9 && st.shareEq1 === 0);
const stEven = statsOf([0.4, 0.8]);
ok('B3 statsOf even-n median averages middles', Math.abs(stEven.median - 0.6) < 1e-9);
ok('B4 statsOf empty -> nulls', statsOf([]).n === 0 && statsOf([]).median === null);
const meals = (vid, days) => days.map(([day, away, ate, needEst]) => ({ vid, day, away, ate, needEst }));
ok('B5 streak resets on haven row', streaksForMeals(meals('v1', [[1, true, 100, 2000], [2, true, 100, 2000], [3, false, 2000, 2000], [4, true, 100, 2000]])).max === 2);
ok('B6 streak resets on calendar gap', streaksForMeals(meals('v1', [[1, true, 100, 2000], [2, true, 100, 2000], [4, true, 100, 2000]])).max === 2);
ok('B7 trailingAwayStreak counts back to adequate row', trailingAwayStreak(meals('v1', [[10, true, 2000, 2000], [11, true, 100, 2000], [12, true, 100, 2000]]), 12) === 2);
ok('B8 validatePackRows flags misaligned + duplicate', validatePackRows([{ vid: 'v1', day: 5, packDay: 4 }]).misaligned === 1 && validatePackRows([{ vid: 'v1', day: 5, packDay: 5 }, { vid: 'v1', day: 5, packDay: 5 }]).duplicates === 1);
ok('B9 classifyBinding: binding iff dawn < want, coverage = drawn/want', (() => {
  const b = classifyBinding(500, 1200, 1200);
  const nb = classifyBinding(1500, 1200, 1200);
  const eq = classifyBinding(1200, 1200, 1200);
  return b.binding === true && b.coverage === 1 && nb.binding === false && eq.binding === false;
})());
ok('B10 classifyBinding: partial coverage on an untopped binding day', classifyBinding(500, 1200, 500).binding === true && Math.abs(classifyBinding(500, 1200, 500).coverage - 500 / 1200) < 1e-9);

// --- C: runner guards ---
ok('C1 runner carries BAND list 94901-94908', /94901/.test(runnerSrc) && /94908/.test(runnerSrc) && /BAND=/.test(runnerSrc));
ok('C2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('C3 runner has baseline + armed phases', /PHASE.*baseline/.test(runnerSrc) && /PHASE.*armed/.test(runnerSrc) && /analyze-awayration-packtail-b\.js/.test(runnerSrc));
ok('C4 runner runs analyzer on armed phase + panel attempt', /balance-panel\.js compare/.test(runnerSrc));
ok('C5 runner checks packMeal rows (deduped) + pack alignment', /packMealRows/.test(runnerSrc) && /packDay.*==.*day/.test(runnerSrc));

// --- game-code shape legs (static: the lever lives in packMeal only) ---
ok('G1 packMeal carries the tail top-up (dawnKcal + topUpDone + pantryDraw)', /dawnKcal/.test(gameSrc) && /topUpDone/.test(gameSrc) && /packMeal\(vid, want, exposure\)/.test(gameSrc));
ok('G2 packKcal formula untouched (theft/intimidation callers keep the old formula)', /800 \+ Math\.random\(\) \* 500/.test(gameSrc) && !/dayWant/.test(gameSrc.slice(gameSrc.indexOf('packKcal(vid)'), gameSrc.indexOf('packKcal(vid)') + 1200)));
ok('G3 top-up is floor-only by construction (adds to the pack before the same min() take)', (() => {
  const i = gameSrc.indexOf('packMeal(vid, want, exposure)');
  const seg = gameSrc.slice(i, i + 3000);
  return /topUp/.test(seg) && /const take = Math\.min\(\(p \? p\.kcal : pool\), want\)/.test(seg);
})());

// --- D: live seed-list refusal ---
{
  const r = spawnSync('node', [path.join(__dirname, 'sweep-awayration-packtail-b.js')], {
    env: { ...process.env, PLENTYDEPRI: '1', DEPOSITGATE: '1', SEEDS: '1,2,3', DAYS: '150' },
    encoding: 'utf8', timeout: 60000,
  });
  ok('D1 sweep refuses a non-BAND seed list before simming', r.status === 2 && /exactly BAND/.test((r.stderr || '') + (r.stdout || '')));
}

// --- F first, then E: ORDER MATTERS. The determinism leg must run BEFORE
// any other game load in this process: sim-harness modules capture
// Math.random at eval, so a prior godpath load (E legs) leaks a foreign
// RNG stream into the sweep's oneRun and the re-run diverges (observed:
// 7 deaths vs the corpus's 1). F runs first, while the process is still
// game-free; E legs load their own game afterwards.
(async () => {
  let fSkipped = false;
  {
    const corpusFile = path.join(ROOT, 'evidence', '2026-10-25', 'sim-packtail-b-corpus', 'armed', 'packtail-b-competent-s94901.json');
    if (!fs.existsSync(corpusFile)) {
      console.log('SKIP F - armed corpus absent (run the armed phase first); other legs still prove the rules');
      fSkipped = true;
    } else if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
      console.log('SKIP F - env PLENTYDEPRI=1 DEPOSITGATE=1 not set for this process');
      fSkipped = true;
    } else {
      process.env.SEEDS = '94901,94902,94903,94904,94905,94906,94907,94908';
      process.env.DAYS = '150';
      const refBytes = fs.readFileSync(corpusFile, 'utf8');
      const ref = JSON.parse(refBytes);
      const { oneRun } = require('./sweep-awayration-packtail-b.js');
      const { perSeed } = await oneRun(94901, 150);
      assert.strictEqual(JSON.stringify(perSeed), refBytes, 'F byte-identical corpus mismatch: re-run of seed 94901 differs from the armed corpus file');
      assert.strictEqual(perSeed.packMealRows.length, ref.packMealRows.length, 'F packMealRowCount mismatch vs armed corpus');
      const seen = new Set();
      for (const m of perSeed.mealRows) {
        const k = m.vid + '|' + m.day;
        assert(!seen.has(k), 'F duplicate meal row ' + k);
        seen.add(k);
      }
      ok('F - live determinism: byte-identical corpus file (seed 94901, 150d, armed) + dedupe audit', true);
    }
  }

  // --- E: live game-code legs (godpath lib, seeded) ---
  const K = require('./godpath/lib');
  const saves = new Map();
  global.localStorage = { getItem: k => saves.get(String(k)) ?? null, setItem: (k, x) => saves.set(String(k), String(x)), removeItem: k => saves.delete(String(k)), key: i => [...saves.keys()][i] ?? null, get length() { return saves.size; } };
  const G = await K.load({ seed: 94901 });
  let s, v, me, npc, producer;
  const food = (units, kcalEach) => ({ name: 'Harvest', units, kcalEach, spoilDay: 9999, kg: 0.1, safe: true, harvestShares: { [producer]: 1 } });
  const pantryKcal = () => (v.pantry || []).reduce((t, it) => t + (it.units || 0) * (it.kcalEach || 0), 0);
  function fresh() {
    K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; s.kcal = 0; s.inventory = []; s.insideHaven = true;
    me = G.villagerId; [npc, producer] = v.roster.filter(x => x !== me);
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4;
    v.pantry = []; v.trust[me] = 100; v.gives = { [me]: 100000 };
  }
  // E1: binding day, full pantry (divisible 100-kcal items) -> full shortfall covered.
  fresh();
  v.pantry = [food(30, 100)];
  v.pack = { [npc]: { day: s.day, kcal: 500, risks: G.freshExposure(), dawnKcal: 500, topUpDone: false } };
  const take1 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E1 binding day with a full pantry covers the whole shortfall (take == want)', take1 === 1200 && v.pack[npc].kcal === 0);
  // E2: non-binding meal unchanged, pantry untouched.
  fresh();
  v.pantry = [food(30, 100)];
  const panBefore = pantryKcal();
  v.pack = { [npc]: { day: s.day, kcal: 1500, risks: G.freshExposure(), dawnKcal: 1500, topUpDone: false } };
  const take2 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E2 non-binding meal unchanged (take == want, pantry untouched)', take2 === 1200 && pantryKcal() === panBefore);
  // E3: theft shape — pool reduced by exactly the stolen amount, divisible items.
  fresh();
  v.pantry = [food(30, 100)];
  v.pack = { [npc]: { day: s.day, kcal: 700, risks: G.freshExposure(), dawnKcal: 1000, topUpDone: false } };
  const take3 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E3 theft still bites: victim short by exactly the stolen amount (take == want - stolen)', take3 === 900);
  // E4: empty pantry — meal unchanged from the old shape.
  fresh();
  v.pantry = [];
  v.pack = { [npc]: { day: s.day, kcal: 500, risks: G.freshExposure(), dawnKcal: 500, topUpDone: false } };
  const take4 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E4 empty pantry: meal takes the old min(pool, want), nothing conjured', take4 === 500);
  // E5: second same-day meal draws no second top-up.
  fresh();
  v.pantry = [food(30, 100)];
  v.pack = { [npc]: { day: s.day, kcal: 500, risks: G.freshExposure(), dawnKcal: 500, topUpDone: false } };
  G.packMeal(npc, 1200, G.freshExposure());
  const panMid = pantryKcal();
  const take5 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E5 second same-day meal draws no second top-up (pantry unchanged, take == remainder)', take5 === 0 && pantryKcal() === panMid);
  // E6: packKcal alone never tops up (dawnKcal recorded, topUpDone false).
  fresh();
  v.pantry = [food(30, 100)];
  v.pack = v.pack || {};
  delete v.pack[npc];
  const packed = G.packKcal(npc);
  ok('E6 packKcal alone never tops up (dawnKcal == kcal, topUpDone false)', packed > 0 && v.pack[npc].dawnKcal === v.pack[npc].kcal && v.pack[npc].topUpDone === false);
  // E7: legacy pack entry without dawnKcal falls back to the current pool (no crash, floor holds).
  fresh();
  v.pantry = [food(30, 100)];
  v.pack = { [npc]: { day: s.day, kcal: 500, risks: G.freshExposure() } };
  const take7 = G.packMeal(npc, 1200, G.freshExposure());
  ok('E7 legacy pack entry (no dawnKcal) still tops up from the pool without crashing', take7 === 1200);

  console.log(`PASS ${passed} legs` + (fSkipped ? ' (+F skipped, corpus absent or env unset)' : ' (F determinism included)'));
})().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
