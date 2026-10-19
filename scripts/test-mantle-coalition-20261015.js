#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('mantle-coalition');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const v = G.state.village, links = G.hierarchyState(); links.length = 0;
  for (const town of G.state.otherVillages) {
    G.genVillageRoster(town); town.opinion = 30;
    links.push({ primary: 'haven', subordinate: town.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: town.roster.find(p => p.age >= 18).id, name: 'Speaker' } });
  }
  G.state.titans = { omens: { herald: { stage: 2 } }, musters: {}, slain: {}, cast: null };
  const m = G.soundTitanCall('herald'); m.allies = m.allies.slice(0, 7);
  const home = m.allies[0].villageId, n = m.allies.filter(a => a.villageId === home).length;
  G.state.scholar.inventory = Array.from({ length: n }, () => ({ itemId: 'stone_knife', units: 1 }));
  const given = G.titanOutfit('herald', home, Array.from({ length: n }, (_, i) => i));
  T.ok('gear-preservation probe starts with actual transferred knives', given && given.given === n && m.allies.filter(a => a.villageId === home).every(a => a.outfitted.some(i => i.itemId === 'stone_knife')));
  G.titanCommitOwn('herald'); G.titanCommitOwn('herald');
  T.ok('seven real foreign volunteers plus three Haven blades meet ten-blade gate', m.allies.length === 7 && m.haven.length === 3 && G.titanMusterReady('herald'));
  const successor = m.haven[0].vid, oldBearer = G.villagerId;
  v.trust = v.trust || {}; for (const id of v.roster) v.trust[id] = id === successor ? 100 : 0;
  const gearBefore = JSON.stringify(m.allies);
  G.playerDeath('prepared mantle identity probe');
  T.ok('actual death transfers mantle to a committed volunteer', G.villagerId === successor && G.villagerId !== oldBearer && !v.roster.includes(oldBearer));
  T.ok('successor immediately leaves the NPC muster role', m.haven.length === 2 && !m.haven.some(h => h.vid === successor));
  T.ok('successor no longer has a committed-workforce flag', !v.titanCommitted[successor]);
  T.ok('surviving foreign people and donated gear remain unchanged', JSON.stringify(m.allies) === gearBefore);
  T.ok('same person cannot supply the missing tenth allied blade', !G.titanMusterReady('herald'));
  G.state.scholar.inventory = [{ name: 'Prepared meals', units: 20, kcalEach: 1000, foodKind: 'plant', foodState: 'cooked', edible: true, safe: true, spoilDay: 9999 }];
  G.titanDawnTick();
  T.ok('upkeep feeds nine allied bodies, not a duplicate bearer', G.playerPackKcal() === 11000);
  G.state.scholar.insideHaven = false;
  G.startCombat('bulldozer'); G.titanInjectAllies('herald');
  const allies = G.tbfight.fighters.filter(f => f.kind === 'ally');
  T.ok('actual injection has nine allies and no cloned current bearer', allies.length === 9 && !allies.some(a => a.villagerId === G.villagerId));
  G.tbEnd('fled');
  // Old saves can contain the current bearer as a legacy string entry.
  m.haven.push(successor); v.titanCommitted[successor] = 'herald';
  T.ok('readiness excludes a legacy current-bearer entry before mutation', !G.titanMusterReady('herald'));
  G.titanDawnTick();
  T.ok('dawn retires legacy bearer entry and workforce flag', m.haven.length === 2 && !v.titanCommitted[successor]);
  const first = G.titanCommitOwn('herald'), second = G.titanCommitOwn('herald');
  T.ok('vacated place can be filled only by another two-tap volunteer commitment', first === 'confirm' && second && m.haven.length === 3 && !m.haven.some(h => h.vid === successor) && G.titanMusterReady('herald'));
  // Prepared saved Network march: the old bearer is already gone, but an
  // old save still lists the current bearer as an extra surviving ally.
  G.networkSummon(); const march = G.networkCampaign(); march.started = true;
  const net = { allies: m.allies.slice(0, 3), haven: [{ vid: successor }, m.haven[0]], outfitted: {} };
  G.state.titans.musters = { the_network: net };
  const node = G.networkCurrentNode(), tile = march.tiles[node.id];
  G.map.px = tile.x; G.map.py = tile.y; G.state.scholar.insideHaven = false;
  G.startCombat(node.monster);
  T.ok('saved Network march cannot count the bearer as its fifth surviving ally', !G.tbfight);
  if (G.tbfight) G.tbEnd('fled'); // negative control may have entered
  net.allies.push(m.allies[3]); G.startCombat(node.monster);
  T.ok('five actual survivors enter the Network node without a bearer clone', G.tbfight && G.tbfight.fighters.filter(a => a.kind === 'ally').length === 5 && !G.tbfight.fighters.some(a => a.kind === 'ally' && a.villagerId === successor));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
