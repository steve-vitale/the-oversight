#!/usr/bin/env node
// Prepared food, real harvest/processing/transfer calls; not natural deed access.
'use strict';
const K = require('./lib'), T = K.reporter('harvest-source');
(async () => {
  const saves = new Map();
  global.localStorage = {
    getItem: k => saves.get(String(k)) ?? null,
    setItem: (k, value) => saves.set(String(k), String(value)),
    removeItem: k => saves.delete(String(k)),
    key: i => [...saves.keys()][i] ?? null,
    get length() { return saves.size; },
  };
  const G = await K.load({ seed: 7 });
  let s, v, me, npc;
  const eq = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});
  const frac = (item, who) => item?.harvestShares?.[who] || 0;
  const close = (a, b) => Math.abs(a - b) < 1e-10;
  function fresh() {
    K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; s.kcal = 10000; s.inventory = [];
    me = G.villagerId; npc = v.roster.find(id => id !== me);
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4;
    v.pantry = []; v.trust[me] = 100; v.gives = { [me]: 100000 };
  }
  fresh();
  const plant = G.data.plants.find(p => p.id === 'dandelion');
  G.state.codex.plants[plant.id] = { level: 3, prepKnown: true };
  G.makePlot();
  Object.assign(G.gardenPlots()[0], { pid: plant.id, plantedDay: 1, lastHarvest: 1, lastTend: 85, weeds: 0, dead: false });
  G.harvestGarden();
  const harvest = s.inventory.find(x => x.plantId === plant.id);
  T.ok('actual player garden harvest identifies its real harvester', frac(harvest, me) === 1);
  T.ok('source tracking changes no garden yield', harvest.units === 167 && harvest.kcalEach === 45);
  G.donateToPantry(s.inventory.indexOf(harvest));
  T.ok('actual donation keeps the harvester, rather than inventing a donor source', frac(v.pantry[0], me) === 1);
  const draw = G.pantryDraw(v, 1000, { cook: true, round: 'floor1' });
  T.ok('real cooked pantry draw retains source and whole-unit rounding', draw.taken === 990 && draw.items.every(x => frac(x.item, me) === 1));
  G.takeFromPantryBulk({ 0: 2 });
  T.ok('bulk pantry withdrawal carries source through its explicit field copy', s.inventory.some(x => frac(x, me) === 1 && x.units === 2));
  s.inventory = []; G.takeFromPantry(0);
  T.ok('single pantry withdrawal carries source through its explicit field copy', s.inventory.some(x => frac(x, me) === 1 && x.units === 1));
  v.pantry = []; G.gardenPlots()[0].lastHarvest = 1;
  G.resolveOneAssignment(npc, { task: 'garden' });
  T.ok('actual NPC garden duty identifies its own canonical actor', v.pantry.length > 0 && v.pantry.every(x => frac(x, npc) === 1 && !frac(x, me)));
  T.ok('NPC harvest remains physical portions, not a source-only credit', v.pantry.reduce((n, x) => n + x.units * x.kcalEach, 0) === 4200);
  v.pantry = []; G.resolveOneAssignment(npc, { task: 'forage' });
  T.ok('actual NPC forage duty attributes its own haul', v.pantry.length > 0 && v.pantry.every(x => frac(x, npc) === 1));

  fresh();
  G.map.px = 5; G.map.py = 4; s.mx = 4; s.my = 4;
  const tile = G.tileAt(5, 4);
  G.genDetail(5, 4); tile.type = 'forest'; tile.stock = 9; tile.maxStock = 9; tile.vigor = 100; tile.detailRegrow = {};
  tile.plantSpecies = {};
  for (let y = 3; y <= 5; y++) for (let x = 3; x <= 5; x++) {
    tile.detail[y] = tile.detail[y] || {}; tile.detail[y][x] = 'plant'; tile.plantSpecies[`${x},${y}`] = plant.id;
  }
  G.state.codex.plants[plant.id] = { level: 3, prepKnown: true };
  G.doAction('forage');
  const wild = s.inventory.filter(x => x.plantId === plant.id);
  T.ok('actual player wild-forage action attributes the real harvest', wild.length > 0 && wild.every(x => frac(x, me) === 1));

  fresh();
  v.pantry = [{ name: 'Harvest', units: 4, kcalEach: 100, kg: 0.1, spoilDay: 90, harvestShares: { [npc]: 1 } }];
  K.giveAbility(G, 'thief');
  const lifted = G.activateAbility('thief.steal_pantry');
  T.ok('actual Light Fingers transfers the food source, not the thief identity', s.inventory.some(x => x.units === 2 && frac(x, npc) === 1 && !frac(x, me)), JSON.stringify({ lifted, inventory: s.inventory, actions: G.activatableAbilities().filter(x => x.id.includes('steal')) }));

  fresh();
  const old = G.foodForageItem(plant, true, 4, 180, s.day);
  const own = G.foodForageItem(plant, true, 4, 180, s.day, { [me]: 1 });
  const other = G.foodForageItem(plant, true, 4, 180, s.day, { [npc]: 1 });
  T.ok('legacy food reads do not invent an origin', !old.harvestShares);
  T.ok('explicit wild-plant creation retains a source without changing fungibility', frac(own, me) === 1 && G.stacksMatch(old, own) && G.stacksMatch(own, other));
  s.inventory = [own]; G.donateToPantry(0);
  s.inventory = [other]; G.donateToPantry(0);
  s.inventory = [old]; G.donateToPantry(0);
  T.ok('real donation merges owners and legacy food proportionally in one stack', v.pantry.length === 1 && v.pantry[0].units === 12 && close(frac(v.pantry[0], me), 1 / 3) && close(frac(v.pantry[0], npc), 1 / 3));
  const blended = v.pantry[0].harvestShares;
  G.takeFromPantryBulk({ 0: 2 });
  T.ok('taking part of a mixture preserves shares on both whole-unit sides', eq(s.inventory[0]?.harvestShares, blended) && eq(v.pantry[0]?.harvestShares, blended));
  const before = JSON.stringify(v.pantry[0]?.harvestShares);
  s.inventory[0].spoilDay = v.pantry[0].spoilDay;
  G.donateToPantry(0);
  T.ok('donation/take-back cannot grow source fractions', JSON.stringify(v.pantry[0]?.harvestShares) === before && v.pantry[0].units === 12);

  fresh();
  G.addUnknownToLump(plant, 3, s.day, undefined, { [me]: 1 });
  G.addUnknownToLump(plant, 1, s.day, undefined, { [npc]: 1 });
  G.addUnknownToLump(plant, 4, s.day);
  const lump = s.inventory[0], entry = lump.lump[plant.id];
  T.ok('unknown mixed-species ledger preserves per-species harvester shares', close(frac(entry, me), 3 / 8) && close(frac(entry, npc), 1 / 8) && lump.edible === false && lump.kcalEach === 0);
  G.stageForPrep();
  const stash = G.prepStash();
  const sorted = G.splitLumpOut(stash[0], plant.id, stash);
  T.ok('identification after staging preserves source without credit for unknown food', close(frac(sorted, me), 3 / 8) && close(frac(sorted, npc), 1 / 8) && sorted.units === 8 && !s.inventory.length);
  G.addUnknownToLump(plant, 2, s.day, undefined, { [npc]: 1 });
  G.addUnknownToLump(plant, 2, s.day, stash, { [me]: 1 });
  G.stageForPrep();
  const stagedLump = stash.find(x => x.lump);
  T.ok('staging merges the same species without overwriting either source', close(frac(stagedLump?.lump[plant.id], me), 0.5) && close(frac(stagedLump?.lump[plant.id], npc), 0.5));
  const nut = G.data.plants.find(x => x.id === 'acorn_white_oak');
  const nuts = G.foodForageItem(nut, true, 2, 100, s.day, { [npc]: 1 });
  const nutPack = [nuts]; G.shellNuts(0, nutPack);
  T.ok('actual nut processing keeps its source while reducing edible energy', frac(nuts, npc) === 1 && nuts.edible && nuts.foodState === 'shelled' && nuts.kcalEach < nut.caloriesPerUnit);

  fresh();
  G.learnTechnique('render', 'trial');
  s.inventory = [
    { name: 'Smoked meat', foodKind: 'meat', foodState: 'preserved', units: 2, kcalEach: 400, spoilDay: 100 },
    { name: 'Rendered fat', foodKind: 'fat', foodState: 'rendered', units: 1, kcalEach: 400, spoilDay: 100 },
    { name: 'Berries', plantId: 'blackberry', foodKind: 'plant', edible: true, units: 2, kcalEach: 200, spoilDay: 100, harvestShares: { [npc]: 1 } },
  ];
  G.makePemmican();
  const bars = s.inventory.find(x => x.itemId === 'pemmican');
  T.ok('real mixed-ingredient pemmican retains only its harvested berry energy share', !!bars && close(frac(bars, npc), 0.25) && !frac(bars, me));
  T.ok('source preservation leaves pemmican calories and whole bars unchanged', bars?.units === 3 && bars.kcalEach === 517);
  const stamp = JSON.stringify(bars?.harvestShares);
  v.pantry = [];
  G.pantryAdd(bars);
  T.ok('finished-food shelving retains the source of a mixed recipe', close(frac(v.pantry[0], npc), 0.25));
  G.save();
  const runKey = G.state.runKey;
  s.inventory = [];
  const loaded = G.load(runKey);
  T.ok('real save/load restores the source ledger on inventory and pantry food', loaded && stamp && JSON.stringify(G.state.scholar.inventory.find(x => x.itemId === 'pemmican')?.harvestShares) === stamp && close(frac(G.state.village.pantry[0], npc), 0.25));
  const predecessor = G.villagerId;
  G.hurtVillager(predecessor, 999, 'contest');
  T.ok('real mantle succession keeps the original harvest source on stored food', G.villagerId !== predecessor && close(frac(G.state.village.pantry[0], npc), 0.25) && !frac(G.state.village.pantry[0], predecessor));
  T.ok('no source prerequisite silently replaces the unfinished god deed', globalThis.Scattering.Godhood.byId('living_garden').requires.deed === null && !G.state.village.godpathDeeds);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
