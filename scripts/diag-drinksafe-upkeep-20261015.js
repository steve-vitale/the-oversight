#!/usr/bin/env node
// diag-drinksafe-upkeep-20261015.js — why didn't the fixed drinkSafe fire?
// Records every upkeep call's (tileType, pack, atHaven) on the ARMED side and
// every fillWater call, to separate "upkeep never on wetland with room" from
// "fill refused".
// Usage: node scripts/diag-drinksafe-upkeep-20261015.js [seed] [policyId]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const seed = parseInt(process.argv[2] || '22', 10);
const policyId = process.argv[3] || 'leadcourt';

async function main() {
  const policy = require('./policies/' + policyId)[policyId];
  const { Game } = await loadGame({ seed, mode: 'drinksafe-diag', fullTelemetry: false });
  await setupGame(Game);
  const upkeepCtx = [];
  const oUpkeep = policy.upkeep.bind(policy);
  policy.upkeep = function (G, ctx) {
    try {
      const t = G.playerTile(); const s = G.state.scholar;
      upkeepCtx.push({
        day: s.day, tile: t && t.type,
        pack: (s.water || []).length,
        ah: (() => { try { return G.playerAtHaven(); } catch (e) { return '?'; } })(),
      });
    } catch (e) {}
    return oUpkeep(G, ctx);
  };
  const fills = [];
  const oFill = Game.fillWater.bind(Game);
  Game.fillWater = function () {
    const pk0 = (Game.state.scholar.water || []).length;
    let tt = null; try { const t = Game.playerTile(); tt = t && t.type; } catch (e) {}
    const r = oFill.apply(this, arguments);
    const pk1 = (Game.state.scholar.water || []).length;
    fills.push({ day: Game.state.scholar.day, tile: tt, gained: pk1 > pk0 });
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 10 }); });
  const onWet = upkeepCtx.filter(u => u.tile === 'wetland');
  const onWetRoom = onWet.filter(u => u.pack < 3);
  console.log(`upkeep calls: ${upkeepCtx.length}, on-wetland: ${onWet.length}, on-wetland+pack<3: ${onWetRoom.length}`);
  const packHist = {};
  for (const u of onWet) packHist[u.pack >= 3 ? '3+' : u.pack] = (packHist[u.pack >= 3 ? '3+' : u.pack] || 0) + 1;
  console.log('pack distribution at on-wetland upkeeps:', JSON.stringify(packHist));
  console.log('on-wetland+pack<3 upkeeps (first 10):', JSON.stringify(onWetRoom.slice(0, 10)));
  const wetFills = fills.filter(f => f.tile === 'wetland');
  console.log(`fillWater calls: ${fills.length}, on-wetland: ${wetFills.length}, gained-on-wetland: ${wetFills.filter(f => f.gained).length}`);
  const refused = fills.filter(f => !f.gained);
  console.log(`refused fills: ${refused.length}`, JSON.stringify(refused.slice(0, 5)));
  console.log(`run days: ${Game.state.scholar.day}`);
}
main().catch(e => { console.error('DIAG ERROR', e); process.exit(2); });
