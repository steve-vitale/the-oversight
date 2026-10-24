#!/usr/bin/env node
// test-succession-meal-gate-20261024.js — SUCCESSION MEAL TRUST GATE proof.
// Steve's ruling 2026-10-23 (docs/DECISIONS.md): the trust<30 half-ration in
// villageMeal applies ONLY to NEW villagers — the original body (lineage
// empty) or a recent arrival (isNewcomer). A taken-over ESTABLISHED villager
// eats like the villager they are: full share at ANY trust. "It's about the
// village not the villager."
//
// This is a verification test of a LANDED ruling (no src change in this
// run): the three scenarios below must all hold on master. Any FAIL is a
// REAL BUG (regression of the ruling) — fail loudly, do not merge.
//
// Scenarios:
//   1. ORIGINAL BODY at trust 10 -> 1000 kcal + "Half ration" voice (gate fires).
//   2. TAKEN-OVER ESTABLISHED VILLAGER at trust 16 (r38's trust-trap regime,
//      seed 20004) -> 2000 kcal, NO half-ration voice (gate lifted).
//   3. TAKEN-OVER but RECENT ARRIVAL (arrivedDay today) at trust 16 -> 1000
//      + voice (newcomer gate fires).
//   4. RED DEMONSTRATION: with lineage() suppressed to [] (the pre-fix
//      world's view), scenario 2's body gets the half ration — proving this
//      instrument is sensitive to the fix (would have failed pre-fix).
// Usage: node scripts/test-succession-meal-gate-20261024.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 99991, mode: 'meal-gate-proof' });
  await setupGame(Game);
  const results = [];
  let failCount = 0;
  function check(name, cond, detail) {
    results.push({ name, pass: !!cond, detail });
    if (!cond) failCount++;
    console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  }

  // Pantry never limits: 12 x 500-kcal cooked pieces, restocked before each meal.
  function stockPantry() {
    try { for (let i = 0; i < 12; i++) Game.stockPantry(500, 'cooked pemmican ration', {}); } catch (e) {}
  }
  let says = [];
  const _say = Game.say;
  Game.say = function (t) { says.push(String(t || '')); return _say ? _say.call(this, t) : undefined; };
  function mealAs(vid, trustVal) {
    const v = Game.state.village;
    Game.villagerId = vid;
    Game.state.scholar.villagerId = vid;
    v.trust = v.trust || {};
    v.trust[vid] = trustVal;
    Game.state.scholar.kcal = 0; // room under the bank cap so the draw isn't capped
    stockPantry();
    says = [];
    Game.villageMeal();
    const mealSay = says.filter(s => /Village meal:/.test(s)).slice(-1)[0] || '(no meal say line)';
    return {
      kcal: v.lastPlayerMeal || 0,
      halfVoice: /Half ration/.test(mealSay),
      say: mealSay.slice(0, 160),
    };
  }
  function pantryNear(x) {
    // generous tolerance for piece-ceiling: the draw takes whole pieces up to the share
    return x >= 800 && x <= 1000;
  }
  function pantryFull(x) {
    return x >= 1900 && x <= 2200;
  }

  // ---- 1. ORIGINAL BODY (lineage empty), trust 10 -> gated ----
  const origId = Game.villagerId;
  const lin0 = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  check('setup: original body has empty lineage', lin0.length === 0, `lineage.length=${lin0.length}`);
  const r1 = mealAs(origId, 10);
  check('1. new body trust 10: 1000-kcal share', pantryNear(r1.kcal), `kcal=${r1.kcal}`);
  check('1. new body trust 10: half-ration voiced', r1.halfVoice === true, r1.say);

  // ---- 2. MANTLE via the REAL playerDeath; successor is established ----
  const oldName = (Game.state.scholar || {}).name || 'bearer';
  Game.playerDeath('a hushwolf');
  const newId = Game.villagerId;
  check('setup: mantle passed via playerDeath', newId !== origId && !!newId, `${oldName} -> ${newId}`);
  const lin1 = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  check('setup: lineage recorded the mantle', lin1.length > 0, `lineage.length=${lin1.length}`);
  const newcomerNow = (typeof Game.isNewcomer === 'function') ? !!Game.isNewcomer(newId) : 'n/a';
  check('setup: successor is NOT a newcomer', newcomerNow === false, `isNewcomer=${newcomerNow}`);
  const r2 = mealAs(newId, 16); // r38's trust-trap regime: trust 16
  check('2. established successor trust 16: FULL share (~2000)', pantryFull(r2.kcal), `kcal=${r2.kcal}`);
  check('2. established successor trust 16: NO half-ration voice', r2.halfVoice === false, r2.say);

  // ---- 3. same body, now flagged a recent arrival -> gated again ----
  try { Game.state.village.arrivedDay = Game.state.village.arrivedDay || {}; } catch (e) {}
  Game.state.village.arrivedDay[newId] = Game.state.scholar.day || 0;
  const r3 = mealAs(newId, 16);
  check('3. newcomer successor trust 16: 1000-kcal share', pantryNear(r3.kcal), `kcal=${r3.kcal}`);
  check('3. newcomer successor trust 16: half-ration voiced', r3.halfVoice === true, r3.say);
  delete Game.state.village.arrivedDay[newId];

  // ---- 4. RED DEMONSTRATION: suppress lineage -> pre-fix view gates the body ----
  const realLineage = Game.lineage;
  Game.lineage = function () { return []; };
  const r4 = mealAs(newId, 16);
  Game.lineage = realLineage;
  check('4. RED-demo: suppressed lineage gates the body (1000)', pantryNear(r4.kcal), `kcal=${r4.kcal}`);
  check('4. RED-demo: suppressed lineage voices half ration', r4.halfVoice === true, r4.say);

  try { Game.say = _say; } catch (e) {}
  console.log(`\nRESULT: ${results.length - failCount}/${results.length} passed`);
  process.exit(failCount ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
