#!/usr/bin/env node
// probe: on baseline seeds, what recipe levels do villages reach for
// snare/pit_trap, and does anyone ever hold/set a pit_trap?
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const SEEDS = (process.env.SEEDS || '105101,105102,105103,105104').split(',').map(Number);

async function main() {
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const seed of SEEDS) {
      const base = pid === 'leadfeast' ? leadfeast : belongfeast;
      const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
      await setupGame(Game);
      const oDaily = base.daily;
      let maxPit = 0, maxSnare = 0, sawPitHeld = 0, sawPitSet = 0, sawBook = 0;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try {
          const r = (G.state.codex || {}).recipes || {};
          maxPit = Math.max(maxPit, (r.pit_trap || {}).level || 0);
          maxSnare = Math.max(maxSnare, (r.snare || {}).level || 0);
          const tools = (G.state.scholar || {}).tools || [];
          if (tools.some(t => t && t.recipeId === 'pit_trap')) sawPitHeld = 1;
          const tiles = (G.map && G.map.tiles) || [];
          for (let y = 0; y < tiles.length; y++) for (let x = 0; x < (tiles[y] || []).length; x++) {
            const tr = (tiles[y][x] || {}).traps || [];
            if (tr.some(t => t && t.recipeId === 'pit_trap')) sawPitSet = 1;
          }
          const inv = (G.state.scholar || {}).inventory || [];
          if (inv.some(i => i && i.itemId === 'trappers_handbook')) sawBook = 1;
        } catch (e) {}
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 60 }); });
      console.log(`${pid}-${seed}: days=${result && result.days} snareL=${maxSnare} pitL=${maxPit} pitHeld=${sawPitHeld} pitSet=${sawPitSet} handbook=${sawBook}`);
    }
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
