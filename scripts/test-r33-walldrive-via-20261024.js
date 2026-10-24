#!/usr/bin/env node
// Proof: assignTask's via gate (r33 instrument bug, fixed in-run).
// A bogus via ('wall-drive') is NOT a remote method, so assignTask returns
// null and the order never lands — the first r33 variant pass was a no-op
// (byte-identical to control on all 4 seeds). The honest in-person route
// lands (ok:true) or refuses honestly ({ok:false}), never null.
// Usage: node scripts/test-r33-walldrive-via-20261024.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 82, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const atHaven = !!(Game.playerAtHaven && Game.playerAtHaven());
  console.log('playerAtHaven:', atHaven);
  const v = Game.state.village || {};
  const free = (v.roster || []).find(id => {
    if (id === Game.villagerId) return false;
    if ((v.assignments || {})[id]) return false;
    try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; }
  });
  if (!free) { console.log('NO-FREE-VILLAGER'); process.exit(2); }
  const bogus = Game.assignTask(free, 'stone', { via: 'wall-drive' });
  console.log('bogus-via result:', JSON.stringify(bogus));
  const honest = Game.assignTask(free, 'stone', { via: 'in-person' });
  console.log('in-person result:', JSON.stringify(honest));
  const okBogus = bogus === null;
  const okHonest = atHaven ? (honest !== null && typeof honest === 'object') : true;
  console.log('bogus-is-null:', okBogus, '| in-person-not-null:', okHonest);
  if (okBogus && okHonest) { console.log('PROOF GREEN'); process.exit(0); }
  console.log('PROOF RED'); process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
