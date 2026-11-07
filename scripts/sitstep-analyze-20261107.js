// sitstep-analyze-20261107.js — the sit-step analyzer (arm sim-sitstep-b).
// Reads the per-seed corpus (evidence/2026-11-07/perseed-sitstep-b/) and
// classifies every pair day by the first failing link in the sit chain
// (same classifyGate rule as the instrument — required, not copied).
// Prints a JSON summary to stdout and writes it to
// /tmp/sitstep-analysis.json (working copy; the evidence file is the
// record). Usage:
//   node scripts/sitstep-analyze-20261107.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyGate } = require(path.join(__dirname, 'sitstep-instrument-20261107'));

const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-sitstep-b');
const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
const seeds = {};
const wall = { national: 0, table: 0, wins: 0, wave4unlock: 0, wave5unlock: 0, wave5faced: 0, survivals: [] };

files.forEach(function (f) {
  const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const daily = o.daily || [];
  const pairRows = daily.filter(function (d) { return d.pairDay; });
  const gateTally = {};
  const gateMissing = {};
  pairRows.forEach(function (d) {
    const c = classifyGate(d);
    gateTally[c.gate] = (gateTally[c.gate] | 0) + 1;
    (c.missing || []).forEach(function (m) { gateMissing[m] = (gateMissing[m] | 0) + 1; });
  });
  // First day each missing bar flipped (on pair days, for the focus seed).
  const firstSeatDay = {};
  daily.forEach(function (d) {
    if (d.seat && d.seat !== 'none' && firstSeatDay.seat == null) firstSeatDay.seat = d.day;
    if (d.preview && firstSeatDay.preview == null) firstSeatDay.preview = d.day;
    if (d.preview && d.preview.ready && firstSeatDay.ready == null) firstSeatDay.ready = d.day;
    if (d.tableAnnounced && firstSeatDay.announced == null) firstSeatDay.announced = d.day;
    if (d.tableWaiting && firstSeatDay.waiting == null) firstSeatDay.waiting = d.day;
    if (d.arc >= 4 && firstSeatDay.arc4 == null) firstSeatDay.arc4 = d.day;
  });
  // Per-day gate sequence on pair days (compact: day:gate).
  const pairGateSeq = pairRows.map(function (d) { return d.day + ':' + (classifyGate(d).gate); });
  const s = {
    seed: o.seed, days: o.days, endReason: o.endReason, won: !!o.won,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, finalSeat: o.finalSeat ? o.finalSeat.seat : null,
    finalFullShortfall: o.finalFullShortfall ? o.finalFullShortfall.missing : null,
    pairDays: pairRows.length,
    firstPairDay: pairRows.length ? pairRows[0].day : null,
    lastPairDay: pairRows.length ? pairRows[pairRows.length - 1].day : null,
    pairGateTally: gateTally, pairGateMissing: gateMissing,
    pairGateSeq: pairGateSeq,
    firstSeatDay: firstSeatDay,
    previewReadyDays: daily.filter(function (d) { return d.preview && d.preview.ready; }).length,
    previewSeenDays: daily.filter(function (d) { return !!d.preview; }).length,
    sitAttempts: (o.sitAttempts || []).length,
    tableChoicesSurfacedDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
    tableLines: (o.tableLines || []).length,
    w4kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
    w5kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 5); }).length,
    readiness5readyDays: daily.filter(function (d) { return d.readiness5 && d.readiness5.ready; }).length,
    endLivingVeterans: daily.length ? (daily[daily.length - 1].livingVeterans || 0) : 0,
    errors: (o.instrumentErrors || []).length,
  };
  seeds[o.seed] = s;
  if (o.scaleRank === 'national' || o.scaleRank === 'global') wall.national++;
  if (o.won) wall.wins++;
  if (o.finalSeat && o.finalSeat.seat !== 'none') wall.table++;
  if ((o.unlockedWave | 0) >= 4) wall.wave4unlock++;
  if ((o.unlockedWave | 0) >= 5) wall.wave5unlock++;
  if ((o.maxWave | 0) >= 5) wall.wave5faced++;
  wall.survivals.push(o.days);
});

wall.survivals.sort(function (a, b) { return a - b; });
const mid = wall.survivals.length ? wall.survivals[Math.floor(wall.survivals.length / 2)] : null;
const focus = seeds[53006] || null;
const contrast = seeds[53007] || null;
let primary = null;
if (focus && focus.pairDays > 0) {
  const top = Object.keys(focus.pairGateTally).sort(function (a, b) { return focus.pairGateTally[b] - focus.pairGateTally[a]; });
  const topGate = top[0];
  primary = {
    seed: 53006, pairDays: focus.pairDays, topGate: topGate,
    topGateDays: focus.pairGateTally[topGate],
    topGateShare: +(focus.pairGateTally[topGate] / focus.pairDays).toFixed(3),
    diagGo: (focus.pairGateTally[topGate] / focus.pairDays) >= 0.8,
    tally: focus.pairGateTally,
  };
}
const out = { corpusDir: dir, seeds: seeds, wall: wall, medianSurvival: mid, primary: primary,
  contrast53007: contrast ? { pairDays: contrast.pairDays, tally: contrast.pairGateTally, missing: contrast.pairGateMissing, firstSeatDay: contrast.firstSeatDay } : null };
fs.writeFileSync('/tmp/sitstep-analysis.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
