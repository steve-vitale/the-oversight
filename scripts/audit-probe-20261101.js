#!/usr/bin/env node
// audit-probe-20261101.js — one-off probe: fieldFight rec keys,
// npcOwnedIds for scholar, synergy-modifier flow into fixtures.
// NOT a verdict script. Seed 9201.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
(async () => {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  try { Game.state.scholar.day = 120; } catch (e) {}
  try { if (typeof Game.pantryAdd === 'function') Game.pantryAdd(200000, 'probe top-up'); } catch (e) {}
  const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
  console.log('scholar vid:', Game.villagerId, 'roster n:', roster.length);
  console.log('npcOwnedIds(scholar):', JSON.stringify((Game.npcOwnedIds ? Game.npcOwnedIds(Game.villagerId) : 'NO-FN') || []).slice(0, 200));
  const leader = roster[0], ally = roster[1];
  const v = Game.state.village || (Game.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  const vp = (Game.data.villagers || []).find(x => x.id === leader);
  vp.items = ['machete'];
  vp.equipped = { melee: { itemId: 'machete', name: 'machete' } };
  v.npcAbilities[leader] = [];
  v.needs = v.needs || {};
  v.needs[leader] = Object.assign({}, v.needs[leader], { hunger: 0, fear: 0 });
  v.health = v.health || {};
  v.health[leader] = 100;
  const def = (Game.data.monsters || []).find(m => m && m.id === 'bulldozer');
  const entity = { id: def.id, hp: 80, maxHp: 80, tx: 2, ty: 2 };
  const rec = Game.fieldFight(leader, def, entity, { allies: 0, allyVids: [], rng: mulberry32(9201), noFlee: true });
  console.log('REC KEYS:', Object.keys(rec || {}).join(','));
  console.log('REC outcome-ish:', JSON.stringify({ over: rec.over, winner: rec.winner, rounds: rec.rounds, fled: rec.fled, logN: (rec.log || []).length, ffFired: rec.ffFired }).slice(0, 400));
  console.log('REC sample:', JSON.stringify(rec).slice(0, 600));
  // scholar synergy probe: give scholar tracker+echo_location, discover apex_sense, recompute
  const sch = Game.state.scholar;
  sch.abilities = [{ id: 'tracker', level: 1, xp: 0 }, { id: 'echo_location', level: 1, xp: 0 }];
  sch.synergies = ['apex_sense'];
  try { Game.recomputeActiveSynergies(); } catch (e) { console.log('recompute err', e.message); }
  console.log('activeSynergies:', JSON.stringify(sch.activeSynergies));
  console.log('npcOwnedIds(scholar) after:', JSON.stringify((Game.npcOwnedIds ? Game.npcOwnedIds(Game.villagerId) : 'NO-FN') || []).slice(0, 200));
})().catch(e => { console.error('PROBE FAIL', e && e.stack || e); process.exit(1); });
