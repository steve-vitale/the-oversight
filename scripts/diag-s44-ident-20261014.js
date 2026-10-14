#!/usr/bin/env node
// Identify the s44 infinite-fight monster (for the finding).
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'succession-ident44' });
  await setupGame(Game);
  const policy = Object.assign({}, fourthlink);
  const { driveFights, driveContests } = require('./sim-harness');
  const t0 = Date.now();
  for (let day = 1; day <= 70; day++) {
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
    const f = Game.tbfight;
    if (f && !f.over && (f.round | 0) > 5000) {
      console.log(`day=${(Game.state.scholar || {}).day} fight=${f.id} round=${f.round} over=${f.over}`);
      for (const x of (f.fighters || [])) {
        console.log(`  fighter: ${x.name || x.key} kind=${x.kind} hp=${x.hp | 0}/${x.maxHp | 0} pos=${x.mx},${x.my}`);
      }
      console.log(`  player: hp=${(Game.state.scholar || {}).hp}`);
      process.exit(0);
    }
    if (Date.now() - t0 > 90000) { console.log('budget out, no long fight seen in manual loop'); process.exit(3); }
  }
  console.log('done, no long fight in manual loop');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
