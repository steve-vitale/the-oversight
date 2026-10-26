#!/usr/bin/env node
// scripts/test-raidpool-sweep.js — sim-raidpool-a sweep
// (scale-onramp axis, 2026-10-26: adjudicate the raids/pool
// drift residue left open by sim-driftwide-a. DIAG ONLY, zero
// game-code changes, zero default flips.)
//
// Question: do the published raids/pool bands reproduce under
// ONE counting definition, identical across columns —
//   raids  = fired havenRaidTick calls (lastRaidDay changes),
//   raiders = sum of drafted raiders over fired raids,
//   pool   = sum of pre-call living pool sizes over fired raids
// (full definition in evidence/2026-10-26/sim-raidpool-a.md
// and scripts/policies/raidpool-diag.js)?
//
// Columns (identical script, identical seeds, identical
// policy, identical src/js at this worktree's HEAD; the ONLY
// difference is the worktree's scripts/policies/competent.js,
// swapped by git show and restored after, sha-verified):
//   colB = base-era competent.js (8ea64d848, digest 76abf6f3).
//   colC = cook-only competent.js (3701dfa4a, digest 926f87f9).
//   colA = current HEAD competent.js (digest b0adaacc).
// Substrate: seeds 73671-73678, tableseat-nowait policy
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), 180d death-aware
// horizon (runDays stops on death/win; 180 is the cap).
//
// Modes (ONE seed per invocation — background sweep sessions
// have vanished mid-run before; each row is verified by its
// caller before the next seed is spent):
//   --one <colA|colB|colC> <seed> <plain|wrapped> : run one
//     seed, write its row (wrapped: s<seed>-<col>.json;
//     plain: s<seed>-<col>-plain.json).
//   --detgate <colA|colB|colC> <seed> : recorder-neutrality
//     gate on one pilot seed — plain vs wrapped vs wrapped
//     rerun, compared on days/gameDays/won/deaths (full map)/
//     tsNationalDay. Writes s<seed>-<col>-plain.json,
//     s<seed>-<col>-detwrapped.json, s<seed>-<col>-detrerun.json.
//     Exit 1 on any mismatch. Run BEFORE that column's band.
//   --summary : build summary.json from the wrapped rows on
//     disk. Exit 1 on an incomplete corpus.
//
// Never edit existing policy/sweep files from here; this file
// only READS scripts/policies/tableseat-nowait.js (which in
// turn requires leanlinkrescue, which requires competent)
// and the NEW scripts/policies/raidpool-diag.js.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newStore: newRaidpoolStore, withRaidpoolDiag } = require('./policies/raidpool-diag');

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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-raidpool-a'); }

async function runOne(col, seed, days, evidDir, pid, fileName) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = pid === 'wrapped';
  let raidStore = null;
  if (wrapped) {
    process.env.RAIDPOOL = '1';
    raidStore = newRaidpoolStore();
  } else {
    delete process.env.RAIDPOOL;
  }
  const base = wrapped
    ? withRaidpoolDiag(tableseatNowait, 'raidpool-diag', 'tableseat-nowait + raid/pool census', raidStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'raidpool-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const rp = raidStore ? {
    raids: raidStore.raids,
    sayCount: raidStore.sayCount, saySample: raidStore.saySample, raidLines: raidStore.raidLines,
    diag: { errs: raidStore.errs, errors: raidStore.errors, overflow: raidStore.overflow, installed: raidStore.installed },
  } : null;
  const row = {
    policy: 'raidpool-' + col + '-' + pid, column: col, pid, seed,
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
    raidpool: rp,
    competentSha: competentSha(),
    head: gitHead(),
  };
  if (evidDir && fileName) {
    const fn = path.join(evidDir, fileName);
    try {
      writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
      row.corpusFile = fn;
    } catch (e) {
      // Write-flap fallback (driftwide 2026-10-26: container EPERM
      // flap truncates/blocks file writes intermittently): never
      // lose the computed row — emit it on stdout so the caller
      // can persist it exactly when the flap clears.
      row.writeFailed = String((e && e.message) || e).slice(0, 120);
      console.log('ROWJSON ' + JSON.stringify(row));
    }
  }
  return row;
}

function raidTotals(rows) {
  let raids = 0, raiders = 0, pool = 0, poolW3 = 0;
  for (const r of rows) {
    const rp = r.raidpool;
    if (!rp || !Array.isArray(rp.raids)) continue;
    raids += rp.raids.length;
    for (const x of rp.raids) {
      raiders += (x.raiders || []).length;
      pool += x.livingN || 0;
      const w3 = x.w3plusPool;
      if (Array.isArray(w3)) poolW3 += w3.length;
      else {
        const by = x.poolByWave || {};
        for (const k of Object.keys(by)) if ((parseInt(k, 10) || 1) >= 3) poolW3 += by[k] || 0;
      }
    }
  }
  return { raids, raiders, pool, poolW3 };
}

function aggregate(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
  const rt = raidTotals(rows);
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
    raids: rt.raids, raiders: rt.raiders, pool: rt.pool, poolW3: rt.poolW3,
  };
}

function trajEq(a, b) {
  return TRAJECTORY.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]))
    && JSON.stringify(a.deaths) === JSON.stringify(b.deaths)
    && JSON.stringify((a.ts || {}).tsNationalDay) === JSON.stringify((b.ts || {}).tsNationalDay);
}

async function oneMode(col, seedArg, pid) {
  if (col !== 'colA' && col !== 'colB' && col !== 'colC') { console.error('column must be colA, colB or colC'); process.exit(2); }
  if (pid !== 'plain' && pid !== 'wrapped') { console.error('pid must be plain or wrapped'); process.exit(2); }
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const fileName = pid === 'wrapped' ? `s${seed}-${col}.json` : `s${seed}-${col}-plain.json`;
  const row = await runOne(col, seed, days, evidDir, pid, fileName);
  const rt = raidTotals([row]);
  console.log(`  [${col} ${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} raids=${rt.raids} raiders=${rt.raiders} pool=${rt.pool} compSha=${(row.competentSha || '').slice(0, 12)}`);
}

async function detgateMode(col, seedArg) {
  if (col !== 'colA' && col !== 'colB' && col !== 'colC') { console.error('column must be colA, colB or colC'); process.exit(2); }
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const plain = await runOne(col, seed, days, evidDir, 'plain', `s${seed}-${col}-plain.json`);
  const wrapped = await runOne(col, seed, days, evidDir, 'wrapped', `s${seed}-${col}-detwrapped.json`);
  const rerun = await runOne(col, seed, days, evidDir, 'wrapped', `s${seed}-${col}-detrerun.json`);
  const pw = trajEq(plain, wrapped);
  const wr = trajEq(wrapped, rerun);
  const diagOk = wrapped.raidpool && wrapped.raidpool.diag.errs === 0
    && Object.keys(wrapped.raidpool.diag.overflow || {}).length === 0
    && rerun.raidpool && rerun.raidpool.diag.errs === 0;
  console.log(`DETGATE ${col} seed=${seed} plain days=${plain.days} gameDays=${plain.gameDays} won=${plain.won} deaths=${plain.deathTotal} tsNat=${JSON.stringify((plain.ts || {}).tsNationalDay)} | wrapped days=${wrapped.days} gameDays=${wrapped.gameDays} won=${wrapped.won} deaths=${wrapped.deathTotal} tsNat=${JSON.stringify((wrapped.ts || {}).tsNationalDay)} raids=${raidTotals([wrapped]).raids} | rerun days=${rerun.days} deaths=${rerun.deathTotal} plain==wrapped=${pw} wrapped==rerun=${wr} diagOk=${diagOk} -> ${(pw && wr && diagOk) ? 'PASS' : 'FAIL'}`);
  if (!(pw && wr && diagOk)) process.exit(1);
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
  if (!rowsA || !rowsB || !rowsC) { console.error('SUMMARY: wrapped corpus incomplete (need all 3 columns x 8 seeds)'); process.exit(1); }
  const bandA = aggregate(rowsA), bandB = aggregate(rowsB), bandC = aggregate(rowsC);
  const colOk = (rows) => rows.every(r => r.days > 0 && r.competentSha && r.raidpool
    && Array.isArray(r.raidpool.raids) && r.raidpool.diag.errs === 0
    && Object.keys(r.raidpool.diag.overflow || {}).length === 0)
    && new Set(rows.map(r => r.competentSha)).size === 1;
  const corpusOk = colOk(rowsA) && colOk(rowsB) && colOk(rowsC)
    && rowsA[0].competentSha !== rowsB[0].competentSha
    && rowsA[0].competentSha !== rowsC[0].competentSha
    && rowsB[0].competentSha !== rowsC[0].competentSha;
  const report = {
    label: 'sim-raidpool-a', seeds: SEEDS, days,
    rowsA, rowsB, rowsC, bandA, bandB, bandC,
    colBMatchesPublished: bandB.deathTotal === 260 && bandB.nationalEver === 6 && bandB.starvationTotal === 9
      && bandB.raids === 85 && bandB.raiders === 352 && bandB.pool === 1527,
    colCMatchesPublished: bandC.deathTotal === 301 && bandC.nationalEver === 8 && bandC.starvationTotal === 2
      && bandC.raids === 91 && bandC.raiders === 404 && bandC.pool === 1346,
    colAMatchesDriftwide: bandA.deathTotal === 294 && bandA.nationalEver === 8 && bandA.starvationTotal === 2
      && bandA.entered === 3 && bandA.won === 3 && bandA.wave4 === 4,
    corpusOk,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-raidpool-a ===');
  for (const [name, b] of [['colA', bandA], ['colB', bandB], ['colC', bandC]]) {
    console.log(`  ${name}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationTotal} deaths=${b.deathTotal} raids=${b.raids} raiders=${b.raiders} pool=${b.pool} poolW3=${b.poolW3}`);
  }
  console.log(`  colB==published(260/6/9/85/352/1527): ${report.colBMatchesPublished}  colC==published(301/8/2/91/404/1346): ${report.colCMatchesPublished}  colA==driftwide(294/8/2/3ent/3win/4w4): ${report.colAMatchesDriftwide}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2], args[args.indexOf('--one') + 3]);
  if (args.includes('--detgate')) return detgateMode(args[args.indexOf('--detgate') + 1], args[args.indexOf('--detgate') + 2]);
  if (args.includes('--summary')) return summaryMode();
  console.error('usage: --one <colA|colB|colC> <seed> <plain|wrapped> | --detgate <colA|colB|colC> <seed> | --summary');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('RAIDPOOL SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, raidTotals, trajEq, TRAJECTORY, SEEDS };
