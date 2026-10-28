#!/usr/bin/env node
// scripts/test-perceptform-a-sweep.js — sim-perceptform-a pilot/confirm
// band sweep. LEAN copy pattern (cf. scripts/test-earlycrew-a-sweep.js),
// with ONLY the recorders this arm needs: fieldparty-form-diag
// (stamp lens added for this arm) on top of the earlycrew pair policy
// (measurement substrate, restored verbatim from history).
//
// Substrate (BOTH bands, identical): seeds via SEEDS env,
// tableseat-nowait + earlycrew (EARLYCREW=1), LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware.
// The two bands differ ONLY in game code at run time:
//   --one control <seed> : run BEFORE the game edit (base code).
//   --one armed <seed>   : run AFTER the game edit (stamp + router).
// The script itself never knows which code it runs under — that is
// the point: identical policy, identical recorder, code is the delta.
// Modes:
//   --one control|armed <seed> : run one seed, write its row.
//   --summary            : build summary.json from rows on disk for
//                          BAND env (control|armed, default armed).
//   --detgate            : layer-OFF delegation proof on one seed
//                          (SEED env, default 75101): earlycrew with
//                          EARLYCREW unset must match plain
//                          tableseat-nowait on days/gameDays, with no
//                          ec* ctx surface and no recorder surface.
// Exit 1 in --summary mode if the corpus is incomplete or any
// recorder errored/overflowed.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
let earlycrewPolicy = null;
try { earlycrewPolicy = require('./policies/earlycrew').earlycrew; }
catch (e) {
  console.error('EARLYCREW POLICY MISSING: scripts/policies/earlycrew.js (measurement substrate, restored from history commit 134bc0dbd) is required to run this sweep.');
  process.exit(1);
}
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');

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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-perceptform-a'); }

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.EARLYCREW = '1'; process.env.FIELDPARTY = '1';
  const fpStore = newFieldpartyStore();
  const base = withFieldpartyDiag(earlycrewPolicy, 'fieldparty-diag', 'earlycrew substrate + field-party formation census (perceptform)', fpStore);
  const { Game } = await loadGame({ seed, mode: 'perceptform-a-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
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
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
  const OC_KEYS = ['ecUpkeeps', 'ecAssigned', 'ecRefused', 'ecPairs', 'ecSingles', 'ecEmptyParts', 'ecNodePairs'];
  const oc = {};
  for (const k of OC_KEYS) oc[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  const row = {
    policy: pid, seed,
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
    ec: oc,
    ecKeysPresent: capturedCtx ? Object.keys(capturedCtx).filter(k => k.indexOf('ec') === 0) : [],
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    tableState: tableState,
    courtship: courtship,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const dm = row.fieldparty;
  const dmline = dm ? `fpMeetings=${dm.meetings.length} fpErrs=${dm.diag.errs}` : 'fieldparty=null';
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} courtCombined=${row.courtship.combined} ecPairs=${row.ec.ecPairs} ecAssigned=${row.ec.ecAssigned} ecRefused=${row.ec.ecRefused} seat=${row.tableState ? row.tableState.seat : 'null'} ${dmline}`);
}

async function summaryMode() {
  const band = (process.env.BAND || 'armed');
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-${band}.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const bandOut = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    ecPairs: rows.reduce((t, r) => t + ((r.ec && r.ec.ecPairs) | 0), 0),
    ecAssigned: rows.reduce((t, r) => t + ((r.ec && r.ec.ecAssigned) | 0), 0),
    ecRefused: rows.reduce((t, r) => t + ((r.ec && r.ec.ecRefused) | 0), 0),
    ecUpkeeps: rows.reduce((t, r) => t + ((r.ec && r.ec.ecUpkeeps) | 0), 0),
  };
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0));
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  const report = {
    label: 'sim-perceptform-a perception from-start census', band, seeds: SEEDS, days, rows, band: bandOut,
    corpusOk: corpusOk, courtship: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk }, seats,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, `summary-${band}.json`);
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-perceptform-a tracer (' + band + ') ===');
  console.log(`  band: n=${bandOut.n} won=${bandOut.won} medD=${bandOut.medianDays} natEver=${bandOut.nationalEver} natFinal=${bandOut.nationalFinal} table=${bandOut.table} entered=${bandOut.entered} wave3=${bandOut.wave3} wave4=${bandOut.wave4} wave5=${bandOut.wave5} starv=${bandOut.starvationTotal} deaths=${bandOut.deathTotal}`);
  console.log(`  outings: pairs=${bandOut.ecPairs} assigned=${bandOut.ecAssigned} refused=${bandOut.ecRefused} upkeeps=${bandOut.ecUpkeeps}`);
  console.log(`  courtship combined=${courtTotals.combined} seedsActive=${courtSeedsActive} substrateOk=${substrateOk} seats=${JSON.stringify(seats)}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '75101', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  delete process.env.EARLYCREW; delete process.env.FIELDPARTY;
  const { Game: g1 } = await loadGame({ seed, mode: 'perceptform-a-detgate-plain', fullTelemetry: false });
  await setupGame(g1);
  let ctx1 = null;
  const p1 = Object.assign({}, tableseatNowait, { daily(G, ctx) { if (!ctx1) ctx1 = ctx; return tableseatNowait.daily(G, ctx); } });
  const r1 = await runDays(g1, p1, { days, manifest: undefined, sampleEvery: 10 });
  const { Game: g2 } = await loadGame({ seed, mode: 'perceptform-a-detgate-off', fullTelemetry: false });
  await setupGame(g2);
  let ctx2 = null;
  const { earlycrew } = require('./policies/earlycrew');
  const p2 = Object.assign({}, earlycrew, { daily(G, ctx) { if (!ctx2) ctx2 = ctx; return earlycrew.daily(G, ctx); } });
  const r2 = await runDays(g2, p2, { days, manifest: undefined, sampleEvery: 10 });
  const ocKeys = ctx2 ? Object.keys(ctx2).filter(k => k.indexOf('ec') === 0) : [];
  const sameDays = r1.days === r2.days && r1.gameDays === r2.gameDays;
  console.log(`DETGATE seed=${seed} plain days=${r1.days} gameDays=${r1.gameDays} | off days=${r2.days} gameDays=${r2.gameDays} | sameDays=${sameDays} | ecKeysOff=${JSON.stringify(ocKeys)} | tsPlain=${ctx1 ? ctx1.tsNationalDay : 'null'} tsOff=${ctx2 ? ctx2.tsNationalDay : 'null'}`);
  if (!sameDays || ocKeys.length) { console.error('DETGATE FAILURE'); process.exit(1); }
  console.log('DETGATE PASS');
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--one' && args[1] && args[2]) {
    await quietLog(async () => { await oneMode(args[1], args[2]); });
  } else if (args[0] === '--summary') {
    await summaryMode();
  } else if (args[0] === '--detgate') {
    await detgateMode();
  } else {
    console.error('usage: --one control|armed <seed> | --summary (BAND env) | --detgate (read the header — do not probe with --help)');
    process.exit(2);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
