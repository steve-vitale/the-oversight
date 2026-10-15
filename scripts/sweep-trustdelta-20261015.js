#!/usr/bin/env node
// sweep-trustdelta-20261015.js — trust-delta-by-source measurement sweep
// (ARM 3, loop B, 2026-10-15, sim-findings #265 FEED-SIDE TRUST GAINS).
// INSTRUMENT ONLY — the lib is scripts/trustdelta-lib-20261015.js; zero
// src/js changes. 8 seeds x {competent, belongseek, leadcourt}, 180d
// death-aware, identical seeds across policies. Decomposes WHERE trust
// comes from per policy: donations, talk, mediate, meal, amends, teaching,
// gossip (canon: must be zero), feast, aid, ripple, bump, event, other.
//
// Usage:
//   SMOKE=1 node scripts/sweep-trustdelta-20261015.js   # 1 seed x 3 policies x 15d
//   node scripts/sweep-trustdelta-20261015.js           # full 24-run sweep
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustDelta } = require('./trustdelta-lib-20261015');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const POLICIES = { competent, belongseek, leadcourt };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-trustdelta');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function scholarTrust(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const t = (v.trust || {})[s.villagerId];
    return t === undefined ? 10 : t;
  } catch (e) { return null; }
}

function stdMetrics(Game, result) {
  const out = { won: false, rank: 'village', tableWaiting: false, maxWave: 1, gameDays: 0, deaths: {} };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
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
  const policy = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: 'trustdelta-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const track = installTrustDelta(Game);
  let dailyCalls = 0;
  const od = policy.daily;
  const pwrap = Object.assign({}, policy);
  if (od) pwrap.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, pwrap, { days, sampleEvery: 10 }); });
  const fin = track.finalize();
  const m = stdMetrics(Game, result);
  return {
    seed, policyId, days: m.gameDays, dailyCalls,
    won: m.won, rank: m.rank, national: (RANK_ORDER[m.rank] || 0) >= 2 ? 1 : 0,
    tableWaiting: m.tableWaiting, maxWave: m.maxWave, deaths: m.deaths,
    trust: {
      nTicks: fin.nTicks, coverage: fin.coverage,
      posSum: fin.posSum, negSum: fin.negSum, zeroN: fin.zeroN,
      bySource: fin.bySource,
      gossipViolations: fin.gossipViolations.length,
      instrErrors: fin.instrErrors.length,
      reconMismatched: fin.reconMismatched,
    },
    // detail-level for the decomposition (kept per-run, summarized later)
    byDetail: fin.byDetail,
    // sense-testing: beats around major deltas (capped)
    sayBeats: fin.sayBeats.slice(0, 40),
  };
}

async function main() {
  const smoke = process.env.SMOKE === '1';
  const seeds = smoke ? [11] : SEEDS;
  const days = smoke ? 15 : DAYS;
  const policyIds = Object.keys(POLICIES);
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const policyId of policyIds) {
    for (const seed of seeds) {
      process.stderr.write(`trustdelta run policy=${policyId} seed=${seed} ...\n`);
      const row = await oneRun(seed, policyId, days);
      rows.push(row);
      fs.writeFileSync(path.join(EVID, `run-${policyId}-s${seed}.json`), JSON.stringify(row, null, 1));
      process.stderr.write(`  done: days=${row.days} ticks=${row.trust.nTicks} coverage=${row.trust.coverage} gossipViol=${row.trust.gossipViolations}\n`);
    }
  }
  // summary: pooled source mix per policy + wall numbers
  const summary = { seeds, days, policies: policyIds, perPolicy: {}, wall: {} };
  for (const policyId of policyIds) {
    const rs = rows.filter(r => r.policyId === policyId);
    const bySource = {};
    for (const r of rs) for (const [s, v] of Object.entries(r.trust.bySource)) {
      const a = bySource[s] || (bySource[s] = { n: 0, pos: 0, neg: 0 });
      a.n += v.n; a.pos += v.pos; a.neg += v.neg;
    }
    const tot = rs.reduce((t, r) => t + r.trust.nTicks, 0);
    const attr = Object.entries(bySource).filter(([s]) => s !== 'other')
      .reduce((t, [, v]) => t + v.n, 0);
    summary.perPolicy[policyId] = {
      n: rs.length,
      coverage: tot ? +(attr / tot).toFixed(4) : 1,
      bySource,
      gossipViolations: rs.reduce((t, r) => t + r.trust.gossipViolations, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + (r.tableWaiting ? 1 : 0), 0),
      won: rs.reduce((t, r) => t + (r.won ? 1 : 0), 0),
      maxWave: Math.max(...rs.map(r => r.maxWave)),
      medianDays: rs.map(r => r.days).sort((a, b) => a - b)[Math.floor(rs.length / 2)],
    };
  }
  const all = rows;
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  summary.wall = {
    national: all.reduce((t, r) => t + r.national, 0) + '/' + all.length,
    table: all.reduce((t, r) => t + (r.tableWaiting ? 1 : 0), 0) + '/' + all.length,
    won: all.reduce((t, r) => t + (r.won ? 1 : 0), 0) + '/' + all.length,
    maxWave: Math.max(...all.map(r => r.maxWave)),
    medianDays: med(all.map(r => r.days)),
    maxDays: Math.max(...all.map(r => r.days)),
  };
  const deaths = {};
  for (const r of all) for (const [k, v] of Object.entries(r.deaths)) deaths[k] = (deaths[k] || 0) + v;
  summary.deaths = deaths;
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
  console.error(`sweep done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
