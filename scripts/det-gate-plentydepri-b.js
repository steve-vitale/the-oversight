#!/usr/bin/env node
// det-gate-plentydepri-b.js — gate-off determinism for the PLENTYDEPRI
// game-code hook. With PLENTYDEPRI=0 the hook is unreachable: no RNG, no
// state writes, no voice — so a full run must fingerprint byte-identical
// to the pre-change base on the same seeds. With PLENTYDEPRI=1 runs may
// diverge only where the mechanism engages (plentiful pantry).
//
// Usage: [PLENTYDEPRI=0|1] SEEDS="9001,..." DAYS=40 node scripts/det-gate-plentydepri-b.js
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS || '9001,9002,9003,9004').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '40', 10) || 40;

function fp(Game) {
  // deterministic state fingerprint (excludes wall-clock / perf noise:
  // pacing.lastTs/dayMinutes are performance.now() telemetry, not game)
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
      const { Game } = await loadGame({ seed, mode: 'detgate-plentydepri-' + pname, fullTelemetry: false });
      await setupGame(Game);
      await runDays(Game, pol, { days: DAYS, manifest: null });
      const v = Game.state.village || {};
      const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const engaged = (v._plentyDepri && Object.values(v._plentyDepri.days).reduce((t, d) => t + (d.depri || 0), 0)) || 0;
      fps.push(`${pname}:${fp(Game)}:pk=${Math.round(pk)}:engaged=${engaged}`);
    }
    console.log(`seed=${seed} ${fps.join(' ')}`);
  }
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
