#!/usr/bin/env node
// ledger-dump-20261017.js — post-sweep helper for the sim-vetshape village
// assessment ("who blooded veterans and how"). Re-runs ONE seed/policy/arm
// and dumps state.waveKillLog with each killer's living/dead status at end,
// plus the wave-4 readiness bars. Used only for sense/assessment reads —
// not part of the PRIMARY measurement.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 [VETSHAPE=1] node scripts/ledger-dump-20261017.js <seed> <leadfeast|belongfeast>
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = +process.argv[2], policyId = process.argv[3];
  const armed = process.env.VETSHAPE === '1';
  const base = policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
  const { Game } = await loadGame({ seed, mode: 'vetshape-ledger', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { if (oSetup) return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const log = Game.state.waveKillLog || [];
  console.log(`seed=${seed} policy=${policyId} arm=${armed ? 'armed' : 'control'} days=${result.gameDays} end=${result.endReason} maxWave=${result.maxWaveUnlocked || 1}`);
  const name = (vid) => {
    if (vid === Game.villagerId) return 'SCHOLAR';
    try { const vp = Game.vpOf(vid); return (vp && (vp.name || vp.id)) || String(vid); } catch (e) { return String(vid); }
  };
  const alive = (vid) => {
    if (vid === Game.villagerId) return true;
    try { const vp = Game.vpOf(vid); return !!(vp && !vp.dead); } catch (e) { return false; }
  };
  for (const e of log) {
    console.log(`  d${e.d} ${e.mid}(w${e.w}) by=${name(e.by)} ${alive(e.by) ? 'LIVING' : 'DEAD'} via=${e.via}`);
  }
  try {
    const rd = Game.waveCombatReadiness(4);
    console.log(`readiness4: ready=${rd.ready} armored=${rd.armored} armed=${rd.armed} tricks=${rd.tricks} veterans=${rd.veterans} short=${JSON.stringify(rd.short)}`);
  } catch (e) { console.log('readiness read failed'); }
})().catch(e => { console.error('DUMP CRASH:', e); process.exit(2); });
