#!/usr/bin/env node
// test-mealday-caller-a.js — proof for the sim-mealday-caller-a DIAG
// instrument (2026-11-07, run fleshout-20261107T1615Z, Loop A).
// Measurement only, zero src/js changes. Legs:
//   A. Sweep source deltas: P1/P2 8-seed lists (highest-fire seeds from
//      the awayconfirm corpus), exactly-one-list refusal, 150d refusal,
//      env asserts, MEALDAY_TRACE validation, villageEats invocation
//      counter, call-site recorder (stack, reads only, no RNG),
//      call-through registerDeath, meal wrapper, fixed competent,
//      meal-row dedupe (replace, last call wins), trace file naming.
//   B. Analyzer classifyFire() rules on synthetic fires: H1 (different
//      villageEats invocations), H2 (same invocation), H3 (non-villageEats
//      site), UNCLASSIFIED (missing site / no first call), BENIGN
//      (identical end states), BUG sub-tags (double-draw, extra-hunger,
//      meal-overwritten-lost/inflated, health-changed).
//   C. pairFires(): triple call yields two fires; no dup yields zero;
//      a dup pairs with the immediately-preceding call for the key.
//   D. neutralityCheck(): identical trajectories match; a differing
//      deathRows or mealRows mismatches; a missing trace-off file mismatches.
//   F. Runner guards: P1/P2 lists, post-verdict refusal, extension rule
//      (< 4 reproduced fires runs P2 once), trace-off-then-trace-on order,
//      full-list retries.
//   E. Live leg: oneRun(98079, 150) trace-on in-process vs the trace-off
//      corpus file for that seed (daysAlive + death-row count + cause
//      multiset + mealRowCount identical, no duplicate meal rows) —
//      neutrality proven live on the seed that reproduced the most fires
//      on THIS base (10; 98067 fired 21 on the old base but 0 here —
//      master moved between bases). Every recorded call has a non-empty
//      site, and the fires paired from mealCalls equal the sweep's
//      mealDupCount, and every live fire has consecutive villageEats
//      invocation ids (second = first + 1) on the same day — the
//      back-to-back double-endDay shape. Requires the corpus to exist
//      (run the runner first); leg E skips loudly (exit 0 with SKIP note)
//      only when the trace-off corpus file is absent. Leg E performs NO
//      writes.
// Run: PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1 SEEDS=98067,98052,98079,98062,98034,98095,98022,98028 DAYS=150 node scripts/test-mealday-caller-a.js
// (SEEDS/DAYS/MEALDAY_TRACE are required because requiring the sweep module
// runs its list validation at load time, as in prior runs.)
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
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-mealday-caller-a.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-mealday-caller-a.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-mealday-caller-a.sh'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 P1 is the 8 highest-fire seeds (98067 21, 98052 16, 98079 10, 98062 9, 98034 8, 98095 8, 98022 7, 98028 7)',
  /const P1 = \[98067, 98052, 98079, 98062, 98034, 98095, 98022, 98028\]/.test(sweepSrc));
ok('A1b P2 is the next 8 (98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012)',
  /const P2 = \[98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012\]/.test(sweepSrc));
ok('A1c sweep refuses any list other than exactly P1 or P2; 98000 is NOT in P1 (those seeds fired zero)',
  /!isList\(P1\) && !isList\(P2\)/.test(sweepSrc) && !/const P1 = \[[^\]]*98000/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A3b MEALDAY_TRACE must be 0 or 1', /TRACE !== '0' && TRACE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 no src/js edits in this arm (sweep only reads Game)', !/writeFileSync\(.*src\/js/.test(sweepSrc));
ok('A9 corpus path mealday-caller-a-corpus, trace-suffixed files', /mealday-caller-a-corpus/.test(sweepSrc) && /mealday-caller-a-competent-s/.test(sweepSrc) && /-trace\$\{TRACE\}\.json/.test(sweepSrc));
ok('A10 villageEats invocation counter wraps and counts', /Game\.villageEats = function/.test(sweepSrc) && /W\.eatsInv \+= 1/.test(sweepSrc) && /W\.curEatsInv = W\.eatsInv/.test(sweepSrc));
ok('A11 call-site recorder uses a stack capture, reads only, no RNG anywhere in the sweep', /callSiteFromStack/.test(sweepSrc) && /new Error\('mealday-trace'\)\.stack/.test(sweepSrc) && !/Math\.random/.test(sweepSrc));
ok('A12 recorder logs site + eatsInv + seq + isDup per call (trace-on only)', /W\.mealCalls\.push/.test(sweepSrc) && /site, frames, eatsInv, seq, isDup/.test(sweepSrc) && /if \(TRACE === '1'\)/.test(sweepSrc));

// --- B/C/D: analyzer rules on synthetic data (no corpus needed) ---
const { pairFires, classifyFire, neutralityCheck } = require('./analyze-mealday-caller-a.js');
const EATS = 'Game.villageEats (src/js/game.js:32246:9)';
const mkCall = (over) => Object.assign({ vid: 'v1', day: 30, away: false, site: EATS, frames: [EATS], eatsInv: 5, seq: 1, isDup: false, ate: 2000, drawn: 1500, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, over || {});
ok('B1 H1: different villageEats invocations, same day',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ eatsInv: 5, seq: 3 }), second: mkCall({ eatsInv: 6, seq: 1, isDup: true }) }).h === 'H1');
ok('B2 H2: same villageEats invocation, different seq',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 3 }), second: mkCall({ seq: 7, isDup: true }) }).h === 'H2');
ok('B3 H3: second call from a non-villageEats site',
  classifyFire({ vid: 'v1', day: 30, first: mkCall(), second: mkCall({ site: 'Game.someOther (src/js/game.js:99999:1)', isDup: true }) }).h === 'H3');
ok('B3b H3: first call from a non-villageEats site',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ site: 'Game.other (src/js/other.js:10:1)' }), second: mkCall({ isDup: true }) }).h === 'H3');
ok('B4 UNCLASSIFIED: missing site on the second call',
  classifyFire({ vid: 'v1', day: 30, first: mkCall(), second: mkCall({ site: '', isDup: true }) }).h === 'UNCLASSIFIED');
ok('B4b UNCLASSIFIED: no first call for the key',
  classifyFire({ vid: 'v1', day: 30, first: null, second: mkCall({ isDup: true }) }).h === 'UNCLASSIFIED');
ok('B5 BENIGN: identical end states (same ate/drawn/hunger/health)',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1 }), second: mkCall({ seq: 2, isDup: true }) }).effect === 'BENIGN');
ok('B6 BUG double-draw: second call drew again (drawn2 > 0)',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, drawn: 1500, hungerAfter: 40 }), second: mkCall({ seq: 2, isDup: true, drawn: 1200, hungerBefore: 40, hungerAfter: 30 }) }); return c.effect === 'BUG' && c.tags.includes('double-draw'); })());
ok('B6b BUG extra-hunger: hungerAfter differs (the extra +25..40 tick stuck)',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, drawn: 0, hungerAfter: 40 }), second: mkCall({ seq: 2, isDup: true, drawn: 0, hungerBefore: 40, hungerAfter: 65 }) }); return c.effect === 'BUG' && c.tags.includes('extra-hunger'); })());
ok('B6c BUG meal-overwritten-lost: second ate is smaller (a meal lost in the record)',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, ate: 2000, drawn: 0 }), second: mkCall({ seq: 2, isDup: true, ate: 300, drawn: 0, hungerAfter: 40 }) }); return c.effect === 'BUG' && c.tags.includes('meal-overwritten-lost'); })());
ok('B6d BUG meal-overwritten-inflated: second ate is larger',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, ate: 300, drawn: 0 }), second: mkCall({ seq: 2, isDup: true, ate: 2000, drawn: 0, hungerAfter: 40 }) }); return c.effect === 'BUG' && c.tags.includes('meal-overwritten-inflated'); })());
ok('B6e BUG health-changed: healthAfter differs',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, drawn: 0, healthAfter: 90 }), second: mkCall({ seq: 2, isDup: true, drawn: 0, healthBefore: 90, healthAfter: 82 }) }); return c.effect === 'BUG' && c.tags.includes('health-changed'); })());
ok('B7 H1 reason names both invocation ids and the day',
  /5 vs 6/.test(classifyFire({ vid: 'v1', day: 30, first: mkCall({ eatsInv: 5 }), second: mkCall({ eatsInv: 6, isDup: true }) }).reason));
ok('C1 pairFires: triple call yields two fires, second pairs with the immediately-preceding call',
  (() => { const fs2 = pairFires([mkCall({ seq: 1 }), mkCall({ seq: 2, isDup: true }), mkCall({ seq: 3, isDup: true })]); return fs2.length === 2 && fs2[1].first.seq === 2; })());
ok('C2 pairFires: no dup yields zero fires',
  pairFires([mkCall({ seq: 1 }), mkCall({ vid: 'v2', seq: 1 })]).length === 0);
ok('C3 pairFires: keys are (vid,day) — same vid another day is not a fire',
  pairFires([mkCall({ seq: 1 }), mkCall({ day: 31, seq: 1 })]).length === 0);
const base0 = { daysAlive: 150, deathRows: [{ day: 10, who: 'v1', cause: 'starvation' }], mealRows: [{ vid: 'v1', day: 5, ate: 2000 }] };
ok('D1 neutralityCheck: identical trajectories match',
  neutralityCheck({ 98067: base0 }, { 98067: JSON.parse(JSON.stringify(base0)) })[0].match === true);
ok('D2 neutralityCheck: differing deathRows mismatch',
  neutralityCheck({ 98067: base0 }, { 98067: { ...base0, deathRows: [] } })[0].match === false);
ok('D3 neutralityCheck: differing mealRows mismatch',
  neutralityCheck({ 98067: base0 }, { 98067: { ...base0, mealRows: [] } })[0].match === false);
ok('D4 neutralityCheck: missing trace-off file mismatches (never silently neutral)',
  neutralityCheck({}, { 98067: base0 })[0].match === false);

// --- F: runner guards ---
ok('F1 runner carries P1/P2 lists', /98067/.test(runnerSrc) && /98051/.test(runnerSrc) && /P1=/.test(runnerSrc) && /P2=/.test(runnerSrc));
ok('F2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('F3 runner extension rule: P2 runs once iff reproduced fires < 4', /-lt 4/.test(runnerSrc) && /EXTENSION RULE MET/.test(runnerSrc));
ok('F4 runner runs trace-off before trace-on per list', /run_missing "\$1" "\$2" 0/.test(runnerSrc) && /run_missing "\$1" "\$2" 1/.test(runnerSrc));
ok('F5 runner verifies call sites present in trace1 files (a call with no site fails the seed)', /no call site/.test(runnerSrc) && /mealCalls/.test(runnerSrc));
ok('F6 runner retries re-run the FULL list (sweep accepts exactly one list)', /full list/.test(runnerSrc) && /re-run the full list/.test(runnerSrc));

// --- E: live leg (in-memory only) ---
(async () => {
  const corpus = path.join(ROOT, 'evidence', '2026-11-07', 'mealday-caller-a-corpus');
  const offFile = path.join(corpus, 'mealday-caller-a-competent-s98079-trace0.json');
  if (!fs.existsSync(offFile)) {
    console.log('SKIP leg E: no trace-off corpus file for seed 98079 yet (run the runner first)');
    console.log('PASS ' + passed + ' legs (leg E skipped)');
    return;
  }
  const off = JSON.parse(fs.readFileSync(offFile, 'utf8'));
  const { oneRun } = require('./sweep-mealday-caller-a.js');
  const { perSeed, diag } = await oneRun(98079, 150);
  ok('E1 live trace-on daysAlive matches trace-off (98079)', perSeed.daysAlive === off.daysAlive);
  ok('E2 live trace-on death-row count matches trace-off', perSeed.deathRows.length === off.deathRows.length);
  const causes = (rows) => { const m = {}; for (const d of rows) m[d.cause] = (m[d.cause] || 0) + 1; return JSON.stringify(m); };
  ok('E3 live trace-on death-cause multiset matches trace-off', causes(perSeed.deathRows) === causes(off.deathRows));
  ok('E4 live trace-on mealRowCount matches trace-off', perSeed.mealRows.length === off.mealRows.length);
  ok('E5 live trace-on meal rows identical to trace-off (JSON)', JSON.stringify(perSeed.mealRows) === JSON.stringify(off.mealRows));
  const keys = new Set();
  let dup = false;
  for (const m of perSeed.mealRows) { const k = m.vid + '|' + m.day; if (keys.has(k)) dup = true; keys.add(k); }
  ok('E6 live trace-on meal rows have no duplicate (vid,day)', !dup);
  ok('E7 every recorded call carries a non-empty call site', perSeed.mealCalls.length > 0 && perSeed.mealCalls.every(c => c.site));
  ok('E8 every recorded call carries invocation identity (eatsInv + seq)', perSeed.mealCalls.every(c => 'eatsInv' in c && 'seq' in c));
  const fires = pairFires(perSeed.mealCalls);
  ok('E9 fires paired from mealCalls equal the sweep mealDupCount', fires.length === diag.mealDupCount);
  ok('E10 every live fire is a back-to-back double-endDay (second eatsInv = first eatsInv + 1, same day)',
    fires.length > 0 && fires.every(f => f.second.eatsInv === f.first.eatsInv + 1 && f.second.day === f.first.day));
  ok('E11 every live fire classifies H1/BUG (no UNCLASSIFIED, none benign)',
    fires.every(f => { const c = classifyFire(f); return c.h === 'H1' && c.effect === 'BUG'; }));
  console.log('PASS ' + passed + ' legs (incl. live leg E on seed 98079: ' + diag.mealDupCount + ' reproduced fires, ' + perSeed.mealCalls.length + ' calls)');
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
