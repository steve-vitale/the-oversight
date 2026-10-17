#!/usr/bin/env node
// sense-probe-20261017.js — capture System beats around the wave-4 unlock
// for the sim-vetshape sense read. Re-runs one seed/arm and prints beats
// mentioning wave/draft/veteran/standing/vet.
// Usage: (same substrate env) node scripts/sense-probe-20261017.js <seed> <policy> [VETSHAPE=1]
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = +process.argv[2], policyId = process.argv[3];
  const base = policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
  const { Game } = await loadGame({ seed, mode: 'vetshape-sense', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const beats = [];
  const oSys = Game.sysSay, oSay = Game.say;
  const grab = (t) => {
    try {
      const s = String(t || '');
      if (/wave|draft|veteran|blood|standing|mirror|readiness/i.test(s))
        beats.push(`d${(Game.state.scholar || {}).day}: ${s.slice(0, 220)}`);
    } catch (e) {}
  };
  Game.sysSay = function (t) { grab(t); return oSys ? oSys.call(Game, t) : undefined; };
  Game.say = function (t) { grab(t); return oSay ? oSay.call(Game, t) : undefined; };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { if (oSetup) return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  Game.sysSay = oSys; Game.say = oSay;
  console.log(`seed=${seed} days=${result.gameDays} end=${result.endReason} maxWave=${result.maxWaveUnlocked || 1}`);
  for (const b of beats) console.log('  ' + b);
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
