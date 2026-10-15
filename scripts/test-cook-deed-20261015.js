// PROOF TEST: every real cooking path credits the 'cooking' deed (2026-10-15).
//
// tracks.json: cooking -> craft track, 1 XP, 1 a day. The 64-seed dashboard
// had the player earn ONE craft level-up in 64 runs (villagers 234).
// Diagnosis (evidence/2026-10-15/diagnosis-progression.md, issue 1): the
// deed was only wired on game.js's legacy rawKcal path (dried beans/rice).
// food.js wraps cookFood/cookAll and handles the two paths a player
// actually cooks on, cleaned meat and must-cook plants, and both returned
// without crediting the deed.
//
// RED on master: meat, plant and batch-meat cooking give 0 craft XP.
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('cook-deed');
  const G = await K.load({ seed: 20261015 });
  K.newRun(G);
  const s = G.state.scholar;
  G.nearFire = () => true;
  G.consumeCookFire = () => 'ok';
  const craftXP = () => ((G.playerTracks().craft) || {}).xp || 0;
  const nextDay = () => { s.day = (s.day || 0) + 1; s.deedDay = {}; };
  const meat = () => ({ name: 'Deer (cleaned)', plantId: 'meat_deer', foodKind: 'meat', foodState: 'cleaned', kcalEach: 120, units: 2, kg: 0.5, spoilDay: (s.day || 0) + 5, safe: false });
  const plant = () => ({ name: 'Pokeweed shoots', plantId: 'pokeweed', foodKind: 'plant', foodState: 'ready', kcalEach: 30, units: 3, kg: 0.3, spoilDay: (s.day || 0) + 5, needsCooking: true, diseaseRisk: { p: 0.3 } });

  // cleaned meat, per item
  nextDay();
  s.inventory = [meat()];
  let x0 = craftXP();
  G.cookFood(0);
  T.ok('cleaned meat was cooked', s.inventory[0] && s.inventory[0].foodState === 'cooked', JSON.stringify(s.inventory[0] || null).slice(0, 120));
  T.ok('cooking meat credits the craft deed', craftXP() === x0 + 1, x0 + ' -> ' + craftXP());

  // must-cook plant, per item
  nextDay();
  s.inventory = [plant()];
  x0 = craftXP();
  G.cookFood(0);
  T.ok('must-cook plant was cooked', s.inventory[0] && s.inventory[0].foodState === 'cooked');
  T.ok('cooking a must-cook plant credits the craft deed', craftXP() === x0 + 1, x0 + ' -> ' + craftXP());

  // batch (Cook all) with only meat in the pack
  nextDay();
  s.inventory = [meat()];
  x0 = craftXP();
  G.cookAll();
  T.ok('batch cooked the meat', s.inventory[0] && s.inventory[0].foodState === 'cooked');
  T.ok('batch cooking meat credits the craft deed', craftXP() === x0 + 1, x0 + ' -> ' + craftXP());

  // the per-day cap still holds: a second cook the same day earns nothing
  s.inventory = [meat()];
  x0 = craftXP();
  G.cookFood(0);
  T.ok('cap: a second cook the same day earns no more', craftXP() === x0, x0 + ' -> ' + craftXP());
  T.done();
})().catch(e => { console.error(e); process.exit(1); });
