#!/usr/bin/env node
// scripts/det-gate-phantomfood-20261017.js — determinism gate for the
// sim-phantomfood-b arm.
//
// Compares gate-off trajectories (PHANTOMFOOD_FIX=0 on the FIXED tree)
// against pristine trajectories (fix reverted) on 4 seeds x {leadfeast,
// belongfeast}, 40d death-aware each. Byte-identical hashes prove the
// remainder-carry fix is the ONLY delta the arm introduces — the legacy
// branch is a faithful replica of pristine, and the remainder field is
// never written (and never hashed) when the fix is off.
//
// Usage:
//   PHANTOMFOOD_FIX=0 node scripts/det-gate-phantomfood-20261017.js --out <file>   # gate-off, fixed tree
//   git checkout HEAD -- src/js/game.js                                            # pristine (patch saved first!)
//   node scripts/det-gate-phantomfood-20261017.js --out <file2>                    # pristine
//   diff <file> <file2>   # must be empty
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = [4311, 4312, 4313, 4314];
const POLICIES = { leadfeast, belongfeast };
const DAYS = 40;

async function hashOne(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: `phantomfood-detgate-${policyId}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hashes = [];
  const policy = Object.assign({}, POLICIES[policyId]);
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 }); });
  return { hashes, days: r.days, endReason: r.endReason };
}

(async () => {
  const outIdx = process.argv.indexOf('--out');
  const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : null;
  const gate = process.env.PHANTOMFOOD_FIX === '0' ? 'gate-off' : 'default';
  const recs = [];
  for (const policyId of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const h = await hashOne(seed, policyId);
      recs.push({ policyId, seed, n: h.hashes.length, days: h.days,
        endReason: h.endReason, digest: h.hashes.join(';') });
      console.log(`  ${policyId} s${seed}: ${h.hashes.length} day-hashes, d=${h.days} end=${h.endReason}`);
    }
  }
  const payload = JSON.stringify({ gate, seeds: SEEDS, policies: Object.keys(POLICIES), days: DAYS, recs }, null, 1);
  if (outPath) fs.writeFileSync(outPath, payload);
  else console.log(payload);
})().catch(e => { console.error('DET-GATE CRASH:', e && e.stack || e); process.exit(2); });
