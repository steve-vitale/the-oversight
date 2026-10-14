// test-villager-strike-source-20261014.js — villager strikes pass their
// sourceKey into tbDamage. The villager turn called tbDamage(t.key, dmg,
// v.name) with no key, so every source-keyed hook was dead for allies:
// party-formal flank (×1.5) and point (+3), and the War Cry rallyBuff (+4).
// Also: point +3 must not stack on a flank (the flank flag was cleared
// before the point check read it).
// Driven through Game.tbVillagerTurn with a fixed roll.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('villager-strike-source');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  Game.say = () => {}; Game.sysSay = () => {};
  const S = globalThis.Scattering.combat;
  const me = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== me);
  // party membership + role plumbing
  const ps = Game.partyState();
  ps.party = [vid];
  const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');

  function strikeOnce(setup) {
    const v = {
      key: 'v0', kind: 'villager', villagerId: vid, name: 'Vill', mx: 5, my: 4, hp: 100, maxHp: 100,
      alive: true, fled: false, speed: 3, moveLeft: 3, acted: false, ai: 'brave', wbonus: 0,
    };
    const m = {
      key: 'm0', kind: 'monster', monsterId: 'hushwolf', mdef, name: 'Hushwolf', mx: 6, my: 4,
      hp: 500, maxHp: 500, alive: true, fled: false, speed: 3, moveLeft: 3, acted: false,
      telegraph: null, stunned: 0, hesitate: 0,
    };
    Game.tbfight = { id: 'vss', fighters: [v, m], order: ['v0', 'm0'], turnIdx: 0, round: 1, over: false };
    // FOOD IS FUEL (godpath-buff 2026-10-14): a well-fed villager (hunger
    // <= 25) carries the player's overcharge (x1.25). This test measures the
    // role/flank sources, so the villager is fed but not topped up.
    try { Game.npcNeeds(vid).hunger = 50; } catch (e) { console.warn('[test] hunger', e.message); }
    setup(v);
    const origRoll = S.roll;
    S.roll = () => 10;
    try { Game.tbVillagerTurn(v); } finally { S.roll = origRoll; }
    return 500 - m.hp;
  }
  Game.clearRole(vid);
  const base = strikeOnce(() => {});
  T.ok('baseline strike lands the fixed roll', base === 10, `base=${base}`);

  Game.assignRole(vid, 'point');
  const point = strikeOnce(() => {});
  T.ok('point role adds +3 to a plain strike', point === base + 3, `base=${base} point=${point}`);

  Game.clearRole(vid);
  const flank = strikeOnce(v => { v.flanking = true; });
  T.ok('flanking strike lands ×1.5', flank === Math.round(base * 1.5), `base=${base} flank=${flank}`);

  Game.assignRole(vid, 'point');
  const pf = strikeOnce(v => { v.flanking = true; });
  T.ok('point + flank: flank bonus only (no +3 stack)', pf === Math.round(base * 1.5), `point+flank=${pf}`);

  Game.clearRole(vid);
  const rally = strikeOnce(v => { v.rallyBuff = 2; });
  T.ok('War Cry rallyBuff adds +4 to an ally strike', rally === base + 4, `base=${base} rally=${rally}`);
  T.done();
})();
