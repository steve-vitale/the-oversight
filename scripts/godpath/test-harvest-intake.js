#!/usr/bin/env node
// Prepared food, real eating/packing/gifting/feast calls; not natural deed access.
'use strict';
const K = require('./lib'), T = K.reporter('harvest-intake');
(async () => {
  const saves = new Map();
  global.localStorage = { getItem: k => saves.get(String(k)) ?? null, setItem: (k, x) => saves.set(String(k), String(x)), removeItem: k => saves.delete(String(k)), key: i => [...saves.keys()][i] ?? null, get length() { return saves.size; } };
  const G = await K.load({ seed: 7 });
  let s, v, me, npc, producer;
  const rec = who => v.harvestIntake?.[s.day]?.[who || me];
  const near = (a, b) => Math.abs((a || 0) - b) < 1e-8;
  const food = (units = 4, kcalEach = 500) => ({ name: 'Harvest', units, kcalEach, spoilDay: 9999, kg: 0.1, safe: true, harvestShares: { [producer]: 1 } });
  function fresh() {
    K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; s.kcal = 0; s.inventory = []; s.insideHaven = true;
    me = G.villagerId; [npc, producer] = v.roster.filter(x => x !== me);
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4;
    v.pantry = []; v.trust[me] = 100; v.gives = { [me]: 100000 };
  }
  fresh(); s.inventory = [food()];
  G.donateToPantry(0); G.takeFromPantry(0);
  T.ok('real donation and withdrawal are not eating', !v.harvestIntake);
  G.eatOne(0);
  T.ok('actual pack bite credits the eater and real producer', rec()?.kcal === 500 && rec()?.harvestKcal[producer] === 500 && !rec()?.harvestKcal[me]);
  T.ok('pack bite records actual nourishment and one consumed unit', rec()?.nourishment === 500 && rec()?.routes.pack.kcal === 500 && !s.inventory.length);

  fresh(); s.kcal = G.kcalCap(); s.inventory = [food(1)]; G.eatOne(0);
  T.ok('a refused full-body bite cannot manufacture a receipt', !v.harvestIntake && s.inventory[0].units === 1);
  s.kcal -= 100; G.eatOne(0);
  T.ok('a whole bite distinguishes consumed food from reserve overflow', rec()?.kcal === 500 && rec()?.nourishment === 100 && rec()?.harvestNourishment[producer] === 100);

  fresh(); s.kcal = G.kcalCap(); G.prepStash().push(food(1)); G.eatStashOne(0);
  T.ok('actual counter bite records physical consumption with zero reserve gain', rec()?.routes.counter.kcal === 500 && rec()?.nourishment === 0 && G.prepStash().length === 0);
  fresh(); s.kcal = G.kcalCap() - 600; s.inventory = [food(4)]; G.eat();
  T.ok('bulk eating records only units actually consumed and the clipped reserve gain', rec()?.kcal === 1000 && rec()?.nourishment === 600 && s.inventory[0].units === 2);

  fresh(); s.inventory = [{ ...food(1), edible: false, foodState: 'unknown', kcalEach: 0, hiddenKcal: 500 }]; G.eatOne(0);
  T.ok('unidentified food earns no eating receipt', !v.harvestIntake);
  s.inventory = [{ ...food(1), spoilDay: 1 }]; G.eatOne(0);
  T.ok('refused spoiled food earns no eating receipt', !v.harvestIntake);

  fresh(); s.inventory = [food(4, 200)]; G.npcNeeds(npc).hunger = 60; G.giveFood(npc, 'meal');
  T.ok('actual food handoff records consumed portions, not the fixed hunger-relief number', rec(npc)?.kcal === 600 && rec(npc)?.harvestKcal[producer] === 600 && s.inventory[0].units === 1);
  G.npcNeeds(npc).hunger = 0; G.giveFood(npc, 'bite');
  T.ok('a surplus gift records no invented hunger nourishment', rec(npc)?.kcal === 800 && rec(npc)?.nourishment === 600);

  fresh(); v.pantry = [food(12)];
  const packed = G.packKcal(npc);
  T.ok('real ration packing retains source without claiming consumption', packed > 0 && v.pack[npc].harvestShares?.[producer] === 1 && !v.harvestIntake);
  G.packSpend(npc, 100);
  T.ok('ration transfer/spending alone is not an eating receipt', !v.harvestIntake);
  const before = v.pack[npc].kcal, eaten = G.packMeal(npc, 200, G.freshExposure());
  T.ok('actual away meal credits only the ration consumed', eaten === 200 && rec(npc)?.kcal === 200 && rec(npc)?.harvestKcal[producer] === 200 && v.pack[npc].kcal === before - 200);
  fresh(); v.pack = { [npc]: { day: s.day, kcal: 500, risks: G.freshExposure() } }; G.packMeal(npc, 200, G.freshExposure());
  T.ok('an old untraced ration never acquires a harvester', rec(npc)?.kcal === 200 && Object.keys(rec(npc)?.harvestKcal || {}).length === 0);
  fresh(); s.kcal = 3000; v.pack = { [npc]: { day: s.day, kcal: 1000, risks: G.freshExposure(), harvestShares: { [producer]: 1 } } };
  const random = Math.random; Math.random = () => 0.99;
  try { G.stealFrom(npc); } finally { Math.random = random; }
  T.ok('an actual stolen ration carries the original food source without an eating credit', s.inventory.some(x => x.stolen && x.harvestShares?.[producer] === 1) && !v.harvestIntake);
  s.kcal = 0; G.eatOne(0);
  T.ok('eating a stolen ration credits its producer rather than the thief or victim', rec()?.harvestKcal[producer] === 150 && !rec()?.harvestKcal[npc] && !rec()?.harvestKcal[me]);

  fresh(); v.health = { [npc]: 10 }; G.npcNeeds(npc).hunger = 60; v.pantry = [food(12)];
  const homeMeal = G.villagerMealDay(npc, G.getPerson(npc), v, { cookId: null });
  T.ok('real home meal separates personal production from pantry harvest', rec(npc) && near(rec(npc).kcal, homeMeal.ate) && near(rec(npc).harvestKcal[producer], homeMeal.drawn) && rec(npc).routes['personal-work'].kcal > 0);
  fresh(); v.health = { [npc]: 10 }; G.npcNeeds(npc).hunger = 60; v.pantry = [food(12)]; v.away = { [npc]: { sinceDay: s.day, duration: 2 } };
  const awayMeal = G.villagerMealDay(npc, G.getPerson(npc), v, { cookId: null });
  T.ok('real away daily meal does not double count its packed ration', rec(npc) && near(rec(npc).kcal, awayMeal.ate) && near(rec(npc).harvestKcal[producer], awayMeal.drawn) && near(rec(npc).routes.ration?.kcal, awayMeal.drawn));

  fresh(); v.pantry = [food(20)]; const beforeMeal = s.kcal; G.villageMeal();
  T.ok('actual player communal meal carries consumed and nourished source receipts', rec()?.routes.pantry.kcal > 0 && near(rec()?.nourishment, s.kcal - beforeMeal) && near(rec()?.harvestKcal[producer], rec()?.kcal));
  fresh();
  const guestCamp = { id: 'intake_guest_camp', name: 'Guest camp', x: 5, y: 4, pantryKcal: 3000, trust: 30 };
  G.state.otherVillages.push(guestCamp); s.joinedVillage = guestCamp.id; G.map.px = 5; G.map.py = 4; G.villageMeal();
  T.ok('actual joined-village meal records anonymous food without inventing a harvester', rec()?.routes['guest-pantry'].kcal === 2000 && rec()?.nourishment === 2000 && guestCamp.pantryKcal === 1000 && Object.keys(rec()?.harvestKcal || {}).length === 0, JSON.stringify({ rec: rec(), guestCamp, kcal: s.kcal }));
  s.kcal = 0; s.probation = { villageId: guestCamp.id, daysLeft: 3 }; guestCamp.pantryKcal = 3000;
  G.villageMeal();
  T.ok('real probation override adds only its actual half meal once', rec()?.routes['guest-pantry'].kcal === 3000 && rec()?.nourishment === 3000 && guestCamp.pantryKcal === 2000);
  fresh(); v.pantry = [food(20)]; v.rationing = { until: s.day + 1 }; G.villageMeal();
  const returned = v.pantry.filter(x => x.name === 'Ration returned');
  T.ok('real ration return is excluded from intake and keeps its harvest source', rec()?.kcal === 10000 - G.pantryKcal() && near(rec()?.nourishment, s.kcal) && returned.length > 0 && returned.every(x => x.harvestShares?.[producer] === 1));
  const priorIntake = rec()?.kcal;
  G.takeFromPantry(v.pantry.indexOf(returned[0]));
  T.ok('taking back a returned ration is still not eating', rec()?.kcal === priorIntake);
  const returnedCalories = s.inventory[0]?.kcalEach;
  G.eatOne(0);
  T.ok('eating that returned portion adds one real serving from the original harvest', rec()?.kcal === priorIntake + returnedCalories && near(rec()?.harvestKcal[producer], rec()?.kcal));

  fresh(); v.pantry = [food(40)]; s.kcal = 1000; v.trust[npc] = 80; v.sick = {}; G.npcNeeds(npc).hunger = 60;
  const feast = G.hostFeast({ guests: [npc] });
  const diners = [rec(me), rec(npc)];
  T.ok('actual feast allocates consumed energy once across the people who ate', feast?.ok && diners.every(Boolean) && near(diners.reduce((n, r) => n + r.routes.feast.kcal, 0), 20000 - G.pantryKcal()));
  T.ok('feast receipt exposes the existing host reserve gap without inventing food', rec()?.routes.feast.kcal > 0 && rec()?.routes.feast.nourishment === 0 && s.kcal <= 1000);
  fresh(); v.pantry = [food(40)]; s.kcal = 1000; v.trust[npc] = 80; v.sick = {}; v.npcAbilities[npc] = ['fusion_reactor'];
  const coldFeast = G.hostFeast({ guests: [npc] });
  T.ok('a real fusion cold seat consumes no credited feast portion', coldFeast?.ok && !rec(npc) && rec()?.routes.feast.kcal > 0);
  fresh(); s.inventory = [food(3)]; G.hurtVillager(npc, 999, 'contest'); G.giveFood(npc, 'meal');
  T.ok('a dead recipient cannot be counted as a living food consumer', !rec(npc));

  fresh(); s.inventory = [{ itemId: 'genesis_seed', units: 1 }]; G.plantGenesis(); G.checkGenesis();
  T.ok('a newly planted real Genesis crop retains its planter source', s.inventory.some(x => x.name === 'Genesis fruit' && x.harvestShares?.[me] === 1));
  const tile = G.playerTile(); tile.genesis = { daysLeft: 2, plantedDay: 1 }; s.inventory = []; G.checkGenesis();
  T.ok('a legacy Genesis crop never invents a former planter', s.inventory.some(x => x.name === 'Genesis fruit' && !x.harvestShares));
  for (const known of [false, true]) {
    fresh(); s.kcal = 3000; G.map.px = 5; G.map.py = 4; s.mx = 4; s.my = 4;
    const patch = G.tileAt(5, 4); G.genDetail(5, 4);
    patch.type = 'forest'; patch.stock = 9; patch.maxStock = 9; patch.vigor = 100; patch.detailRegrow = {}; patch.plantSpecies = {};
    for (let y = 3; y <= 5; y++) for (let x = 3; x <= 5; x++) { patch.detail[y][x] = 'plant'; patch.plantSpecies[`${x},${y}`] = 'dandelion'; }
    G.state.codex.plants.dandelion = { level: 3 };
    if (known) G.state.codex.plants.rare_herb = { level: 2 }; else delete G.state.codex.plants.rare_herb;
    s.activeSynergies = ['farsight'];
    const rng = Math.random; Math.random = () => 0;
    try { G.doAction('forage'); } finally { Math.random = rng; }
    const rare = known ? s.inventory.find(x => x.plantId === 'rare_herb') : s.inventory.find(x => x.lump?.rare_herb)?.lump.rare_herb;
    T.ok(`actual ${known ? 'known' : 'unknown'} rare forage bonus preserves its real harvester`, rare?.harvestShares?.[me] === 1 && (known || !s.inventory.find(x => x.plantId === 'rare_herb')));
  }

  fresh();
  for (let day = 85; day <= 94; day++) { s.day = day; s.kcal = 0; s.inventory = [food(1)]; G.eatOne(0); }
  T.ok('successful eating bounds receipts to the last eight days', Object.keys(v.harvestIntake || {}).length === 8 && !v.harvestIntake?.[86] && !!v.harvestIntake?.[87]);
  const stamp = JSON.stringify(v.harvestIntake); G.save(); const key = G.state.runKey; v.harvestIntake = {}; const loaded = G.load(key); s = G.state.scholar; v = G.state.village;
  T.ok('real save/load restores the canonical intake receipts', loaded && !!stamp && stamp !== '{}' && JSON.stringify(v.harvestIntake) === stamp);
  const predecessor = me; G.hurtVillager(me, 999, 'contest');
  T.ok('real succession retains the former eater identity without transferring their meals', G.villagerId !== predecessor && !!v.harvestIntake?.[94]?.[predecessor] && !v.harvestIntake?.[94]?.[G.villagerId]);
  T.ok('the authored seven-day gate is still pending, not inferred from intake alone', globalThis.Scattering.Godhood.byId('living_garden').requires.deed === null);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
