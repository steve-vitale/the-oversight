#!/usr/bin/env node
// probe-s51408-20261018.js — one-off diagnostic: how did wave 4 release on
// readiness/belongfeast-s51408 while the end-of-day veteran snapshot read 1?
// Re-runs the identical substrate/seed and tracks the waveKillLog + veteran
// count daily around the unlock. READ-ONLY.
'use strict';
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) process.env[k] = '1';
  process.env.SEATDRIVE = '0'; process.env.VETREL = '1'; process.env.REPOSITION = '1'; process.env.NODEWITNESS = '1';
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = TF.belongfeast;
  const policy = VR.withVetrel(RP.withReposition(base, 'b-rp', 'x'), 'b-vetrel-rp', 'x');
  const { Game } = await loadGame({ seed: 51408, mode: 'probe51408', fullTelemetry: false });
  await setupGame(Game);
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, ctx) => {
    const r = oDaily(G, ctx);
    try {
      const day = G.state.scholar.day;
      if (day >= 55 && day <= 70) {
        const rd = G.waveCombatReadiness ? G.waveCombatReadiness(4) : null;
        const wkl = (G.state && G.state.waveKillLog) || [];
        const recent = wkl.filter(e => {
          const d = e.day != null ? e.day : (e.d != null ? e.d : null);
          return d != null && d >= 55 && d <= 70;
        }).map(e => JSON.stringify(e).slice(0, 160));
        console.log(`d${day} vets=${rd ? rd.veterans : '?'} ready=${rd ? rd.ready : '?'} short=${rd ? JSON.stringify(rd.short) : '?'} peak=${G.state._standingPeakWave | 0} wklTotal=${wkl.length}`);
        for (const e of recent) console.log(`    kill: ${e}`);
      }
    } catch (e) { console.log('probe err', e.message); }
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 75, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.WINDEFER;
  const wkl = (Game.state && Game.state.waveKillLog) || [];
  console.log(`\nfinal waveKillLog entries: ${wkl.length}`);
  for (const e of wkl) console.log('  ' + JSON.stringify(e).slice(0, 200));
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
