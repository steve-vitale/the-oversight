#!/usr/bin/env node
// Prepared kits, real office actions; this does not claim natural ascension.
'use strict';
const K = require('./lib'), T = K.reporter('relay-deed');
(async () => {
  const saves = new Map();
  global.localStorage = { getItem: k => saves.get(String(k)) ?? null,
    setItem: (k,x) => saves.set(String(k),String(x)), removeItem: k => saves.delete(String(k)),
    key: i => [...saves.keys()][i] ?? null, get length() { return saves.size; } };
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const GH = globalThis.Scattering.Godhood, god = GH.byId('voice_of_the_relay');
  const s = G.state.scholar, v = G.state.village;
  const ids = ['scream_cheese', 'cheese_wheel', 'crowd_favorite', 'live_broadcast'];
  s.day = 85; G.state.day = 85; G.state.systemArrived = true;
  K.openSlots(G, 4);
  s.abilities = ids.map(id => ({ id, level: 1 })); s.activeSynergies = [];
  G.recognizeClass('player'); // fresh class: no ten-day fallback
  const close = () => GH.godhoodCloseness(s, god, s.day);
  s.godpath.since = 1;
  const missing = JSON.stringify(G.state);
  T.ok('an old named class cannot bypass actual Relay service', !close().synergy && !close().complete);
  T.ok('reading an unheld office invents no saved work', JSON.stringify(G.state) === missing && !v.godpathDeeds);
  T.ok('known Socialite gets the fitting office objective', G.godpathDeedHint('player') === god.requires.deed?.hint && !!god.requires.deed?.hint);

  T.ok('prepared full Socialite kit has no deed before holding the office', close().classOk && close().coreHit && close().kit === 4 && !close().synergy && !close().complete);
  T.ok('claiming an unnetworked relay is refused and grants no deed', G.claimRelay() === null && !close().synergy);
  G.state.networkLive = true;
  T.ok('real player claim completes the office deed immediately', G.claimRelay() === 'claimed' && G.switchboard().holderId === G.villagerId && close().synergy && close().complete);
  T.ok('the live office deed uses the actual appointment day', G.godpathDeedStatus('player', god.id)?.day === G.switchboard().appointedDay);
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
  v.npcGodpath[vid].since = 1;
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
  const status = () => G.godpathDeedStatus('player', god.id);
  T.ok('a currently held office completes the same read-only status API', status()?.complete && !v.godpathDeeds);
  s.health = 0;
  T.ok('a dead holder cannot satisfy live Relay service', !status()?.complete);
  s.health = 100;
  G.removeSwitchboard('handover');
  T.ok('old recognized gods retain their earned status after leaving the office', s.godhood.active.includes(god.id) && G.godpathDeedHint('player') === null);
  G.claimRelay();
  const office = JSON.stringify(G.state.switchboard), holder = G.villagerId;
  G.save();
  T.ok('actual save/load preserves current office and canonical deed ownership', G.load(G.state.runKey) && G.villagerId === holder && JSON.stringify(G.state.switchboard) === office && status()?.complete);
  delete G.state.switchboard.appointedDay;
  T.ok('a legacy current office needs no invented historical date', status()?.complete && status().day === null);
  G.removeSwitchboard('saved handover');
  T.ok('saved history cannot replace current service after removal', !status()?.complete && !G.state.village.godpathDeeds);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
