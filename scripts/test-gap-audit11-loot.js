#!/usr/bin/env node
// test-gap-audit11-loot.js — leg 7 (scholar loot-use loop) fixture proof.
// Claim: a granted trailblazer_machete never reached hands — its prose
// promised "+20 melee damage" but it carried no weapon profile, and both
// equip paths (villager autoEquip, policy gearUp) filtered on class
// 'weapon'. After the fix (weapon profile from prose + candidacy widened
// to "has a weapon profile"), a scholar or villager holding ONLY the
// trailblazer equips it, fights at +20, and learns what it does on the
// first strike.
// Usage: node scripts/test-gap-audit11-loot.js
// Exit 0 on pass, 1 on any failed assertion.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { gearUp } = require('./policies/competent');

function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) process.exitCode = 1;
}

(async () => {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  const s = Game.state.scholar;

  // Data premise: the prose number is real now, class label preserved.
  const def = (Game.data.items || []).find(i => i.id === 'trailblazer_machete');
  check('data: trailblazer carries weapon profile +20, class stays tool',
    def && def.class === 'tool' && def.weapon && def.weapon.bonus === 20 &&
    def.weapon.type === 'melee' && def.weapon.range === 1,
    'weapon=' + JSON.stringify(def && def.weapon) + ' class=' + (def && def.class));

  // Scholar case: ONLY the trailblazer as a weapon -> gearUp equips it.
  s.inventory = [{ itemId: 'trailblazer_machete', name: 'Trailblazer Machete',
    units: 1, kg: 1.2, alienLoot: true, alienEffectHidden: true }];
  s.equipped = {};
  const ctx = {};
  try { gearUp(Game, ctx); } catch (e) { check('scholar gearUp: no throw', false, String(e && e.message)); }
  check('scholar gearUp: trailblazer equipped to melee',
    ((s.equipped || {}).melee || {}).itemId === 'trailblazer_machete',
    'equipped=' + JSON.stringify(s.equipped || {}));
  let w = null;
  try { w = Game.equippedWeapon(); } catch (e) { /* reported below */ }
  check('scholar equippedWeapon bonus is 20 (not unarmed 0)',
    w && w.bonus === 20, 'bonus=' + (w && w.bonus));

  // Villager case: ONLY the trailblazer in the kit -> autoEquip picks it.
  const g = (typeof globalThis !== 'undefined') ? globalThis : {};
  const Eq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
  if (!Eq || typeof Eq.autoEquip !== 'function') {
    check('villager autoEquip: equipment module available', false, 'no Scattering.equipment');
  } else {
    const v = { items: [{ itemId: 'trailblazer_machete', units: 1 }], personality: {} };
    let eq = null;
    try { eq = Eq.autoEquip(v, Game.data.items); } catch (e) { check('villager autoEquip: no throw', false, String(e && e.message)); }
    check('villager autoEquip: trailblazer equipped to melee',
      eq && eq.melee && eq.melee.itemId === 'trailblazer_machete',
      'equipped=' + JSON.stringify(eq || {}));
  }

  // First-strike reveal: the equipped instance starts hidden (granted loot)
  // and one real strike teaches the scholar what it does.
  const eqItem = Game.equippedWeapon ? Game.equippedWeapon().item : null;
  check('reveal setup: equipped instance starts hidden',
    !!(eqItem && eqItem.alienLoot && eqItem.alienEffectHidden === true),
    'item=' + JSON.stringify(eqItem));
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
  Game.state.village.roster = [];
  const vpos = Game.state.village.positions || {};
  for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };
  s.mx = 5; s.my = 4;
  if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
  s.monster = { id: 'bulldozer', mx: 6, my: 4 };
  Game.startCombat('bulldozer');
  const mf = Game.tbfight && Game.tbfight.fighters.find(f => f.kind === 'monster');
  if (mf) { mf.mx = 6; mf.my = 4; }
  const pf = Game.tbFighter && Game.tbFighter('p');
  if (pf) { pf.mx = 5; pf.my = 4; }
  if (!Game.tbfight || !mf) {
    check('reveal fight: tbfight started', false, 'no fight');
  } else {
    const hpBefore = mf.hp;
    try { Game.tbPlayerStrike(mf.key); } catch (e) { check('reveal strike: no throw', false, String(e && e.message)); }
    const eqAfter = Game.equippedWeapon ? Game.equippedWeapon().item : null;
    check('first strike: alien effect revealed (hidden flag cleared)',
      !!(eqAfter && eqAfter.alienEffectHidden === false),
      'hidden=' + (eqAfter && eqAfter.alienEffectHidden));
    const mfAfter = Game.tbfight ? Game.tbfight.fighters.find(f => f.kind === 'monster') : null;
    check('first strike: monster took damage (weapon actually swung)',
      !!mfAfter && (mfAfter.hp || 0) < hpBefore,
      'hp ' + hpBefore + ' -> ' + (mfAfter ? mfAfter.hp : '?'));
  }
  console.log(process.exitCode ? 'LEG7 FIXTURE: FAILED' : 'LEG7 FIXTURE: ALL PASS');
})().catch(e => { console.error('LEG7 FIXTURE FAIL', e && e.stack || e); process.exit(1); });
