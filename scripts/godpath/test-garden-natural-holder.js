'use strict';
const K = require('./lib'), T = K.reporter('Natural NPC garden holder');
(async () => {
  const G = await K.load({ seed: 7002 });
  K.newRun(G);
  G.exitBuilding();
  const s = G.state.scholar, v = G.state.village;
  const npc = v.roster.find(id => id !== G.villagerId);
  const plot = {};
  G.gardenPlant(plot, 'lambs_quarters', s.day);
  G.map.tiles[4][4].plots = [plot];
  const needs = G.npcNeeds(npc);
  needs.hunger = 10;
  G.npcGrantAbility(npc, 'green_whisper');
  T.ok('the public grant creates the real NPC ID representation', v.npcAbilities[npc].includes('green_whisper') && G.npcHasAbility(npc, 'green_whisper'));
  T.ok('garden planning recognizes that actually held ability', G.gardenMagicPlan(npc)?.source === 'green_whisper');
  T.ok('planning does not invent saved practice', v.npcAbilityPractice === undefined);
  const food = s.kcal, hunger = needs.hunger;
  const cast = G.cultivateGarden(npc);
  T.ok('a real NPC holder can cultivate a growing bed', cast === true && plot.magicGrowth > 0 && plot.magicOwner === npc);
  T.ok('the NPC pays their own food rather than the player', needs.hunger > hunger && s.kcal === food);
  const paid = needs.hunger;
  T.ok('same-day bed limit prevents a second charge', G.cultivateGarden(npc) === false && needs.hunger === paid);
  for (let i = 0; i < 2; i++) { s.day++; G.cultivateGarden(npc); }
  const practice = v.npcAbilityPractice?.[npc]?.green_whisper;
  T.ok('three real paid casts earn their own six-XP level', practice?.level === 2 && practice.xp === 0);
  T.ok('canonical ownership and build queries still use IDs', v.npcAbilities[npc].includes('green_whisper') && G.npcHasAbility(npc, 'green_whisper') && G._buildHeld(npc).includes('green_whisper'));
  const other = v.roster.find(id => id !== G.villagerId && id !== npc);
  G.npcGrantAbility(other, 'green_whisper');
  T.ok('another holder does not borrow the first gardener mastery', G.gardenAbilityEntry(other, 'green_whisper').level === 1);
  G.npcRevokeAbility(other, 'green_whisper');
  v.npcAbilityPractice[other] = { green_whisper: { id: 'green_whisper', level: 3, xp: 0 } };
  T.ok('stale practice cannot grant an unheld power', G.gardenMagicPlan(other) === null);
  const roundtrip = JSON.parse(JSON.stringify(G.state));
  G.state = roundtrip;
  T.ok('practice survives a JSON save-state roundtrip', G.gardenAbilityEntry(npc, 'green_whisper').level === 2);
  // Prepared death/successor selection, not natural campaign evidence. Use
  // the whole real death route, including occupation grants after import.
  G.state.village.trust = { ...G.state.village.trust, [npc]: 10000 };
  G.playerDeath('prepared natural-holder succession test');
  T.ok('actual death selects the practiced holder', G.villagerId === npc && !G.over);
  const inherited = G.state.scholar.abilities.find(a => a.id === 'green_whisper');
  T.ok('earned mastery belongs to the incoming body', inherited?.level === 2 && inherited.xp === 0);
  T.ok('mantle removes duplicate NPC practice without deleting another person', !G.state.village.npcAbilityPractice[npc] && G.state.village.npcAbilityPractice[other].green_whisper.level === 3);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
