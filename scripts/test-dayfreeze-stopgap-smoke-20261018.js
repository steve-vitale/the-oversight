#!/usr/bin/env node
// test-dayfreeze-stopgap-smoke-20261018.js — SMOKE: the 2 frozen seeds
// (leadfeast s59104, belongfeast s59104) x {control, armed}. Fast GO/NO-GO
// signal before the full 32-run corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (winseat).`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const RUNS = [
  { seed: 59104, policyId: 'leadfeast' },
  { seed: 59104, policyId: 'belongfeast' },
];
const DAYS = 180;

async function oneRun(seed, policyId, armed) {
  process.env.DF_STOPGAP = armed ? '1' : '0';
  const base = SW.policyFor(policyId);
  const policy = Object.assign({}, base, { id: base.id + (armed ? '-dfarmed' : '-dfcontrol'), desc: base.desc + (armed ? ' [DF-ARMED]' : ' [DF-CONTROL]') });
  const { Game } = await loadGame({ seed, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);
  const t0 = Date.now();
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const gameDays = result.gameDays | 0;
  const frozen = !Game.over && !Game.won && gameDays < DAYS;
  return {
    seed, policyId, armed, frozen, gameDays, secs: Math.round((Date.now() - t0) / 1000),
    over: !!Game.over, won: !!Game.won,
    stopgap: Game.__dfStopgap || { fires: 0, recovered: 0, stuck: 0, threw: 0 },
  };
}

(async () => {
  for (const armed of [false, true]) {
    for (const { seed, policyId } of RUNS) {
      const r = await oneRun(seed, policyId, armed);
      const sg = r.stopgap;
      console.log(`${armed ? 'ARMED  ' : 'CONTROL'} ${r.policyId} s${r.seed}: frozen=${r.frozen} gameDays=${r.gameDays} over=${r.over} won=${r.won} sg=${sg.fires}/${sg.recovered}/${sg.stuck}/${sg.threw} ${r.secs}s`);
    }
  }
})().catch(e => { console.error('SMOKE CRASH:', e); process.exit(2); });
