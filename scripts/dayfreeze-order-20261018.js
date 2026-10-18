#!/usr/bin/env node
// dayfreeze-order-20261018.js — log f.order and f.turnIdx before/after
// tbBeginTurn during startCombat.
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
  const policy = Object.assign({}, base, { id: base.id + '-order', desc: base.desc + ' [ORDER]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let inSC = false;
  const oBegin = Game.tbBeginTurn.bind(Game);
  Game.tbBeginTurn = function () {
    if (inSC) {
      try {
        const f = Game.tbfight;
        if (f) {
          const before = { idx: f.turnIdx, order: f.order.slice(), cur: (Game.tbCurrent() || {}).kind };
          const r = oBegin.apply(this, arguments);
          const after = { idx: f.turnIdx, order: f.order.slice(), cur: (Game.tbCurrent() || {}).kind };
          if (before.cur === 'player' && after.cur !== 'player') {
            process.stderr.write(`ORDER-MUT: before=${JSON.stringify(before)} after=${JSON.stringify(after)}\n`);
          }
          return r;
        }
      } catch (e) {}
    }
    return oBegin.apply(this, arguments);
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inSC = true;
    const r = oStart.apply(this, a);
    inSC = false;
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('ORDER CRASH:', e); process.exit(2); });
