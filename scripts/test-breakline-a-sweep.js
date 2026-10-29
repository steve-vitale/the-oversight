#!/usr/bin/env node
// scripts/test-breakline-a-sweep.js — sim-breakline-a pilot band.
// DIAGNOSIS ONLY: base code, no game change, no policy change. Runs the
// VERBATIM tableseat-nowait policy + the fieldparty-form-diag recorder
// (reused verbatim, never edited) + the w4dpr-diag recorder (reused
// verbatim, never edited) + the new breakline-diag recorder
// (scripts/policies/breakline-diag.js, observational only) on seeds
// 75101-75108, 180d death-aware, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
// FIELDPARTY=1, W4DPR=1, BREAKLINE=1. The break-line census itself is
// judged by test-breakline-a.js, never here.
// Modes (mirroring test-w4dpr2-sweep.js):
//   --one <seed> : run one seed, write its row.
//   --summary    : build summary.json from rows on disk.
//   (no args)    : run all seeds, then summary.
// Corpus: evidence/2026-10-29/perseed-breakline-a/ (EVID env override).
// Exit 1 in --summary mode if the corpus is incomplete or any
// recorder errored/overflowed.
// NOTE on corpusFile: the row stores only the BASENAME (never the
// absolute path), so a scratch-dir determinism re-run is byte-
// identical to the corpus row in full, not just modulo the path.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');
const {
  newStore: newW4dprStore, installW4dprDiag,
} = require('./policies/w4dpr-diag');
const {
  newStore: newBreaklineStore, installBreaklineDiag, layerOn: breaklineOn,
} = require('./policies/breakline-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  // Same flap span as the w4dpr2 sweep (60 attempts, up to 30s sleeps):
  // the container EPERM write flap holds for 30s+ at a stretch while
  // fresh processes write fine; only write timing changes, never
  // row content (the sim is deterministic; the determinism gate
  // proves it).
  let lastErr = null;
  for (let a = 1; a <= 60; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 60) sleepMs(Math.min(30000, 2000 * a));
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-breakline-a'); }

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  process.env.W4DPR = '1';
  // BREAKLINE is left as the caller set it: the sweep sets it to '1'
  // for judged runs; OFF/ON scratch runs unset it to prove neutrality.
  const fpStore = newFieldpartyStore();
  const dpStore = newW4dprStore();
  const blStore = newBreaklineStore();
  const base = withFieldpartyDiag(tableseatNowait, 'fieldparty-diag', 'tableseat-nowait + field-party formation census', fpStore);
  const { Game } = await loadGame({ seed, mode: 'breakline-a-pilot', fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
  try { installW4dprDiag(Game, dpStore); } catch (e) {}
  if (breaklineOn()) { try { installBreaklineDiag(Game, blStore); } catch (e) {} }
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
      try { installW4dprDiag(G, dpStore); } catch (e) {}
      if (breaklineOn()) { try { installBreaklineDiag(G, blStore); } catch (e) {} }
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
  const row = {
    policy: 'fresh-base', seed,
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
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    tableState: tableState,
    courtship: courtship,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
    w4dpr: dpStore ? {
      meetings: dpStore.meetings,
      partCounter: dpStore.partCounter,
      diag: { errs: dpStore.errs, errors: dpStore.errors, overflow: dpStore.overflow, installed: dpStore.installed },
    } : null,
    breakline: breaklineOn() ? {
      meetings: blStore.meetings,
      partCounter: blStore.partCounter,
      sense: blStore.sense,
      diag: { errs: blStore.errs, errors: blStore.errors, overflow: blStore.overflow, installed: blStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = path.basename(fn);
  }
  return row;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline));
  const meetings = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const summary = { band, deathsByCause, meetings: meetings.length, corpusOk };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('=== sim-breakline-a pilot band ===');
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk}`);
  console.log(`meetings all=${meetings.length}`);
  console.log(`WALL: won=${band.won} (full=${band.wonFull}) natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} median=${band.medianDays} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    console.log(`  s${r.seed} days=${r.days} end=${r.endReason} won=${r.won} wave=${r.waveReach} natEver=${r.nationalEver} starv=${r.starvationDeaths} deaths=${r.deathTotal} fpMeetings=${r.fieldparty.meetings.length} blMeetings=${(r.breakline || {}).meetings ? r.breakline.meetings.length : 0} fpErrs=${r.fieldparty.diag.errs} blErrs=${r.breakline ? r.breakline.diag.errs : 'off'}`);
  }
  if (!corpusOk) { console.log('CORPUS-INVALID'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  if (args[0] === '--summary') { await summaryMode(); return; }
  if (args[0] === '--one') {
    const seed = parseInt(args[1], 10);
    const row = await runOne(seed, days, evidDir);
    console.log(`  [pilot seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} blMeetings=${row.breakline ? row.breakline.meetings.length : 0} fpErrs=${row.fieldparty.diag.errs} blErrs=${row.breakline ? row.breakline.diag.errs : 'off'}`);
    return;
  }
  for (const seed of SEEDS) {
    const row = await runOne(seed, days, evidDir);
    console.log(`  [pilot seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} blMeetings=${row.breakline ? row.breakline.meetings.length : 0} fpErrs=${row.fieldparty.diag.errs} blErrs=${row.breakline ? row.breakline.diag.errs : 'off'}`);
  }
  await summaryMode();
}
main().catch(e => { console.error('SWEEP-FAIL', e && e.stack || e); process.exit(1); });
