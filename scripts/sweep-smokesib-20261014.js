#!/usr/bin/env node
// sweep-smokesib-20261014.js — SMOKE-SIBLINGS arm pilot sweep.
// 8 seeds x (leadcourt, belongseek), 150d death-aware, identical seeds
// before/after. Metrics: laundered kcal at convert time (from the temporary
// SMOKESIB-MEASURE instrumentation in the cookAll batch pipeline, reverted
// before commit) + wall guardrail metrics (national, table, wins, wave4/5,
// exiled, median survival) + fresh-rot proxy (spoiled kcal in stock at run end).
// Usage: LEVER=smokesib-before SEEDS="11,22,33,44,55,66,77,88" DAYS=150 OUT=/tmp/smokesib-before.json \
//   node scripts/sweep-smokesib-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const leadcourt = require('./policies/leadcourt').leadcourt;
const belongseek = require('./policies/belongseek').belongseek;

const POLICIES = { leadcourt, belongseek };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

// Fresh-rot proxy: spoiled kcal sitting in stock at run end (pack + pantry).
// Stock proxy, not a flow — adequate as a before/after no-blowup guardrail.
function spoiledStockKcal(Game) {
  let k = 0;
  try {
    const day = (Game.state.scholar || {}).day || 0;
    const scan = (arr) => {
      for (const it of (arr || [])) {
        if (!it) continue;
        const sd = it.spoilDay;
        if (sd !== undefined && sd !== null && sd < 9999 && sd <= day) k += (it.kcalEach || 0) * (it.units || 1);
      }
    };
    scan((Game.state.scholar || {}).inventory);
    scan((Game.state.village || {}).pantry);
  } catch (e) {}
  return k;
}

(async () => {
  const label = process.env.LEVER || 'smokesib';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10));
  const days = parseInt(process.env.DAYS || '150', 10);
  const outPath = process.env.OUT || '/tmp/smokesib-sweep.json';
  const pids = Object.keys(POLICIES);
  const runs = [];
  for (const pid of pids) {
    const base = POLICIES[pid];
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'smokesib-' + pid, fullTelemetry: false });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const hist = { maxRank: 0, maxArc: 1, everTable: false };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          if (s.tableWaiting) hist.everTable = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest: { label, seed, pid }, sampleEvery: 10 });
      const end = stdSnapshot(Game);
      let exiled = 0, launderKcal = 0, launderStacks = 0, cookAllCalls = 0;
      try { exiled = Object.keys((Game.state.village || {}).severed || {}).length; } catch (e) {}
      try { launderKcal = Math.round(Game._smokeSibLaunderKcal || 0); } catch (e) {}
      try { launderStacks = Game._smokeSibLaunderStacks || 0; } catch (e) {}
      try { cookAllCalls = Game._cookAllCalls || 0; } catch (e) {}
      const rotStock = spoiledStockKcal(Game);
      const waveReach = result.maxWaveUnlocked || 1;
      const vd = result.days || 1; // village-days survived
      runs.push({ label, policy: pid, seed, days: result.days, endReason: result.endReason,
        won: end.won ? 1 : 0, waveReach, wave4: waveReach >= 4 ? 1 : 0, wave5: waveReach >= 5 ? 1 : 0,
        maxArc: hist.maxArc, national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        exiled, launderKcal, launderStacks, cookAllCalls,
        rotStockKcal: rotStock, rotPerVd: +(rotStock / vd).toFixed(2) });
      console.log(`  [${pid} seed ${seed}] days=${result.days} end=${result.endReason} wave=${waveReach} rank=${hist.maxRank} table=${runs[runs.length-1].table} won=${end.won?1:0} exiled=${exiled} launder=${launderKcal}kcal/${launderStacks}stk cookAll=${cookAllCalls} rotStock=${rotStock}`);
    }
  }
  const agg = {};
  for (const pid of pids) {
    const rs = runs.filter(r => r.policy === pid);
    const darr = rs.map(r => r.days).sort((a, b) => a - b);
    agg[pid] = { n: rs.length,
      launderKcal: rs.reduce((t, r) => t + r.launderKcal, 0),
      launderStacks: rs.reduce((t, r) => t + r.launderStacks, 0),
      launderRuns: rs.filter(r => r.launderStacks > 0).map(r => r.seed),
      cookAllCalls: rs.reduce((t, r) => t + r.cookAllCalls, 0),
      won: rs.reduce((t, r) => t + r.won, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      wave4: rs.reduce((t, r) => t + r.wave4, 0),
      wave5: rs.reduce((t, r) => t + r.wave5, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      rotPerVdMean: +(rs.reduce((t, r) => t + r.rotPerVd, 0) / rs.length).toFixed(2),
      medianDays: darr[Math.floor(darr.length / 2)],
      maxDays: darr[darr.length - 1] };
  }
  fs.writeFileSync(outPath, JSON.stringify({ label, seeds, days, runs, agg,
    generated: new Date().toISOString() }, null, 1));
  console.log('\n' + JSON.stringify(agg, null, 1));
  console.log('wrote ' + outPath);
})();
