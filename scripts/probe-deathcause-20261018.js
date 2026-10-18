#!/usr/bin/env node
// probe-deathcause-20261018.js -- why does the staged cannibal die so fast?
// Re-runs the 7207 staging, then reads the fallen entry + scholar vitals.
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const SEED = parseInt(process.env.SEED || '7207', 10);
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function livingNpcs(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-deathcause', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 20 });
  const s0 = Game.state.scholar;
  console.log(`[VITALS] d${dayOf(Game)} hp=${s0.health} kcal=${Math.round(s0.kcal || 0)} trauma=${s0.trauma || 0} statuses=${JSON.stringify((s0.statuses || []).map(x => x.id || x))} diseases=${JSON.stringify((s0.diseases || []).map(x => x.id || x))}`);
  const npcs = livingNpcs(Game);
  const victim = npcs[Math.floor(npcs.length / 2)];
  const vname = Game.displayName(victim);
  Game.registerDeath({ kind: 'villager', villagerId: victim, name: vname, cause: 'a wound that wouldn\'t close', killerId: null });
  Game.removeVillager(victim, 'killed');
  Game.seedGossip('death', { who: victim }, []);
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === victim && !c.buried);
  if (!Game.hasCuttingTool()) {
    const def = ((Game.data || {}).items || []).find(d => d && (d.class === 'weapon' || d.class === 'tool') && /knife|machete|blade/i.test(String(d.name || '') + ' ' + String(d.id || '')));
    if (def) Game.state.scholar.inventory.push({ id: def.id, name: def.name, plantId: def.id, units: 1, kcalEach: 0, edible: false });
  }
  Game.corpseButcher(corpse.id);
  const inv = Game.state.scholar.inventory || [];
  const midx = inv.findIndex(it => it && it.plantId === 'meat_human' && (it.units || 0) > 0);
  if (midx >= 0) Game.eatCannibal(midx);
  const s1 = Game.state.scholar;
  console.log(`[VITALS] post-beat hp=${s1.health} kcal=${Math.round(s1.kcal || 0)} trauma=${s1.trauma || 0} corruption=${((Game.state.village || {}).corruption || {})[Game.villagerId]}`);
  const b0 = Game.villagerId;
  for (let d = 0; d < 6 && !Game.over; d++) {
    await runDays(Game, oracleV2, { days: 1 });
    if (Game.villagerId !== b0) {
      const fallen = ((Game.state.village || {}).fallen || []);
      const f = fallen[fallen.length - 1] || {};
      console.log(`[DEATH] d${dayOf(Game)} bearer died. fallen entry: name=${f.name} cause=${f.cause} day=${f.day}`);
      const s2 = Game.state.scholar;
      console.log(`[SUCCESSOR] hp=${s2.health} trauma=${s2.trauma || 0}`);
      break;
    }
    const s = Game.state.scholar;
    console.log(`[D+${d + 1}] d${dayOf(Game)} hp=${s.health} kcal=${Math.round(s.kcal || 0)} trauma=${s.trauma || 0} diseases=${JSON.stringify((s.diseases || []).map(x => x.id || x))}`);
  }
  if (Game.villagerId === b0) console.log('[ALIVE] bearer survived 6 days');
}
main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
