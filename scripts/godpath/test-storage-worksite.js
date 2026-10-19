#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('storage-worksite');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) }); K.newRun(G);
  const s = G.state.scholar, v = G.state.village, hx = v.px ?? 4, hy = v.py ?? 4;
  const stock = (branch, stone, vine) => Object.entries({ branch, stone, vine }).map(([material, units]) => ({ material, name: material, units, kcalEach: 0, kg: 0.1 }));
  const resources = () => JSON.stringify({ inventory: s.inventory, tier: v.storageTier, cap: v.pantryCapKcal, water: v.waterCapL, ticks: s.dayTicks, kcal: s.kcal });
  const said = K.captureSays(G);
  // Prepared roles isolate the discount and its knowledge gate. These are
  // actual roster members; no specialist function or occupation gate is mocked.
  const builder = v.roster.find(id => id !== G.villagerId);
  const occupation = id => id === builder ? 'carpenter' : 'librarian';
  for (const id of v.roster) for (const person of [(v.rosterChars || {})[id], G.getPerson(id), G.data.villagers.find(p => p.id === id)]) if (person) person.formerOccupation = 'librarian';
  s.inventory = stock(30, 30, 30);
  G.map.px = 0; G.map.py = 0;
  let before = resources(); G.expandStorage();
  T.ok('remote building preserves materials, capacity, time and energy', resources() === before);
  T.ok('remote refusal explains the worksite', /Return to Haven/.test(said[said.length - 1]));
  G.map.px = hx - 1; G.map.py = hy;
  T.ok('neighbor still counts as near Haven for narration', G.playerAtHaven());
  before = resources(); G.expandStorage();
  T.ok('nearby narration is not permission to build on a different world tile', resources() === before);
  // Independent positive fixture: the old runtime's remote mutations must not
  // make the local-build negative control fail for an unrelated higher tier.
  v.storageTier = 0; v.pantryCapKcal = 120000; v.waterCapL = 40;
  G.map.px = hx; G.map.py = hy; s.inventory = stock(10, 6, 4);
  const startTicks = s.dayTicks; G.expandStorage();
  T.ok('ordinary local build raises tier and both capacities', G.storageTier() === 1 && G.pantryCapKcal() === 180000 && G.waterCapL() === 60);
  T.ok('ordinary local build consumes exact stock and 48 ticks', !s.inventory.some(i => i.material) && s.dayTicks === startTicks + 48);
  for (const id of v.roster) for (const person of [(v.rosterChars || {})[id], G.getPerson(id), G.data.villagers.find(p => p.id === id)]) if (person) person.formerOccupation = occupation(id);
  G.npcSetNode(builder, hx, hy);
  G.state.systemArrived = false; G.state.codex.people = G.state.codex.people || {}; delete G.state.codex.people[builder];
  T.ok('the actual local builder is available but their profession is unknown', G.specialistsHere('builder').some(p => p.id === builder) && !G.occupationKnown(builder));
  s.inventory = []; before = resources(); G.expandStorage();
  T.ok('insufficient materials cost nothing', resources() === before);
  T.ok('unknown builder profession is not leaked by the material warning', !/carpenter/i.test(said[said.length - 1]));
  G.state.codex.people[builder] = { occupation: { value: 'carpenter', sure: true } }; G.expandStorage();
  T.ok('learned builder profession is shown through the normal gate', /carpenter/i.test(said[said.length - 1]));
  // Tier-one costs are 18/11/7, halved and rounded for the actual builder.
  s.inventory = stock(9, 6, 4); const builderTicks = s.dayTicks; G.expandStorage();
  T.ok('local builder retains the actual material discount and 24-tick labor', !s.inventory.some(i => i.material) && s.dayTicks === builderTicks + 24);
  T.ok('second expansion keeps multiplicative pantry and additive water gains', G.storageTier() === 2 && G.pantryCapKcal() === 270000 && G.waterCapL() === 80);
  s.inventory = stock(100, 100, 100);
  K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 4, my: 4 });
  T.ok('combat refusal fixture uses an actual live fight', !!G.tbfight && !G.tbfight.over);
  before = resources(); G.expandStorage();
  T.ok('active combat cannot turn into storage construction', resources() === before && /Finish the fight/.test(said[said.length - 1]));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
