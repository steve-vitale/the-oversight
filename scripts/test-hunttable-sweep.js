#!/usr/bin/env node
// scripts/test-hunttable-sweep.js — sim-hunttable-a sweep
// (scale-onramp axis, 2026-10-26: decompose the hunt-band table
// collapse found by sim-transient2-a. DIAG ONLY, zero src/js
// changes, zero default flips, no edits to any existing policy,
// sweep, summary, or check file — this is a NEW file composing
// existing pieces read-only. The transient2 sweep is read, never
// edited; its corpus is NOT re-judged here.)
//
// TWO COLUMNS on one band (73901-73908, 180d death-aware
// horizon, one seed per exec call):
//   anchor: plain tableseat-nowait (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1) + the new table-step recorder.
//   hunt:   driveoff-clean shape EXACTLY as transient2
//     (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
//     COMPETENT_SEEK_FIGHTS left ON, feastdraw +
//     nonworldkill recorders installed exactly as the
//     freshtransient sweep does) + the same recorder.
// The recorder is PURE READS in the policy daily wrapper
// around (never instead of) base.daily: pre/post snapshots
// of scaleRank, progState, scholar.prog.feastSurgeUsed,
// integrationStage, unlockedWave, villageStandingTotal,
// the LIVE tableSeat() pricing, and tablePreview().
// No game call is added, removed, or reordered; base.daily
// is called exactly once, in the same position. Each
// column's det-gate proves it (plain vs wrapped on pilot
// seed 73901: days/gameDays/won/deaths/tsNationalDay
// identical) BEFORE that column's band is spent.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one hunttable-anchor <seed> : anchor column, one seed.
//   --one hunttable-hunt <seed>   : hunt column, one seed.
//   --summary : build summary.json from rows on disk for both
//     columns, print band + per-step divergence tables.
//     Exit 1 on corpus failure.
//   --detgate-anchor : plain tableseat-nowait vs wrapped,
//     SEED env (default 73901).
//   --detgate-hunt : plain driveoff-clean (+recorders) vs
//     wrapped, SEED env (default 73901).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');

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
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
// PURE-READ snapshot of the table chain at one moment. Every
// call below is a read (scaleRank, progState fields, tableSeat
// pricing, tablePreview pricing, integrationStage, unlockedWave,
// villageStandingTotal); nothing here writes game state, spends
// a resource, advances a day, or answers a beat. tableSeat() and
// tablePreview() are the engine's own pricing functions, called
// with no arguments, exactly as the Haven panel calls them.
function tableSnap(Game) {
  const out = {
    day: 0, rank: 'village', rankOrd: 0, arc: 1,
    tableWaiting: false, tableDone: false, tableAnnounced: false,
    sentimentTaught: false, crisesN: 0, feastSurgeUsed: false,
    stage: 0, wave: 1, standing: null,
    seat: 'none', seatDetail: null,
    preview: null, previewSeat: null, previewReady: null, previewWhy: null,
  };
  try { out.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; out.rankOrd = RANK_ORDER[out.rank] || 0; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1;
    out.tableWaiting = !!pg.tableWaiting;
    out.tableDone = !!pg.tableDone;
    out.tableAnnounced = !!pg.tableAnnounced;
    out.sentimentTaught = !!pg.sentimentTaught;
    out.crisesN = Object.keys(pg.crises || {}).length;
  } catch (e) {}
  try { const s = (Game.state || {}).scholar || {}; out.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed); } catch (e) {}
  try { out.stage = (Game.integrationStage ? Game.integrationStage() : 0) || 0; } catch (e) {}
  try { out.wave = (Game.unlockedWave ? Game.unlockedWave() : 1) || 1; } catch (e) {}
  try { const st = (Game.villageStandingTotal ? Game.villageStandingTotal() : null); out.standing = (typeof st === 'number') ? st : null; } catch (e) {}
  try {
    const seat = (Game.tableSeat ? Game.tableSeat() : null) || {};
    out.seat = seat.seat || 'none';
    out.seatDetail = seat.detail ? {
      w1: seat.detail.w1 | 0, w2: seat.detail.w2 | 0, w3: seat.detail.w3 | 0,
      w4: seat.detail.w4 | 0, w5: seat.detail.w5 | 0,
      contestsN: seat.detail.contestsN | 0, crisesN: seat.detail.crisesN | 0,
      rank: seat.detail.rank || null, stage: seat.detail.stage | 0,
      foodDeeds: !!seat.detail.foodDeeds,
    } : null;
  } catch (e) {}
  try {
    const pv = (Game.tablePreview ? Game.tablePreview() : null);
    out.preview = pv ? { seat: pv.seat || null, ready: !!pv.ready, why: pv.why || null, day: pv.day || null } : null;
    out.previewSeat = pv ? (pv.seat || null) : null;
    out.previewReady = pv ? !!pv.ready : null;
    out.previewWhy = pv ? (pv.why || null) : null;
  } catch (e) {}
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  const isHunt = pid === 'hunttable-hunt';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let fdStore = null, nwkStore = null, base;
  if (isHunt) {
    process.env.FEASTDRAW = '1';
    process.env.NONWORLDKILL = '1';
    process.env.FEASTDRAWCLEAN = '1';
    delete process.env.COMPETENT_SEEK_FIGHTS;
    fdStore = newFdStore(); nwkStore = newNwkStore();
    base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'hunttable sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'hunttable sweep + feast-draw yield census', fdStore);
  } else {
    delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
    delete process.env.FEASTDRAWCLEAN; delete process.env.DEVOTIONGATE; delete process.env.DEVOTIONGATEDIAG;
    base = tableseatNowait;
  }
  const { Game } = await loadGame({ seed, mode: 'hunttable-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (isHunt) {
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  }
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/national|global|table|realm|polity|circling the edge|drove off|never brave|gives up and moves on|withdraw|being set|ARC IV|ARC III|feast surge|feasted/i.test(t) && sayLines.length < 300) {
            sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: t.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    }
  } catch (e) {}
  const firsts = {
    preNationalDay: null, postNationalDay: null, preGlobalDay: null, postGlobalDay: null,
    arc2Day: null, arc3Day: null, arc4Day: null,
    barW1Day: null, barW2Day: null, barW3Day: null, barContestsDay: null, barCrisesDay: null,
    barStageDay: null, barSentimentDay: null, barSurgeDay: null,
    seatFirstDay: null, seatFirstKind: null,
    invitationDay: null, previewDay: null, previewSeatFirst: null, previewReadyDay: null,
    enteredDay: null, standing100Day: null, standing200Day: null,
    wave4Day: null, wave5Day: null,
  };
  const withdrawalDays = [];
  const rankTrace = [];
  const tableTrace = [];
  let prevPostWaiting = false;
  let capturedCtx = null;
  const patrolByDay = {};
  function recordFirsts(snap, isPre) {
    const d = snap.day;
    if (isPre) {
      if (snap.rankOrd >= 2 && firsts.preNationalDay == null) firsts.preNationalDay = d;
      if (snap.rankOrd >= 3 && firsts.preGlobalDay == null) firsts.preGlobalDay = d;
    } else {
      if (snap.rankOrd >= 2 && firsts.postNationalDay == null) firsts.postNationalDay = d;
      if (snap.rankOrd >= 3 && firsts.postGlobalDay == null) firsts.postGlobalDay = d;
    }
    if (snap.arc >= 2 && firsts.arc2Day == null) firsts.arc2Day = d;
    if (snap.arc >= 3 && firsts.arc3Day == null) firsts.arc3Day = d;
    if (snap.arc >= 4 && firsts.arc4Day == null) firsts.arc4Day = d;
    const dt = snap.seatDetail;
    if (dt) {
      if (dt.w1 >= 4 && firsts.barW1Day == null) firsts.barW1Day = d;
      if (dt.w2 >= 4 && firsts.barW2Day == null) firsts.barW2Day = d;
      if (dt.w3 >= 3 && firsts.barW3Day == null) firsts.barW3Day = d;
      if (dt.contestsN >= 2 && firsts.barContestsDay == null) firsts.barContestsDay = d;
      if (dt.crisesN >= 2 && firsts.barCrisesDay == null) firsts.barCrisesDay = d;
      if (dt.stage >= 2 && firsts.barStageDay == null) firsts.barStageDay = d;
      if (dt.foodDeeds && snap.sentimentTaught && snap.feastSurgeUsed) {
        // foodDeeds is the conjunction; the two halves get their own days below.
      }
    }
    if (snap.sentimentTaught && firsts.barSentimentDay == null) firsts.barSentimentDay = d;
    if (snap.feastSurgeUsed && firsts.barSurgeDay == null) firsts.barSurgeDay = d;
    if (snap.seat !== 'none' && firsts.seatFirstDay == null) { firsts.seatFirstDay = d; firsts.seatFirstKind = snap.seat; }
    if (snap.tableWaiting && firsts.invitationDay == null) firsts.invitationDay = d;
    if (snap.preview && firsts.previewDay == null) { firsts.previewDay = d; firsts.previewSeatFirst = snap.previewSeat; }
    if (snap.preview && snap.previewReady && firsts.previewReadyDay == null) firsts.previewReadyDay = d;
    if (snap.tableDone && firsts.enteredDay == null) firsts.enteredDay = d;
    if (typeof snap.standing === 'number') {
      if (snap.standing >= 100 && firsts.standing100Day == null) firsts.standing100Day = d;
      if (snap.standing >= 200 && firsts.standing200Day == null) firsts.standing200Day = d;
    }
    if (snap.wave >= 4 && firsts.wave4Day == null) firsts.wave4Day = d;
    if (snap.wave >= 5 && firsts.wave5Day == null) firsts.wave5Day = d;
  }
  const policy = Object.assign({}, base, {
    upkeep(G, ctx) {
      let r;
      try { r = base.upkeep ? base.upkeep(G, ctx) : undefined; } catch (e) { r = undefined; }
      if (isHunt) {
        try {
          const d = ctx && ctx._feastFightDay, sw = ctx && ctx._feastFightSweeps;
          if (d && (sw | 0) > 0) patrolByDay[d] = Math.max(patrolByDay[d] || 0, sw | 0);
        } catch (e) {}
      }
      return r;
    },
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      let preSnap = null, preOrd = 0;
      try {
        preSnap = tableSnap(G);
        recordFirsts(preSnap, true);
        preOrd = preSnap.rankOrd;
      } catch (e) { preSnap = null; }
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      try {
        const postSnap = tableSnap(G);
        recordFirsts(postSnap, false);
        rankTrace.push({ day: postSnap.day, pre: preOrd, post: postSnap.rankOrd });
        tableTrace.push(postSnap);
        if (prevPostWaiting && !postSnap.tableWaiting && !postSnap.tableDone) withdrawalDays.push(postSnap.day);
        prevPostWaiting = postSnap.tableWaiting;
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = tableSnap(Game);
  recordFirsts(end, false);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ctxOut = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0) ctxOut[k] = capturedCtx[k];
    }
    for (const k of ['facedDraw', 'feasts', 'armedFeasts']) if (capturedCtx[k] !== undefined) ctxOut[k] = capturedCtx[k];
  }
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: 0, // set from Game.won below, after runDays returns
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: Math.max.apply(null, tableTrace.map(t => t.arc || 1).concat([1])),
    finalRank: end.rank,
    maxRank: RANK_NAMES[Math.max.apply(null, rankTrace.map(t => Math.max(t.pre, t.post)).concat([0]))] || 'village',
    nationalEver: Math.max.apply(null, rankTrace.map(t => Math.max(t.pre, t.post)).concat([0])) >= 2 ? 1 : 0,
    nationalFinal: end.rankOrd >= 2 ? 1 : 0,
    table: firsts.invitationDay != null ? 1 : 0,
    entered: firsts.enteredDay != null ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts: ctxOut,
    ctxOut: ctxOut,
    tsNationalDay: ctxOut.tsNationalDay != null ? ctxOut.tsNationalDay : null,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    sayLines: sayLines,
    firsts: firsts,
    withdrawalDays: withdrawalDays,
    finalSnap: end,
    preNationalDay: firsts.preNationalDay,
    postNationalDay: firsts.postNationalDay,
    preGlobalDay: firsts.preGlobalDay,
    postGlobalDay: firsts.postGlobalDay,
    rankTrace: rankTrace,
    tableTrace: tableTrace,
  };
  // won: the engine's win flag (Game.won), read directly.
  try { row.won = Game.won ? 1 : 0; } catch (e) { row.won = 0; }
  // entered, by the engine's own definition, is tableDone (the seat
  // taken); firsts.enteredDay already tracks it. table (invited)
  // is tableWaiting ever true — firsts.invitationDay.
  if (isHunt) {
    row.patrol = { byDay: patrolByDay, total: Object.values(patrolByDay).reduce((t, v) => t + v, 0), days: Object.keys(patrolByDay).length };
    row.feastdraw = {
      grants: fdStore.grants, draws: fdStore.draws, faces: fdStore.faces,
      driveoffs: fdStore.driveoffs, clears: fdStore.clears,
      diag: { errs: fdStore.errs, errors: fdStore.errors, overflow: fdStore.overflow, installed: fdStore.installed },
    };
    row.nonworldkill = {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
    };
  }
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-hunttable-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const f = row.firsts;
  const fd = row.feastdraw || {};
  const draws = (fd.draws || []).length, driven = (fd.driveoffs || []).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNat=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} preNat=${f.preNationalDay} postNat=${f.postNationalDay} preGlob=${f.preGlobalDay} postGlob=${f.postGlobalDay} arc234=${f.arc2Day}/${f.arc3Day}/${f.arc4Day} barsW123=${f.barW1Day}/${f.barW2Day}/${f.barW3Day} barsC=${f.barContestsDay} barsCr=${f.barCrisesDay} barsStage=${f.barStageDay} barsSent=${f.barSentimentDay} barsSurge=${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} prev=${f.previewDay} prevReady=${f.previewReadyDay} enteredDay=${f.enteredDay} withdraw=${JSON.stringify(row.withdrawalDays)} draws=${draws} driven=${driven} facedDrawCtx=${row.ctxOut.facedDraw != null ? row.ctxOut.facedDraw : '-'} sayLines=${row.sayLines.length}`);
}

function bandOf(rows) {
  return {
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
  };
}
const COLLAPSED = [73903, 73904, 73906, 73907, 73908];
const STEP_KEYS = ['arc4Day', 'barW1Day', 'barW2Day', 'barW3Day', 'barContestsDay', 'barCrisesDay', 'barStageDay', 'barSentimentDay', 'barSurgeDay', 'seatFirstDay', 'invitationDay', 'previewDay', 'previewReadyDay', 'enteredDay'];

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['hunttable-anchor', 'hunttable-hunt']) {
    const rows = [];
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    if (rows.length !== SEEDS.length || rows.some(r => r.days <= 0)) corpusOk = false;
    const band = bandOf(rows);
    arms[pid] = { band, rows: rows.map(r => ({ seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc, finalRank: r.finalRank, natEver: r.nationalEver, table: r.table, entered: r.entered, firsts: r.firsts, withdrawalDays: r.withdrawalDays, finalSeat: r.finalSnap.seat, finalSeatDetail: r.finalSnap.seatDetail, finalPreview: r.finalSnap.preview, starv: r.starvationDeaths, deaths: r.deathTotal })) };
    console.log(`  ${pid} BAND: won=${band.won}/${band.n} median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
    for (const r of rows) {
      const f = r.firsts;
      console.log(`  ${pid} s${r.seed}: days=${r.days} won=${r.won} wave=${r.waveReach} arc=${r.maxArc} final=${r.finalRank} natEver=${r.nationalEver} tsNat=${r.tsNationalDay} preNat=${f.preNationalDay} postNat=${f.postNationalDay} preGlob=${f.preGlobalDay} postGlob=${f.postGlobalDay} arc234=${f.arc2Day}/${f.arc3Day}/${f.arc4Day} bars=${f.barW1Day}/${f.barW2Day}/${f.barW3Day}/${f.barContestsDay}/${f.barCrisesDay}/${f.barStageDay}/${f.barSentimentDay}/${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} prev=${f.previewDay} prevReady=${f.previewReadyDay} enteredDay=${f.enteredDay} withdraw=${JSON.stringify(r.withdrawalDays)} finalSeat=${r.finalSnap.seat} finalDetail=${JSON.stringify(r.finalSnap.seatDetail)}`);
    }
  }
  // Per-step divergence on the collapsed seeds (anchor-invited,
  // hunt-not, per transient2): a step is DIVERGENT on a seed
  // when the anchor reached it and the hunt did not (or vice
  // versa, reported as such). A step both reached is not
  // divergent even if the days differ — the day gap is shown.
  const bySeed = {};
  for (const pid of ['hunttable-anchor', 'hunttable-hunt']) {
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (fs.existsSync(p)) { const r = JSON.parse(fs.readFileSync(p, 'utf8')); (bySeed[seed] = bySeed[seed] || {})[pid] = r; }
    }
  }
  console.log('  DIVERGENCE (collapsed seeds 73903,73904,73906,73907,73908): step = anchor-day / hunt-day, X = never reached');
  for (const seed of COLLAPSED) {
    const a = bySeed[seed] && bySeed[seed]['hunttable-anchor'];
    const h = bySeed[seed] && bySeed[seed]['hunttable-hunt'];
    if (!a || !h) { console.log(`  s${seed}: MISSING ROW`); corpusOk = false; continue; }
    const parts = STEP_KEYS.map(k => {
      const av = a.firsts[k], hv = h.firsts[k];
      const tag = (av == null && hv == null) ? 'both-X' : (av != null && hv == null) ? 'ANCHOR-ONLY' : (av == null && hv != null) ? 'HUNT-ONLY' : 'both';
      return `${k}=${av != null ? av : 'X'}/${hv != null ? hv : 'X'}(${tag})`;
    });
    console.log(`  s${seed}: anchor table=${a.table} entered=${a.entered} won=${a.won} | hunt table=${h.table} entered=${h.entered} won=${h.won} | ${parts.join(' ')}`);
  }
  const divCounts = {};
  for (const k of STEP_KEYS) {
    let n = 0;
    for (const seed of COLLAPSED) {
      const a = bySeed[seed] && bySeed[seed]['hunttable-anchor'];
      const h = bySeed[seed] && bySeed[seed]['hunttable-hunt'];
      if (a && h && ((a.firsts[k] != null) !== (h.firsts[k] != null))) n++;
    }
    divCounts[k] = n;
  }
  console.log(`  DIVERGENT-STEP COUNTS (of 5 collapsed seeds): ${JSON.stringify(divCounts)}`);
  const summary = { arms, divCounts, corpusOk,
    verdict: corpusOk ? 'CORPUS-PASS (verdict judged in evidence against the pre-registered DIAG-GO, not re-scored)' : 'CORPUS-FAIL' };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  VERDICT: ${summary.verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateAnchor() {
  const seed = parseInt(process.env.SEED || '73901', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const baseRow = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'hunttable-detgate-anchor-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return tableseatNowait.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const endWon = Game.won ? 1 : 0;
    return { days: result.days, gameDays: result.gameDays, won: endWon, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('hunttable-anchor', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-ANCHOR seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'anchor', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-anchor-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate-anchor.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function detgateHunt() {
  const seed = parseInt(process.env.SEED || '73901', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1'; process.env.NONWORLDKILL = '1';
  process.env.FEASTDRAWCLEAN = '1'; delete process.env.COMPETENT_SEEK_FIGHTS;
  const baseRow = await (async () => {
    const fdStore = newFdStore(), nwkStore = newNwkStore();
    const base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore);
    const { Game } = await loadGame({ seed, mode: 'hunttable-detgate-hunt-base', fullTelemetry: false });
    await setupGame(Game);
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const endWon = Game.won ? 1 : 0;
    return { days: result.days, gameDays: result.gameDays, won: endWon, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('hunttable-hunt', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-HUNT seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'hunt', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-hunt-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate-hunt.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && (argv[1] === 'hunttable-anchor' || argv[1] === 'hunttable-hunt')) return oneMode(argv[1], argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate-anchor') return detgateAnchor();
  if (argv[0] === '--detgate-hunt') return detgateHunt();
  console.error('usage: test-hunttable-sweep.js (--one hunttable-anchor|hunttable-hunt <seed> | --summary | --detgate-anchor | --detgate-hunt)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { runOne, tableSnap, RANK_ORDER, RANK_NAMES };
