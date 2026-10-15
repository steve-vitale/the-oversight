#!/usr/bin/env node
'use strict';
// diag-w5reach2-repro.js — is same-seed same-policy reproducible at 180d?
// The det-gate (60d) passed 4/4, but diag (d152) vs proof-gateon (d131)
// diverged on identical seed+policy+env at 180d. This isolates whether the
// divergence is run-to-run (timestamp IDs in contest RNG — the known
// det-gate.js issue) by running the SAME policy twice and comparing.
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const W5R = require('./policies/wave5reach');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
}
delete process.env.WAVE5REACH;
delete process.env.SEATDRIVE;

async function hashesFor(seed, policy, tag) {
  const { Game } = await loadGame({ seed, mode: `w5reach2-repro-${tag}` });
  await setupGame(Game);
  const hashes = [];
  const w = Object.assign({}, policy);
  const base = policy.daily;
  w.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await quietLog(async () => runDays(Game, w, { days: 180, sampleEvery: 1 }));
  return { hashes, days: r.days, endReason: r.endReason, gameDays: r.gameDays };
}

(async () => {
  // A: naked belongfeast twice (pure run-to-run reproducibility)
  const a1 = await hashesFor(151, SD.belongseat, 'a1');
  const a2 = await hashesFor(151, SD.belongseat, 'a2');
  const sameA = a1.hashes.length === a2.hashes.length && a1.hashes.every((h, i) => h === a2.hashes[i]);
  let firstDiff = -1;
  if (!sameA) {
    for (let i = 0; i < Math.min(a1.hashes.length, a2.hashes.length); i++) {
      if (a1.hashes[i] !== a2.hashes[i]) { firstDiff = i; break; }
    }
  }
  console.log(`naked-vs-naked s151 180d: ${sameA ? 'IDENTICAL' : 'DIVERGED'} ` +
    `(len ${a1.hashes.length} vs ${a2.hashes.length}, firstDiff day-index ${firstDiff}, ` +
    `end ${a1.endReason}/${a1.gameDays}d vs ${a2.endReason}/${a2.gameDays}d)`);
  // B: wrapped gate-off vs naked (the det-gate at full horizon)
  const b1 = await hashesFor(151, W5R.belongseat, 'b1');
  const sameB = b1.hashes.length === a1.hashes.length && b1.hashes.every((h, i) => h === a1.hashes[i]);
  console.log(`wrapped(gate-off)-vs-naked s151 180d: ${sameB ? 'IDENTICAL' : 'DIVERGED'} ` +
    `(len ${b1.hashes.length}, end ${b1.endReason}/${b1.gameDays}d)`);
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
