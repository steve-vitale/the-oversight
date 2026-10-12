#!/usr/bin/env node
// test-knife-keep-20261012.js — longsim food r6 2026-10-12.
// Proves "the knife in the pack": the competent policy gathers the knife's
// materials honestly (rubble-clearing for stone, thickets for vine) and
// knaps the universal stone knife FIRST, before snare crafts eat the vine.
//   T1: gate=0 -> exact old behavior (force-through rubble, no roadwork,
//       no keepKnife knap).
//   T2: knap-first, proactive — trap materials held, no carcasses, stone +
//       vine on hand -> stone knife knapped, cutting tool held.
//   T3: stone run — rubble-blocked trip + knife needed + no stone -> the
//       rubble is cleared honestly (40 kcal, day-part), stone lands in the
//       pack, the trip walks in and forages.
//   T4: honest costs — clearing charges exactly 40 kcal and yields 1-3 stone.
//   T5: a held cutting tool is kept — no re-knap, materials untouched.
//   T6: vine preference — wantVine prefers a revealed thicket over a nearer
//       meadow (fog-honest: revealed tiles only).
//   T7: knifeless + no materials at all -> nothing forced, nothing conjured
//       (carcass-less, trapline-idle policy leaves the pack alone).
// Usage: node scripts/test-knife-keep-20261012.js  (SEED env override)
'use strict';
const { loadGame } = require('./sim-harness');
const { competent, forageTripSeedFirst, stoneRun } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '20261012', 10);
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function hunterGame(Game) {
  Game.genRoster('Columbus, Ohio');
  Game.generatedRoster[0].occupationId = 'hunting_guide';
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
}
function stripKnives(Game) {
  // hunting_guide starts with a knife; these tests need a knifeless scholar
  const s = Game.state.scholar;
  const isKnife = (i) => /knife|machete|sharpened|blade/i.test(String((i && i.name) || '') + ' ' + String((i && i.recipeId) || ''));
  s.inventory = (s.inventory || []).filter(i => !isKnife(i));
  s.tools = (s.tools || []).filter(i => !isKnife(i));
}
function giveMats(Game, mats) {
  const s = Game.state.scholar;
  for (const [mat, n] of Object.entries(mats))
    s.inventory.push({ material: mat, name: mat, units: n, kcalEach: 0, spoilDay: 9999 });
}
function packMat(Game, m) {
  return ((Game.state.scholar || {}).inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}
// Only the given tiles keep food stock — isolates the trip's choice.
function isolateTiles(Game, keep) {
  const set = new Set(keep.map(([x, y]) => x + ',' + y));
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (!set.has(x + ',' + y)) { const t = Game.tileAt(x, y); if (t) t.stock = 0; }
  }
}
// Plant a rubble blockage on tile (bx,by) guarding the side facing the
// player at (px,py). Returns the side tile the player must stand on.
function plantRubble(Game, bx, by) {
  const px = Game.map.px, py = Game.map.py;
  const t = Game.tileAt(bx, by);
  t.blockFrom = { dx: -Math.sign(bx - px), dy: -Math.sign(by - py), type: 'rubble' };
  return [bx + t.blockFrom.dx, by + t.blockFrom.dy];
}

(async () => {
  // ============ T1: gate=0 -> old behavior ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    // stocked neighbor with rubble guarding the player's side
    const bx = 4, by = 5;
    const t = Game.tileAt(bx, by);
    t.type = 'meadow'; t.stock = 5; t.maxStock = 5; t.revealed = true;
    plantRubble(Game, bx, by);
    isolateTiles(Game, [[bx, by]]); // the rubble tile is the only forage option
    giveMats(Game, { stick: 2 }); // trap materials held, no stone, no vine
    process.env.COMPETENT_KEEP_KNIFE = '0';
    const ctx = {};
    const foragedAt = [];
    const origDo = Game.doAction.bind(Game);
    Game.doAction = function (name, o) {
      if (name === 'forage') foragedAt.push([Game.map.px, Game.map.py]);
      return origDo(name, o);
    };
    try { forageTripSeedFirst(Game, ctx); } catch (e) { console.log('trip err', e.message); }
    Game.doAction = origDo;
    delete process.env.COMPETENT_KEEP_KNIFE;
    ok('T1 gate=0: no rubble cleared', !ctx.rubbleCleared);
    ok('T1 gate=0: no stone conjured', packMat(Game, 'stone') === 0);
    ok('T1 gate=0: legacy force-through crosses the rubble (forage ran there)',
      foragedAt.length > 0 && foragedAt[0][0] === bx && foragedAt[0][1] === by,
      'foragedAt=' + JSON.stringify(foragedAt));
    ok('T1 gate=0: blockage still standing (never cleared)', !!Game.tileAt(bx, by).blockFrom);
    ok('T1 gate=0: still knifeless (keepKnife off)', !Game.hasCuttingTool());
  }

  // ============ T2: knap-first, proactive ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    giveMats(Game, { stone: 2, vine: 2, stick: 2 }); // trap materials, no carcasses
    ok('T2 starts knifeless', !Game.hasCuttingTool());
    const realR = Math.random; Math.random = () => 0.01; // force the 85% knap
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    Math.random = realR;
    ok('T2 stone knife knapped before any carcass existed', !!Game.hasCuttingTool());
    ok('T2 ctx.knivesKnapped counted', (ctx.knivesKnapped || 0) >= 1, 'got ' + (ctx.knivesKnapped || 0));
  }

  // ============ T3: the stone run ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    const bx = 4, by = 5;
    const t = Game.tileAt(bx, by);
    t.type = 'meadow'; t.stock = 5; t.maxStock = 5; t.revealed = true;
    plantRubble(Game, bx, by);
    isolateTiles(Game, [[bx, by]]); // the rubble tile is the only forage option
    giveMats(Game, { stick: 2 }); // trap materials held -> knife needed; no stone
    const kcalBefore = Game.state.scholar.kcal;
    const ctx = {};
    try { forageTripSeedFirst(Game, ctx); } catch (e) { console.log('trip err', e.message); }
    ok('T3 rubble cleared for stone', (ctx.rubbleCleared || 0) >= 1, 'got ' + (ctx.rubbleCleared || 0));
    const stone = packMat(Game, 'stone');
    ok('T3 1-3 honest stone in the pack', stone >= 1 && stone <= 3, 'stone=' + stone);
    ok('T3 ctx.stoneFromRubble counted', (ctx.stoneFromRubble || 0) === stone);
    ok('T3 the trip walked in and foraged', (ctx.forageTrips || 0) >= 1);
    ok('T3 blockage gone after clearing', !Game.tileAt(bx, by).blockFrom);
    ok('T3 clearing cost real kcal', Game.state.scholar.kcal <= kcalBefore - 40 + 1,
      'before=' + Math.round(kcalBefore) + ' after=' + Math.round(Game.state.scholar.kcal));
  }

  // ============ T4: honest costs ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    const bx = 5, by = 4;
    const t = Game.tileAt(bx, by);
    t.type = 'meadow'; t.stock = 5; t.maxStock = 5; t.revealed = true;
    plantRubble(Game, bx, by); // guards the side facing the player
    const kcalBefore = Game.state.scholar.kcal;
    const okClear = Game.clearBlockage(bx, by);
    ok('T4 clearBlockage succeeds from the guarded side', !!okClear);
    const stone = packMat(Game, 'stone');
    ok('T4 stone yield is 1-3 (game numbers, untouched)', stone >= 1 && stone <= 3, 'stone=' + stone);
    const spent = kcalBefore - Game.state.scholar.kcal;
    ok('T4 exactly 40 kcal charged', Math.abs(spent - 40) < 0.01, 'spent=' + spent);
  }

  // ============ T5: a held knife is kept ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.inventory.push({ name: 'Stone knife', itemId: 'stone_knife', units: 1 });
    giveMats(Game, { stone: 2, vine: 2 });
    const matsBefore = packMat(Game, 'stone') + packMat(Game, 'vine');
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    ok('T5 no re-knap when a cutting tool is held', !(ctx.knivesKnapped > 0));
    ok('T5 materials untouched by keepKnife', packMat(Game, 'stone') + packMat(Game, 'vine') === matsBefore);
    ok('T5 knife still held', !!Game.hasCuttingTool());
  }

  // ============ T6: vine preference (fog-honest) ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    // thicket at (4,6) d=2, meadow at (6,4) d=2 — both stocked + revealed
    for (const [x, y, type] of [[4, 6, 'thicket'], [6, 4, 'meadow']]) {
      const t = Game.tileAt(x, y);
      t.type = type; t.stock = 5; t.maxStock = 5; t.revealed = true;
    }
    isolateTiles(Game, [[4, 6], [6, 4]]); // only the two test tiles are stocked
    giveMats(Game, { stone: 1, stick: 2 }); // knife needed, stone held, vine missing -> wantVine
    const foragedAt = [];
    const origDo = Game.doAction.bind(Game);
    Game.doAction = function (name, o) {
      if (name === 'forage') foragedAt.push([Game.map.px, Game.map.py]);
      return origDo(name, o);
    };
    const ctx = {};
    try { forageTripSeedFirst(Game, ctx); } catch (e) { console.log('trip err', e.message); }
    Game.doAction = origDo;
    ok('T6 wantVine heads for the thicket first',
      foragedAt.length > 0 && foragedAt[0][0] === 4 && foragedAt[0][1] === 6,
      'foragedAt=' + JSON.stringify(foragedAt));
    // control: vine on hand -> no preference, nearer/earlier tile wins
    const { Game: G2 } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(G2);
    stripKnives(G2);
    for (const [x, y, type] of [[4, 6, 'thicket'], [6, 4, 'meadow']]) {
      const t = G2.tileAt(x, y);
      t.type = type; t.stock = 5; t.maxStock = 5; t.revealed = true;
    }
    isolateTiles(G2, [[4, 6], [6, 4]]);
    giveMats(G2, { stone: 1, stick: 2, vine: 1 }); // vine held -> wantVine off
    const foragedAt2 = [];
    const origDo2 = G2.doAction.bind(G2);
    G2.doAction = function (name, o) {
      if (name === 'forage') foragedAt2.push([G2.map.px, G2.map.py]);
      return origDo2(name, o);
    };
    const ctx2 = {};
    try { forageTripSeedFirst(G2, ctx2); } catch (e) { console.log('trip2 err', e.message); }
    G2.doAction = origDo2;
    ok('T6 control: no vine need -> scan order (meadow first)',
      foragedAt2.length > 0 && foragedAt2[0][0] === 6 && foragedAt2[0][1] === 4,
      'foragedAt=' + JSON.stringify(foragedAt2));
  }

  // ============ T8: the dedicated stone run ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    // rubble on a tile with NO food stock — not a forage candidate. The
    // dedicated detour must find it anyway.
    const bx = 4, by = 5;
    const t = Game.tileAt(bx, by);
    t.type = 'meadow'; t.stock = 0; t.maxStock = 0; t.revealed = true;
    plantRubble(Game, bx, by);
    giveMats(Game, { stick: 2 }); // trap materials held -> knife needed; no stone
    const ctx = {};
    stoneRun(Game, ctx);
    ok('T8 stoneRun finds rubble off the forage path', (ctx.rubbleCleared || 0) >= 1, 'got ' + (ctx.rubbleCleared || 0));
    ok('T8 stoneRun counted', (ctx.stoneRuns || 0) >= 1);
    ok('T8 honest stone in the pack', packMat(Game, 'stone') >= 1, 'stone=' + packMat(Game, 'stone'));
    ok('T8 player walked home', Game.map.px === 4 && Game.map.py === 4, `at ${Game.map.px},${Game.map.py}`);
    // no-op when a knife is already held
    const ctx2 = {};
    Game.state.scholar.inventory.push({ name: 'Stone knife', itemId: 'stone_knife', units: 1 });
    const t2 = Game.tileAt(5, 4);
    t2.blockFrom = { dx: -1, dy: 0, type: 'rubble' };
    stoneRun(Game, ctx2);
    ok('T8 stoneRun idle when a cutting tool is held', !(ctx2.rubbleCleared > 0));
    ok('T8 rubble left standing when idle', !!Game.tileAt(5, 4).blockFrom);
  }

  // ============ T9: the expedition finds distant stone ============
  // Seed 11's real map has rubble at (2,2) and (7,8) — far from haven's
  // known roads. A knifeless trapper with trap materials must mount a real
  // expedition and come home with stone.
  {
    const { Game } = await loadGame({ seed: 11, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    giveMats(Game, { stick: 2 }); // trap materials held -> knife needed; no stone
    const ctx = {};
    let cleared = 0;
    for (let d = 0; d < 6 && !Game.over && cleared === 0; d++) {
      try { stoneRun(Game, ctx); } catch (e) { console.log('stoneRun err', e.message); break; }
      cleared = ctx.rubbleCleared || 0;
    }
    ok('T9 expedition cleared distant rubble', cleared >= 1, 'got ' + cleared);
    ok('T9 honest stone in the pack', packMat(Game, 'stone') >= 1, 'stone=' + packMat(Game, 'stone'));
    ok('T9 expedition walked home', Game.map.px === 4 && Game.map.py === 4 && !Game.over,
      `at ${Game.map.px},${Game.map.py} over=${Game.over}`);
    ok('T9 expedition logged its steps', (ctx.fogSteps || 0) >= 1, 'fogSteps=' + (ctx.fogSteps || 0));
  }

  // ============ T7: nothing forced, nothing conjured ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    // knifeless, no materials, no carcasses, trapline idle -> keepKnife idle
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    ok('T7 idle policy knaps nothing', !(ctx.knivesKnapped > 0));
    ok('T7 idle policy clears no rubble', !(ctx.rubbleCleared > 0));
    ok('T7 still knifeless, honestly', !Game.hasCuttingTool());
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  // ============ T10: equipped knife still cuts (food r6 src fix) ============
  // hasCuttingTool used to miss a knife worn as a weapon — the policy knapped,
  // geared up, and the game forgot the blade. An equipped knife must count.
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.equipped = {};
    ok('T10 bare hands: no cutting tool', !Game.hasCuttingTool());
    Game.state.scholar.inventory.push({ material: 'stone', name: 'Stone', units: 1 }, { material: 'vine', name: 'Vine', units: 1 });
    Game.craft('stone_knife');
    ok('T10 knapped knife in pack counts', Game.hasCuttingTool());
    const idx = Game.state.scholar.inventory.findIndex(i => /stone knife/i.test(String(i.name || '')));
    Game.equip(idx, 'melee');
    ok('T10 equipped knife still counts as a cutting tool', Game.hasCuttingTool());
    // and it actually cleans: carcass + equipped knife -> meat
    Game.state.scholar.inventory.push({ foodState: 'carcass', name: 'Test carcass', units: 1, spoilDay: 9999, kcalEach: 100 });
    const before = Game.state.scholar.inventory.filter(i => i && i.foodState === 'carcass').length;
    try { Game.cleanCarcass(); } catch (e) {}
    const after = Game.state.scholar.inventory.filter(i => i && i.foodState === 'carcass').length;
    ok('T10 equipped knife cleans a carcass', before === 1 && after === 0, `carcasses ${before}->${after}`);
  }

  // ============ T11: a bonded Knife roll is not a cutting tool ============
  // A bonded "Knife roll" (class: sentimental) matched /knife/i and the game
  // believed the scholar was armed -- seed-44 probe: 105 "armed" days, zero
  // knap, zero carcasses cleaned. A roll that HOLDS knives is not a blade.
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.equipped = {};
    Game.state.scholar.inventory.push({ itemId: 'knife_roll', name: 'Knife roll', units: 1, bonded: true, owner: 'x', bond: 0 });
    ok('T11 bonded Knife roll is not a cutting tool', !Game.hasCuttingTool());
  }
  // ============ T12: a bonded real knife still cuts ============
  // Bonded does not disarm: a bonded Chef's knife (class tool, a real blade
  // def) still counts. Only sentimental keepsakes that aren't blades are
  // excluded.
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.equipped = {};
    Game.state.scholar.inventory.push({ itemId: 'chefs_knife', name: "Chef's Knife", units: 1, bonded: true, owner: 'x', bond: 0 });
    ok('T12 bonded real knife still counts', Game.hasCuttingTool());
    Game.state.scholar.inventory.push({ foodState: 'carcass', name: 'Test carcass', units: 1, spoilDay: 9999, kcalEach: 100 });
    const before = Game.state.scholar.inventory.filter(i => i && i.foodState === 'carcass').length;
    try { Game.cleanCarcass(); } catch (e) {}
    const after = Game.state.scholar.inventory.filter(i => i && i.foodState === 'carcass').length;
    ok('T12 bonded real knife cleans a carcass', before === 1 && after === 0, `carcasses ${before}->${after}`);
  }

  // ============ T13: the kitchen counter gets cleaned too ============
  // Homecoming pooling moves unprocessed hauls (carcasses) from the pack to
  // the prep stash. cleanCatch must sweep the stash as well as the pack —
  // the game already supports it: cleanCarcass(idx, container).
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.equipped = {};
    Game.state.scholar.inventory.push({ itemId: 'stone_knife', name: 'Stone knife', units: 1 });
    const stash = Game.prepStash();
    stash.push({ foodState: 'carcass', name: 'Gray Squirrel (trapped)', units: 1, spoilDay: 9999, kcalEach: 0, hiddenKcal: 350 });
    const before = stash.filter(i => i && i.foodState === 'carcass').length;
    Game.cleanCarcass(undefined, stash);
    const after = stash.filter(i => i && i.foodState === 'carcass').length;
    ok('T13 stash carcass cleaned via cleanCarcass(undefined, stash)', before === 1 && after === 0, `stash carcasses ${before}->${after}`);
  }
  // ============ T14: a full daily cleans the counter's trapped carcass ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    Game.state.scholar.equipped = {};
    Game.state.scholar.inventory.push({ itemId: 'stone_knife', name: 'Stone knife', units: 1 });
    Game.prepStash().push({ foodState: 'carcass', name: 'Gray Squirrel (trapped)', units: 1, spoilDay: 9999, kcalEach: 0, hiddenKcal: 350 });
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    const left = Game.prepStash().filter(i => i && i.foodState === 'carcass').length;
    ok('T14 daily cleans the stash carcass', left === 0, `stash carcasses left=${left}`);
    ok('T14 daily logged the cleaning', (ctx.cleanedCarcasses || 0) >= 1, `ctx.cleanedCarcasses=${ctx.cleanedCarcasses || 0}`);
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();