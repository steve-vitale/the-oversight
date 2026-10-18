#!/usr/bin/env node
// dayfreeze-objid-20261018.js — object identity: is Game.tbfight the SAME
// object at tbAdvance-exit and startCombat-exit, or was it replaced?
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
  const policy = Object.assign({}, base, { id: base.id + '-objid', desc: base.desc + ' [OBJID]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  // Tag every fight object with a unique symbol at creation (via startCombat
  // wrapper capturing the created fight at the first tbAdvance entry).
  let advFightObj = null, advFightN = 0;
  const oAdv = Game.tbAdvance.bind(Game);
  Game.tbAdvance = function () {
    const r = oAdv.apply(this, arguments);
    try {
      if (Game.tbfight && /fmgpspipz/.test(Game.tbfight.id)) {
        advFightObj = Game.tbfight;
        advFightN = Game.tbfight.fighters.length;
      }
    } catch (e) {}
    return r;
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const r = oStart.apply(this, a);
    try {
      const f = Game.tbfight;
      if (f && /fmgpspipz/.test(f.id)) {
        const sameObj = (f === advFightObj);
        process.stderr.write(`OBJID mid=${a[0]}: advFightObj===exitFightObj ? ${sameObj} ` +
          `advN=${advFightN} exitN=${f.fighters.length} ` +
          `advId=${advFightObj ? advFightObj.id : 'null'} exitId=${f.id}\n`);
        // Also check: is the exit fight's fighters array the same array?
        process.exit(0);
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('OBJID CRASH:', e); process.exit(2); });
