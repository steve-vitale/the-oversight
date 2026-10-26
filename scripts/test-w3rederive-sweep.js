#!/usr/bin/env node
// scripts/sim-w3rederive-sweep.js — sim-w3rederive-a sweep (DIAG ONLY).
// Measures the wave-3 lesser-seat bar precisely on the collapsed band
// 73901-73908, both columns, against the hunttable substrate:
//   anchor: plain tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1)
//   hunt:   driveoff-clean shape exactly as hunttable/transient2
//           (FEASTDRAWCLEAN=1, tableseat-nowait substrate,
//           COMPETENT_SEEK_FIGHTS left at default ON, feastdraw +
//           nonworldkill recorders installed as the freshtransient
//           sweep does) + this arm's wave-3 recorder.
// This is a NEW file composing existing policies read-only; it does
// not edit or import the hunttable sweep or any hunttable recorder.
// The wave-3 recorder (scripts/policies/wave3bar-diag.js) is a pure
// observer around Game.recordDeedFight (calls the original exactly
// once, records only reads) plus pure-read daily snapshots of
// state.scholar.prog.deeds.wavesFaced (never deedState(), which
// would CREATE pg.deeds) and the live tableSeat() pricing (the
// engine's own pricing call, as the Haven panel calls it).
// Horizon: 180d death-aware (runDays stops dead villages; 180 is
// the cap, not a fixed horizon), one seed per exec call.
// Modes (no --help probe; read argv handling here):
//   --one w3rederive-anchor|w3rederive-hunt <seed>
//   --summary
//   --detgate-anchor | --detgate-hunt   (SEED env, default 73901)
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
const {
  newStore: newW3Store, installWave3barDiag, wave3Snap, W3_IDS,
} = require('./policies/wave3bar-diag');

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
// Pure-read snapshot: deed-feed counts (state read, never deedState()),
// plus the live tableSeat() pricing and the food-thesis halves.
function seatSnap(Game) {
  const out = {
    day: 0, rank: 'village', rankOrd: 0, arc: 1,
    tableWaiting: false, tableDone: false,
    sentimentTaught: false, crisesN: 0, feastSurgeUsed: false,
    stage: 0, wave: 1, seat: 'none', seatDetail: null, faced: null,
  };
  try { out.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; out.rankOrd = RANK_ORDER[out.rank] || 0; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1;
    out.tableWaiting = !!pg.tableWaiting;
    out.tableDone = !!pg.tableDone;
    out.sentimentTaught = !!pg.sentimentTaught;
    out.crisesN = Object.keys(pg.crises || {}).length;
  } catch (e) {}
  try { const s = (Game.state || {}).scholar || {}; out.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed); } catch (e) {}
  try { out.stage = (Game.integrationStage ? Game.integrationStage() : 0) || 0; } catch (e) {}
  try { out.wave = (Game.unlockedWave ? Game.unlockedWave() : 1) || 1; } catch (e) {}
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
  try { const ws = wave3Snap(Game); out.faced = ws.faced; } catch (e) {}
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  const isHunt = pid === 'w3rederive-hunt';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let fdStore = null, nwkStore = null, base;
  if (isHunt) {
    process.env.FEASTDRAW = '1';
    process.env.NONWORLDKILL = '1';
    process.env.FEASTDRAWCLEAN = '1';
    delete process.env.COMPETENT_SEEK_FIGHTS;
    fdStore = newFdStore(); nwkStore = newNwkStore();
    base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'w3rederive sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'w3rederive sweep + feast-draw yield census', fdStore);
  } else {
    delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
    delete process.env.FEASTDRAWCLEAN; delete process.env.DEVOTIONGATE; delete process.env.DEVOTIONGATEDIAG;
    base = tableseatNowait;
  }
  const { Game } = await loadGame({ seed, mode: 'w3rederive-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (isHunt) {
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  }
  const w3Store = newW3Store();
  try { installWave3barDiag(Game, w3Store); } catch (e) { w3Store.errs.push('install failed: ' + String((e && e.message) || e).slice(0, 160)); }
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/national|global|table|realm|polity|circling the edge|drove off|never brave|gives up and moves on|withdraw|being set|ARC IV|ARC III|feast surge|feasted|wave-blood|food-thesis|deeds are not/i.test(t) && sayLines.length < 300) {
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
    invitationDay: null, enteredDay: null, wave4Day: null, wave5Day: null,
  };
  const w3FirstDay = {}; // mid -> first day the mid appears in a snapshot
  const w3Traj = []; // {day, w3, w3Ids} only on change
  let lastW3Key = null;
  const rankTrace = [];
  const seatTrace = [];
  let prevPostWaiting = false;
  const withdrawalDays = [];
  let capturedCtx = null;
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
    }
    if (snap.sentimentTaught && firsts.barSentimentDay == null) firsts.barSentimentDay = d;
    if (snap.feastSurgeUsed && firsts.barSurgeDay == null) firsts.barSurgeDay = d;
    if (snap.seat !== 'none' && firsts.seatFirstDay == null) { firsts.seatFirstDay = d; firsts.seatFirstKind = snap.seat; }
    if (snap.tableWaiting && firsts.invitationDay == null) firsts.invitationDay = d;
    if (snap.tableDone && firsts.enteredDay == null) firsts.enteredDay = d;
    if (snap.wave >= 4 && firsts.wave4Day == null) firsts.wave4Day = d;
    if (snap.wave >= 5 && firsts.wave5Day == null) firsts.wave5Day = d;
    // Wave-3 trajectory from the deed-feed snapshot itself.
    try {
      const faced = snap.faced || {};
      const w3Ids = Object.keys(faced).filter(m => (faced[m] | 0) === 3).sort();
      for (const m of w3Ids) if (w3FirstDay[m] == null) w3FirstDay[m] = d;
      const key = w3Ids.join(',');
      if (key !== lastW3Key) { w3Traj.push({ day: d, w3: w3Ids.length, w3Ids: w3Ids.slice() }); lastW3Key = key; }
    } catch (e) {}
  }
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      let preSnap = null, preOrd = 0;
      try { preSnap = seatSnap(G); recordFirsts(preSnap, true); preOrd = preSnap.rankOrd; } catch (e) { preSnap = null; }
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      try {
        const postSnap = seatSnap(G);
        recordFirsts(postSnap, false);
        rankTrace.push({ day: postSnap.day, pre: preOrd, post: postSnap.rankOrd });
        seatTrace.push(postSnap);
        if (prevPostWaiting && !postSnap.tableWaiting && !postSnap.tableDone) withdrawalDays.push(postSnap.day);
        prevPostWaiting = postSnap.tableWaiting;
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = seatSnap(Game);
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
  // Route census from the deed-call log (first call per mid wins for
  // the face route; counts cover every call).
  const routeCounts = {};
  for (const c of w3Store.deedCalls) routeCounts[c.route] = (routeCounts[c.route] || 0) + 1;
  const routeCountsW3 = {};
  for (const c of w3Store.deedCalls) if ((c.wave | 0) === 3) routeCountsW3[c.route] = (routeCountsW3[c.route] || 0) + 1;
  const w3Route = {};
  for (const f of w3Store.faces) if ((f.wave | 0) === 3) w3Route[f.mid] = { day: f.day, route: f.route };
  // Snapshot-first mids with no call-log face (faced before install):
  // route unknown, day from snapshot.
  for (const m of Object.keys(w3FirstDay)) {
    if (!w3Route[m]) w3Route[m] = { day: w3FirstDay[m], route: 'pre-install/unknown' };
  }
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: 0, waveReach: result.maxWaveUnlocked || 1,
    maxArc: Math.max.apply(null, seatTrace.map(t => t.arc || 1).concat([1])),
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
    ts: ctxOut, ctxOut: ctxOut,
    tsNationalDay: ctxOut.tsNationalDay != null ? ctxOut.tsNationalDay : null,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    sayLines: sayLines,
    firsts: firsts,
    withdrawalDays: withdrawalDays,
    finalSnap: end,
    finalFaced: end.faced,
    finalSeatDetail: end.seatDetail,
    w3FirstDay: w3FirstDay,
    w3Traj: w3Traj,
    w3Route: w3Route,
    w3Store: { faces: w3Store.faces, deedCallCount: w3Store.deedCalls.length, routeCounts, routeCountsW3, errs: w3Store.errs, installed: w3Store.installed },
  };
  try { row.won = Game.won ? 1 : 0; } catch (e) { row.won = 0; }
  if (isHunt) {
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

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-w3rederive-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const f = row.firsts;
  const fd = row.feastdraw || {};
  const draws = (fd.draws || []).length, driven = (fd.driveoffs || []).length;
  const fs3 = row.finalSnap.seatDetail || {};
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNat=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} barsW123=${f.barW1Day}/${f.barW2Day}/${f.barW3Day} barsC=${f.barContestsDay} barsCr=${f.barCrisesDay} barsStage=${f.barStageDay} barsSent=${f.barSentimentDay} barsSurge=${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} enteredDay=${f.enteredDay} finalW=${fs3.w1}/${fs3.w2}/${fs3.w3}/${fs3.w4}/${fs3.w5} finalSeat=${row.finalSnap.seat} w3First=${JSON.stringify(row.w3FirstDay)} w3Route=${JSON.stringify(row.w3Route)} draws=${draws} driven=${driven} deedCalls=${row.w3Store.deedCallCount} routes=${JSON.stringify(row.w3Store.routeCounts)} routesW3=${JSON.stringify(row.w3Store.routeCountsW3)} sayLines=${row.sayLines.length}`);
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

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['w3rederive-anchor', 'w3rederive-hunt']) {
    const rows = [];
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    if (rows.length !== SEEDS.length || rows.some(r => r.days <= 0)) corpusOk = false;
    const band = bandOf(rows);
    arms[pid] = { band, rows: rows.map(r => ({ seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc, finalRank: r.finalRank, natEver: r.nationalEver, table: r.table, entered: r.entered, firsts: r.firsts, finalSeatDetail: r.finalSeatDetail, finalFaced: r.finalFaced, w3FirstDay: r.w3FirstDay, w3Traj: r.w3Traj, w3Route: r.w3Route, routeCountsW3: r.w3Store.routeCountsW3, deedCallCount: r.w3Store.deedCallCount })) };
    console.log(`  ${pid} BAND: won=${band.won}/${band.n} median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
    for (const r of rows) {
      const f = r.firsts;
      console.log(`  ${pid} s${r.seed}: days=${r.days} won=${r.won} wave=${r.waveReach} arc=${r.maxArc} final=${r.finalRank} natEver=${r.nationalEver} table=${r.table} entered=${r.entered} bars=${f.barW1Day}/${f.barW2Day}/${f.barW3Day}/${f.barContestsDay}/${f.barCrisesDay}/${f.barStageDay}/${f.barSentimentDay}/${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} enteredDay=${f.enteredDay} finalW=${(r.finalSeatDetail || {}).w1}/${(r.finalSeatDetail || {}).w2}/${(r.finalSeatDetail || {}).w3}/${(r.finalSeatDetail || {}).w4}/${(r.finalSeatDetail || {}).w5} finalSeat=${r.finalSnap.seat} w3First=${JSON.stringify(r.w3FirstDay)} w3Route=${JSON.stringify(r.w3Route)} deedCalls=${r.w3Store.deedCallCount} routesW3=${JSON.stringify(r.w3Store.routeCountsW3)}`);
    }
  }
  const bySeed = {};
  for (const pid of ['w3rederive-anchor', 'w3rederive-hunt']) {
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (fs.existsSync(p)) { const r = JSON.parse(fs.readFileSync(p, 'utf8')); (bySeed[seed] = bySeed[seed] || {})[pid] = r; }
    }
  }
  console.log('  W3 BAR TABLE (collapsed + 73905 control): finalW3 = anchor/hunt, barDay = anchor/hunt, X = never');
  for (const seed of [73903, 73904, 73905, 73906, 73907, 73908]) {
    const a = bySeed[seed] && bySeed[seed]['w3rederive-anchor'];
    const h = bySeed[seed] && bySeed[seed]['w3rederive-hunt'];
    if (!a || !h) { console.log(`  s${seed}: MISSING ROW`); corpusOk = false; continue; }
    const af = a.finalSeatDetail || {}, hf = h.finalSeatDetail || {};
    console.log(`  s${seed}: finalW3=${af.w3}/${hf.w3} barW3Day=${a.firsts.barW3Day != null ? a.firsts.barW3Day : 'X'}/${h.firsts.barW3Day != null ? h.firsts.barW3Day : 'X'} surgeDay=${a.firsts.barSurgeDay != null ? a.firsts.barSurgeDay : 'X'}/${h.firsts.barSurgeDay != null ? h.firsts.barSurgeDay : 'X'} seat=${a.firsts.seatFirstDay != null ? a.firsts.seatFirstDay + ':' + a.firsts.seatFirstKind : 'X'}/${h.firsts.seatFirstDay != null ? h.firsts.seatFirstDay + ':' + h.firsts.seatFirstKind : 'X'} anchorW3=${JSON.stringify(a.w3FirstDay)} huntW3=${JSON.stringify(h.w3FirstDay)} anchorRoutes=${JSON.stringify(a.w3Route)} huntRoutes=${JSON.stringify(h.w3Route)}`);
  }
  const summary = { arms, corpusOk, w3Ids: W3_IDS,
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
    const { Game } = await loadGame({ seed, mode: 'w3rederive-detgate-anchor-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return tableseatNowait.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    return { days: result.days, gameDays: result.gameDays, won: Game.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('w3rederive-anchor', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-ANCHOR seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'anchor', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay, firsts: wrappedRow.firsts, finalSeatDetail: wrappedRow.finalSeatDetail, finalFaced: wrappedRow.finalFaced }, match }, null, 1) + '\n';
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
    const { Game } = await loadGame({ seed, mode: 'w3rederive-detgate-hunt-base', fullTelemetry: false });
    await setupGame(Game);
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    return { days: result.days, gameDays: result.gameDays, won: Game.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('w3rederive-hunt', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-HUNT seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'hunt', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay, firsts: wrappedRow.firsts, finalSeatDetail: wrappedRow.finalSeatDetail, finalFaced: wrappedRow.finalFaced }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-hunt-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate-hunt.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && (argv[1] === 'w3rederive-anchor' || argv[1] === 'w3rederive-hunt')) return oneMode(argv[1], argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate-anchor') return detgateAnchor();
  if (argv[0] === '--detgate-hunt') return detgateHunt();
  console.error('usage: sim-w3rederive-sweep.js (--one w3rederive-anchor|w3rederive-hunt <seed> | --summary | --detgate-anchor | --detgate-hunt)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
