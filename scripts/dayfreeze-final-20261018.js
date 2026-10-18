#!/usr/bin/env node
// dayfreeze-final-20261018.js — definitive: log tbEndCheck=true with fight
// ID, over flag, and the branch reason, during startCombat.
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
  const policy = Object.assign({}, base, { id: base.id + '-final', desc: base.desc + ' [FINAL]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let inSC = false, scId = null;
  const oEndCheck = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function () {
    const f = Game.tbfight;
    const fid = f ? f.id : null;
    const r = oEndCheck.apply(this, arguments);
    if (inSC && r === true) {
      process.stderr.write(`FINAL: tbEndCheck=TRUE fid=${fid} scId=${scId} same=${fid === scId} over=${f ? f.over : 'nofight'}\n`);
    }
    return r;
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inSC = true;
    const r = oStart.apply(this, a);
    try { scId = Game.tbfight ? Game.tbfight.id : null; } catch (e) {}
    inSC = false;
    try {
      const f = Game.tbfight;
      if (f && !f.over && scId === f.id) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          process.stderr.write(`FINAL-STRAND: mid=${a[0]} fid=${f.id} turn=${c ? c.kind : 'null'} idx=${f.turnIdx}\n`);
        }
      }
    } catch (e) {}
    scId = null;
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('FINAL CRASH:', e); process.exit(2); });
