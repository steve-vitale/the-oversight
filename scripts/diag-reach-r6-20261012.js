#!/usr/bin/env node
// diag-reach-r6-20261012.js — supplemental reachability probe (lever 0 r6).
// Records per run: scale-rank trajectory (village/regional/national/global),
// vest acquisition (military_vest/swat_vest), young-link successions
// (bearer identity changes), wave/arc/table/win cross-check.
// Usage: SEEDS="11,33" DAYS=200 OUT=/tmp/reach-r6.json node scripts/diag-reach-r6-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS || '11,33,66,99,222,333').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/reach-r6.json';

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const L = { scaleDay: {}, vests: [], successions: 0, maxWave: 1, maxArc: 1, table: false, won: false };
    let lastBearer = null, vestSeen = new Set();
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        const day = (G.state.scholar || {}).day || 0;
        // scale rank
        let rank = 'village';
        try { rank = G.scaleRank ? G.scaleRank() : 'village'; } catch (e) {}
        if (!(rank in L.scaleDay)) L.scaleDay[rank] = day;
        // vests: inventory + equipped
        try {
          const s = G.state.scholar || {};
          const items = (s.inventory || []).concat(Object.values(s.equipped || {}));
          for (const it of items) {
            const id = String((it && (it.itemId || it.id)) || '');
            if (/vest/i.test(id) && !vestSeen.has(id)) { vestSeen.add(id); L.vests.push({ id, day }); }
          }
        } catch (e) {}
        // succession: bearer identity change
        try {
          const b = G.villagerId;
          if (lastBearer === null) lastBearer = b;
          else if (b !== lastBearer) { L.successions++; lastBearer = b; }
        } catch (e) {}
        // wave/arc cross-check
        try {
          const pg = G.progState ? G.progState() : {};
          if ((pg.arc || 1) > L.maxArc) L.maxArc = pg.arc;
          if (pg.tableWaiting) L.table = true;
          if (G.won) L.won = true;
        } catch (e) {}
      } catch (e) {}
    };
    const result = await runDays(Game, policy, { days: DAYS });
    try { L.maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
    rows.push(Object.assign({ seed, days: result.days, endReason: result.endReason }, L,
      { vests: L.vests }));
    console.log(`seed=${seed} days=${result.days} end=${result.endReason} scale=${JSON.stringify(L.scaleDay)} vests=${L.vests.length} successions=${L.successions} maxWave=${L.maxWave} maxArc=${L.maxArc} table=${L.table} won=${L.won}`);
  }
  require('fs').writeFileSync(OUT, JSON.stringify({ meta: { seeds: SEEDS, days: DAYS }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
