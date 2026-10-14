#!/usr/bin/env node
// sweep-packbank-20261014.js — PACK-BANKING policy arm pilot sweep.
//
// sim-findings #161 follow-up: the batchpolicy arm proved the batch press
// never fires (0/120 hook-pool days); this arm banks raw in the pack so the
// batch channel has a pool. scripts/policies/packbank.js (PACKBANK=1,
// default OFF) wraps leadcourt/belongseek; the press fires at the daily hook
// when the bank reaches PACKBANK_KCAL.
//
// PRE-REGISTERED (MEASUREMENT.md §§9-12, 14 — binding):
// - Road: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
//   death-aware, identical seeds control vs armed. Control: PACKBANK unset
//   (wrapper passthrough — reproduces the batchpolicy RED: cookAllCalls=0).
// - PRIMARY (mechanism): batch-eligible raw items present at the daily hook
//   on >= 50% of measured days AND batch cooks firing >= 1/week on average
//   (armed).
// - GUARDRAILS: median survival >= control-10d (report-only); starvation
//   deaths report; banked-raw rot kcal reported honestly (if the bank wastes
//   more than it cooks, that IS the finding).
// - GO on primary + guardrails, else KILL per §14. A real-but-neutral
//   mechanism is a GO for the instrument (diagnostic arm — not a wall lever).
//
// Usage: SIDE=before|after SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=/tmp/packbank-<side>.json \
//   node scripts/sweep-packbank-20261014.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
// KILL PROTOCOL (packbank NO-GO at pilot 2026-10-14): the banking layer was
// deleted after the pilot killed the arm. Degrade gracefully so the retained
// sweep documents the pre-kill measurement instead of crashing on the missing
// module (cf. takedisc kill-protocol MODULE_NOT_FOUND hazard).
let pb = null;
try { pb = require('./policies/packbank'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: packbank layer deleted per kill protocol (NO-GO at pilot); pilot was 16+16 runs, primary 0.000/0.00 — see evidence/2026-10-14/sim-packbank-b.md');
    process.exit(0);
  }
  throw e;
}
const { packbankLead, packbankBelong } = pb;

const POLICIES = { leadcourt: packbankLead, belongseek: packbankBelong };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(pid, seed, days, label) {
  const base = POLICIES[pid];
  const { Game } = await loadGame({ seed, mode: 'packbank-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = { cookAllCalls: 0, cleanedArrivals: 0, deaths: [] };

  // Count EVERY cookAll call, whoever makes it (proves the before side truly
  // never presses — the policy wrapper also counts its own).
  const oCookAll = Game.cookAll;
  if (typeof oCookAll === 'function') Game.cookAll = function () {
    W.cookAllCalls++;
    return oCookAll.apply(this, arguments);
  };
  // Flow measurement: cleaned meat entering the pack (the bank's only field flow).
  const oC2M = Game.carcassToMeat;
  if (typeof oC2M === 'function') Game.carcassToMeat = function (inv, i, knows) {
    const r = oC2M.apply(this, arguments);
    try {
      const it = inv[i];
      if (it && it.foodKind === 'meat' && it.foodState === 'cleaned' && (it.kcalEach || 0) > 0) W.cleanedArrivals++;
    } catch (e) {}
    return r;
  };
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try { W.deaths.push({ day: (Game.state.scholar || {}).day || 0, cause: String((opts && opts.cause) || '?').slice(0, 28) }); } catch (e) {}
    return oDie.apply(this, arguments);
  };

  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false };
  const ctxRef = {};
  const origDaily = base.daily;
  // NOTE (sim-findings instrumentation lesson): sample BEFORE delegating;
  // runDays discards daily's return, so no `return` may precede instrumentation.
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      Object.assign(ctxRef, { hookDays: ctx.hookDays || 0, hookPoolDays: ctx.hookPoolDays || 0,
        bankTagged: ctx.bankTagged || 0, bankTagKcal: ctx.bankTagKcal || 0,
        batchPresses: ctx.batchPresses || 0, batchKcal: ctx.batchKcal || 0,
        bankRotKcal: ctx.bankRotKcal || 0, bankReleased: ctx.bankReleased || 0 });
    } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const end = stdSnapshot(Game);
  let exiled = 0;
  try { exiled = Object.keys((Game.state.village || {}).severed || {}).length; } catch (e) {}
  const saySample = [];
  try {
    for (const l of (Game._packbankSayLines || [])) {
      if (saySample.length >= 6) break;
      if (/Cooked \d+|from the hunt|went bad|Not enough clean water|scorched/.test(l)) saySample.push(l.slice(0, 120));
    }
  } catch (e) {}
  const vd = result.days || 1;
  const starveDeaths = W.deaths.filter(d => /starv/i.test(d.cause)).length;
  return { label, policy: pid, seed, days: result.days, endReason: result.endReason,
    won: end.won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
    wave4: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0, wave5: (result.maxWaveUnlocked || 1) >= 5 ? 1 : 0,
    maxArc: hist.maxArc, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0, exiled,
    cookAllCalls: W.cookAllCalls, cleanedArrivals: W.cleanedArrivals,
    hookDays: ctxRef.hookDays || 0, hookPoolDays: ctxRef.hookPoolDays || 0,
    bankTagged: ctxRef.bankTagged || 0, bankTagKcal: ctxRef.bankTagKcal || 0,
    batchPresses: ctxRef.batchPresses || 0, batchKcal: ctxRef.batchKcal || 0,
    bankRotKcal: ctxRef.bankRotKcal || 0, bankReleased: ctxRef.bankReleased || 0,
    poolShare: ctxRef.hookDays ? +((ctxRef.hookPoolDays || 0) / ctxRef.hookDays).toFixed(3) : 0,
    pressesPerWeek: +(((ctxRef.batchPresses || 0) / vd) * 7).toFixed(2),
    starveDeaths, deathCauses: W.deaths.map(d => d.cause), saySample };
}

(async () => {
  const side = process.env.SIDE === 'after' ? 'after' : 'before';
  const label = 'packbank-' + side;
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outPath = process.env.OUT || ('/tmp/packbank-' + side + '.json');
  if (side === 'after') process.env.PACKBANK = '1';
  else delete process.env.PACKBANK;
  console.log(`side=${side} PACKBANK=${process.env.PACKBANK || '(unset)'} seeds=[${seeds.join(',')}] days=${days}`);
  const runs = [];
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of seeds) {
      const r = await oneRun(pid, seed, days, label);
      runs.push(r);
      console.log(`  [${pid} seed ${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} nat=${r.national} tab=${r.table} won=${r.won} ` +
        `cookAll=${r.cookAllCalls} cleanedArr=${r.cleanedArrivals} pool=${r.hookPoolDays}/${r.hookDays} press=${r.batchPresses} (${r.pressesPerWeek}/wk) ` +
        `batchKcal=${r.batchKcal} bankRot=${r.bankRotKcal} starve=${r.starveDeaths}`);
    }
  }
  const agg = {};
  for (const pid of Object.keys(POLICIES)) {
    const rs = runs.filter(r => r.policy === pid);
    const darr = rs.map(r => r.days).sort((a, b) => a - b);
    const totHook = rs.reduce((t, r) => t + r.hookDays, 0);
    const totPool = rs.reduce((t, r) => t + r.hookPoolDays, 0);
    const totDays = rs.reduce((t, r) => t + r.days, 0);
    const totPress = rs.reduce((t, r) => t + r.batchPresses, 0);
    const totBatchKcal = rs.reduce((t, r) => t + r.batchKcal, 0);
    const totRot = rs.reduce((t, r) => t + r.bankRotKcal, 0);
    agg[pid] = { n: rs.length,
      cookAllCalls: rs.reduce((t, r) => t + r.cookAllCalls, 0),
      seedsFired: rs.filter(r => r.cookAllCalls > 0).map(r => r.seed),
      cleanedArrivals: rs.reduce((t, r) => t + r.cleanedArrivals, 0),
      poolShare: totHook ? +(totPool / totHook).toFixed(3) : 0,
      poolDays: totPool, hookDays: totHook,
      batchPresses: totPress,
      pressesPerWeek: totDays ? +((totPress / totDays) * 7).toFixed(2) : 0,
      batchKcal: totBatchKcal, bankRotKcal: totRot,
      bankTagged: rs.reduce((t, r) => t + r.bankTagged, 0),
      won: rs.reduce((t, r) => t + r.won, 0),
      national: rs.reduce((t, r) => t + r.national, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      wave4: rs.reduce((t, r) => t + r.wave4, 0),
      wave5: rs.reduce((t, r) => t + r.wave5, 0),
      exiled: rs.reduce((t, r) => t + r.exiled, 0),
      starveDeaths: rs.reduce((t, r) => t + r.starveDeaths, 0),
      medianDays: darr[Math.floor(darr.length / 2)],
      maxDays: darr[darr.length - 1],
      deathCauses: rs.flatMap(r => r.deathCauses).slice(0, 40),
      saySamples: rs.flatMap(r => r.saySample).slice(0, 12) };
  }
  fs.writeFileSync(outPath, JSON.stringify({ label, seeds, days, packbank: process.env.PACKBANK || null, runs, agg }, null, 1));
  console.log('\n' + JSON.stringify(agg, null, 1));
  console.log('wrote ' + outPath);
})().catch(e => { console.error('SWEEP ERROR', e); process.exit(2); });
