#!/usr/bin/env node
// sweep-fight-assess-r1.js — before/after sweep for the scale-wall r3
// FIGHT-ASSESS lever (policy-side pre-fight damage-race assessment).
// Identical seeds x competent/winseek, 150d death-aware horizon (dead villages
// stop simulating — runDays breaks on Game.over).
//
// Env:
//   SEEDS="11,22,33,44"  POLICIES="competent,winseek"  DAYS=150
//   COMPETENT_FIGHT_ASSESS=1  -> AFTER (knowledge-gated race assessment +
//                              map-level decline + fight-start proactive disengage)
//   (unset)                   -> BEFORE (legacy HP-ratio new-fight assessment)
//   COMPETENT_DPS_RACE / COMPETENT_DIRECTIONAL_FLEE left UNSET in both arms
//   OUT=/tmp/x.json              -> write full report JSON
//   LEVER="label"
//
// Usage:
//   SEEDS="11,22,33,44" POLICIES="competent,winseek" DAYS=150 \
//     OUT=/tmp/fassess-before.json node scripts/sweep-fight-assess-r1.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY, stdSnapshot } = require('./sweep-compare');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'competent,winseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const gateOn = process.env.COMPETENT_FIGHT_ASSESS === '1';
  const label = process.env.LEVER || ('fight-assess ' + (gateOn ? 'AFTER(assess)' : 'BEFORE(legacy)'));
  const runs = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'fassess-' + pid });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      const ctxHolder = {};
      const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
      const bearer = { last: null, changes: 0 };
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        ctxHolder.ctx = ctx;
        try {
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          if (s.tableWaiting) hist.everTable = true;
        } catch (e) {}
        // Bearer-death telemetry (r2 open blank): the scholar's villager id
        // changes on succession. Sample daily; count changes.
        try {
          const vid = G.villagerId != null ? G.villagerId : ((G.state || {}).scholar || {}).villagerId;
          if (vid != null) {
            if (bearer.last !== null && bearer.last !== vid) bearer.changes += 1;
            bearer.last = vid;
          }
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
      let countersKnown = 0;
      try { countersKnown = Object.keys((Game.state || {}).monsterCounters || {}).length; } catch (e) {}
      let loreSpecies = 0;
      try { loreSpecies = Object.keys((ctxHolder.ctx || {})._fightLore || {}).length; } catch (e) {}
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
        bearerDeaths: bearer.changes,
        // fight-assess lever telemetry
        faChecks: c.faChecks || 0, faDeclined: c.faDeclined || 0,
        faSkipped: c.faSkipped || 0, faLoreSpecies: loreSpecies,
        faFirst: c.faFirstDetail || null,
        // pre-existing counters (both arms)
        fledBad: c.fledBad || 0, fled: c.fled || 0,
        beastTricks: c.beastTricks || 0, countersKnown,
        trapsCrafted: c.trapsCrafted || 0, trapsSet: c.trapsSet || 0,
        trapsWireSet: c.trapsWireSet || 0,
      };
      runs.push(r);
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} table=${r.table} bearerDeaths=${r.bearerDeaths} faDeclined=${r.faDeclined} faSkipped=${r.faSkipped} tricks=${r.beastTricks} counters=${countersKnown} traps=${r.trapsCrafted}/${r.trapsSet}`);
    }
  }
  const byPolicy = {};
  for (const pid of policyIds) {
    const rs = runs.filter(r => r.policy === pid);
    const daysArr = rs.map(r => r.days).sort((a, b) => a - b);
    const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
    const deathTotals = {};
    const peopleDeathTotals = {};
    const sum = (k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
    for (const r of rs) for (const [k, v] of Object.entries(r.peopleDeaths || {})) peopleDeathTotals[k] = (peopleDeathTotals[k] || 0) + v;
    byPolicy[pid] = {
      n: rs.length,
      won: sum('won'),
      national: sum('national'),
      table: sum('table'),
      medianDays: median,
      maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
      maxWave: Math.max.apply(null, rs.map(r => r.waveReach).concat([1])),
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      deaths: deathTotals,
      peopleDeaths: peopleDeathTotals,
      bearerDeaths: sum('bearerDeaths'),
      faChecks: sum('faChecks'), faDeclined: sum('faDeclined'), faSkipped: sum('faSkipped'),
      fledBad: sum('fledBad'), fled: sum('fled'),
      beastTricks: sum('beastTricks'), countersKnown: sum('countersKnown'),
      trapsCrafted: sum('trapsCrafted'), trapsSet: sum('trapsSet'), trapsWireSet: sum('trapsWireSet'),
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
      bearerDeaths: runs.reduce((t, r) => t + (r.bearerDeaths || 0), 0),
    },
    generated: new Date().toISOString(),
  };
  console.log(`\n=== ${label} ===  (${policyIds.join(', ')}) seeds=[${seeds.join(',')}] days=${days}`);
  console.log('policy        n  won  nat  tab  medD  maxD  maxWave  maxArc  bearerD  faDecl/skip  tricks  deaths');
  for (const pid of policyIds) {
    const b = byPolicy[pid];
    const dstr = Object.entries(b.deaths).map(([k, v]) => `${k}:${v}`).join(',') || '-';
    console.log(
      `${pid.padEnd(13)} ${String(b.n).padEnd(2)} ${String(b.won).padEnd(4)} ${String(b.national).padEnd(4)} ` +
      `${String(b.table).padEnd(4)} ${String(b.medianDays).padEnd(5)} ${String(b.maxDays).padEnd(5)} ` +
      `${String(b.maxWave).padEnd(8)} ${String(b.maxArc).padEnd(6)} ${String(b.bearerDeaths).padEnd(8)} ` +
      `${(b.faDeclined + '/' + b.faSkipped).padEnd(11)} ${String(b.beastTricks).padEnd(7)} ${dstr}`
    );
  }
  const o = report.overall;
  console.log(`OVERALL n=${o.n} national=${o.national}/${o.n} table=${o.table}/${o.n} won=${o.won} medianDays=${o.medianDays} bearerDeaths=${o.bearerDeaths}`);
  const out = process.env.OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
