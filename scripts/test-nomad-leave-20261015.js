#!/usr/bin/env node
// Proof test: The Long Way Home — leave gating and departure (nomad-core 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6 — the Haven leave option exists ONLY at
// global rank AND when the player knows >=1 living scattered kin's region.
// Leaving calls tableFail('left')-style; the village appoints a leader by the
// mantle's rule (trust decides); the party musters volunteers (kin-seekers
// first, parity); the party carries 30% of the stores.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '46', 10);
// SEED 46 (2026-10-17, sim-gengap-b): seed 45's "global, unknown kin" fixture
// state shifted when the occupation pool grew 55->78 (characterGen gained the
// 23 background-survivor occupations) — at 45 the player now starts knowing a
// kin region, so the no_known_kin gate never fires. 46 preserves every fixture
// precondition (no_known_kin at global, >=1 scattered kin with a region).
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

// Make the run's player know a living kin's region: find a scattered kin and
// hear of their region (the knowledge gate, "if you don't know, it doesn't show").
function knowAKinRegion(Game) {
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  if (!kin.length) return null;
  Game.hearOfRegion(kin[0].region, 'test');
  return kin[0];
}

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');

  console.log('== Game.nomad exists ==');
  ok(Game.nomad && typeof Game.nomad.canLeave === 'function', 'Game.nomad.canLeave exists');
  ok(typeof Game.nomad.start === 'function', 'Game.nomad.start exists');

  console.log('== gating: rank ==');
  // Fresh game is village rank: the leave option must not exist.
  let g = Game.nomad.canLeave();
  ok(!g.ok && g.reason === 'rank', `pre-global: not leavable (reason=${g.reason})`);

  console.log('== gating: global rank but no known kin ==');
  Game.state.globalLive = true;
  g = Game.nomad.canLeave();
  ok(!g.ok && g.reason === 'no_known_kin', `global, unknown kin: not leavable (reason=${g.reason})`);

  console.log('== gating: global + known kin ==');
  const kin = knowAKinRegion(Game);
  ok(!!kin, 'test fixture: player has a scattered kin with a region');
  g = Game.nomad.canLeave();
  ok(g.ok === true, 'global + known kin region: leavable');

  console.log('== start(): departure ==');
  // Give the village something to carry and a trust spread for the leader pick.
  // Granular items (Steve 2026-10-08): the party takes whole items up to ~30%.
  Game.state.village.pantry = [];
  for (let i = 0; i < 60; i++) Game.state.village.pantry.push({ kcalEach: 2000, units: 1, name: 'test grain' }); // 120k kcal
  const roster = Game.state.village.roster || [];
  ok(roster.length >= 4, `roster has ${roster.length} villagers (>=4 for muster+leader)`);
  const beforeKcal = Game.pantryKcalLive(Game.state.village);
  const road = Game.nomad.start();
  ok(!!road && road.active === true, 'start() returns an active road');
  ok(road.tableGivenUp === true, 'the Table is given up');
  ok(road.partyIds[0] === Game.villagerId && road.bearerId === Game.villagerId, 'bearer is the player');
  ok(road.partyIds.length >= 2 && road.partyIds.length <= 4, `party is small (${road.partyIds.length})`);
  ok(road.supplies.food > 0, `party carries food (${road.supplies.food} kcal)`);
  const afterKcal = Game.pantryKcalLive(Game.state.village);
  ok(afterKcal < beforeKcal, `village stores reduced (${beforeKcal} -> ${afterKcal})`);
  ok(Math.abs((beforeKcal - afterKcal) - road.supplies.food) < 2000, 'carried food came from the pantry');
  ok(road.supplies.food <= beforeKcal * 0.35, `carried ~30% of stores (${road.supplies.food}/${beforeKcal})`);
  ok(!!road.villageLeft.leaderId, 'a new leader was appointed');
  ok(!road.partyIds.includes(road.villageLeft.leaderId), 'leader stays with the village');
  ok(typeof road.villageLeft.strength === 'number', 'departure strength recorded');

  console.log('== gating: already on road ==');
  g = Game.nomad.canLeave();
  ok(!g.ok && g.reason === 'on_road', `on road: not leavable again (reason=${g.reason})`);

  console.log(`\ntest-nomad-leave: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
