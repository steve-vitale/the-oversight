#!/usr/bin/env node
'use strict';
// det-raidshield-baseline-20261016.js — gate-OFF vs pristine-HEAD trajectory
// check. Prints per-seed dayHash trajectories (leadfeast, 60d). Run in the
// modified tree (RAIDSHIELD unset) and in the pristine-HEAD baseline tree;
// outputs must be IDENTICAL — proving the else-branch is the old code.
//
// Run: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        node scripts/det-raidshield-baseline-20261016.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const TF = require('./policies/tribfloor');

(async () => {
  if (process.env.RAIDSHIELD === '1') { console.error('baseline must run with RAIDSHIELD unset'); process.exit(2); }
  for (const seed of [111, 122]) {
    const { Game } = await loadGame({ seed, mode: 'rs-baseline', fullTelemetry: false });
    await setupGame(Game);
    const policy = TF.leadfeast;
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    console.log(`SEED ${seed} days=${r.days} end=${r.endReason}`);
    console.log(hashes.join('\n'));
    console.log('---');
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
