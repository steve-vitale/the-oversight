#!/usr/bin/env node
// test-doublenight-fix-a.js — proof for the sim-doublenight-fix-a FIX
// (2026-11-07/08, run fleshout-20261108T0015Z, Loop A, axis food-economy).
// The fix: endDay's player-death branch fell through to the shared
// day-advance + dawn path instead of returning before `scholar.day += 1`
// (src/js/game.js), so the sleep loop / tickAction gate can no longer
// re-enter endDay for the same scholar.day. Legs:
//   A. Sweep source deltas: P1/P2/F1 8-seed lists (F1 = the fresh confirm
//      band 17901-17908), exactly-one-list refusal, 150d refusal, env
//      asserts, recorder verbatim (villageEats counter, call-site stack,
//      call-through registerDeath, meal wrapper, fixed competent, meal-row
//      dedupe last-wins, trace file naming with the new prefix).
//   B/C/D. Analyzer rules on synthetic data: classifyFire H1/H2/H3/
//      UNCLASSIFIED + BENIGN/BUG (reused from the diag proof), pairFires,
//      neutralityCheck, and the NEW trajectoryDiff rules (zero-fire exact,
//      firing-seed pre-first-fire exact, firing-day single-pass shape,
//      post-first-fire divergence counted-not-failed, pre-first-fire diff
//      fails, after-fire on a firing day fails).
//   U. Unit legs, live against the harness, one fresh game per leg:
//      U1 player-death: the day advances exactly once, villageEats runs
//      exactly once, the death is recorded on day N, the successor is the
//      new bearer, the dawn reset ran (dayPart 0, village.day synced),
//      the driver condition (day === startDay) is now false so no
//      re-entry is possible, and a second endDay is the NEXT night
//      (day +1 again, eats +1 — one night per endDay).
//      U2 villageLost: the day does NOT advance (early return preserved),
//      the night ran once.
//      U3 over: the day does NOT advance, returnToVillage still called.
//      U4 normal-night control: a healthy scholar's endDay advances the
//      day exactly once with exactly one villageEats.
//   S. Source legs: the death branch falls through past the increment
//      site (no early return between playerDeath and the shared dawn
//      path except the no-successor over guard); the villageLost/over
//      early returns are untouched; exactly one `scholar.day += 1` in
//      game.js; no clock clamp/replay in the death branch (no dayTicks /
//      actionClock writes, no `scholar.day =` assignment there).
//   E. Live leg: re-runs the recorder on the highest-before-fire pilot
//      seed after the fix and shows 0 fires, with trajectories identical
//      to the after-corpus file for that seed (determinism). Requires the
//      after corpus; skips loudly (exit 0 with SKIP note) only when the
//      after corpus is absent or the live-leg env is not set.
// Run (unit + source + analyzer legs need no env):
//   node scripts/test-doublenight-fix-a.js
// Run (full, incl. live leg E):
//   PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1 SEEDS=98067,98052,98079,98062,98034,98095,98022,98028 DAYS=150 node scripts/test-doublenight-fix-a.js
// (SEEDS/DAYS/MEALDAY_TRACE are required for leg E because requiring the
// sweep module runs its list validation at load time, as in prior runs.)
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
const sweepSrc = fs.readFileSync(path.join(__dirname, 'sweep-doublenight-fix-a.js'), 'utf8');
const analyzerSrc = fs.readFileSync(path.join(__dirname, 'analyze-doublenight-fix-a.js'), 'utf8');
const runnerSrc = fs.readFileSync(path.join(__dirname, 'run-doublenight-fix-a.sh'), 'utf8');
const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');

// --- A: sweep source deltas ---
ok('A1 P1 is the diag pilot (deliberate reuse for reproduction)',
  /const P1 = \[98067, 98052, 98079, 98062, 98034, 98095, 98022, 98028\]/.test(sweepSrc));
ok('A1b P2 is the next 8 (98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012)',
  /const P2 = \[98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012\]/.test(sweepSrc));
ok('A1c F1 is the fresh confirm band 17901-17908',
  /const F1 = \[17901, 17902, 17903, 17904, 17905, 17906, 17907, 17908\]/.test(sweepSrc));
ok('A1d sweep refuses any list other than exactly P1, P2 or F1',
  /!isList\(P1\) && !isList\(P2\) && !isList\(F1\)/.test(sweepSrc));
ok('A2 days must be 150', /DAYS !== 150/.test(sweepSrc));
ok('A3 env asserts PD=1 DG=1', /PLENTYDEPRI !== '1'/.test(sweepSrc) && /DEPOSITGATE !== '1'/.test(sweepSrc));
ok('A3b MEALDAY_TRACE must be 0 or 1', /TRACE !== '0' && TRACE !== '1'/.test(sweepSrc));
ok('A4 registerDeath calls through', /oDie\.apply\(this, arguments\)/.test(sweepSrc));
ok('A5 villagerMealDay wrapper records ate/drawn/away', /villagerMealDay/.test(sweepSrc) && /ate: result/.test(sweepSrc) && /awayBefore/.test(sweepSrc));
ok('A6 policy fixed competent (no POLICY env override)', /require\('\.\/policies\/competent'\)/.test(sweepSrc) && !/process\.env\.POLICY/.test(sweepSrc));
ok('A7 meal-row dedupe replaces (last call wins) + counts', /dupIdx = W\.mealRows\.findIndex/.test(sweepSrc) && /W\.mealRows\[dupIdx\] = row/.test(sweepSrc) && /W\.mealDup\+\+/.test(sweepSrc));
ok('A8 corpus paths are the before/after doublenight-fix-a corpora', /doublenight-fix-a-corpus-before/.test(sweepSrc) && /doublenight-fix-a-competent-s/.test(sweepSrc));
ok('A9 villageEats invocation counter wraps and counts', /Game\.villageEats = function/.test(sweepSrc) && /W\.eatsInv \+= 1/.test(sweepSrc) && /W\.curEatsInv = W\.eatsInv/.test(sweepSrc));
ok('A10 call-site recorder uses a stack capture, reads only, no RNG anywhere in the sweep', /callSiteFromStack/.test(sweepSrc) && /new Error\('mealday-trace'\)\.stack/.test(sweepSrc) && !/Math\.random/.test(sweepSrc));
ok('A11 recorder logs site + eatsInv + seq + isDup per call (trace-on only)', /W\.mealCalls\.push/.test(sweepSrc) && /site, frames, eatsInv, seq, isDup/.test(sweepSrc) && /if \(TRACE === '1'\)/.test(sweepSrc));
ok('A12 sweep exports F1 alongside P1/P2', /module\.exports = \{ oneRun, callSiteFromStack, P1, P2, F1, DAYS \}/.test(sweepSrc));

// --- B/C/D: analyzer rules on synthetic data (no corpus needed) ---
const { pairFires, classifyFire, neutralityCheck, trajectoryDiff } = require('./analyze-doublenight-fix-a.js');
const EATS = 'Game.villageEats (src/js/game.js:32246:9)';
const mkCall = (over) => Object.assign({ vid: 'v1', day: 30, away: false, site: EATS, frames: [EATS], eatsInv: 5, seq: 1, isDup: false, ate: 2000, drawn: 1500, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, over || {});
ok('B1 H1: different villageEats invocations, same day',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ eatsInv: 5, seq: 3 }), second: mkCall({ eatsInv: 6, seq: 1, isDup: true }) }).h === 'H1');
ok('B2 H2: same villageEats invocation, different seq',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 3 }), second: mkCall({ seq: 7, isDup: true }) }).h === 'H2');
ok('B3 H3: second call from a non-villageEats site',
  classifyFire({ vid: 'v1', day: 30, first: mkCall(), second: mkCall({ site: 'Game.someOther (src/js/game.js:99999:1)', isDup: true }) }).h === 'H3');
ok('B4 UNCLASSIFIED: missing site on the second call',
  classifyFire({ vid: 'v1', day: 30, first: mkCall(), second: mkCall({ site: '', isDup: true }) }).h === 'UNCLASSIFIED');
ok('B5 BENIGN: identical end states (same ate/drawn/hunger/health)',
  classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1 }), second: mkCall({ seq: 2, isDup: true }) }).effect === 'BENIGN');
ok('B6 BUG double-draw: second call drew again (drawn2 > 0)',
  (() => { const c = classifyFire({ vid: 'v1', day: 30, first: mkCall({ seq: 1, drawn: 1500, hungerAfter: 40 }), second: mkCall({ seq: 2, isDup: true, drawn: 1200, hungerBefore: 40, hungerAfter: 30 }) }); return c.effect === 'BUG' && c.tags.includes('double-draw'); })());
ok('C1 pairFires: triple call yields two fires, second pairs with the immediately-preceding call',
  (() => { const fs2 = pairFires([mkCall({ seq: 1 }), mkCall({ seq: 2, isDup: true }), mkCall({ seq: 3, isDup: true })]); return fs2.length === 2 && fs2[1].first.seq === 2; })());
ok('C2 pairFires: no dup yields zero fires',
  pairFires([mkCall({ seq: 1 }), mkCall({ vid: 'v2', seq: 1 })]).length === 0);
const base0 = { daysAlive: 150, deathRows: [{ day: 10, who: 'v1', cause: 'starvation' }], mealRows: [{ vid: 'v1', day: 5, ate: 2000 }] };
ok('D1 neutralityCheck: identical trajectories match',
  neutralityCheck({ 98067: base0 }, { 98067: JSON.parse(JSON.stringify(base0)) })[0].match === true);
ok('D2 neutralityCheck: differing deathRows mismatch',
  neutralityCheck({ 98067: base0 }, { 98067: { ...base0, deathRows: [] } })[0].match === false);
ok('D3 neutralityCheck: missing trace-off file mismatches (never silently neutral)',
  neutralityCheck({}, { 98067: base0 })[0].match === false);

// --- D-new: trajectoryDiff rules ---
const mkSeed = (over) => Object.assign({ daysAlive: 100,
  deathRows: [],
  mealRows: [{ vid: 'v1', day: 5, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 },
    { vid: 'v1', day: 10, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 },
    { vid: 'v1', day: 20, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }] }, over || {});
const mkSide = (trace1, fires) => ({ trace1, fires: fires || [], seeds: Object.keys(trace1).map(Number) });
ok('D4 trajectoryDiff: zero-fire seeds identical end-to-end pass',
  (() => { const b = mkSide({ 7: mkSeed() }); const a = mkSide({ 7: mkSeed() });
    const d = trajectoryDiff(b, a); return d.clause2Pass && d.perSeed[7].pass && d.perSeed[7].zeroFireExact; })());
ok('D5 trajectoryDiff: zero-fire seed with a changed meal row FAILS',
  (() => { const b = mkSide({ 7: mkSeed() }); const a = mkSide({ 7: mkSeed({ mealRows: [{ vid: 'v1', day: 5, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, { vid: 'v1', day: 10, away: false, ate: 1500, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, { vid: 'v1', day: 20, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }] }) });
    const d = trajectoryDiff(b, a); return !d.clause2Pass && !d.perSeed[7].pass; })());
ok('D6 trajectoryDiff: firing seed, pre-first-fire exact + single-pass firing day + post-fire divergence reported (not failed)',
  (() => {
    const b = mkSide({ 7: mkSeed() }, [{ seed: 7, vid: 'v1', day: 10, h: 'H1', effect: 'BUG' }]);
    const afterRows = [{ vid: 'v1', day: 5, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 },
      { vid: 'v1', day: 10, away: false, ate: 1800, drawn: 900, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 },
      { vid: 'v1', day: 20, away: false, ate: 1234, drawn: 500, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }];
    const a = mkSide({ 7: mkSeed({ daysAlive: 101, mealRows: afterRows }) }, []);
    const d = trajectoryDiff(b, a);
    return d.clause2Pass && d.perSeed[7].pass && d.perSeed[7].postFirstFireMealDiffs === 2 && d.perSeed[7].firingDaySinglePass;
  })());
ok('D7 trajectoryDiff: firing seed with a PRE-first-fire meal diff FAILS',
  (() => {
    const b = mkSide({ 7: mkSeed() }, [{ seed: 7, vid: 'v1', day: 10, h: 'H1', effect: 'BUG' }]);
    const a = mkSide({ 7: mkSeed({ mealRows: [{ vid: 'v1', day: 5, away: false, ate: 999, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, { vid: 'v1', day: 10, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }, { vid: 'v1', day: 20, away: false, ate: 2000, drawn: 1000, fasting: false, hungerBefore: 50, hungerAfter: 40, healthBefore: 90, healthAfter: 90, needEst: 2000 }] }) }, []);
    const d = trajectoryDiff(b, a); return !d.clause2Pass && !d.perSeed[7].pass;
  })());
ok('D8 trajectoryDiff: firing seed whose AFTER run still fires FAILS (no single-pass shape)',
  (() => {
    const b = mkSide({ 7: mkSeed() }, [{ seed: 7, vid: 'v1', day: 10, h: 'H1', effect: 'BUG' }]);
    const a = mkSide({ 7: mkSeed() }, [{ seed: 7, vid: 'v1', day: 10, h: 'H1', effect: 'BUG' }]);
    const d = trajectoryDiff(b, a); return !d.clause2Pass && !d.perSeed[7].pass;
  })());

// --- S: source legs (the fix shape in game.js) ---
const deathStart = gameSrc.indexOf('try { this.playerDeath(honestCause); }');
const pacingStart = gameSrc.indexOf('// PACING TELEMETRY (measurement 2026-10-11)');
ok('S1 death branch carries the DOUBLE-NIGHT FIX comment', gameSrc.includes('// DOUBLE-NIGHT FIX (sim-doublenight-fix-a 2026-11-07)'));
ok('S2 death branch falls through: no bare early return between playerDeath and the shared dawn path',
  (() => {
    const seg = gameSrc.slice(deathStart, pacingStart);
    // The only `return this.status()` in the segment is inside the
    // no-successor over guard.
    const returns = (seg.match(/return this\.status\(\);/g) || []).length;
    const guardReturns = (seg.match(/if \(this\.over\) \{ this\.returnToVillage\(\); return this\.status\(\); \}/g) || []).length;
    return returns === 1 && guardReturns === 1 && seg.includes('// fall through: the day advances once and dawn runs once below.');
  })());
ok('S3 villageLost early return untouched', /if \(this\.villageLost\) \{ return this\.status\(\); \} \/\/ no home to return to/.test(gameSrc));
ok('S4 over early return untouched', /if \(this\.over\) \{ this\.returnToVillage\(\); return this\.status\(\); \}/.test(gameSrc));
ok('S5 exactly one `scholar.day += 1` in game.js (no duplicate increment)',
  (gameSrc.match(/scholar\.day \+= 1;/g) || []).length === 1);
ok('S6 no clock clamp/replay in the death branch (no dayTicks/actionClock writes, no day assignment)',
  (() => {
    const seg = gameSrc.slice(deathStart, pacingStart);
    return !/dayTicks/.test(seg) && !/actionClock/.test(seg) && !/scholar\.day =/.test(seg);
  })());
ok('S7 analyzer carries the trajectory-diff + goBar (prereg A1)',
  /function trajectoryDiff/.test(analyzerSrc) && /goBar/.test(analyzerSrc) && /firingDaySinglePass/.test(analyzerSrc));
ok('S8 runner carries before/after modes + phases.json',
  /BEFORE mode/.test(runnerSrc) && /AFTER mode/.test(runnerSrc) && /phases\.json/.test(runnerSrc) && /F1=/.test(runnerSrc));

// --- F: runner guards ---
ok('F1 runner carries P1/P2/F1 lists', /98067/.test(runnerSrc) && /98051/.test(runnerSrc) && /17901/.test(runnerSrc));
ok('F2 runner refuses post-verdict re-run (anchored line-start guard)', /REFUSE/.test(runnerSrc) && /\^VERDICT-RENDERED:/.test(runnerSrc));
ok('F3 runner extension rule: P2 runs once iff before fires < 4', /-lt 4/.test(runnerSrc) && /EXTENSION RULE MET/.test(runnerSrc));
ok('F4 runner exits 3 NO-GO-ON-SAMPLE on zero before-fires (no F1)', /NO-GO-ON-SAMPLE/.test(runnerSrc) && /exit 3/.test(runnerSrc));
ok('F5 runner after-mode repeats exactly the before phases', /reads phases\.json/.test(runnerSrc) && /AFTER mode: phases from/.test(runnerSrc));
ok('F6 runner runs trace-off before trace-on per list', /run_missing "\$1" "\$2" 0/.test(runnerSrc) && /run_missing "\$1" "\$2" 1/.test(runnerSrc));
ok('F7 runner F1 runs trace-on only', /run_list_trace1/.test(runnerSrc) && /trace-on only/.test(runnerSrc));

// --- U + E: live legs (one fresh game per leg) ---
const { loadGame, setupGame } = require('./sim-harness');

async function countEats(Game) {
  let eats = 0;
  const oEats = Game.villageEats;
  Game.villageEats = function () { eats += 1; return oEats.apply(this, arguments); };
  return { get: () => eats };
}

(async () => {
  // U1 — player-death night: the fix's own leg.
  {
    const { Game } = await loadGame({ seed: 98079, mode: 'test-doublenight-fix-a-U1' });
    await setupGame(Game);
    const s = Game.state.scholar;
    const dayBefore = s.day, bearerBefore = Game.villagerId;
    s.health = 0; s.kcal = 0; s.hydration = 0;
    const eats = await countEats(Game);
    const dayPartBefore = Game.dayPart;
    Game.endDay();
    ok('U1a player-death: day advances exactly once (N -> N+1)', Game.state.scholar.day === dayBefore + 1);
    ok('U1b player-death: villageEats ran exactly once (one night, not two)', eats.get() === 1);
    ok('U1c player-death: succession happened (new bearer)', Game.villagerId !== bearerBefore);
    ok('U1d player-death: the death is recorded on day N (the day it happened)', (() => {
      const f = ((Game.state.village || {}).fallen || []).find(r => r.villagerId === bearerBefore);
      return !!f && f.day === dayBefore;
    })());
    ok('U1e player-death: dawn reset ran (dayPart 0, village.day synced)', Game.dayPart === 0 && (Game.state.village || {}).day === dayBefore + 1);
    ok('U1f player-death: driver cannot re-enter (day !== startDay)', Game.state.scholar.day !== dayBefore && !Game.over);
    ok('U1g player-death: the run continues (not over)', Game.over === false);
    Game.endDay();
    ok('U1h player-death: a second endDay is the NEXT night (day +1 again, eats +1)', Game.state.scholar.day === dayBefore + 2 && eats.get() === 2);
    void dayPartBefore;
  }
  // U2 — villageLost: early return preserved, day does not advance.
  {
    const { Game } = await loadGame({ seed: 7, mode: 'test-doublenight-fix-a-U2' });
    await setupGame(Game);
    const dayBefore = Game.state.scholar.day;
    Game.villageLost = true; Game.over = true;
    const eats = await countEats(Game);
    Game.endDay();
    ok('U2a villageLost: day does NOT advance (early return preserved)', Game.state.scholar.day === dayBefore);
    ok('U2b villageLost: the night ran once before the return', eats.get() === 1);
    ok('U2c villageLost: still over', Game.over === true);
  }
  // U3 — over: early return preserved, returnToVillage still called.
  {
    const { Game } = await loadGame({ seed: 7, mode: 'test-doublenight-fix-a-U3' });
    await setupGame(Game);
    const dayBefore = Game.state.scholar.day;
    Game.over = true; Game.villageLost = false;
    let rtv = 0;
    const oRtv = Game.returnToVillage;
    Game.returnToVillage = function () { rtv += 1; return oRtv.apply(this, arguments); };
    const eats = await countEats(Game);
    Game.endDay();
    ok('U3a over: day does NOT advance (early return preserved)', Game.state.scholar.day === dayBefore);
    ok('U3b over: returnToVillage still called on the over path', rtv === 1);
    ok('U3c over: the night ran once before the return', eats.get() === 1);
  }
  // U4 — normal-night control: healthy scholar, one day, one eats.
  {
    const { Game } = await loadGame({ seed: 7, mode: 'test-doublenight-fix-a-U4' });
    await setupGame(Game);
    const dayBefore = Game.state.scholar.day;
    const eats = await countEats(Game);
    Game.endDay();
    ok('U4a normal night: day advances exactly once', Game.state.scholar.day === dayBefore + 1);
    ok('U4b normal night: villageEats ran exactly once', eats.get() === 1);
    ok('U4c normal night: dawn reset ran (dayPart 0)', Game.dayPart === 0);
  }

  // E — live leg: 0 fires on the highest-before-fire pilot seed, after fix.
  const afterCorpus = path.join(ROOT, 'evidence', '2026-11-07', 'doublenight-fix-a-corpus-after');
  const afterAnalysis = path.join(afterCorpus, 'analysis.json');
  const liveEnv = process.env.MEALDAY_TRACE === '1'
    && process.env.SEEDS === '98067,98052,98079,98062,98034,98095,98022,98028'
    && process.env.DAYS === '150'
    && process.env.PLENTYDEPRI === '1' && process.env.DEPOSITGATE === '1';
  if (!fs.existsSync(afterAnalysis)) {
    console.log('SKIP leg E: no after-corpus analysis.json yet (run the runner after-mode first)');
    console.log('PASS ' + passed + ' legs (leg E skipped)');
    return;
  }
  if (!liveEnv) {
    console.log('SKIP leg E: live-leg env not set (need PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1 SEEDS=<P1> DAYS=150)');
    console.log('PASS ' + passed + ' legs (leg E skipped)');
    return;
  }
  const analysis = JSON.parse(fs.readFileSync(afterAnalysis, 'utf8'));
  const beforeFires = analysis.fires || [];
  const topSeed = beforeFires.length
    ? beforeFires.reduce((acc, f) => {
        acc[f.seed] = (acc[f.seed] || 0) + 1;
        return acc;
      }, {})
    : {};
  const top = Object.keys(topSeed).map(Number).sort((a, b) => topSeed[b] - topSeed[a])[0];
  if (top === undefined) {
    console.log('SKIP leg E: before corpus recorded 0 fires — nothing to re-prove live (non-vacuity rule already failed the run)');
    console.log('PASS ' + passed + ' legs (leg E skipped)');
    return;
  }
  const { oneRun } = require('./sweep-doublenight-fix-a.js');
  const { pairFires: pf } = require('./analyze-doublenight-fix-a.js');
  const { perSeed, diag } = await oneRun(top, 150);
  const liveFires = pf(perSeed.mealCalls || []);
  ok('E1 live after-fix: 0 dedupe fires on the highest-before-fire pilot seed ' + top + ' (' + (topSeed[top] || 0) + ' before)', liveFires.length === 0);
  ok('E2 live after-fix: sweep mealDupCount is 0 on seed ' + top, diag.mealDupCount === 0);
  const afterFile = path.join(afterCorpus, 'doublenight-fix-a-competent-s' + top + '-trace1.json');
  const afterSeed = JSON.parse(fs.readFileSync(afterFile, 'utf8'));
  ok('E3 live after-fix: daysAlive matches the after-corpus file (determinism)', perSeed.daysAlive === afterSeed.daysAlive);
  ok('E4 live after-fix: deathRows match the after-corpus file', JSON.stringify(perSeed.deathRows) === JSON.stringify(afterSeed.deathRows));
  ok('E5 live after-fix: mealRows match the after-corpus file', JSON.stringify(perSeed.mealRows) === JSON.stringify(afterSeed.mealRows));
  console.log('PASS ' + passed + ' legs (incl. live leg E on seed ' + top + ': 0 fires after fix, ' + perSeed.mealCalls.length + ' calls)');
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
