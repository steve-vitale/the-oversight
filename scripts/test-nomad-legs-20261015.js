#!/usr/bin/env node
// Proof test: The Long Way Home — leg lifecycle (nomad-core 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6 — the road is legs, one region each; each
// leg generates that region's 9x9 map via the region engine; the party
// arrives as strangers.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '46', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

function startRoad(Game) {
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  if (kin.length) Game.hearOfRegion(kin[0].region, 'test');
  Game.state.village.pantry = [];
  for (let i = 0; i < 40; i++) Game.state.village.pantry.push({ kcalEach: 2000, units: 1, name: 'grain' });
  return Game.nomad.start();
}

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const road = startRoad(Game);
  ok(!!road, 'road started for leg tests');
  const homeRegion = Game.state.region;

  console.log('== addLeg ==');
  const bad = Game.nomad.addLeg('nope_not_a_region', 'Nobody');
  ok(bad === null, 'addLeg rejects unknown regions');
  // Find two distinct playable regions different from home.
  const pool = Game.playableRegions().map(r => r.id).filter(id => id !== homeRegion);
  ok(pool.length >= 2, `>=2 other playable regions (have ${pool.length})`);
  const legA = Game.nomad.addLeg(pool[0], 'Test Kin A');
  ok(!!legA && legA.status === 'pending', 'addLeg creates a pending leg');
  ok(legA.regionId === pool[0] && legA.kinName === 'Test Kin A', 'leg records region + kin');
  const dupe = Game.nomad.addLeg(pool[0], 'Test Kin A');
  ok(dupe === legA && legA.kinNames.length === 1, 'addLeg shares the pending leg for the region (no duplicate kin)');
  const legB = Game.nomad.addLeg(pool[1], 'Test Kin B');
  ok(!!legB, 'second leg added');
  // Departure plans an itinerary (nomad-drive): our legs aren't at 0/1.
  const idxA = Game.state.road.legs.indexOf(legA);
  const idxB = Game.state.road.legs.indexOf(legB);
  ok(idxA >= 0 && idxB >= 0, `test legs located in itinerary (${idxA}, ${idxB})`);

  console.log('== enterLeg ==');
  const noLeg = Game.nomad.enterLeg(99);
  ok(noLeg === false, 'enterLeg rejects a bad index');
  const entered = Game.nomad.enterLeg(idxA);
  ok(entered === true, 'enterLeg(idxA) succeeds');
  ok(Game.state.road.legIndex === idxA, 'legIndex tracks the active leg');
  ok(Game.state.road.legs[idxA].status === 'active', 'leg status -> active');
  ok(Game.state.region === pool[0], `state.region switched to the leg region (${Game.state.region})`);
  // The region engine generated a 9x9 map for the new region.
  const map = Game.map;
  ok(map && map.tiles && map.tiles.length === 9 && map.tiles[0].length === 9, 'a 9x9 map was generated for the leg');
  const again = Game.nomad.enterLeg(idxA);
  ok(again === false, 'enterLeg refuses an already-active leg');

  console.log('== departLeg ==');
  const dep = Game.nomad.departLeg();
  ok(dep === true, 'departLeg succeeds');
  ok(Game.state.road.legs[idxA].status === 'done', 'leg status -> done');
  ok(Game.state.road.legIndex === -1, 'legIndex reset between legs');
  const dep2 = Game.nomad.departLeg();
  ok(dep2 === false, 'departLeg with no active leg fails cleanly');

  console.log('== second leg ==');
  ok(Game.nomad.enterLeg(idxB) === true, 'enterLeg(idxB) works after departing');
  ok(Game.state.region === pool[1], 'region switched to the second leg');

  console.log(`\ntest-nomad-legs: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
