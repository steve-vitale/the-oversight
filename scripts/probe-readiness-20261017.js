#!/usr/bin/env node
'use strict';
// probe-readiness-20261017.js — quick substrate probe: why is wave 4 not
// unlocking on the pre-seat courtship substrate? Reads standing total,
// readiness bars, and unlockedWave over a 100d run.
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
  }
  const seed = parseInt(process.env.SEED || '205', 10);
  const policy = process.env.POLICY === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'probe-ready', fullTelemetry: false });
  await setupGame(Game);
  const rows = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    try {
      const day = (Game.state.scholar || {}).day || 0;
      const standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null;
      const wave = Game.unlockedWave ? Game.unlockedWave() : null;
      let ready = null;
      try { ready = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { ready = 'ERR ' + e.message; }
      let w3kills = null, w3types = null;
      try {
        const log = (Game.state && Game.state.waveKillLog) || [];
        w3kills = log.length;
        const w3 = log.filter(k => (k.w | 0) >= 3);
        const vets = new Set(w3.map(k => k.by).filter(Boolean));
        w3types = `${w3.length} kills by ${vets.size} vids`;
      } catch (e) {}
      rows.push({ day, standing: standing != null && typeof standing === 'object' ? JSON.stringify(standing) : standing, wave, ready: ready && ready.short ? ready.short : ready, w3kills, w3types });
    } catch (e) {}
    return base ? base(G, ctx) : undefined;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days: 100, sampleEvery: 30 }); });
  for (const row of rows.filter((_, i) => i % 10 === 0 || i === rows.length - 1)) {
    console.log(`d${row.day} wave=${row.wave} standing=${row.standing} ready4=${JSON.stringify(row.ready)} waveKillLog=${row.w3kills} w3+types=${row.w3types}`);
  }
  console.log('end:', r.endReason, 'days:', r.days);
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
