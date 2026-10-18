#!/usr/bin/env node
// dayfreeze-census-20261018.js — log every startCombat's (mid, fightId,
// nFighters) to check for ID-prefix collisions.
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
  const policy = Object.assign({}, base, { id: base.id + '-census', desc: base.desc + ' [CENSUS]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const seen = new Map();
  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const r = oStart.apply(this, a);
    try {
      const f = Game.tbfight;
      if (f) {
        const key = f.id;
        if (seen.has(key)) {
          process.stderr.write(`COLLISION! id=${key} mid=${a[0]} prevMid=${seen.get(key)} nFighters=${f.fighters.length}\n`);
        } else seen.set(key, a[0]);
        if (/fmgpspipz/.test(key)) {
          process.stderr.write(`FMGPSPIPZ: id=${key} mid=${a[0]} nFighters=${f.fighters.length} turnIdx=${f.turnIdx}\n`);
        }
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} uniqueFights=${seen.size}`);
})().catch(e => { console.error('CENSUS CRASH:', e); process.exit(2); });
