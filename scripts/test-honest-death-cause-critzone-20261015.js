#!/usr/bin/env node
// test-honest-death-cause-critzone-20261015.js — journey-succession r14 proof.
// TRIVIAL-DEFICIT HONESTY: seed 722's second bearer slept at 1 HP after a
// raid with kcal 2198 (deficit ~2, a full belly) and the epitaph said
// 'starvation' — the wrong lesson ("eat more") for a death the day caused.
// The spiral takes credit only for a real deficit (>= 500); a trivial
// deficit killing a critical scholar reports 'the night'.
//
// RED on pristine (case 1 says 'starvation'), GREEN post-fix. The pre-existing
// test-honest-death-causes.js cases (real starvation, dehydration, wounds at
// 0 HP) must stay green — asserted here as regressions.
// Usage: node scripts/test-honest-death-cause-critzone-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function ok(id, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${id}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails++;
}
function scholar(Game, o) {
  const s = Game.state.scholar;
  s.kcal = o.kcal; s.hydration = o.hydration; s.health = o.health;
  s.energy = 80; s.wounds = []; s.diseases = {}; s.injuries = [];
  return s;
}

(async () => {
  const { Game } = await loadGame({ seed: 777014, mode: 'deathcause-critzone' });
  await setupGame(Game);
  const S = globalThis.Scattering;
  const V = Game.state.village;

  // 1. THE TYRONE CASE: 1 HP, full belly, trivial deficit -> 'the night'
  {
    const s = scholar(Game, { kcal: 2198, hydration: 100, health: 1 });
    const r = S.calories.resolveDay(s, V, {});
    ok('tyrone-case', r.killedBy === 'the night' && !r.ok,
      `killedBy=${r.killedBy} (pristine: 'starvation')`);
  }
  // 2. REGRESSION: real starvation still says starvation (deficit 2100)
  {
    const s = scholar(Game, { kcal: 100, hydration: 100, health: 10 });
    const r = S.calories.resolveDay(s, V, {});
    ok('real-starvation', r.killedBy === 'starvation' && !r.ok, `killedBy=${r.killedBy}`);
  }
  // 3. REGRESSION: dehydration still says dehydration
  {
    const s = scholar(Game, { kcal: 2400, hydration: 1, health: 10 });
    const r = S.calories.resolveDay(s, V, {});
    ok('dehydration', r.killedBy === 'dehydration' && !r.ok, `killedBy=${r.killedBy}`);
  }
  // 4. REGRESSION: 0 HP entering the night -> 'the night' (no wounds/disease)
  {
    const s = scholar(Game, { kcal: 2400, hydration: 100, health: 0 });
    const r = S.calories.resolveDay(s, V, {});
    ok('zero-hp', r.killedBy === 'the night' && !r.ok, `killedBy=${r.killedBy}`);
  }
  // 5. BOUNDARY: deficit exactly 500 -> 'starvation'; 499 -> 'the night'
  //    (need=2200 baseline; damage=min(20,2+deficit/180); health=4 dies)
  {
    const s = scholar(Game, { kcal: 1700, hydration: 100, health: 4 });
    const r = S.calories.resolveDay(s, V, {});
    ok('boundary-500', r.killedBy === 'starvation' && !r.ok, `killedBy=${r.killedBy}`);
  }
  {
    const s = scholar(Game, { kcal: 1701, hydration: 100, health: 4 });
    const r = S.calories.resolveDay(s, V, {});
    ok('boundary-499', r.killedBy === 'the night' && !r.ok, `killedBy=${r.killedBy}`);
  }
  // 6. REGRESSION: healthy scholar survives the night untouched
  {
    const s = scholar(Game, { kcal: 2400, hydration: 100, health: 100 });
    const r = S.calories.resolveDay(s, V, {});
    ok('healthy', r.ok === true && r.killedBy == null, `ok=${r.ok} killedBy=${r.killedBy}`);
  }
  console.log(fails === 0 ? 'ALL GREEN' : `${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('THREW', e.stack); process.exit(1); });
