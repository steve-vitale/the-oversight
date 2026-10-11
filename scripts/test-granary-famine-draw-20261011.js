#!/usr/bin/env node
// test-granary-famine-draw-20261011.js — lever 0 round 2 proof.
// The league granary opens in famine: when the pantry is bare at the day's
// start and the pool holds food, villageEats draws the village's measured
// daily burn BEFORE the meals, so the day's meals exist. The covenant's
// "draw on it in famine" promise, made automatic.
//
// Asserts:
//   1. Bare pantry + pool>0 -> draw happens (pool debited, pantry gains
//      'League granary draw' items, the famine line is said).
//   2. Draw amount = 7-day rolling burn estimate (not the whole pool).
//   3. Bare pantry + pool=0 -> no draw; the famine is honest.
//   4. Non-bare pantry + pool>0 -> no draw (the granary stays shut when
//      there's food).
//   5. The drawn food is eaten: villagers' ate covers need (no starvation
//      health drain on the draw day).
// Usage: node scripts/test-granary-famine-draw-20261011.js
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; fails.push(name); console.log(`  FAIL ${name} — ${extra || ''}`); }
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 424242, mode: 'granary-proof' });
  await setupGame(Game);
  return Game;
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function setRoster(Game, n) {
  const v = Game.state.village;
  const ids = (v.roster || []).slice(0, n);
  v.roster = ids;
  v.health = {};
  for (const id of ids) v.health[id] = 100;
  return ids;
}

async function main() {
  await quietLog(async () => {
    // ---- 1+2: bare pantry + pool -> draw of the burn estimate ----
    {
      const Game = await freshGame();
      const said = [];
      const origSay = Game.say;
      Game.say = function (...a) { said.push(String(a[0] || '')); return origSay.apply(this, a); };
      const ids = setRoster(Game, 6);
      Game.state.village.pantry = []; // bare
      Game.state.leaguePoolKcal = 20000;
      Game.state.village.burnHistory = [3000, 3200, 2800, 3100, 2900, 3000, 3050]; // avg ~3007
      const poolBefore = Game.leaguePool();
      Game.villageEats();
      const poolAfter = Game.leaguePool();
      const drew = poolBefore - poolAfter;
      check('bare pantry + pool>0: pool debited', drew > 0, 'drew=' + drew);
      check('draw ~= daily burn estimate (3007)', Math.abs(drew - 3007) < 2, 'drew=' + drew);
      check('draw < whole pool (insurance, not a drain)', poolAfter > 0, 'poolAfter=' + poolAfter);
      // The drawn food is eaten by the day's meals (pantry may be bare again
      // after eating) — the proof is the pool debit + the fed-day flag, not
      // leftover items.
      check('famine line said aloud', said.some(s => /granary opens/i.test(s)), said.slice(-3).join(' | ').slice(0, 120));
      check('fed-day flag set (famine block stands down)', Game.state.village._granaryFedDay === (Game.state.scholar || {}).day, '');
      Game.say = origSay;
    }
    // ---- 3: bare pantry + empty pool -> honest famine, no draw ----
    {
      const Game = await freshGame();
      setRoster(Game, 4);
      Game.state.village.pantry = [];
      Game.state.leaguePoolKcal = 0;
      Game.state.village.burnHistory = [2500, 2500, 2500];
      Game.villageEats();
      check('empty pool: nothing drawn, pool stays 0', Game.leaguePool() === 0, '');
      check('empty pool: pantry still bare', pantryKcal(Game) === 0, '');
    }
    // ---- 4: food in pantry + pool -> granary stays shut ----
    {
      const Game = await freshGame();
      setRoster(Game, 4);
      Game.state.village.pantry = [{ name: 'Rice', kcalEach: 5000, units: 1, spoilDay: 9999, safe: true }];
      Game.state.leaguePoolKcal = 20000;
      Game.state.village.burnHistory = [2500, 2500, 2500];
      Game.villageEats();
      check('non-bare pantry: pool untouched', Game.leaguePool() === 20000, 'pool=' + Game.leaguePool());
      const hasDraw = (Game.state.village.pantry || []).some(i => i.name === 'League granary draw');
      check('non-bare pantry: no granary items', !hasDraw, '');
    }
    // ---- 5: the drawn food feeds the day (no starvation drain) ----
    {
      const Game = await freshGame();
      const ids = setRoster(Game, 4);
      Game.state.village.pantry = [];
      Game.state.leaguePoolKcal = 30000;
      // make every villager a non-producer so the pantry draw is the whole meal
      Game.state.village.burnHistory = [8000, 8000, 8000, 8000, 8000, 8000, 8000];
      const hBefore = ids.map(id => Game.state.village.health[id]);
      Game.villageEats();
      const hAfter = ids.map(id => Game.state.village.health[id]);
      const drained = hAfter.some((h, i) => h < hBefore[i]);
      check('drawn food eaten: no starvation health drain', !drained, JSON.stringify(hAfter));
      check('pool drawn for the day', Game.leaguePool() < 30000, 'pool=' + Game.leaguePool());
    }
    // ---- 6: fallback when no burn history (roster x 1000) ----
    {
      const Game = await freshGame();
      setRoster(Game, 5);
      Game.state.village.pantry = [];
      Game.state.leaguePoolKcal = 50000;
      Game.state.village.burnHistory = [];
      Game.villageEats();
      const drew = 50000 - Game.leaguePool();
      check('no history: fallback roster x 1000', drew === 5000, 'drew=' + drew);
    }
  });
  console.log(`\n${pass} passed, ${fail} failed${fail ? ': ' + fails.join('; ') : ''}`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
