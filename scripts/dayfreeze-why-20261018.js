#!/usr/bin/env node
// dayfreeze-why-20261018.js — log the exact tbEndCheck branch that fires
// during startCombat's opening tbAdvance.
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
  const policy = Object.assign({}, base, { id: base.id + '-why', desc: base.desc + ' [WHY]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let inStartCombat = false, whyFired = null;
  // Wrap tbEnd to log the result + a stack when called during startCombat.
  const oEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    if (inStartCombat && !whyFired) {
      whyFired = result;
      const stk = String(new Error().stack || '').split('\n').slice(2, 8).join(' <- ');
      process.stderr.write(`WHY-FIRED: tbEnd('${result}') during startCombat\nSTACK: ${stk}\n`);
    }
    return oEnd.apply(this, arguments);
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inStartCombat = true; whyFired = null;
    const r = oStart.apply(this, a);
    inStartCombat = false;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if ((!c || c.kind !== 'player') && whyFired) {
          process.stderr.write(`WHY-STRAND: mid=${a[0]} turn=${c ? c.kind : 'null'} idx=${f.turnIdx} why=${whyFired}\n`);
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
})().catch(e => { console.error('WHY CRASH:', e); process.exit(2); });
