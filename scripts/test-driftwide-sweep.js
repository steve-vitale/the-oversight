#!/usr/bin/env node
// scripts/test-driftwide-sweep.js — sim-driftwide-a sweep
// (scale-onramp axis, 2026-10-26: WIDER bisect of the 0126Z ->
// current control drift. DIAG ONLY, zero game-code changes.)
//
// Question: which wider candidate explains the drift between
// the 0126Z band (base 8ea64d848: deaths 260, national-ever
// 6/8, starvation 9) and the current band (deaths 301,
// national-ever 8/8, starvation 2), same seeds/substrate?
// r54 is already EXONERATED; do not re-bisect it here.
//
// Columns (identical script, identical seeds, identical
// policy, identical src/js at this worktree's HEAD; the ONLY
// difference is the worktree's scripts/policies/competent.js,
// swapped by git show and restored with git checkout after):
//   colA = current HEAD competent.js (cook + fish fallbacks).
//   colB = base-era competent.js (8ea64d848, neither fallback).
//   colC = CONDITIONAL cook-only competent.js (3701dfa4a).
// Substrate: seeds 73671-73678, tableseat-nowait policy
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), 180d death-aware
// horizon (runDays stops on death/win; 180 is the cap).
// Recorder-free plain runs. The daily capture wrapper only
// READS snapshots and calls through to tableseatNowait.daily;
// it installs no recorder and wraps no Game method.
//
// Each row records competentSha (sha256 of scripts/policies/
// competent.js at run time) so the proof test can prove which
// policy variant each column actually ran under.
//
// Modes:
//   --one <colA|colB|colC> <seed> : run one seed, write its row.
//     RERUN=1 writes s<seed>-<col>-rerun.json instead.
//   --summary : build summary.json from the rows on disk.
//     colC is included only if all 8 colC rows exist.
//     Exit 1 only on an incomplete colA/colB corpus.
//   --detgate : run one seed twice, require identical rows.
//     Exit 1 on mismatch.
//
// Never edit existing policy/sweep files from here; this file
// only READS scripts/policies/tableseat-nowait.js (which in
// turn requires leanlinkrescue, which requires competent).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const TRAJECTORY = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc',
  'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered',
  'deathTotal', 'starvationDeaths'];

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function competentSha() {
  try { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'))).digest('hex'); }
  catch (e) { return null; }
}
function gitHead() {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO, encoding: 'utf8' }).trim(); }
  catch (e) { return null; }
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-driftwide-a'); }

async function runOne(col, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'driftwide-plain', fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const row = {
    policy: 'driftwide-' + col, column: col, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    competentSha: competentSha(),
    head: gitHead(),
  };
  if (evidDir) {
    const fn = path.join(evidDir, process.env.RERUN === '1' ? `s${seed}-${col}-rerun.json` : `s${seed}-${col}.json`);
    try {
      writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
      row.corpusFile = fn;
    } catch (e) {
      // Write-flap fallback (2026-10-26: container EPERM flap
      // truncates/blocks file writes intermittently): never lose
      // the computed row — emit it on stdout so the caller can
      // persist it exactly when the flap clears. The row on
      // stdout is byte-identical to the intended file body
      // (compact JSON here; the file form is pretty-printed).
      row.writeFailed = String((e && e.message) || e).slice(0, 120);
      console.log('ROWJSON ' + JSON.stringify(row));
    }
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
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
}

function matchesCurrent(b) {
  return b.deathTotal === 301 && b.nationalEver === 8 && b.nationalFinal === 5
    && b.table === 4 && b.entered === 4 && b.won === 4 && b.wave4 === 5
    && b.wave5 === 0 && b.medianDays === 143 && b.starvationTotal === 2;
}
function matches0126Z(b) {
  return b.deathTotal === 260 && b.nationalEver === 6 && b.nationalFinal === 5
    && b.table === 4 && b.entered === 4 && b.won === 4 && b.wave4 === 5
    && b.wave5 === 0 && b.medianDays === 143 && b.starvationTotal === 9;
}

async function oneMode(col, seedArg) {
  if (col !== 'colA' && col !== 'colB' && col !== 'colC') { console.error('column must be colA, colB or colC'); process.exit(2); }
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(col, seed, days, evidDir);
  console.log(`  [${col} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} compSha=${(row.competentSha || '').slice(0, 12)}`);
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const readCol = (col) => {
    const rows = [];
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${col}.json`);
      if (!fs.existsSync(p)) return null;
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    return rows;
  };
  const rowsA = readCol('colA'), rowsB = readCol('colB'), rowsC = readCol('colC');
  if (!rowsA || !rowsB) { console.error('SUMMARY: colA/colB corpus incomplete'); process.exit(1); }
  const bandA = aggregate(rowsA), bandB = aggregate(rowsB);
  const bandC = rowsC ? aggregate(rowsC) : null;
  const corpusOk = rowsA.every(r => r.days > 0 && r.competentSha) && rowsB.every(r => r.days > 0 && r.competentSha)
    && new Set(rowsA.map(r => r.competentSha)).size === 1
    && new Set(rowsB.map(r => r.competentSha)).size === 1
    && rowsA[0].competentSha !== rowsB[0].competentSha
    && (!rowsC || (new Set(rowsC.map(r => r.competentSha)).size === 1 && rowsC[0].competentSha !== rowsA[0].competentSha && rowsC[0].competentSha !== rowsB[0].competentSha));
  const report = {
    label: 'sim-driftwide-a', seeds: SEEDS, days,
    rowsA, rowsB, rowsC, bandA, bandB, bandC,
    colAMatchesCurrent: matchesCurrent(bandA),
    colBMatches0126Z: matches0126Z(bandB),
    colCMatchesCurrent: bandC ? matchesCurrent(bandC) : null,
    colCMatches0126Z: bandC ? matches0126Z(bandC) : null,
    corpusOk,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-driftwide-a ===');
  for (const [name, b] of [['colA', bandA], ['colB', bandB], ['colC', bandC]]) {
    if (!b) continue;
    console.log(`  ${name}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationTotal} deaths=${b.deathTotal}`);
  }
  console.log(`  colA==current: ${report.colAMatchesCurrent}  colB==0126Z: ${report.colBMatches0126Z}` + (bandC ? `  colC==current: ${report.colCMatchesCurrent}  colC==0126Z: ${report.colCMatches0126Z}` : '  colC: not run'));
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const a = await runOne('colA', seed, days, null);
  const b = await runOne('colA', seed, days, null);
  const same = TRAJECTORY.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]))
    && JSON.stringify(a.deaths) === JSON.stringify(b.deaths);
  console.log(`DETGATE seed=${seed} run1 days=${a.days} gameDays=${a.gameDays} deaths=${a.deathTotal} | run2 days=${b.days} gameDays=${b.gameDays} deaths=${b.deathTotal} trajectoryIdentical=${same} -> ${same ? 'PASS' : 'FAIL'}`);
  if (!same) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --one <colA|colB|colC> <seed> | --summary | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('DRIFTWIDE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, matchesCurrent, matches0126Z, TRAJECTORY, SEEDS };
