#!/usr/bin/env node
// scripts/sweep-compare.js — the standard before/after lever harness
// (measurement 2026-10-11).
//
// The path of least resistance for lever workers: one command runs identical
// seeds × N policies and emits the standard table. Deterministic: seeds are
// fixed, Math.random is seeded before eval (sim-harness), policies are
// deterministic by contract.
//
// Usage:
//   LEVER="contest fear" SEEDS="7,42,99" POLICIES="competent,risk-aware" \
//   DAYS=60 OUT=/tmp/compare.json node scripts/sweep-compare.js
//
// As a module:
//   const { runComparison } = require('./sweep-compare');
//   const rep = await runComparison({
//     label: 'contest fear',
//     seeds: [7, 42, 99],
//     policies: ['competent', 'risk-aware'],
//     days: 60,
//     extraMetrics: (Game, ctx) => ({ refusals: ctx.contestRefusals || 0 }),
//   });
//
// Standard table per (policy × seed): won, days, wave reach 1–5, arc,
// national reach, table waiting, death-cause shares, pacing means.
// extraMetrics(Game, ctx) adds lever-specific fields (flat object of numbers).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { riskAware } = require('./policies/risk-aware');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const { kind } = require('./policies/kind');
const { deedSeeking } = require('./policies/deed-seeking');
const { winseek } = require('./policies/winseek');
const idle = require('./policies/idle');

const POLICY_REGISTRY = {
  'competent': competent,
  'risk-aware': riskAware,
  'larceny-leaning': larcenyLeaning,
  'kind': kind,
  'deed-seeking': deedSeeking,
  'winseek': winseek,
  'zero': idle.zero, 'mvc': idle.mvc, 'leader': idle.leader,
};
try { POLICY_REGISTRY['oraclev2'] = require('./policies/oracleV2').oraclev2 || require('./policies/oracleV2'); } catch (e) {}
try { POLICY_REGISTRY['socialite'] = require('./policies/socialite').socialite || require('./policies/socialite'); } catch (e) {}

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  // Everything behind try/catch: a hostile read must never kill a run.
  const out = {
    won: false, arc: 1, tableWaiting: false, rank: 'village',
    breadth: 0, stage: 0,
  };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  return out;
}

async function runComparison(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'unlabeled';
  const seeds = opts.seeds || (process.env.SEEDS || '7,42,99').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent').split(',').map(s => s.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '60', 10);
  const extraMetrics = opts.extraMetrics || null;

  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error(`unknown policy: ${pid} (see scripts/policies/README.md)`);
    for (const seed of seeds) {
      const { Game, manifest } = await loadGame({ seed, mode: 'compare-' + pid, fullTelemetry: false });
      await setupGame(Game);
      // Shallow copy: never mutate the shared policy object. Wrap daily to
      // track max scale rank / arc / table — reachability needs history,
      // not just the end state.
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
      const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
      const end = stdSnapshot(Game);
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
        }
      } catch (e) {}
      const row = {
        label, policy: pid, seed,
        days: result.days, gameDays: result.gameDays,
        endReason: result.endReason,
        won: end.won ? 1 : 0,
        waveReach: result.maxWaveUnlocked || 1,
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        deaths,
        pacing: result.pacing ? {
          verbs: result.pacing.meanVerbsPerDay,
          policyCalls: result.pacing.meanPolicyCallsPerDay,
          ticks: result.pacing.meanTicksPerDay,
          perDay: result.pacing.perDay,
        } : null,
      };
      if (extraMetrics) {
        try { row.extra = extraMetrics(Game, result) || {}; }
        catch (e) { row.extra = { _err: String(e.message).slice(0, 80) }; }
      }
      runs.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} table=${row.table} won=${row.won}`);
    }
  }

  // Aggregate per policy.
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    const deathTotals = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
    const extraMeans = {};
    for (const r of rs) {
      for (const [k, v] of Object.entries(r.extra || {})) {
        if (typeof v !== 'number') continue;
        extraMeans[k] = extraMeans[k] || [];
        extraMeans[k].push(v);
      }
    }
    for (const k of Object.keys(extraMeans)) {
      const vs = extraMeans[k];
      extraMeans[k] = +(vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2);
    }
    byPolicy[pid] = {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: median,
      maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      nationalPct: +(100 * rs.reduce((t, r) => t + r.national, 0) / Math.max(1, rs.length)).toFixed(0),
      tablePct: +(100 * rs.reduce((t, r) => t + r.table, 0) / Math.max(1, rs.length)).toFixed(0),
      deaths: deathTotals,
      meanVerbsPerDay: rs.length && rs[0].pacing
        ? +(rs.reduce((t, r) => t + (r.pacing.verbs || 0), 0) / rs.length).toFixed(1) : null,
      extra: extraMeans,
    };
  }

  const report = { label, seeds, policies: policyIds, days, runs, byPolicy,
    generated: new Date().toISOString() };
  return report;
}

function printTable(report) {
  console.log(`\n=== ${report.label} ===  (${report.policies.join(', ')}) seeds=[${report.seeds.join(',')}] days=${report.days}`);
  console.log('policy        n  won  medD  maxD  maxWave  nat%  tab%  verbs/d  deaths');
  for (const pid of report.policies) {
    const b = report.byPolicy[pid];
    const dstr = Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(',') || '-';
    console.log(
      `${pid.padEnd(13)} ${String(b.n).padEnd(2)} ${String(b.won).padEnd(4)} ` +
      `${String(b.medianDays).padEnd(5)} ${String(b.maxDays).padEnd(5)} ${String(b.maxWave).padEnd(8)} ` +
      `${String(b.nationalPct).padEnd(5)} ${String(b.tablePct).padEnd(5)} ${String(b.meanVerbsPerDay).padEnd(8)} ${dstr}`
    );
    const ex = Object.entries(b.extra || {});
    if (ex.length) console.log(`  extra: ${ex.map(([k, v]) => `${k}=${v}`).join(' ')}`);
  }
  console.log('');
}

if (require.main === module) {
  (async () => {
    const report = await runComparison({});
    printTable(report);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runComparison, printTable, POLICY_REGISTRY, stdSnapshot };
