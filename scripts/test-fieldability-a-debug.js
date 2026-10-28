#!/usr/bin/env node
// Debug: what does fieldFight actually equip / volley / power for one cell.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
async function cell(weapons, ammo, mid, hp, seed) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'fieldability-a-debug', fullTelemetry: false });
  if (loadFails.length) throw new Error(loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    vp.items = weapons.slice().concat(['hide_armor', 'skull_helm', 'canvas_pants', 'work_gloves', 'good_boots']);
    if (ammo) vp.items.push({ itemId: ammo, units: 5, name: ammo });
    vp.equipped = { melee: { itemId: weapons[0], name: weapons[0] } };
    if (weapons[1]) vp.equipped.ranged = { itemId: weapons[1], name: weapons[1] };
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {}; vv.health[leader] = 100; vv.health[ally] = 100;
  let power = null, needs = null, tier = null;
  try {
    const GP = (globalThis.Scattering || {}).Godpath || null;
    if (GP && GP.villagerPowerMult) power = GP.villagerPowerMult(G, leader);
  } catch (e) { power = 'err:' + e.message; }
  try { needs = G.npcNeeds ? JSON.stringify(G.npcNeeds(leader)) : 'no-npcNeeds'; } catch (e) { needs = 'err'; }
  try { tier = G.villageFoodTier ? G.villageFoodTier() : 'no-tier'; } catch (e) { tier = 'err'; }
  // Pre-fight gearUp snapshot: what autoEquip leaves equipped.
  try { if (G.villagerGearUp) G.villagerGearUp(leader, false); } catch (e) {}
  const vpL = (G.data.villagers || []).find(x => x.id === leader);
  const S = (globalThis.Scattering || {}).S || {};
  let wb = null;
  try { wb = S.equipment ? Math.round(((S.equipment.weaponBonusOf(vpL, G.data.items, 'melee') || 0) + (S.equipment.weaponBonusOf(vpL, G.data.items, 'ranged') || 0)) / 2) : null; } catch (e) { wb = 'err'; }
  const def = (G.data.monsters || []).find(m => m && m.id === mid);
  const rec = G.fieldFight(leader, def, { id: def.id, hp, maxHp: hp, tx: 2, ty: 2 }, { allies: 1, allyVids: [ally], rng: mulberry32(seed) });
  console.log(JSON.stringify({ weapons, ammo: !!ammo, mid, seed, power, tier, needs, equipped: vpL.equipped, wb,
    outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt, allyDealt: rec.allyDealt, volley: rec.volley || null }));
}
async function main() {
  await cell(['hunting_spear'], null, 'audit', 1100, 9000);
  await cell(['godslayer_spear'], null, 'audit', 1100, 9000);
  await cell(['worldbreaker_maul'], null, 'audit', 1100, 9000);
  await cell(['machete', 'bow'], 'arrow', 'audit', 1100, 9000);
  await cell(['hunting_spear', 'bow'], 'arrow', 'audit', 1100, 9000);
  await cell(['machete'], null, 'audit', 1100, 9000);
  const def = null;
}
main().catch(e => { console.error('DEBUG-FAIL', e && e.stack || e); process.exit(1); });
