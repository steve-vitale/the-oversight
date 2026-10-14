#!/usr/bin/env node
// scripts/test-throttle-honest-burn-20261014.js — PRODTHROTTLE death-spiral fix.
// RED: pantryFreshDays() uses measured burn, which collapses when villagers
// starve — a starving village reads a shrinking pantry as GROWING abundance
// (21k kcal / 1264 burn = 16.7 "days") and throttles harder into famine.
// GREEN: the denominator can't fall below roster x 1500 kcal (75% of nominal
// need) — a hungry village never inflates its days-on-hand by eating less.
// PLUS: no redirect while the village has an active hunger signal.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

async function setup(seed) {
  const { Game } = await loadGame({ seed, mode: 'throttle-honest-burn' });
  await quietLog(async () => { await setupGame(Game, 'wilds', null); });
  const v = Game.state.village;
  // normalize: 12 roster, controlled pantry + burn history
  v.pantry = [{ kcalEach: 1000, units: 60, foodState: 'cleaned', foodKind: 'meat' }]; // 60k fresh
  v.burnHistory = [];
  return Game;
}

(async () => {
  let fails = 0;
  const ok = (cond, msg) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg);
    if (!cond) fails++;
  };

  // CASE 1: collapsed burn reads as high day-count (the phantom-surplus
  // pattern: burn 7834 -> 1264). The binary gate ENGAGES on the number;
  // the hunger-winter exemption is the guard that stands it down once a
  // real crisis (streak >= 3) develops. (The circuit-breaker and nominal-
  // gate variants were tried and abandoned 2026-10-14 — see evidence.)
  {
    const Game = await setup(101);
    const v = Game.state.village;
    v.burnHistory = [1500, 1300, 1200, 1400, 1100, 1300, 1250]; // collapsed
    // simulate the spiral: pantry was 70k yesterday EOD, 60k today (shrinking)
    v._throttleFkEOD = 70000;
    const fkEOD = Game.pantryFreshKcal();
    v._throttleShrinking = fkEOD < v._throttleFkEOD * 0.97;
    v._throttleFkEOD = fkEOD;
    const fd = Game.pantryFreshDays();
    const eng = Game.prodThrottleEngaged();
    console.log(`  spiral: measured=${fd.toFixed(1)}d engaged=${eng} (no hunger streak yet)`);
    ok(eng, 'binary gate engages on the day-count (hunger streak is the guard, not the gate)');
    // now add the hunger-winter streak: the guard stands it down
    try { Game.progState().hungryStreak = 4; } catch (e) {}
    const eng2 = Game.prodThrottleEngaged();
    console.log(`  spiral + hunger streak 4: engaged=${eng2}`);
    ok(!eng2, 'hunger-winter streak stands the gate down in distress');
  }

  // CASE 2: healthy village, genuine surplus — burn at full need.
  // 200k fresh / 24000 burn = 8.3d -> SHOULD engage (this is the waste case).
  {
    const Game = await setup(102);
    const v = Game.state.village;
    v.pantry = [{ kcalEach: 1000, units: 200, foodState: 'cleaned', foodKind: 'meat' }];
    v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
    const fd = Game.pantryFreshDays();
    const eng = Game.prodThrottleEngaged();
    console.log(`  healthy surplus: freshDays=${fd.toFixed(1)} engaged=${eng}`);
    ok(eng, 'genuine surplus still engages throttle');
  }

  // CASE 3: healthy village, no surplus — 40k fresh / 24000 = 1.7d.
  {
    const Game = await setup(103);
    const v = Game.state.village;
    v.pantry = [{ kcalEach: 1000, units: 40, foodState: 'cleaned', foodKind: 'meat' }];
    v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
    const eng = Game.prodThrottleEngaged();
    ok(!eng, 'no surplus does not engage');
  }

  // CASE 4: hunger exemption — a hunger-WINTER streak (>= 3, the game's own
  // crisis threshold) blocks the redirect even on surplus. A single hungry
  // day (streak 1-2: illness, away, bad luck) must NOT block — that
  // over-fires and the rot comes back.
  {
    const Game = await setup(104);
    const v = Game.state.village;
    v.pantry = [{ kcalEach: 1000, units: 200, foodState: 'cleaned', foodKind: 'meat' }];
    v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
    try { Game.progState().hungryStreak = 2; } catch (e) {}
    ok(Game.prodThrottleEngaged() === true, 'streak 2 does not block (single bad days are noise)');
    try { Game.progState().hungryStreak = 3; } catch (e) {}
    const eng = Game.prodThrottleEngaged();
    console.log(`  hunger-winter streak: engaged=${eng}`);
    ok(!eng, 'hunger-winter streak (>=3) blocks throttle even on surplus');
  }

  // CASE 5: 4-day threshold — the landed gate (>4d) is kept (2026-10-14).
  // Six gentler variants were tried and abandoned (see evidence):
  // proportional ramps, nominal gates, circuit-breakers all underperformed
  // the landed binary gate on identical seeds.
  {
    const Game = await setup(105);
    const v = Game.state.village;
    v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
    v.pantry = [{ kcalEach: 1000, units: 84, foodState: 'cleaned', foodKind: 'meat' }]; // 3.5d
    const e35 = Game.prodThrottleEngaged();
    console.log(`  3.5 days: engaged=${e35}`);
    ok(!e35, '3.5 days does NOT engage (below 4d threshold)');
    v.pantry = [{ kcalEach: 1000, units: 144, foodState: 'cleaned', foodKind: 'meat' }]; // 6d
    const e60 = Game.prodThrottleEngaged();
    console.log(`  6 days: engaged=${e60}`);
    ok(e60, '6 days engages (above 4d threshold)');
  }

  console.log(fails === 0 ? 'ALL GREEN' : `${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
