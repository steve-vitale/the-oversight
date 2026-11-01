#!/usr/bin/env node
// scripts/dawnblock-a-sweep.js — sim-dawnblock-a sweep + analyzer
// (scale-onramp axis, 2026-11-01, run fleshout-loop-a-20261101T1235Z).
// DIAG ONLY: zero src/js changes, zero edits to existing scripts or
// policy files. This file is the arm's ONLY new driver; the recorder
// layer lives in scripts/policies/dawnblock-diag.js.
//
// QUESTION (1016Z next blank 2, from sim-seathes-a): WHY does a
// lingering encounter block sitting at dawn on 78201's last 8
// mornings (days 173-180) and 78208's days 140/147/148/163, and
// would clearing it let the seat leg fire? The primary block is
// the policy-national vs lesser-regional gate mismatch (steve-call,
// NOT re-litigated here); this arm isolates ONLY the secondary
// dawn-encounter block.
//
// COMPOSITION: withDawnblockDiag(withSeatHesDiag(withVet2Diag(
// withFullseatDiag(tableseatNowait)))). Env: LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1, FULLSEAT=1, VET2=1, DAWNBLOCK=1. Horizon:
// 180d death-aware (the seathes band/horizon, reused exactly).
// DAWNBLOCKOFF=1 forces the dawnblock layer OFF in-process (the
// neutrality OFF leg; OFF runs write to a scratch EVID dir, never
// to the judged corpus).
//
// MODES:
//   default: sweep seeds 78201-78208 (SEEDS/DAYS/EVID overrides),
//     per-seed row + decision-series files, summary.json, printed
//     table + verdict. Exit 1 on gate failure.
//   --analyze: read the corpora (EVID or default), print the
//     per-seed held-dawn classification + episode table +
//     neutrality comparison vs the seathes corpus, exit 1 on
//     gate failure. No sims run.
//   --sense SEED: NON-MEASURED narration replay; captures every
//     seat/table/overtime/raid/encounter/herald line from day 120
//     on (the blocked window on both seeds). Never enters the
//     census.
//   --offcheck DIR: compare DIR's rows (an OFF-leg scratch sweep)
//     to the judged corpus on end fields only; exit 1 on any
//     diff. No sims run.
//
// CLASSIFICATION (per held dawn; held = decision-moment seat
// lesser/full, table not done, run alive):
//   ENTRY-BLOCKED/ENCOUNTER (operative game block: preview
//   non-null, not ready, why = encounter line) — the headline
//   set; RANK-GATE (preview ready, rank < 2 — policy gate);
//   PREVIEW-NULL (subclass by cause; encounter may still be
//   PRESENT but is not the operative block); ENTRY-BLOCKED
//   CONTEST/HAVEN/OTHER; GAME-OPEN (preview ready, rank >= 2,
//   and the seathes ts diff shows an attempt); SAT (ts diff
//   shows a take that day); UNCLASSIFIED/READY-BUT-NO-ATTEMPT
//   (preview ready, rank >= 2, ts diff shows no attempt — the
//   honest failure class that keeps the coverage bar honest).
//   rankGateAlsoBinding (rank < 2) and soleBlocker (rank >= 2,
//   access != 'none', no contest) are recorded on EVERY
//   encounter-blocked held dawn, answering Q4 at the same
//   decision moment.
// Episodes + clearance outcomes: see dawnblock-diag.js.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withFullseatDiag, snapFullSeat } = require('./policies/fullseat-diag');
const { withVet2Diag } = require('./policies/vet2-diag');
const { withSeatHesDiag } = require('./seathes-a-sweep');
const {
  withDawnblockDiag, classifyHeldDawn, isHeldDawn,
  isEncounterBlockedHeldDawn, buildEpisodes,
} = require('./policies/dawnblock-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const COMP_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];
const SEATHES_DIR = path.join(REPO, 'evidence', '2026-11-01', 'seathes-a-perseed');
const TS_KEYS = ['tsPreviewSeen', 'tsPreviewNotReady', 'tsSeatAttempts', 'tsSeatTaken', 'tsSeatFailed', 'tsGuardRefused', 'tsNoScholar', 'tsSeatErr', 'tsTableErr', 'tsNationalDay', 'tsSeatDay', 'tsSeatKind', 'tsTableAnswers', 'tsTablePath'];

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function tsDiff(a, b) {
  const o = {};
  for (const k of TS_KEYS) {
    const av = (a && a[k]) | 0, bv = (b && b[k]) | 0;
    if (typeof (a && a[k]) === 'number' || typeof (b && b[k]) === 'number') o[k] = bv - av;
    else if (typeof (b && b[k]) === 'string') o[k] = b[k];
  }
  return o;
}

function summarizeSeed(row, series, seatHesSeries) {
  // Seat-leg outcome cross-check from the seathes series (same daily
  // calls, ts counter diffs): a GAME-OPEN dawn with no attempt and
  // no take is UNCLASSIFIED (ready but no attempt — the seathes
  // scheme's honest failure class), and a dawn whose diff shows a
  // take is SAT, not GAME-OPEN. Without this cross-check the
  // coverage bar would be trivially 100% (every dawn gets some
  // class); with it, coverage actually tests the leg's behavior.
  const tsByDay = {};
  try {
    for (const x of (seatHesSeries || [])) {
      const diff = tsDiff((x.pre && x.pre.tsB) || {}, (x.post && x.post.tsA) || {});
      tsByDay[(x.pre || {}).d] = diff;
    }
  } catch (e) {}
  const held = [];
  for (let i = 0; i < series.length; i++) {
    const r = series[i];
    if (!isHeldDawn(r)) continue;
    const cls = classifyHeldDawn(r);
    cls.rowIdx = i;
    const diff = tsByDay[(r.pre || {}).d] || null;
    if (diff && (diff.tsSeatTaken | 0) > 0) { cls.class = 'SAT'; cls.subclass = null; }
    else if (cls.class === 'GAME-OPEN' && diff && (diff.tsSeatAttempts | 0) === 0) {
      cls.class = 'UNCLASSIFIED'; cls.subclass = 'READY-BUT-NO-ATTEMPT';
    }
    held.push(cls);
  }
  const classCounts = {};
  for (const h of held) {
    const k = h.class + (h.subclass ? '/' + h.subclass : '');
    classCounts[k] = (classCounts[k] | 0) + 1;
  }
  const classified = held.filter(h => h.class !== 'UNCLASSIFIED');
  const encBlocked = held.filter(h => isEncounterBlockedHeldDawn(h));
  const episodes = buildEpisodes(series);
  // Trace every encounter-blocked held dawn: kind + firing signal +
  // pending age (position inside its episode) + clearance outcome.
  const traced = [];
  const untraced = [];
  for (const h of encBlocked) {
    const ep = episodes.find(e => e.rows.indexOf(h.rowIdx) >= 0 && e.key === h.identityKey);
    if (!ep) { untraced.push({ day: h.day, why: 'no-episode' }); continue; }
    const pos = ep.rows.indexOf(h.rowIdx) + 1;
    if (!h.encounterKind || h.encounterKind === 'none' || !h.firingSignal || !ep.clearance) {
      untraced.push({ day: h.day, why: 'missing-field', kind: h.encounterKind, signal: h.firingSignal, clearance: ep.clearance });
      continue;
    }
    traced.push({
      day: h.day, kind: h.encounterKind, signal: h.firingSignal,
      identityKey: h.identityKey, monsterId: ep.monsterId, monsterName: ep.monsterName,
      monsterWave: ep.monsterWave, tile: ep.tile, scholarTile: ep.scholarTile,
      ageDawns: pos, episodeDawns: ep.dawns, episodeDays: `${ep.firstDay}..${ep.lastDay}`,
      clearance: ep.clearance, clearanceDay: ep.clearanceDay,
      rankGateAlsoBinding: h.rankGateAlsoBinding, soleBlocker: h.soleBlocker,
      access: h.access, rank: h.rank,
    });
  }
  const heldEpisodes = episodes.filter(e => e.blockedHeldDawns > 0);
  // Tile-block runs: consecutive held dawns (by series row order) ALL
  // encounter-blocked, regardless of WHICH monster identity. The
  // lived block on 78201 is 8 mornings even though the identity
  // changes on the last morning (herald wanders off, mirrormoth
  // stays) — identity episodes alone would report 7+1 and understate
  // the continuous block. Both views are reported; neither replaces
  // the other.
  const blockedRuns = [];
  let run = null;
  for (const h of held) {
    if (isEncounterBlockedHeldDawn(h)) {
      if (run && h.rowIdx === run.lastIdx + 1) { run.lastIdx = h.rowIdx; run.lastDay = h.day; run.dawns += 1; }
      else { run = { firstDay: h.day, lastDay: h.day, dawns: 1, lastIdx: h.rowIdx }; blockedRuns.push(run); }
    } else run = null;
  }
  const longestBlockedRun = blockedRuns.reduce((m, r) => Math.max(m, r.dawns), 0);
  const seatHesLen = row.seatHesSeriesLen;
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: row.won, finalRank: row.finalRank, maxRank: row.maxRank,
    seriesRows: series.length, seriesErrs: row.dawnblockErrs | 0,
    diagDays: row.diag ? row.diag.days : null, vetDays: row.vet ? row.vet.days : null,
    seatHesRows: seatHesLen != null ? seatHesLen : null,
    seriesOk: series.length > 0 && series.length === (row.diag ? row.diag.days : -1) && series.length === (row.vet ? row.vet.days : -2) && (row.dawnblockErrs | 0) === 0,
    heldN: held.length, heldFirst: held.length ? held[0].day : null, heldLast: held.length ? held[held.length - 1].day : null,
    classCounts, classifiedN: classified.length,
    coverage: held.length ? classified.length / held.length : 1,
    encBlockedN: encBlocked.length, encBlockedDays: encBlocked.map(h => h.day),
    soleBlockerN: encBlocked.filter(h => h.soleBlocker).length,
    rankAlsoN: encBlocked.filter(h => h.rankGateAlsoBinding).length,
    tracedN: traced.length, untracedN: untraced.length, untraced,
    traced,
    blockedRuns: blockedRuns.map(r => ({ firstDay: r.firstDay, lastDay: r.lastDay, dawns: r.dawns })),
    longestBlockedRun,
    episodes: heldEpisodes.map(e => ({
      key: e.key, kind: e.kind, monsterId: e.monsterId, monsterName: e.monsterName,
      monsterWave: e.monsterWave, tile: e.tile, scholarTile: e.scholarTile,
      firstDay: e.firstDay, lastDay: e.lastDay, dawns: e.dawns,
      heldDawns: e.heldDawns, blockedHeldDawns: e.blockedHeldDawns,
      clearance: e.clearance, clearanceDay: e.clearanceDay,
    })),
    allEpisodesN: episodes.length,
  };
}

// Neutrality/reproduction comparison vs the seathes corpus.
const NEUT_FIELDS = ['days', 'gameDays', 'starvationDeaths', 'waveReach', 'finalRank', 'maxRank',
  'nationalEver', 'nationalFinal', 'table', 'entered', 'enteredFull', 'won'];
function compareToSeathes(row, stRow) {
  const diffs = [];
  if (!stRow) return ['missing-seathes-row'];
  for (const f of NEUT_FIELDS) {
    if (row[f] !== stRow[f]) diffs.push(`${f}: ${row[f]} != seathes ${stRow[f]}`);
  }
  if (JSON.stringify(row.ts) !== JSON.stringify(stRow.ts)) diffs.push('ts differs');
  if (JSON.stringify(row.endSnap) !== JSON.stringify(stRow.endSnap)) diffs.push('endSnap differs');
  if (JSON.stringify(row.diag && row.diag.maxDist) !== JSON.stringify(stRow.diag && stRow.diag.maxDist)) diffs.push('diag.maxDist differs');
  if (stRow.vet && row.vet) {
    for (const f of ['endVet4n', 'endVet5n', 'maxVet4', 'maxVet5', 'maxVet4Day', 'maxVet5Day', 'w5killCount']) {
      if (row.vet[f] !== stRow.vet[f]) diffs.push(`vet.${f}: ${row.vet[f]} != seathes ${stRow.vet[f]}`);
    }
  } else diffs.push('vet block missing on one side');
  return diffs;
}
function loadSeathes() {
  const out = {};
  if (!fs.existsSync(SEATHES_DIR)) return out;
  for (const fn of fs.readdirSync(SEATHES_DIR).sort()) {
    if (!/^s[0-9]+\.json$/.test(fn)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(SEATHES_DIR, fn), 'utf8'));
    out[r.seed] = r;
  }
  return out;
}
function analyzeDir(evidDir) {
  const rows = [], series = {}, seatHes = {};
  for (const fn of fs.readdirSync(evidDir).sort()) {
    if (/^s[0-9]+\.json$/.test(fn)) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8')));
    else if (/^s[0-9]+-daily\.json$/.test(fn)) {
      const d = JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8'));
      series[d.seed] = d.series;
      seatHes[d.seed] = d.seatHesSeries || [];
    }
  }
  rows.sort((a, b) => a.seed - b.seed);
  const st = loadSeathes();
  const perSeed = rows.map(r => {
    const s = summarizeSeed(r, series[r.seed] || [], seatHes[r.seed] || []);
    s.neutDiffs = compareToSeathes(r, st[r.seed]);
    s.neutOk = s.neutDiffs.length === 0;
    // Seathes sat day (from the seathes corpus daily series, not judged here).
    try {
      const stDaily = JSON.parse(fs.readFileSync(path.join(SEATHES_DIR, `s${r.seed}-daily.json`), 'utf8'));
      const sat = (stDaily.series || []).filter(x => {
        const diff = tsDiff((x.pre && x.pre.tsB) || {}, (x.post && x.post.tsA) || {});
        return (diff.tsSeatTaken | 0) > 0;
      });
      s.satDay = sat.length ? sat[0].pre.d : null;
    } catch (e) { s.satDay = null; }
    return s;
  });
  const totalHeld = perSeed.reduce((a, s) => a + s.heldN, 0);
  const totalClassified = perSeed.reduce((a, s) => a + s.classifiedN, 0);
  const totalEncBlocked = perSeed.reduce((a, s) => a + s.encBlockedN, 0);
  const totalTraced = perSeed.reduce((a, s) => a + s.tracedN, 0);
  const totalUntraced = perSeed.reduce((a, s) => a + s.untracedN, 0);
  const s78201 = perSeed.find(s => s.seed === 78201);
  const s78208 = perSeed.find(s => s.seed === 78208);
  const shapeOk = !!s78201 && !!s78208 &&
    JSON.stringify(s78201.encBlockedDays) === JSON.stringify([173, 174, 175, 176, 177, 178, 179, 180]) &&
    JSON.stringify(s78208.encBlockedDays) === JSON.stringify([140, 147, 148, 163]);
  const agg = {
    n: perSeed.length,
    seriesOk: perSeed.filter(s => s.seriesOk).length,
    neutOk: perSeed.filter(s => s.neutOk).length,
    heldTotal: totalHeld, classifiedTotal: totalClassified,
    coverage: totalHeld ? totalClassified / totalHeld : 1,
    encBlockedTotal: totalEncBlocked, tracedTotal: totalTraced, untracedTotal: totalUntraced,
    soleBlockerTotal: perSeed.reduce((a, s) => a + s.soleBlockerN, 0),
    rankAlsoTotal: perSeed.reduce((a, s) => a + s.rankAlsoN, 0),
    shapeOk,
    diagGo: perSeed.length === 8 && perSeed.every(s => s.seriesOk && s.neutOk) &&
      (totalHeld ? totalClassified / totalHeld : 1) >= 0.90 &&
      totalUntraced === 0 && totalEncBlocked === totalTraced && shapeOk,
  };
  return { rows, perSeed, agg };
}

// --- sweep plumbing (mirrors the seathes sweep's runOne) ---
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
function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  const wantSha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      if (m[1] !== wantSha) throw new Error('writer sha mismatch');
      return wantSha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  for (let a = 1; a <= 30; a++) {
    try {
      fs.writeFileSync(p, body);
      const back = fs.readFileSync(p, 'utf8');
      if (back !== body) throw new Error('direct-write content mismatch');
      console.log(`WRITE-DIRECT-OK ${path.basename(p)} attempt=${a}`);
      return wantSha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-DIRECT-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      sleepMs(Math.min(20000, 2000 * a));
    }
  }
  throw lastErr;
}
function distFromSnap(s) {
  if (!s || !s.dist) return null;
  const d = {};
  for (const k of COMP_ORDER) d[k] = (s.dist[k] | 0);
  return { dist: d, binding: (s.binding || []).slice(), worst: s.worst || null, seat: s.seat || 'none', ok: !!s.ok };
}
function vetBlock(store, Game) {
  const rows = (store && store.rows) || [];
  let maxVet4 = 0, maxVet5 = 0, maxVet4Day = null, maxVet5Day = null;
  let maxVet4Names = {}, maxVet5Names = {};
  for (const r of rows) {
    if ((r.vet4 || []).length > maxVet4) { maxVet4 = r.vet4.length; maxVet4Day = r.day; maxVet4Names = r.names || {}; }
    if ((r.vet5 || []).length > maxVet5) { maxVet5 = r.vet5.length; maxVet5Day = r.day; maxVet5Names = r.names || {}; }
  }
  const last = rows.length ? rows[rows.length - 1] : null;
  const endVet4 = last ? (last.vet4 || []).slice() : [];
  const endVet5 = last ? (last.vet5 || []).slice() : [];
  let w5kills = [], w5killers = [], exactW3 = [], logLen = 0;
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    logLen = log.length;
    const scholarVid = (typeof Game.villagerId !== 'undefined') ? Game.villagerId : null;
    const isLiving = (vid) => {
      if (vid === scholarVid) return true;
      try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); } catch (e) { return false; }
    };
    const nameOf = (vid) => {
      try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
      return String(vid || '?').slice(0, 14);
    };
    const w5set = new Set(), w3set = new Set();
    for (const e of log) {
      if (!e || !e.by) continue;
      if ((e.w | 0) === 5) { w5kills.push({ by: e.by, type: e.type || null, day: e.day == null ? null : e.day }); w5set.add(e.by); }
      if ((e.w | 0) === 3) w3set.add(e.by);
    }
    for (const vid of w5set) w5killers.push({ vid, name: nameOf(vid), living: isLiving(vid) });
    for (const vid of w3set) exactW3.push({ vid, name: nameOf(vid), living: isLiving(vid) });
  } catch (e) {}
  return {
    days: rows.length, errs: (store && store.errs) | 0,
    endVet4, endVet5, endVet4n: endVet4.length, endVet5n: endVet5.length,
    maxVet4, maxVet4Day, maxVet5, maxVet5Day, maxVet4Names, maxVet5Names,
    w5kills, w5killers, w5killCount: w5kills.length, exactW3killers: exactW3, logLen,
  };
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  process.env.VET2 = '1';
  if (process.env.DAWNBLOCKOFF !== '1') process.env.DAWNBLOCK = '1';
  else delete process.env.DAWNBLOCK;
  process.env.SEATHES = '1';
  const base = withDawnblockDiag(
    withSeatHesDiag(
      withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
      'seathes-diag', 'tableseat-nowait + decision-moment seat recorder'),
    'dawnblock-diag', 'tableseat-nowait + dawn encounter recorder');
  const { Game } = await loadGame({ seed, mode: 'dawnblock-a', fullTelemetry: false });
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
  let endSnap = null;
  try { endSnap = snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  let diag = null;
  if (capturedCtx && capturedCtx._fullseatdiag) {
    const D = capturedCtx._fullseatdiag;
    diag = {
      days: D.days, errs: D.errs, max: D.max,
      bestSeat: D.bestSeat, firstFullSeatDay: D.firstFullSeatDay,
      firstLesserDay: D.firstLesserDay == null ? null : D.firstLesserDay,
      indispEver: !!D.indispEver, firstIndispDay: D.firstIndispDay,
      winDay: D.winDay, seats: D.seats,
      sentDay: D.sentDay == null ? null : D.sentDay,
      surgeDay: D.surgeDay == null ? null : D.surgeDay,
      winSnap: D.winSnap ? distFromSnap(D.winSnap) : null,
      winSnapFull: D.winSnap || null,
      firstFullSeatSnap: D.firstFullSeatSnap ? distFromSnap(D.firstFullSeatSnap) : null,
    };
    if (D.max) {
      const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
      const md = {};
      for (const k of ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage']) md[k] = Math.max(0, BARS[k] - (D.max[k] | 0));
      md.foodDeeds = (D.sentDay != null && D.surgeDay != null) ? 0 : 1;
      diag.maxDist = md;
    }
  }
  let vet = null;
  if (base.vet2Store) { try { vet = vetBlock(base.vet2Store, Game); } catch (e) { vet = { error: String((e && e.message) || e).slice(0, 120) }; } }
  if (!vet && base.vet2Store === undefined) vet = { error: 'vet2Store unreachable through dawnblock wrapper' };
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const series = (base.dawnblockStore && base.dawnblockStore.rows) || [];
  const dawnblockErrs = (base.dawnblockStore && base.dawnblockStore.errs) | 0;
  const seatHesSeries = (base.seatHesStore && base.seatHesStore.rows) || [];
  const row = {
    policy: 'dawnblock', seed,
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
    enteredFull: (endSnap && endSnap.seat === 'full') || (diag && diag.firstFullSeatDay != null) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    endSnap: distFromSnap(endSnap),
    endSnapFull: endSnap,
    winSnap: (diag && diag.winSnap ? diag.winSnap : null),
    diag, vet, dawnblockErrs, seatHesErrs: (base.seatHesStore && base.seatHesStore.errs) | 0,
    seatHesSeriesLen: seatHesSeries.length,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}.json`);
    writeRowViaWriter(fn, JSON.stringify(row, null, 1) + '\n');
    const dfn = path.join(evidDir, `s${seed}-daily.json`);
    writeRowViaWriter(dfn, JSON.stringify({ seed, series, dawnblockErrs, seatHesSeries }, null, 1) + '\n');
  }
  return { row, series, seatHesSeries };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '78201,78202,78203,78204,78205,78206,78207,78208')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'dawnblock-a-perseed');
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of seeds) {
    const { row, series, seatHesSeries } = await runOne(seed, days, evidDir);
    const s = summarizeSeed(row, series, seatHesSeries);
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} rank=${row.finalRank}/${row.maxRank} won=${row.won} seriesRows=${series.length} diagDays=${row.diag ? row.diag.days : '?'} vetDays=${row.vet ? row.vet.days : '?'} dawnErrs=${row.dawnblockErrs} seriesOk=${s.seriesOk} heldN=${s.heldN} encBlocked=${s.encBlockedN} ${JSON.stringify(s.encBlockedDays)} traced=${s.tracedN}/${s.encBlockedN} sole=${s.soleBlockerN} rankAlso=${s.rankAlsoN} episodes=${s.episodes.length}`);
  }
  const a = analyzeDir(evidDir);
  const summary = { label: 'sim-dawnblock-a sweep', seeds, days, perSeed: a.perSeed, agg: a.agg, generated: new Date().toISOString() };
  writeRowViaWriter(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('\n=== sim-dawnblock-a sweep ===');
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: seriesOk=${s.seriesOk} neutOk=${s.neutOk} heldN=${s.heldN} coverage=${s.coverage.toFixed(3)} encBlocked=${s.encBlockedN} traced=${s.tracedN} untraced=${s.untracedN} sole=${s.soleBlockerN} rankAlso=${s.rankAlsoN} neutDiffs=${JSON.stringify(s.neutDiffs)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} heldTotal=${a.agg.heldTotal} coverage=${a.agg.coverage.toFixed(3)} encBlockedTotal=${a.agg.encBlockedTotal} tracedTotal=${a.agg.tracedTotal} untracedTotal=${a.agg.untracedTotal} soleTotal=${a.agg.soleBlockerTotal} rankAlsoTotal=${a.agg.rankAlsoTotal} shapeOk=${a.agg.shapeOk}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function analyzeMode() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'dawnblock-a-perseed');
  const a = analyzeDir(evidDir);
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: days=${s.days} end=${s.endReason} seriesOk=${s.seriesOk} neutOk=${s.neutOk} heldN=${s.heldN} coverage=${s.coverage.toFixed(3)} encBlocked=${s.encBlockedN} ${JSON.stringify(s.encBlockedDays)} traced=${s.tracedN} untraced=${s.untracedN} sole=${s.soleBlockerN} rankAlso=${s.rankAlsoN} neutDiffs=${JSON.stringify(s.neutDiffs)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} heldTotal=${a.agg.heldTotal} coverage=${a.agg.coverage.toFixed(3)} encBlockedTotal=${a.agg.encBlockedTotal} tracedTotal=${a.agg.tracedTotal} untracedTotal=${a.agg.untracedTotal} soleTotal=${a.agg.soleBlockerTotal} rankAlsoTotal=${a.agg.rankAlsoTotal} shapeOk=${a.agg.shapeOk}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) process.exit(1);
}

async function offcheckMode(dir) {
  const judgedDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'dawnblock-a-perseed');
  const judged = {};
  for (const fn of fs.readdirSync(judgedDir).sort()) {
    if (!/^s[0-9]+\.json$/.test(fn)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(judgedDir, fn), 'utf8'));
    judged[r.seed] = r;
  }
  let bad = 0;
  for (const fn of fs.readdirSync(dir).sort()) {
    if (!/^s[0-9]+\.json$/.test(fn)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    const diffs = compareToSeathes(r, judged[r.seed]);
    // compareToSeathes diffs against seathes-shaped rows; judged rows
    // carry the same end fields, so reuse it directly.
    console.log(`  seed ${r.seed}: off-vs-judged diffs=${JSON.stringify(diffs)}`);
    if (diffs.length) bad += 1;
  }
  console.log(`  OFFCHECK: ${bad === 0 ? 'PASS' : 'FAIL'} (${bad} seeds differ)`);
  if (bad) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '78201', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-01', `sim-dawnblock-a-sense-${seed}.txt`);
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  process.env.VET2 = '1';
  process.env.SEATHES = '1';
  process.env.DAWNBLOCK = '1';
  const armed = withDawnblockDiag(
    withSeatHesDiag(
      withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
      'seathes-diag', 'tableseat-nowait + decision-moment seat recorder'),
    'dawnblock-diag', 'tableseat-nowait + dawn encounter recorder');
  const { Game } = await loadGame({ seed, mode: 'dawnblock-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  const kept = [];
  const KW = /seat|table|overtime|raid|encounter|herald/i;
  let origEmit = null;
  try {
    origEmit = Game.emit;
    if (typeof origEmit === 'function') {
      Game.emit = function (text, surface) {
        try {
          const day = PI.gday(Game);
          if (day >= 120 && KW.test(String(text || ''))) kept.push({ day, text: String(text).slice(0, 400) });
        } catch (e) {}
        return origEmit.apply(this, arguments);
      };
    }
  } catch (e) {}
  await setupGame(Game);
  const { quietLog } = require('./sim-harness');
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  try { if (origEmit) Game.emit = origEmit; } catch (e) {}
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+fullseat-diag+vet2-diag+seathes-diag+dawnblock-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${(t.sayRing || []).length} keptKeywordLines=${kept.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const ring = (t.sayRing || []).map(s => `[ring] ${String(s).slice(0, 400)}`).join('\n');
  const body = header + kept.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n\n--- PI RING (last lines, for end-of-run context) ---\n' + ring + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${(t.sayRing || []).length} kept=${kept.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--analyze')) return analyzeMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  if (args.includes('--offcheck')) return offcheckMode(args[args.indexOf('--offcheck') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('DAWNBLOCK-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });

module.exports = {
  summarizeSeed, compareToSeathes, analyzeDir,
};
