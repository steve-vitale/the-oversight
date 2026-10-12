#!/usr/bin/env node
// test-gearup-spear-slot-20261012.js — PROOF for the gearUp spear-slot fix.
//
// BUG (found 2026-10-12, combat matrix): the competent policy's gearUp routed
// weapons to slots by `w.type === 'ranged' ? 'ranged' : 'melee'`. But the
// game's slot system (equipment.js isRangedWeapon: range > 1) puts ALL
// range-2 weapons — including every spear — in the RANGED slot, and equip()
// refuses a spear in 'melee' ("That goes on your ranged"). So gearUp silently
// failed to equip spears: the sim policy fought bare-fisted with a spear in
// the pack, while ctx.geared counted the failed equip as a success. Every
// long-run sim combat measurement since the ammo-aware gearUp landed
// (2026-10-11) under-measured equipped fighting.
// FIX: route via isRangedWeapon exactly like the inventory UI (app.js).
//
// Before fix: equippedWeapon().bonus === 0 (unarmed) despite the spear.
// After fix: bonus === 15 (spear wielded), armor 20 (hide worn).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEED = Number(process.env.SEED || 7);
let fails = 0;
const check = (name, cond, detail) => {
  if (!cond) { fails++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
  else console.log('ok   ' + name);
};
(async () => {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.equipped = {};
  const defs = Game.data.items;
  for (const id of ['fire_hardened_spear', 'hide_armor']) {
    const def = defs.find(d => d.id === id);
    s.inventory.push({ itemId: id, name: def.name, units: 1 });
  }
  const said = [];
  Game.say = m => said.push(String(m));
  const ctx = {};
  competent.upkeep(Game, ctx);
  const w = Game.equippedWeapon();
  check('spear actually wielded (bonus 15, not fists)', w.bonus === 15 && !w.unarmed,
    `got ${w.name}+${w.bonus} unarmed=${!!w.unarmed}`);
  check('no slot-refusal said', !said.some(t => /goes on your ranged/i.test(t)),
    said.filter(t => /goes on your/i.test(t)).join(' | ').slice(0, 120));
  check('hide armor worn (P=20)', Game.armorBonus() === 20, 'P=' + Game.armorBonus());
  // stone knife (range 1) still routes melee — no regression on real melee
  s.equipped = {};
  const knife = defs.find(d => d.id === 'stone_knife');
  s.inventory.push({ itemId: 'stone_knife', name: knife.name, units: 1 });
  competent.upkeep(Game, {});
  const w2 = Game.equippedWeapon();
  check('knife still equips (bonus 12)', w2.bonus === 12, `got ${w2.name}+${w2.bonus}`);
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
