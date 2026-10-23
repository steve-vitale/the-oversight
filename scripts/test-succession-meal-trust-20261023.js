#!/usr/bin/env node
// scripts/test-succession-meal-trust-20261023.js — proof test for the
// succession meal fix (Steve 2026-10-23).
//
// The blank: villagers eat their full need at ANY trust (villagerMealDay has
// no trust gate on eating — trust only gates how much they share INTO the
// pool), but the PLAYER's meal (villageMeal) halved rations below trust 30
// ("they're watching you" — written for the day-1 newcomer). On succession
// the same body went from eating full (as an NPC yesterday) to half (as the
// player today): 2/4 r35 successors starved, plus r38/r39 live data. The
// person didn't change; only the driver did.
//
// The fix (src/js/game.js villageMeal): the half-ration trust gate applies
// only to NEW bodies — the original body (lineage empty) or a recent arrival
// (isNewcomer via arrivedDay). A taken-over EXISTING villager eats full.
//
// GREEN means:
//   A. first life, trust 20 (original body): want === 1000 (gate kept)
//   B. first life, trust 35: want === 2000 (unchanged)
//   C. taken-over established villager, trust 20: want === 2000 (THE FIX;
//      pre-fix code gives 1000)
//   D. taken-over NEWCOMER (arrived today), trust 20: want === 1000
//      (gate kept for new villagers, per Steve)
//   E. taken-over established villager, trust 65: want === 2200 (bonus kept)
// Usage: node scripts/test-succession-meal-trust-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 424201, mode: 'meal-trust-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  const v = Game.state.village;

  if (!Game.pantryInReach()) fails.push('construction invalid: player not at haven (pantryInReach false)');
  Game.stockPantry(30000, 'Test grain');
  const kcalCap = Game.kcalCap();
  if (kcalCap < 2200) fails.push(`construction invalid: kcalCap=${kcalCap} < 2200`);

  // capture the `want` villageMeal passes to pantryDraw (== share when room allows)
  let gotWant = null;
  const _pd = Game.pantryDraw;
  Game.pantryDraw = function (vv, want, opts) { gotWant = want; return _pd.call(this, vv, want, opts); };
  function mealWant() {
    gotWant = null;
    s.kcal = 0; // empty bank: want = min(share, room) = share
    Game.villageMeal();
    return gotWant;
  }
  function check(name, actual, expected) {
    if (actual !== expected) fails.push(`${name}: want=${actual} (expected ${expected})`);
    else console.log(`ok - ${name}: want=${actual}`);
  }

  const origId = Game.villagerId;
  v.trust = v.trust || {};

  // A. first life (lineage empty), trust 20 -> half ration
  v.trust[origId] = 20;
  check('A first-life trust-20 newcomer body', mealWant(), 1000);

  // B. first life, trust 35 -> full (unchanged)
  v.trust[origId] = 35;
  check('B first-life trust-35', mealWant(), 2000);

  // C. simulate succession: lineage gains the dead bearer, body becomes an
  // established villager with trust 20 -> FULL (the fix)
  Game.lineage().push({ name: 'Old Bearer', villagerId: origId, day: s.day || 40 });
  const otherId = (v.roster || []).find(id => id !== origId);
  if (!otherId) fails.push('construction invalid: no second roster villager');
  Game.villagerId = otherId;
  s.villagerId = otherId;
  v.trust[otherId] = 20;
  check('C taken-over established villager trust-20', mealWant(), 2000);

  // D. taken-over villager who arrived TODAY (newcomer) -> gate kept
  v.arrivedDay = v.arrivedDay || {};
  v.arrivedDay[otherId] = s.day || 40;
  check('D taken-over newcomer trust-20', mealWant(), 1000);
  delete v.arrivedDay[otherId];

  // E. established successor, trust 65 -> bonus preserved
  v.trust[otherId] = 65;
  check('E taken-over established villager trust-65', mealWant(), 2200);

  Game.pantryDraw = _pd;
  if (fails.length) { console.error('FAIL:\n' + fails.join('\n')); process.exit(1); }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
