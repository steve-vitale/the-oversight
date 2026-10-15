#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('coalition-recruitment');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const villages = G.state.otherVillages;
  // Prepared capacity case: 5/6/6 living adults, independent of seed-driven
  // background knowledge consuming a different number of RNG draws.
  for (const [i, v] of villages.entries()) {
    G.genVillageRoster(v); v.roster = v.roster.slice(0, i === 0 ? 5 : 6);
    for (const r of v.roster) { r.age = 35; r.alive = true; }
    v.opinion = 30;
  }
  const links = G.hierarchyState(); links.length = 0;
  for (const v of villages) links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: 90, arrears: 0, theirSpeaker: { id: v.roster.find(r => r.age >= 18).id, name: 'Speaker' } });
  const st = G.state.titans = { omens: { finale: { stage: 2 }, herald: { stage: 2 } }, musters: {}, slain: {}, cast: null };
  const identity = a => a.villageId + ':' + a.vid;
  T.ok('natural world has three foreign villages', villages.length === 3);
  T.ok('three prepared strong alliances have seventeen real adult volunteers', villages.reduce((n, v) => n + Math.min(6, v.roster.filter(r => r.alive && r.age >= 18).length), 0) === 17);
  const m = G.soundTitanCall('finale');
  T.ok('strong alliances send seventeen distinct real people', m.allies.length === 17 && new Set(m.allies.map(identity)).size === 17);
  T.ok('the coalition uses living adult roster members', m.allies.every(a => villages.find(v => v.id === a.villageId).roster.some(r => r.id === a.vid && r.alive && r.age >= 18)));
  const first = G.titanCommitOwn('finale'), second = G.titanCommitOwn('finale');
  T.ok('Haven commitment still requires two explicit taps', first === 'confirm' && second && m.haven.length === 3);
  T.ok('earned real-world coalition reaches the unchanged twenty-blade gate', G.titanDef('finale').minAllies === 20 && G.titanDef('the_network').minAllies === 20 && G.titanMusterReady('finale'));
  const ids = m.allies.map(identity).sort().join('|');
  G.soundTitanCall('finale');
  T.ok('repeated calls cannot duplicate fighters or exceed each village quota', m.allies.length === 17 && m.allies.map(identity).sort().join('|') === ids);
  const other = G.soundTitanCall('herald');
  T.ok('one named person cannot march in two simultaneous armies', other.allies.every(a => !m.allies.some(b => identity(a) === identity(b))));
  // A legacy duplicated muster cannot satisfy an entry gate.
  st.musters.herald = { allies: Array.from({ length: 20 }, () => Object.assign({}, m.allies[0])), haven: [] };
  T.ok('duplicate entries do not count as twenty blades', G.titanMusterReady('herald') === false);
  const gift1 = { itemId: 'stone_knife', units: 1 }, gift2 = { itemId: 'padded_cloth', units: 1 };
  st.musters = { herald: { allies: [Object.assign({}, m.allies[0], { outfitted: [gift1], hp: 90 }), Object.assign({}, m.allies[0], { outfitted: [gift2], hp: 70 })], haven: [] } };
  for (const l of links) l.status = 'inactive';
  const legacy = G.soundTitanCall('herald');
  T.ok('legacy duplicate normalization preserves real donated gear without healing', legacy.allies.length === 1 && legacy.allies[0].outfitted.includes(gift1) && legacy.allies[0].outfitted.includes(gift2) && legacy.allies[0].hp === 70);
  st.musters = {};
  for (const l of links) l.status = 'inactive';
  links[0].status = 'active'; links[0].trust = 40; villages[0].opinion = 0;
  const weak = G.soundTitanCall('herald');
  T.ok('ordinary alliance still contributes only two', weak.allies.length === 2);
  T.ok('understrength muster keeps a real call button available', G.titanSelfActions().some(a => a.id === 'titan:call:herald'));
  const weakIds = weak.allies.map(identity).join('|'); G.soundTitanCall('herald');
  T.ok('ordinary calls are idempotent too', weak.allies.length === 2 && weak.allies.map(identity).join('|') === weakIds);
  links[0].trust = 90; villages[0].opinion = 30;
  G.soundTitanCall('herald');
  T.ok('earned trust can add new volunteers without re-adding old ones', weak.allies.length === 5 && new Set(weak.allies.map(identity)).size === 5);
  const dead = weak.allies[0]; villages[0].roster.find(r => r.id === dead.vid).alive = false;
  G.soundTitanCall('herald');
  T.ok('dead roster members are not retained as marching blades', !weak.allies.some(a => identity(a) === identity(dead)));
  st.musters = { herald: { allies: [], haven: m.haven, day: 1, outfitted: {} } };
  G.state.scholar.inventory = [{ name: 'Prepared meals', units: 5, kcalEach: 1000, foodKind: 'plant', foodState: 'cooked', safe: true, edible: true, spoilDay: 9999 }];
  G.titanDawnTick();
  T.ok('Haven-only muster pays actual daily food upkeep', G.state.scholar.inventory.reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0) === 2000);
  const fallen = m.haven[0].vid;
  G.hurtVillager(fallen, 999, 'monster');
  G.state.scholar.day++;
  G.titanDawnTick();
  T.ok('fallen Haven volunteers are removed from the next upkeep count', !G.state.village.roster.includes(fallen) && G.state.scholar.inventory.reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0) === 0);
  // Isolate reinforcement pricing from the preceding death's diplomacy.
  links[0].trust = 90; villages[0].opinion = 30;
  const live = villages[0].roster.filter(r => r.alive && r.age >= 18);
  st.musters = { finale: { allies: live.slice(0, 2).map(r => ({ villageId: villages[0].id, vid: r.id, name: r.name, hp: 100, outfitted: [], gearValue: 0 })), haven: [], outfitted: {} } };
  st.campaigns = { finale: { started: true } };
  T.ok('Finale march exposes its paid reinforcement action', G.titanSelfActions().some(a => a.id === 'titan:reinforce:finale'));
  G.titanSelfDo('titan:reinforce:finale');
  T.ok('public reinforcement action recruits new living people at real trust cost', st.musters.finale.allies.length === live.length && links[0].trust === 87);
  G.titanSelfDo('titan:reinforce:finale');
  T.ok('empty reinforcement call does not charge an answering-fire fee', links[0].trust === 87);
  st.musters.finale.allies = Array.from({ length: 20 }, () => Object.assign({}, st.musters.finale.allies[0]));
  G.titanSelfDo('titan:reinforce:finale');
  T.ok('new real recruits still cost trust when old duplicate counts shrink', st.musters.finale.allies.length === live.length && links[0].trust === 84);
  const cfg = G.data.titans._coalition;
  T.ok('coalition data validates bounded earned participation', cfg && cfg.baseBlades === 2 && cfg.trustedBlades > cfg.baseBlades && cfg.trustedBlades <= 6 && cfg.trustedAt > 25 && cfg.trustedAt <= 100 && cfg.trustedOpinion >= 0);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
