#!/usr/bin/env node
// dayfreeze-pure-20261018.js — no wrappers except a read-only strand check
// AFTER startCombat returns (cannot affect the trajectory).
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
  const policy = Object.assign({}, base, { id: base.id + '-pure', desc: base.desc + ' [PURE]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  // Read-only check: run AFTER startCombat, cannot affect it.
  // We poll tbfight after each doAction/sleep via the policy wrapper.
  const oSetup = policy.setup;
  let strands = 0;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const oDo = G.doAction.bind(G);
    G.doAction = function (...a) {
      const r2 = oDo.apply(this, a);
      try {
        const f = G.tbfight;
        if (f && !f.over) {
          const c = G.tbCurrent();
          if (c && c.kind !== 'player' && !f._strandLogged) {
            f._strandLogged = true; strands++;
            if (strands <= 5) process.stderr.write(`PURE-STRAND: turn=${c.kind} idx=${f.turnIdx} round=${f.round}\n`);
          }
        }
      } catch (e) {}
      return r2;
    };
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} strands=${strands}`);
})().catch(e => { console.error('PURE CRASH:', e); process.exit(2); });
