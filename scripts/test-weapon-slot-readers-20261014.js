#!/usr/bin/env node
// test-weapon-slot-readers-20261014.js — weapon readers follow the modern
// melee/ranged slots (equippedWeapon), not the legacy equipped.weapon slot
// that migrateEquipment deletes on load. Before the fix weaponBonus, the
// crowbar flip bonus, phase-blade ignoresArmor, beam charsMeat and the alien
// first-swing reveal all read .weapon and were silently off.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('weapon-slot-readers');
(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const s = Game.state.scholar;

  s.equipped = { melee: { itemId: 'crowbar', name: 'Crowbar' } };
  T.ok('weaponBonus reads the melee slot (crowbar +12)', Game.weaponBonus() === 12, 'got ' + Game.weaponBonus());

  s.equipped = { ranged: { itemId: 'searcaster', name: 'Searcaster' } };
  const w = Game.equippedWeapon();
  T.ok('equippedWeapon exposes def (searcaster charsMeat)', !!(w.def && w.def.weapon && w.def.weapon.charsMeat));

  // Crowbar flip: str 5 -> 0.5 base, crowbar +0.25. Roll 0.6 succeeds only with the bonus.
  const flipWith = (melee) => {
    K.newRun(Game);
    const mf = K.fight(Game, 'speedbump_turtle', { px: 5, py: 4, mx: 6, my: 4, hp: 500 });
    const st = Game.state.scholar;
    st.equipped = melee ? { melee: { itemId: melee, name: melee } } : {};
    st.stats = st.stats || {}; st.stats.str = 5;
    const p = Game.tbFighter('p');
    Game.tbfight.turnIdx = Game.tbfight.order.indexOf('p');
    p.acted = false; p.moveLeft = 6;
    mf.turtleBunker = 0; mf.turtleFlipped = 0;
    const r = Math.random; Math.random = () => 0.6;
    try { Game.tbPlayerFlip(mf.key); } finally { Math.random = r; }
    return (mf.turtleFlipped || 0) > 0;
  };
  T.ok('flip without crowbar fails at roll 0.6', flipWith(null) === false);
  T.ok('crowbar in melee slot adds the flip bonus', flipWith('crowbar') === true);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
