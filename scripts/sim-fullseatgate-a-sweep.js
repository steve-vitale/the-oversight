#!/usr/bin/env node
// scripts/sim-fullseatgate-a-sweep.js — full-seat gate-vector recorder
// (scale-onramp axis, 2026-10-30, arm sim-fullseatgate-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes, zero gate moves.)
//
// Substrate verbatim from the dissolveprobe pilot band:
// tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// 180d death-aware horizon, pilot seeds 75101-75108. One process
// per seed — never two harnesses in one node process.
//
// INSTRUMENT DISCIPLINE (pre-registered): the daily hook runs the
// base policy FIRST, then takes pure-read snapshots only. It never
// calls villageStandingTotal() inside the day loop (it fires hold /
// release beats and advances the peak ratchet — wave5gate precedent);
// the gated total is NOT needed for the gate vector (scaleRank +
// villageStanding() breakdown + deedGateReady() cover it), and
// villageStandingTotal() and unlockedWave() (which reads it) are
// called exactly once at end-of-run (after the run is over) as
// cross-checks, never mid-run. tableSeat(), deedGateReady(),
// ledger(), scaleRank(), integrationStage(), havenViewership(),
// codexBreadth(), tableEarnedPaths(), waveEngaged() are pure reads
// and are called only at capture moments (first tableWaiting day,
// first tableDone day) and at end-of-run — never every day — so
// the instrument cannot steer the sim day to day.
//
// Capture rule (prereg): the AT-TABLE vector is the first day
// post-base on which progState.tableWaiting is true; if the seat
// is taken inside base.daily before any post-base snapshot sees
// tableWaiting, the at-table vector is the first post-base
// snapshot with tableDone true, flagged tableSeenViaDone. A
// second vector is captured at the first post-base tableDone day
// when the at-table vector came from tableWaiting. Seeds with
// neither flag have no at-table vector (recorder miss, reported).
//
// Transcript capture (read-only): Game.say wrapped to record
// ONLY table/audit/seat lines with the day at call time. No RNG,
// no inputs, never throws into the engine.
//
// Modes:
//   --one <seed> : run one seed, write s<seed>-fullseatgate.json to EVID.
//   --analyze <dir> : run the analyzer over a per-seed dir (see
//     scripts/sim-fullseatgate-a-analyze.js; also required here so
//     the proof test can exercise it without a sweep).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, local: 0, regional: 1, national: 2, global: 3 };
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const TABLE_LINE_RE = /THE TABLE|lesser seat|full seat|audit|priced|YOUR CASE IS NOT COMPLETE|table is being set|table rises|table does not rise/i;

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
function num(v, dflt) { const n = (v | 0); return Number.isFinite(n) ? n : (dflt | 0); }
function tryFn(fn, dflt) { try { const v = fn(); return (v === undefined ? dflt : v); } catch (e) { return dflt; } }

// captureVector(Game, when): the full-seat gate vector at one moment.
// Every read is individually guarded; a failed read yields null for
// that field and an entry in errs — never a blank vector.
function captureVector(Game, when) {
  const v = { when, errs: [] };
  const err = (f) => v.errs.push(f);
  try { v.day = ((Game.state && Game.state.scholar && Game.state.scholar.day) | 0) || 0; } catch (e) { v.day = 0; err('day'); }
  const seat = tryFn(() => (typeof Game.tableSeat === 'function' ? Game.tableSeat() : null), null);
  if (!seat) err('tableSeat'); else {
    v.seat = seat.seat || 'none';
    const d = seat.detail || {};
    v.seatDetail = { w1: num(d.w1, 0), w2: num(d.w2, 0), w3: num(d.w3, 0), w4: num(d.w4, 0), w5: num(d.w5, 0), contestsN: num(d.contestsN, 0), crisesN: num(d.crisesN, 0), rank: d.rank || 'village', stage: num(d.stage, 0), foodDeeds: !!d.foodDeeds };
  }
  const full = tryFn(() => (typeof Game.deedGateReady === 'function' ? Game.deedGateReady() : null), null);
  if (!full) err('deedGateReady'); else {
    v.full = { ok: !!full.ok, waves: !!full.waves, contests: !!full.contests, crises: !!full.crises, scale: !!full.scale, stageOk: !!full.stageOk, foodDeeds: !!full.foodDeeds, stage: num(full.stage, 0), w1: num(full.w1, 0), w2: num(full.w2, 0), w3: num(full.w3, 0), w4: num(full.w4, 0), w5: num(full.w5, 0), contestsN: num(full.contestsN, 0), crisesN: num(full.crisesN, 0), rank: full.rank || 'village' };
    // Per-wave shortfalls vs the full bars 5/5/4/3/2.
    const bars = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2 };
    v.waveShortfall = {};
    for (const k of ['w1', 'w2', 'w3', 'w4', 'w5']) v.waveShortfall[k] = Math.max(0, bars[k] - (v.full[k] | 0));
    // Lesser-vs-full gap from the same detail: which lesser bars pass.
    v.lesser = { w1: v.full.w1 >= 4, w2: v.full.w2 >= 4, w3: v.full.w3 >= 3, contests: v.full.contestsN >= 2, crises: v.full.crisesN >= 2, scale: (v.full.rank === 'regional' || v.full.rank === 'national' || v.full.rank === 'global'), stage: v.full.stage >= 2, foodDeeds: !!v.full.foodDeeds };
    v.lesserOk = Object.keys(v.lesser).every(k => v.lesser[k]);
  }
  const pg = tryFn(() => (Game.progState ? Game.progState() : {}), {});
  v.arc = num(pg.arc, 1);
  v.tableWaiting = !!pg.tableWaiting;
  v.tableDone = !!pg.tableDone;
  v.sentimentTaught = !!pg.sentimentTaught;
  const s = (Game.state && Game.state.scholar) || {};
  v.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
  v.crisesN = Object.keys(pg.crises || {}).length;
  const faced = tryFn(() => { const d = (typeof Game.deedState === 'function' ? Game.deedState() : {}) || {}; return d.wavesFaced || {}; }, {});
  v.wavesFaced = faced;
  v.facedCounts = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0 };
  try { for (const mid of Object.keys(faced)) { const w = faced[mid] | 0; if (w >= 1 && w <= 5) v.facedCounts['w' + w]++; } } catch (e) { err('facedCounts'); }
  // unlockedWave() is DELIBERATELY never called here: it reads
  // villageStandingTotal(), which fires hold/release beats and
  // advances the peak ratchet — calling it mid-run would steer the
  // sim (this arm's first pilot attempt did exactly that via a
  // daily unlockedWave() call and its rows were discarded). Wave
  // progress at capture time comes from waveEngaged() (pure ledger
  // counts); the real unlockedWave() is read once at end-of-run.
  v.unlockedWave = null;
  v.unlockedWaveSkipped = 'beat-firing (villageStandingTotal); end-of-run cross-check only';
  v.waveEngaged = {};
  try { for (const w of [1, 2, 3, 4, 5]) v.waveEngaged[w] = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(w) | 0) : null; } catch (e) { err('waveEngaged'); }
  v.rank = tryFn(() => (Game.scaleRank ? Game.scaleRank() : 'village') || 'village', 'village');
  v.stage = tryFn(() => (typeof Game.integrationStage === 'function' ? (Game.integrationStage() | 0) : null), null);
  if (v.stage === null) err('integrationStage');
  const st = tryFn(() => (typeof Game.villageStanding === 'function' ? Game.villageStanding() : {}), {});
  v.standing = { total: num(st.total, 0), war: num(st.war, 0), diplomacy: num(st.diplomacy, 0), plenty: num(st.plenty, 0), warPts: num(st.warPts, 0), links: num(st.links, 0), feasts: num(st.feasts, 0) };
  v.breadth = tryFn(() => (typeof Game.codexBreadth === 'function' ? (Game.codexBreadth() | 0) : null), null);
  if (v.breadth === null) err('codexBreadth');
  v.viewership = tryFn(() => (typeof Game.havenViewership === 'function' ? (Game.havenViewership() | 0) : null), null);
  if (v.viewership === null) err('havenViewership');
  const L = tryFn(() => (typeof Game.ledger === 'function' ? Game.ledger() : {}), {});
  v.ledger = {};
  for (const k of ['protected', 'killed', 'brokerage', 'might', 'showmanship', 'exposed', 'embrace', 'defiance', 'foodShared', 'foodHoarded', 'unified', 'fractured', 'betrayed']) v.ledger[k] = num(L[k], 0);
  const pt = tryFn(() => (typeof Game.tablePromiseTally === 'function' ? Game.tablePromiseTally() : null), null);
  v.promises = pt ? { kept: num(pt.kept, 0), broken: num(pt.broken, 0) } : null;
  const sw = tryFn(() => (typeof Game.tableSwitchTally === 'function' ? Game.tableSwitchTally() : null), null);
  v.switchboard = sw ? { routed: num(sw.routed, 0), delayed: num(sw.delayed, 0), edited: num(sw.edited, 0), skimmed: num(sw.skimmed, 0) } : null;
  v.sysBond = tryFn(() => { const pg2 = Game.progState ? Game.progState() : {}; return (pg2.sysBond != null ? (pg2.sysBond | 0) : null); }, null);
  v.grounding = tryFn(() => { const sch = (Game.state && Game.state.scholar) || {}; return (sch.grounding != null ? (sch.grounding | 0) : null); }, null);
  v.relayLean = tryFn(() => (typeof Game.relayLean === 'function' ? (Game.relayLean() | 0) : null), null);
  const doors = tryFn(() => (typeof Game.tableEarnedPaths === 'function' ? Game.tableEarnedPaths() : null), null);
  v.doors = doors ? doors.filter(p => p && p.earned).map(p => p.name || p.id) : null;
  if (v.doors === null) err('tableEarnedPaths');
  const T = tryFn(() => (typeof Game.tableState === 'function' ? Game.tableState() : {}), {});
  v.tableState = { seat: T.seat || null, path: T.path || null, phase: T.phase || null };
  v.won = !!Game.won;
  return v;
}

async function runOne(seed) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'fullseatgate', fullTelemetry: false });
  await setupGame(Game);
  const tableLines = [];
  const gdayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  try {
    const _say = Game.say.bind(Game);
    Game.say = function (...a) { try { const line = String(a[0]); if (TABLE_LINE_RE.test(line)) tableLines.push({ day: gdayOf(), line: line.slice(0, 600) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxWave: 1 };
  let atTable = null, atSeat = null, capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      // PRE-BASE flags: the seat leg can take the seat inside
      // base.daily, clearing tableWaiting before any post-base
      // snapshot would ever see it (wave5gate precedent).
      let preWaiting = false, preDone = false;
      try { const pg = G.progState ? G.progState() : {}; preWaiting = !!pg.tableWaiting; preDone = !!pg.tableDone; } catch (e) {}
      try { hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0); } catch (e) {}
      if (tableseatNowait.daily) { try { tableseatNowait.daily(G, ctx); } catch (e) {} }
      try {
        const pg = G.progState ? G.progState() : {};
        if (pg.tableWaiting) hist.everTable = true;
        if (pg.tableDone) hist.everEntered = true;
        hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
        try { hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0); } catch (e) {}
        // NO unlockedWave() here (beat-firing via villageStandingTotal);
        // maxWave comes from the harness's own result.maxWaveUnlocked.
        // Capture moments only — never a daily snapshot.
        if (!atTable && pg.tableWaiting) atTable = captureVector(G, 'atTable-waiting');
        if (!atTable && pg.tableDone && (preWaiting || preDone)) { atTable = captureVector(G, 'atTable-viaDone'); atTable.tableSeenViaDone = true; }
        if (atTable && !atSeat && pg.tableDone && atTable.when !== 'atTable-viaDone') atSeat = captureVector(G, 'atSeat');
      } catch (e) {}
    },
  });
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  // End-of-run reads (run over — side effects harmless).
  const endVector = captureVector(Game, 'end');
  let realTotal = null, realWave = null;
  try { realTotal = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { realWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) {}
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: 'fullseatgate', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: endVector.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: endVector.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: hist.maxRank >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[endVector.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || hist.everEntered) ? 1 : 0,
    entered: hist.everEntered ? 1 : 0,
    seatAtEnd: endVector.seat || 'none',
    seatAtTable: atTable ? (atTable.seat || 'none') : null,
    deathTotal: (result.samples.deaths || []).length,
    deathCauses: (() => { const c = {}; for (const d of (result.samples.deaths || [])) { const k = (d && (d.cause || d[1] || 'unknown')) || 'unknown'; c[String(k)] = (c[String(k)] || 0) + 1; } return c; })(),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    atTable, atSeat, endVector,
    endReal: { villageStandingTotal: realTotal, unlockedWave: realWave },
    tableLines: tableLines.slice(0, 400),
    tableLineCount: tableLines.length,
  };
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-fullseatgate-a');
  const fn = path.join(evidDir, `s${seed}-fullseatgate.json`);
  writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
  console.log(`  [fullseatgate seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} table=${row.table} entered=${row.entered} seatAtTable=${row.seatAtTable} seatAtEnd=${row.seatAtEnd} won=${row.won} atTable=${atTable ? atTable.when + ' errs=' + atTable.errs.length : 'MISS'} tableLines=${tableLines.length}`);
  return row;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) {
    const seed = parseInt(args[args.indexOf('--one') + 1], 10);
    if (!Number.isFinite(seed)) { console.error('usage: --one <seed>'); process.exit(2); }
    await runOne(seed);
    return;
  }
  if (args.includes('--analyze')) {
    const dir = args[args.indexOf('--analyze') + 1];
    const analyze = require('./sim-fullseatgate-a-analyze');
    console.log(JSON.stringify(analyze.analyzeDir(dir), null, 1));
    return;
  }
  console.error('usage: --one <seed> | --analyze <dir>');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('FULLSEATGATE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, captureVector, SEEDS };
