// sitstep2-analyze-20261107.js — the sit-step-2 analyzer (arm
// sim-sitstep2-b). Reads the per-seed corpus
// (evidence/2026-11-07/perseed-sitstep2-b/) and classifies every seat
// day by the FIRST failing link in the sit chain (extended rule below
// — splits sitstep's 'no-preview' into the day-90 floor vs a missing
// Arc IV wait, and splits the ready-day outcome by whether the sit
// verb was ever called). Names the per-seed first-blocking mechanism
// (first in TIME order over the seat window, plus the dominant gate
// over the post-floor seat window) and judges the frozen prereg bar.
// Prints a JSON summary to stdout and writes it to
// /tmp/sitstep2-analysis.json (working copy; the evidence file is the
// record). Usage:
//   node scripts/sitstep2-analyze-20261107.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyGate } = require(path.join(__dirname, 'sitstep-instrument-20261107'));
// sim-sitmetric-b: the row's finalSeat is the ALIGNED seat (taken, not
// priced) — see scripts/lib/seat-taken.js. A priced-but-untaken seat
// (seed 53004: "lesser", taken 0) reads 'none' here.
const { alignedSeat } = require(path.join(__dirname, 'lib', 'seat-taken'));

// classifySeatDay(row, callsToday): first failing link in the sit
// chain, extended past sitstep's classifyGate. Gates:
//   'sat' | 'no-seat' | 'floor-day90' | 'no-preview-waiting' |
//   'no-preview-unknown' | 'entry-blocked' | 'offer-not-taken' |
//   'sit-refused' | 'sit-called'.
// callsToday: sit-verb calls recorded on this row's day
// ({call, ok, msg}).
function classifySeatDay(row, callsToday) {
  row = row || {};
  callsToday = callsToday || [];
  if (row.tableDone) return { gate: 'sat', missing: [] };
  if (!row.seat || row.seat === 'none') {
    const c = classifyGate(row);
    return { gate: 'no-seat', missing: c.missing || [] };
  }
  if (!row.preview) {
    if (!row.winDayFloorOk) return { gate: 'floor-day90', missing: ['day ' + (row.day | 0) + ' < 90 (win-day floor; table not announced, no preview)'] };
    if (!row.tableWaiting) return { gate: 'no-preview-waiting', missing: ['tableWaiting false (Arc IV never fired)'] };
    return { gate: 'no-preview-unknown', missing: ['preview null for unknown reason'] };
  }
  if (!row.preview.ready) return { gate: 'entry-blocked', missing: [String(row.preview.why || 'unknown block')] };
  if (callsToday.length) {
    const ok = callsToday.some(function (c) { return c.ok; });
    if (ok) return { gate: 'sit-called', missing: ['sit verb called ok; tableDone still false'] };
    return { gate: 'sit-refused', missing: callsToday.map(function (c) { return c.call + ': ' + (c.msg || 'no msg'); }) };
  }
  return { gate: 'offer-not-taken', missing: ['preview ready; policy never called tableTakeSeat/tableOfferSeatTaker'] };
}

function modeGate(tally) {
  let best = null, bestN = -1;
  Object.keys(tally).forEach(function (g) { if (tally[g] > bestN) { bestN = tally[g]; best = g; } });
  return best;
}

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort(function (a, b) { return a - b; });
  return s.length % 2 === 1 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

if (require.main === module) {
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-sitstep2-b');
const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
const seeds = {};
const wall = { national: 0, table: 0, wins: 0, wave4unlock: 0, wave5unlock: 0, wave5faced: 0, regional: 0, lesserSeats: 0, survivals: [], errors: 0 };

files.forEach(function (f) {
  const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const daily = o.daily || [];
  // Sit-verb calls by day (prefer the msg wrap; fall back to the
  // instrument wrap — same calls, no msg).
  const callsByDay = {};
  (o.sitVerbMsgs || []).forEach(function (c) {
    if (c == null || c.day == null) return;
    (callsByDay[c.day] = callsByDay[c.day] || []).push({ call: c.call, ok: !!c.ok, msg: c.msg || null });
  });
  if (!(o.sitVerbMsgs || []).length) {
    (o.sitAttempts || []).forEach(function (c) {
      if (c == null || c.day == null) return;
      (callsByDay[c.day] = callsByDay[c.day] || []).push({ call: c.call, ok: !!c.ok, msg: null });
    });
  }
  const seatRows = daily.filter(function (d) { return d.seat && d.seat !== 'none'; });
  const gateTally = {};
  const gateMissing = {};
  const seatGateSeq = [];
  seatRows.forEach(function (d) {
    const c = classifySeatDay(d, callsByDay[d.day] || []);
    gateTally[c.gate] = (gateTally[c.gate] | 0) + 1;
    (c.missing || []).forEach(function (m) { gateMissing[m] = (gateMissing[m] | 0) + 1; });
    seatGateSeq.push(d.day + ':' + c.gate);
  });
  const postFloorRows = seatRows.filter(function (d) { return (d.day | 0) >= 90; });
  const postFloorTally = {};
  postFloorRows.forEach(function (d) {
    const c = classifySeatDay(d, callsByDay[d.day] || []);
    postFloorTally[c.gate] = (postFloorTally[c.gate] | 0) + 1;
  });
  const readyRows = daily.filter(function (d) { return d.preview && d.preview.ready; });
  const readyAtHaven = readyRows.filter(function (d) { return d.scholarAtHaven === true; }).length;
  const readyAlive = readyRows.filter(function (d) { return d.scholarAlive === true; }).length;
  const whyTally = {};
  daily.forEach(function (d) {
    if (d.preview && !d.preview.ready) {
      const w = String(d.preview.why || 'unknown block');
      whyTally[w] = (whyTally[w] | 0) + 1;
    }
  });
  // Dip-while-announced days: seat none after the table was announced
  // (the sticky-offer hold path — the "offer expired" hypothesis
  // checked as dips, since the code has no expiry mechanism).
  const dipDays = daily.filter(function (d) { return (!d.seat || d.seat === 'none') && d.tableAnnounced; }).length;
  const announcedDays = daily.filter(function (d) { return d.tableAnnounced; }).length;
  // First-blocking mechanism: first in TIME order over the seat window,
  // plus the dominant gate over the post-floor seat window.
  let firstBlocking = null;
  if (seatRows.length) {
    const first = classifySeatDay(seatRows[0], callsByDay[seatRows[0].day] || []);
    const dom = modeGate(postFloorTally);
    firstBlocking = {
      firstSeatDay: seatRows[0].day,
      firstSeatGate: first.gate,
      firstSeatMissing: first.missing,
      postFloorDominantGate: dom,
      postFloorDominantDays: dom ? postFloorTally[dom] : 0,
      postFloorSeatDays: postFloorRows.length,
    };
  }
  // No-seat missing bars (live detail on the last row + final detail).
  let noSeatMissing = null;
  if (!seatRows.length) {
    const last = daily[daily.length - 1] || {};
    const c = classifyGate(last);
    noSeatMissing = c.missing || [];
  }
  const firsts = {};
  daily.forEach(function (d) {
    if (d.seat && d.seat !== 'none' && firsts.seat == null) firsts.seat = d.day;
    if (d.preview && firsts.preview == null) firsts.preview = d.day;
    if (d.preview && d.preview.ready && firsts.ready == null) firsts.ready = d.day;
    if (d.tableAnnounced && firsts.announced == null) firsts.announced = d.day;
    if (d.tableWaiting && firsts.waiting == null) firsts.waiting = d.day;
  });
  const s = {
    seed: o.seed, days: o.days, endReason: o.endReason, won: !!o.won,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, finalSeat: alignedSeat(o),
    finalFullShortfall: o.finalFullShortfall ? o.finalFullShortfall.missing : null,
    seatDays: seatRows.length,
    firstSeatDay: seatRows.length ? seatRows[0].day : null,
    lastSeatDay: seatRows.length ? seatRows[seatRows.length - 1].day : null,
    seatType: seatRows.length ? seatRows[0].seat : null,
    seatGateTally: gateTally, seatGateMissing: gateMissing,
    seatGateSeq: seatGateSeq,
    firstBlocking: firstBlocking,
    postFloorTally: postFloorTally,
    previewReadyDays: readyRows.length,
    previewSeenDays: daily.filter(function (d) { return !!d.preview; }).length,
    readyScholarAtHaven: readyAtHaven + '/' + readyRows.length,
    readyScholarAlive: readyAlive + '/' + readyRows.length,
    entryWhyTally: whyTally,
    dipWhileAnnouncedDays: dipDays, announcedDays: announcedDays,
    sitAttempts: (o.sitAttempts || []).length,
    sitVerbMsgs: (o.sitVerbMsgs || []).slice(),
    tableChoicesSurfacedDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
    tableDoneDays: daily.filter(function (d) { return d.tableDone; }).length,
    tableLines: (o.tableLines || []).length,
    w4kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
    w5kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 5); }).length,
    noSeatMissing: noSeatMissing,
    firsts: firsts,
    linksEver: (o.linkdriveStats && o.linkdriveStats.linksFormed != null) ? o.linkdriveStats.linksFormed : null,
    errors: (o.instrumentErrors || []).length,
    instrumentErrors: o.instrumentErrors || [],
  };
  seeds[o.seed] = s;
  if (o.scaleRank === 'regional' || o.scaleRank === 'national' || o.scaleRank === 'global') wall.regional++;
  if (o.scaleRank === 'national' || o.scaleRank === 'global') wall.national++;
  if (o.won) wall.wins++;
  if (s.finalSeat && s.finalSeat !== 'none') { wall.table++; if (s.finalSeat === 'lesser') wall.lesserSeats++; }
  if ((o.unlockedWave | 0) >= 4) wall.wave4unlock++;
  if ((o.unlockedWave | 0) >= 5) wall.wave5unlock++;
  if ((o.maxWave | 0) >= 5) wall.wave5faced++;
  wall.survivals.push(o.days);
  wall.errors += (o.instrumentErrors || []).length;
});

const median = medianOf(wall.survivals);
const seatEarningSeeds = Object.keys(seeds).filter(function (k) { return seeds[k].seatDays > 0; }).map(Number).sort(function (a, b) { return a - b; });
const namedAll = seatEarningSeeds.every(function (k) { return !!seeds[k].firstBlocking; });
const guardRegional = wall.regional === 8;
const guardSeats = wall.lesserSeats >= 3;
const guardMedian = median != null && median >= 108.5 && median <= 148.5;
const diagGo = namedAll && seatEarningSeeds.length >= 3 && guardRegional && guardSeats && guardMedian && wall.errors === 0;
const out = {
  corpusDir: dir, seeds: seeds, wall: wall, medianSurvival: median,
  seatEarningSeeds: seatEarningSeeds,
  verdict: {
    primaryNamedAll: namedAll, seatsEarned: seatEarningSeeds.length, seatsEarnedAtLeast3: seatEarningSeeds.length >= 3,
    guardRegional8of8: guardRegional, guardSeatsAtLeast3: guardSeats, guardMedian108to148: guardMedian,
    instrumentErrors: wall.errors, diagGo: diagGo,
    linkdriveBaseline: { regional: '8/8', lesserSeats: '4/8', medianSurvival: 128.5 },
  },
};
fs.writeFileSync('/tmp/sitstep2-analysis.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
}

module.exports = { classifySeatDay: classifySeatDay, medianOf: medianOf };
