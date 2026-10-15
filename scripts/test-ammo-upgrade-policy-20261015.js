#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), { gearUp } = require('./policies/competent');
const T = K.reporter('ammo-upgrade-policy');
const fixed = fn => { const rng = Math.random; Math.random = () => 0.1; try { return fn(); } finally { Math.random = rng; } };
(async () => {
  const G = await K.load({ seed: 42 }); K.newRun(G); const s = G.state.scholar;
  const item = id => ({ itemId: id, name: id, units: 1 });
  const materials = ammo => Object.entries(G.data.recipes.find(r => r.id === ammo).materials).map(([material, units]) => ({ name: material, material, units }));
  const reset = () => { G.tbfight = null; G.over = false; G.pendingEncounter = null; G.state.worldMonsters = []; s.monster = null; s.inventory = []; s.equipped = {}; };
  // Prepared knowledge/materials; this is a real recipe/equipment/shot proof,
  // not evidence that a natural maker has learned or gathered these supplies.
  for (const [weapon, ammo] of [['bow', 'arrow'], ['crossbow', 'bolt']]) {
    reset(); G.learnRecipe(ammo, 3);
    s.inventory = [...materials(ammo), item(weapon), item('stone_knife')];
    const ctx = {}, ticks = s.dayTicks; fixed(() => gearUp(G, ctx));
    T.ok(weapon + ' replenishes despite a usable weaker knife', G.ammoCount(ammo) === 5 && ctx.ammoCrafts === 1);
    T.ok(weapon + ' pays actual materials and crafting time', !s.inventory.some(i => i.material) && s.dayTicks === ticks + 32);
    T.ok(weapon + ' becomes the active weapon, not just a dormant slot', G.equippedWeapon().itemId === weapon && !s.equipped.melee);
    T.ok(weapon + ' retains the weaker knife as owned inventory', s.inventory.some(i => i.itemId === 'stone_knife'));
    const repeated = s.dayTicks; fixed(() => gearUp(G, ctx));
    T.ok(weapon + ' stays active on the next gearing pass without recrafting', G.equippedWeapon().itemId === weapon && G.ammoCount(ammo) === 5 && s.dayTicks === repeated);
    const m = K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 4, my: 4 });
    const f = G.tbfight, p = G.tbFighter('p'); f.turnIdx = f.order.indexOf('p'); p.acted = false;
    const hp = m.hp; fixed(() => G.tbPlayerStrike(m.key));
    T.ok(weapon + ' actually fires and damages in the real strike path', G.ammoCount(ammo) === 4 && m.hp < hp);
    G.tbfight = null; G.spendAmmo(ammo, 4); s.inventory.push(...materials(ammo));
    const refill = {}; fixed(() => gearUp(G, refill));
    T.ok(weapon + ' can refill while already worn with its knife in the pack', refill.ammoCrafts === 1 && G.ammoCount(ammo) === 5 && G.equippedWeapon().itemId === weapon);
  }
  reset(); G.learnRecipe('arrow', 3);
  s.equipped.melee = item('phase_blade'); s.inventory = [...materials('arrow'), item('bow'), item('stone_knife')];
  const strong = {}, stock = JSON.stringify(s.inventory); fixed(() => gearUp(G, strong));
  T.ok('stronger worn gear prevents unnecessary ammo work and downgrade', !strong.ammoCrafts && G.ammoCount('arrow') === 0 && G.equippedWeapon().itemId === 'phase_blade' && JSON.stringify(s.inventory) === stock);
  reset(); delete G.state.codex.recipes.arrow;
  s.inventory = [...materials('arrow'), item('bow'), item('stone_knife')];
  const unknown = {}; fixed(() => gearUp(G, unknown));
  T.ok('unknown recipe still falls back without crafting', !unknown.ammoCrafts && G.ammoCount('arrow') === 0 && G.equippedWeapon().itemId === 'stone_knife');
  reset(); G.learnRecipe('arrow', 3); s.inventory = [item('bow'), item('stone_knife')];
  const empty = {}; fixed(() => gearUp(G, empty));
  T.ok('known recipe without materials still falls back', !empty.ammoCrafts && G.equippedWeapon().itemId === 'stone_knife');
  reset(); s.inventory = [...materials('arrow'), item('searcaster'), item('bow'), item('stone_knife')];
  fixed(() => gearUp(G, {}));
  T.ok('unfunded energy weapon does not hide a craftable bow upgrade', G.ammoCount('arrow') === 5 && G.ammoCount('fusion_cell') === 0 && G.equippedWeapon().itemId === 'bow');
  reset(); s.equipped.weapon = item('phase_blade'); s.inventory = [item('stone_knife')];
  fixed(() => gearUp(G, {}));
  T.ok('legacy worn weapon also participates in the comparison', G.equippedWeapon().itemId === 'phase_blade' && !s.equipped.melee);
  reset(); s.inventory = [...materials('arrow'), { ...item('bow'), units: 0 }, item('stone_knife')];
  fixed(() => gearUp(G, {}));
  T.ok('zero-unit weapon cannot trigger ammo crafting', G.ammoCount('arrow') === 0 && G.equippedWeapon().itemId === 'stone_knife');
  reset(); s.equipped = { melee: item('stone_knife'), ranged: item('bow') }; s.inventory = [{ itemId: 'arrow', units: 5 }];
  fixed(() => gearUp(G, {}));
  T.ok('a loaded worn bow can displace the weaker melee blocker', G.equippedWeapon().itemId === 'bow' && !s.equipped.melee && s.inventory.some(i => i.itemId === 'stone_knife'));
  reset(); s.equipped.melee = item('stone_knife'); s.inventory = [...materials('arrow'), item('bow')];
  K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 4, my: 4 });
  const combatTicks = s.dayTicks, inFight = {}; fixed(() => gearUp(G, inFight));
  T.ok('gearing never crafts the upgrade during a live fight', !inFight.ammoCrafts && G.ammoCount('arrow') === 0 && s.dayTicks === combatTicks && s.inventory.some(i => i.material === 'stick'));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
