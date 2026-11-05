#!/usr/bin/env node
// scripts/test-journey-establishment-r104-holdings.js — journey-establishment r104
// PROOF for the holdings census the r104 driver reads (no src/js change):
//  (1) a magic-lane grant via npcGrantAbility lands in the granted slots
//      (state.village.npcAbilities[vid]) AND in the owned union (npcOwnedIds);
//  (2) a skill-lane grant routes to a villager SKILL (npcLearnSkill): it
//      appears in the owned union but NOT in the granted slots — the two
//      sources must never be conflated;
//  (3) an ungranted villager shows no delta on either list (control);
//  (4) the census reads are read-only: npcOwnedIds + raw state reads change
//      no state (roster / pantry / npcAbilities / npcSkills / npcXp identical
//      before and after);
//  (5) the player's ownedAbilityIds() returns an array (contrast column).
// Cases run on load seeds 7, 42, 99 (MEASUREMENT §5: ≥3 seeds). Each case
// loads a fresh game. The r104 driver itself is exercised by the pilot seed.
// Usage: node scripts/test-journey-establishment-r104-holdings.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const LOAD_SEEDS = [7, 42, 99];
const MAGIC_ID = 'adrenaline_surge'; // combat kit, magic lane
const SKILL_ID = 'stalk';            // skill lane (skillId 'stalk')

function snapState(G) {
  const v = G.state.village || {};
  return JSON.stringify({
    roster: v.roster || [],
    pantry: v.pantry || [],
    npcAbilities: v.npcAbilities || {},
    npcSkills: v.npcSkills || {},
    npcXp: v.npcXp || {},
  });
}

async function main() {
  let failures = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) failures++;
  };
  for (const seed of LOAD_SEEDS) {
    const { Game: G, loadFails } = await loadGame({ seed, mode: 'establishment-r104-holdings' });
    if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
    await setupGame(G);
    const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
    if (roster.length < 3) throw new Error('need >=3 roster villagers on seed ' + seed);
    const [magicVid, skillVid, controlVid] = roster;
    // Lane sanity: the test's ids must be what the prereg claims they are.
    check(`seed${seed} ${MAGIC_ID} is magic lane`, G.isSkillLane ? G.isSkillLane(MAGIC_ID) === false : true, `isSkillLane=${G.isSkillLane && G.isSkillLane(MAGIC_ID)}`);
    check(`seed${seed} ${SKILL_ID} is skill lane`, G.isSkillLane ? G.isSkillLane(SKILL_ID) === true : true, `isSkillLane=${G.isSkillLane && G.isSkillLane(SKILL_ID)}`);
    // (4) READ-ONLY: census reads change no state.
    const before = snapState(G);
    for (const id of roster) {
      try { G.npcOwnedIds(id); } catch (e) { throw new Error('npcOwnedIds threw: ' + e.message); }
      try { ((G.state.village.npcAbilities || {})[id] || []).slice(); } catch (e) {}
      try { ((G.state.village.npcSkills || {})[id] || []).slice(); } catch (e) {}
      try { JSON.parse(JSON.stringify((G.state.village.npcXp || {})[id] || null)); } catch (e) {}
    }
    check(`seed${seed} census reads are read-only`, snapState(G) === before, 'state changed by reads');
    // Baselines (villagers may start with background skills).
    const baseGranted = (id) => (((G.state.village.npcAbilities || {})[id] || []).slice());
    const baseOwned = (id) => (G.npcOwnedIds(id) || []).slice();
    const g0 = baseGranted(magicVid), o0 = baseOwned(magicVid);
    const g1 = baseGranted(skillVid), o1 = baseOwned(skillVid);
    const g2 = baseGranted(controlVid), o2 = baseOwned(controlVid);
    // (1) MAGIC grant: slots AND union.
    const okMagic = G.npcGrantAbility(magicVid, MAGIC_ID);
    check(`seed${seed} magic grant accepted`, okMagic === true, `npcGrantAbility returned ${okMagic}`);
    check(`seed${seed} magic grant in granted slots`, baseGranted(magicVid).includes(MAGIC_ID) && !g0.includes(MAGIC_ID),
      `granted=${JSON.stringify(baseGranted(magicVid))}`);
    check(`seed${seed} magic grant in owned union`, baseOwned(magicVid).includes(MAGIC_ID) && !o0.includes(MAGIC_ID),
      `owned=${JSON.stringify(baseOwned(magicVid))}`);
    // (2) SKILL grant: union yes, slots no, skill list yes.
    const okSkill = G.npcGrantAbility(skillVid, SKILL_ID);
    check(`seed${seed} skill grant accepted`, okSkill === true, `npcGrantAbility returned ${okSkill}`);
    check(`seed${seed} skill grant NOT in granted slots`, !baseGranted(skillVid).includes(SKILL_ID),
      `granted=${JSON.stringify(baseGranted(skillVid))}`);
    check(`seed${seed} skill grant in owned union`, baseOwned(skillVid).includes(SKILL_ID) && !o1.includes(SKILL_ID),
      `owned=${JSON.stringify(baseOwned(skillVid))}`);
    const sid = (G.abilitySkillId ? G.abilitySkillId(SKILL_ID) : SKILL_ID) || SKILL_ID;
    check(`seed${seed} skill grant lands as skill ${sid}`, (((G.state.village.npcSkills || {})[skillVid] || []).includes(sid)),
      `npcSkills=${JSON.stringify((G.state.village.npcSkills || {})[skillVid])}`);
    // (3) CONTROL: no delta.
    check(`seed${seed} control: no granted/owned delta`,
      JSON.stringify(baseGranted(controlVid)) === JSON.stringify(g2) &&
      JSON.stringify(baseOwned(controlVid)) === JSON.stringify(o2),
      `granted=${JSON.stringify(baseGranted(controlVid))} owned=${JSON.stringify(baseOwned(controlVid))}`);
    // (5) PLAYER contrast column.
    let playerOwned = null;
    try { playerOwned = G.ownedAbilityIds(); } catch (e) { playerOwned = 'THREW: ' + e.message; }
    check(`seed${seed} player ownedAbilityIds is an array`, Array.isArray(playerOwned),
      `owned=${JSON.stringify(playerOwned)}`);
  }
  console.log(failures === 0 ? 'ALL-PASS' : `FAILURES=${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('PROOF-FAIL', e && e.stack || e); process.exit(1); });
