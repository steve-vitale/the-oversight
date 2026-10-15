#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('gift-food-budget');
(async () => {
  const G = await K.load({ seed: 7 });
  let s, v, me, npc;
  function fresh() {
    K.newRun(G); s = G.state.scholar; v = G.state.village;
    me = G.villagerId; npc = v.roster.find(id => id !== me);
    s.day = 85; s.kcal = 2000; s.inventory = []; G.npcNeeds(npc).hunger = 80;
  }
  const food = (units, kcalEach, more = {}) => ({ name: 'Prepared harvest', units, kcalEach, safe: true,
    spoilDay: 9999, kg: .1, harvestShares: { [me]: 1 }, ...more });
  const rec = () => v.harvestIntake?.[s.day]?.[npc];
  const near = (a, b) => Math.abs(a - b) < 1e-8;
  fresh(); s.inventory = [food(10, 50)];
  let result = G.giveFood(npc, 'meal');
  T.ok('three small portions relieve only the hunger their actual 150 kcal can pay', result?.ok && near(G.npcNeeds(npc).hunger, 74));
  T.ok('meal receipt agrees with the actual relief and physical cost', rec().kcal === 150 && rec().nourishment === 150 && s.inventory[0].units === 7);
  fresh(); s.inventory = [food(1, 1)]; G.giveFood(npc, 'bite');
  T.ok('one-calorie crumbs cannot replace a meal', near(G.npcNeeds(npc).hunger, 79.96) && rec().nourishment === 1);
  fresh(); s.inventory = [food(10, 50)]; result = G.giveFood(npc, 'full');
  T.ok('an insufficient full gift consumes real available food and leaves honest hunger', result?.units === 10 && G.npcNeeds(npc).hunger === 60 && !s.inventory.length);
  T.ok('scarce full gift retains its actual producer and nourishment', rec().harvestKcal[me] === 500 && rec().harvestNourishment[me] === 500);
  fresh(); s.inventory = [food(60, 50)]; result = G.giveFood(npc, 'full');
  T.ok('an ample full gift draws enough energy and stops without wasting the rest', result?.units === 40 && G.npcNeeds(npc).hunger === 0 && s.inventory[0].units === 20);
  T.ok('full nourishment equals the hunger actually removed', rec().kcal === 2000 && rec().nourishment === 2000);
  fresh(); G.npcNeeds(npc).hunger = 60; s.inventory = [food(2, 50), food(3, 800)];
  result = G.giveFood(npc, 'full');
  T.ok('mixed stacks keep whole-unit rounding and stop once full', result?.units === 4 && s.inventory.length === 1 && s.inventory[0].units === 1 && rec().kcal === 1700 && rec().nourishment === 1500);
  fresh(); s.inventory = [food(1, 5000)]; G.giveFood(npc, 'bite');
  T.ok('a rich bite retains its bite-size relief cap without inventing absorption', G.npcNeeds(npc).hunger === 55 && rec().kcal === 5000 && rec().nourishment === 625);
  fresh(); s.inventory = [food(3, 500)]; G.giveFood(npc, 'meal');
  T.ok('an adequate ordinary meal keeps its existing 60-hunger benefit', G.npcNeeds(npc).hunger === 20 && rec().nourishment === 1500);
  fresh(); result = G.giveFood(npc, 'full');
  T.ok('empty packs cannot feed anyone', !result && G.npcNeeds(npc).hunger === 80 && !rec());
  fresh(); s.inventory = [food(6, 50)]; G.giveFood(npc, 'meal'); G.giveFood(npc, 'meal');
  T.ok('splitting the same finite food into gifts cannot multiply its feeding power', G.npcNeeds(npc).hunger === 68 && rec().nourishment === 300 && !s.inventory.length);
  fresh(); G.npcNeeds(npc).hunger = 0; s.inventory = [food(10, 50)]; G.giveFood(npc, 'full');
  T.ok('an already-fed recipient cannot create more hunger credit', rec().nourishment === 0 && G.npcNeeds(npc).hunger === 0);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
