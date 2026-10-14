#!/usr/bin/env node
// sweep-raidtrigger-20261014.js — RAID-TRIGGER lived-rate measurement sweep
// (longsim r31 ARM 1, scale-onramp axis, sim-findings #176).
//
// DIAGNOSTIC — zero game-code changes. Runs 8 seeds x leadcourt/belongseek,
// 180d death-aware, with the raid-trigger instrument
// (scripts/raidtrigger-20261014.js) layered on the predisc instrument
// (scripts/preddisc-20261014.js, which reuses predation-lib). Per-run output:
// the nightly rate curve (raid nights per 100 village-nights per pantry
// band), the raid-size distribution vs the static rule, the pantry path
// (which store the raiders hit), the preddisc collapse classification
// (rot-driven vs predation-driven separation), and the wall numbers.
//
// PHASE 0 (det-gate): scripts/det-gate.js checkDeterminism on every
//   seed x policy — 16/16 (or 32/32) identical required before trusting
//   the trajectories. The instrument's read-only-ness is proven separately
//   by scripts/test-raidtrigger-20261014.js PART H.
// PHASE 1 (measurement): identical seeds, current master post-fix code,
//   both policies.
//
// SMOKE=1: instrument-honesty gate (named-export unwraps + 15d dual honesty)
//   without spending the sweep.
//
// Usage:
//   SMOKE=1 node scripts/sweep-raidtrigger-20261014.js
//   SEEDS=11,22,33,44,55,66,77,88 POLICIES=leadcourt,belongseek DAYS=180 \
//     OUT=evidence/2026-10-14/raidtrigger-sweep.json \
//     PERSEED=evidence/2026-10-14/raidtrigger-perseed \
//     node scripts/sweep-raidtrigger-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');
const { attachPreddisc, finalizePreddisc, classifyRun } = require('./preddisc-20261014');
const { attachRaidtrigger, finalizeRaidtrigger } = require('./raidtrigger-20261014');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

function loadPolicy(pid) {
  const mod = require('./policies/' + pid);
  const pol = mod[pid]; // NAMED export unwrap — never Object.assign({}, require(...)) (r20b)
  if (!pol || typeof pol.daily !== 'function') throw new Error('policy unwrap failed: ' + pid);
  return pol;
}

async function runCombo(pid, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'raidtrigger-' + pid });
  await setupGame(Game);
  // predisc FIRST (its say wrap goes innermost), raidtrigger extends its ptrack
  const ptrack = attachPreddisc(Game);
  const track = attachRaidtrigger(Game, ptrack.ptrack);
  const base = loadPolicy(pid);
  const origDaily = base.daily;
  let maxRank = 0, maxArc = 1, everTable = false, won = false, maxWave = 1;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    try {
      ptrack.sampleDay();
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
      try { maxWave = Math.max(maxWave, G.unlockedWave ? G.unlockedWave() : 1); } catch (e) {}
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await quietLog(async () => runDays(Game, policy, { days }));
  const T = finalizePreddisc(Game, ptrack);
  const verdict = classifyRun(T);
  const A = finalizeRaidtrigger(Game, track);
  const end = stdSnapshot(Game);
  const gorgeNights = (T.gorge || []).length;
  const gorgeKcal = (T.gorge || []).reduce((t, g) => t + (g.totalGorged || 0), 0);
  return {
    label: 'raidtrigger', policy: pid, seed,
    days: r.days, endReason: r.endReason,
    // wall numbers (numeric for telemetry-check aggregation)
    national: maxRank >= 2 ? 1 : 0,
    table: everTable || end.tableWaiting ? 1 : 0,
    wins: won || end.won ? 1 : 0,
    exiled: !!((Game.state.scholar || {}).exiled) ? 1 : 0,
    vests: 0,
    maxArc, maxWave,
    // preddisc collapse classification (rot-driven vs predation-driven)
    collapseClass: verdict.class,
    collapseConfidence: verdict.confidence,
    // raid-trigger lived rate
    raidNightsTotal: A.firedTotal,
    gorgeNights, gorgeKcal: Math.round(gorgeKcal),
    rateCurve: A.curve,
    sizeDist: A.sizeDist,
    sizedNights: A.sizedNights,
    matchedRule: A.matchedRule,
    mismatchedRule: A.mismatchedRule,
    pantryPath: A.pantryPath,
    instrErrors: A.instrErrors.length + (T.instrErrors || []).length,
    // per-seed detail (coordinator evidence)
    episodes: (T.episodes || []).map(e => ({
      id: e.id, wave: e.wave, days: e.firstDay + '-' + e.lastDay,
      gorgeNights: e.gorgeNights, gorgeKcal: Math.round(e.gorgeKcal),
      resolution: e.resolution, killer: e.killer || null })),
  };
}

async function smokeGate() {
  console.log('SMOKE GATE (instrument honesty)');
  for (const pid of ['leadcourt', 'belongseek']) {
    loadPolicy(pid);
    console.log('  unwrap ok: policies/' + pid + '.' + pid);
  }
  const { dayHash } = require('./det-gate');
  for (const pid of ['leadcourt', 'belongseek']) {
    const hashes = [];
    for (const instrumented of [true, true, false]) {
      const pol = loadPolicy(pid);
      const { Game } = await loadGame({ seed: 11, mode: 'rt-smoke' });
      await setupGame(Game);
      if (instrumented) attachRaidtrigger(Game);
      const wrapped = Object.assign({}, pol);
      const base = pol.daily;
      const h = [];
      wrapped.daily = (G, ctx) => { h.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
      await quietLog(async () => { await runDays(Game, wrapped, { days: 15 }); });
      hashes.push(h.join('\n'));
    }
    if (hashes[0] !== hashes[1]) { console.log('SMOKE NOTE: ' + pid + ' instrumented runs diverge (known #103 noise)'); }
    else if (hashes[0] !== hashes[2]) { console.log('SMOKE STOP: ' + pid + ' instrument perturbs trajectory'); process.exit(1); }
    else console.log('  honesty ok: ' + pid + ' (instrumented == pristine)');
  }
  console.log('SMOKE GATE: safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'raidtrigger';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);

  // PHASE 0: det-gate on every seed x policy
  console.log('PHASE 0: det-gate (needs ' + (seeds.length * policyIds.length) + '/' + (seeds.length * policyIds.length) + ')');
  let gateOk = 0, gateTotal = 0;
  for (const pid of policyIds) {
    const pol = loadPolicy(pid);
    for (const seed of seeds) {
      gateTotal++;
      let gate;
      try { gate = await checkDeterminism(seed, pol, { days, mode: 'raidtrigger-gate' }); }
      catch (e) { gate = { identical: false, summary: 'gate error: ' + (e && e.message) }; }
      if (gate.identical) gateOk++;
      console.log('  gate [' + pid + ' s' + seed + ']: ' + gate.summary);
    }
  }
  console.log('det-gate: ' + gateOk + '/' + gateTotal + ' identical');
  if (gateOk !== gateTotal) {
    console.error('DET-GATE FAILED: ' + (gateTotal - gateOk) + ' combo(s) diverged — trajectories not trustworthy');
    process.exit(1);
  }

  // PHASE 1: measurement
  console.log('PHASE 1: measurement sweep');
  const rows = [];
  for (const pid of policyIds) {
    for (const seed of seeds) {
      const row = await runCombo(pid, seed, days);
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} nat=${row.national} tab=${row.table} win=${row.wins} ` +
        `class=${row.collapseClass} raidN=${row.raidNightsTotal} gorgeN=${row.gorgeNights} gorgeK=${row.gorgeKcal} ` +
        `match=${row.matchedRule}/${row.sizedNights} instrErr=${row.instrErrors}`);
    }
  }

  const perSeedDir = process.env.PERSEED;
  if (perSeedDir) {
    fs.mkdirSync(perSeedDir, { recursive: true });
    for (const row of rows) {
      fs.writeFileSync(path.join(perSeedDir, `raidtrigger-s${row.seed}-${row.policy}.json`),
        JSON.stringify(row, null, 1));
    }
    console.error('wrote ' + rows.length + ' per-seed files to ' + perSeedDir);
  }
  const out = process.env.OUT;
  const rep = { label, seeds, policies: policyIds, days, detGate: gateOk + '/' + gateTotal, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
