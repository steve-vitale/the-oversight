#!/usr/bin/env node
// Bisect: which sweep instrument stalls on s44 after day 55?
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { attachLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const timed = (name, fn) => {
  const t0 = Date.now();
  fn();
  const ms = Date.now() - t0;
  if (ms > 500) console.log(`  SLOW ${name}: ${ms}ms`);
};

(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'succession-bisect' });
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  tune.attachStanding(Game, m);
  attachLinkPipe(Game, m);
  const pp = m.linkpipe;
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
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
    const ctx = {};
    timed('linkpipe.snapshot', () => pp.snapshot(Game, 'leadcourt'));
    timed('fc.dailyRow', () => m.daily.push(fc.dailyRow(Game)));
    timed('sr.scaleRow', () => m.scale.daily.push(sr.scaleRow(Game)));
    timed('tune.standingSample', () => m.standing.rows.push(tune.standingSample(Game)));
    if (origDaily) origDaily(Game, ctx);
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, policy, {});
    if (Game.over) break;
    const gd = (Game.state.scholar || {}).day || 0;
    if (day % 5 === 0) console.log(`loop-day ${day} game-day ${gd} elapsed ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    if (Date.now() - t0 > 100000) { console.log('BUDGET EXCEEDED at loop-day ' + day); process.exit(3); }
  }
  console.log('done, no stall in instrument snapshots');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
