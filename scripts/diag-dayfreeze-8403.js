// diag-dayfreeze-8403.js — diagnose the game-day freeze on seed 8403
// (maxGameDay=127 with endReason=survived: the harness loop completed but
// the game clock froze). Traces scholar.day, fight state, pending choices,
// and pending conversations across the tail of the run.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

async function main() {
  const seed = 8403;
  const { Game } = await loadGame({ seed, mode: 'diag-dayfreeze' });
  await setupGame(Game);
  const ctx = {};
  const policy = leadcourt;
  // run to day ~118 via the normal driver, then trace the tail manually
  const r1 = await runDays(Game, policy, { days: 118, manifest: { seed, mode: 'diag' } });
  console.log('after 118 loop-days: scholar.day =', (Game.state.scholar || {}).day, 'over =', !!Game.over);
  for (let i = 0; i < 30; i++) {
    const before = (Game.state.scholar || {}).day;
    try { Game.doAction('wait'); } catch (e) { console.log('wait threw:', e.message); }
    try { Game.sleep(); } catch (e) { console.log('sleep threw:', e.message); }
    const after = (Game.state.scholar || {}).day;
    const f = Game.tbfight;
    console.log(`iter ${i}: day ${before} -> ${after}` +
      (f && !f.over ? ` FIGHT-OPEN` : '') +
      (Game.state.pendingNational ? ' PENDING-NATIONAL' : '') +
      (Game.state.pendingGlobal ? ' PENDING-GLOBAL' : '') +
      (Game.state.pendingAccord ? ' PENDING-ACCORD' : '') +
      (Game.over ? ' OVER' : ''));
    if (Game.over) break;
  }
  process.exit(0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
