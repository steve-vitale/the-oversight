#!/usr/bin/env node
// sweep-dps-race-r1.js — before/after sweep for the scale-wall r1 DPS-RACE lever.
// Identical seeds x competent/winseek, 150d death-aware horizon (dead villages
// stop simulating — runDays breaks on Game.over).
//
// Env:
//   SEEDS="11,22,33,44"  POLICIES="competent,winseek"  DAYS=150
//   COMPETENT_DPS_RACE=0  -> BEFORE (legacy HP-threshold fleeing only)
//   (unset)               -> AFTER  (DPS-race assessment on)
//   OUT=/tmp/x.json      -> write full report JSON
//   LEVER="label"
//
// Usage:
//   COMPETENT_DPS_RACE=0 SEEDS="11,22,33,44" POLICIES="competent,winseek" DAYS=150 \
//     OUT=/tmp/dps-before.json node scripts/sweep-dps-race-r1.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY, stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const gateOff = process.env.COMPETENT_DPS_RACE === '0';
  const label = process.env.LEVER || ('dps-race ' + (gateOff ? 'BEFORE(legacy)' : 'AFTER(dps-race)'));
  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'dpsrace-' + pid });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const ctxHolder = {};
      const hist = { maxRank: 0, maxArc: 1, everTable: false };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        ctxHolder.ctx = ctx;
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          if (s.tableWaiting) hist.everTable = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const end = stdSnapshot(Game);
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
        }
      } catch (e) {}
      const c = ctxHolder.ctx || {};
      const r = {
        policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        won: end.won ? 1 : 0,
        waveReach: result.maxWaveUnlocked || 1,
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        deaths,
        // lever telemetry
        dpsFled: c.dpsFled || 0, dpsWindows: c.dpsWindows || 0,
        barrierPushes: c.barrierPushes || 0,
        fledBad: c.fledBad || 0, fled: c.fled || 0,
        fledHurt: c.fledHurt || 0, fledFilled: c.fledFilled || 0, fledKnown: c.fledKnown || 0,
        struck: c.struck || 0,
        firstDpsFlee: c.dpsFledFirstDetail || null,
      };
      runs.push(r);
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} dpsFled=${r.dpsFled} pushes=${r.barrierPushes}`);
    }
  }
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    const deathTotals = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
    byPolicy[pid] = {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      medianDays: median,
      maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      deaths: deathTotals,
      dpsFled: rs.reduce((t, r) => t + r.dpsFled, 0),
      dpsWindows: rs.reduce((t, r) => t + r.dpsWindows, 0),
      fledBad: rs.reduce((t, r) => t + r.fledBad, 0),
      fled: rs.reduce((t, r) => t + r.fled, 0),
    };
  }
  const allDays = runs.map(r => r.days).sort((a, b) => a - b);
  const report = {
    label, seeds, policies: policyIds, days, gateOff, runs, byPolicy,
    overall: {
      n: runs.length,
      national: runs.reduce((t, r) => t + r.national, 0),
      table: runs.reduce((t, r) => t + r.table, 0),
      won: runs.reduce((t, r) => t + r.won, 0),
      medianDays: allDays.length ? allDays[Math.floor(allDays.length / 2)] : 0,
    },
    generated: new Date().toISOString(),
  };
  console.log(`\n=== ${label} ===  (${policyIds.join(', ')}) seeds=[${seeds.join(',')}] days=${days}`);
  console.log('policy        n  won  nat  tab  medD  maxD  maxWave  maxArc  dpsFled/win  deaths');
  for (const pid of policyIds) {
    const b = byPolicy[pid];
    const dstr = Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(',') || '-';
    console.log(
      `${pid.padEnd(13)} ${String(b.n).padEnd(2)} ${String(b.won).padEnd(4)} ${String(b.national).padEnd(4)} ` +
      `${String(b.table).padEnd(4)} ${String(b.medianDays).padEnd(5)} ${String(b.maxDays).padEnd(5)} ` +
      `${String(b.maxWave).padEnd(8)} ${String(b.maxArc).padEnd(6)} ${String(b.dpsFled + '/' + b.dpsWindows).padEnd(10)} ${dstr}`
    );
  }
  const o = report.overall;
  console.log(`OVERALL n=${o.n} national=${o.national}/${o.n} table=${o.table}/${o.n} won=${o.won} medianDays=${o.medianDays}`);
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
