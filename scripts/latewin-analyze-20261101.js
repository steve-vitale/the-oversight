#!/usr/bin/env node
// latewin-analyze-20261101.js — sim-latewin-a timeline analyzer.
// Derives every judged number from per-seed JSONs only (no
// re-simulation). Pure function deriveTimeline() is exported for
// scripts/test-latewin-20261101.js.
//
// Derivation rules (prereg, binding):
// - wave4Day: first timeline day with uw >= 4, else null (never).
// - omenStartDay: first day omenStage != null, else null.
// - placeDay: first day omenStage == 2, else null (never placed).
// - nationalDay: first day rank national/global, else null.
// - tableDay: first day tableWaiting|tableDone, else null.
// - winDay: first day won == 1; if the run ends won but no row has
//   won (Game.over broke before daily), winDay = finalRow.day.
//   seatAtWin: seat on the winDay row, else finalRow.seat.
// - Gaps are null whenever either endpoint is null — including
//   win-before-placement (never 0, never negative-imputed).
// - roadPossibleBeforeWin: placeDay != null && placeDay <= winDay.
// - brief13Fit: winDay != null && placeDay != null &&
//   winDay - placeDay >= 13 (the brief's literal test).
// - completeTimeline: timeline rows cover the run (rows > 0 and
//   last row day >= endDay - 1, allowing the final snapshot to
//   carry the last day) AND no row carries .error.
// - completeTimelineWithWave4AndEnd (pilot-gate sense): complete
//   AND wave4Day != null AND (winDay != null OR endDay observed).
'use strict';
const fs = require('fs');
const path = require('path');

function firstDay(rows, pred) {
  for (const r of rows || []) { if (pred(r)) return r.day; }
  return null;
}

function deriveTimeline(seedRow) {
  const rows = (seedRow.timeline || []).slice();
  const finalRow = seedRow.finalRow || null;
  const endDay = (seedRow.gameDays != null ? seedRow.gameDays : (rows.length ? rows[rows.length - 1].day : null));
  const wave4Day = firstDay(rows, r => (r.uw | 0) >= 4);
  const omenStartDay = firstDay(rows, r => r.omenStage != null);
  const placeDay = firstDay(rows, r => r.omenStage === 2);
  const nationalDay = firstDay(rows, r => r.rank === 'national' || r.rank === 'global');
  const tableDay = firstDay(rows, r => r.tableWaiting || r.tableDone);
  let winDay = firstDay(rows, r => r.won);
  let seatAtWin = null;
  if (winDay != null) {
    const wrow = rows.find(r => r.day === winDay);
    seatAtWin = (wrow && wrow.seat) || (finalRow && finalRow.seat) || 'none';
  } else if (seedRow.won && finalRow) {
    // Win landed after the last daily call (Game.over break).
    winDay = finalRow.day;
    seatAtWin = finalRow.seat || 'none';
  }
  const endOmenStage = (seedRow.endOmenStage != null ? seedRow.endOmenStage
    : (rows.length ? rows[rows.length - 1].omenStage : null));
  const gap = (a, b) => (a != null && b != null ? a - b : null);
  const winGapWave4 = gap(winDay, wave4Day);
  const winGapPlace = gap(winDay, placeDay);
  const endGapWave4 = (winDay == null ? gap(endDay, wave4Day) : null);
  const endGapPlace = (winDay == null ? gap(endDay, placeDay) : null);
  const roadPossibleBeforeWin = (winDay != null && placeDay != null && placeDay <= winDay);
  const brief13Fit = (winDay != null && placeDay != null && winDay - placeDay >= 13);
  const hasErrorRow = rows.some(r => r.error != null);
  const completeTimeline = rows.length > 0 && !hasErrorRow &&
    (endDay == null || rows[rows.length - 1].day >= endDay - 1);
  const completeWithWave4AndEnd = completeTimeline && wave4Day != null && endDay != null;
  return {
    seed: seedRow.seed, endDay, endReason: seedRow.endReason || null,
    won: seedRow.won ? 1 : 0, maxWave: seedRow.maxWave != null ? seedRow.maxWave : null,
    censusW4Day: (seedRow.w4Day != null ? seedRow.w4Day : null),
    wave4Day, omenStartDay, placeDay, nationalDay, tableDay,
    winDay, seatAtWin, endOmenStage,
    winGapWave4, winGapPlace, endGapWave4, endGapPlace,
    roadPossibleBeforeWin, brief13Fit,
    completeTimeline, completeWithWave4AndEnd,
    timelineRows: rows.length,
    instrumentErrors: (seedRow.instrumentErrors || []).length,
    musterErrs: seedRow.musterErrs || 0,
  };
}

function summarize(derivedList) {
  const wins = derivedList.filter(d => d.won);
  const winsBeforeRoad = wins.filter(d => !d.roadPossibleBeforeWin);
  const winsBrief13 = wins.filter(d => d.brief13Fit);
  const placedWins = wins.filter(d => d.placeDay != null);
  const gaps = placedWins.map(d => d.winGapPlace).filter(g => g != null);
  const wave4Wins = wins.filter(d => d.wave4Day != null);
  return {
    judged: derivedList.length,
    completeTimelines: derivedList.filter(d => d.completeTimeline).length,
    completeWithWave4AndEnd: derivedList.filter(d => d.completeWithWave4AndEnd).length,
    reachedWave4: derivedList.filter(d => d.wave4Day != null).length,
    wins: wins.length,
    winsLesser: wins.filter(d => d.seatAtWin === 'lesser').length,
    winsFull: wins.filter(d => d.seatAtWin === 'full').length,
    winsSeatNone: wins.filter(d => d.seatAtWin === 'none' || d.seatAtWin == null).length,
    winsBeforeRoad: winsBeforeRoad.length,
    winsBeforeRoadFraction: wins.length ? (winsBeforeRoad.length + '/' + wins.length) : '0/0',
    winsBrief13Fit: winsBrief13.length,
    minWinGapPlace: gaps.length ? Math.min.apply(null, gaps) : null,
    minWinGapWave4: wave4Wins.length ? Math.min.apply(null, wave4Wins.map(d => d.winGapWave4)) : null,
    instrumentErrorsTotal: derivedList.reduce((t, d) => t + d.instrumentErrors + d.musterErrs, 0),
  };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-01', 'perseed-latewin', 'leadfeast');
  const outPath = process.argv[3] || null;
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const derived = files.map(f => deriveTimeline(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  derived.sort((a, b) => a.seed - b.seed);
  const summary = summarize(derived);
  const out = { derived, summary };
  console.log(JSON.stringify(out, null, 1));
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
}

module.exports = { deriveTimeline, summarize };
