#!/usr/bin/env node
// scripts/det-gate-carcasshaul-20261015.js — determinism gate for the
// sim-carcasshaul pilot (r27 rule: 16/16 bit-identical before trusting a
// before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. The MAPMEM gate is applied right after load
// (before setup), so both sides are gated separately:
//   CONTROL: MAPMEM=0 (mechanism deleted at load)
//   ARMED:   MAPMEM=1 (default)
//
// KNOWN ISSUE (det-gate.js header, entropy-hunt r26): the gate can FAIL on
// current master for fight-heavy seeds via timestamp-based villager IDs
// leaking into contest resolution. A divergence that reproduces on BOTH
// sides with identical first-divergence days is the known issue, not the
// arm — reported, not fatal.
// Usage:
//   MAPMEM=0 node scripts/det-gate-carcasshaul-20261015.js
//   MAPMEM=1 node scripts/det-gate-carcasshaul-20261015.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { applyMapmemGate } = require('./mapmem-gate-20261015');

const ARMED = process.env.MAPMEM !== '0';
const REG = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

async function runOnce(seed, policy, mode) {
  const { Game } = await loadGame({ seed, mode });
  applyMapmemGate(Game);
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason };
}

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const a = await runOnce(seed, REG[pid], 'ch-det-a-' + pid);
      const b = await runOnce(seed, REG[pid], 'ch-det-b-' + pid);
      let div = -1;
      const n = Math.min(a.hashes.length, b.hashes.length);
      for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { div = i; break; } }
      const identical = div < 0 && a.hashes.length === b.hashes.length;
      const divDay = div >= 0 ? a.hashes[div].split(':')[0] : '-';
      console.log((identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed +
        ` (divDay ${divDay}, ${a.days}/${a.endReason} vs ${b.days}/${b.endReason})`);
      if (identical) pass++; else { fail++; fails.push(pid + '-s' + seed + '@d' + divDay); }
    }
  }
  console.log(`\nDET-GATE ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
