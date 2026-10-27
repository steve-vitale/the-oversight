#!/usr/bin/env node
// scripts/sweep-scalegate-a.js — sim-scalegate-a band (scale-onramp,
// run fleshout-20261027T1315Z): tableseat-nowait substrate, 8 fresh
// seeds, 180 loop-days death-aware, BEFORE vs AFTER the deedGateReady
// scale-enforcement change, on IDENTICAL seeds.
//
// Usage (run twice — once on the unmodified tree, once after the edit):
//   SEEDS="74101,...,74108" DAYS=180 LEG=before|after \
//     EVID=evidence/2026-10-27/perseed-scalegate-a \
//     node scripts/sweep-scalegate-a.js
// Per-seed rows are written incrementally to EVID/s<seed>-<leg>.json
// (retry loop; on total write failure the row JSON is printed to
// stdout first so data is never silently lost).
//
// Row fields judged by the prereg: won, bestSeatEver (full/lesser/none
// tracked daily via tableSeat()), table ever, entered, national
// ever/final, final deedGateReady breakdown, seat counters, deaths.
// The game code under test is NOT touched by this script: it only
// drives the tableseat-nowait policy and records what tableSeat()
// returns. A BEFORE/AFTER difference in bestSeat/won on a seed whose
// BEFORE seat was lesser (or none) is a REGRESSION signal; a full
// seat disappearing is the ruling working and is reported, not hidden.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEAT_ORDER = { none: 0, lesser: 1, full: 2 };
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }

function writeRow(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}

async function runOne(leg, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'scalegate-a-' + leg, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, bestSeat: 'none' };
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const pg = G.progState ? G.progState() : {};
        hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
        if (pg.tableWaiting) hist.everTable = true;
        if (pg.tableDone) hist.everEntered = true;
        const rk = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rk] || 0);
        const seat = (G.tableSeat ? G.tableSeat() : null) || {};
        if (SEAT_ORDER[seat.seat] > SEAT_ORDER[hist.bestSeat]) hist.bestSeat = seat.seat;
      } catch (e) {}
      if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const pg = Game.progState ? Game.progState() : {};
  const endRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village';
  const endSeat = (Game.tableSeat ? Game.tableSeat() : null) || {};
  let gate = null;
  try { gate = Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) { gate = { err: String(e && e.message || e).slice(0, 120) }; }
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const deaths = result.samples.deaths || [];
  const deathSummary = {};
  for (const d of deaths) { const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown'); deathSummary[k] = (deathSummary[k] || 0) + 1; }
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: 'tableseat-nowait', leg, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: endRank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[endRank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[endRank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || !!pg.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || !!pg.tableDone) ? 1 : 0,
    bestSeatEver: hist.bestSeat,
    finalSeat: endSeat.seat || 'none',
    finalGate: gate,
    deaths: deathSummary, deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${leg}.json`);
    writeRow(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function aggregate(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    fullSeats: rows.filter(r => r.bestSeatEver === 'full').length,
    lesserSeats: rows.filter(r => r.bestSeatEver === 'lesser').length,
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    seatTaken: rows.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rows.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
  };
}

async function main() {
  const leg = process.env.LEG || 'before';
  if (leg !== 'before' && leg !== 'after') throw new Error('LEG must be before|after');
  const seeds = (process.env.SEEDS || '74101,74102,74103,74104,74105,74106,74107,74108')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-scalegate-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    const row = await runOne(leg, seed, days, evidDir);
    rows.push(row);
    console.log(`  [${leg} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} bestSeat=${row.bestSeatEver} finalSeat=${row.finalSeat} won=${row.won} starv=${row.starvationDeaths} gateOk=${row.finalGate && row.finalGate.ok} gateRank=${row.finalGate && row.finalGate.rank}`);
  }
  console.log('AGGREGATE ' + leg + ' ' + JSON.stringify(aggregate(rows)));
  // G3 corpus integrity: every config produced a row, no zero-day rows.
  const bad = rows.filter(r => !r.days || r.days <= 0);
  if (bad.length || rows.length !== seeds.length) { console.error('G3 FAIL: rows=' + rows.length + ' expected=' + seeds.length); process.exit(1); }
}
main().catch(e => { console.error('SWEEP FAIL', (e && e.stack) || e); process.exit(1); });
