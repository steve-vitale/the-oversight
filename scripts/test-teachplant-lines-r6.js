#!/usr/bin/env node
// test-teachplant-lines-r6.js — proof test for the r6 player teach-learn
// spoken-line dial (longsim agency r6, 2026-10-12).
//
// Dial under test (src/js/villager-agency.js):
//   - NEW helper Game.teachPlantLine(nm, plantName, need): the spoken line
//     for a villager->player plant lesson, varying off the player's read
//     need (wound/hunger/novice/general) — parallel to r5's teachChoreLine.
//   - agencyTeachPlant reads the PLAYER's state (wound/hunger/novice) and the
//     picked plant's properties; wound/hunger frames fire only when the plant
//     fits (honest claims); novice is about the teaching. Zero RNG draws,
//     no mechanic touched — narration-only by construction.
//
// Asserted:
//   1. teachPlantLine: all 4 need variants produce 4 DISTINCT endings;
//      unknown/null need falls back to the classic general template;
//      missing plantName falls back gracefully.
//   2. Driven agencyTeachPlant: wounded player + medicinal plant -> wound
//      line; hungry player + food plant -> hunger line; novice player ->
//      novice line; veteran player -> general line. The codex write, the
//      teachable spend, and the return value are unchanged (mechanic intact).
//
// Usage: node scripts/test-teachplant-lines-r6.js   (exit 0 = green)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 777001, mode: 'test', fullTelemetry: false });
  await setupGame(Game);

  // ---------- 1. teachPlantLine direct ----------
  assert(typeof Game.teachPlantLine === 'function', 'Game.teachPlantLine must exist (r6 dial)');
  const nm = 'Lena';
  const wound = Game.teachPlantLine(nm, 'Yarrow', 'wound');
  const hunger = Game.teachPlantLine(nm, 'Wild Onion', 'hunger');
  const novice = Game.teachPlantLine(nm, 'Burdock', 'novice');
  const general = Game.teachPlantLine(nm, 'Burdock', null);
  const general2 = Game.teachPlantLine(nm, 'Burdock', 'mystery-need');
  const noName = Game.teachPlantLine(nm, null, 'hunger');

  // need frames
  assert(/which leaves to press on a wound/.test(wound), 'wound line names the wound use: ' + wound);
  assert(/where it grows, what's safe to eat/.test(hunger), 'hunger line names food finding: ' + hunger);
  assert(/the beginner's tour/.test(novice), 'novice line names the tour: ' + novice);
  assert(/walks you through/.test(novice), 'novice line uses walk-through voice: ' + novice);
  // classic kept for general
  assert(/shows you Burdock — leaf, stem, smell\. You won't forget it now\. \(Codex: Burdock identified\.\)/.test(general),
    'general line is the classic template: ' + general);
  assert.strictEqual(general2, general, 'unknown need falls back to general');
  // distinct endings
  const endings = [wound, hunger, novice, general].map(l => l.split('—')[1]);
  assert(new Set(endings).size === 4, 'all 4 need variants have distinct endings');
  // no bare-"A" voice issues: nm passes through untouched
  for (const l of [wound, hunger, novice, general]) assert(l.indexOf('📖 Lena ') === 0, 'teacher ref leads: ' + l);
  // fallback name
  assert(/shows you a plant/.test(noName), 'missing plant name falls back: ' + noName);
  console.log('teachPlantLine direct: 4 variants distinct, fallbacks good');
  console.log('  wound:  ' + wound);
  console.log('  hunger: ' + hunger);
  console.log('  novice: ' + novice);
  console.log('  gen:    ' + general);

  // ---------- 2. driven agencyTeachPlant: need read ----------
  const plants = Game.data.plants || [];
  const isMed = (p) => !!(p && p.medicinal);
  const isFood = (p) => p && ((p.edibility === 'safe' || p.edibility === 'caution') && (p.caloriesPerUnit || 0) > 0 ||
    (p.uses || []).some(u => u.kind === 'food'));
  const med = plants.find(p => isMed(p) && !isFood(p)) || plants.find(isMed);
  const food = plants.find(p => isFood(p) && !isMed(p)) || plants.find(isFood);
  const other = plants.find(p => !isMed(p) && !isFood(p));
  assert(med && food && other, 'need med/food/other plants in data');

  const v = Game.state.village;
  const pid = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== pid);
  assert(roster.length >= 1, 'need a villager teacher');
  const teacher = roster[0];

  let said = [];
  Game.say = function (msg) { said.push(String(msg)); };
  const st = Game.agencyState();
  const giveTeachable = () => { st.teachable[teacher] = [{ topic: 'plants', day: 0 }]; st.lastTaughtPlantName = null; };
  // force the pick: mark every plant known except the target
  const onlyUnknown = (targetId) => {
    const cx = Game.state.codex = Game.state.codex || {};
    cx.plants = {};
    for (const p of plants) if (p.id !== targetId) cx.plants[p.id] = { level: 1, source: 'test' };
  };
  const resetPlayer = () => {
    v.health = v.health || {}; v.health[pid] = 100;
    try { Game.npcNeeds(pid).hunger = 10; } catch (e) {}
  };

  // WOUND: player hurt + medicinal plant -> wound frame
  resetPlayer(); v.health[pid] = 30; onlyUnknown(med.id); giveTeachable(); said = [];
  assert(Game.agencyTeachPlant(teacher) === true, 'wound trial must teach');
  assert(/which leaves to press on a wound/.test(said[0]), 'wounded player + medicinal plant -> wound line: ' + said[0]);
  assert(Game.state.codex.plants[med.id] && Game.state.codex.plants[med.id].level === 1, 'codex write intact');
  assert((st.teachable[teacher] || []).length === 0, 'teachable entry spent');
  console.log('wound read:   ' + said[0]);

  // HUNGER: player hungry + food plant -> hunger frame
  resetPlayer(); try { Game.npcNeeds(pid).hunger = 80; } catch (e) {} onlyUnknown(food.id); giveTeachable(); said = [];
  assert(Game.agencyTeachPlant(teacher) === true, 'hunger trial must teach');
  assert(/where it grows, what's safe to eat/.test(said[0]), 'hungry player + food plant -> hunger line: ' + said[0]);
  console.log('hunger read:  ' + said[0]);

  // NOVICE: player new to being taught (taught-source lessons < 3), healthy,
  // fed -> novice frame, whatever the plant (novice is about the teaching,
  // not the plant — no fit needed, so no forced pick required).
  resetPlayer();
  Game.state.codex.plants = {};
  // seed 2 taught-source lessons (so this 3rd lesson is still novice)
  let _n = 0;
  for (const p of plants) { if (_n++ < 2) Game.state.codex.plants[p.id] = { level: 1, source: 'taught' }; }
  giveTeachable(); said = [];
  assert(Game.agencyTeachPlant(teacher) === true, 'novice trial must teach');
  assert(/the beginner's tour/.test(said[0]), 'novice player -> novice line: ' + said[0]);
  console.log('novice read:  ' + said[0]);

  // GENERAL: veteran of teaching (taught-source >= 3), healthy, fed ->
  // classic, whatever the plant (no need fires, so no fit needed).
  resetPlayer();
  Game.state.codex.plants = {};
  _n = 0;
  for (const p of plants) { if (_n++ < 5) Game.state.codex.plants[p.id] = { level: 1, source: 'taught' }; }
  giveTeachable(); said = [];
  assert(Game.agencyTeachPlant(teacher) === true, 'general trial must teach');
  assert(/— leaf, stem, smell\. You won't forget it now\./.test(said[0]) && !/beginner's tour/.test(said[0]),
    'veteran player -> classic general line: ' + said[0]);
  console.log('general read: ' + said[0]);

  // HONESTY: wounded player + NON-medicinal plant -> must NOT claim wound use
  resetPlayer(); v.health[pid] = 25; onlyUnknown(food.id); giveTeachable(); said = [];
  assert(Game.agencyTeachPlant(teacher) === true, 'honesty trial must teach');
  assert(!/press on a wound/.test(said[0]), 'wounded player + food plant must not claim wound use: ' + said[0]);
  console.log('honesty:      ' + said[0]);

  console.log('\nGREEN: teachPlantLine + need read proven (5 driven trials)');
  process.exit(0);
})().catch(e => { console.error('RED: ' + (e && e.message)); console.error(e && e.stack); process.exit(1); });
