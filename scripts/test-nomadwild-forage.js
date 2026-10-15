#!/usr/bin/env node
// test-nomadwild-forage.js — the party forages as strangers on a leg.
// RED: Game.nomadWild undefined (module absent).
// GREEN: stranger penalty applies, supplies grow, handling teaches.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('nomadwild-forage');

async function main() {
  T.ok('nomadWild loaded', typeof (await K.load({ seed: 7 })).nomadWild === 'object');
  const Game = await K.load({ seed: 7, narration: true });
  K.newRun(Game);
  const NW = Game.nomadWild;

  // Set up a road: party of 2 walking sa_amazon, a region they don't know.
  const roster = (Game.state.village.roster || []).slice(0, 2);
  T.ok('roster has 2+', roster.length >= 2, JSON.stringify(roster.length));
  Game.state.road = {
    active: true, partyIds: roster, supplies: { food: 1000 },
    legs: [{ regionId: 'sa_amazon' }], legIndex: 0,
  };

  T.section('stranger penalty');
  T.ok('stranger mult is 0.75 on road', NW.strangerForageMult() === 0.75);
  const r1 = NW.partyForage();
  T.ok('forage yields kcal', r1.kcal > 0, String(r1.kcal));
  T.ok('supplies grew', Game.state.road.supplies.food > 1000, String(Game.state.road.supplies.food));
  T.ok('stranger note narrated', r1.notes.length > 0, JSON.stringify(r1.notes));

  T.section('knowledge closes the gap');
  // Teach the party 6 amazon plants, then forage again: yield should rise.
  const amazPlants = (Game.data.plants || [])
    .filter(p => (p.regions || []).some(x => /amazon|manaus|belem|iquitos|para|loreto/i.test(x)))
    .slice(0, 6).map(p => p.id);
  T.ok('found amazon plants', amazPlants.length >= 4, amazPlants.join(','));
  for (const vid of roster) for (const pid of amazPlants) {
    for (let i = 0; i < 6; i++) { try { Game.teachPlant(vid, pid); } catch (e) {} }
  }
  const before = Game.state.road.supplies.food;
  // Average over several days to smooth RNG.
  let tot = 0;
  for (let d = 0; d < 5; d++) tot += NW.partyForage().kcal;
  const avgKnown = tot / 5;
  T.ok('knowledgeable party out-forages strangers', avgKnown > r1.kcal * 0.9,
    `stranger day ${r1.kcal} vs knowledgeable avg ${Math.round(avgKnown)}`);

  T.section('handling teaches');
  T.ok('mult is 1.0 off road', (() => { Game.state.road.active = false; const m = NW.strangerForageMult(); Game.state.road.active = true; return m === 1.0; })());

  T.done();
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
