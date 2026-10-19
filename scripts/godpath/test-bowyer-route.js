#!/usr/bin/env node
'use strict';
const K = require('./lib');
const { gearUp } = require('../policies/competent');
const { study } = require('../policies/livelihood');
const T = K.reporter('bowyer-route');
const fixed = (fn, values = [0.1]) => {
  const old = Math.random; let at = 0;
  Math.random = () => values[Math.min(at++, values.length - 1)];
  try { return fn(); } finally { Math.random = old; }
};
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 42) }); K.newRun(G);
  const s = G.state.scholar, book = G.data.books.find(b => b.id === 'bowyers_notebook');
  T.ok('book IDs are unique', new Set(G.data.books.map(b => b.id)).size === G.data.books.length);
  T.ok('notebook references four real human recipes', book && book.unlocks.recipes.length === 4 && book.unlocks.recipes.every(id => G.data.recipes.some(r => r.id === id && r.durable)));
  for (const id of book.unlocks.recipes) delete G.state.codex.recipes[id];
  T.ok('unknown ammunition recipe still refuses crafting', G.craft('arrow') === null);
  // A prepared ruin controls the shelf roll, not the outcome: acquisition,
  // first-search gate, book identity, read cost and knowledge are real verbs.
  G.map.px = 2; G.map.py = 2; s.mx = 4; s.my = 4;
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) G.map.tiles[y][x].type = 'forest_floor';
  const tile = G.map.tiles[2][2]; tile.type = 'ruin'; tile.bookChecked = false; tile.loot = [];
  G.genDetail(2, 2); s.inventory = [];
  T.ok('woodland fixture uses the current renderable terrain ID', !!G.arrivalPoolFor('forest_floor'));
  const beforeSearch = s.dayTicks || 0;
  fixed(() => G.doAction('forage'), [0.1, 0.1, 0.81, 0.1]);
  T.ok('real wild-ruin search can find the notebook', s.inventory.some(i => i.bookId === book.id));
  T.ok('ruin retains its one-search book gate', tile.bookChecked === true);
  T.ok('book search pays its 64 ticks', s.dayTicks === beforeSearch + 64);
  const spent = s.dayTicks, studyCtx = {};
  study(G, studyCtx);
  T.ok('maker reads the actual acquired book', studyCtx.livelihoodBooksRead === 1);
  T.ok('reading pays its two ticks', s.dayTicks === spent + 2);
  T.ok('reading teaches every promised recipe at L3', book.unlocks.recipes.every(id => G.state.codex.recipes[id].level === 3));
  T.ok('read book leaves the physical pack', !s.inventory.some(i => i.bookId === book.id));
  T.ok('book knowledge is recorded as reading', book.unlocks.recipes.every(id => G.state.codex.recipes[id].learnedFrom));
  // Put materials BEFORE the weapon: consuming them shifts its index.
  // Call the real shared gearing policy, not a copied implementation.
  for (const [weapon, ammo] of [['bow', 'arrow'], ['crossbow', 'bolt']]) {
    s.equipped = {}; s.inventory = []; G.tbfight = null; G.over = false;
    const recipe = G.data.recipes.find(r => r.id === ammo);
    for (const [material, units] of Object.entries(recipe.materials)) s.inventory.push({ material, units, name: material });
    s.inventory.push({ itemId: weapon, name: weapon, units: 1 });
    const ctx = {}; fixed(() => gearUp(G, ctx));
    T.ok(weapon + ' policy crafts the matching ammunition', G.ammoCount(ammo) === 5 && ctx.ammoCrafts === 1);
    T.ok(weapon + ' policy equips the weapon after pack indices shift', s.equipped.ranged && s.equipped.ranged.itemId === weapon);
    T.ok(weapon + ' policy pays actual materials', !s.inventory.some(i => i.material));
  }
  let calls = 0; const craft = G.craft;
  G.craft = function (...args) { calls++; return craft.apply(this, args); };
  try {
    s.equipped = {}; s.inventory = [{ itemId: 'bow', units: 1 }];
    delete G.state.codex.recipes.arrow;
    gearUp(G, {});
    T.ok('unknown recipes are not spammed by the policy', calls === 0 && G.ammoCount('arrow') === 0);
    G.learnRecipe('arrow', 3); gearUp(G, {});
    T.ok('known recipe without materials is not spammed either', calls === 0);
    s.inventory = [{ itemId: 'searcaster', units: 1 }]; gearUp(G, {});
    T.ok('energy weapon does not try making arrows', calls === 0 && G.ammoCount('fusion_cell') === 0);
  } finally { G.craft = craft; }
  // A map offers adjacent unknown destinations. A knowledge-seeking policy
  // must not inspect their biome and pick a hidden ruin from that list.
  G.map.px = 4; G.map.py = 4; G.map.tiles[4][4].type = 'haven';
  G.map.tiles[4][5].type = 'ruin'; s.seenTiles = {};
  s.inventory = []; s.dayTicks = 0; s.health = 100; s.kcal = 4000;
  G.pendingEncounter = false;
  delete G.state.codex.recipes.bow;
  const targets = G.travelTargets, travel = G.travelTo, destinations = [];
  G.map.tiles[4][3].type = 'forest_floor';
  G.travelTargets = () => [{ x: 3, y: 4, d: 1, unknown: true }, { x: 5, y: 4, d: 1, unknown: true }];
  G.travelTo = (x, y) => { destinations.push([x, y]); return null; };
  try {
    study(G, {});
    T.ok('maker explores fog without selecting the hidden ruin', destinations.length === 1 && destinations[0][0] === 3);
    G.markSeen(5, 4, 'shared', 'test');
    study(G, {});
    T.ok('maker prioritizes the ruin once its location is known', destinations.length === 2 && destinations[1][0] === 5 && destinations[1][1] === 4);
  } finally { G.travelTargets = targets; G.travelTo = travel; }
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
