#!/usr/bin/env node
// measure-spoilgate-20261014.js — SPOILGATE arm pilot measurement.
//
// PRE-REGISTERED (evidence/2026-10-14/sim-spoilgate.md header):
//   Primary metric: scholar spoiled pantry takes per run (instrumented at
//     Game.takeFromPantry: pantry item spoiled at take time).
//   GO: armed total == 0 AND baseline total > 0 on identical seeds.
//   Horizon: 180d death-aware. Seeds: 11/22/33/44/55/66/77/88 x
//     (leadcourt, belongseek) = 16 runs, identical seeds before/after.
//   Guardrail: scholar mean kcal-as-fraction-of-cap within +/-10% relative
//     of baseline; starveDays (any villager hunger>70 at daily hook) within
//     +/-10% relative of baseline mean.
//   Kill: GO missed, guardrail regressed, or baseline shows 0 spoiled takes
//     (lever has nothing to bite — kill on the measurement alone).
//   Wall guardrails: national / table / wins / wave4-5 / exiled / median+max
//     survival reported both sides.
// Gate: SPOILGATE=1 opt-in (default OFF) — before side runs with the env
// var unset (byte-identical to pristine behavior).
// Usage: SPOILGATE=1 SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=/tmp/after.json \
//   node scripts/measure-spoilgate-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const leadcourt = require('./policies/leadcourt').leadcourt;
const belongseek = require('./policies/belongseek').belongseek;

const POLICIES = { leadcourt, belongseek };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function rosterN(G) { try { return ((G.state.village || {}).roster || []).length; } catch (e) { return -1; } }

async function oneRun(pid, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'spoilgate-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = { spoiledTakes: 0, pantryTakes: 0, beats: 0, starveDays: 0,
    kcalFracSum: 0, kcalFracN: 0, deaths: [] };

  // --- primary instrument: spoiled takes at takeFromPantry ---
  const oTake = Game.takeFromPantry;
  if (typeof oTake === 'function') Game.takeFromPantry = function (idx) {
    try {
      const pantry = (Game.state.village || {}).pantry || [];
      const it = pantry[idx];
      if (it) {
        W.pantryTakes++;
        if (Game.isSpoiled && Game.isSpoiled(it)) W.spoiledTakes++;
      }
    } catch (e) {}
    return oTake.call(this, idx);
  };

  // --- beat instrument: the honest "leave the off food" beat ---
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (t) {
    try { if (typeof t === 'string' && t.indexOf('You leave the off') === 0) W.beats++; } catch (e) {}
    return oSay.call(this, t);
  };

  // --- deaths ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try { W.deaths.push({ day: (Game.state.scholar || {}).day || 0, cause: String((opts && opts.cause) || '?').slice(0, 32) }); } catch (e) {}
    return oDie.apply(this, arguments);
  };

  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const st = G.state || {}, s = st.scholar || {}, vv = st.village || {};
      let hungry = 0;
      for (const id of (vv.roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      try { const cap = G.kcalCap(); W.kcalFracSum += (s.kcal || 0) / Math.max(1, cap); W.kcalFracN++; } catch (e) {}
      let rank = 'village', arc = 1, tableW = false;
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      try { const pg = G.progState ? G.progState() : {}; arc = pg.arc || 1; tableW = !!pg.tableWaiting; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, arc || 1);
      if (tableW) hist.everTable = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  let exiled = 0, waveReach = 1;
  try { exiled = Object.keys((Game.state.village || {}).severed || {}).length; } catch (e) {}
  try { waveReach = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const end = {
    seed, days: result.days, endReason: result.endReason,
    won: !!Game.won, waveReach, wave4: waveReach >= 4 ? 1 : 0, wave5: waveReach >= 5 ? 1 : 0,
    maxArc: hist.maxArc, national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || !!((Game.progState ? Game.progState() : {}).tableWaiting)) ? 1 : 0,
    exiled, rosterEnd: rosterN(Game),
    spoiledTakes: W.spoiledTakes, pantryTakes: W.pantryTakes, spoilgateBeats: W.beats,
    starveDays: W.starveDays,
    scholarKcalFrac: W.kcalFracN ? +(W.kcalFracSum / W.kcalFracN).toFixed(4) : null,
    deaths: W.deaths, ms,
  };
  return end;
}

function aggOf(rs) {
  const mean = (f) => rs.reduce((t, r) => t + (f(r) || 0), 0) / Math.max(1, rs.length);
  const darr = rs.map(r => r.days).sort((a, b) => a - b);
  const causes = {};
  for (const r of rs) for (const d of (r.deaths || [])) causes[d.cause] = (causes[d.cause] || 0) + 1;
  return {
    n: rs.length,
    spoiledTakes: rs.reduce((t, r) => t + r.spoiledTakes, 0),
    spoiledTakeSeeds: rs.filter(r => r.spoiledTakes > 0).map(r => r.seed),
    pantryTakes: rs.reduce((t, r) => t + r.pantryTakes, 0),
    spoilgateBeats: rs.reduce((t, r) => t + r.spoilgateBeats, 0),
    meanScholarKcalFrac: +mean(r => r.scholarKcalFrac).toFixed(4),
    meanStarveDays: +mean(r => r.starveDays).toFixed(2),
    won: rs.reduce((t, r) => t + r.won, 0),
    national: rs.reduce((t, r) => t + r.national, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    wave4: rs.reduce((t, r) => t + r.wave4, 0),
    wave5: rs.reduce((t, r) => t + r.wave5, 0),
    exiled: rs.reduce((t, r) => t + r.exiled, 0),
    medianDays: darr[Math.floor(darr.length / 2)],
    maxDays: darr[darr.length - 1],
    deathCauses: causes,
  };
}

(async () => {
  const label = process.env.SPOILGATE === '1' ? 'spoilgate-armed' : 'spoilgate-baseline';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10));
  const days = parseInt(process.env.DAYS || '180', 10);
  const outPath = process.env.OUT || '/tmp/spoilgate-sweep.json';
  const runs = [];
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of seeds) {
      const end = await oneRun(pid, seed, days);
      runs.push(Object.assign({ label, policy: pid }, end));
      console.log(`  [${pid} s${seed}] days=${end.days} end=${end.endReason} spoiledTakes=${end.spoiledTakes} pantryTakes=${end.pantryTakes} beats=${end.spoilgateBeats} kcalFrac=${end.scholarKcalFrac} starveD=${end.starveDays} wave=${end.waveReach} nat=${end.national} table=${end.table} won=${end.won} (${end.ms}ms)`);
    }
  }
  const agg = {};
  for (const pid of Object.keys(POLICIES)) agg[pid] = aggOf(runs.filter(r => r.policy === pid));
  agg.all = aggOf(runs);
  fs.writeFileSync(outPath, JSON.stringify({ label, seeds, days, gate: process.env.SPOILGATE || 'off', runs, agg, generated: new Date().toISOString() }, null, 1));
  console.log('\n' + JSON.stringify(agg.all, null, 1));
  console.log('wrote ' + outPath);
})();
