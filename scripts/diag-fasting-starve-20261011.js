#!/usr/bin/env node
// diag-fasting-starve-20261011.js — CRISIS LEG: quantify voluntary gorge-fasts
// being counted as starvation (v.health -8, anyStarving -> hunger-winter).
// Also records hunger-winter fires with pantry state.
// Usage: SEEDS=1-6 DAYS=60 node scripts/diag-fasting-starve-20261011.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

function parseSeeds() {
  const s = process.env.SEEDS || '1-6';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}
const DAYS = parseInt(process.env.DAYS || '60', 10);

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'diag-fast', fullTelemetry: false });
  await setupGame(Game);
  const rec = { seed, fastingStarveEvents: 0, genuineStarveEvents: 0, hungerWinterFires: [], fasters: {} };
  // Instrument villagerMealDay: detect the fast branch directly by wrapping
  // mealRhythm + observing pile.taken===0 with gorge rhythm.
  const _vmd = Game.villagerMealDay;
  Game.villagerMealDay = function (vid, person, v, ctx) {
    let rhythm = '?';
    try { rhythm = this.mealRhythm ? this.mealRhythm(vid) : '?'; } catch (e) {}
    let hungerBefore = '?';
    try { hungerBefore = (this.villagerNeeds(vid) || {}).hunger; } catch (e) {}
    const r = _vmd ? _vmd.apply(this, arguments) : { ate: 0, gave: 0 };
    try {
      const need = (person.kcalPerDay || 2000);
      const ate = r.ate || 0;
      const starving = ate < need * 0.6;
      const fasted = (rhythm === 'gorge' && (r.drawn || 0) === 0 && ate > 0);
      if (starving) {
        if (fasted) {
          rec.fastingStarveEvents++;
          const nm = String((person.name || vid)).split(' ')[0];
          rec.fasters[nm] = (rec.fasters[nm] || 0) + 1;
        } else {
          rec.genuineStarveEvents++;
        }
      }
    } catch (e) {}
    return r;
  };
  const _fc = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    const fired = _fc ? _fc.call(this, kind, ctx) : undefined;
    try {
      if (fired === true && kind === 'hunger-winter') {
        const v = Game.state.village || {};
        const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
        rec.hungerWinterFires.push({ day: (Game.state.scholar || {}).day, pantryClaim: Math.round(pk) });
      }
    } catch (e) {}
    return fired;
  };
  await runDays(Game, oracleV2, { days: DAYS });
  rec.days = (Game.state.scholar || {}).day;
  rec.over = !!Game.over;
  return rec;
}

async function main() {
  const out = [];
  for (const s of parseSeeds()) out.push(await playSeed(s));
  console.log(JSON.stringify(out, null, 1));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
