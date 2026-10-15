#!/usr/bin/env node
// Proof test: The Long Way Home — road upkeep (nomad-core 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6 — "It's still losable: the party can starve
// or be wiped on the road. The mantle passes inside the party; if no one is
// left, the road ends." Party burns 2000 kcal/member/day from supplies.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '47', 10);
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

  console.log('== daily() with food ==');
  ok(Game.nomad.daily() === null, 'daily() is null when no road is active');
  const road = startRoad(Game);
  const n = road.partyIds.length;
  const food0 = road.supplies.food;
  const rep = Game.nomad.daily();
  ok(rep && rep.day === 1, 'daily() advances the road day');
  ok(rep.ate === n * 2000, `party ate ${n} x 2000 kcal`);
  ok(road.supplies.food === food0 - n * 2000, 'supplies depleted by exactly the party need');
  ok(rep.deaths.length === 0, 'no deaths while food lasts');
  ok(Game.nomad.onRoad() === true, 'onRoad() true while active');

  console.log('== starvation ==');
  // Drain to just under one day's need: tomorrow someone starves.
  road.supplies.food = n * 2000 - 1;
  const before = road.partyIds.length;
  const bearer = road.bearerId;
  const rep2 = Game.nomad.daily();
  ok(rep2.deaths.length === 1, 'a starving day takes one life');
  ok(road.partyIds.length === before - 1, 'party shrank by one');
  ok(road.fallen.length === 1 && road.fallen[0].cause === 'starvation', 'the fallen are recorded with cause');
  ok(!rep2.deaths.includes(bearer), 'the bearer starves last');
  ok(road.supplies.food === 0, 'supplies floor at zero, never negative');

  console.log('== mantle passes inside the party ==');
  // Kill the bearer directly: the mantle must stay inside the party.
  const oldBearer = road.bearerId;
  const oldVillager = Game.villagerId;
  ok(oldBearer === oldVillager, 'sanity: bearer is the player character');
  Game.nomad.nomadKill(oldBearer, 'test');
  ok(road.bearerId !== oldBearer, 'bearer changed');
  ok(road.partyIds.includes(road.bearerId), 'the new bearer is a party member');
  ok(Game.villagerId === road.bearerId, 'the player is now the new bearer');
  ok(Game.nomad.onRoad() === true, 'the road continues while the party lives');

  console.log('== wiped ==');
  // Kill everyone left: the road must end as a loss.
  const rest = road.partyIds.slice();
  let endData = null;
  const origEnd = Game.nomad.endRoad.bind(Game.nomad);
  for (const id of rest) {
    Game.nomad.nomadKill(id, 'test');
    if (!Game.nomad.onRoad()) { endData = Game.nomad.endingData(); break; }
  }
  void origEnd;
  ok(!Game.nomad.onRoad(), 'empty party ends the road');
  ok(endData && endData.reason === 'wiped', `ending reason is 'wiped' (got ${endData && endData.reason})`);
  ok(endData.fallen.length >= 1, 'the fallen are in the ending data');

  console.log('== addFood ==');
  // (fresh road for the addFood check)
  const { Game: G2 } = await loadGame({ seed: SEED + 1 });
  await setupGame(G2, 'Columbus, Ohio');
  G2.state.globalLive = true;
  const k2 = G2.worldKin(G2.villagerId).filter(k => k.fate === 'scattered' && k.region);
  if (k2.length) G2.hearOfRegion(k2[0].region, 'test');
  G2.state.village.pantry = [];
  const r2 = G2.nomad.start();
  r2.supplies.food = 0;
  const f = G2.nomad.addFood(5000);
  ok(f === 5000 && r2.supplies.food === 5000, 'foraged food joins the party supplies');

  console.log(`\ntest-nomad-upkeep: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
