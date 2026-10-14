#!/usr/bin/env node
// scripts/test-mealname-20261013.js — MEALNAME lever proof test (flesh-out loop B).
//
// RED (pristine game.js): the bulk eat beat says "You eat (170 kcal)." —
//   it never names the food. All naming assertions FAIL.
// GREEN (armed game.js): the bulk beat names what was eaten, knowledge-gated:
//   - known plant -> true name
//   - unknown plant -> gated descriptor, NEVER the true name
//   - multi-item beat -> lists honestly ("X and Y")
//   - meat item -> its stored (already-gated) name
//
// Run: node scripts/test-mealname-20261013.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'mealname-proof', fullTelemetry: false });
  await setupGame(Game);
  const log = [];
  Game.say = (m) => { log.push(String(m)); };
  return { Game, log };
}

// drain the bar so eat() actually eats; make items safely edible
function stockForMeal(Game, items) {
  const s = Game.state.scholar;
  s.kcal = 0; s.health = 100; s.energy = 80;
  s.inventory = items.map(it => Object.assign({
    units: 1, kcalEach: 50, spoilDay: s.day + 10, edible: true, safe: true,
  }, it));
}

function mealBeats(log) {
  return log.filter(m => m.startsWith('You eat '));
}

(async () => {
  let pass = 0;
  const ok = (cond, label) => { assert(cond, 'FAIL: ' + label); pass++; console.log('  ok -', label); };

  // ---- CASE 1: known plant names the true name ----
  {
    const { Game, log } = await freshGame(101);
    const p = Game.data.plants.find(x => x.id === 'dandelion');
    assert(p, 'dandelion exists in plants data');
    Game.state.codex.plants = Game.state.codex.plants || {};
    Game.state.codex.plants['dandelion'] = { level: 1 }; // named knowledge
    stockForMeal(Game, [{ plantId: 'dandelion', units: 2, kcalEach: 60, name: Game.plantCalledName('dandelion') }]);
    Game.eat();
    const beats = mealBeats(log);
    ok(beats.length >= 1, 'bulk eat produced a meal beat');
    const b = beats[0];
    console.log('    beat:', b.slice(0, 120));
    ok(/dandelion/i.test(b), 'beat names the known plant (dandelion)');
    ok(/\(\d+ kcal\)/.test(b), 'beat keeps the kcal');
  }

  // ---- CASE 2: unknown plant shows descriptor, never the true name ----
  {
    const { Game, log } = await freshGame(102);
    const cand = Game.data.plants.find(x => x.name && x.description && !(Game.state.codex.plants || {})[x.id]);
    assert(cand, 'found an unknown plant');
    const trueName = cand.name;
    ok(!Game.plantKnown(cand.id), `plant ${cand.id} is genuinely unknown`);
    // stored name is the honest descriptor, as creation code does for unknowns
    stockForMeal(Game, [{ plantId: cand.id, units: 1, kcalEach: 40, name: cand.description || 'unfamiliar plant' }]);
    Game.eat();
    const beats = mealBeats(log);
    ok(beats.length >= 1, 'bulk eat produced a meal beat (unknown plant)');
    const b = beats[0];
    console.log('    beat:', b.slice(0, 140));
    ok(!b.includes(trueName), `beat NEVER leaks the true name "${trueName}"`);
    ok(/You eat .+ \(\d+ kcal\)/.test(b), 'beat still names SOMETHING (the descriptor)');
  }

  // ---- CASE 3: multi-item beat lists honestly ----
  {
    const { Game, log } = await freshGame(103);
    Game.state.codex.plants = Game.state.codex.plants || {};
    Game.state.codex.plants['dandelion'] = { level: 1 };
    stockForMeal(Game, [
      { plantId: 'dandelion', units: 1, kcalEach: 60, name: Game.plantCalledName('dandelion') },
      { units: 1, kcalEach: 250, name: 'pemmican bar', edible: true },
    ]);
    Game.eat();
    const beats = mealBeats(log);
    ok(beats.length >= 1, 'bulk eat produced a meal beat (multi-item)');
    const b = beats[0];
    console.log('    beat:', b.slice(0, 140));
    ok(/dandelion/i.test(b) && /pemmican bar/i.test(b), 'beat names BOTH items');
    ok(/ and /.test(b), 'beat joins items with "and"');
    ok(/\(310 kcal\)/.test(b), 'beat totals the kcal (60+250)');
  }

  // ---- CASE 4: meat wears its gated name ----
  {
    const { Game, log } = await freshGame(104);
    stockForMeal(Game, [
      { plantId: 'meat_turkey', foodKind: 'meat', units: 1, kcalEach: 170, name: 'strange bird meat (smoked)', foodState: 'smoked' },
    ]);
    Game.eat();
    const beats = mealBeats(log);
    ok(beats.length >= 1, 'bulk eat produced a meal beat (meat)');
    const b = beats[0];
    console.log('    beat:', b.slice(0, 140));
    ok(/strange bird meat \(smoked\)/.test(b), 'beat names the meat with its state suffix');
  }

  // ---- CASE 5: no unnamed bulk beats remain ----
  // (the suite census covers this at scale; here just assert the beat form)
  {
    const { Game, log } = await freshGame(105);
    Game.state.codex.plants = Game.state.codex.plants || {};
    Game.state.codex.plants['dandelion'] = { level: 1 };
    stockForMeal(Game, [{ plantId: 'dandelion', units: 1, kcalEach: 60, name: Game.plantCalledName('dandelion') }]);
    Game.eat();
    const b = mealBeats(log)[0] || '';
    ok(!/^You eat \(\d+ kcal\)/.test(b), 'beat is NOT the old unnamed form "You eat (N kcal)."');
  }

  console.log(`\nMEALNAME proof: ${pass} assertions passed`);
})().catch(e => { console.error('\n' + e.message); process.exit(1); });
