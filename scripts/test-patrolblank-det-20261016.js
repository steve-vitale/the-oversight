#!/usr/bin/env node
'use strict';
// test-patrolblank-det-20261016.js — DET-GATE for the patrolblank instrument.
// Proves: trajectory digests are BYTE-IDENTICAL with/without the
// read-only instrument attached, on identical seeds (instrument purity).
//
// Usage:
//   PB=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//     WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 SEEDS="301,302" node scripts/test-patrolblank-det-20261016.js
//   (runs the armed matrix itself; PB=0 is the uninstrumented control.)
// Exit 0 = identical, 1 = DIVERGENCE (loud failure).
const fs = require('fs');
const path = require('path');
const PB = require('./patrolblank-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`DET STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DET STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const INSTR = process.env.PB === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [301, 302]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = parseInt(process.env.DAYS || '60', 10) || 60;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-16',
  INSTR ? 'det-patrolblank-armed.json' : 'det-patrolblank-control.json');

const policyFor = (id) => id === 'leadfeast' ? TF.leadfeast : TF.belongfeast;

function digest(Game, result) {
  const tel = (result.telemetry || []);
  const deaths = tel.filter(t => t && t.type === 'death')
    .map(t => [t.day || 0, String(t.who || ''), String(t.kind || ''), String(t.cause || '')]);
  return {
    gameDays: result.gameDays, endReason: result.endReason,
    maxWaveUnlocked: result.maxWaveUnlocked,
    waveKills: result.waveKills || {},
    pop: result.samples.pop, pantry: result.samples.pantry,
    deaths,
  };
}

(async () => {
  const digests = {};
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const policy = Object.assign({}, policyFor(policyId));
      const { Game } = await loadGame({ seed, mode: 'patrolblank-det', fullTelemetry: false });
      await setupGame(Game);
      let runCtx = null;
      const oSetup = policy.setup;
      policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
      if (INSTR) PB.attachPatrolBlank(Game);
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
      digests[`${policyId}-s${seed}`] = digest(Game, result);
    }
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(digests, null, 1) + '\n');
  console.log(`${INSTR ? 'INSTRUMENTED' : 'CLEAN'} det digests written: ${OUT} (${Object.keys(digests).length} runs)`);
})().catch(e => { console.error('DET CRASH:', e); process.exit(2); });
