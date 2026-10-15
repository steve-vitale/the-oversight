#!/usr/bin/env node
// Prepared resources, real harvest/donation/meal paths; no natural-access claim.
'use strict';
const K = require('./lib'), fs = require('fs'), crypto = require('crypto');
(async () => {
  const G = await K.load({ seed: 7 });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  s.day = 85; s.kcal = 10000;
  G.map.px = v.px ?? 4; G.map.py = v.py ?? 4;
  const player = G.villagerId, npc = v.roster.find(id => id !== player);
  const plant = G.data.plants.find(p => p.caloriesPerUnit > 0 && ['shoots', 'berries', 'roots'].includes(p.form));
  G.state.codex.plants[plant.id] = { level: 3, prepKnown: true };
  if (!G.gardenPlots().length) G.makePlot();
  const plot = G.gardenPlots()[0];
  Object.assign(plot, { pid: plant.id, plantedDay: 1, lastHarvest: 1, lastTend: 85, weeds: 0, dead: false });
  const clone = x => JSON.parse(JSON.stringify(x));
  const sourceHashes = {};
  for (const rel of ['src/js/game.js', 'src/js/food.js', 'src/js/godpath.js', 'src/data/godpaths.json', 'scripts/godpath/probe-garden-provenance.js'])
    sourceHashes[rel] = crypto.createHash('sha256').update(fs.readFileSync(K.ROOT + '/' + rel)).digest('hex');
  s.inventory = []; v.pantry = [];
  G.harvestGarden();
  const harvested = clone(s.inventory);
  const beforeDonate = { day: s.day, inventoryKcal: harvested.reduce((n, i) => n + i.units * i.kcalEach, 0) };
  G.donateToPantry(0);
  const donated = clone(v.pantry);
  const playerHarvestDraw = clone(G.pantryDraw(v, 1000, { cook: true, round: 'floor1' }));
  const garden = G.gardenPlots()[0];
  garden.lastHarvest = 1; garden.dead = false; garden.weeds = 0;
  v.pantry = [];
  G.resolveOneAssignment(npc, { task: 'garden' });
  const npcHarvest = clone(v.pantry);
  const npcHarvestDraw = clone(G.pantryDraw(v, 1000, { cook: true, round: 'floor1' }));
  const mealDraws = [], draw = G.pantryDraw;
  G.pantryDraw = function (...args) {
    const result = draw.apply(this, args);
    mealDraws.push(clone(result));
    return result;
  };
  // A wounded, hungry diner cannot meet the whole day from their own work.
  v.health = v.health || {}; v.health[npc] = 10;
  G.npcNeeds(npc).hunger = 60;
  const npcNeedsBefore = clone(G.npcNeeds(npc));
  const actualNpcMeal = G.villagerMealDay(npc, G.getPerson(npc), v, { cookId: null });
  G.pantryDraw = draw;
  const npcNeedsAfter = clone(G.npcNeeds(npc));
  const god = globalThis.Scattering.Godhood.byId('living_garden');
  const out = {
    prepared: true, seed: 7, player, npc, plant: plant.id, sourceHashes,
    beforeDonate, playerHarvest: harvested, donated, playerHarvestDraw: clone(playerHarvestDraw),
    npcHarvest, npcHarvestDraw: clone(npcHarvestDraw),
    actualNpcMeal, mealDraws, npcNeedsBefore, npcNeedsAfter,
    existingGodRequirement: god.requires,
    notes: [
      'Prepared ripe plot and empty stores; actual harvestGarden/donateToPantry/resolveOneAssignment/pantryDraw.',
      'Actual NPC meal uses a prepared 10-HP, hunger-60 diner; ordinary production and meal code remain enabled.',
      'pantryDraw consumes physical food and reports items, units and effective kcal; it does not know the eater.',
      'Inspect recorded player/NPC harvest stacks for source identity; this probe does not invent it.',
      'No production changes; no seven-day or natural acquisition claim.'
    ]
  };
  if (!harvested.length || !donated.length || !playerHarvestDraw.taken || !npcHarvest.length || !npcHarvestDraw.taken || !actualNpcMeal.drawn || !mealDraws.length)
    throw new Error('The real resource path did not execute; refuse an empty provenance report.');
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
})().catch(e => { console.error(e); process.exitCode = 1; });
