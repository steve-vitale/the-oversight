#!/usr/bin/env node
// scripts/sweep-mantlebeat.js — before/after sweep for the mantlebeat arm.
// Baseline: raw leadcourt / belongseek (unmodified code, MANTLEBEAT unset).
// Arm: wrapMantlebeat(...) with MANTLEBEAT=1.
// Identical seeds x both policies, 180d death-aware horizon.
// Primary metric: runs with >=1 same-day multi-scholar-death day (from
// samples.deaths player:true records keyed by day).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { wrapMantlebeat } = require('./policies/mantlebeat');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', vests: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    let n = 0;
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (v && VEST_IDS.includes(v.id)) n++;
    out.vests = n;
  } catch (e) {}
  return out;
}

function mantleMetrics(samples, ctx) {
  const byDay = {};
  let scholarDeaths = 0;
  for (const d of (samples.deaths || [])) {
    if (!d.player) continue;
    scholarDeaths++;
    byDay[d.day] = (byDay[d.day] || 0) + 1;
  }
  const multiDays = Object.values(byDay).filter(n => n >= 2).length;
  return {
    scholarDeaths,
    sameDayMulti: multiDays > 0 ? 1 : 0, // primary metric: the RUN had a same-day multi-death day
    multiDeathDays: multiDays,
    restDays: (ctx && ctx.mbRestDays) || 0,
    successionsCounted: (ctx && ctx.mbSuccessions) || 0,
    buried: (ctx && ctx.mbBuried) || 0,
    flees: (ctx && ctx.mbFlees) || 0,
  };
}

async function runOne(basePolicy, armOn, seed) {
  const policy = armOn ? wrapMantlebeat(basePolicy) : basePolicy;
  const pid = armOn ? basePolicy.id + '+mb' : basePolicy.id;
  if (armOn) process.env.MANTLEBEAT = '1'; else delete process.env.MANTLEBEAT;
  const { Game, manifest } = await loadGame({ seed, mode: 'mantlebeat-' + pid });
  await setupGame(Game);
  const p = Object.assign({}, policy);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxVests: 0 };
  const origDaily = policy.daily;
  let ctxRef = null;
  // Wrap daily to track reachability history and capture ctx for mb counters.
  p.daily = function (G, ctx) {
    ctxRef = ctx;
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      hist.maxVests = Math.max(hist.maxVests, s.vests || 0);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, p, { days: DAYS, manifest, sampleEvery: 10 });
  const end = stdSnapshot(Game);
  const mm = mantleMetrics(result.samples, ctxRef);
  const deathDays = (result.samples.deaths || []).filter(d => d.player).map(d => d.day + ':' + d.cause);
  const row = {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable || end.tableWaiting ? 1 : 0,
    vests: Math.max(hist.maxVests, end.vests || 0),
    ...mm, deathDays,
    villagersEnd: (result.samples.villagers || []).slice(-1)[0] || null,
    ms: result.ms,
  };
  console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} won=${row.won} scholarDeaths=${mm.scholarDeaths} sameDayMulti=${mm.sameDayMulti} restDays=${mm.restDays}`);
  return row;
}

function agg(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    maxWave: Math.max.apply(null, rows.map(r => r.waveReach).concat([1])),
    national: rows.reduce((t, r) => t + r.national, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    vests: rows.reduce((t, r) => t + r.vests, 0),
    scholarDeaths: rows.reduce((t, r) => t + r.scholarDeaths, 0),
    sameDayMultiRuns: rows.reduce((t, r) => t + r.sameDayMulti, 0),
    multiDeathDays: rows.reduce((t, r) => t + r.multiDeathDays, 0),
    restDays: rows.reduce((t, r) => t + r.restDays, 0),
  };
}

(async () => {
  const report = { seeds: SEEDS, days: DAYS, runs: [], generated: new Date().toISOString() };
  for (const base of [leadcourt, belongseek]) {
    for (const seed of SEEDS) report.runs.push(await runOne(base, false, seed));
  }
  for (const base of [leadcourt, belongseek]) {
    for (const seed of SEEDS) report.runs.push(await runOne(base, true, seed));
  }
  const byPol = {};
  for (const pid of ['leadcourt', 'belongseek', 'leadcourt+mb', 'belongseek+mb']) {
    byPol[pid] = agg(report.runs.filter(r => r.policy === pid));
  }
  report.byPolicy = byPol;
  // pooled before/after
  report.pooled = {
    base: agg(report.runs.filter(r => r.policy === 'leadcourt' || r.policy === 'belongseek')),
    arm: agg(report.runs.filter(r => r.policy.endsWith('+mb'))),
  };
  const out = process.env.OUT || '/tmp/sweep-mantlebeat.json';
  require('fs').writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('\n=== mantlebeat sweep ===');
  for (const [k, v] of Object.entries(byPol)) {
    console.log(`${k}: n=${v.n} won=${v.won} medD=${v.medianDays} maxD=${v.maxDays} maxWave=${v.maxWave} nat=${v.national} tab=${v.table} scholarDeaths=${v.scholarDeaths} sameDayMultiRuns=${v.sameDayMultiRuns} restDays=${v.restDays}`);
  }
  console.log('pooled base:', JSON.stringify(report.pooled.base));
  console.log('pooled arm :', JSON.stringify(report.pooled.arm));
  console.log('wrote', out);
})().catch(e => { console.error('SWEEP ERROR', e); process.exit(2); });
