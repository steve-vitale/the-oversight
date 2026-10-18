#!/usr/bin/env node
// dayfreeze-manual-20261018.js — decisive probe: when the fight stalls at a
// non-player turn, call Game.tbAdvance() manually and observe. If it completes
// the turn, the bug is "nothing calls tbAdvance in the sim loop"; if it
// stalls/throws, the bug is inside the turn logic.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-manual', desc: base.desc + ' [MANUAL]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);


  const oEndCheck = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function (...a) {
    const r = oEndCheck.apply(this, a);
    const f = Game.tbfight;
    if (r === true && f && !f.over) {
      const c = Game.tbCurrent();
      process.stderr.write('TBENDCHECK-TRUE-WITHOUT-OVER: round=' + f.round + ' idx=' + f.turnIdx + ' current=' + (c ? c.kind + ':' + (c.name||'') : 'null') + '\n');
    }
    return r;
  };
  const oSetup = policy.setup;
  let lastDay = null, frozenCount = 0, probed = false;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const dayBefore = ((G.state.scholar || {}).day | 0);
      const ret = s0.apply(this, a);
      const dayAfter = ((G.state.scholar || {}).day | 0);
      if (dayAfter === dayBefore && G.tbfight && !G.tbfight.over && !probed) {
        frozenCount++;
        if (frozenCount >= 3) {
          probed = true;
          const f = G.tbfight;
          const c = G.tbCurrent();
          process.stderr.write(`\nSTUCK FIGHT at day ${dayBefore}: round=${f.round} turnIdx=${f.turnIdx} current=${c ? c.kind + ':' + (c.name || '') : 'null'} asyncRunning=${!!f.asyncRunning}\n`);
          process.stderr.write('order: ' + JSON.stringify(f.order) + '\n');
          process.stderr.write('calling Game.tbAdvance() manually...\n');
          const idxBefore = f.turnIdx, roundBefore = f.round;
          let err = null;
          try { G.tbAdvance(); } catch (e) { err = String(e && e.message || e).slice(0, 150); }
          const c2 = G.tbCurrent();
          process.stderr.write(`after manual tbAdvance: err=${err} turnIdx=${f.turnIdx} (was ${idxBefore}) round=${f.round} (was ${roundBefore}) current=${c2 ? c2.kind + ':' + (c2.name || '') : 'null'} over=${f.over}\n`);
          process.stderr.write('isPlayerTurn now: ' + G.tbIsPlayerTurn() + '\n');
        }
      } else frozenCount = 0;
      return ret;
    };
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`\nDONE: gameDays=${result.gameDays} over=${Game.over} won=${Game.won} probed=${probed}`);
})().catch(e => { console.error('MANUAL CRASH:', e); process.exit(2); });
