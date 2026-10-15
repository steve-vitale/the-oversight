#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('regional-trap');
(async () => {
  const G = await K.load({ seed: 7 }); G.debugRegion = 'eu_temperate'; K.newRun(G);
  const s = G.state.scholar;
  G.map.px = 3; G.map.py = 4; s.insideHaven = false;
  s.kcal = 5000; s.energy = 100; s.hydration = 100;
  s.inventory = [{ material: 'vine', units: 8, kg: 0.1 }, { material: 'stick', units: 8, kg: 0.1 }, { itemId: 'stone_knife', units: 1, kg: 0.4 }];
  s.tools = []; G.state.codex.recipes.snare = { level: 3 }; delete G.state.codex.recipes.hide_armor;
  const beforeVine = G.materialCount('vine'), ticks = s.dayTicks;
  G.craft('snare'); G.setTrap('snare');
  const tile = G.playerTile(), trap = (tile.traps || [])[0];
  T.ok('real snare craft and placement spend materials and time', !!trap && G.materialCount('vine') < beforeVine && s.dayTicks > ticks);
  tile.wildlife = { european_rabbit: 2 }; tile.trapShy = {};
  const uses = trap && trap.uses, random = Math.random;
  try { Math.random = () => 0; G.checkTraps(); } finally { Math.random = random; }
  const carcass = s.inventory.find(i => i.plantId === 'meat_european_rabbit' && i.foodState === 'carcass');
  T.ok('real regional rabbit becomes a carcass and leaves the finite tile population', !!carcass && tile.wildlife.european_rabbit === 1);
  T.ok('catch uses the existing durability cost and gross, not ready food', !!carcass && carcass.hiddenKcal === G.data.animals.find(a => a.id === 'european_rabbit').calories && trap.uses === uses - 1 && !carcass.kcalEach);
  if (carcass) G.cleanCarcass(s.inventory.indexOf(carcass));
  T.ok('actual regional butchering yields hide and its L1 handling lesson', s.inventory.some(i => i.material === 'hide' && i.units > 0) && ((G.state.codex.recipes.hide_armor || {}).level === 1));
  const before = s.inventory.length, remaining = trap && trap.uses;
  tile.wildlife = { brown_bear: 1 }; tile.trapShy = {};
  try { Math.random = () => 0; G.checkTraps(); } finally { Math.random = random; }
  T.ok('a small snare cannot catch a regional apex predator or invent absent rabbits', s.inventory.length === before && tile.wildlife.brown_bear === 1 && trap.uses === remaining);
  // A separate prepared water scene uses the same public craft/set/check path.
  K.newRun(G); const waterScholar = G.state.scholar;
  G.map.px = 3; G.map.py = 4; waterScholar.insideHaven = false;
  waterScholar.kcal = 5000; waterScholar.energy = 100;
  waterScholar.inventory = [{ material: 'branch', units: 8, kg: 0.1 }, { material: 'vine', units: 8, kg: 0.1 }];
  waterScholar.tools = []; G.state.codex.recipes.fish_basket = { level: 3 };
  const water = G.playerTile(); water.type = 'creek'; water.traps = []; water.trapShy = {};
  G.craft('fish_basket'); G.setTrap('fish_basket'); water.wildlife = { roach: 2 };
  try { Math.random = () => 0; G.checkTraps(); } finally { Math.random = random; }
  const fish = waterScholar.inventory.find(i => i.plantId === 'meat_roach' && i.foodState === 'carcass');
  T.ok('a paid basket catches real regional fish and depletes that stock', !!fish && water.wildlife.roach === 1 && water.traps[0].uses === 5);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
