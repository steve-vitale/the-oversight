#!/usr/bin/env node
// scripts/seathes-a-sweep.js — sim-seathes-a sweep + analyzer
// (scale-onramp axis, 2026-11-01, run fleshout-loop-a-20261101T1016Z).
// DIAG ONLY: zero src/js changes, zero edits to existing scripts or
// policy files. This file is the arm's ONLY new instrument.
//
// QUESTION (0615Z closeout blank 3): seed 78201 holds a priced lesser
// seat from day 165 through the 180d cap without sitting while
// overtime ticks to x2. WHY does the seat-taking leg not fire?
// Hypotheses (prereg order): H1 policy national+ gate (leading),
// H2 game gate (preview null/not-ready), H3 presence (scholar not at
// Haven at the decision moment), H4 waiting-for-full, H5 attempts
// happen but fail.
//
// WHY A NEW RECORDER: the recheck/rd5daily recorders read AFTER the
// day's work, but the substrate's seat leg runs BEFORE it (tableseat-
// nowait.daily: seat leg first, then leanlinkrescue.daily). Post-day
// rows cannot prove what the leg saw at the decision moment. This
// wrapper snapshots the decision moment BEFORE delegating inward,
// then diffs the substrate's ctx ts counters AFTER, giving per-day:
// seat priced, preview ready/why, entry block, Haven presence,
// standing vs bar, deed distances, and the actual seat-leg outcome.
//
// COMPOSITION: withSeatHesDiag(withVet2Diag(withFullseatDiag(
// tableseatNowait))). Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
// FULLSEAT=1, VET2=1, SEATHES=1. Horizon: 180d death-aware.
// SEATHES unset -> the wrapper delegates byte-identically (the
// neutrality OFF leg). SEATHESOFF=1 forces the OFF path in-process.
//
// MODES:
//   default: sweep seeds 78201-78208 (SEEDS/DAYS/EVID overrides),
//     per-seed row + decision-series files, summary.json, printed
//     table + verdict. Exit 1 on gate failure.
//   --analyze: read the corpora (EVID or default), print the
//     per-seed held-day classification + neutrality comparison vs
//     the rd5daily corpus, exit 1 on gate failure. No sims run.
//   --sense SEED: NON-MEASURED narration replay; captures every
//     seat/table/overtime/Haven line across the run (the PI ring
//     keeps only the last 240). Never enters the census.
//
// CLASSIFICATION (per held day; held = decision-moment seat lesser
// or full, table not done, run alive; priority order, prereg-fixed):
//   RANK-GATE (decision rank order < 2 — policy gate stops the leg
//     before any preview call), PREVIEW-NULL (subclass by cause),
//   ENTRY-BLOCKED (subclass HAVEN/CONTEST/COMBAT/OTHER by why),
//   GUARD (preview ready but scholar dead/exiled/joined),
//   ATTEMPTED-FAILED (attempt diff > 0 with failed outcome),
//   SAT (taken diff > 0 — a sit day, not held),
//   UNCLASSIFIED (anything else — fails the GO bar outright).
// Secondary fields are always recorded: would the preview have been
// ready, and would presence have blocked, even on RANK-GATE days.
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
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const COMP_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];
const RD5_DIR = path.join(REPO, 'evidence', '2026-11-01', 'rd5daily-a-perseed');
const TS_KEYS = ['tsPreviewSeen', 'tsPreviewNotReady', 'tsSeatAttempts', 'tsSeatTaken', 'tsSeatFailed', 'tsGuardRefused', 'tsNoScholar', 'tsSeatErr', 'tsTableErr', 'tsNationalDay', 'tsSeatDay', 'tsSeatKind', 'tsTableAnswers', 'tsTablePath'];

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function layerOn() { return process.env.SEATHES === '1' && process.env.SEATHESOFF !== '1'; }
function tsSnap(ctx) {
  const o = {};
  if (!ctx) return o;
  for (const k of TS_KEYS) { if (ctx[k] !== undefined) o[k] = ctx[k]; }
  return o;
}
function tsDiff(a, b) {
  const o = {};
  for (const k of TS_KEYS) {
    const av = (a && a[k]) | 0, bv = (b && b[k]) | 0;
    if (typeof (a && a[k]) === 'number' || typeof (b && b[k]) === 'number') o[k] = bv - av;
    else if (typeof (b && b[k]) === 'string') o[k] = b[k];
  }
  return o;
}

// --- decision-moment snapshot (pure reads only) ---
function snapDecision(Game, ctx) {
  const out = { d: dayOf(Game) };
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { out.rank = 'village'; }
  out.rankOrd = RANK_ORDER[out.rank] || 0;
  try { const t = Game.tableSeat ? Game.tableSeat() : null; out.seat = (t && t.seat) || 'none'; out.seatDetail = (t && t.detail) || null; } catch (e) { out.seat = 'none'; }
  try { const g = Game.deedGateReady ? Game.deedGateReady() : null; out.ok = !!(g && g.ok); } catch (e) { out.ok = false; }
  try { const pg = Game.progState ? Game.progState() : {}; out.waiting = !!pg.tableWaiting; out.done = !!pg.tableDone; } catch (e) { out.waiting = false; out.done = false; }
  try {
    const pv = Game.tablePreview ? Game.tablePreview() : null;
    out.pv = pv ? { seat: pv.seat, ready: !!pv.ready, why: String(pv.why || ''), ot: (pv.overtime | 0), standingCost: (pv.standingCost | 0), losses: (pv.losses | 0) } : null;
  } catch (e) { out.pv = null; out.pvErr = String((e && e.message) || e).slice(0, 80); }
  try { out.block = Game.tableEntryBlock ? String(Game.tableEntryBlock() || '') : ''; } catch (e) { out.block = ''; }
  try { out.access = Game.havenStoresAccess ? String(Game.havenStoresAccess()) : null; } catch (e) { out.access = null; }
  try { out.inside = !!(((Game.state || {}).scholar || {}).insideHaven); } catch (e) { out.inside = null; }
  try { const t = Game.playerTile ? Game.playerTile() : null; out.tile = (t && t.type) || null; } catch (e) { out.tile = null; }
  try { out.px = (Game.map && Game.map.px) | 0; out.py = (Game.map && Game.map.py) | 0; } catch (e) {}
  try {
    const s = (Game.state || {}).scholar || {};
    out.exiled = !!s.exiled; out.joined = !!s.joinedVillage;
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') out.alive = true;
    else { const p = Game.getPerson(sid); out.alive = p ? !p.dead : true; }
  } catch (e) { out.alive = true; out.exiled = false; out.joined = false; }
  try {
    const s = snapFullSeat(Game);
    out.dist = s.dist || null; out.binding = (s.binding || []).slice();
    out.holdKind = (s.unlock && s.unlock.holdKind) || null;
    out.standing = (s.unlock && s.unlock.standing != null) ? (s.unlock.standing | 0) : null;
    out.t4 = (s.unlock && s.unlock.t4 != null) ? (s.unlock.t4 | 0) : null;
    out.t5 = (s.unlock && s.unlock.t5 != null) ? (s.unlock.t5 | 0) : null;
    out.unlockedWave = (s.unlock && s.unlock.unlockedWave != null) ? (s.unlock.unlockedWave | 0) : null;
  } catch (e) { out.snapErr = String((e && e.message) || e).slice(0, 80); }
  out.tsB = tsSnap(ctx);
  return out;
}

function withSeatHesDiag(inner, id, desc) {
  const store = { rows: [], errs: 0 };
  const wrapped = Object.assign({}, inner, {
    id, desc, seatHesStore: store,
    daily(Game, ctx) {
      let pre = null;
      if (layerOn()) { try { pre = snapDecision(Game, ctx); } catch (e) { store.errs += 1; pre = { err: String((e && e.message) || e).slice(0, 120) }; } }
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          let postSnap = null;
          try { postSnap = snapFullSeat(Game); } catch (e) {}
          let postRank = 'village', postSeat = 'none', postDone = false;
          try { postRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
          try { const t = Game.tableSeat ? Game.tableSeat() : null; postSeat = (t && t.seat) || 'none'; } catch (e) {}
          try { const pg = Game.progState ? Game.progState() : {}; postDone = !!pg.tableDone; } catch (e) {}
          store.rows.push({ pre, post: { tsA: tsSnap(ctx), rank: postRank, seat: postSeat, done: postDone, snap: postSnap } });
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

// --- classification (pure; exported for the proof test) ---
function classifyHeld(row) {
  const pre = row.pre || {};
  const diff = tsDiff(pre.tsB || {}, (row.post && row.post.tsA) || {});
  const att = diff.tsSeatAttempts | 0, taken = diff.tsSeatTaken | 0, failed = diff.tsSeatFailed | 0, guard = diff.tsGuardRefused | 0;
  const cls = { day: pre.d, seat: pre.seat, rank: pre.rank, class: null, subclass: null, diff };
  if ((pre.rankOrd | 0) < 2) { cls.class = 'RANK-GATE'; }
  else if (!pre.pv) {
    cls.class = 'PREVIEW-NULL';
    if (!pre.waiting) cls.subclass = 'TABLEWAITING-FALSE';
    else if (pre.done) cls.subclass = 'TABLEDONE';
    else if (pre.seat === 'none') cls.subclass = 'SEAT-NONE';
    else if ((pre.d | 0) < 90) cls.subclass = 'DAY-LT-90';
    else cls.subclass = 'OTHER';
  }
  else if (!pre.pv.ready) {
    cls.class = 'ENTRY-BLOCKED';
    const why = String(pre.pv.why || pre.block || '');
    if (/Haven/i.test(why)) cls.subclass = 'HAVEN';
    else if (/contest/i.test(why)) cls.subclass = 'CONTEST';
    else if (/encounter/i.test(why)) cls.subclass = 'COMBAT';
    else cls.subclass = 'OTHER:' + why.slice(0, 60);
  }
  else if (!pre.alive || pre.exiled || pre.joined) { cls.class = 'GUARD'; }
  else if (att > 0 && taken > 0) { cls.class = 'SAT'; }
  else if (att > 0 && failed > 0) { cls.class = 'ATTEMPTED-FAILED'; }
  else if (att > 0) { cls.class = 'UNCLASSIFIED'; cls.subclass = 'ATTEMPT-NO-OUTCOME'; }
  else { cls.class = 'UNCLASSIFIED'; cls.subclass = 'READY-BUT-NO-ATTEMPT'; }
  // Secondary fields: what WOULD have blocked, even on RANK-GATE days.
  cls.wouldReady = pre.pv ? !!pre.pv.ready : null;
  cls.wouldBlock = pre.pv ? String(pre.pv.why || '') : null;
  cls.presenceOk = (pre.access !== 'none' && pre.access != null);
  return cls;
}

function summarizeSeed(row, series) {
  const held = [];
  const nationalDays = [];
  const lesserDecisionDays = [];
  for (const r of series) {
    const pre = r.pre || {};
    if ((pre.rankOrd | 0) >= 2) nationalDays.push(pre.d);
    if (pre.seat === 'lesser' || pre.seat === 'full') {
      lesserDecisionDays.push(pre.d);
      if (!pre.done) held.push(classifyHeld(r));
    }
  }
  const satRows = series.filter(r => {
    const diff = tsDiff((r.pre && r.pre.tsB) || {}, (r.post && r.post.tsA) || {});
    return (diff.tsSeatTaken | 0) > 0;
  });
  const classCounts = {};
  for (const h of held) classCounts[h.class] = (classCounts[h.class] | 0) + 1;
  const unclassified = held.filter(h => h.class === 'UNCLASSIFIED');
  const overlap = nationalDays.filter(d => lesserDecisionDays.indexOf(d) >= 0);
  const heldRows = series.filter(r => (r.pre && (r.pre.seat === 'lesser' || r.pre.seat === 'full') && !r.pre.done));
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: row.won, finalRank: row.finalRank, maxRank: row.maxRank,
    seriesRows: series.length, seriesErrs: row.seatHesErrs | 0,
    diagDays: row.diag ? row.diag.days : null, vetDays: row.vet ? row.vet.days : null,
    seriesOk: series.length > 0 && series.length === (row.diag ? row.diag.days : -1) && series.length === (row.vet ? row.vet.days : -2) && (row.seatHesErrs | 0) === 0,
    heldN: held.length, heldFirst: held.length ? held[0].day : null, heldLast: held.length ? held[held.length - 1].day : null,
    classCounts, unclassifiedN: unclassified.length,
    unclassifiedDays: unclassified.map(h => h.day),
    nationalDecisionDaysN: nationalDays.length,
    lesserDecisionDaysN: lesserDecisionDays.length,
    overlapN: overlap.length, overlapDays: overlap,
    satDay: satRows.length ? satRows[0].pre.d : null,
    satKind: satRows.length ? ((satRows[0].post.tsA || {}).tsSeatKind || null) : null,
    held: held,
  };
}

// Neutrality/reproduction comparison vs the rd5daily corpus.
const NEUT_FIELDS = ['days', 'gameDays', 'starvationDeaths', 'waveReach', 'finalRank', 'maxRank',
  'nationalEver', 'nationalFinal', 'table', 'entered', 'enteredFull', 'won'];
function compareToRd5daily(row, rd5Row) {
  const diffs = [];
  if (!rd5Row) return ['missing-rd5daily-row'];
  for (const f of NEUT_FIELDS) {
    if (row[f] !== rd5Row[f]) diffs.push(`${f}: ${row[f]} != rd5daily ${rd5Row[f]}`);
  }
  if (JSON.stringify(row.ts) !== JSON.stringify(rd5Row.ts)) diffs.push('ts differs');
  if (JSON.stringify(row.endSnap) !== JSON.stringify(rd5Row.endSnap)) diffs.push('endSnap differs');
  if (JSON.stringify(row.diag && row.diag.maxDist) !== JSON.stringify(rd5Row.diag && rd5Row.diag.maxDist)) diffs.push('diag.maxDist differs');
  if (rd5Row.vet && row.vet) {
    for (const f of ['endVet4n', 'endVet5n', 'maxVet4', 'maxVet5', 'maxVet4Day', 'maxVet5Day', 'w5killCount']) {
      if (row.vet[f] !== rd5Row.vet[f]) diffs.push(`vet.${f}: ${row.vet[f]} != rd5daily ${rd5Row.vet[f]}`);
    }
  } else diffs.push('vet block missing on one side');
  return diffs;
}
function loadRd5daily() {
  const out = {};
  if (!fs.existsSync(RD5_DIR)) return out;
  for (const fn of fs.readdirSync(RD5_DIR).sort()) {
    if (!/^s[0-9]+\.json$/.test(fn)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(RD5_DIR, fn), 'utf8'));
    out[r.seed] = r;
  }
  return out;
}
function analyzeDir(evidDir) {
  const rows = [], series = {};
  for (const fn of fs.readdirSync(evidDir).sort()) {
    if (/^s[0-9]+\.json$/.test(fn)) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8')));
    else if (/^s[0-9]+-daily\.json$/.test(fn)) {
      const d = JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8'));
      series[d.seed] = d.series;
    }
  }
  rows.sort((a, b) => a.seed - b.seed);
  const rd5 = loadRd5daily();
  const perSeed = rows.map(r => {
    const s = summarizeSeed(r, series[r.seed] || []);
    s.neutDiffs = compareToRd5daily(r, rd5[r.seed]);
    s.neutOk = s.neutDiffs.length === 0;
    return s;
  });
  const agg = {
    n: perSeed.length,
    seriesOk: perSeed.filter(s => s.seriesOk).length,
    neutOk: perSeed.filter(s => s.neutOk).length,
    heldTotal: perSeed.reduce((a, s) => a + s.heldN, 0),
    unclassifiedTotal: perSeed.reduce((a, s) => a + s.unclassifiedN, 0),
    diagGo: perSeed.length === 8 && perSeed.every(s => s.seriesOk && s.neutOk && s.unclassifiedN === 0 && s.heldN >= 0),
  };
  return { rows, perSeed, agg };
}

// --- sweep plumbing (mirrors the rd5daily sweep's runOne) ---
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
  if (process.env.SEATHESOFF !== '1') process.env.SEATHES = '1';
  else delete process.env.SEATHES;
  const base = withSeatHesDiag(
    withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
    'seathes-diag', 'tableseat-nowait + decision-moment seat recorder');
  const { Game } = await loadGame({ seed, mode: 'seathes-a', fullTelemetry: false });
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
  if (!vet && base.vet2Store === undefined) vet = { error: 'vet2Store unreachable through seathes wrapper' };
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
  const series = (base.seatHesStore && base.seatHesStore.rows) || [];
  const seatHesErrs = (base.seatHesStore && base.seatHesStore.errs) | 0;
  const row = {
    policy: 'seathes', seed,
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
    diag, vet, seatHesErrs,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}.json`);
    writeRowViaWriter(fn, JSON.stringify(row, null, 1) + '\n');
    const dfn = path.join(evidDir, `s${seed}-daily.json`);
    writeRowViaWriter(dfn, JSON.stringify({ seed, series, seatHesErrs }, null, 1) + '\n');
  }
  return { row, series };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '78201,78202,78203,78204,78205,78206,78207,78208')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'seathes-a-perseed');
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of seeds) {
    const { row, series } = await runOne(seed, days, evidDir);
    const s = summarizeSeed(row, series);
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} rank=${row.finalRank}/${row.maxRank} won=${row.won} seriesRows=${series.length} diagDays=${row.diag ? row.diag.days : '?'} vetDays=${row.vet ? row.vet.days : '?'} seatHesErrs=${row.seatHesErrs} seriesOk=${s.seriesOk} heldN=${s.heldN} held=${s.heldFirst}..${s.heldLast} classes=${JSON.stringify(s.classCounts)} unclass=${s.unclassifiedN} satDay=${s.satDay} overlap=${s.overlapN}`);
  }
  const a = analyzeDir(evidDir);
  const summary = { label: 'sim-seathes-a sweep', seeds, days, perSeed: a.perSeed, agg: a.agg, generated: new Date().toISOString() };
  writeRowViaWriter(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('\n=== sim-seathes-a sweep ===');
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: seriesOk=${s.seriesOk} neutOk=${s.neutOk} heldN=${s.heldN} classes=${JSON.stringify(s.classCounts)} unclass=${s.unclassifiedN} satDay=${s.satDay} overlap=${s.overlapN} neutDiffs=${JSON.stringify(s.neutDiffs)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} heldTotal=${a.agg.heldTotal} unclassifiedTotal=${a.agg.unclassifiedTotal}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function analyzeMode() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'seathes-a-perseed');
  const a = analyzeDir(evidDir);
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: days=${s.days} end=${s.endReason} seriesOk=${s.seriesOk} neutOk=${s.neutOk} heldN=${s.heldN} held=${s.heldFirst}..${s.heldLast} classes=${JSON.stringify(s.classCounts)} unclass=${s.unclassifiedN} satDay=${s.satDay} overlap=${s.overlapN} neutDiffs=${JSON.stringify(s.neutDiffs)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} heldTotal=${a.agg.heldTotal} unclassifiedTotal=${a.agg.unclassifiedTotal}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '78201', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-01', 'sim-seathes-a-sense-78201.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  process.env.VET2 = '1';
  process.env.SEATHES = '1';
  const armed = withSeatHesDiag(
    withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
    'seathes-diag', 'tableseat-nowait + decision-moment seat recorder');
  const { Game } = await loadGame({ seed, mode: 'seathes-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  // Extra full-run keyword capture (the PI ring keeps only the last 240).
  const kept = [];
  const KW = /seat|table|overtime|haven|lesser|full seat/i;
  let origEmit = null;
  try {
    origEmit = Game.emit;
    if (typeof origEmit === 'function') {
      Game.emit = function (text, surface) {
        try { if (KW.test(String(text || ''))) kept.push({ day: PI.gday(Game), text: String(text).slice(0, 400) }); } catch (e) {}
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
    `seed=${seed} policy=tableseat-nowait+fullseat-diag+vet2-diag+seathes-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${(t.sayRing || []).length} keptKeywordLines=${kept.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + kept.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${(t.sayRing || []).length} kept=${kept.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--analyze')) return analyzeMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('SEATHES-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });

module.exports = {
  snapDecision, withSeatHesDiag, classifyHeld, summarizeSeed,
  compareToRd5daily, analyzeDir, COMP_ORDER, medianOf,
};
