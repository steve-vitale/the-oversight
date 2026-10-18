#!/usr/bin/env node
// winloss-wakeprobe-20261018.js — focused diagnostic for the stall-table
// day-freeze (leadfeast s59104). Wraps Game.sleep to record WHICH wake
// condition fires when the day stops advancing, and what the game state is.
// READ-ONLY. Does not write evidence.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }

(async () => {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = SW.policyFor('leadfeast');
  const policy = Object.assign({}, base, {
    id: base.id + '-wakeprobe', desc: base.desc + ' [WAKEPROBE]',
  });
  const { Game } = await loadGame({ seed: 59104, mode: 'winloss-wakeprobe', fullTelemetry: false });
  await setupGame(Game);
  const osleep = Game.sleep.bind(Game);
  let lastDay = null, stuckAt = null, wakeLog = [];
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    // Wrap sleep AFTER setup: record wake conditions on non-advancing sleeps.
    const s0 = G.sleep.bind(G);
    G.sleep = function (...args) {
      const before = (G.state.scholar || {}).day | 0;
      const condBefore = {
        tbfight: !!G.tbfight,
        pendingEncounter: !!G.pendingEncounter,
        pendingMonsterId: G.pendingMonsterId || null,
        over: !!G.over,
        activeContest: !!(G.state && G.state.activeContest),
        insideTent: !!((G.state.scholar || {}).insideTent),
      };
      const r2 = s0.apply(this, args);
      const after = (G.state.scholar || {}).day | 0;
      if (after === before && before >= 70) {
        const condAfter = {
          tbfight: !!G.tbfight,
          pendingEncounter: !!G.pendingEncounter,
          pendingMonsterId: G.pendingMonsterId || null,
          over: !!G.over,
          activeContest: !!(G.state && G.state.activeContest),
          insideTent: !!((G.state.scholar || {}).insideTent),
        };
        wakeLog.push({ day: before, condBefore, condAfter });
        if (wakeLog.length <= 5 || wakeLog.length % 20 === 0) {
          console.log(`  SLEEP-STUCK d${before}: before=${JSON.stringify(condBefore)} after=${JSON.stringify(condAfter)}`);
        }
      }
      return r2;
    };
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.WINDEFER;
  console.log(`\nDONE: gameDays=${result.gameDays} over=${Game.over} won=${Game.won}`);
  console.log(`stuck-sleep count (d>=70): ${wakeLog.length}`);
  const condCounts = {};
  for (const w of wakeLog) {
    const k = Object.entries(w.condBefore).filter(([kk, v]) => v).map(([kk]) => kk).join('+') || '(none-true)';
    condCounts[k] = (condCounts[k] || 0) + 1;
  }
  console.log('wake-condition histogram:', JSON.stringify(condCounts, null, 1));
  // Final state dump
  try {
    const pg = Game.progState();
    console.log('final: tableWaiting=' + !!pg.tableWaiting, 'tableDone=' + !!pg.tableDone, 'arc=' + pg.arc);
    console.log('final: tbfight=' + !!Game.tbfight, 'activeContest=' + !!(Game.state.activeContest),
      'pendingEncounter=' + !!Game.pendingEncounter, 'scholarDay=' + ((Game.state.scholar || {}).day | 0));
  } catch (e) { console.log('final-state read err', e.message); }
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
