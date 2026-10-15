#!/usr/bin/env node
// scripts/det-gate-wincensus-20261015.js — gate-off purity for the wincensus
// compositions (flesh-out loop ARM 1, 2026-10-15, sim-wincensus).
//
// Two 16/16 lines (8 seeds x {leadfeast, belongfeast}, 60d, identical seeds):
//   (a) CONTROL gate-off: untraced tribfloor base vs withWinTrace(tribfloor
//       base) with WINTRAZE=1 — the instrument must be behavior-neutral.
//   (b) ARMED gate-off: plain tribfloor base vs the full armed stack
//       (withWinTrace(withWinDefer(tribfloor))) with WINTRAZE/WINPURSUIT/
//       WINDEFER all unset — every layer must delegate byte-identically.
// A divergence fails the gate: the before/after comparison is untrustworthy.
//
// Substrate env (asserted): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1. WINTRAZE=1 is set ONLY for the traced runs (sequential,
// process-global — never concurrent).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/det-gate-wincensus-20261015.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WT = require('./policies/wintrace');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`DET-GATE STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('DET-GATE STOP: tribfloor layerOn() false.'); process.exit(2); }

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '60', 10);
const PIDS = ['leadfeast', 'belongfeast'];

async function hashesFor(seed, policy, mode) {
  const { Game } = await loadGame({ seed, mode });
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

function compare(a, b) {
  if (a.hashes.length !== b.hashes.length) return { identical: false, why: `len ${a.hashes.length} vs ${b.hashes.length}` };
  for (let i = 0; i < a.hashes.length; i++) {
    if (a.hashes[i] !== b.hashes[i]) return { identical: false, why: `diverged at day ${a.hashes[i].split(':')[0]}` };
  }
  return { identical: true, why: `${a.hashes.length}d identical (${a.days}/${a.endReason})` };
}

(async () => {
  let passA = 0, passB = 0;
  const failA = [], failB = [];
  for (const pid of PIDS) {
    const tf = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    for (const seed of SEEDS) {
      // (a) control gate-off: untraced TF vs traced TF (WINTRAZE=1)
      delete process.env.WINTRAZE; delete process.env.WINPURSUIT; delete process.env.WINDEFER;
      const untraced = await hashesFor(seed, tf, `wc-gateoff-${pid}`);
      process.env.WINTRAZE = '1';
      const traced = await hashesFor(seed, WT.withWinTrace(tf, `${pid}-traced-gate`, 'gate'), `wc-gateon-${pid}`);
      const ca = compare(untraced, traced);
      console.log(`${ca.identical ? 'IDENTICAL ' : 'DIVERGED  '} (a) ${pid} s${seed} untraced-vs-traced — ${ca.why}`);
      if (ca.identical) passA++; else failA.push(`${pid}-s${seed}`);
      // (b) armed gate-off: plain TF vs full armed stack, all layers OFF
      delete process.env.WINTRAZE; delete process.env.WINPURSUIT; delete process.env.WINDEFER;
      const armedStack = WT.withWinTrace(
        WD.withWinDefer(tf, `${pid}-windefer`, 'gate'),
        `${pid}-traced-armed-gate`, 'gate');
      const armedOff = await hashesFor(seed, armedStack, `wc-armedoff-${pid}`);
      const cb = compare(untraced, armedOff);
      console.log(`${cb.identical ? 'IDENTICAL ' : 'DIVERGED  '} (b) ${pid} s${seed} plain-vs-armedstack-gateoff — ${cb.why}`);
      if (cb.identical) passB++; else failB.push(`${pid}-s${seed}`);
    }
  }
  delete process.env.WINTRAZE;
  console.log(`\nDET-GATE wincensus (${DAYS}d): (a) traced-neutrality ${passA}/16${failA.length ? ' DIVERGED: ' + failA.join(',') : ''}; (b) armed-stack gate-off ${passB}/16${failB.length ? ' DIVERGED: ' + failB.join(',') : ''}`);
  process.exit((failA.length || failB.length) ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
