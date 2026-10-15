#!/usr/bin/env node
// probe: re-sim seed 71 to day 135, dump overtime state daily 95-135.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
async function main() {
  const { Game } = await loadGame({ seed: 71, mode: 'endgame-r13-leadfeast' });
  await setupGame(Game);
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  let loopDay = 0;
  const ROWS = [];
  policy.daily = (G, ctx) => {
    loopDay++;
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    const d = day(G);
    if (d >= 95 && d <= 140) {
      let tier = '?', active = '?', seat = '?', waiting = '?', announced = '?', days = '?', pgOver = '?';
      try { tier = Game.overtimeTier(); } catch (e) { tier = 'ERR:' + e.message; }
      try { active = Game.overtimeActive() ? 1 : 0; } catch (e) { active = 'ERR'; }
      try { seat = (Game.tableSeat() || {}).seat; } catch (e) { seat = 'ERR'; }
      try { const pg = Game.progState(); waiting = pg.tableWaiting ? 1 : 0; announced = pg.tableAnnounced ? 1 : 0; days = pg.overtimeDays | 0; pgOver = pg.overtime | 0; } catch (e) {}
      ROWS.push(`d${d} tier=${tier} active=${active} seat=${seat} waiting=${waiting} announced=${announced} otDays=${days} pg.overtime=${pgOver}`);
    }
  };
  const result = await runDays(Game, policy, { days: 140, sampleEvery: 1000 });
  console.log('END days=' + result.days + ' ' + result.endReason + ' scholarDay=' + day(Game));
  console.log(ROWS.join('\n'));console.log('ROWS=' + ROWS.length);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
