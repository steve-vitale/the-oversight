#!/usr/bin/env node
// Sense-test transcript sampler for THROTTLEBEAT (2026-10-14).
// Captures the "hungry eat first" exemption beat in live sim runs with
// surrounding context (the duty resolution + haul lines around it), so a
// human can judge whether it reads as a village feeding moment.
// Usage: SEEDS=77 POLICIES=leadcourt,belongseek node scripts/sensetest-throttlebeat-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const POLICY_REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'throttlebeat-sense-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const transcript = [];
  const oSay = Game.say;
  Game.say = function (t) {
    const line = String(t);
    transcript.push(line);
    if (/hungry eat first/.test(line)) beats.push({ line, ctx: transcript.slice(-4, -1) });
    return oSay.call(this, t);
  };
  const policy = Object.assign({}, base);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  return { Game, beats, result };
}

(async () => {
  const SEEDS = (process.env.SEEDS || '77').split(',').map(s => parseInt(s.trim(), 10));
  const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim());
  const DAYS = parseInt(process.env.DAYS || '180', 10);
  const shown = { forage: 0, harvest: 0, 'fish nets': 0 };
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const { beats, result } = await oneRun(seed, pid, DAYS);
      console.log(`\n===== [${pid} s${seed}] ${beats.length} exemption beat(s) over ${result.days}d =====`);
      for (const b of beats) {
        let duty = 'forage';
        if (/keeps working the harvest/.test(b.line)) duty = 'harvest';
        else if (/keeps working the fish nets/.test(b.line)) duty = 'fish nets';
        if (shown[duty] >= 1) continue; // one per duty variant
        shown[duty]++;
        console.log(`--- beat (${duty}) ---`);
        for (const c of b.ctx) console.log('  ctx: ' + c.slice(0, 220));
        console.log('  BEAT: ' + b.line.slice(0, 400));
      }
    }
  }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
