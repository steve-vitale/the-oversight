#!/usr/bin/env node
// scripts/sweep-succombat.js — before/after sweep for the succombat arm
// (scale-wall r24 ARM 3).
//
// Baseline (ARM unset/0): raw leadcourt / belongseek (MANTLEBEAT/SUCCOMBAT
// unset). Arm (ARM=1): wrapSuccombat(...) with SUCCOMBAT=1.
// Identical seeds x both policies, 180d death-aware horizon (the harness's
// dead-village stop applies — r23 harnessstop).
// Primary metrics: scholar deaths per 100 run-days; runs with >=1 same-day
// multi-scholar-death day (from samples.deaths player:true records keyed by
// day). Secondary: 48h combat-succession chain links (a combat player death
// within 2 days of the previous player death — the r23 metric-review item).
// Guardrails: median survival, national, table/wins, exiled.
// Usage: ARM=0 OUT=evidence/2026-10-14/sweep-succombat-base.json node scripts/sweep-succombat.js
//        ARM=1 OUT=evidence/2026-10-14/sweep-succombat-arm.json  node scripts/sweep-succombat.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
let wrapSuccombat = null;
try { ({ wrapSuccombat } = require('./policies/succombat')); }
catch (e) { console.error('FATAL: cannot load ./policies/succombat — refusing to measure a missing layer'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const ARM = process.env.ARM === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village', vests: 0, exiled: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.exiled = !!((Game.state.scholar || {}).exiled) ? 1 : 0; } catch (e) {}
  return out;
}

function scMetrics(samples, ctx) {
  const byDay = {};
  const playerDeaths = [];
  let scholarDeaths = 0;
  for (const d of (samples.deaths || [])) {
    if (!d.player) continue;
    scholarDeaths++;
    playerDeaths.push(d);
    byDay[d.day] = (byDay[d.day] || 0) + 1;
  }
  playerDeaths.sort((a, b) => a.day - b.day);
  const multiDays = Object.values(byDay).filter(n => n >= 2).length;
  // 48h combat-succession chain links: a combat player death within 2 days of
  // the previous player death (r23 metric-review item).
  let chainLinks = 0;
  for (let i = 1; i < playerDeaths.length; i++) {
    const d = playerDeaths[i];
    const prev = playerDeaths[i - 1];
    if (String(d.cause || '').includes('combat') && (d.day - prev.day) <= 2) chainLinks++;
  }
  const sc = {};
  if (ctx) for (const k of Object.keys(ctx)) {
    if (/^sc[A-Z]/.test(k) && typeof ctx[k] === 'number') sc[k] = ctx[k];
  }
  return {
    scholarDeaths, sameDayMulti: multiDays > 0 ? 1 : 0, multiDeathDays: multiDays,
    chainLinks, sc,
  };
}

async function runOne(basePolicy, armOn, seed) {
  const policy = armOn ? wrapSuccombat(basePolicy) : basePolicy;
  const pid = armOn ? basePolicy.id + '+sc' : basePolicy.id;
  if (armOn) process.env.SUCCOMBAT = '1'; else delete process.env.SUCCOMBAT;
  const { Game, manifest } = await loadGame({ seed, mode: 'succombat-' + pid });
  await setupGame(Game);
  const p = Object.assign({}, policy);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = policy.daily;
  let ctxRef = null;
  p.daily = function (G, ctx) {
    ctxRef = ctx;
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, p, { days: DAYS, manifest, sampleEvery: 10 });
  const end = stdSnapshot(Game);
  const mm = scMetrics(result.samples, ctxRef);
  const deathDays = (result.samples.deaths || []).filter(d => d.player).map(d => d.day + ':' + d.cause);
  const row = {
    policy: pid, seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc, maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable || end.tableWaiting ? 1 : 0,
    exiled: end.exiled,
    ...mm, deathDays,
    ms: result.ms,
  };
  console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} won=${row.won} scholarDeaths=${mm.scholarDeaths} sameDayMulti=${mm.sameDayMulti} chains=${mm.chainLinks}`);
  return row;
}

function agg(rows) {
  const daysArr = rows.map(r => r.days).sort((a, b) => a - b);
  const runDays = rows.reduce((t, r) => t + (r.gameDays || r.days), 0);
  const scSum = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.sc || {})) scSum[k] = (scSum[k] || 0) + v;
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0,
    maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    maxWave: Math.max.apply(null, rows.map(r => r.waveReach).concat([1])),
    national: rows.reduce((t, r) => t + r.national, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    exiled: rows.reduce((t, r) => t + r.exiled, 0),
    scholarDeaths: rows.reduce((t, r) => t + r.scholarDeaths, 0),
    scholarDeathsPer100d: runDays ? +(rows.reduce((t, r) => t + r.scholarDeaths, 0) / runDays * 100).toFixed(2) : 0,
    runDays,
    sameDayMultiRuns: rows.reduce((t, r) => t + r.sameDayMulti, 0),
    multiDeathDays: rows.reduce((t, r) => t + r.multiDeathDays, 0),
    chainLinks: rows.reduce((t, r) => t + r.chainLinks, 0),
    sc: scSum,
  };
}

(async () => {
  const report = { arm: ARM ? 1 : 0, seeds: SEEDS, days: DAYS, runs: [], generated: new Date().toISOString() };
  for (const base of [leadcourt, belongseek]) {
    for (const seed of SEEDS) report.runs.push(await runOne(base, ARM, seed));
  }
  const byPol = {};
  for (const b of [leadcourt, belongseek]) {
    const pid = ARM ? b.id + '+sc' : b.id;
    byPol[pid] = agg(report.runs.filter(r => r.policy === pid));
  }
  report.byPolicy = byPol;
  report.pooled = agg(report.runs);
  const out = process.env.OUT || '/tmp/sweep-succombat.json';
  require('fs').writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('\n=== succombat sweep (ARM=' + (ARM ? 1 : 0) + ') ===');
  for (const [k, v] of Object.entries(byPol)) {
    console.log(`${k}: n=${v.n} won=${v.won} medD=${v.medianDays} maxD=${v.maxDays} maxWave=${v.maxWave} nat=${v.national} tab=${v.table} exiled=${v.exiled} scholarDeaths=${v.scholarDeaths} sd/100d=${v.scholarDeathsPer100d} sameDayMultiRuns=${v.sameDayMultiRuns} chains=${v.chainLinks}`);
  }
  console.log('pooled:', JSON.stringify(report.pooled));
  console.log('wrote', out);
})().catch(e => { console.error('SWEEP ERROR', e); process.exit(2); });
