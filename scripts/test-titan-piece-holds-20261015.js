#!/usr/bin/env node
// test-titan-piece-holds-20261015.js — a titan or campaign piece you did not
// beat stays on the map to be faced again.
//
// Bugs (diagnosis-endgame 2026-10-15):
//  A. startCombat removes the player-tile world monster ("it's in the fight
//     now") and nothing put a titan-class piece back after a loss, a flee or
//     a rout. The Network said "re-face it when ready" with the piece gone
//     (the march softlocked, the key silently lost); a lost titan fight said
//     "the titan remains" and it never did (never slain, never on the map:
//     the apocalypse and the key became unreachable).
//  B. A Network node whose piece died while its escort disengaged ended
//     'routed' and did not count: the node stayed, and A made it vanish.
//
//  1. Network node lost with the coalition intact: the piece is back on its
//     tile; the march index is unchanged; the node can be fought again.
//  2. Network node: piece dead, escort fled ('routed'): the node clears.
//  3. A titan fight lost: the titan is back on the map, not slain.
//  4. Ordinary wild monsters still melt away after a flee (unchanged law).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('titan-piece-holds');

function blades(n, tag) {
  return { allies: Array.from({ length: n }, (_, i) => ({ villageId: 'v' + (i % 5), vid: tag + i, name: 'B' + i, hp: 100, outfitted: [], gearValue: 0, wbonus: 3, varmor: 3 })), haven: [], day: 100, outfitted: {} };
}

(async () => {
  const Game = await K.load({ seed: 1016 });
  K.newRun(Game);
  Game.say = () => {}; Game.sysSay = () => {};
  Game.debugScenario('network');
  const nodes = Game.networkNodes();
  const c = Game.networkCampaign();
  const pieceOf = (id) => Game.worldMonsters().find(w => w.networkNode === id);
  const at = (node) => { const t = c.tiles[node.id]; Game.map.px = t.x; Game.map.py = t.y; Game.state.scholar.mx = 1; Game.state.scholar.my = 4; };

  T.section('1. a lost node: the piece holds its ground');
  at(nodes[0]);
  Game.startCombat(nodes[0].monster);
  T.ok('fight started at node 1', !!Game.tbfight);
  Game.tbEnd('lost');
  T.ok('coalition intact, campaign not lost', !c.lost && Game._networkTest.survivors() >= 5);
  T.ok('the piece is back on its tile', !!pieceOf(nodes[0].id) && pieceOf(nodes[0].id).tx === c.tiles[nodes[0].id].x);
  T.ok('the march index is unchanged', c.idx === 0 && c.cleared.length === 0);
  at(nodes[0]);
  T.ok('the node can be faced again from its tile', (Game.playerMonster() || {}).id === nodes[0].monster && Game.startCombat(nodes[0].monster) != null && !!Game.tbfight);

  T.section('2. piece dead, escort fled: the node clears');
  if (!Game.tbfight) { at(nodes[0]); Game.startCombat(nodes[0].monster); } // a fresh fight even when (1) failed
  const f = Game.tbfight;
  const piece = f && f.fighters.find(x => x.kind === 'monster' && ((x.mdef || {}).id === nodes[0].monster));
  T.ok('node fight with its piece', !!piece);
  if (f) {
    for (const m of f.fighters.filter(x => x.kind === 'monster')) {
      if (m === piece) { m.hp = 0; m.alive = false; } else { m.fled = true; }
    }
    Game.tbEnd('routed');
  }
  T.ok('node 1 cleared (index 1)', c.idx === 1 && c.cleared[0] === nodes[0].id, 'idx ' + c.idx);
  T.ok('the dead piece is not put back', !pieceOf(nodes[0].id));

  T.section('3. a lost titan fight: the titan remains');
  Game.state.worldMonsters = [];
  const st = Game.state.titans;
  st.slain = {}; st.omens.herald = { stage: 2, day: 1, warned: {}, resolved: false };
  Game.map.px = 4; Game.map.py = 4;
  Game.spawnWorldMonster('herald', 6, 4, { titan: true, mx: 5, my: 4 });
  st.musters.herald = blades(12, 'hb');
  Game.map.px = 6; Game.map.py = 4;
  Game.startCombat('herald');
  T.ok('herald fight started', !!Game.tbfight);
  Game.tbEnd('lost');
  const h = Game.worldMonsters().find(w => w.id === 'herald');
  T.ok('the herald is back on the map', !!h && h.tx === 6 && h.ty === 4);
  T.ok('not slain', !st.slain.herald);

  T.section('4. wild monsters still melt away');
  Game.state.worldMonsters = [];
  Game.map.px = 2; Game.map.py = 2;
  Game.spawnWorldMonster('hushwolf', 2, 2, { mx: 6, my: 4 });
  Game.startCombat('hushwolf');
  Game.tbEnd('fled');
  T.ok('a fled hushwolf is not put back', !Game.worldMonsters().some(w => w.id === 'hushwolf'));

  T.done();
})();
