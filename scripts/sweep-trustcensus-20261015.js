#!/usr/bin/env node
// scripts/sweep-trustcensus-20261015.js — trust-ledger trajectory census sweep
// (loop B ARM 2, 2026-10-15, food-economy axis; sibling diagnostic for ARM 1
// sim-trustguard, sim-findings #329's lever).
//
// INSTRUMENT ONLY — the lib is scripts/trustcensus-lib-20261015.js; zero
// src/js changes. 8 seeds x {leadcourt, belongseek}, 180d death-aware,
// identical seeds across policies, NO lever — pure measurement of the
// scholar's trust-ledger trajectory on courtship roads.
//
// Usage:
//   TRUSTCENSUS=1 SMOKE=1 node scripts/sweep-trustcensus-20261015.js  # 1 seed x 2 policies x 15d
//   TRUSTCENSUS=1 node scripts/sweep-trustcensus-20261015.js          # full 16-run sweep
//
// Outputs: sweep JSON + per-seed JSON in evidence/2026-10-15/perseed-trustcensus/.
'use strict';
process.env.TRUSTCENSUS = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus } = require('./trustcensus-lib-20261015');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const POLICIES = { leadcourt, belongseek };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-trustcensus');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, arc: 1, deaths: {} };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.tableWaiting = !!pg.tableWaiting; out.arc = pg.arc || 1; } catch (e) {}
  try { out.maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  try { out.gameDays = Game.state.scholar.day || 0; } catch (e) {}
  try {
    for (const d of ((result && result.samples && result.samples.deaths) || [])) {
      const k = (d.kind || 'unknown') + ':' + (d.cause || 'unknown');
      out.deaths[k] = (out.deaths[k] || 0) + 1;
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, policyId, days) {
  const base = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: 'trustcensus-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustCensus(Game);
  if (!track.on) throw new Error('TRUSTCENSUS gate did not engage');
  const od = base.daily;
  const policy = Object.assign({}, base);
  let dailyCalls = 0;
  policy.daily = (G, ctx) => { dailyCalls++; track.dawn(G); if (od) return od(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
  // Final dawn: row the last night — the day loop's final sleep() has no
  // subsequent policy.daily, so without this the last completed day is lost.
  try { track.dawn(Game); } catch (e) {}
  const fin = track.finalize();
  track.uninstall();
  const m = stdMetrics(Game, result);
  return {
    seed, policyId, days: m.gameDays, dailyCalls,
    won: m.won, rank: m.rank, arc: m.arc,
    national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    census: {
      nRows: fin.nRows, nNights: fin.nNights, nDupNights: fin.nDupNights,
      successions: fin.successions,
      instrErrors: fin.instrErrors.length,
      rowsComplete: fin.nRows === fin.nNights - fin.nDupNights,
      crossings: fin.crossings, post: fin.post || null,
    },
    rows: fin.rows,
    crossingBeats: fin.crossingBeats,
  };
}

async function main() {
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [11] : SEEDS;
  const days = smoke ? 15 : DAYS;
  const policyIds = Object.keys(POLICIES);
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  const t0 = require('perf_hooks').performance.now();
  for (const policyId of policyIds) {
    for (const seed of seeds) {
      process.stderr.write(`trustcensus run policy=${policyId} seed=${seed} ...\n`);
      const row = await oneRun(seed, policyId, days);
      rows.push(row);
      const slim = Object.assign({}, row);
      delete slim.rows; // per-seed JSON keeps rows; the sweep summary drops them
      fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}.json`), JSON.stringify(row, null, 1));
      const xc = row.census.crossings.cum;
      process.stderr.write(`  done: days=${row.days} rows=${row.census.nRows}/${row.census.nNights} dups=${row.census.nDupNights} ` +
        `cumCross=${xc.crossed ? 'd' + xc.day : 'none'} errors=${row.census.instrErrors}\n`);
      if (!row.census.rowsComplete) process.stderr.write('  LOUD: rows != nights\n');
      if (row.census.instrErrors > 0) process.stderr.write('  LOUD: instrument errors\n');
    }
  }
  const summary = {
    label: 'trustcensus', seeds, policies: policyIds, days,
    seconds: Math.round((require('perf_hooks').performance.now() - t0) / 1000),
    runs: rows.map(r => {
      const s = Object.assign({}, r); delete s.rows; delete s.crossingBeats; return s;
    }),
  };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-15', 'trustcensus-sweep.json'),
    JSON.stringify(summary, null, 1));
  process.stderr.write(`sweep done: ${rows.length} runs in ${Math.round((require('perf_hooks').performance.now() - t0) / 1000)}s\n`);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
