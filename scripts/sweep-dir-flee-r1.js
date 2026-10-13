#!/usr/bin/env node
// sweep-dir-flee-r1.js — before/after sweep for the scale-wall r2 DIRECTIONAL-FLEE lever.
// Identical seeds x competent/winseek, 150d death-aware horizon (dead villages
// stop simulating — runDays breaks on Game.over).
//
// Env:
//   SEEDS="11,22,33,44"  POLICIES="competent,winseek"  DAYS=150
//   COMPETENT_DIRECTIONAL_FLEE=1  -> AFTER (directional flee + recover-and-return)
//   (unset)                       -> BEFORE (legacy nearest-edge walk, no push)
//   COMPETENT_DPS_RACE is left UNSET in both (DPS instrument inert — r1's gate)
//   OUT=/tmp/x.json              -> write full report JSON
//   LEVER="label"
//
// Usage:
//   SEEDS="11,22,33,44" POLICIES="competent,winseek" DAYS=150 \
//     OUT=/tmp/dirflee-before.json node scripts/sweep-dir-flee-r1.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY, stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const gateOn = process.env.COMPETENT_DIRECTIONAL_FLEE === '1';
  const label = process.env.LEVER || ('dir-flee ' + (gateOn ? 'AFTER(directional)' : 'BEFORE(legacy)'));
  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'dirflee-' + pid });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const ctxHolder = {};
      const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
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
      try {
        const wv = (Game.unlockedWave && Game.unlockedWave()) || 1;
        hist.maxWave = Math.max(hist.maxWave, wv);
      } catch (e) {}
      const deaths = {};
      const peopleDeaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
          const kind = String(d.kind || '?');
          const kk = kind + ':' + k;
          peopleDeaths[kk] = (peopleDeaths[kk] || 0) + 1;
        }
      } catch (e) {}
      const c = ctxHolder.ctx || {};
      const r = {
        policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        won: end.won ? 1 : 0,
        waveReach: Math.max(result.maxWaveUnlocked || 1, hist.maxWave),
        maxArc: hist.maxArc,
        maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
        national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0,
        deaths, peopleDeaths,
        // lever telemetry
        dirPushes: c.dirPushes || 0, dirWalks: c.dirWalks || 0,
        fledHeld: c.fledHeld || 0,
        recoverMarks: c.recoverMarks || 0, recoverDays: c.recoverDays || 0,
        barrierPushes: c.barrierPushes || 0,
        fledBad: c.fledBad || 0, fled: c.fled || 0,
        firstDirPush: c.dirPushFirst || null,
      };
      runs.push(r);
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} dirPush=${r.dirPushes} held=${r.fledHeld} rec=${r.recoverDays}`);
    }
  }
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    const deathTotals = {};
    const peopleDeathTotals = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
    for (const r of rs) for (const [k, v] of Object.entries(r.peopleDeaths || {})) peopleDeathTotals[k] = (peopleDeathTotals[k] || 0) + v;
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
      peopleDeaths: peopleDeathTotals,
      dirPushes: rs.reduce((t, r) => t + r.dirPushes, 0),
      fledHeld: rs.reduce((t, r) => t + r.fledHeld, 0),
      recoverDays: rs.reduce((t, r) => t + r.recoverDays, 0),
      barrierPushes: rs.reduce((t, r) => t + r.barrierPushes, 0),
      fledBad: rs.reduce((t, r) => t + r.fledBad, 0),
      fled: rs.reduce((t, r) => t + r.fled, 0),
    };
  }
  const allDays = runs.map(r => r.days).sort((a, b) => a - b);
  const report = {
    label, seeds, policies: policyIds, days, gateOn, runs, byPolicy,
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
  console.log('policy        n  won  nat  tab  medD  maxD  maxWave  maxArc  dirPush/held/rec  deaths');
  for (const pid of policyIds) {
    const b = byPolicy[pid];
    const dstr = Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(',') || '-';
    console.log(
      `${pid.padEnd(13)} ${String(b.n).padEnd(2)} ${String(b.won).padEnd(4)} ${String(b.national).padEnd(4)} ` +
      `${String(b.table).padEnd(4)} ${String(b.medianDays).padEnd(5)} ${String(b.maxDays).padEnd(5)} ` +
      `${String(b.maxWave).padEnd(8)} ${String(b.maxArc).padEnd(6)} ${(b.dirPushes + '/' + b.fledHeld + '/' + b.recoverDays).padEnd(15)} ${dstr}`
    );
  }
  const o = report.overall;
  console.log(`OVERALL n=${o.n} national=${o.national}/${o.n} table=${o.table}/${o.n} won=${o.won} medianDays=${o.medianDays}`);
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
