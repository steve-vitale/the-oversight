#!/usr/bin/env node
// scripts/diag-cook-smoke-20261013.js — WHY does fresh rot dominate while the
// village staffs the cook? Measures the cook's smoke path per resolution:
// preserved-kcal delta per cook resolution, and which guard fires when it
// doesn't (no-eligible / racks-full / budget). Deterministic seeds.
// Usage: SEEDS="11,22" DAYS=60 node scripts/diag-cook-smoke-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const preservedKcal = (Game) => {
  let k = 0;
  try {
    for (const it of ((Game.state.village || {}).pantry || []))
      if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) k += (it.kcalEach || 0) * (it.units || 1);
  } catch (e) {}
  return k;
};
// eligible-for-smoke estimate: mirrors the cook's own eligibility test
const eligibleKcal = (Game) => {
  let k = 0;
  try {
    const v = Game.state.village || {};
    const day = (Game.state.scholar || {}).day || 1;
    for (const it of (v.pantry || [])) {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.bonded) continue;
      if (it.foodState === 'preserved' || it.foodState === 'rendered') continue;
      if ((it.foodKind || '') === 'pemmican') continue;
      if (Game.isKeepsake && Game.isKeepsake(it)) continue;
      const sd = it.spoilDay;
      if (sd === undefined || sd === null || sd >= 9999) continue;
      if (sd - day > 2) continue;
      k += (it.kcalEach || 0) * (it.units || 1);
    }
  } catch (e) {}
  return k;
};

(async () => {
  const seeds = (process.env.SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '60', 10);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'cookdiag' });
    await setupGame(Game);
    const stat = { cookRes: 0, smokeFired: 0, preservedDelta: 0, eligibleWhenNoFire: [] };
    const orig = Game.resolveOneAssignment;
    Game.resolveOneAssignment = function (vid, a) {
      const isCook = a && a.task === 'cook';
      const p0 = isCook ? preservedKcal(Game) : 0;
      const e0 = isCook ? eligibleKcal(Game) : 0;
      const r = orig.apply(this, arguments);
      if (isCook) {
        try {
          stat.cookRes++;
          const d = preservedKcal(Game) - p0;
          if (d > 0) { stat.smokeFired++; stat.preservedDelta += d; }
          else stat.eligibleWhenNoFire.push(e0);
        } catch (e) {}
      }
      return r;
    };
    const policy = Object.assign({}, competent);
    await runDays(Game, policy, { days });
    const nz = stat.eligibleWhenNoFire;
    const nzMed = nz.length ? nz.slice().sort((a, b) => a - b)[Math.floor(nz.length / 2)] : 0;
    console.log(`seed ${seed}: cookRes=${stat.cookRes} smokeFired=${stat.smokeFired} ` +
      `preservedTotal=${Math.round(stat.preservedDelta)}kcal ` +
      `avgPerFire=${stat.smokeFired ? Math.round(stat.preservedDelta / stat.smokeFired) : 0}kcal ` +
      `noFireN=${nz.length} eligibleMedWhenNoFire=${Math.round(nzMed)}kcal`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
