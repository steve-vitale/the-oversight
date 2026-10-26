#!/usr/bin/env node
// scripts/test-freshtransient-sweep.js — sim-freshtransient-a sweep
// (scale-onramp axis, 2026-10-26: exercise a FRESH transient-
// national event. DIAG ONLY, zero src/js changes, zero default
// flips, no edits to any existing policy, sweep, summary, or
// check file — this is a NEW file that composes existing pieces.)
//
// COMPOSITION (new combination, no existing file touched):
//   base policy = feastdraw-driveoff-clean (FEASTDRAWCLEAN=1,
//   tableseat-nowait substrate, COMPETENT_SEEK_FIGHTS left ON),
//   wrapped with the feastdraw + nonworldkill recorders exactly
//   as scripts/test-feastdraw-driveoff-clean-sweep.js does, and
//   with the natpair pre/post-daily snaps exactly as
//   scripts/test-natpair-sweep.js does (pre-daily snap, delegate
//   base.daily, post-daily snap + per-day rank trace).
// The snaps and the say-line capture are PURE READS: they read
// scaleRank()/progState() and record lines; no game call is
// added, removed, or reordered. The det-gate proves it (clean
// policy plain vs clean policy + snaps, one non-transient seed:
// days/gameDays/won/deaths/tsNationalDay identical).
//
// Pairing definitions (verbatim from the natpair run):
//   SNAPNAT  = row nationalEver (0/1, pre-daily hist + final snap)
//   TSPRESENT = tsNationalDay != null
//   MAXNAT   = maxRank in {national, global}
//   POSTNAT  = postMaxRank in {national, global} (diagnostic)
//   OLDPAIRED = (SNAPNAT === TSPRESENT) literal (number ===
//     boolean: always false — the natpair type bug, preserved)
//   NEWPAIRED = (SNAPNAT === (TSPRESENT ? 1 : 0))
//   Classes: agree | transient-ts-only | snap-only | final-only |
//     post-explained-transient | unclassified (via
//     classifyPairing from test-natpair-sweep, imported read-only).
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one freshtransient <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the wall table + class table + DIAG-GO computation.
//     Exit 1 on corpus failure (missing rows).
//   --detgate : plain driveoff-clean vs driveoff-clean + snaps
//     on one seed (SEED env, default 73671): days/gameDays/
//     won/deaths/tsNationalDay must match.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');
const { classifyPairing } = require('./test-natpair-sweep');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANK_NAMES = ['village', 'regional', 'national', 'global'];
const SEEDS = (process.env.SEEDS || '73901,73902,73903,73904,73905,73906,73907,73908')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const STARV_RE = /starv|hunger/i;
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

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1';
  process.env.NONWORLDKILL = '1';
  process.env.FEASTDRAWCLEAN = '1';
  delete process.env.COMPETENT_SEEK_FIGHTS; // ON: the intercept, not the gate, declines the draw
  const fdStore = newFdStore(), nwkStore = newNwkStore();
  const inner = feastdrawDriveoffClean;
  const base = withFeastdrawDiag(withNonworldkillDiag(inner, 'nonworldkill-diag', 'fresh-transient sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'fresh-transient sweep + feast-draw yield census', fdStore);
  const { Game } = await loadGame({ seed, mode: 'freshtransient-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
  try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  // Say-line capture: national/table/realm lines (natpair sense
  // texture) + draw/drive-off lines (driveoff-clean sense texture).
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/national|global|table|realm|polity|circling the edge|drove off|never brave|gives up and moves on/i.test(t) && sayLines.length < 200) {
            sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: t.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    }
  } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const post = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const rankTrace = [];
  const patrolByDay = {};
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    upkeep(G, ctx) {
      let r;
      try { r = base.upkeep ? base.upkeep(G, ctx) : undefined; } catch (e) { r = undefined; }
      try {
        const d = ctx && ctx._feastFightDay, sw = ctx && ctx._feastFightSweeps;
        if (d && (sw | 0) > 0) patrolByDay[d] = Math.max(patrolByDay[d] || 0, sw | 0);
      } catch (e) {}
      return r;
    },
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      // PRE-daily snap (natpair semantics verbatim).
      let preOrder = 0;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        preOrder = RANK_ORDER[s.rank] || 0;
      } catch (e) { preOrder = 0; }
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      // POST-daily snap (new diagnostic only, never folded into hist).
      try {
        const s2 = snap(G);
        post.maxRank = Math.max(post.maxRank, RANK_ORDER[s2.rank] || 0);
        post.maxArc = Math.max(post.maxArc, s2.arc || 1);
        if (s2.tableWaiting) post.everTable = true;
        if (s2.tableEntered) post.everEntered = true;
        rankTrace.push({ day: ((G.state || {}).scholar || {}).day || 0, pre: preOrder, post: RANK_ORDER[s2.rank] || 0 });
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ctxFd = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0) ctxFd[k] = capturedCtx[k];
    }
  }
  const preNationalDay = (() => {
    const t = rankTrace.find(x => x.pre >= 2);
    return t ? t.day : null;
  })();
  const postNationalDay = (() => {
    const t = rankTrace.find(x => x.post >= 2);
    return t ? t.day : null;
  })();
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: RANK_NAMES[hist.maxRank] || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts: ctxFd,
    ctxFd: ctxFd,
    tsNationalDay: ctxFd.tsNationalDay != null ? ctxFd.tsNationalDay : null,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    sayLines: sayLines,
    patrol: { byDay: patrolByDay, total: Object.values(patrolByDay).reduce((t, v) => t + v, 0), days: Object.keys(patrolByDay).length },
    feastdraw: {
      grants: fdStore.grants, draws: fdStore.draws, faces: fdStore.faces,
      driveoffs: fdStore.driveoffs, clears: fdStore.clears,
      diag: { errs: fdStore.errs, errors: fdStore.errors, overflow: fdStore.overflow, installed: fdStore.installed },
    },
    nonworldkill: {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
    },
    // NEW diagnostic fields only (never folded into the old fields above):
    postMaxRank: RANK_NAMES[post.maxRank] || 'village',
    postMaxArc: post.maxArc,
    postTable: (post.everTable || end.tableWaiting) ? 1 : 0,
    postEntered: (post.everEntered || end.tableEntered) ? 1 : 0,
    preNationalDay: preNationalDay,
    postNationalDay: postNationalDay,
    rankTrace: rankTrace,
  };
  row.pairing = classifyPairing({
    nationalEver: row.nationalEver, maxRank: row.maxRank, finalRank: row.finalRank,
    postMaxRank: row.postMaxRank, tsNationalDay: row.tsNationalDay,
  });
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-freshtransient-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const p = row.pairing;
  const fd = row.feastdraw || {};
  const draws = (fd.draws || []).length, driven = (fd.driveoffs || []).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} postMaxRank=${row.postMaxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNationalDay=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} preNatDay=${row.preNationalDay != null ? row.preNationalDay : 'null'} postNatDay=${row.postNationalDay != null ? row.postNationalDay : 'null'} pairing: class=${p.cls} oldPaired=${p.oldPaired} newPaired=${p.newPaired} maxAgree=${p.maxAgree} draws=${draws} driven=${driven} patrol=${row.patrol.total} sayLines=${row.sayLines.length}`);
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  let corpusOk = true;
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-freshtransient.json`);
    if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const ok = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.pairing && r.pairing.cls !== 'unclassified');
  if (!ok) corpusOk = false;
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    arc4: rows.filter(r => (r.maxArc || 1) >= 4).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    freshTransients: rows.filter(r => r.pairing && (r.pairing.cls === 'transient-ts-only' || r.pairing.cls === 'post-explained-transient')).length,
    postExplainedTransients: rows.filter(r => r.pairing && r.pairing.cls === 'post-explained-transient').length,
  };
  const pairing = rows.map(r => ({
    seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc,
    finalRank: r.finalRank, maxRank: r.maxRank, postMaxRank: r.postMaxRank,
    natEver: r.nationalEver, natFinal: r.nationalFinal, table: r.table, entered: r.entered,
    tsNationalDay: r.tsNationalDay, preNationalDay: r.preNationalDay, postNationalDay: r.postNationalDay,
    starv: r.starvationDeaths, deaths: r.deathTotal,
    oldPaired: r.pairing.oldPaired, newPaired: r.pairing.newPaired, maxAgree: r.pairing.maxAgree,
    cls: r.pairing.cls,
  }));
  const classCounts = {};
  for (const x of pairing) classCounts[x.cls] = (classCounts[x.cls] || 0) + 1;
  const diag = {
    positiveControlCaptured: null, // MANUAL: judged in evidence from the 73673 row (post-snap national, pre-snap absent, day + direction located)
    freshTransientCount: band.freshTransients,
  };
  const summary = { band, pairing, classCounts, diag, corpusOk,
    verdict: corpusOk ? 'CORPUS-PASS (verdict judged in evidence: positive control + fresh hunt reported, not re-scored)' : 'CORPUS-FAIL' };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  BAND: won=${band.won}/${band.n} median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal} freshTransients=${band.freshTransients} postExplained=${band.postExplainedTransients}`);
  console.log(`  PAIRING: ${pairing.map(x => `s${x.seed}:${x.cls} (natEver=${x.natEver}, maxRank=${x.maxRank}, postMax=${x.postMaxRank}, tsDay=${x.tsNationalDay}, preNat=${x.preNationalDay}, postNat=${x.postNationalDay}, old=${x.oldPaired}, new=${x.newPaired})`).join(' ')}`);
  console.log(`  CLASSES: ${JSON.stringify(classCounts)}`);
  console.log(`  VERDICT: ${summary.verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  // PLAIN arm: driveoff-clean policy + recorders, NO pre/post snaps
  // (the driveoff-clean sweep's own runOne shape, minus its patrol
  // map — patrol is sweep-side only and moves no play).
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1'; process.env.NONWORLDKILL = '1';
  process.env.FEASTDRAWCLEAN = '1'; delete process.env.COMPETENT_SEEK_FIGHTS;
  const baseRow = await (async () => {
    const fdStore = newFdStore(), nwkStore = newNwkStore();
    const base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore);
    const { Game } = await loadGame({ seed, mode: 'freshtransient-detgate-base', fullTelemetry: false });
    await setupGame(Game);
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const end = snap(Game);
    return { days: result.days, gameDays: result.gameDays, won: end.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('freshtransient', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  // Record the detgate artifact for the proof test (evidence dir,
  // not the null dir used for the wrapped row itself). Per-seed
  // filename, so a second detgate seed never overwrites the first;
  // detgate.json is kept as a copy of the latest run.
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && argv[1] === 'freshtransient') return oneMode(argv[1], argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate') return detgateMode();
  console.error('usage: test-freshtransient-sweep.js (--one freshtransient <seed> | --summary | --detgate)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { runOne, snap, RANK_ORDER, RANK_NAMES };
