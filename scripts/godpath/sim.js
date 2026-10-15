#!/usr/bin/env node
// scripts/godpath/sim.js — late-game measurement for the god-path system.
//
// Nobody plays to day 80+ yet, so sims are the only late-game playtester.
// Runs fixed seeds through the standard sweep (scripts/sweep-compare.js) and
// reads the diagnostic counters the game keeps in Game.state.godpathStats
// (runtime contract, docs/godpath/PLAN.md). Prints each metric against its
// target and writes JSON evidence.
//
//   node scripts/godpath/sim.js                    # 8 seeds × 150 days, competent
//   SEEDS=7,42 DAYS=90 node scripts/godpath/sim.js # quick look
//   LABEL=after-p3 node scripts/godpath/sim.js     # names the evidence file
//
// Runtime: roughly 1–3 min per seed at 150 days. Run it at the end of a
// phase, not on every commit.
'use strict';
const fs = require('fs');
const path = require('path');
const { runComparison, printTable } = require('../sweep-compare');
const K = require('./lib');

const SEEDS = (process.env.SEEDS || '7,42,99,1234,555,777,2026,31337').split(',').map(Number);
const DAYS = Number(process.env.DAYS || 150);
const POLICIES = (process.env.POLICIES || 'competent').split(',');
const LABEL = process.env.LABEL || 'phase' + K.phase();

function stats(Game) {
  const s = (Game.state && Game.state.godpathStats) || {};
  const asc = s.ascended || [];
  const cashed = s.cashed || {};
  const gf = s.godFights || { n: 0, rounds: 0 };
  return {
    asc_player: asc.filter(a => a.who === 'p').length,
    asc_villager: asc.filter(a => a.who !== 'p').length,
    asc_paths: asc.map(a => a.path).join('+') || '-',
    trials_offered: s.trialsOffered || 0,
    trials_won: s.trialsWon || 0,
    trials_lost: s.trialsLost || 0,
    paths_cashed: Object.keys(cashed).filter(k => cashed[k] > 0).length,
    cash_total: Object.values(cashed).reduce((a, b) => a + b, 0),
    god_fights: gf.n,
    god_fight_rounds_mean: gf.n ? +(gf.rounds / gf.n).toFixed(2) : 0,
    godpath_errors: s.errors || 0,
  };
}

(async () => {
  console.log(`godpath sim: seeds=[${SEEDS}] days=${DAYS} policies=${POLICIES} phase=${K.phase()}`);
  const rep = await runComparison({
    label: 'godpath-' + LABEL, seeds: SEEDS, policies: POLICIES, days: DAYS,
    extraMetrics: (Game) => stats(Game),
  });
  printTable(rep);

  // Targets (proposal §5/§8; tune with Steve). Evaluated over all runs.
  const runs = rep.runs || [];
  const ex = r => (r.extra || r);
  const n = runs.length || 1;
  const anyAsc = runs.filter(r => (ex(r).asc_player || 0) + (ex(r).asc_villager || 0) > 0).length;
  const allPaths = runs.flatMap(r => String(ex(r).asc_paths || '-').split('+').filter(p => p && p !== '-'));
  const pathShare = {};
  allPaths.forEach(p => { pathShare[p] = (pathShare[p] || 0) + 1; });
  const maxShare = allPaths.length ? Math.max(...Object.values(pathShare)) / allPaths.length : 0;
  const gfN = runs.reduce((a, r) => a + (ex(r).god_fights || 0), 0);
  const gfR = runs.reduce((a, r) => a + (ex(r).god_fights || 0) * (ex(r).god_fight_rounds_mean || 0), 0);
  const meanRounds = gfN ? gfR / gfN : null;
  const T = [
    ['runs with ≥1 ascension (player or villager)', `${(100 * anyAsc / n).toFixed(0)}%`, anyAsc / n >= 0.05 && anyAsc / n <= 0.15, '5–15%'],
    ['largest single-path share of ascensions', allPaths.length ? `${(100 * maxShare).toFixed(0)}%` : 'n/a', !allPaths.length || maxShare <= 0.3 || allPaths.length < 5, '≤30% (needs ≥5 ascensions to judge)'],
    ['mean rounds in fights where a god ability fired', meanRounds == null ? 'n/a' : meanRounds.toFixed(1), meanRounds == null || (meanRounds >= 2 && meanRounds <= 8), '2–8'],
    ['swallowed god-path errors (GP.warn), all runs', String(runs.reduce((a, r) => a + (ex(r).godpath_errors || 0), 0)), runs.every(r => !(ex(r).godpath_errors)), '0 (non-zero = look at the godpath_error telemetry)'],
    ['paths whose payoff was ever cashed (max over runs)', String(Math.max(0, ...runs.map(r => ex(r).paths_cashed || 0))), Math.max(0, ...runs.map(r => ex(r).paths_cashed || 0)) >= 3, '≥3 (policy-dependent)'],
  ];
  console.log('target check:');
  for (const [name, got, okv, want] of T) console.log(`  ${okv ? 'ok  ' : 'MISS'} ${name}: ${got} (target ${want})`);

  const dir = path.join(K.ROOT, 'evidence', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `sim-godpath-${LABEL}.json`);
  fs.writeFileSync(out, JSON.stringify({ phase: K.phase(), targets: T, report: rep }, null, 1));
  console.log('wrote ' + path.relative(K.ROOT, out));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
