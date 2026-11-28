#!/usr/bin/env node
// scripts/capstoneready-driver-a.js — sim-capstoneready-a recorder driver
// (Loop A run fleshout-20261128T0315Z, scalecensus §7 arm #2, LEG 1).
// DIAGNOSTIC ONLY — zero src/js changes, zero policy changes. It
// HARVESTS capstone readiness; it does not pull any lever and it
// never calls ladderDeliverCapstone (the competent policy has no
// delivery verb, and leg 1 must not invent one).
//
// Substrate: competent verbatim, 150d DEATH-AWARE horizon, seeds
// 113301-113308. NO substrate flags — the honest capstone leg, so the
// recorder reads what competent play actually builds by day 80-140.
// Corpus under evidence/2026-11-28/perseed-capstoneready-a-arm/.
//
// What is harvested per seed (read-only wraps, no RNG, no inputs):
//   - A DAILY snapshot: day, rank, arc, tableWaiting, tableDone,
//     tableAnnounced, stage, pop, pantry kcal (best-effort
//     accessors, source recorded), waitingDays so far, PLUS the
//     deed-gate breakdown (deedGateReady()), the priced seat
//     (tableSeat() + detail: ladderPeak, capstone), ladder peak,
//     overtime tier — AND the capstone-readiness breakdown:
//     ladderCapstoneReady(kind) for all three kinds
//     (military_tribute / trade_charter / feast_embassy), each
//     stored WHOLE (ready, reason, + kind-specific fields), plus
//     `deliverable` per kind (ready AND, for tribute,
//     payable >= 2; for charter/feast, ready alone — delivery
//     takes no payment) and the delivered capstone
//     (ladderCapstoneDelivered(), expected null throughout).
//   - EVERY fireside line: any say/emit line starting with the fire
//     glyph, parsed into speaker / listener / text. NO keyword
//     filter — classification happens in the analyzer, never at
//     harvest.
//   - EVERY system table line: say/emit lines matching
//     /table|pale light/i that are NOT fireside lines.
//   - Marker days derived from the capture/snapshots: announce
//     (pale-light line, ◈-prefixed), pellet, nation prod, arc IV
//     beat, first regional, first national, first lesser seat,
//     first full seat, first overtime tier, first-ready day per
//     kind, first-deliverable day per kind.
// Row fields for the wall: days, gameDays, endReason, won,
// maxRank, finalRank, table (everWaiting), entered (everDone),
// arcMax, finalSeat, finalGate (last snapshot breakdown),
// finalReadiness (last snapshot readiness breakdown).
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
// Each --one run is its own node process (fresh loadGame per seed),
// so no per-seed row sequence can leak across seeds.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-28', 'perseed-capstoneready-a-arm');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '113301,113302,113303,113304,113305,113306,113307,113308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const FIRE_RX = /^🗣️ (.+?) to (.+?), by the fire: (.*)$/s;
const TABLE_RX = /table|pale light/i;
const CAPSTONE_KINDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

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

// deliverableOf(kind, read): the readiness/delivery split, frozen in
// the prereg §1. Ready is the BAR; deliverable is the PAYMENT.
// tribute: ready AND payable >= 2 (a scholar-veteran + 1 villager
// reads ready but refuses delivery with 'veterans-short').
// charter/feast: ready alone — the delivery records the deed and
// takes no payment. An already-delivered capstone is never
// deliverable again (read.ready is false with reason 'delivered').
function deliverableOf(kind, read) {
  if (!read || typeof read !== 'object' || read.error) return false;
  if (!read.ready) return false;
  if (kind === 'military_tribute') return ((read.payable | 0) >= 2);
  return true;
}

// readinessOf(Game): the daily capstone-readiness breakdown. One entry
// per kind, stored WHOLE (the analyzer recomputes `ready` from the
// stored fields — never from a re-simulation). Never throws; a kind
// that fails to read carries { error } and counts against coverage.
function readinessOf(Game) {
  const out = {};
  for (const kind of CAPSTONE_KINDS) {
    try {
      if (typeof Game.ladderCapstoneReady !== 'function') { out[kind] = { kind, error: 'no-ladderCapstoneReady' }; continue; }
      const r = Game.ladderCapstoneReady(kind);
      if (!r || typeof r !== 'object') { out[kind] = { kind, error: 'ladderCapstoneReady-null' }; continue; }
      const entry = { kind, ready: !!r.ready, reason: (typeof r.reason === 'string') ? r.reason : null };
      if (typeof r.delivered === 'string') entry.delivered = r.delivered;
      if (kind === 'military_tribute') {
        entry.veterans = (typeof r.veterans === 'number') ? r.veterans : null;
        entry.payable = (typeof r.payable === 'number') ? r.payable : null;
        entry.need = (typeof r.need === 'number') ? r.need : null;
      }
      if (kind === 'trade_charter') {
        entry.charteredLinks = (typeof r.charteredLinks === 'number') ? r.charteredLinks : null;
        entry.scale = (typeof r.scale === 'string') ? r.scale : null;
      }
      if (kind === 'feast_embassy') {
        entry.stage = (typeof r.stage === 'number') ? r.stage : null;
        entry.needStage = (typeof r.needStage === 'number') ? r.needStage : null;
        entry.bundle = (typeof r.bundle === 'boolean') ? r.bundle : null;
      }
      entry.deliverable = deliverableOf(kind, entry);
      out[kind] = entry;
    } catch (e) {
      out[kind] = { kind, error: 'ladderCapstoneReady-threw:' + String((e && e.message) || e).slice(0, 80) };
    }
  }
  return out;
}

function deliveredOf(Game) {
  try { return (typeof Game.ladderCapstoneDelivered === 'function') ? (Game.ladderCapstoneDelivered() || null) : null; }
  catch (e) { return null; }
}

function snap(Game, waitingSoFar) {
  const out = { day: 0, rank: 'village', arc: 1, tableWaiting: false, tableDone: false, tableAnnounced: false, stage: null, pop: null, pantry: null, pantrySrc: 'none', waitingDays: waitingSoFar, gate: null, gateError: null, seat: 'none', ladderPeak: null, capstone: null, overtime: null, readiness: null, readinessError: null, delivered: null };
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
  const rd = readinessOf(Game);
  const bad = CAPSTONE_KINDS.filter(k => !rd[k] || rd[k].error);
  if (bad.length) { out.readiness = rd; out.readinessError = 'readiness-error:' + bad.join(','); }
  else out.readiness = rd;
  out.delivered = deliveredOf(Game);
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
  const { Game } = await loadGame({ seed, mode: 'capstoneready-a', fullTelemetry: false });
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
  // end-of-run readiness table IS the last snapshot's breakdown (the
  // daily wrap reads at the top of each day; state can still move
  // during the final day's settlement, so a fresh post-run read would
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
  const readinessErrors = days.filter(d => d.readinessError).length;
  const readyDays = {};
  const deliverableDays = {};
  const firstReadyDay = {};
  const firstDeliverableDay = {};
  for (const k of CAPSTONE_KINDS) {
    readyDays[k] = days.filter(d => d.readiness && d.readiness[k] && d.readiness[k].ready).length;
    deliverableDays[k] = days.filter(d => d.readiness && d.readiness[k] && d.readiness[k].deliverable).length;
    firstReadyDay[k] = firstDayWhere(d => d.readiness && d.readiness[k] && d.readiness[k].ready);
    firstDeliverableDay[k] = firstDayWhere(d => d.readiness && d.readiness[k] && d.readiness[k].deliverable);
  }
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxRank, finalRank: end.rank,
    table: days.some(d => d.tableWaiting) || end.tableWaiting,
    entered: days.some(d => d.tableDone) || end.tableDone,
    arcMax: Math.max(1, ...days.map(d => d.arc || 1)),
    ranksSeen, seatsSeen, firstWaitingDay, firstEnteredDay,
    waitingDays: days.filter(d => d.tableWaiting).length,
    gateErrors, readinessErrors, errors,
    readyDays, deliverableDays, firstReadyDay, firstDeliverableDay,
    markers: {
      // announceDay matches the GALACTIC announce only (the pale-light
      // line, ◈-prefixed). The bare /TABLE IS SET/ also matches the
      // Harvest Table ability shout — see the scalecensus §5.3
      // correction; the tightened regex is carried here verbatim.
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
    end: { rank: end.rank, pop: end.pop, pantry: end.pantry, pantrySrc: end.pantrySrc, stage: end.stage, gate: end.gate, seat: end.seat, ladderPeak: end.ladderPeak, capstone: end.capstone, overtime: end.overtime, readiness: end.readiness, delivered: end.delivered },
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
    finalGateOk: end.gate ? !!end.gate.ok : null, gateErrors, readinessErrors,
    readyDays, deliverableDays, firstReadyDay, firstDeliverableDay,
    delivered: end.delivered,
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
    readinessErrors: rows.reduce((a, r) => a + (r.readinessErrors || 0), 0),
    anyReady: rows.filter(r => CAPSTONE_KINDS.some(k => (r.readyDays || {})[k] > 0)).map(r => r.seed),
    anyDeliverable: rows.filter(r => CAPSTONE_KINDS.some(k => (r.deliverableDays || {})[k] > 0)).map(r => r.seed),
    deliveredAny: rows.filter(r => r.end && r.end.delivered).map(r => r.seed),
  } : null;
  const sum = { generated: new Date().toISOString(), seeds: SEEDS, days: DAYS, band, rows: rows.map(r => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
    finalRank: r.finalRank, table: r.table, entered: r.entered, arcMax: r.arcMax,
    firstWaitingDay: r.firstWaitingDay, waitingDays: r.waitingDays,
    finalSeat: (r.end && r.end.seat) || 'none', finalGateOk: (r.end && r.end.gate) ? !!r.end.gate.ok : null,
    gateErrors: r.gateErrors || 0, readinessErrors: r.readinessErrors || 0,
    readyDays: r.readyDays, deliverableDays: r.deliverableDays,
    firstReadyDay: r.firstReadyDay, firstDeliverableDay: r.firstDeliverableDay,
    delivered: (r.end && r.end.delivered) || null,
    firesideCount: r.firesideCount, tableLinesCount: r.tableLinesCount,
    markers: r.markers,
  })) };
  writeFileRetry(path.join(OUTDIR, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
  console.log(JSON.stringify(sum, null, 1));
  if (fails.length) { console.error('CAPSTONEREADY CORPUS FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log(`CAPSTONEREADY CORPUS PASS: ${rows.length}/${SEEDS.length} seeds, no row errors.`);
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
    console.error('usage: capstoneready-driver-a.js --one <seed> | --summary');
    process.exit(1);
  }
}
if (require.main === module) main().catch(e => { console.error('CAPSTONEREADY DRIVER FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { snap, gateOf, seatOf, ladderPeakOf, overtimeOf, readinessOf, deliveredOf, deliverableOf, makeSnapshotPolicy, runOne, FIRE_RX, TABLE_RX, CAPSTONE_KINDS };
