#!/usr/bin/env node
// scripts/diag-s44-stall-20261014.js — where does baseline s44 stall?
// Steps the sim day by day with progress; reports the fight state when the
// day clock stops advancing. Read-only diagnosis, not a fix.
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'succession-diag44' });
  await setupGame(Game);
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  let lastReport = 0;
  const t0 = Date.now();
  policy.daily = (G, ctx) => {
    const d = (G.state.scholar || {}).day || 0;
    if (d - lastReport >= 2) {
      lastReport = d;
      const f = G.tbfight;
      console.log(`day=${d} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s fight=${f ? (f.over ? 'over' : 'LIVE') : 'none'}` +
        (f && !f.over ? ` mhp=${(f.monsters || []).map(m => (m.name || '?') + ':' + (m.hp | 0)).join(',')}` : ''));
    }
    if (origDaily) origDaily(G, ctx);
  };
  // manual day loop with a wall-clock budget
  const BUDGET_MS = 100000;
  let day = 0;
  const { driveFights, driveContests } = require('./sim-harness');
  for (day = 1; day <= 70; day++) {
    for (let p = 0; p < 3; p++) {
      driveFights(Game, policy, {});
      driveContests(Game, policy, {});
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      driveFights(Game, policy, {});
      driveContests(Game, policy, {});
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, {}); } catch (e) {} }
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, policy, {});
    if (Game.over) break;
    if (Date.now() - t0 > BUDGET_MS) {
      const d = (Game.state.scholar || {}).day || 0;
      const f = Game.tbfight;
      console.log(`BUDGET EXCEEDED at loop-day ${day}, game day ${d}`);
      console.log(`fight live=${!!(f && !f.over)} over=${Game.over}`);
      if (f && !f.over) {
        console.log(`monsters: ${(f.monsters || []).map(m => (m.name || '?') + ' hp=' + (m.hp | 0) + ' pos=' + JSON.stringify(m.pos)).join(' | ')}`);
        console.log(`round=${f.round}`);
      }
      process.exit(3);
    }
  }
  console.log(`completed to loop-day ${day}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
