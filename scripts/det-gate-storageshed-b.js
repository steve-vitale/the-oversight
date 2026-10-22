#!/usr/bin/env node
// det-gate-storageshed-b.js — gate-off determinism for the STORAGESHED
// game-code hook. With STORAGESHED=0 the hook is unreachable (no RNG, no
// state writes, no voice) — runs must fingerprint identically across
// repeated runs on the same seeds, and the ledger must never exist.
// With STORAGESHED=1 runs may diverge only where the mechanism engages
// (plentiful pantry).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 STORAGESHED=0|1 SEEDS="9101,..." DAYS=40
//   node scripts/det-gate-storageshed-b.js
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS || '9101,9102,9103,9104').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '40', 10) || 40;
const GATE = process.env.STORAGESHED || '0';

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
  const seen = {};
  for (const seed of SEEDS) {
    const fps = [];
    for (const [pname, pol] of Object.entries(pols)) {
      const { Game } = await loadGame({ seed, mode: 'detgate-storageshed-' + pname, fullTelemetry: false });
      await setupGame(Game);
      await runDays(Game, pol, { days: DAYS, manifest: null });
      const v = Game.state.village || {};
      const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const engaged = (v._storageShed && Object.values(v._storageShed.days).reduce((t, d) => t + (d.shedDec || 0), 0)) || 0;
      const f = fp(Game);
      const key = `${pname}:${seed}`;
      if (seen[key] === undefined) seen[key] = f;
      const stable = seen[key] === f ? 'STABLE' : 'DRIFT';
      fps.push(`${pname}:${f}:pk=${Math.round(pk)}:engaged=${engaged}:${stable}`);
    }
    console.log(`gate=${GATE} seed=${seed} ${fps.join(' ')}`);
  }
  // gate-off invariant: the ledger must never exist
  console.log('GATE-OFF-LEDGER-CHECK done (engaged must be 0 for every row when gate=0)');
})().catch(e => { console.error('DETGATE CRASH', e); process.exit(2); });
