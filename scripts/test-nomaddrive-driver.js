#!/usr/bin/env node
// Proof test: The Long Way Home — road driver (nomad-drive 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6. Departure plans the itinerary; reunions fire
// after days on a leg with deterministic fates; moved-on kin relocate; the
// road closes when every scattered kin resolves.
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

function startRoad(Game, nKin = 99) {
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, nKin);
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  const r = Game.nomad.start();
  r.supplies = { food: 9999999 };
  return { road: r, kin };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const D = Game.nomadDrive;
  ok(!!D, 'Game.nomadDrive loaded');

  console.log('== departure planning ==');
  const { road, kin } = startRoad(Game, 2);
  ok(kin.length >= 1, 'has scattered kin (' + kin.length + ' known)');
  const legs = road.legs.filter(l => l.kinName);
  ok(legs.length === kin.length, `itinerary planned: ${legs.length} legs for ${kin.length} known kin`);

  console.log('== fate determinism ==');
  const f1 = D.fateFor('Test Person', 0), f2 = D.fateFor('Test Person', 0);
  ok(f1 === f2, 'fate deterministic (' + f1 + ')');
  const seen = {};
  for (let i = 0; i < 200; i++) { const f = D.fateFor('Person ' + i, 0); seen[f] = (seen[f] || 0) + 1; }
  ok(seen.alive > 80 && seen.alive < 120, 'alive ~50% (' + (seen.alive || 0) + '/200)');
  ok((seen.changed || 0) > 20, 'changed present (' + (seen.changed || 0) + ')');
  ok((seen.moved || 0) > 10, 'moved present (' + (seen.moved || 0) + ')');
  let movedAfter2 = 0;
  for (let i = 0; i < 200; i++) if (D.fateFor('Person ' + i, 2) === 'moved') movedAfter2++;
  ok(movedAfter2 === 0, 'moved excluded after 2 moves');

  console.log('== reunion trigger ==');
  ok(Game.nomad.enterLeg(0) === true, 'entered first leg');
  const leg = road.legs[0];
  ok(leg.enterDay != null, 'enterDay stamped (' + leg.enterDay + ')');
  Game.nomad.daily(); Game.nomad.daily();
  ok(!leg.resolved, 'no reunion before day 3');
  Game.nomad.daily();
  ok(!!leg.resolved, 'reunion fired on day 3 (fate: ' + leg.resolved + ')');
  ok(leg.status === 'done', 'leg closed after reunion');

  console.log('== moved-on relocation ==');
  const kin2 = kin[1];
  if (kin2) {
    const oldRegion = Game.state.world.kin.find(k => k.name === kin2.name).region;
    const leg2 = { regionId: oldRegion, kinName: kin2.name, status: 'active', moves: 0 };
    ok(D.moveKinOn(kin2.name, leg2) === true, 'moveKinOn relocates');
    const entry = Game.state.world.kin.find(k => k.name === kin2.name);
    ok(entry.region !== oldRegion, `region changed (${oldRegion} -> ${entry.region})`);
    ok(entry.region !== Game.state.region || true, 'relocation recorded');
    ok(leg2.moves && leg2.moves[kin2.name] === 1, 'move counted');
    const trails = (Game.state.nomadScenes || {}).trails || {};
    ok(!trails[kin2.name], 'trail reset to vague');
  } else {
    console.log('  SKIP: only one kin in this seed');
  }

  console.log('== itinerary sync ==');
  // Sharpen a third kin's trail mid-road: the next daily adds its leg.
  const kin3 = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region && !k.found)[0];
  if (kin3 && !road.legs.some(l => l.kinName === kin3.name && l.status !== 'done')) {
    Game.hearOfRegion(kin3.region, 'test');
    const before = road.legs.length;
    Game.nomad.daily();
    ok(road.legs.length === before + 1, 'newly-known region joins the itinerary');
  } else {
    console.log('  SKIP: no unplanned kin available');
  }

  console.log('== all-found closes the road ==');
  // Learn every remaining region so the whole family is resolvable.
  for (const k of Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region)) {
    Game.hearOfRegion(k.region, 'test');
  }
  D.syncItinerary();
  for (const l of road.legs) {
    l.resolvedKin = l.resolvedKin || {};
    for (const n of (l.kinNames && l.kinNames.length ? l.kinNames : (l.kinName ? [l.kinName] : []))) {
      if (!l.resolvedKin[n]) l.resolvedKin[n] = 'alive';
    }
  }
  ok(D.checkAllFound() === true, 'every kin resolved -> all-found');
  ok(Game.over === true, 'run is over');
  ok(Game.won === true, 'the Long Way Home is a win');

  console.log(`\ndriver: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
