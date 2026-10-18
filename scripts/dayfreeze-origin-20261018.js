#!/usr/bin/env node
// dayfreeze-origin-20261018.js — log every tbfight creation with a stack
// trace, to find which path creates the fight that stalls at the monster.
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
  const policy = Object.assign({}, base, { id: base.id + '-origin', desc: base.desc + ' [ORIGIN]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const creations = [];
  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const r = oStart.apply(this, a);
    try {
      const f = Game.tbfight;
      const stack = String(new Error().stack || '').split('\n').slice(2, 7).join(' <- ');
      creations.push({ via: 'startCombat', mid: a[0], day: (Game.state.scholar || {}).day | 0,
        fightId: f ? f.id : null, order: f ? f.order.slice(0, 4) : null,
        turnIdx: f ? f.turnIdx : null, stack });
    } catch (e) {}
    if (creations.length > 60) creations.shift();
    return r;
  };

  const oSetup = policy.setup;
  let dumped = false, frozenCount = 0;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const dayBefore = ((G.state.scholar || {}).day | 0);
      const fightBefore = G.tbfight ? G.tbfight.id : null;
      const ret = s0.apply(this, a);
      const dayAfter = ((G.state.scholar || {}).day | 0);
      if (dayAfter === dayBefore && G.tbfight && !G.tbfight.over) {
        frozenCount++;
        if (frozenCount >= 4 && !dumped) {
          dumped = true;
          const fid = G.tbfight.id;
          const rel = creations.filter(c => c.fightId === fid);
          const out = { stalledFightId: fid, creations: rel.length ? rel : creations.slice(-5) };
          require('fs').writeFileSync('/tmp/dayfreeze-origin.json', JSON.stringify(out, null, 1));
          process.stderr.write('ORIGIN DUMPED to /tmp/dayfreeze-origin.json\n');
        }
      } else frozenCount = 0;
      return ret;
    };
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} dumped=${dumped}`);
})().catch(e => { console.error('ORIGIN CRASH:', e); process.exit(2); });
