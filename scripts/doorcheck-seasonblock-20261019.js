#!/usr/bin/env node
// doorcheck-seasonblock-20261019.js — deferral-5 door check on the stall
// seeds (flesh-out loop arm sim-seasonblock, run fleshout-20261019T2015Z).
//
// The bond census measures dip grants; this answers the follow-up the
// village assessment needs: did the granted dip open the deferral-5 door
// (standingDeferral(5).deferred)? PURE engine reads only (FG.stateSnap —
// the feastgap probe's read, exported), same substrate/policy/seeds as the
// sweep, so trajectories are DET-pinned byte-identical to the sweep runs.
// Writes evidence/2026-10-19/seasonblock-doorcheck.json.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/doorcheck-seasonblock-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const FG = require('./probe-feastgap-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

// SUBSTRATE GUARD — the feastgap/seasonblock substrate, verbatim.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.REPOSITION === '1' || process.env.VETREL === '1') { console.error('STOP: REPOSITION/VETREL must not be 1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202, 64207]).filter(Number.isFinite);
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-19', 'seasonblock-doorcheck.json');

async function runOne(seed) {
  const base = FG.policyFor('belongfeast');
  const policy = Object.assign({}, base);
  const C = { series: [] };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const st = FG.stateSnap(G);
      C.series.push({ d: (G.state.scholar || {}).day || 0, cap: st.cap, war: st.war, dip: st.dip, plenty: st.plenty, def5: st.def5 ? 1 : 0, t5: st.t5 });
    } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  const firstDef5 = (C.series.find(s => s.def5) || {}).d || null;
  const firstCapT5 = (C.series.find(s => s.cap >= (s.t5 || 200)) || {}).d || null;
  return { seed, gameDays, firstDef5, firstCapT5, series: C.series };
}

(async () => {
  const out = [];
  for (const seed of SEEDS) {
    const r = await runOne(seed);
    // Compact: keep daily rows only around cap/dip movement (cap changes or def5 flips).
    const slim = [];
    let prev = null;
    for (const s of r.series) {
      if (!prev || s.cap !== prev.cap || s.dip !== prev.dip || s.def5 !== prev.def5 || s.war !== prev.war) slim.push(s);
      prev = s;
    }
    out.push({ seed: r.seed, gameDays: r.gameDays, firstDef5: r.firstDef5, firstCapT5: r.firstCapT5, series: slim });
    console.log(`  s${seed}: days=${r.gameDays} firstCapT5=${r.firstCapT5} firstDef5=${r.firstDef5}`);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('DOORCHECK CRASH:', e); process.exit(2); });
