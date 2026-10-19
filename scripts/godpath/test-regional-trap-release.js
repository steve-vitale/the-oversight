#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('regional-trap');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED||7) }); G.debugRegion = 'eu_temperate'; K.newRun(G);
  T.ok('fixture lands in the actual current Europe region',G.state.region==='eu_temperate');
  const s = G.state.scholar;
  G.map.px = 3; G.map.py = 4; s.insideHaven = false;
  s.kcal = 5000; s.energy = 100; s.hydration = 100;
  s.inventory = [{ material: 'vine', units: 8, kg: 0.1 }, { material: 'stick', units: 8, kg: 0.1 }, { itemId: 'stone_knife', units: 1, kg: 0.4 }];
  s.tools = []; G.state.codex.recipes.snare = { level: 3 }; delete G.state.codex.recipes.hide_armor;
  const beforeVine = G.materialCount('vine'), ticks = s.dayTicks;
  G.craft('snare'); G.setTrap('snare');
  const tile = G.playerTile(), trap = (tile.traps || [])[0];
  T.ok('real snare craft and placement spend materials and time', !!trap && G.materialCount('vine') < beforeVine && s.dayTicks > ticks);
  tile.wildlife = { european_hare: 2 }; tile.trapShy = {};
  const uses = trap && trap.uses, random = Math.random;
  try { Math.random = () => 0; G.checkTraps(); } finally { Math.random = random; }
  const carcass = s.inventory.find(i => i.plantId === 'meat_european_hare' && i.foodState === 'carcass');
  T.ok('real regional hare becomes a carcass and leaves the finite tile population', !!carcass && tile.wildlife.european_hare === 1);
  T.ok('catch uses the existing durability cost and gross, not ready food', !!carcass && carcass.hiddenKcal === G.data.animals.find(a => a.id === 'european_hare').calories && trap.uses === uses - 1 && !carcass.kcalEach);
  if (carcass) G.cleanCarcass(s.inventory.indexOf(carcass));
  T.ok('actual regional butchering yields authored bone and cleaned meat', s.inventory.some(i => i.material === 'bone' && i.units > 0) && s.inventory.some(i=>i.plantId==='meat_european_hare'&&i.foodState!=='carcass'));
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
  G.craft('fish_basket'); G.setTrap('fish_basket'); water.wildlife = { european_perch: 2 };
  try { Math.random = () => 0; G.checkTraps(); } finally { Math.random = random; }
  const fish = waterScholar.inventory.find(i => i.plantId === 'meat_european_perch' && i.foodState === 'carcass');
  T.ok('a paid basket catches real regional fish and depletes that stock', !!fish && water.wildlife.european_perch === 1 && water.traps[0].uses === 5);
  water.wildlife={brown_trout:2};water.trapShy={};
  try{Math.random=()=>0;G.checkTraps()}finally{Math.random=random}
  T.ok('the same paid basket also catches actual regional trout',water.wildlife.brown_trout===1&&water.traps[0].uses===4&&waterScholar.inventory.some(i=>i.plantId==='meat_brown_trout'&&i.foodState==='carcass'));
  // Retain the legacy contract's hide/gear lesson on an actually authored
  // European hide animal. The current hare supplies bone, not hide.
  K.newRun(G);const hunter=G.state.scholar;G.map.px=3;G.map.py=4;hunter.insideHaven=false;hunter.kcal=5000;hunter.energy=100;
  hunter.inventory=[{material:'stick',units:8,kg:0.1},{itemId:'stone_knife',units:1,kg:0.4}];hunter.tools=[];G.state.codex.recipes.pit_trap={level:3};delete G.state.codex.recipes.hide_armor;
  // This prepared catch/handling case uses a successful ordinary craft roll;
  // a failed craft is legitimate and must not be mistaken for a trap bug.
  try{Math.random=()=>0;G.craft('pit_trap')}finally{Math.random=random}
  G.setTrap('pit_trap');const ground=G.playerTile();ground.wildlife={wild_boar:2};ground.trapShy={};
  try{Math.random=()=>0;G.checkTraps()}finally{Math.random=random}
  const boar=hunter.inventory.findIndex(i=>i.plantId==='meat_wild_boar'&&i.foodState==='carcass');
  T.ok('actual paid European pit takes a finite regional hide animal',boar>=0&&ground.wildlife.wild_boar===1);
  if(boar>=0)G.cleanCarcass(boar);
  T.ok('actual regional hide handling still teaches the armor lesson',hunter.inventory.some(i=>i.material==='hide'&&i.units>0)&&G.state.codex.recipes.hide_armor?.level===1);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
