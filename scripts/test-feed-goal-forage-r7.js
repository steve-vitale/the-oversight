#!/usr/bin/env node
// test-feed-goal-forage-r7.js — proof test for the r7 'feed' goal dial
// (longsim agency r7, 2026-10-12).
//
// Dial under test (src/js/villager-objectives.js, objPick):
//   - 'feed'-goal villagers feel the pantry dip before anyone else: the
//     FORAGE candidate gate extends to pantry < 6000 (others: < 4000).
//   - +1.5 FORAGE weight for 'feed' — they go out first when food is short.
//   Before: 12x200d sims showed 'feed' foraging at the population rate
//   (14.9% obj share vs 35.7% for 'belong') — the goal was a label.
//
// Asserted (driven objPick, stubbed pantry/needs so the gate is isolated):
//   1. GATE: pantry 5000, hunger low — 'feed' picks FORAGE sometimes;
//      control goal ('belong') never picks FORAGE (gate closed for others).
//   2. WEIGHT: pantry 3000 — 'feed' FORAGE share clearly exceeds control's.
//   3. HOMEBODY GUARD INTACT: 'feed' + homebody profile at pantry 3000,
//      hunger low — still never FORAGE (the stay-home guard wins).
//   4. FULL PANTRY: 'feed' at pantry 8000 — never FORAGE (gate closed).
//   5. RED-CHECK: these assertions fail on pre-dial code (no feedDrive).
//
// Usage: node scripts/test-feed-goal-forage-r7.js   (exit 0 = green)
'use strict';
const assert = require('assert');
const fs = require('fs'), cp = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

function countForage(Game, vid, hx, hy, trials) {
  let n = 0;
  for (let i = 0; i < trials; i++) {
    const o = Game.objPick(vid, hx, hy);
    if (o && o.kind === 'FORAGE') n++;
  }
  return n;
}

(async () => {
  const read = fs.readFileSync;
  if (process.argv.includes('--without-feed')) fs.readFileSync = function(file, ...args) {
    let source = read.call(this, file, ...args);
    if (String(file).replace(/\\/g, '/').endsWith('/src/js/villager-objectives.js')) {
      const before = String(source), after = before.replace("var feedDrive = (goal === 'feed');", 'var feedDrive = false;');
      assert.notStrictEqual(before, after, 'remove the actual feed dial');
      source = typeof source === 'string' ? after : Buffer.from(after);
    }
    return source;
  };
  let Game;
  try { ({ Game } = await loadGame({ seed: 31337, mode: 'test', fullTelemetry: false })); }
  finally { fs.readFileSync = read; }
  await setupGame(Game);

  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'need an NPC villager');
  const vp = Game.data.villagers.find(x => x.id === vid);
  const hx = Game.state.village.px ?? 4, hy = Game.state.village.py ?? 4;

  // isolate the gate: fixed needs (not hungry, rested, middling social),
  // fixed pantry via stub.
  const realNeeds = Game.npcNeeds.bind(Game);
  const realPantry = Game.pantryKcalLive.bind(Game);
  const realProfile = Game.npcRangeProfile.bind(Game);
  const realMaxDist = Game.npcMaxDist.bind(Game);
  const realGear = Game.npcGearPlan.bind(Game), realTrack = Game.villagerNeedTrack.bind(Game);
  let pantryStub = 5000;
  Game.npcNeeds = () => ({ hunger: 20, energy: 80, social: 40 });
  Game.pantryKcalLive = () => pantryStub;
  // This proof isolates FOOD motivation. Gear procurement and field-study
  // trips are independently valid even with a full pantry; they must not be
  // mistaken for the food gate opening. Their coexistence is proved below.
  Game.npcGearPlan = () => null;
  Game.villagerNeedTrack = () => null;

  const setGoal = (g) => {
    vp.goal = g;
    Game.state.village.bgGoals = Game.state.village.bgGoals || {};
    Game.state.village.bgGoals[vid] = g;
  };

  // ---------- 1. GATE: pantry 5000 (the 4000-6000 early-worry bracket) ----------
  pantryStub = 5000;
  setGoal('feed');
  const feedEarly = countForage(Game, vid, hx, hy, 300);
  setGoal('belong');
  const ctrlEarly = countForage(Game, vid, hx, hy, 300);
  console.log(`gate (pantry 5000): feed FORAGE ${feedEarly}/300, control ${ctrlEarly}/300`);
  assert(feedEarly > 0, 'feed goal must forage in the 4000-6000 early-worry bracket');
  assert(ctrlEarly === 0, 'control goal must NOT forage at pantry 5000 (gate closed)');

  // ---------- 2. WEIGHT: pantry 3000 (food short, everyone forages) ----------
  pantryStub = 3000;
  setGoal('feed');
  const feedShort = countForage(Game, vid, hx, hy, 400);
  setGoal('belong');
  const ctrlShort = countForage(Game, vid, hx, hy, 400);
  console.log(`weight (pantry 3000): feed FORAGE ${feedShort}/400, control ${ctrlShort}/400`);
  assert(feedShort > ctrlShort + 20, `feed weight bonus must clear noise: ${feedShort} vs ${ctrlShort} (need >5pp gap)`);

  // ---------- 3. HOMEBODY GUARD INTACT ----------
  Game.npcRangeProfile = () => 'homebody';
  Game.npcMaxDist = () => 0;
  pantryStub = 3000;
  setGoal('feed');
  const feedHome = countForage(Game, vid, hx, hy, 200);
  console.log(`homebody guard (pantry 3000, feed): FORAGE ${feedHome}/200`);
  assert(feedHome === 0, 'homebody stay-home guard must survive the feed dial');
  Game.npcRangeProfile = realProfile;
  Game.npcMaxDist = realMaxDist;

  // ---------- 4. FULL PANTRY: gate closed even for feed ----------
  pantryStub = 8000;
  setGoal('feed');
  const feedFull = countForage(Game, vid, hx, hy, 200);
  console.log(`full pantry (8000, feed): FORAGE ${feedFull}/200`);
  assert(feedFull === 0, 'feed must not forage into a full pantry');

  Game.npcGearPlan = realGear;
  // Prepare the stated missing-weapon opportunity. The generated butcher
  // already owns a crowbar and knife in their PERSONAL stash; that is a
  // legitimate reason to fetch existing gear instead of crafting another.
  const person = Game.getPerson(vid), eq = globalThis.Scattering.equipment;
  assert(person && eq);
  person.stashed = [...(person.stashed || []), 'stone_knife'];
  assert.strictEqual(realGear(vid), null, 'own stashed knife removes the crafting need');
  const isWeapon = item => Game.data.items.find(d => d.id === (typeof item === 'string' ? item : item?.itemId || item?.id))?.weapon;
  person.items = (person.items || []).filter(i => !isWeapon(i));
  person.stashed = person.stashed.filter(i => !isWeapon(i));
  for (const slot of Object.keys(person.equipped || {})) if (isWeapon(person.equipped[slot])) delete person.equipped[slot];
  assert(!(Game.state.village.stash?.weapons || []).length, 'prepared coexistence has no deposited replacement');
  assert.strictEqual(realGear(vid)?.action, 'forage', 'actual bare resident needs physical vine');
  setGoal('belong');
  let materialTrips = 0, foodTrips = 0;
  for (let i = 0; i < 300; i++) {
    const o = Game.objPick(vid, hx, hy);
    if (o.kind === 'FORAGE') { if (o.craftMaterial === 'vine') materialTrips++; else foodTrips++; }
  }
  assert(materialTrips > 0, 'actual missing-knife procurement must coexist with a full pantry');
  assert.strictEqual(foodTrips, 0, 'material need must not reopen the food-forage gate');
  console.log(`full pantry coexistence: ${materialTrips} real vine plans, ${foodTrips} food trips`);
  Game.villagerNeedTrack = realTrack;

  Game.npcNeeds = realNeeds;
  Game.pantryKcalLive = realPantry;

  console.log('GREEN: feed-goal forage dial proven (gate + weight + guards)');
  if (!process.argv.includes('--without-feed')) {
    const child = cp.spawnSync(process.execPath, [__filename, '--without-feed'], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.notStrictEqual(child.status, 0);
    assert.match(child.stderr, /feed goal must forage in the 4000-6000 early-worry bracket/);
    console.log('Actual removed feed dial is rejected');
  }
})().catch(e => { console.error('RED:', e.message); process.exit(1); });
