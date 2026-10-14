#!/usr/bin/env node
// sweep-learnfirst-20261014.js — before/after pilot for the LEARN-FIRST arm.
// Identical seeds x leadfeast-wrapper, 180d death-aware horizon.
//
// Env:
//   SEEDS="11,22,33,44,55,66,77,88"  DAYS=180  LEVER="label"
//   LEARNFIRST=1      -> ARMED (engagement judgment on)
//   (unset)           -> BASELINE (pure delegation — the RED pin)
//   OUT=/tmp/lf.json PERSEED_DIR=evidence/2026-10-14/perseed-lf-armed
//   SMOKE=1           -> instrument-honesty gate only (no sweep)
//
// Pre-registered (evidence header, docs/MEASUREMENT.md §§9–12, 14):
//   PRIMARY: player combat death share (armed) <= baseline - 15pp.
//     player combat death = telemetry death with player:true and cause in
//     {combat, ambush, raid, raid-defense, patrol combat, villager combat}.
//   GUARDRAILS: median survival >= baseline-5d; national >= baseline-4;
//     wave-5 unlocks >= baseline-1; no new death mode (armed player-death
//     causes ⊆ baseline causes).
//   FEASTSCALE_R13 is unset in BOTH arms (pure leadfeast baseline — the
//   layer is the only difference).
//
// Usage:
//   SMOKE=1 node scripts/sweep-learnfirst-20261014.js
//   LEVER=learnfirst-baseline SEEDS="11,22,33,44,55,66,77,88" DAYS=180 \
//     OUT=/tmp/lf-base.json PERSEED_DIR=evidence/2026-10-14/perseed-lf-base \
//     node scripts/sweep-learnfirst-20261014.js
//   LEARNFIRST=1 LEVER=learnfirst-armed ... (same, different OUT/PERSEED_DIR)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { learnfirst } = require('./policies/learnfirst');

const ARMED = process.env.LEARNFIRST === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const PLAYER_COMBAT_CAUSES = new Set(['combat', 'ambush', 'raid', 'raid-defense', 'patrol combat', 'villager combat']);

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function stdSnap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

// INSTRUMENT-HONESTY GATE: the policy genuinely drives, and the layer's
// engagement judgment actually fires on a losing-race fixture (armed) or
// stays fully inert (baseline).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('policy.daily is a function', typeof learnfirst.daily === 'function', 'typeof=' + typeof learnfirst.daily);
  check('policy.fight is a function', typeof learnfirst.fight === 'function', 'typeof=' + typeof learnfirst.fight);
  check('policy id', learnfirst.id === 'learnfirst', 'id=' + learnfirst.id);
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }

  // live smoke: the harness invokes daily and the policy acts
  {
    let dailyCalls = 0;
    const policy = Object.assign({}, learnfirst, { daily(G, ctx) { dailyCalls++; return learnfirst.daily(G, ctx); } });
    const { Game } = await loadGame({ seed: 11, mode: 'learnfirst-smoke' });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, sampleEvery: 10 }); });
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    let policyActs = 0;
    try {
      for (const row of (result.pacing.perDay || [])) {
        for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
      }
    } catch (e) {}
    check('harness invoked policy.daily (15d)', dailyCalls > 0, `dailyCalls=${dailyCalls} days=${result.days}`);
    check('policyCalls pacing > 0', meanCalls > 0, `mean=${meanCalls}/day`);
    check('>=1 policy-origin deliberate act', policyActs > 0, `policyActs=${policyActs}`);
  }

  // layer honesty on a losing-race fixture (turtle, wild node — the proof's scenario A)
  {
    const { Game } = await loadGame({ seed: 11, mode: 'learnfirst-smoke-lf' });
    await setupGame(Game);
    const ctx = {};
    const s = Game.state.scholar;
    s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.map.px = 3; Game.map.py = 3;
    Game.say = () => {};
    Game.startCombat('speedbump_turtle');
    const f = Game.tbfight;
    const mo = f.fighters.find(x => x.kind === 'monster');
    mo.hp = 60; mo.maxHp = 60;
    const p0 = Game.tbFighter('p');
    p0.hp = 100; p0.maxHp = 100; p0.alive = true; p0.mx = 4; p0.my = 4;
    let calls = 0;
    while (Game.tbfight && !Game.tbfight.over && calls++ < 30 && !Game.over) {
      if (!Game.tbIsPlayerTurn()) break;
      if (!learnfirst.fight(Game, ctx)) break;
    }
    if (ARMED) {
      check('armed: losing race refused on the fixture', (ctx.lfRefused || 0) >= 1, `lfRefused=${ctx.lfRefused || 0}`);
      check('armed: observation recorded', (ctx.lfObserved || 0) >= 1, `lfObserved=${ctx.lfObserved || 0}`);
    } else {
      check('baseline: layer inert on the fixture (no lf counters)',
        !(ctx.lfRefused || ctx.lfProbed || ctx.lfPartyEngaged),
        `lfRefused=${ctx.lfRefused || 0} lfProbed=${ctx.lfProbed || 0}`);
    }
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policy drives, layer ' + (ARMED ? 'fires' : 'inert') + ' — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const label = process.env.LEVER || (ARMED ? 'learnfirst-armed' : 'learnfirst-baseline');
  const outPath = process.env.OUT;
  const perseedDir = process.env.PERSEED_DIR;
  if (perseedDir) { try { fs.mkdirSync(perseedDir, { recursive: true }); } catch (e) {} }

  const runs = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'learnfirst-' + (ARMED ? 'armed' : 'base') });
    await setupGame(Game);
    const ctxHolder = {};
    const hist = { maxRank: 0, maxArc: 1, everTable: false };
    const baseDaily = learnfirst.daily;
    const policy = Object.assign({}, learnfirst, {
      daily(G, ctx) {
        ctxHolder.ctx = ctx;
        try {
          const sn = stdSnap(G);
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[sn.rank] || 0);
          hist.maxArc = Math.max(hist.maxArc, sn.arc || 1);
          if (sn.tableWaiting) hist.everTable = true;
        } catch (e) {}
        return baseDaily(G, ctx);
      },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 10 }); });
    const end = stdSnap(Game);
    const c = ctxHolder.ctx || {};
    const deaths = {};
    const playerDeaths = [];
    try {
      for (const d of (result.samples.deaths || [])) {
        const k = String(d.cause || d.kind || 'unknown');
        deaths[k] = (deaths[k] || 0) + 1;
        if (d.player) playerDeaths.push(k);
      }
    } catch (e) {}
    const playerCombatDeaths = playerDeaths.filter(k => PLAYER_COMBAT_CAUSES.has(k)).length;
    let exiled = 0;
    try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
    const r = {
      policy: 'learnfirst', armed: ARMED ? 1 : 0, seed,
      days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      won: end.won ? 1 : 0,
      waveReach: result.maxWaveUnlocked || 1,
      maxArc: hist.maxArc,
      maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
      national: hist.maxRank >= 2 ? 1 : 0,
      table: hist.everTable || end.tableWaiting ? 1 : 0,
      exiled,
      deaths, playerDeaths: playerDeaths.length, playerCombatDeaths,
      playerDeathCauses: playerDeaths,
      // layer telemetry
      lfRefused: c.lfRefused || 0, lfProbed: c.lfProbed || 0, lfGoodOdds: c.lfGoodOdds || 0,
      lfPartyEngaged: c.lfPartyEngaged || 0, lfObserved: c.lfObserved || 0, lfTaught: c.lfTaught || 0,
      lfBarrierPushes: c.lfBarrierPushes || 0, lfRefuseWalks: c.lfRefuseWalks || 0,
      lfRefuseHeld: c.lfRefuseHeld || 0, lfProbeStrikes: c.lfProbeStrikes || 0,
      fled: c.fled || 0, struck: c.struck || 0,
    };
    runs.push(r);
    if (perseedDir) {
      try {
        fs.writeFileSync(path.join(perseedDir, `learnfirst-${ARMED ? 'armed' : 'base'}-s${seed}.json`),
          JSON.stringify({ seed, national: r.national, table: r.table, wins: r.won, exiled: r.exiled, days: r.days, waveReach: r.waveReach, playerDeaths: r.playerDeaths, playerCombatDeaths: r.playerCombatDeaths }, null, 1));
      } catch (e) {}
    }
    console.log(`  [seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} arc=${r.maxArc} rank=${r.maxRank} nat=${r.national} pDeaths=${r.playerDeaths} pCombat=${r.playerCombatDeaths} refused=${r.lfRefused} probed=${r.lfProbed} goodOdds=${r.lfGoodOdds} party=${r.lfPartyEngaged}`);
  }

  const daysArr = runs.map(r => r.days).sort((a, b) => a - b);
  const median = daysArr.length ? daysArr[Math.floor(daysArr.length / 2)] : 0;
  const totPD = runs.reduce((t, r) => t + r.playerDeaths, 0);
  const totPCD = runs.reduce((t, r) => t + r.playerCombatDeaths, 0);
  const deathTotals = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + v;
  const report = {
    label, seeds, days, armed: ARMED ? 1 : 0,
    n: runs.length,
    won: runs.reduce((t, r) => t + r.won, 0),
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    exiled: runs.reduce((t, r) => t + r.exiled, 0),
    wave5: runs.filter(r => r.waveReach >= 5).length,
    maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
    maxArc: Math.max.apply(null, runs.map(r => r.maxArc).concat([1])),
    medianDays: median, maxDays: daysArr.length ? daysArr[daysArr.length - 1] : 0,
    playerDeaths: totPD, playerCombatDeaths: totPCD,
    playerCombatShare: totPD ? +(totPCD / totPD).toFixed(3) : null,
    deaths: deathTotals,
    lf: {
      refused: runs.reduce((t, r) => t + r.lfRefused, 0),
      probed: runs.reduce((t, r) => t + r.lfProbed, 0),
      goodOdds: runs.reduce((t, r) => t + r.lfGoodOdds, 0),
      partyEngaged: runs.reduce((t, r) => t + r.lfPartyEngaged, 0),
      observed: runs.reduce((t, r) => t + r.lfObserved, 0),
      taught: runs.reduce((t, r) => t + r.lfTaught, 0),
      pushes: runs.reduce((t, r) => t + r.lfBarrierPushes, 0),
      walks: runs.reduce((t, r) => t + r.lfRefuseWalks, 0),
    },
    runs,
    generated: new Date().toISOString(),
  };
  console.log(`\n=== ${label} ===  seeds=[${seeds.join(',')}] days=${days} armed=${ARMED}`);
  console.log(`n=${report.n} won=${report.won} national=${report.national} table=${report.table} wave5=${report.wave5} maxWave=${report.maxWave} maxArc=${report.maxArc} medianDays=${report.medianDays}`);
  console.log(`playerDeaths=${totPD} playerCombatDeaths=${totPCD} playerCombatShare=${report.playerCombatShare}`);
  console.log(`lf: refused=${report.lf.refused} probed=${report.lf.probed} goodOdds=${report.lf.goodOdds} party=${report.lf.partyEngaged} observed=${report.lf.observed} taught=${report.lf.taught} pushes=${report.lf.pushes}`);
  console.log('deaths: ' + (Object.entries(deathTotals).map(([k, v]) => `${k}:${v}`).join(', ') || '-'));
  if (outPath) { fs.writeFileSync(outPath, JSON.stringify(report, null, 1)); console.log('wrote ' + outPath); }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
