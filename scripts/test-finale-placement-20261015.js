#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib'), T = K.reporter('finale-placement');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const valid = m => !!m && Number.isInteger(m.tx) && Number.isInteger(m.ty) && m.tx >= 0 && m.tx < 9 && m.ty >= 0 && m.ty < 9;
  const fresh = (x, y) => {
    G.tbfight = null; G.state.worldMonsters = []; G.state.scholar.monster = null;
    G.map.px = x; G.map.py = y;
    G.state.titans = { omens: { finale: { stage: 2 } }, musters: {}, slain: {} };
  };
  // Unit resolution fixtures: no claim that these synthetic wins were played.
  // Each real placement/resolve caller runs from all 81 possible origin tiles.
  let crews = true, openings = true, hearts = true, safe = true, distinct = true;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    fresh(x, y); G.finaleCampaignPlace('finale');
    const crew = G.worldMonsters().find(m => m.id === 'finale_crew');
    crews = crews && valid(crew);
    if (!valid(crew)) continue;
    safe = safe && !G.isSafeTile(crew.tx, crew.ty);
    distinct = distinct && (crew.tx !== x || crew.ty !== y);
    G.map.px = crew.tx; G.map.py = crew.ty;
    G._finaleTest.finaleResolveNode({ campaign: 'finale_crew', result: 'won', allies: [] });
    const opening = G.worldMonsters().find(m => m.id === 'finale_opening');
    openings = openings && valid(opening);
    if (!valid(opening)) continue;
    safe = safe && !G.isSafeTile(opening.tx, opening.ty);
    distinct = distinct && (opening.tx !== crew.tx || opening.ty !== crew.ty);
    G.map.px = opening.tx; G.map.py = opening.ty;
    G._finaleTest.finaleResolveNode({ campaign: 'finale_opening', result: 'won', allies: [] });
    const heart = G.worldMonsters().find(m => m.id === 'finale');
    hearts = hearts && valid(heart);
    if (!valid(heart)) continue;
    safe = safe && !G.isSafeTile(heart.tx, heart.ty);
    distinct = distinct && (heart.tx !== opening.tx || heart.ty !== opening.ty);
  }
  T.ok('crew placement stays inside travel map from all 81 origins', crews);
  T.ok('actual crew-resolution caller places opening inside map', openings);
  T.ok('actual opening-resolution caller places heart inside map', hearts);
  T.ok('all stages avoid village safe tiles', safe);
  T.ok('each stage requires leaving the current tile', distinct);
  // Discover an actually legal eastward site in this current seeded map.
  // The old fixed4,1 premise can now be a village and should be avoided.
  const east = Array.from({ length: 54 }, (_, i) => ({ x: i % 6, y: Math.floor(i / 6) }))
    .find(p => !G.isSafeTile(p.x + 3, p.y));
  T.ok('current seeded map supplies a legal ordinary eastward site', !!east);
  fresh(east.x, east.y);
  const site = G.titanPlacementTile && G.titanPlacementTile(3);
  T.ok('ordinary intended eastward site is retained when legal', site && site.x === east.x + 3 && site.y === east.y);
  G.spawnWorldMonster('turtle', east.x + 3, east.y, { mx: 3, my: 3 });
  const spare = G.titanPlacementTile && G.titanPlacementTile(3);
  T.ok('occupied site is avoided without deleting its monster', spare && (spare.x !== east.x + 3 || spare.y !== east.y) && G.monsterAt(east.x + 3, east.y).id === 'turtle');
  fresh(8, 3);
  G.state.titans.cast = { herald: 'herald', apocalypse: 'nielsen' };
  G.state.titans.omens.herald = { stage: 1, day: 0, warned: {} };
  G.state.scholar.day = 20;
  for (let i = 0; i < 50 && !G.worldMonsters().some(m => m.id === 'herald'); i++) G.titanDawnTick();
  T.ok('real dawn omen caller also places an ordinary titan inside the map', valid(G.worldMonsters().find(m => m.id === 'herald')));
  fresh(8, 3);
  const broken = { id: 'finale', tx: 15, ty: 3, hp: 123, maxHp: 456, mx: 2, my: 2, titan: true, homeTx: 15, homeTy: 3 };
  const unknown = { id: 'turtle', tx: 15, ty: 3, hp: 27 };
  const network = { id: 'network_heart', networkNode: 'heart', tx: 16, ty: 3, hp: 28 };
  G.state.worldMonsters.push(broken, unknown, network);
  G.state.titans.campaigns = { finale: { started: true, crew: true, opening: true } };
  const said = [], say = G.say; G.say = function(s) { said.push(String(s)); return say.apply(this, arguments); };
  G.titanSelfActions();
  T.ok('public self actions repair existing invalid Finale location', valid(broken));
  T.ok('repair preserves object, HP, detail location and campaign progress', G.worldMonsters().includes(broken) && broken.hp === 123 && broken.maxHp === 456 && broken.mx === 2 && G.state.titans.campaigns.finale.opening);
  T.ok('repair keeps home coordinates consistent', broken.homeTx === broken.tx && broken.homeTy === broken.ty);
  T.ok('repair leaves unrelated and Network-owned coordinates alone', unknown.tx === 15 && network.tx === 16);
  T.ok('scouts announce the repaired actual coordinates', said.some(s => s.includes('tile ' + broken.tx + ',' + broken.ty)));
  const count = said.length; G.titanSelfActions();
  T.ok('repeated self actions do not move or reannounce a legal objective', said.length === count);
  G.tbfight = { fighters: [], round: 1 }; broken.tx = 15; G.titanSelfActions();
  T.ok('active fights do not relocate their world objective', broken.tx === 15);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
