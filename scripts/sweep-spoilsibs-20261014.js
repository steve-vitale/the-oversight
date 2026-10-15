#!/usr/bin/env node
// sweep-spoilsibs-20261014.js — SIM-SPOILSIBS arm cohort instrument (loop B, food economy).
//
// DIAGNOSTIC arm: both vectors audited clean on pristine master, no game-code
// change. This sweep answers "ZERO laundering across the cohort?" with a
// universal at-scan instrument instead of a before/after: every pantry stack
// first seen SPOILED (raw boundary, isSpoiled(it,0)) is tagged; any tagged
// stack whose spoilDay later exceeds the scan day is a launder event — the
// spoilDay-reset class, regardless of which code path did it. Per sim-findings
// #100 the check runs during the sim (daily scan), never post-hoc.
// Also asserts every "Tribute grain from X" arrival carries sd == day+21
// (fresh dated transfer, never a re-dated stack) and collects wall metrics.
//
// Usage: SMOKE=1 node scripts/sweep-spoilsibs-20261014.js   (gate first)
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" DAYS=180 \
//   OUT=/tmp/spoilsibs.json node scripts/sweep-spoilsibs-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const leadcourt = require('./policies/leadcourt').leadcourt;
const belongseek = require('./policies/belongseek').belongseek;

const POLICY_REGISTRY = { leadcourt, belongseek };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

// Universal launder instrument: tag spoiled pantry stacks, catch re-dating.
function makeLaunderScan(Game) {
  const seen = new WeakSet();          // tagged once spoiled
  const seenTrib = new WeakSet();      // each tribute arrival counted once, dated at arrival
  let launderKcal = 0, launderEvents = 0;
  let tributeArrivals = 0, tributeBadDate = 0;
  function scan() {
    const day = (Game.state.scholar || {}).day || 0;
    const pantry = (Game.state.village || {}).pantry || [];
    for (const it of pantry) {
      if (!it) continue;
      const sd = it.spoilDay;
      const spoiled = sd !== undefined && sd !== null && sd < 9999 && sd <= day;
      if (spoiled && !seen.has(it)) seen.add(it);
      if (seen.has(it) && sd > day) {
        launderKcal += (it.kcalEach || 0) * (it.units || 1);
        launderEvents++;
        seen.delete(it); // count each re-dated stack once
      }
      if (/^Tribute grain from/.test(it.name || '')) {
        if (!seenTrib.has(it)) {
          seenTrib.add(it);
          tributeArrivals++;
          // Fresh ~21-day grain: the push happens after the policy daily
          // scan on its arrival day, so first-seen diff is 20 or 21.
          // Anything else (e.g. a re-dated stack) is a laundering signal.
          const diff = sd - day;
          if (diff < 20 || diff > 21) tributeBadDate++;
        }
      }
    }
  }
  return { scan, stats: () => ({ launderKcal, launderEvents, tributeArrivals, tributeBadDate }) };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] named-export unwrap: policy.daily is a function`,
      base && typeof base.daily === 'function', 'typeof=' + (base && typeof base.daily));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    const { Game } = await loadGame({ seed: 11, mode: 'spoilsibs-smoke-' + pid, fullTelemetry: false });
    await setupGame(Game);
    const inst = makeLaunderScan(Game);
    const policy = Object.assign({}, base, { daily(G, ctx) { inst.scan(); return base.daily(G, ctx); } });
    const result = await runDays(Game, policy, { days: 2, manifest: { label: 'spoilsibs-smoke', pid } });
    check(`[${pid}] 2-day smoke run completes`, result && result.days >= 1, 'days=' + (result && result.days));
    check(`[${pid}] instrument attaches`, !!inst.stats, '');
  }
  // Tribute-fixture sanity: spoiled stack through payTribute, no re-date.
  const { Game } = await loadGame({ seed: 42, mode: 'spoilsibs-smoke-trib', fullTelemetry: false });
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 1;
  Game.state.village.pantry = [{ name: 'Old fish', kcalEach: 100, units: 40, spoilDay: day - 1,
    foodKind: 'meat', foodState: 'fresh', safe: false, kg: 0.2 }];
  const inst2 = makeLaunderScan(Game); inst2.scan();
  const week = Math.floor(day / 7);
  Game.mshipState().links = [{ id: 'smk', status: 'active', subordinate: 'haven',
    primary: 'otherv', tributeKcalPerWeek: 5000, tributeWeek: week, tributePaidKcal: 0, tributePaidWeek: -1 }];
  Game.payTribute('smk', 5000);
  inst2.scan();
  const st = inst2.stats();
  check('[tribute] spoiled fixture paid, launderKcal==0', st.launderKcal === 0, 'launderKcal=' + st.launderKcal);
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GREEN');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const label = process.env.LEVER || 'spoilsibs';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outPath = process.env.OUT || '/tmp/spoilsibs-sweep.json';
  const runs = [];
  for (const pid of pids) {
    const base = POLICY_REGISTRY[pid];
    if (!base || typeof base.daily !== 'function') throw new Error('policy unwrap failed: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'spoilsibs-' + pid, fullTelemetry: false });
      await setupGame(Game);
      const inst = makeLaunderScan(Game);
      const hist = { maxRank: 0, maxArc: 1, everTable: false };
      const origDaily = base.daily;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try {
          inst.scan();
          const s = stdSnapshot(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
          if (s.tableWaiting) hist.everTable = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, manifest: { label, seed, pid } });
      inst.scan();
      const end = stdSnapshot(Game);
      const st = inst.stats();
      let exiled = 0;
      try { exiled = Object.keys((Game.state.village || {}).severed || {}).length; } catch (e) {}
      const waveReach = result.maxWaveUnlocked || 1;
      runs.push({ label, policy: pid, seed, days: result.days, endReason: result.endReason,
        won: end.won ? 1 : 0, waveReach, wave4: waveReach >= 4 ? 1 : 0, wave5: waveReach >= 5 ? 1 : 0,
        maxArc: hist.maxArc, national: hist.maxRank >= 2 ? 1 : 0,
        table: hist.everTable || end.tableWaiting ? 1 : 0, exiled,
        launderKcal: st.launderKcal, launderEvents: st.launderEvents,
        tributeArrivals: st.tributeArrivals, tributeBadDate: st.tributeBadDate });
      console.log(`  [${pid} seed ${seed}] days=${result.days} end=${result.endReason} wave=${waveReach} rank=${hist.maxRank} table=${runs[runs.length-1].table} won=${end.won?1:0} launderKcal=${st.launderKcal} trib=${st.tributeArrivals}/${st.tributeBadDate}bad`);
    }
  }
  const agg = {};
  for (const pid of pids) {
    const rs = runs.filter(r => r.policy === pid);
    const darr = rs.map(r => r.days).sort((a, b) => a - b);
    agg[pid] = { n: rs.length,
      launderKcal: rs.reduce((t, r) => t + r.launderKcal, 0),
      launderEvents: rs.reduce((t, r) => t + r.launderEvents, 0),
      launderSeeds: rs.filter(r => r.launderKcal > 0).map(r => r.seed),
      tributeArrivals: rs.reduce((t, r) => t + r.tributeArrivals, 0),
      tributeBadDate: rs.reduce((t, r) => t + r.tributeBadDate, 0),
      won: rs.reduce((t, r) => t + r.won, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      wave4: rs.reduce((t, r) => t + r.wave4, 0),
      wave5: rs.reduce((t, r) => t + r.wave5, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      medianDays: darr[Math.floor(darr.length / 2)],
      maxDays: darr[darr.length - 1] };
  }
  fs.writeFileSync(outPath, JSON.stringify({ label, seeds, days, runs, agg,
    generated: new Date().toISOString() }, null, 1));
  console.log('\n' + JSON.stringify(agg, null, 1));
  console.log('wrote ' + outPath);
}

main().catch(e => { console.error('SWEEP CRASH: ' + (e && e.stack || e)); process.exit(2); });
