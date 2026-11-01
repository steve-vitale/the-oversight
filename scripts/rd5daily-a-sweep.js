#!/usr/bin/env node
// scripts/rd5daily-a-sweep.js — sim-rd5daily-a sweep + analyzer
// (scale-onramp axis, 2026-11-01, run fleshout-loop-a-20261101T0715Z).
// DIAG ONLY: zero src/js changes, zero edits to existing scripts or
// policy files. This file is the arm's ONLY new instrument: it defines
// the daily rd5short recorder policy wrapper inline and requires the
// sim-fullseat-recheck-a recorders UNMODIFIED.
//
// QUESTION (0615Z closeout blank 2; backlog #1649 refinement): the
// recheck's closest seed 78201 ends short on WEAPONS (4/6 armed) as
// well as veterans (0/2) — but the recheck recorder stores no daily
// rd5short series, so weapons-short AT CLOSEST APPROACH vs end-state
// decay is unmeasured. This sweep re-runs the recheck stack VERBATIM
// (tableseat-nowait substrate + fullseat-diag + vet2-diag) on the SAME
// seeds 78201-78208 with one added pure-read daily recorder, and
// answers the weapons-timing question per seed.
//
// RECORDER (withRd5DailyDiag, RD5DAILY=1): every daily, AFTER
// delegating inward, it pure-reads snapFullSeat(Game) (the recheck
// recorder's own snapshot), Game.waveUnlockReady(5) (rd5 counts +
// demand), and livingVetSets(Game) (vet4/vet5 counts) and appends one
// compact row. It writes NOTHING to game state and draws NO RNG. The
// only game-code paths it calls are ones the recheck recorders already
// call daily (snapFullSeat calls waveUnlockReady(5) internally; vet2
// calls livingVetSets daily) — so the neutrality argument does not
// rest on a new read.
//
// COMPOSITION: withRd5DailyDiag(withVet2Diag(withFullseatDiag(
// tableseatNowait))). Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
// FULLSEAT=1, VET2=1, RD5DAILY=1. Horizon: 180d death-aware.
//
// MODES:
//   default: sweep seeds 78201-78208 (SEEDS/DAYS/EVID env overrides),
//     per-seed row + daily-series files via the chunked writer,
//     summary.json, printed table + verdict. Exit 1 on gate failure.
//   --analyze: read the corpora (EVID env or default), print the
//     per-seed daily table + neutrality comparison vs the recheck
//     corpus, exit 1 on gate failure. No sims run.
//   --sense SEED: NON-MEASURED narration replay (like the recheck's
//     --sense; narration shifts trajectories, never enters the
//     census). Kept for the sense read only; not used by default.
//
// GATES (failures exit 1 in sweep/analyze mode):
//   D1 complete series: 8/8 seeds, zero missing days (daily day
//     sequence strictly consecutive AND row count == fullseat-diag
//     D.days == vet2 store row count for that seed), rd5 errs 0.
//   D2 neutrality/reproduction: new rows match the recheck armed
//     corpus on ALL 8 seeds on days, gameDays, ts counters,
//     starvationDeaths, endSnap dist/binding/seat, diag maxDist, vet
//     end/max counts, waveReach, finalRank, maxRank, nationalEver,
//     table, entered, won. Any divergence is a recorder-neutrality
//     failure to investigate, NOT a finding.
//   D3 determinability: closest approach + decay-vs-persistent
//     verdict computable for 78201 and every seed's own closest day.
//
// DEFINITIONS (prereg-fixed):
//   closest approach = daily row with smallest distTotal (sum of the
//     9 snapFullSeat component distances); ties -> earliest day.
//   weapons-short on a day = 'weapons' in that day's rd5short
//     (equivalently rd5 armed < 6). End-state weapons-short +
//     short-at-closest = PERSISTENT; end-state short + met-at-
//     closest = DECAY; end-state met = NOT-APPLICABLE.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withFullseatDiag, snapFullSeat } = require('./policies/fullseat-diag');
const { withVet2Diag, livingVetSets } = require('./policies/vet2-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const COMP_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];
const RECHECK_DIR = path.join(REPO, 'evidence', '2026-11-01', 'perseed-fullseat-recheck-a');

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function layerOn() { return process.env.RD5DAILY === '1'; }

// --- daily recorder policy wrapper (pure-read) ---
// Compact daily row (array-friendly object, short keys):
//   d: scholar day, t: distTotal, di: 9 component distances in
//   COMP_ORDER, s: seat, o: ok(0/1), r: rank, st: standing, raw, cap,
//   h: holdKind, u: unlockedWave, sh: rd5short array,
//   a: [armored, armed, tricks, veterans] rd5 counts, v: [vet4n, vet5n]
function snapRd5Daily(Game) {
  const s = snapFullSeat(Game);
  let rd5 = null;
  try { rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null; } catch (e) { rd5 = null; }
  let vet4n = null, vet5n = null;
  try { const sets = livingVetSets(Game); vet4n = sets.vet4.length; vet5n = sets.vet5.length; } catch (e) {}
  const di = COMP_ORDER.map(k => (s.dist ? (s.dist[k] | 0) : 0));
  const u = s.unlock || {};
  return {
    d: dayOf(Game),
    t: di.reduce((a, b) => a + b, 0),
    di,
    s: s.seat || 'none',
    o: s.ok ? 1 : 0,
    r: s.rank || 'village',
    st: (u.standing != null ? (u.standing | 0) : null),
    raw: (u.raw != null ? (u.raw | 0) : null),
    cap: (u.capped != null ? (u.capped | 0) : null),
    h: u.holdKind || null,
    u: (u.unlockedWave != null ? (u.unlockedWave | 0) : null),
    sh: (rd5 && rd5.short) ? rd5.short.slice() : (u.rd5short ? u.rd5short.slice() : null),
    a: rd5 ? [(rd5.armored | 0), (rd5.armed | 0), (rd5.tricks | 0), (rd5.veterans | 0)] : null,
    v: (vet4n != null && vet5n != null) ? [vet4n, vet5n] : null,
  };
}

function withRd5DailyDiag(inner, id, desc) {
  const store = { rows: [], errs: 0 };
  const wrapped = Object.assign({}, inner, {
    id, desc, rd5Store: store,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try { store.rows.push(snapRd5Daily(Game)); }
        catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

// --- analyzer (pure; exported for the proof test) ---
function distTotalOf(row) { return row.t; }
function weaponsShortOn(row) { return !!(row.sh && row.sh.indexOf('weapons') >= 0); }
function weaponsMetOn(row) { return !!(row.a && (row.a[1] | 0) >= 6); }

function checkDailySeries(daily, diagDays, vetDays) {
  // Returns { ok, problems[], firstDay, lastDay, count }.
  const problems = [];
  if (!daily || !daily.length) return { ok: false, problems: ['empty-series'], firstDay: null, lastDay: null, count: 0 };
  const days = daily.map(r => r.d);
  for (let i = 1; i < days.length; i++) {
    if (days[i] !== days[i - 1] + 1) problems.push(`gap-or-dup ${days[i - 1]}->${days[i]} at row ${i}`);
  }
  if (diagDays != null && daily.length !== diagDays) problems.push(`row-count ${daily.length} != fullseat-diag days ${diagDays}`);
  if (vetDays != null && daily.length !== vetDays) problems.push(`row-count ${daily.length} != vet2 rows ${vetDays}`);
  if (daily.some(r => r.sh == null || r.a == null || r.v == null)) problems.push('null rd5/vet fields on some row');
  return { ok: problems.length === 0, problems, firstDay: days[0], lastDay: days[days.length - 1], count: daily.length };
}

function closestApproach(daily) {
  // Smallest distTotal; ties -> earliest day (daily is in run order,
  // so strict < keeps the first minimizer).
  let best = null;
  for (const row of daily) {
    if (!best || row.t < best.t) best = row;
  }
  return best;
}

function summarizeSeed(row, daily) {
  const series = checkDailySeries(daily, row.diag ? row.diag.days : null, row.vet ? row.vet.days : null);
  const ca = daily && daily.length ? closestApproach(daily) : null;
  const endShort = (row.endSnapFull && row.endSnapFull.unlock && row.endSnapFull.unlock.rd5short) || [];
  const endWeaponsShort = endShort.indexOf('weapons') >= 0;
  const caWeaponsShort = ca ? weaponsShortOn(ca) : null;
  const caWeaponsMet = ca ? weaponsMetOn(ca) : null;
  let verdict = null;
  if (!endWeaponsShort) verdict = 'NOT-APPLICABLE';
  else if (caWeaponsShort) verdict = 'PERSISTENT';
  else if (caWeaponsMet) verdict = 'DECAY';
  else verdict = 'INDETERMINATE';
  const weaponsEverMet = daily.some(weaponsMetOn);
  const metDays = daily.filter(weaponsMetOn).map(r => r.d);
  const firstWave4Day = (daily.find(r => (r.u | 0) >= 4) || {}).d ?? null;
  const firstWave5Day = (daily.find(r => (r.u | 0) >= 5) || {}).d ?? null;
  let distRoseAfterClosest = false;
  if (ca) {
    const idx = daily.indexOf(ca);
    distRoseAfterClosest = daily.slice(idx + 1).some(r => r.t > ca.t);
  }
  const lastRow = daily && daily.length ? daily[daily.length - 1] : null;
  const lastDailyAgreesWithEnd = lastRow ? (weaponsShortOn(lastRow) === endWeaponsShort) : null;
  return {
    seed: row.seed, days: row.days, gameDays: row.gameDays, endReason: row.endReason,
    won: row.won, finalRank: row.finalRank, maxRank: row.maxRank,
    endWeaponsShort, endRd5short: endShort,
    seriesOk: series.ok, seriesProblems: series.problems,
    seriesCount: series.count, seriesFirstDay: series.firstDay, seriesLastDay: series.lastDay,
    diagDays: row.diag ? row.diag.days : null, vetDays: row.vet ? row.vet.days : null,
    rd5Errs: row.rd5errs | 0,
    closestDay: ca ? ca.d : null, closestDist: ca ? ca.t : null,
    closestSeat: ca ? ca.s : null, closestRank: ca ? ca.r : null,
    closestArmed: ca && ca.a ? ca.a[1] : null, closestRd5short: ca ? ca.sh : null,
    closestVet5n: ca && ca.v ? ca.v[1] : null, closestVet4n: ca && ca.v ? ca.v[0] : null,
    caWeaponsShort, caWeaponsMet, verdict,
    weaponsEverMet, firstWeaponsMetDay: metDays.length ? metDays[0] : null,
    lastWeaponsMetDay: metDays.length ? metDays[metDays.length - 1] : null,
    vet5AtEnd: row.vet ? row.vet.endVet5n : null,
    vet2MissingAtClosest: ca && ca.v ? (ca.v[1] < 2) : null,
    vet2MissingAtEnd: row.vet ? (row.vet.endVet5n < 2) : null,
    weaponsMetAtClosestAndVet2Missing: (caWeaponsMet === true) && (ca && ca.v ? ca.v[1] < 2 : false),
    firstWave4Day, firstWave5Day, distRoseAfterClosest,
    lastDailyAgreesWithEnd,
  };
}

// Neutrality/reproduction comparison vs the recheck armed corpus.
const NEUT_FIELDS = ['days', 'gameDays', 'starvationDeaths', 'waveReach', 'finalRank', 'maxRank',
  'nationalEver', 'nationalFinal', 'table', 'entered', 'enteredFull', 'won'];
function compareToRecheck(row, recheckRow) {
  const diffs = [];
  if (!recheckRow) return ['missing-recheck-row'];
  for (const f of NEUT_FIELDS) {
    if (row[f] !== recheckRow[f]) diffs.push(`${f}: ${row[f]} != recheck ${recheckRow[f]}`);
  }
  if (JSON.stringify(row.ts) !== JSON.stringify(recheckRow.ts)) diffs.push('ts differs');
  if (JSON.stringify(row.endSnap) !== JSON.stringify(recheckRow.endSnap)) diffs.push('endSnap differs');
  if (JSON.stringify(row.diag && row.diag.maxDist) !== JSON.stringify(recheckRow.diag && recheckRow.diag.maxDist)) diffs.push('diag.maxDist differs');
  if (recheckRow.vet && row.vet) {
    for (const f of ['endVet4n', 'endVet5n', 'maxVet4', 'maxVet5', 'maxVet4Day', 'maxVet5Day', 'w5killCount']) {
      if (row.vet[f] !== recheckRow.vet[f]) diffs.push(`vet.${f}: ${row.vet[f]} != recheck ${recheckRow.vet[f]}`);
    }
  } else diffs.push('vet block missing on one side');
  return diffs;
}

function loadRecheckArmed() {
  const out = {};
  for (const fn of fs.readdirSync(RECHECK_DIR).sort()) {
    if (!/^s[0-9]+-armed\.json$/.test(fn)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(RECHECK_DIR, fn), 'utf8'));
    out[r.seed] = r;
  }
  return out;
}

function analyzeDir(evidDir) {
  const rows = [], dailies = {};
  for (const fn of fs.readdirSync(evidDir).sort()) {
    if (/^s[0-9]+\.json$/.test(fn)) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8')));
    else if (/^s[0-9]+-daily\.json$/.test(fn)) {
      const d = JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8'));
      dailies[d.seed] = d.daily;
    }
  }
  rows.sort((a, b) => a.seed - b.seed);
  const recheck = loadRecheckArmed();
  const perSeed = rows.map(r => {
    const s = summarizeSeed(r, dailies[r.seed] || []);
    s.neutDiffs = compareToRecheck(r, recheck[r.seed]);
    s.neutOk = s.neutDiffs.length === 0;
    return s;
  });
  const endShortSeeds = perSeed.filter(s => s.endWeaponsShort);
  const agg = {
    n: perSeed.length,
    seriesOk: perSeed.filter(s => s.seriesOk).length,
    neutOk: perSeed.filter(s => s.neutOk).length,
    endWeaponsShortN: endShortSeeds.length,
    persistentN: endShortSeeds.filter(s => s.verdict === 'PERSISTENT').length,
    decayN: endShortSeeds.filter(s => s.verdict === 'DECAY').length,
    indeterminateN: endShortSeeds.filter(s => s.verdict === 'INDETERMINATE').length,
    weaponsMetAtClosestAndVet2MissingN: perSeed.filter(s => s.weaponsMetAtClosestAndVet2Missing).length,
    diagGo: perSeed.length === 8 && perSeed.every(s => s.seriesOk && s.neutOk && s.verdict !== 'INDETERMINATE' && (s.rd5Errs | 0) === 0),
  };
  return { rows, perSeed, agg };
}

// --- sweep plumbing (mirrors the recheck sweep's runOne) ---
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
  // FALLBACK (intermittent container EPERM flap on evidence writes,
  // 2026-10-24 lesson): direct in-process write with a long retry
  // loop, sha-verified after each attempt. Judged corpora are never
  // staged in /tmp; the retry stays on the judged path itself.
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
  process.env.RD5DAILY = '1';
  const base = withRd5DailyDiag(
    withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
    'rd5daily-diag', 'tableseat-nowait + daily rd5short recorder');
  const { Game } = await loadGame({ seed, mode: 'rd5daily-a', fullTelemetry: false });
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
  // NOTE: base here is the rd5daily wrapper; vet2Store lives on the
  // inner vet2 wrapper, not on the outer copy — Object.assign copied
  // own enumerable props at wrap time, and vet2Store IS an own prop
  // of the vet2 wrapper, so base.vet2Store reaches through. Guard:
  if (!vet && base.vet2Store === undefined) vet = { error: 'vet2Store unreachable through rd5daily wrapper' };
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
  const daily = (base.rd5Store && base.rd5Store.rows) || [];
  const rd5errs = (base.rd5Store && base.rd5Store.errs) | 0;
  const row = {
    policy: 'rd5daily', seed,
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
    diag, vet, rd5errs,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}.json`);
    writeRowViaWriter(fn, JSON.stringify(row, null, 1) + '\n');
    const dfn = path.join(evidDir, `s${seed}-daily.json`);
    writeRowViaWriter(dfn, JSON.stringify({ seed, daily, rd5errs }, null, 1) + '\n');
  }
  return { row, daily };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '78201,78202,78203,78204,78205,78206,78207,78208')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'rd5daily-a-perseed');
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of seeds) {
    const { row, daily } = await runOne(seed, days, evidDir);
    const s = summarizeSeed(row, daily);
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} rank=${row.finalRank}/${row.maxRank} won=${row.won} dailyRows=${daily.length} diagDays=${row.diag ? row.diag.days : '?'} vetDays=${row.vet ? row.vet.days : '?'} rd5errs=${row.rd5errs} seriesOk=${s.seriesOk} closestDay=${s.closestDay} closestDist=${s.closestDist} closestArmed=${s.closestArmed} caShort=${JSON.stringify(s.closestRd5short)} endShort=${JSON.stringify(s.endRd5short)} verdict=${s.verdict} weaponsEverMet=${s.weaponsEverMet}`);
  }
  const a = analyzeDir(evidDir);
  const summary = { label: 'sim-rd5daily-a sweep', seeds, days, perSeed: a.perSeed, agg: a.agg, generated: new Date().toISOString() };
  writeRowViaWriter(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('\n=== sim-rd5daily-a sweep ===');
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: seriesOk=${s.seriesOk} neutOk=${s.neutOk} closestDay=${s.closestDay} closestDist=${s.closestDist} armed@closest=${s.closestArmed} vet5@closest=${s.closestVet5n} endWeaponsShort=${s.endWeaponsShort} verdict=${s.verdict} everMet=${s.weaponsEverMet} neutDiffs=${JSON.stringify(s.neutDiffs)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} endWeaponsShort=${a.agg.endWeaponsShortN} persistent=${a.agg.persistentN} decay=${a.agg.decayN} indeterminate=${a.agg.indeterminateN} weaponsMetAtClosestAndVet2Missing=${a.agg.weaponsMetAtClosestAndVet2MissingN}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function analyzeMode() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'rd5daily-a-perseed');
  const a = analyzeDir(evidDir);
  for (const s of a.perSeed) console.log(`  seed ${s.seed}: days=${s.days} end=${s.endReason} seriesOk=${s.seriesOk} neutOk=${s.neutOk} closestDay=${s.closestDay} closestDist=${s.closestDist} armed@closest=${s.closestArmed} vet5@closest=${s.closestVet5n} endWeaponsShort=${s.endWeaponsShort} verdict=${s.verdict} everMet=${s.weaponsEverMet} firstW4=${s.firstWave4Day} firstW5=${s.firstWave5Day} roseAfter=${s.distRoseAfterClosest} neutDiffs=${JSON.stringify(s.neutDiffs)} seriesProblems=${JSON.stringify(s.seriesProblems)}`);
  console.log(`  AGG: n=${a.agg.n} seriesOk=${a.agg.seriesOk} neutOk=${a.agg.neutOk} endWeaponsShort=${a.agg.endWeaponsShortN} persistent=${a.agg.persistentN} decay=${a.agg.decayN} indeterminate=${a.agg.indeterminateN} weaponsMetAtClosestAndVet2Missing=${a.agg.weaponsMetAtClosestAndVet2MissingN}`);
  console.log(`  VERDICT: ${a.agg.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
  if (!a.agg.diagGo) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '78201', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-01', 'sim-rd5daily-a-sense-78201.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  process.env.VET2 = '1';
  process.env.RD5DAILY = '1';
  const armed = withRd5DailyDiag(
    withVet2Diag(withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder'), 'vet2-diag', 'tableseat-nowait + veteran recorder'),
    'rd5daily-diag', 'tableseat-nowait + daily rd5short recorder');
  const { Game } = await loadGame({ seed, mode: 'rd5daily-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  const { quietLog } = require('./sim-harness');
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+fullseat-diag+vet2-diag+rd5daily-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--analyze')) return analyzeMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('RD5DAILY-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });

module.exports = {
  snapRd5Daily, withRd5DailyDiag, checkDailySeries, closestApproach,
  summarizeSeed, compareToRecheck, analyzeDir, COMP_ORDER, medianOf,
  weaponsShortOn, weaponsMetOn, distTotalOf,
};
