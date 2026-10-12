#!/usr/bin/env node
// diag-starve-breakdown-20261011.js — CRISIS LEG: break down GENUINE (non-fast)
// starve events: are the villagers away, or home with a full pantry?
// Usage: SEEDS=1-6 DAYS=60 node scripts/diag-starve-breakdown-20261011.js
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
  const { Game } = await loadGame({ seed, mode: 'diag-brk', fullTelemetry: false });
  await setupGame(Game);
  const rec = {
    seed,
    homeFullPantry: 0,   // genuine starve, at home, pantryClaim > 10000
    homeLowPantry: 0,    // genuine starve, at home, pantryClaim <= 10000
    awayStarve: 0,       // genuine starve, away from haven
    fasting: 0,
    examples: [],        // a few homeFullPantry examples with detail
  };
  const _vmd = Game.villagerMealDay;
  Game.villagerMealDay = function (vid, person, v, ctx) {
    let rhythm = '?';
    try { rhythm = this.mealRhythm ? this.mealRhythm(vid) : '?'; } catch (e) {}
    const away = !!((v.away || {})[vid]);
    const r = _vmd ? _vmd.apply(this, arguments) : { ate: 0, gave: 0 };
    try {
      const need = (person.kcalPerDay || 2000);
      const ate = r.ate || 0;
      if (ate < need * 0.6) {
        const fasted = (rhythm === 'gorge' && (r.drawn || 0) === 0 && ate > 0);
        if (fasted) { rec.fasting++; return r; }
        const claim = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
        if (away) { rec.awayStarve++; }
        else if (claim > 10000) {
          rec.homeFullPantry++;
          if (rec.examples.length < 5) {
            let nm = vid; try { nm = String(person.name || vid).split(' ')[0]; } catch (e) {}
            rec.examples.push({
              day: (Game.state.scholar || {}).day, name: nm, rhythm,
              ate: Math.round(ate), need, pantryClaim: Math.round(claim),
              health: ((v.health || {})[vid]),
            });
          }
        }
        else rec.homeLowPantry++;
      }
    } catch (e) {}
    return r;
  };
  await runDays(Game, oracleV2, { days: DAYS });
  rec.days = (Game.state.scholar || {}).day;
  return rec;
}

async function main() {
  const out = [];
  for (const s of parseSeeds()) out.push(await playSeed(s));
  console.log(JSON.stringify(out, null, 1));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
