#!/usr/bin/env node
// regtable-analyze-20261031.js — per-seed milestone classification
// for the sim-regtable-a corpus.
//
// Reads evidence/2026-10-31/perseed-regtable/leadfeast/s<seed>.json
// (or --dir <dir>) and prints/derives, per seed: row continuity,
// nationalDay, regionalDay, wave4Day (from wavegate rows), tableDay,
// rank/seat/full-gate at tableDay, firstLesserDay, firstFullDay,
// winDay, endRank, endSeat, ever-regional-no-table. With --out
// <file> it also writes the analysis JSON (idle process, no game).
//
// Milestone definitions are the prereg's: tableDay is the first row
// with tableWaiting or tableDone true; rank/seat at tableDay come
// from THAT row, never from the end rank.
'use strict';
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let dir = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-regtable', 'leadfeast');
let out = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir') dir = args[++i];
  else if (args[i] === '--out') out = args[++i];
}

function firstDay(rows, pred) {
  for (const r of rows) { if (pred(r)) return r.day; }
  return null;
}

function analyzeOne(obj) {
  const rows = obj.rows || [];
  const wg = obj.wavegateRows || [];
  // Continuity: rows cover every daily call. The harness's day numbers
  // are NOT strictly consecutive: day 2 fires twice (setup), day 3 has
  // no row on any seed, and day 4 fires twice — the same shape on
  // every seed and both recorders. So continuity is reported as the
  // missing-day list + row count vs gameDays, NOT a strict +1 check
  // (the strict reading misfires on every seed by construction).
  let first = null, last = null;
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i].day;
    if (i === 0) first = d;
    last = d;
  }
  const distinct = [...new Set(rows.map(r => r.day))].sort((a, b) => a - b);
  const missing = [];
  for (let d = distinct[0]; d <= distinct[distinct.length - 1]; d++) {
    if (!distinct.includes(d)) missing.push(d);
  }
  const gaps = missing.length;
  const tableRow = rows.find(r => r.tableWaiting || r.tableDone) || null;
  const tableDoneRow = rows.find(r => r.tableDone) || null;
  const tableDay = tableRow ? tableRow.day : null;
  const a = {
    seed: obj.seed,
    anchorCommit: obj.anchorCommit || null,
    instrument: obj.instrument || null,
    rows: rows.length, wgRows: wg.length,
    firstDay: first, lastDay: last, gaps, missingDays: missing, distinctDays: distinct.length, recorderErrs: obj.recorderErrs || 0, wavegateErrs: obj.wavegateErrs || 0,
    gameDays: obj.gameDays, endReason: obj.endReason, won: obj.won, national: obj.national, table: obj.table,
    endScaleRank: obj.endScaleRank,
    nationalDay: firstDay(rows, r => r.rank === 'national' || r.rank === 'global'),
    regionalDay: firstDay(rows, r => r.rank === 'regional'),
    everRegional: rows.some(r => r.rank === 'regional'),
    wave4Day: firstDay(wg, r => (r.uw | 0) >= 4),
    wave5Day: firstDay(wg, r => (r.uw | 0) >= 5),
    tableDay,
    tableDoneDay: tableDoneRow ? tableDoneRow.day : null,
    rankAtTableDay: tableRow ? tableRow.rank : null,
    seatAtTableDay: tableRow ? tableRow.seat : null,
    fullOkAtTableDay: tableRow ? tableRow.fullOk : null,
    fullAtTableDay: tableRow ? tableRow.full : null,
    seatDetailAtTableDay: tableRow ? tableRow.seatDetail : null,
    arcAtTableDay: tableRow ? tableRow.arc : null,
    tableAnnouncedAtTableDay: tableRow ? tableRow.tableAnnounced : null,
    winFloorOkAtTableDay: tableRow ? tableRow.winFloorOk : null,
    firstLesserDay: firstDay(rows, r => r.seat === 'lesser'),
    firstFullDay: firstDay(rows, r => r.seat === 'full'),
    winDay: firstDay(rows, r => r.won),
    endRank: rows.length ? rows[rows.length - 1].rank : null,
    endSeat: rows.length ? rows[rows.length - 1].seat : null,
    endFullOk: rows.length ? rows[rows.length - 1].fullOk : null,
    beats: (obj.beats || []).length,
    derivedFinalUw: obj.derivedFinalUw, engineFinalUw: obj.engineFinalUw,
  };
  a.regionalTable = (a.tableDay != null && a.rankAtTableDay === 'regional');
  a.nationalTable = (a.tableDay != null && (a.rankAtTableDay === 'national' || a.rankAtTableDay === 'global'));
  a.everRegionalNoTable = a.everRegional && a.tableDay == null;
  return a;
}

const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
if (!files.length) { console.error('ANALYZE STOP: no per-seed JSONs in ' + dir); process.exit(2); }
const seeds = [];
for (const f of files) {
  const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  seeds.push(analyzeOne(obj));
}
const summary = {
  seeds: seeds.length,
  regionalTable: seeds.filter(s => s.regionalTable).map(s => s.seed),
  nationalTable: seeds.filter(s => s.nationalTable).map(s => s.seed),
  anyTable: seeds.filter(s => s.tableDay != null).map(s => s.seed),
  everRegionalNoTable: seeds.filter(s => s.everRegionalNoTable).map(s => s.seed),
  tableSeats: seeds.filter(s => s.tableDay != null).map(s => ({ seed: s.seed, tableDay: s.tableDay, rank: s.rankAtTableDay, seat: s.seatAtTableDay, fullOk: s.fullOkAtTableDay })),
};
const result = { summary, seeds };
if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1) + '\n');
console.log(JSON.stringify(summary, null, 1));
for (const s of seeds) {
  console.log(`s${s.seed}: rows=${s.rows} distinctDays=${s.distinctDays} missing=${JSON.stringify(s.missingDays)} errs=${s.recorderErrs} nat=${s.nationalDay} w4=${s.wave4Day} table=${s.tableDay} rank@table=${s.rankAtTableDay} seat@table=${s.seatAtTableDay} fullOk@table=${s.fullOkAtTableDay} lesser1st=${s.firstLesserDay} full1st=${s.firstFullDay} win=${s.winDay} end=${s.endReason}/${s.endRank}/${s.endSeat} gameDays=${s.gameDays} beats=${s.beats} uw=${s.derivedFinalUw}/${s.engineFinalUw}`);
}
