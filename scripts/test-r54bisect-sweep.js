#!/usr/bin/env node
// scripts/test-r54bisect-sweep.js — sim-r54bisect-a sweep
// (scale-onramp axis, 2026-10-26: BISECT the 0126Z -> current control
// drift. DIAG ONLY, zero game-code changes landed.)
//
// Question: does the journey-landing r54 winddown grace beat
// (de87ffe79, src/js/conversation.js, +17/-1) explain the drift
// between the 0126Z authoritative control band (base 8ea64d848:
// deaths 260, national-ever 6/8, national-final 5/8, table 4/8,
// wins 4/8 lesser only, wave-5 0/8, median 143d, starvation 9)
// and the current band (natpair + drawwave, same seeds/substrate:
// deaths 301, national-ever 8/8, national-final 5/8, table 4/8,
// wins 4/8, median 143d, starvation 2)?
//
// Columns (identical script, identical seeds, identical policy;
// the ONLY difference is the worktree's conversation.js):
//   colA = current master as-is (grace beat present).
//   colB = exact inverse of de87ffe79's conversation.js hunk
//          applied in the worktree ONLY (reverse-applied, then
//          restored with git checkout before commit).
// Substrate: seeds 73671-73678, tableseat-nowait policy
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), 180d death-aware
// horizon (runDays stops on death/win; 180 is the cap).
// Recorder-free plain runs: the rebaseline proof showed plain
// rows reproduce recorder rows exactly on every trajectory
// field, so plain rows are the comparable instrument here.
//
// Each row records conversationSha (sha256 of src/js/
// conversation.js at run time) so the proof test can prove
// which code each column actually ran under.
//
// Modes:
//   --one <colA|colB> <seed> : run one seed, write its row.
//     RERUN=1 writes s<seed>-<col>-rerun.json instead (the
//     determinism leg; trajectory fields must match the main
//     row exactly).
//   --summary : build summary.json from the rows on disk,
//     print both bands + the verdict vs the pre-registered
//     thresholds. Exit 1 only on an incomplete corpus; the
//     verdict itself is data, never a script failure.
//   --detgate : plain-vs-plain delegation check is vacuous
//     here (no wrapper is installed at all); instead this
//     mode asserts the policy env pairing reproduces the
//     rebaseline plain leg on one seed: it runs the seed
//     twice in-process order and requires identical
//     trajectory rows. Exit 1 on mismatch.
//
// Never edit existing policy/sweep files from here; this file
// only READS scripts/policies/tableseat-nowait.js.
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
function conversationSha() {
  try { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'conversation.js'))).digest('hex'); }
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-r54bisect-a'); }

async function runOne(col, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'r54bisect-plain', fullTelemetry: false });
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
    policy: 'r54bisect-' + col, column: col, seed,
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
    conversationSha: conversationSha(),
    head: gitHead(),
  };
  if (evidDir) {
    const fn = path.join(evidDir, process.env.RERUN === '1' ? `s${seed}-${col}-rerun.json` : `s${seed}-${col}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
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
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
}

// Pre-registered verdict (binding; see evidence header):
//   CONFIRMED if colB returns to the 0126Z shape:
//     deaths <= 270 AND nationalEver <= 6/8 AND starvation >= 6,
//     with table/wins/final not collapsing.
//   EXONERATED if colB matches the current band:
//     deaths >= 290 AND nationalEver == 8/8.
//   INCONCLUSIVE otherwise.
function verdictOf(b) {
  const confirmed = b.deathTotal <= 270 && b.nationalEver <= 6 && b.starvationTotal >= 6
    && b.table >= 3 && b.won >= 3 && b.nationalFinal >= 4;
  if (confirmed) return 'CONFIRMED';
  const exonerated = b.deathTotal >= 290 && b.nationalEver === 8;
  if (exonerated) return 'EXONERATED';
  return 'INCONCLUSIVE';
}

async function oneMode(col, seedArg) {
  if (col !== 'colA' && col !== 'colB') { console.error('column must be colA or colB'); process.exit(2); }
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(col, seed, days, evidDir);
  console.log(`  [${col} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} convSha=${(row.conversationSha || '').slice(0, 12)}`);
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const rowsA = [], rowsB = [];
  for (const seed of SEEDS) {
    rowsA.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-colA.json`), 'utf8')));
    rowsB.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-colB.json`), 'utf8')));
  }
  const bandA = aggregate(rowsA), bandB = aggregate(rowsB);
  const verdict = verdictOf(bandB);
  const corpusOk = rowsA.length === 8 && rowsB.length === 8
    && rowsA.every(r => r.days > 0 && r.conversationSha) && rowsB.every(r => r.days > 0 && r.conversationSha)
    && new Set(rowsA.map(r => r.conversationSha)).size === 1
    && new Set(rowsB.map(r => r.conversationSha)).size === 1
    && rowsA[0].conversationSha !== rowsB[0].conversationSha;
  const report = {
    label: 'sim-r54bisect-a', seeds: SEEDS, days,
    rowsA, rowsB, bandA, bandB, verdict,
    verdictRule: 'CONFIRMED iff colB deaths<=270 AND nationalEver<=6 AND starvation>=6 with table>=3, wins>=3, nationalFinal>=4; EXONERATED iff colB deaths>=290 AND nationalEver==8; else INCONCLUSIVE',
    corpusOk,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-r54bisect-a ===');
  for (const [name, b] of [['colA', bandA], ['colB', bandB]]) {
    console.log(`  ${name}: n=${b.n} won=${b.won} medD=${b.medianDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationTotal} deaths=${b.deathTotal}`);
  }
  console.log(`  VERDICT (colB vs pre-registration): ${verdict}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} (colA convSha=${(rowsA[0].conversationSha || '').slice(0, 12)} colB convSha=${(rowsB[0].conversationSha || '').slice(0, 12)}) -> ${summaryPath}`);
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
  console.error('usage: --one <colA|colB> <seed> | --summary | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('R54BISECT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, verdictOf, TRAJECTORY, SEEDS };
