#!/usr/bin/env node
// scripts/run-rearmlat-20261016.js — the sim-rearmlat-b sweep driver
// (loop B, 2026-10-16, food-economy axis; #385/#386 successor re-arm latency
// census).
//
// 16 fresh-seed runs: seeds [103,214,325,436,547,658,769,880] x
// {leadfeast, belongfeast} on the courtship substrate (FEASTSCALE_R13=1,
// SEATDRIVE=0 explicit — the seat driver default flipped ON in c004b9dd and
// this axis runs the pre-seat substrate), 180d death-aware, REARMLAT=1
// instrument. Zero src/js changes, zero policy behavior changes.
//
// Per run: loadGame + setupGame, installRearmLat, wrap policy.daily to call
// track.dawn(Game) first (and track reachability maxima), runDays, final
// track.dawn (the last night), finalize, uninstall. Writes per-seed JSONs
// (full wall-metric key set) to evidence/2026-10-16/perseed-rearmlat/ and
// prints the re-arm census table.
//
// Pre-registration (binding, MEASUREMENT §§9-12,14):
//   PRIMARY GO: >= 95% of successor trust-ledger re-arm events attributed,
//   each with (1) mantle-to-arm latency, (2) dated-voluntary arm status,
//   (3) meal share at arming, (4) cold-shoulder fire-vs-dated-ledger
//   agreement.
//   Reported (not scored): re-arm latency distribution on fresh seeds;
//   meal-driven vs voluntary-take-driven re-arm share; cold-shoulder
//   trigger agreement rate; sense-read of the cold-shoulder beat in
//   transcript context on 2-3 runs.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save
// never stubbed). Never run concurrent jest.
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [103, 214, 325, 436, 547, 658, 769, 880];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-rearmlat');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1 required (shared-baseline substrate).');
  process.exit(2);
}
process.env.SEATDRIVE = '0';   // explicit pre-seat substrate (c004b9dd default-ON)
process.env.REARMLAT = '1';

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { installRearmLat } = require('./rearmlat-20261016');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICIES = { leadfeast, belongfeast };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function snap(Game) {
  const o = { rank: 'village', arc: 1, tableWaiting: false, tableEntered: false, won: false, exiled: false, wave: 1 };
  try { o.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; o.arc = pg.arc || 1; o.tableWaiting = !!pg.tableWaiting; o.tableEntered = !!pg.tableDone; } catch (e) {}
  try { o.won = !!Game.won; } catch (e) {}
  try { o.exiled = !!(Game.justiceExiled && Game.justiceExiled()); } catch (e) {}
  return o;
}

async function oneRun(pid, seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'rl-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const track = installRearmLat(Game);
  if (!track.on) throw new Error('instrument did not arm (REARMLAT=1)');
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1, everExiled: false };
  const od = base.daily;
  policy.daily = (G, ctx) => {
    track.dawn(G);
    try {
      const s = snap(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
      if (s.exiled) hist.everExiled = true;
    } catch (e) {}
    if (od) { try { return od(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
  try { track.dawn(Game); } catch (e) {} // row the final night
  const fin = track.finalize();
  track.uninstall();
  const end = snap(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  try { hist.maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  const rankMax = Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0);
  return {
    policy: pid, seed, days: result.days, endReason: result.endReason,
    // full wall-metric key set (schema-drift guard)
    national: rankMax >= 2 ? 1 : 0,
    table: hist.everTable || end.tableWaiting ? 1 : 0,
    wins: end.won ? 1 : 0,
    exiled: hist.everExiled || end.exiled ? 1 : 0,
    entered: hist.everEntered || end.tableEntered ? 1 : 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave,
    deaths,
    rearm: fin,
  };
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const runs = [];
  const t0 = process.hrtime.bigint();
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      console.log(`-- ${pid} s${seed}`);
      const r = await oneRun(pid, seed);
      fs.writeFileSync(path.join(OUTDIR, `${pid}-s${seed}.json`), JSON.stringify(r, null, 1));
      runs.push(r);
    }
  }
  const dt = Number(process.hrtime.bigint() - t0) / 1e9;
  console.log(`\nsweep wall: ${dt.toFixed(0)}s for ${runs.length} runs`);

  // census table
  console.log('\npolicy/seed | days | W | nat | tbl | exl | wave | nRe | nAttr | meal | latMed | nCS | agree');
  for (const r of runs) {
    const a = r.rearm.aggregate || {};
    const cs = r.rearm.coldShoulder || {};
    console.log(`${r.policy}/${r.seed} | ${r.days} | ${r.wins} | ${r.national} | ${r.table} | ${r.exiled} | ` +
      `${r.maxWave} | ${a.nRearmEvents} | ${a.nAttributed} | ${a.nMealDriven} | ` +
      `${a.latency && a.latency.median} | ${cs.nFirings} | ` +
      `${cs.agreementRate7 == null ? 'n/a' : cs.agreementRate7.toFixed(2)}`);
  }

  // pooled summary
  const armed = [], fir = [];
  let attr = 0, meal = 0, agreed = 0;
  for (const r of runs) {
    for (const e of ((r.rearm.rearms || []).filter(x => x.rearmed))) { armed.push(e); if (e.attributed) attr++; if (e.driver === 'meal') meal++; }
    for (const f of ((r.rearm.coldShoulder || {}).firings || [])) { fir.push(f); if (f.agreed7 === true) agreed++; }
  }
  const lat = armed.map(e => e.latency).sort((x, y) => x - y);
  const hist = {};
  for (const l of lat) hist[l] = (hist[l] || 0) + 1;
  const summary = {
    nRuns: runs.length,
    primary: { nRearmEvents: armed.length, nAttributed: attr,
      rate: armed.length ? attr / armed.length : null, go: armed.length > 0 && attr / armed.length >= 0.95 },
    latencyDist: { min: lat[0], max: lat[lat.length - 1],
      median: lat.length ? lat[Math.floor(lat.length / 2)] : null, hist },
    drivers: { mealDriven: meal, voluntaryDriven: armed.length - meal,
      mealShare: armed.length ? meal / armed.length : null },
    coldShoulder: { nFirings: fir.length, nAgreed7: agreed,
      agreementRate7: fir.length ? agreed / fir.length : null },
    wall: {
      national: runs.reduce((s, r) => s + r.national, 0),
      table: runs.reduce((s, r) => s + r.table, 0),
      wins: runs.reduce((s, r) => s + r.wins, 0),
      exiled: runs.reduce((s, r) => s + r.exiled, 0),
      wave4: runs.filter(r => r.maxWave >= 4).length,
      wave5: runs.filter(r => r.maxWave >= 5).length,
      medianSurvival: (() => { const d = runs.map(r => r.days).sort((a, b) => a - b); return d[Math.floor(d.length / 2)]; })(),
      maxSurvival: Math.max(...runs.map(r => r.days)),
    },
  };
  fs.writeFileSync(path.join(OUTDIR, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('\nPOOLED: ' + JSON.stringify(summary, null, 1));
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
