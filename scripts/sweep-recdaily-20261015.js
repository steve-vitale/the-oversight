#!/usr/bin/env node
// scripts/sweep-recdaily-20261015.js — pilot driver for the recdaily arm
// (scale-onramp, courtship road).
//
// Modes (--mode control|armed|detgate):
//   control — base road through the same instrument, gate OFF (RECDAILY
//     unset): the r37/r38 "own control in the same sweep" substrate.
//   armed   — base + recdaily layer, RECDAILY=1.
//   detgate — gate-off wrapper vs raw base, 16/16 byte-identical rows.
//
// Kill protocol: if scripts/policies/recdaily.js is absent, armed/detgate
// refuse LOUD (exit 2); control still runs (exit 0).
//
// Sets (--set L|B): L = leadcourt+FOURTHLINK=1, seeds 11/22/33/44/55/66/77/88;
// B = belongseek, same seeds. Horizon: 180d death-aware (harness stop tail).
//
// Output: evidence/2026-10-15/sim-recdaily-{control,armed,detgate}-{L,B}.json
// with FLAT top-level aggregates (the r36/r38 telemetry-check fix):
// medianDays, national, table, wins, wave4, wave5, exiled + per-seed rows.
'use strict';
const fs = require('fs');
const path = require('path');

const LAYER_PATH = path.join(__dirname, 'policies', 'recdaily.js');
const EVID_DIR = path.join(__dirname, '..', 'evidence', '2026-10-15');

function usage(msg) {
  if (msg) console.error('FATAL: ' + msg);
  console.error('usage: node scripts/sweep-recdaily-20261015.js --mode control|armed|detgate --set L|B [--out PATH]');
  process.exit(msg ? 1 : 0);
}

const argv = process.argv.slice(2);
function arg(name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}
const mode = arg('--mode');
const set = arg('--set');
if (!['control', 'armed', 'detgate'].includes(mode)) usage('bad --mode');
if (!['L', 'B'].includes(set)) usage('bad --set');

const layerGone = !fs.existsSync(LAYER_PATH);
if (layerGone && (mode === 'armed' || mode === 'detgate')) {
  console.error(`REFUSE: scripts/policies/recdaily.js absent (killed arm) — ${mode} mode cannot run.`);
  process.exit(2);
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// FOURTHLINK=1 for the lead set (fourthlink reads env at require time;
// recdaily requires fourthlink at its own load — set before both).
if (set === 'L') process.env.FOURTHLINK = '1';
if (mode === 'armed') process.env.RECDAILY = '1';
else delete process.env.RECDAILY;

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { withRecdaily } = layerGone ? {} : require(LAYER_PATH);
const { fourthlink } = require('./policies/fourthlink');
const { belongseek } = require('./policies/belongseek');
const basePolicy = set === 'L' ? fourthlink : belongseek;
const SET_NAME = set === 'L' ? 'leadcourt+FOURTHLINK=1' : 'belongseek';

// Unwrap guard (the 2026-10-14 lesson).
for (const [nm, p] of [['base', basePolicy]]) {
  if (typeof p.daily !== 'function') {
    console.error(`FATAL: unwrap — ${nm} policy.daily is not a function`);
    process.exit(1);
  }
}

// Instrument: snapshot per day (table/national reach need history) + grab ctx
// for the layer's counters (ctx is not returned by runDays).
function instrument(policy) {
  const holder = { ctx: null, maxRank: 0, maxArc: 1, everTable: false };
  const p = Object.assign({}, policy);
  const snap = (G) => {
    try {
      const r = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
      holder.maxRank = Math.max(holder.maxRank, RANK_ORDER[r] || 0);
    } catch (e) {}
    try { const pg = G.progState ? G.progState() : {}; holder.maxArc = Math.max(holder.maxArc, pg.arc || 1); if (pg.tableWaiting) holder.everTable = true; } catch (e) {}
  };
  const od = policy.daily, ou = policy.upkeep, os = policy.setup;
  if (od) p.daily = (G, ctx) => { holder.ctx = ctx; snap(G); return od(G, ctx); };
  if (ou) p.upkeep = (G, ctx) => { holder.ctx = ctx; return ou(G, ctx); };
  if (os) p.setup = (G, ctx) => { holder.ctx = ctx; return os(G, ctx); };
  p._holder = holder;
  return p;
}

function stableRow(o) {
  // Fixed key order + sorted death keys: genuinely byte-comparable rows.
  const deaths = {};
  for (const k of Object.keys(o.deaths || {}).sort()) deaths[k] = o.deaths[k];
  return {
    seed: o.seed, days: o.days, endReason: o.endReason,
    won: o.won, waveReach: o.waveReach, maxArc: o.maxArc,
    national: o.national, table: o.table, exiled: o.exiled,
    deaths, extra: o.extra || {},
  };
}

async function runOne(seed, policyFactory, label) {
  const { Game, manifest } = await loadGame({ seed, mode: 'recdaily-' + label, fullTelemetry: false });
  await setupGame(Game);
  const policy = instrument(policyFactory());
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  const holder = policy._holder;
  const ctx = holder.ctx || {};
  const deaths = {};
  let exiled = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
    if (/exile/i.test(k)) exiled = 1;
  }
  let won = 0, table = 0;
  try { won = Game.won ? 1 : 0; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting) holder.everTable = true; } catch (e) {}
  table = holder.everTable ? 1 : 0;
  const extra = {};
  for (const k of ['_recWindows', '_recReleased', '_recFortifyDays', '_recDeclined', '_recWalkHops']) {
    if (typeof ctx[k] === 'number') extra[k.replace(/^_rec/, 'rec')] = ctx[k];
  }
  if (ctx._recReleaseCond) {
    for (const [k, v] of Object.entries(ctx._recReleaseCond)) extra['recRelease_' + k] = v;
  }
  const row = stableRow({
    seed, days: result.days, endReason: result.endReason,
    won, waveReach: result.maxWaveUnlocked || 1, maxArc: holder.maxArc,
    national: holder.maxRank >= 2 ? 1 : 0, table, exiled, deaths, extra,
  });
  console.log(`  [${label} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} nat=${row.national} tab=${row.table} won=${row.won} extra=${JSON.stringify(row.extra)}`);
  return row;
}

function aggregate(setName, modeName, rows) {
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : 0;
  const sum = k => rows.reduce((t, r) => t + (r[k] || 0), 0);
  const extraSums = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.extra || {})) {
    if (typeof v === 'number') extraSums[k] = (extraSums[k] || 0) + v;
  }
  return {
    set: setName, mode: modeName, seeds: SEEDS, n: rows.length,
    medianDays: median, maxDays: days.length ? days[days.length - 1] : 0,
    national: sum('national'), table: sum('table'), wins: sum('won'),
    wave4: rows.filter(r => r.waveReach >= 4).length,
    wave5: rows.filter(r => r.waveReach >= 5).length,
    exiled: sum('exiled'),
    extra: extraSums,
    runs: rows,
    generated: new Date().toISOString(),
  };
}

async function main() {
  const label = `${mode}-${set}`;
  console.log(`recdaily sweep: mode=${mode} set=${set} (${SET_NAME}) seeds=${SEEDS.join(',')} days=${DAYS}`);

  if (mode === 'detgate') {
    // Gate-off wrapper vs raw base: 16/16 byte-identical rows.
    let identical = 0, total = 0;
    const rows = [];
    for (const seed of SEEDS) {
      const a = await runOne(seed, () => withRecdaily(basePolicy, 'detgate'), 'wrap-off');
      const b = await runOne(seed, () => basePolicy, 'raw-base');
      total++;
      const sa = JSON.stringify(a), sb = JSON.stringify(b);
      if (sa === sb) { identical++; console.log(`  [seed ${seed}] BYTE-IDENTICAL`); }
      else console.log(`  [seed ${seed}] DIFFER`);
      rows.push({ seed, identical: sa === sb });
    }
    console.log(`DETGATE: ${identical}/${total} byte-identical rows`);
    const out = arg('--out') || path.join(EVID_DIR, `sim-recdaily-detgate-${set}.json`);
    fs.writeFileSync(out, JSON.stringify({ set: SET_NAME, mode: 'detgate', identical, total, rows }, null, 1));
    console.log('wrote ' + out);
    process.exit(identical === total ? 0 : 1);
  }

  const factory = mode === 'armed'
    ? () => withRecdaily(basePolicy, 'recdaily-' + set)
    // Gate OFF: the same instrument when the layer exists; the raw base
    // post-kill (the instrument IS the gate-off wrapper — with the layer
    // gone there is nothing to wrap, and the base is the control).
    : (layerGone ? () => basePolicy : () => withRecdaily(basePolicy, 'control-' + set));
  const rows = [];
  for (const seed of SEEDS) rows.push(await runOne(seed, factory, label));

  // A/A determinism spot (control only): seed 11 twice — identical rows.
  if (mode === 'control') {
    const again = await runOne(11, factory, label + '-aa');
    const same = JSON.stringify(again) === JSON.stringify(rows[0]);
    console.log(`A/A seed 11 x2: ${same ? 'IDENTICAL' : 'DIFFER'}`);
    if (!same) { console.error('FATAL: A/A determinism spot failed'); process.exit(1); }
  }

  const report = aggregate(SET_NAME, mode, rows);
  console.log(`\nAGG ${label}: n=${report.n} median=${report.medianDays}d max=${report.maxDays}d national=${report.national} table=${report.table} wins=${report.wins} w4=${report.wave4} w5=${report.wave5} exiled=${report.exiled}`);
  console.log(`  extra sums: ${JSON.stringify(report.extra)}`);
  const out = arg('--out') || path.join(EVID_DIR, `sim-recdaily-${mode}-${set === 'L' ? 'L' : 'B'}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('wrote ' + out);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
