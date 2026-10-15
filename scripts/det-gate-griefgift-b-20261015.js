#!/usr/bin/env node
// scripts/det-gate-griefgift-b-20261015.js — determinism gate for sim-griefgift-b.
//
// Runs the same seed+policy TWICE in-process on the ARMED engine (via
// scripts/det-gate.js checkDeterminism) and on the CONTROL engine
// (replicated runOnce against the control copy's harness), comparing
// per-day trajectory hashes. A seed that fails on either side is dropped
// from the sweep (reported; replaced by a spare).
//
// Usage: SEEDS="11,22,33,44,55,66,77,88" DAYS=180 node scripts/det-gate-griefgift-b-20261015.js
// Exit 0: all seeds identical both sides. Exit 4: at least one seed diverged
// (lists the diverged seeds).
'use strict';
process.env.FOURTHLINK = process.env.FOURTHLINK || '1';
process.env.FIFTHLINK = process.env.FIFTHLINK || '1';
const path = require('path');
const CONTROL_TREE = '/home/hatch/workspace/griefgift-control-tree';
const controlHarness = require(path.join(CONTROL_TREE, 'scripts', 'sim-harness'));
const { checkDeterminism, dayHash } = require('./det-gate');
const { fifthlink } = require('./policies/fifthlink-r26');

async function runOnceControl(seed, policy, days) {
  const { loadGame, setupGame, runDays } = controlHarness;
  const { Game } = await loadGame({ seed, mode: 'det-gate-griefgift-b-control' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason };
}

function compare(a, b) {
  let firstDivIdx = -1;
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) {
    if (a.hashes[i] !== b.hashes[i]) { firstDivIdx = i; break; }
  }
  return firstDivIdx < 0 && a.hashes.length === b.hashes.length;
}

async function main() {
  if (fifthlink.id !== 'fifthlink-r26') {
    console.error('SMOKE FAIL: expected policy id fifthlink-r26, got ' + fifthlink.id);
    process.exit(1);
  }
  const seeds = String(process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
  const days = Number(process.env.DAYS || 180);
  const diverged = [];
  for (const seed of seeds) {
    const armed = await checkDeterminism(seed, fifthlink, { days, mode: 'det-gate-griefgift-b' });
    const c1 = await runOnceControl(seed, fifthlink, days);
    const c2 = await runOnceControl(seed, fifthlink, days);
    const controlIdentical = compare(c1, c2);
    const okSide = armed.identical && controlIdentical;
    console.log(`seed ${seed}: armed ${armed.identical ? 'IDENTICAL' : 'DIVERGED'} ` +
      `(${armed.lenA}d) control ${controlIdentical ? 'IDENTICAL' : 'DIVERGED'} ` +
      (okSide ? 'PASS' : 'FAIL'));
    if (!armed.identical) console.log('   armed: ' + armed.summary);
    if (!okSide) diverged.push(seed);
  }
  if (diverged.length) {
    console.log('DIVERGED SEEDS: ' + diverged.join(',') + ' — drop from sweep, use spares.');
    process.exit(4);
  }
  console.log('DET-GATE PASS: all seeds bit-identical twice-run on both engines.');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
