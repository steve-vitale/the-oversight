#!/usr/bin/env node
// Prepared kits, real office actions; this does not claim natural ascension.
'use strict';
const K = require('./lib'), T = K.reporter('relay-deed');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const GH = globalThis.Scattering.Godhood, god = GH.byId('voice_of_the_relay');
  const s = G.state.scholar, v = G.state.village;
  const ids = ['scream_cheese', 'cheese_wheel', 'crowd_favorite', 'live_broadcast'];
  s.day = 85; G.state.day = 85; G.state.systemArrived = true;
  s.abilities = ids.map(id => ({ id, level: 1 })); s.activeSynergies = [];
  G.recognizeClass('player'); // fresh class: no ten-day fallback
  const close = () => GH.godhoodCloseness(s, god, s.day);
  T.ok('prepared full Socialite kit has no deed before holding the office', close().classOk && close().coreHit && close().kit === 4 && !close().synergy && !close().complete);
  T.ok('claiming an unnetworked relay is refused and grants no deed', G.claimRelay() === null && !close().synergy);
  G.state.networkLive = true;
  T.ok('real player claim completes the office deed immediately', G.claimRelay() === 'claimed' && G.switchboard().holderId === G.villagerId && close().synergy && close().complete);
  T.ok('a detached scholar without a bearer id cannot borrow the live holder deed', !GH.godhoodCloseness({ ...s, villagerId: undefined }, god, s.day).synergy);
  T.ok('office deed does not bypass the day-80 gate', !GH.godhoodCloseness(s, god, 79).complete);
  const held = s.abilities;
  s.abilities = held.filter(a => a.id !== 'crowd_favorite');
  T.ok('office deed does not bypass payoff or four-ability gates', !close().coreHit && close().kit === 3 && !close().complete);
  s.abilities = held;
  G.removeSwitchboard('test handover');
  T.ok('removing the office revokes its deed until another deed is earned', !close().synergy && !close().complete);
  const vid = G.switchboardCandidates()[0]?.id;
  if (!vid) throw new Error('fixture has no valid relay candidate');
  v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = ids.slice();
  v.npcSynergies = v.npcSynergies || {}; v.npcSynergies[vid] = [];
  G.recognizeClass(vid);
  const npc = () => GH.villagerGodhoodCloseness(G, vid, god);
  T.ok('fresh villager class has the same kit but no office deed', npc().classOk && npc().coreHit && npc().kit === 4 && !npc().synergy && !npc().complete);
  const appointment = G.appointSwitchboard(vid);
  T.ok('real villager appointment completes the same office deed', appointment?.holderId === vid && npc().synergy && npc().complete);
  const showrunner = v.npcAbilities[vid];
  v.npcAbilities[vid] = ['fear_aura', 'war_cry', 'rally_aura', 'the_crowd_moves'];
  G.recognizeClass(vid);
  T.ok('the appointed Demagogue has the same noncombat office route', G.godpathClass(vid).subclass === 'demagogue' && npc().complete);
  v.npcAbilities[vid] = showrunner; G.recognizeClass(vid);
  const other = (v.roster || []).find(id => id !== vid && id !== G.villagerId);
  T.ok('a different villager cannot use the holder office deed', !!other && !GH.villagerGodhoodCloseness(G, other, god).synergy);
  T.ok('appointing a villager does not give their deed to the player', !close().synergy && !close().complete);
  G.checkVillagerGodhoodAscension(vid);
  T.ok('real villager gate awards the Voice ceremony and capstone gift', v.npcGodhood?.[vid]?.active.includes(god.id) && G.getPerson(vid).items.some(i => (i.itemId || i.id) === god.requires.capstoneItems[0]));
  G.removeSwitchboard('test handover'); G.claimRelay(); G.checkPlayerGodhoodAscension();
  T.ok('real player gate awards the Voice ceremony and capstone gift', s.godhood?.active.includes(god.id) && s.inventory.some(i => (i.itemId || i.id) === god.requires.capstoneItems[0]));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
