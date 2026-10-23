#!/usr/bin/env node
// det-gate-depinteraction-b.js — gate-off determinism for the 2x2 interaction.
// Both levers are env-gated, default-ON in node when unset: PLENTYDEPRI=0
// must make the _plentyDepri hook unreachable; DEPOSITGATE=0 must make the
// _depositGate hook + holdbacks unreachable. No RNG in either path, no
// state writes when off — so gate-off legs must fingerprint byte-identical
// to the pre-change base on identical seeds, and gate-on legs may diverge
// ONLY where the respective mechanism engages.
//
// Usage: [PLENTYDEPRI=0|1] [DEPOSITGATE=0|1] SEEDS="9250,..." DAYS=40 \
//   node scripts/det-gate-depinteraction-b.js
// Prints per seed/policy: fingerprint, pantry kcal, pdEngaged, dgEngaged.
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS || '9250,9251').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '40', 10) || 40;

function fp(Game) {
  const st = Game.state || {};
  const s = JSON.stringify(st, (k, v) => (k === 'ms' || k === '_ms' || k === 'pacing' || k === 'lastTs' || k === 'dayMinutes' || k === 'totalMin' ? 0 : v));
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 24);
}

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
    console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
    process.exit(2);
  }
  const pols = { leadfeast, belongfeast };
  for (const seed of SEEDS) {
    const fps = [];
    for (const [pname, pol] of Object.entries(pols)) {
      const { Game } = await loadGame({ seed, mode: 'detgate-depinteraction-' + pname, fullTelemetry: false });
      await setupGame(Game);
      await runDays(Game, pol, { days: DAYS, manifest: null });
      const v = Game.state.village || {};
      const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const pdE = (v._plentyDepri && Object.values(v._plentyDepri.days).reduce((t, d) => t + (d.depri || 0), 0)) || 0;
      const dgE = (v._depositGate && Object.values(v._depositGate.days).reduce((t, d) =>
        t + (d.shareEased > 0 ? 1 : 0) + (d.returnEased || 0) + (d.bigHaulEased || 0), 0)) || 0;
      fps.push(`${pname}:${fp(Game)}:pk=${Math.round(pk)}:pdE=${pdE}:dgE=${dgE}`);
    }
    console.log(`seed=${seed} ${fps.join(' ')}`);
  }
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
