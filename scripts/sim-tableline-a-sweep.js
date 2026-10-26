#!/usr/bin/env node
// scripts/sim-tableline-a-sweep.js — sim-tableline-a census sweep
// (scale-onramp axis, dialogue-variety measurement, run
// fleshout-20261026T1816Z). DIAGNOSTIC ONLY — zero src/js changes,
// zero dialogue-string changes. It HARVESTS table talk; it does not
// write it.
//
// Substrate (identical to the 1715Z tablenat band): tableseat-nowait
// policy (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only),
// 180d DEATH-AWARE horizon, seeds 73671-73678. Corpus under
// evidence/2026-10-26/perseed-sim-tableline-a/.
//
// What is harvested per seed (read-only wraps, no RNG, no inputs):
//   - EVERY fireside line: any say/emit line starting with the fire
//     glyph (U+1F5E3 U+FE0F), parsed into speaker / listener / text.
//     NO keyword filter here — the tablenat arm's filter ("ring of
//     pale light" etc.) could only ever pass ONE of the six
//     tableWaitTalk pool lines, so filtering at harvest time is
//     exactly how a variety census lies. Classification happens in
//     the analyzer, never at harvest.
//   - EVERY system table line: say/emit lines matching /table|pale
//     light/i that are NOT fireside lines (announces, Arc IV beats,
//     the nation prod, the reactor pellet) — situation context.
//   - A DAILY snapshot: day, rank, arc, tableWaiting, tableDone,
//     tableAnnounced, stage, pop (roster length), pantry kcal
//     (best-effort accessors, source recorded), waitingDays so far.
//   - Marker days derived from the capture: announce (TABLE IS SET),
//     pellet ("never be hungry again"), nation prod (FINALES need a
//     NATION), arc IV beat.
// Row fields for band corroboration vs the tablenat corpus: days,
// gameDays, endReason, won, maxRank, finalRank, table (everWaiting),
// entered (everDone), arcMax.
//
// Modes:
//   --one <seed> : run one seed, write its row.
//   --summary   : build summary.json from rows on disk, print the
//                 band table + corroboration vs the tablenat corpus.
//                 Exit 1 only if the corpus is incomplete or any row
//                 errored; drift vs tablenat is REPORTED, never a gate.
// Exit 1 in --one mode if the run throws.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tableline-a');
const TABLENAT_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tablenat-a');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
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

function snap(Game, waitingSoFar) {
  const out = { day: 0, rank: 'village', arc: 1, tableWaiting: false, tableDone: false, tableAnnounced: false, stage: null, pop: null, pantry: null, pantrySrc: 'none', waitingDays: waitingSoFar };
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
  return out;
}

async function runOne(seed) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'tableline-a', fullTelemetry: false });
  await setupGame(Game);
  const capture = [];
  const gdayOf = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  const days = [];
  let waitingSoFar = 0;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      const s = snap(G, waitingSoFar);
      if (s.tableWaiting) waitingSoFar++;
      s.waitingDays = waitingSoFar;
      days.push(s);
      return tableseatNowait.daily(G, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game, waitingSoFar);

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
  const maxRank = days.reduce((m, d) => (RANK_ORDER[d.rank] || 0) > (RANK_ORDER[m] || 0) ? d.rank : m, 'village');
  const firstWaitingDay = firstDayWhere(d => d.tableWaiting);
  const firstEnteredDay = firstDayWhere(d => d.tableDone);
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxRank, finalRank: end.rank,
    table: days.some(d => d.tableWaiting) || end.tableWaiting,
    entered: days.some(d => d.tableDone) || end.tableDone,
    arcMax: Math.max(1, ...days.map(d => d.arc || 1)),
    ranksSeen, firstWaitingDay, firstEnteredDay,
    waitingDays: days.filter(d => d.tableWaiting).length,
    markers: {
      announceDay: markerDay(/TABLE IS SET/),
      pelletDay: markerDay(/never be hungry again/i),
      nationProdDay: markerDay(/FINALES need a NATION/i),
      arcIVDay: markerDay(/ARC IV/),
    },
    end: { rank: end.rank, pop: end.pop, pantry: end.pantry, pantrySrc: end.pantrySrc, stage: end.stage },
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
    firstWaitingDay, waitingDays: row.waitingDays,
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
  // Corroboration vs the tablenat corpus (same 8 seeds, same substrate).
  const corro = [];
  for (const r of rows) {
    const tp = path.join(TABLENAT_DIR, `s${r.seed}-rebaseline.json`);
    let t = null;
    if (fs.existsSync(tp)) { try { t = JSON.parse(fs.readFileSync(tp, 'utf8')); } catch (e) {} }
    if (!t) { corro.push({ seed: r.seed, tablenatRow: false }); continue; }
    const diffs = [];
    // Tablenat row field names (from its summary/rows): days, endReason,
    // won, maxRank, finalRank, table, entered. Boolean-vs-0/1 type
    // differences are NOT diffs (tablenat rows store 0/1, these rows
    // store booleans); normalize before comparing.
    const norm = (v) => (typeof v === 'boolean' ? (v ? 1 : 0) : v);
    for (const [mine, theirs] of [['days', 'days'], ['endReason', 'endReason'], ['won', 'won'], ['maxRank', 'maxRank'], ['finalRank', 'finalRank'], ['table', 'table'], ['entered', 'entered']]) {
      if (theirs in t && norm(r[mine]) !== norm(t[theirs])) diffs.push(`${mine}: tableline=${JSON.stringify(r[mine])} tablenat=${JSON.stringify(t[theirs])}`);
    }
    corro.push({ seed: r.seed, tablenatRow: true, diffs });
  }
  const band = rows.length ? {
    seeds: rows.length, wins: rows.filter(r => r.won).length,
    table: rows.filter(r => r.table).length, entered: rows.filter(r => r.entered).length,
    nationalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 2).length,
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    totalFireside: rows.reduce((a, r) => a + r.firesideCount, 0),
    totalTableLines: rows.reduce((a, r) => a + r.tableLinesCount, 0),
    waitingSeeds: rows.filter(r => r.table).map(r => r.seed),
  } : null;
  const sum = { generated: new Date().toISOString(), seeds: SEEDS, band, rows: rows.map(r => ({
    seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
    finalRank: r.finalRank, table: r.table, entered: r.entered, arcMax: r.arcMax,
    firstWaitingDay: r.firstWaitingDay, waitingDays: r.waitingDays,
    firesideCount: r.firesideCount, tableLinesCount: r.tableLinesCount,
    markers: r.markers,
  })), corroboration: corro };
  writeFileRetry(path.join(OUTDIR, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
  console.log(JSON.stringify(sum, null, 1));
  if (fails.length) { console.error('TABLELINE CORPUS FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log(`TABLELINE CORPUS PASS: ${rows.length}/${SEEDS.length} seeds, no row errors.`);
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
    console.error('usage: sim-tableline-a-sweep.js --one <seed> | --summary');
    process.exit(1);
  }
}
if (require.main === module) main().catch(e => { console.error('TABLELINE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { FIRE_RX, TABLE_RX };
