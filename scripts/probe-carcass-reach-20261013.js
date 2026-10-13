#!/usr/bin/env node
// probe-carcass-reach-20261013.js — diagnostic: WHERE do monster carcasses
// land relative to the player, and who killed them? Informs the haul policy
// design (what fraction of the corpse-rot pool is ever policy-reachable).
// Run: SEED=11 DAYS=60 node scripts/probe-carcass-reach-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '11', 10);
  const days = parseInt(process.env.DAYS || '60', 10);
  const { Game } = await loadGame({ seed, mode: 'carcass-probe' });
  await setupGame(Game);
  const census = [];
  const origMME = Game.monsterMeatEntry;
  Game.monsterMeatEntry = function (mdef) {
    const r = origMME.apply(this, arguments);
    try {
      const list = Game.corpses ? Game.corpses() : [];
      // newest monster corpse = the one just registered for this kill
      let c = null;
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] && list[i].kind === 'monster' && list[i].monsterId === (mdef && mdef.id)) { c = list[i]; break; }
      }
      const s = Game.state.scholar || {};
      const pn = (Game.map && Game.map.px != null) ? { x: Game.map.px, y: Game.map.py } : null;
      const pt = { x: s.mx != null ? s.mx : 4, y: s.my != null ? s.my : 4 };
      census.push({
        day: s.day || 0, mid: (mdef && mdef.id) || '?',
        kcal: (r && r.hiddenKcal) || 0,
        killer: (c && c.killerId) || '?',
        playerKiller: !!(c && Game.villagerId && c.killerId === Game.villagerId),
        corpseNode: c && c.node ? { x: c.node.x, y: c.node.y } : null,
        corpseTile: c ? { x: c.mx, y: c.my } : null,
        playerNode: pn, playerTile: pt,
        sameNode: !!(c && c.node && pn && c.node.x === pn.x && c.node.y === pn.y),
      });
    } catch (e) {}
    return r;
  };
  const result = await runDays(Game, competent, { days, sampleEvery: 10 });
  console.log(`seed=${seed} ran ${result.days}d (${result.endReason})`);
  let playerK = 0, playerKcal = 0, villK = 0, villKcal = 0;
  let sameNodeK = 0, sameNodeKcal = 0, pkSameKcal = 0, vkSameKcal = 0;
  for (const e of census) {
    if (e.playerKiller) { playerK++; playerKcal += e.kcal; if (e.sameNode) pkSameKcal += e.kcal; }
    else { villK++; villKcal += e.kcal; if (e.sameNode) vkSameKcal += e.kcal; }
    if (e.sameNode) { sameNodeK++; sameNodeKcal += e.kcal; }
  }
  console.log(`carcasses: ${census.length}`);
  console.log(`player kills: ${playerK} (${playerKcal} kcal) | villager/other kills: ${villK} (${villKcal} kcal)`);
  console.log(`corpse on player's node at death: ${sameNodeK} (${sameNodeKcal} kcal) — player-kill same-node ${pkSameKcal} kcal, villager-kill same-node ${vkSameKcal} kcal`);
  console.log(`out-of-reach-at-death (villager, other node): ${villKcal - vkSameKcal} kcal of ${playerKcal + villKcal} total = ${(((villKcal - vkSameKcal) / Math.max(1, playerKcal + villKcal)) * 100).toFixed(1)}%`);
  // show a few examples
  console.log('sample events:');
  for (const e of census.slice(0, 8)) console.log('  ', JSON.stringify(e));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
