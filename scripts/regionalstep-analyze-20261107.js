// regionalstep-analyze-20261107.js — the regional-gate analyzer (arm
// sim-regionalstep-b). Reads the per-seed corpus
// (evidence/2026-11-07/perseed-regionalstep-b/) and classifies every
// no-regional day by the first failing link in the regional chain (same
// classifyGate rule as the instrument — required, not copied). Prints a
// JSON summary to stdout and writes it to
// /tmp/regionalstep-analysis.json (working copy; the evidence file is the
// record). Usage:
//   node scripts/regionalstep-analyze-20261107.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyGate } = require(path.join(__dirname, 'regionalstep-instrument-20261107'));
// sim-sitmetric-b: the row's finalSeat is the ALIGNED seat (taken, not
// priced) — see scripts/lib/seat-taken.js. A priced-but-untaken seat
// (seed 53004: "lesser", taken 0) reads 'none' here.
const { alignedSeat } = require(path.join(__dirname, 'lib', 'seat-taken'));

const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'perseed-regionalstep-b');
const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
const seeds = {};
const wall = { national: 0, table: 0, wins: 0, wave4unlock: 0, wave5unlock: 0, wave5faced: 0, survivals: [] };

// Run-length encode a gate sequence for readability: [{gate, from, to, n}].
function rle(seq) {
  const out = [];
  seq.forEach(function (d) {
    const last = out[out.length - 1];
    if (last && last.gate === d.gate) { last.to = d.day; last.n += 1; }
    else out.push({ gate: d.gate, from: d.day, to: d.day, n: 1 });
  });
  return out;
}

files.forEach(function (f) {
  const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const daily = o.daily || [];
  const noRegRows = daily.filter(function (d) { return (d.scale || 'village') === 'village' && !d.networkLive; });
  const gateTally = {};
  const gateMissing = {};
  noRegRows.forEach(function (d) {
    const c = classifyGate(d);
    gateTally[c.gate] = (gateTally[c.gate] | 0) + 1;
    (c.missing || []).forEach(function (m) { gateMissing[m] = (gateMissing[m] | 0) + 1; });
  });
  // Timelines: first day each chain link was ever reached.
  const tl = { known: null, courtshipReady: null, attempt: null, counter: null, link: null, accord: null, regional: null };
  daily.forEach(function (d) {
    if (tl.known == null && ((d.knownCount | 0)) > 0) tl.known = d.day;
    if (tl.courtshipReady == null && d.bestDet != null && (d.bestDet + 10) >= 35) tl.courtshipReady = d.day;
    if (tl.attempt == null && (((d.proposeCalls | 0)) > 0 || ((d.acceptLinkRaiseCalls | 0)) > 0)) tl.attempt = d.day;
    if (tl.counter == null && ((d.proposeCounter | 0)) > 0) tl.counter = d.day;
    if (tl.link == null && ((d.activeLinks | 0)) > 0) tl.link = d.day;
    if (tl.accord == null && (d.firstAccordDay != null)) tl.accord = d.firstAccordDay;
    if (tl.regional == null && d.networkLive) tl.regional = d.day;
  });
  // Best courtship reached (max bestDet over the run) + on which village/day.
  let bestCourt = null;
  daily.forEach(function (d) {
    if (d.bestDet != null && (bestCourt == null || d.bestDet > bestCourt.det)) {
      bestCourt = { det: d.bestDet, offer: d.bestOffer, village: d.bestVillageId, day: d.day };
    }
  });
  // Raise window: raises staged vs answered in time (from raise history + talk calls).
  const lastRow = daily[daily.length - 1] || {};
  const raisesStaged = (lastRow.raiseHistory || []).length;
  const raisesByOutcome = {};
  (lastRow.raiseHistory || []).forEach(function (r) { raisesByOutcome[r.outcome || '?'] = (raisesByOutcome[r.outcome || '?'] | 0) + 1; });
  const s = {
    seed: o.seed, days: o.days, endReason: o.endReason, won: !!o.won,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    standingBreakdown: lastRow.standingBreakdown || null,
    scaleRank: o.scaleRank, finalSeat: alignedSeat(o),
    noRegionalDays: noRegRows.length,
    regionalDays: daily.length - noRegRows.length,
    gateTally: gateTally, gateMissing: gateMissing,
    gateSeqRle: rle(noRegRows.map(function (d) { return { day: d.day, gate: classifyGate(d).gate }; })),
    timelines: tl, bestCourtship: bestCourt,
    proposeCalls: lastRow.proposeCalls | 0, proposeFormed: lastRow.proposeFormed | 0,
    proposeCounter: lastRow.proposeCounter | 0,
    answerCounterCalls: lastRow.answerCounterCalls | 0, answerAccordCalls: lastRow.answerAccordCalls | 0,
    acceptLinkRaiseCalls: lastRow.acceptLinkRaiseCalls | 0, declineLinkRaiseCalls: lastRow.declineLinkRaiseCalls | 0,
    proposeCovenantCalls: lastRow.proposeCovenantCalls | 0, proposeTradeCalls: lastRow.proposeTradeCalls | 0,
    raidCalls: lastRow.raidCalls | 0,
    activeLinks: lastRow.activeLinks | 0, everLinks: lastRow.everLinks | 0,
    firstLinkDay: o.firstLinkDay, firstAccordDay: o.firstAccordDay,
    raisesStaged: raisesStaged, raisesByOutcome: raisesByOutcome,
    raiseEligibleMax: daily.reduce(function (m, d) { return Math.max(m, (d.raiseEligible | 0)); }, 0),
    talkCalls: (o.talkCalls || []).length,
    knownMax: daily.reduce(function (m, d) { return Math.max(m, (d.knownCount | 0)); }, 0),
    diploLines: (o.diploLines || []).length,
    pairDays: daily.filter(function (d) { return d.pairDay; }).length,
    w4kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
    w5kills: (o.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 5); }).length,
    readiness5readyDays: daily.filter(function (d) { return d.readiness5 && d.readiness5.ready; }).length,
    errors: (o.instrumentErrors || []).length,
  };
  seeds[o.seed] = s;
  if (o.scaleRank === 'national' || o.scaleRank === 'global') wall.national++;
  if (o.won) wall.wins++;
  if (s.finalSeat && s.finalSeat !== 'none') wall.table++;
  if ((o.unlockedWave | 0) >= 4) wall.wave4unlock++;
  if ((o.unlockedWave | 0) >= 5) wall.wave5unlock++;
  if ((o.maxWave | 0) >= 5) wall.wave5faced++;
  wall.survivals.push(o.days);
});

wall.survivals.sort(function (a, b) { return a - b; });
const mid = wall.survivals.length ? (wall.survivals.length % 2 === 1
  ? wall.survivals[Math.floor(wall.survivals.length / 2)]
  : (wall.survivals[wall.survivals.length / 2 - 1] + wall.survivals[wall.survivals.length / 2]) / 2) : null;
const focus = seeds[53006] || null;
const contrast = seeds[53007] || null;
let primary = null;
if (focus && focus.noRegionalDays > 0) {
  const top = Object.keys(focus.gateTally).sort(function (a, b) { return focus.gateTally[b] - focus.gateTally[a]; });
  const topGate = top[0];
  const topShare = focus.gateTally[topGate] / focus.noRegionalDays;
  // Ordered adjacent pair: the top two gates in chain order.
  const chainOrder = ['no-known-village', 'known-no-courtship', 'courtship-no-attempt', 'counter-unanswered', 'attempted-no-link', 'link-broken', 'link-young', 'seasoned-no-dawn'];
  const topTwo = top.slice(0, 2).sort(function (a, b) { return chainOrder.indexOf(a) - chainOrder.indexOf(b); });
  const pairShare = topTwo.reduce(function (acc, g) { return acc + (focus.gateTally[g] || 0); }, 0) / focus.noRegionalDays;
  primary = {
    seed: 53006, noRegionalDays: focus.noRegionalDays, topGate: topGate,
    topGateDays: focus.gateTally[topGate],
    topGateShare: +topShare.toFixed(3),
    topPair: topTwo, topPairShare: +pairShare.toFixed(3),
    diagGo: topShare >= 0.8 || pairShare >= 0.8,
    tally: focus.gateTally,
  };
}
const out = { corpusDir: dir, seeds: seeds, wall: wall, medianSurvival: mid, primary: primary,
  contrast53007: contrast ? { noRegionalDays: contrast.noRegionalDays, tally: contrast.gateTally, missing: contrast.gateMissing, timelines: contrast.timelines, bestCourtship: contrast.bestCourtship } : null };
fs.writeFileSync('/tmp/regionalstep-analysis.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
