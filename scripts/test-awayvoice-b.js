#!/usr/bin/env node
// test-awayvoice-b.js — proof for sim-awayvoice-b (away-hunger voice beat).
//
// Live harness legs (L1-L5): a real loaded game, a real packMeal call.
// The beat is narration only, so every leg also asserts the meal numbers
// did not move (pack kcal before - take == pack kcal after; take returned).
// Analyzer legs (A1-A3): synthetic baseline/armed corpora in a temp dir
// (removed in finally) exercise the analyzer's fire-rate math, its
// name-borrowing detection in both directions, and its meal-identity
// diff detection. Sweep legs (S1-S2): static guards on the sweep file
// (the sweep exits on require without env, so it is read, not required).
//
// Run: node scripts/test-awayvoice-b.js  (exit 0 = all legs pass)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { analyzeSeed } = require('./analyze-awayvoice-b');

let passed = 0;
function leg(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}
async function aleg(name, fn) {
  try { await fn(); passed++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}
async function buildWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'awayvoice-b-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'no non-player roster villager');
  const person = Game.getPerson(vid);
  assert(person && person.name, 'traveler has no name');
  const first = String(person.name).split(' ')[0];
  return { Game, said, v, vid, first };
}
function beatLines(said) { return said.filter(t => /away from the haven/.test(t)); }

(async () => {
  // L1: low-health away packMeal fires, names the traveler, numbers intact.
  await aleg('L1 low-health away packMeal fires with traveler name', async () => {
    const { Game, said, v, vid, first } = await buildWorld(94801);
    v.away = v.away || {}; v.away[vid] = true;
    v.health = v.health || {}; v.health[vid] = 4;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)];
    const before = Game.packKcal(vid);
    assert(before > 0, 'pack should hold a ration, got ' + before);
    const pack = (v.pack || {})[vid];
    const dawn = (pack && pack.dawnKcal != null ? pack.dawnKcal : before);
    const take = Game.packMeal(vid, 1500, Game.freshExposure());
    assert(take > 0, 'take should be positive, got ' + take);
    // Combined packtail + awayvoice accounting: on a binding day
    // (dawn pack < want) the meal first tops the pack up from the pantry
    // (want - dawn; the pantry here covers it in full), then spends take —
    // so the pack ends at before + topup - take, not before - take.
    // The old before - take assertion assumed no top-up and is invalid
    // once the tail-pack lever lands alongside the voice beat.
    const topup = (dawn < 1500 ? 1500 - dawn : 0);
    assert.strictEqual(Game.packKcal(vid), before + topup - take, 'pack kcal must fall by take net of the meal-time top-up');
    const beats = beatLines(said);
    assert.strictEqual(beats.length, 1, 'exactly one beat line, got ' + JSON.stringify(beats));
    assert(beats[0].includes(first), 'beat must name the traveler ' + first + ', got: ' + beats[0]);
    assert(/pack/.test(beats[0]), 'beat must name the pack state, got: ' + beats[0]);
    assert(/health 4\/100/.test(beats[0]), 'beat must report the hurt health, got: ' + beats[0]);
  });

  // L2: healthy away packMeal stays silent (negative control).
  await aleg('L2 healthy away packMeal silent', async () => {
    const { Game, said, v, vid } = await buildWorld(94801);
    v.away = v.away || {}; v.away[vid] = true;
    v.health = v.health || {}; v.health[vid] = 80;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)];
    const take = Game.packMeal(vid, 1500, Game.freshExposure());
    assert(take > 0, 'control meal should eat, got ' + take);
    assert.strictEqual(beatLines(said).length, 0, 'no beat on a healthy away meal, got ' + JSON.stringify(beatLines(said)));
  });

  // L3: not-away packMeal stays silent (haven control — the beat must not
  // fire for a haven meal even if packMeal is called directly).
  await aleg('L3 not-away packMeal silent', async () => {
    const { Game, said, v, vid } = await buildWorld(94801);
    v.away = v.away || {}; delete v.away[vid];
    v.health = v.health || {}; v.health[vid] = 4;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)];
    Game.packMeal(vid, 1500, Game.freshExposure());
    assert.strictEqual(beatLines(said).length, 0, 'no beat when not away, got ' + JSON.stringify(beatLines(said)));
  });

  // L4: empty pack, low health, away — the empty-pack variant fires.
  await aleg('L4 empty pack low-health away fires empty variant', async () => {
    const { Game, said, v, vid, first } = await buildWorld(94801);
    v.away = v.away || {}; v.away[vid] = true;
    v.health = v.health || {}; v.health[vid] = 3;
    v.pantry = [];
    const take = Game.packMeal(vid, 1500, Game.freshExposure());
    assert.strictEqual(take, 0, 'empty pantry means empty pack, got ' + take);
    const beats = beatLines(said);
    assert.strictEqual(beats.length, 1, 'exactly one empty-pack beat, got ' + JSON.stringify(beats));
    assert(beats[0].includes(first), 'empty beat must name the traveler, got: ' + beats[0]);
    assert(/empty/.test(beats[0]), 'empty beat must say the pack is empty, got: ' + beats[0]);
  });

  // L5: double packMeal for one (vid,day) prints once (second-caller dedupe).
  await aleg('L5 double packMeal same day prints once', async () => {
    const { Game, said, v, vid } = await buildWorld(94801);
    v.away = v.away || {}; v.away[vid] = true;
    v.health = v.health || {}; v.health[vid] = 5;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)];
    Game.packMeal(vid, 1500, Game.freshExposure());
    Game.packMeal(vid, 1500, Game.freshExposure());
    assert.strictEqual(beatLines(said).length, 1, 'dedupe must hold, got ' + JSON.stringify(beatLines(said)));
  });

  // Analyzer legs on synthetic corpora.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awayvoice-test-'));
  try {
    const w = (cell, seed, obj) => fs.writeFileSync(path.join(tmp, `awayvoice-b-${cell}-s${seed}.json`), JSON.stringify(obj));
    const packCall = (vid, day, healthBefore, want, take, firstName, beatLines) =>
      ({ vid, day, away: true, healthBefore, want, take, firstName, beatLines });
    const mealRow = (vid, day, away, ate, drawn, healthBefore) =>
      ({ vid, day, away, ate, drawn, fasting: false, hungerBefore: 50, hungerAfter: 20, healthBefore, healthAfter: healthBefore, needEst: 2000 });
    // A1: fire-rate math — 2 qualifying days, 1 fired => 0.500, NO-GO.
    w('baseline', 1, { seed: 1, deathRows: [], mealRows: [], packCalls: [
      packCall('ana', 10, 4, 1500, 800, 'Ana', []),
      packCall('bo', 11, 6, 1500, 900, 'Bo', []),
      packCall('cy', 12, 80, 1500, 900, 'Cy', []),
    ], sayLog: [] });
    w('armed', 1, { seed: 1, deathRows: [], mealRows: [], packCalls: [
      packCall('ana', 10, 4, 1500, 800, 'Ana', ['d10 Ana eats away from the haven on a short pack meal — 800 kcal from the pack, 1500 wanted — while hurt (health 4/100).']),
      packCall('bo', 11, 6, 1500, 900, 'Bo', []),
      packCall('cy', 12, 80, 1500, 900, 'Cy', []),
    ], sayLog: [] });
    leg('A1 fire-rate math 1/2', () => {
      const r = analyzeSeed(1, tmp);
      assert.strictEqual(r.qualCount, 2, 'qual should be 2, got ' + r.qualCount);
      assert.strictEqual(r.fired, 1, 'fired should be 1, got ' + r.fired);
      assert.strictEqual(r.borrowFails.length, 0, 'correct name must not flag borrowing');
    });
    // A2: borrowing detection — line names another roster person.
    w('baseline', 2, { seed: 2, deathRows: [], mealRows: [], packCalls: [
      packCall('ana', 10, 4, 1500, 800, 'Ana', []),
      packCall('bo', 10, 80, 1500, 900, 'Bo', []),
    ], sayLog: [] });
    w('armed', 2, { seed: 2, deathRows: [], mealRows: [], packCalls: [
      packCall('ana', 10, 4, 1500, 800, 'Ana', ['d10 Bo eats away from the haven on a short pack meal — 800 kcal from the pack.']),
      packCall('bo', 10, 80, 1500, 900, 'Bo', []),
    ], sayLog: [] });
    leg('A2 borrowing detection flags wrong name', () => {
      const r = analyzeSeed(2, tmp);
      assert(r.borrowFails.length >= 1, 'wrong-name line must flag borrowing, got ' + JSON.stringify(r.borrowFails));
    });
    // A3: meal-identity diff detection — armed ate differs.
    w('baseline', 3, { seed: 3, deathRows: [], mealRows: [mealRow('ana', 10, true, 1200, 800, 4)], packCalls: [packCall('ana', 10, 4, 1500, 800, 'Ana', [])], sayLog: [] });
    w('armed', 3, { seed: 3, deathRows: [], mealRows: [mealRow('ana', 10, true, 1201, 800, 4)], packCalls: [packCall('ana', 10, 4, 1500, 800, 'Ana', ['d10 Ana eats away from the haven.'])], sayLog: [] });
    leg('A3 meal-identity diff detected', () => {
      const r = analyzeSeed(3, tmp);
      assert(r.mealDiffs.length >= 1, 'changed ate must surface, got ' + JSON.stringify(r.mealDiffs));
    });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  // Sweep legs (static — the sweep exits on require without env).
  const sweepText = fs.readFileSync(path.join(__dirname, 'sweep-awayvoice-b.js'), 'utf8');
  leg('S1 sweep pins PILOT seeds + 150d', () => {
    assert(sweepText.includes('94801, 94407, 94408, 94411, 94416, 94425, 94629, 94616'), 'PILOT list must be pinned');
    assert(sweepText.includes("DAYS !== 150"), 'DAYS guard must be present');
  });
  leg('S2 sweep requires CELL + env asserts', () => {
    assert(sweepText.includes("CELL !== 'baseline' && CELL !== 'armed'"), 'CELL guard must be present');
    assert(sweepText.includes("PLENTYDEPRI !== '1'"), 'env assert must be present');
    assert(sweepText.includes('Game.packMeal = function'), 'packMeal wrapper must be present');
  });

  console.log(`test-awayvoice-b: ${passed} legs passed`);
  if (process.exitCode) console.log('test-awayvoice-b: FAILURES PRESENT');
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
