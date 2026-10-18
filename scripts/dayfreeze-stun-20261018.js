#!/usr/bin/env node
// dayfreeze-stun-20261018.js — confirm the stunFull recursive-tbAdvance path
// strands startCombat: log tbBeginTurn stun state at fight start.
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
  const policy = Object.assign({}, base, { id: base.id + '-stun', desc: base.desc + ' [STUN]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let inStartCombat = false;
  const oBegin = Game.tbBeginTurn.bind(Game);
  Game.tbBeginTurn = function (...a) {
    if (inStartCombat) {
      try {
        const f = Game.tbfight, c = Game.tbCurrent();
        if (c && c.kind === 'player') {
          process.stderr.write(`STUN-CHECK mid-fight: stunned=${c.stunned | 0} stunFull=${c.stunFull | 0} acted=${!!c.acted} idx=${f.turnIdx}\n`);
        }
      } catch (e) {}
    }
    return oBegin.apply(this, a);
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inStartCombat = true;
    const r = oStart.apply(this, a);
    inStartCombat = false;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          process.stderr.write(`STUN-STRAND: mid=${a[0]} turn=${c ? c.kind : 'null'} idx=${f.turnIdx}\n`);
        }
      }
    } catch (e) {}
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('STUN CRASH:', e); process.exit(2); });
