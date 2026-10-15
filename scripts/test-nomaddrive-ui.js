#!/usr/bin/env node
// Proof test: The Long Way Home — UI wiring (nomad-drive 2026-10-15).
// The leave option is knowledge-gated; leave/settle are two-tap; move-on
// walks the itinerary; bearer death on the road stays in the party.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

// Haven lodge cell: the player starts inside the hall; step out to the
// grounds, where the lodge footprint sits at rows 3-4, cols 3-5.
function lodgeActions(Game) {
  try {
    if (Game.state.scholar.insideHaven !== false) Game.exitBuilding();
    return Game.cellActions(4, 3) || [];
  } catch (e) { return ['ERR:' + e.message]; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const D = Game.nomadDrive;

  console.log('== leave option gating ==');
  let acts = lodgeActions(Game);
  ok(acts.indexOf('Leave the village') < 0, 'no leave option pre-global (got: ' + acts.slice(0, 4).join(',') + ')');
  Game.state.globalLive = true;
  acts = lodgeActions(Game);
  ok(acts.indexOf('Leave the village') < 0, 'no leave option without known kin');
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, 2);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  acts = lodgeActions(Game);
  ok(acts.indexOf('Leave the village') >= 0, 'leave option appears when eligible');

  console.log('== leave two-tap ==');
  D.leaveTap();
  ok(!Game.nomad.onRoad(), 'first tap only warns (still home)');
  D.leaveTap();
  ok(Game.nomad.onRoad(), 'second tap departs');
  ok(Game.state.road.legs.length >= 1, 'itinerary planned on departure');

  console.log('== move on ==');
  Game.state.road.supplies = { food: 9999999 };
  D.moveOnTap();
  ok(Game.state.region === Game.state.road.legs[0].regionId, 'first tap enters first leg');
  const firstLeg = Game.state.road.legs[0];
  D.moveOnTap();
  ok(firstLeg.status === 'done', 'second tap departs the leg');
  const active = Game.state.road.legs[Game.state.road.legIndex];
  ok(!active || active === firstLeg || active.status === 'active', 'second leg entered or itinerary done');

  console.log('== settle two-tap ==');
  D.settleTap();
  ok(Game.nomad.onRoad(), 'first tap only warns (still walking)');
  ok(!Game.over, 'run not over after first tap');
  D.settleTap();
  ok(!Game.nomad.onRoad(), 'second tap ends the road');
  ok(Game.over === true && Game.won === true, 'settling closes the run as a win');

  console.log(`\nui: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

async function main2() {
  // Fresh run: bearer death on the road stays in the party (no ledger.js touch).
  const { Game } = await loadGame({ seed: 77 });
  await setupGame(Game, 'Columbus, Ohio');
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, 1);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  Game.nomadDrive.leaveTap(); Game.nomadDrive.leaveTap();
  Game.state.road.supplies = { food: 9999999 };
  const party0 = Game.state.road.partyIds.slice();
  const bearer0 = Game.state.road.bearerId;
  ok(party0.length >= 2, 'party has non-bearer members to inherit');
  Game.playerDeath('test-fall');
  const r = Game.state.road;
  ok(r.partyIds.indexOf(bearer0) < 0, 'dead bearer left the party');
  ok(r.active, 'road continues after bearer death');
  ok(Game.villagerId !== bearer0 && r.partyIds.indexOf(Game.villagerId) >= 0,
    'mantle passed inside the party (' + Game.villagerId + ')');
  console.log(`\ndeath-routing: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

if (process.env.DEATHRUN) main2().catch(e => { console.error('FATAL', e); process.exit(1); });
else main().catch(e => { console.error('FATAL', e); process.exit(1); });
