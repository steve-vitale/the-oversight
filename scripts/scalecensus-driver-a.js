#!/usr/bin/env node
// scripts/scalecensus-driver-a.js — sim-scalecensus-a census driver
// (Lane A leg 3 scale census, run playtest-20261128T0043Z).
// DIAGNOSTIC ONLY — zero src/js changes. It HARVESTS the scale leg's
// seat-bar state; it does not pull any lever.
//
// Substrate: competent verbatim, 150d DEATH-AWARE horizon, seeds
// 113101-113108. NO substrate flags — the honest scale leg, so the
// census reads what competent play actually builds by day 80-140.
// Corpus under evidence/2026-11-28/perseed-scalecensus-a-arm/.
//
// What is harvested per seed (read-only wraps, no RNG, no inputs):
//   - A DAILY snapshot: day, rank, arc, tableWaiting, tableDone,
//     tableAnnounced, stage, pop, pantry kcal (best-effort
//     accessors, source recorded), waitingDays so far, PLUS the
//     deed-gate breakdown (deedGateReady(): ok, waves, contests,
//     crises, scale, stageOk, foodDeeds, stage, w1..w5,
//     contestsN, crisesN, rank), the priced seat (tableSeat():
//     'full'/'lesser'/'none' + detail: ladderPeak, capstone),
//     ladder peak, overtime tier.
//   - EVERY fireside line: any say/emit line starting with the fire
//     glyph, parsed into speaker / listener / text. NO keyword
//     filter — classification happens in the analyzer, never at
//     harvest.
//   - EVERY system table line: say/emit lines matching
//     /table|pale light/i that are NOT fireside lines.
//   - Marker days derived from the capture/snapshots: announce
//     (TABLE IS SET), pellet, nation prod, arc IV beat, first
//     regional, first national, first lesser seat, first full
//     seat, first overtime tier.
// Row fields for the wall: days, gameDays, endReason, won,
// maxRank, finalRank, table (everWaiting), entered (everDone),
// arcMax, finalSeat, finalGate (last snapshot breakdown).
//
// Modes:
//   --one <seed> : run one seed, write its row.
//   --summary   : build summary.json from rows on disk, print the
//                 band table. Exit 1 only if the corpus is
//                 incomplete or any row errored.
// Env: SEEDS (csv), DAYS (default 150), OUTDIR (default the
// evidence corpus dir — overridable for the determinism proof).
// Exit 1 in --one mode if the run throws.
// Per-seed JSONs carry no wall-clock fields, so a rerun of one
// seed must be byte-identical (the summary's `generated` stamp
// lives in summary.json only, never in a per-seed row).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-scalecensus-a-arm');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '113101,113102,113103,113104,113105,113106,113107,113108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const FIRE_RX = /^🗣️ (.+?) to (.+?), by the fire: (.*)$/s;
const TABLE_RX = /table|pale light/i;

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

function pantryOf(Game) {
  // Best-effort, source recorded. Returns { kcal, src } or { kcal: null, src: 'none' }.
  try {
    if (typeof Game.pantryKcalLive === 'function' && Game.state && Game.state.village) {
      const v = Game.pantryKcalLive(Game.state.village);
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcalLive' };
    }
  } catch (e) {}
  try {
    if (typeof Game.pantryKcal === 'function') {
      const v = Game.pantryKcal();
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcal' };
    }
  } catch (e) {}
  try {
    const v = Game.state && Game.state.village && Game.state.village.pantryKcal;
    if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'state.village.pantryKcal' };
  } catch (e) {}
  return { kcal: null, src: 'none' };
}

function gateOf(Game) {
  // The full-seat DEED breakdown, or { error } — never throws, never fills.
  try {
    if (typeof Game.deedGateReady !== 'function') return { error: 'no-deedGateReady' };
    const d = Game.deedGateReady();
    if (!d || typeof d !== 'object') return { error: 'deedGateReady-null' };
    return {
      ok: !!d.ok, waves: !!d.waves, contests: !!d.contests, crises: !!d.crises,
      scale: !!d.scale, stageOk: !!d.stageOk, foodDeeds: !!d.foodDeeds,
      stage: (d.stage | 0) || 0, w1: (d.w1 | 0) || 0, w2: (d.w2 | 0) || 0,
      w3: (d.w3 | 0) || 0, w4: (d.w4 | 0) || 0, w5: (d.w5 | 0) || 0,
      contestsN: (d.contestsN | 0) || 0, crisesN: (d.crisesN | 0) || 0,
      rank: d.rank || null,
    };
  } catch (e) { return { error: 'deedGateReady-threw:' + String((e && e.message) || e).slice(0, 80) }; }
}

function seatOf(Game) {
  // The priced seat + its detail (ladder peak, capstone). Never throws.
  try {
    const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    const seat = (s && s.seat) || 'none';
    const det = (s && s.detail) || {};
    return {
      seat,
      ladderPeak: (typeof det.ladderPeakStage === 'number') ? det.ladderPeakStage : null,
      capstone: det.ladderCapstone || null,
      // Lesser-seat detail (w1..w3 live here even when the full gate is the headline).
      w1: (typeof det.w1 === 'number') ? det.w1 : null,
      w2: (typeof det.w2 === 'number') ? det.w2 : null,
      w3: (typeof det.w3 === 'number') ? det.w3 : null,
    };
  } catch (e) { return { seat: 'error', ladderPeak: null, capstone: null, w1: null, w2: null, w3: null }; }
}

function ladderPeakOf(Game) {
  try { return (typeof Game.ladderPeakStage === 'function') ? (Game.ladderPeakStage() | 0) : null; } catch (e) { return null; }
}

function overtimeOf(Game) {
  try { return (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : null; } catch (e) { return null; }
}

function snap(Game, waitingSoFar) {
  const out = { day: 0, rank: 'village', arc: 1, tableWaiting: false, tableDone: false, tableAnnounced: false, stage: null, pop: null, pantry: null, pantrySrc: 'none', waitingDays: waitingSoFar, gate: null, gateError: null, seat: 'none', ladderPeak: null, capstone: null, overtime: null };
  try { out.day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableDone = !!pg.tableDone; out.tableAnnounced = !!pg.tableAnnounced;
  } catch (e) {}
  try { out.stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  try {
    const r = Game.state && Game.state.village && Game.state.village.roster;
    out.pop = Array.isArray(r) ? r.length : null;
  } catch (e) {}
  const p = pantryOf(Game);
  out.pantry = p.kcal; out.pantrySrc = p.src;
  const g = gateOf(Game);
  if (g.error) { out.gate = null; out.gateError = g.error; } else out.gate = g;
  const s = seatOf(Game);
  out.seat = s.seat; out.capstone = s.capstone;
  out.ladderPeak = ladderPeakOf(Game);
  if (out.ladderPeak == null && typeof s.ladderPeak === 'number') out.ladderPeak = s.ladderPeak;
  out.overtime = overtimeOf(Game);
  return out;
}

function makeSnapshotPolicy() {
  // The daily snapshot wrap — exported so the proof test installs the
  // exact wrap code runOne runs. Returns { policy, days, errors }.
  const days = [];
  let waitingSoFar = 0;
  const errors = [];
  const policy = Object.assign({}, competent, {
    daily(G, ctx) {
      try {
        const s = snap(G, waitingSoFar);
        if (s.tableWaiting) waitingSoFar++;
        s.waitingDays = waitingSoFar;
        days.push(s);
      } catch (e) { errors.push('snap: ' + String((e && e.message) || e).slice(0, 80)); }
      return competent.daily(G, ctx);
    },
  });
  return { policy, days, errors, waiting: () => waitingSoFar };
}

async function runOne(seed) {
  const { Game } = await loadGame({ seed, mode: 'scalecensus-a', fullTelemetry: false });
  await setupGame(Game);
  const capture = [];
  const gdayOf = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  const snapWrap = makeSnapshotPolicy();
  const days = snapWrap.days;
  const errors = snapWrap.errors;
  const result = await runDays(Game, snapWrap.policy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  // Closing snapshot: the latest read, appended to the series so the
  // end-of-run bar table IS the last snapshot's breakdown (the daily
  // wrap reads at the top of each day; state can still move during
  // the final day's settlement, so a fresh post-run read would
  // disagree with the last daily read — same object, one read).
  const end = snap(Game, snapWrap.waiting());
  if (end.tableWaiting) end.waitingDays = snapWrap.waiting() + 1;
  days.push(end);

  // Harvest: fireside lines unfiltered; system table lines by regex.
  const fireside = [];
  const tableLines = [];
  for (const c of capture) {
    const m = FIRE_RX.exec(c.line);
    if (m) { fireside.push({ day: c.day, speaker: m[1], listener: m[2], text: m[3] }); continue; }
    if (TABLE_RX.test(c.line)) tableLines.push({ day: c.day, line: c.line.slice(0, 400) });
  }
  const firstDayWhere = (pred) => { const d = days.find(pred); return d ? d.day : null; };
  const markerDay = (rx) => { const c = capture.find(x => rx.test(x.line)); return c ? c.day : null; };
  const ranksSeen = [...new Set(days.map(d => d.rank))];
  const seatsSeen = [...new Set(days.map(d => d.seat))];
  const maxRank = days.reduce((m, d) => (RANK_ORDER[d.rank] || 0) > (RANK_ORDER[m] || 0) ? d.rank : m, 'village');
  const firstWaitingDay = firstDayWhere(d => d.tableWaiting);
  const firstEnteredDay = firstDayWhere(d => d.tableDone);
  const gateErrors = days.filter(d => d.gateError).length;
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxRank, finalRank: end.rank,
    table: days.some(d => d.tableWaiting) || end.tableWaiting,
    entered: days.some(d => d.tableDone) || end.tableDone,
    arcMax: Math.max(1, ...days.map(d => d.arc || 1)),
    ranksSeen, seatsSeen, firstWaitingDay, firstEnteredDay,
    waitingDays: days.filter(d => d.tableWaiting).length,
    gateErrors, errors,
    markers: {
      // announceDay matches the GALACTIC announce only (the pale-light
      // line, ◈-prefixed). The bare /TABLE IS SET/ also matches the
      // Harvest Table ability shout ("THE TABLE IS SET. THE VILLAGE
      // IS ONE ANIMAL...") — on seed 113101 that fired day 39 and
      // mis-marked the announce 51 days early. Corrected 2026-11-28
      // after the pilot; the pilot corpus rows keep the old marker
      // and the evidence file reports the corrected days (pale-light
      // line + tableAnnounced flag agree: day 90 on the 6 survivors,
      // never on the 2 that died before 90).
      announceDay: markerDay(/◈ THE TABLE IS SET/),
      pelletDay: markerDay(/never be hungry again/i),
      nationProdDay: markerDay(/FINALES need a NATION/i),
      arcIVDay: markerDay(/ARC IV/),
      firstRegionalDay: firstDayWhere(d => (RANK_ORDER[d.rank] || 0) >= 1),
      firstNationalDay: firstDayWhere(d => (RANK_ORDER[d.rank] || 0) >= 2),
      firstLesserDay: firstDayWhere(d => d.seat === 'lesser' || d.seat === 'full'),
      firstFullDay: firstDayWhere(d => d.seat === 'full'),
      firstOvertimeDay: firstDayWhere(d => (d.overtime | 0) >= 1),
    },
    end: { rank: end.rank, pop: end.pop, pantry: end.pantry, pantrySrc: end.pantrySrc, stage: end.stage, gate: end.gate, seat: end.seat, ladderPeak: end.ladderPeak, capstone: end.capstone, overtime: end.overtime },
    pantrySrcs: [...new Set(days.map(d => d.pantrySrc))],
    snapshots: days,
    fireside, firesideCount: fireside.length,
    tableLines, tableLinesCount: tableLines.length,
    captureCount: capture.length,
    error: null,
  };
  writeFileRetry(path.join(OUTDIR, `s${seed}.json`), JSON.stringify(row, null, 1) + '\n');
  console.log(JSON.stringify({
    seed, days: row.days, endReason: row.endReason, won: row.won,
    maxRank, finalRank: row.finalRank, table: row.table, entered: row.entered,
    firstWaitingDay, waitingDays: row.waitingDays, finalSeat: end.seat,
    finalGateOk: end.gate ? !!end.gate.ok : null, gateErrors,
    firesideCount: row.firesideCount, tableLinesCount: row.tableLinesCount,
    markers: row.markers, pantrySrcs: row.pantrySrcs,
  }, null, 1));
  return row;
}

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function summary() {
  const rows = [];
  const missing = [];
  for (const seed of SEEDS) {
    const p = path.join(OUTDIR, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const fails = [];
  if (missing.length) fails.push(`missing rows: ${missing.join(',')}`);
  for (const r of rows) if (r.error) fails.push(`seed ${r.seed} errored: ${r.error}`);
  const band = rows.length ? {
    seeds: rows.length, wins: rows.filter(r => r.won).length,
    table: rows.filter(r => r.table).length, entered: rows.filter(r => r.entered).length,
    nationalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 2).length,
    regionalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 1).length,
    seated: rows.filter(r => r.entered).length,
    finalSeats: rows.map(r => (r.end && r.end.seat) || 'none'),
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    totalFireside: rows.reduce((a, r) => a + r.firesideCount, 0),
    totalTableLines: rows.reduce((a, r) => a + r.tableLinesCount, 0),
    waitingSeeds: rows.filter(r => r.table).map(r => r.seed),
    gateErrors: rows.reduce((a, r) => a + (r.gateErrors || 0), 0),
  } : null;
  const sum = { generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, band, rows: rows.map(r => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
    finalRank: r.finalRank, table: r.table, entered: r.entered, arcMax: r.arcMax,
    firstWaitingDay: r.firstWaitingDay, waitingDays: r.waitingDays,
    finalSeat: (r.end && r.end.seat) || 'none', finalGateOk: (r.end && r.end.gate) ? !!r.end.gate.ok : null,
    gateErrors: r.gateErrors || 0,
    firesideCount: r.firesideCount, tableLinesCount: r.tableLinesCount,
    markers: r.markers,
  })) };
  writeFileRetry(path.join(OUTDIR, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
  console.log(JSON.stringify(sum, null, 1));
  if (fails.length) { console.error('SCALECENSUS CORPUS FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log(`SCALECENSUS CORPUS PASS: ${rows.length}/${SEEDS.length} seeds, no row errors.`);
}

async function main() {
  const mode = process.argv[2];
  if (mode === '--one') {
    const seed = parseInt(process.argv[3], 10);
    if (!Number.isFinite(seed)) { console.error('usage: --one <seed>'); process.exit(1); }
    await runOne(seed);
  } else if (mode === '--summary') {
    summary();
  } else {
    console.error('usage: scalecensus-driver-a.js --one <seed> | --summary');
    process.exit(1);
  }
}
if (require.main === module) main().catch(e => { console.error('SCALECENSUS DRIVER FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { snap, gateOf, seatOf, ladderPeakOf, overtimeOf, makeSnapshotPolicy, runOne, FIRE_RX, TABLE_RX };
