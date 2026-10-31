#!/usr/bin/env node
// wavegate-analyze-20261031.js — sim-wavegate-a gate-decomposition analyzer.
//
// Reads per-seed JSONs from the wavegate sweep (perseed-wavegate/
// leadfeast/s<seed>.json) and computes, per the prereg's binding
// classification rules: milestone days, wave-4/5 blockers at
// nationalDay and at run end, road-vs-stall per national seed,
// milestone ordering, pre-wave-4 fractions at each milestone with
// denominators, and wall numbers.
//
// Pure functions are exported for the proof test; the CLI main
// (require.main === module) reads a directory and writes the
// analysis JSON next to it.
//
// Usage:
//   node scripts/wavegate-analyze-20261031.js [dir] [outfile]
'use strict';
const fs = require('fs');
const path = require('path');

function firstRow(rows, pred) {
  for (const r of rows) { try { if (pred(r)) return r; } catch (e) {} }
  return null;
}

function milestones(rows) {
  const at = (pred) => { const r = firstRow(rows, pred); return r ? r.day : null; };
  const rowAt = (pred) => firstRow(rows, pred);
  const m = {
    regionalDay: at(r => ['regional', 'national', 'global'].indexOf(r.rank) >= 0),
    nationalDay: at(r => r.rank === 'national' || r.rank === 'global'),
    wave4Day: at(r => (r.uw | 0) >= 4),
    wave5Day: at(r => (r.uw | 0) >= 5),
    tableDay: at(r => r.tableWaiting || r.tableDone),
    winDay: at(r => !!r.won),
  };
  m.nationalRow = rowAt(r => r.rank === 'national' || r.rank === 'global');
  m.wave4Row = rowAt(r => (r.uw | 0) >= 4);
  m.tableRow = rowAt(r => r.tableWaiting || r.tableDone);
  m.winRow = rowAt(r => !!r.won);
  return m;
}

// classifyBlocker(row, wave): exactly one of UNLOCKED / W3-RUNG-DAY /
// W3-RUNG-BAR / STANDING-BELOW / DEFER4 / DEFER5 / CAP / W4-FACED /
// BELOW (wave-5 below-bar with no hold) / OTHER:<hold>. For wave 5,
// the plenty cap and the w4-faced requirement are checked before
// the below-bar verdict.
function classifyBlocker(row, wave) {
  if (!row) return 'NO-ROW';
  if (wave === 4) {
    if ((row.uw | 0) >= 4) return 'UNLOCKED';
    if (!row.w3rung) return (row.day < (row.dN | 0)) ? 'W3-RUNG-DAY' : 'W3-RUNG-BAR';
    if ((row.raw | 0) < (row.t4 | 0)) return 'STANDING-BELOW';
    if ((row.binding || []).indexOf('defer4') >= 0) return 'DEFER4';
    return 'OTHER:' + String(row.hold || '?');
  }
  // wave 5
  if ((row.uw | 0) >= 5) return 'UNLOCKED';
  if (!row.w3rung) return (row.day < (row.dN | 0)) ? 'W3-RUNG-DAY' : 'W3-RUNG-BAR';
  if (!row.w4faced) return 'W4-FACED';
  if ((row.binding || []).indexOf('cap') >= 0) return 'CAP';
  if ((row.binding || []).indexOf('defer5') >= 0) return 'DEFER5';
  if ((row.capped | 0) < (row.t5 | 0)) return 'BELOW';
  return 'OTHER:' + String(row.hold || '?');
}

function roadStall(m, end) {
  if (m.wave4Day != null) return 'ROAD';
  if (end.won) return 'STALL-WIN-LESSER';
  if (end.endReason) return 'STALL-' + String(end.endReason).toUpperCase();
  return 'STALL-UNKNOWN';
}

function analyzeSeed(j) {
  const rows = j.rows || [];
  const m = milestones(rows);
  const last = rows.length ? rows[rows.length - 1] : null;
  const national = m.nationalDay != null;
  const per = {
    seed: j.seed, national, endReason: j.endReason, won: !!j.won, table: !!j.table,
    gameDays: j.gameDays, endScaleRank: j.endScaleRank, maxWave: j.maxWave,
    regionalDay: m.regionalDay, nationalDay: m.nationalDay,
    wave4Day: m.wave4Day, wave5Day: m.wave5Day,
    tableDay: m.tableDay, winDay: m.winDay,
    rows: rows.length, recorderErrs: j.recorderErrs | 0,
    derivedFinalUw: j.derivedFinalUw, engineFinalUw: j.engineFinalUw,
    derivedMatchesEngine: j.derivedFinalUw === j.engineFinalUw,
    endRow: last ? { day: last.day, rank: last.rank, uw: last.uw, raw: last.raw, gated: last.gated, hold: last.hold } : null,
  };
  if (national) {
    const nr = m.nationalRow;
    per.blockerAtNational = classifyBlocker(nr, 4);
    per.nationalRow = { day: nr.day, rank: nr.rank, uw: nr.uw, raw: nr.raw, gated: nr.gated, hold: nr.hold,
      war: nr.war, dip: nr.dip, plenty: nr.plenty, warPts: nr.warPts, links: nr.links, feasts: nr.feasts,
      p2: nr.p2, bar2: nr.bar2, w3rung: nr.w3rung,
      rd4: nr.rd4 };
    per.blockerAtEnd = last ? classifyBlocker(last, 4) : 'NO-ROW';
    per.endRowFull = last ? { day: last.day, rank: last.rank, uw: last.uw, raw: last.raw, gated: last.gated, hold: last.hold,
      war: last.war, dip: last.dip, plenty: last.plenty, warPts: last.warPts, links: last.links, feasts: last.feasts,
      p2: last.p2, bar2: last.bar2, w3rung: last.w3rung, rd4: last.rd4 } : null;
    per.roadStall = roadStall(m, j);
    per.preW4AtNational = (nr.uw | 0) < 4 ? 1 : 0;
    per.preW4AtTable = m.tableRow ? (((m.tableRow.uw | 0) < 4) ? 1 : 0) : null;
    per.preW4AtWin = m.winRow ? (((m.winRow.uw | 0) < 4) ? 1 : 0) : null;
    per.preW4AtEnd = last ? (((last.uw | 0) < 4) ? 1 : 0) : null;
    // Wave-5 blocker on wave-4 seeds (for the wave-5 leg of question a).
    if (m.wave4Day != null) {
      per.blocker5AtEnd = last ? classifyBlocker(last, 5) : 'NO-ROW';
      per.endRow5 = last ? { uw: last.uw, raw: last.raw, capped: last.capped, gated: last.gated, hold: last.hold,
        w4faced: last.w4faced, rd5: last.rd5 } : null;
    }
  }
  // Decomposition completeness (prereg primary metric, per seed).
  const daysOk = rows.length > 0 && rows.every((r, i) => i === 0 || r.day >= rows[i - 1].day);
  per.decompComplete = national ? (daysOk && (j.recorderErrs | 0) === 0 && per.blockerAtNational != null && per.roadStall != null) : null;
  return per;
}

function frac(num, den) { return den > 0 ? { num, den, pct: Math.round(1000 * num / den) / 10 } : { num: 0, den: 0, pct: null }; }

function analyzeBand(files) {
  const seeds = [];
  for (const f of files) {
    try { seeds.push(analyzeSeed(JSON.parse(fs.readFileSync(f, 'utf8')))); } catch (e) { seeds.push({ file: f, error: String(e && e.message) }); }
  }
  seeds.sort((a, b) => (a.seed | 0) - (b.seed | 0));
  const usable = seeds.filter(s => !s.error);
  const nat = usable.filter(s => s.national);
  const withTable = nat.filter(s => s.tableDay != null);
  const withWin = nat.filter(s => s.winDay != null);
  const orderPairs = {};
  const keys = ['nationalDay', 'wave4Day', 'wave5Day', 'tableDay', 'winDay'];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = keys[i], b = keys[j];
    const both = usable.filter(s => s[a] != null && s[b] != null);
    orderPairs[a + '-before-' + b] = both.filter(s => s[a] < s[b]).length;
    orderPairs[b + '-before-' + a] = both.filter(s => s[b] < s[a]).length;
    orderPairs[a + '-same-day-' + b] = both.filter(s => s[a] === s[b]).length;
    orderPairs[a + '-vs-' + b + '-n'] = both.length;
  }
  const band = {
    seeds: seeds.length, usable: usable.length, errors: seeds.filter(s => s.error).length,
    national: nat.length, table: usable.filter(s => s.table).length,
    won: usable.filter(s => s.won).length,
    wave4: usable.filter(s => s.maxWave >= 4).length,
    wave5: usable.filter(s => s.maxWave >= 5).length,
    medianSurvival: median(usable.map(s => s.gameDays | 0)),
    maxSurvival: usable.length ? Math.max.apply(null, usable.map(s => s.gameDays | 0)) : 0,
    road: nat.filter(s => s.roadStall === 'ROAD').length,
    stall: nat.filter(s => s.roadStall && s.roadStall.indexOf('STALL') === 0).length,
    stallWinLesser: nat.filter(s => s.roadStall === 'STALL-WIN-LESSER').length,
    preW4AtNational: frac(nat.filter(s => s.preW4AtNational === 1).length, nat.length),
    preW4AtTable: frac(withTable.filter(s => s.preW4AtTable === 1).length, withTable.length),
    preW4AtWin: frac(withWin.filter(s => s.preW4AtWin === 1).length, withWin.length),
    preW4AtEnd: frac(nat.filter(s => s.preW4AtEnd === 1).length, nat.length),
    blockerAtNationalCounts: countBy(nat.map(s => s.blockerAtNational)),
    blockerAtEndCounts: countBy(nat.map(s => s.blockerAtEnd)),
    blocker5AtEndCounts: countBy(usable.filter(s => s.blocker5AtEnd).map(s => s.blocker5AtEnd)),
    derivedMatchesEngine: usable.filter(s => s.derivedMatchesEngine).length + '/' + usable.length,
    recorderErrsTotal: usable.reduce((a, s) => a + (s.recorderErrs | 0), 0),
    decompComplete: nat.length ? (nat.filter(s => s.decompComplete).length + '/' + nat.length) : 'n/a',
    orderPairs,
    perSeed: seeds,
  };
  return band;
}

function countBy(arr) {
  const c = {};
  for (const v of arr) { if (v == null) continue; c[v] = (c[v] | 0) + 1; }
  return c;
}
function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-wavegate', 'leadfeast');
  const out = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'wavegate-analysis.json');
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort().map(f => path.join(dir, f));
  const band = analyzeBand(files);
  fs.writeFileSync(out, JSON.stringify(band, null, 1) + '\n');
  console.log(JSON.stringify({
    seeds: band.seeds, usable: band.usable, national: band.national, table: band.table,
    won: band.won, wave4: band.wave4, wave5: band.wave5,
    medianSurvival: band.medianSurvival, road: band.road, stall: band.stall,
    preW4AtNational: band.preW4AtNational, preW4AtTable: band.preW4AtTable,
    preW4AtWin: band.preW4AtWin, preW4AtEnd: band.preW4AtEnd,
    blockerAtNationalCounts: band.blockerAtNationalCounts,
    blockerAtEndCounts: band.blockerAtEndCounts,
    blocker5AtEndCounts: band.blocker5AtEndCounts,
    derivedMatchesEngine: band.derivedMatchesEngine, decompComplete: band.decompComplete,
  }, null, 1));
  for (const s of band.perSeed) {
    if (s.error) { console.log(`s${s.seed}: ERROR ${s.error}`); continue; }
    console.log(`s${s.seed}: natDay=${s.nationalDay} w4Day=${s.wave4Day} w5Day=${s.wave5Day} tableDay=${s.tableDay} winDay=${s.winDay} end=${s.endReason} days=${s.gameDays} blockerNat=${s.blockerAtNational} blockerEnd=${s.blockerAtEnd} road=${s.roadStall} match=${s.derivedMatchesEngine}`);
  }
}

module.exports = { firstRow, milestones, classifyBlocker, roadStall, analyzeSeed, analyzeBand, frac };
