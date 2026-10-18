#!/usr/bin/env node
// dayfreeze-id-20261018.js — track fight IDs: is the stranded fight the same
// one startCombat created, or a replacement?
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
  const policy = Object.assign({}, base, { id: base.id + '-id', desc: base.desc + ' [ID]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let scFightId = null, scMid = null;
  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    scMid = a[0];
    const r = oStart.apply(this, a);
    try { scFightId = Game.tbfight ? Game.tbfight.id : null; } catch (e) {}
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          process.stderr.write(`ID-STRAND: mid=${scMid} created=${scFightId} now=${f.id} same=${scFightId === f.id} turn=${c ? c.kind : 'null'} idx=${f.turnIdx} over=${f.over}\n`);
        }
      }
    } catch (e) {}
    scFightId = null;
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('ID CRASH:', e); process.exit(2); });
