// ready5-analyze-20261103.js — analyzer for the readiness-5 release
// re-measurement (arm sim-ready5-a). Pure functions over a per-seed
// JSON (driver output): ready days/runs, peak transitions, release
// classification, standing-shortfall split on blocked days, veteran
// reconciliation, and the DIAG-GO health flags. No game reads.
// Usage: const AN = require('./ready5-analyze-20261103');
//   const s = AN.summarizeSeed(json);
'use strict';

function isReleaseLine(l) {
  return /greenlit the fifth draft|Wave 5 talent has been released|fifth draft.*released/i.test(l.line || '');
}
function isHoldLine(l) {
  return /fifth draft stays in the wings|not bought with bread alone/i.test(l.line || '');
}

function contiguousRuns(days) {
  const runs = [];
  days.forEach(function (d) {
    const last = runs[runs.length - 1];
    if (last && d === last.end + 1) last.end = d;
    else runs.push({ start: d, end: d });
  });
  return runs;
}

function summarizeSeed(j) {
  const daily = j.daily || [];
  const readyDays = daily.filter(function (s) { return s.readiness5 && s.readiness5.ready; }).map(function (s) { return s.day; });
  const readyRuns = contiguousRuns(readyDays);
  // Peak transitions across snapshots (first snapshot's peak is baseline, not a transition).
  const peakTransitions = [];
  for (let i = 1; i < daily.length; i++) {
    if (daily[i].peak != null && daily[i - 1].peak != null && daily[i].peak !== daily[i - 1].peak) {
      peakTransitions.push({ day: daily[i].day, from: daily[i - 1].peak, to: daily[i].peak });
    }
  }
  const firstPeak5 = daily.filter(function (s) { return (s.peak | 0) >= 5; })[0] || null;
  const releaseLines = (j.standingLines || []).filter(isReleaseLine);
  const holdLines = (j.standingLines || []).filter(isHoldLine);
  // Release classification: every peak transition to 5 needs a release
  // line within +-1 day, or an end-call explanation (peak already 5 at
  // first snapshot is baseline, not an event).
  const unclassifiedReleases = [];
  peakTransitions.filter(function (pt) { return pt.to >= 5; }).forEach(function (pt) {
    const near = releaseLines.some(function (l) { return Math.abs(l.day - pt.day) <= 1; });
    if (!near) unclassifiedReleases.push({ day: pt.day, from: pt.from, to: pt.to, reason: 'peak-to-5 without release line within +-1d' });
  });
  (releaseLines || []).forEach(function (l) {
    const nearPeak = firstPeak5 && Math.abs(l.day - firstPeak5.day) <= 1;
    const endCall = (j.endUnlockedWave != null && (j.endUnlockedWave | 0) >= 5 && j.endCallMovedPeak);
    if (!nearPeak && !endCall) unclassifiedReleases.push({ day: l.day, reason: 'release line without peak-5 within +-1d', line: l.line });
  });
  // Blocked-day analysis.
  // (a) Ready days that did NOT release (peak < 5 on that day): the
  // blocker is the standing shortfall if capped < 200, else an
  // engine-check-lag anomaly (conditions met, engine had not yet
  // called the gated total that day — only an anomaly if the seed
  // NEVER releases afterwards despite staying ready + capped).
  const readyNotReleased = daily.filter(function (s) { return s.readiness5 && s.readiness5.ready && ((s.peak | 0) < 5); });
  const readyBlockedStanding = readyNotReleased.filter(function (s) { return (s.capped | 0) < 200; });
  const readyBlockedOther = readyNotReleased.filter(function (s) { return (s.capped | 0) >= 200; });
  // (b) Standing-sufficient days (capped >= 200) that are NOT ready:
  // the blocker is the short bar list.
  const standingOkNotReady = daily.filter(function (s) { return (s.capped | 0) >= 200 && s.readiness5 && !s.readiness5.ready; });
  const shortBarDays = {};
  standingOkNotReady.forEach(function (s) {
    (s.readiness5.short || []).forEach(function (b) { shortBarDays[b] = (shortBarDays[b] || 0) + 1; });
  });
  // (c) Max standing reached, and the shortfall split on the best day.
  let bestSnap = null;
  daily.forEach(function (s) {
    if (s.capped != null && (!bestSnap || (s.capped | 0) > (bestSnap.capped | 0))) bestSnap = s;
  });
  // Veteran reconciliation against the FINAL snapshot's logW4.
  const last = daily[daily.length - 1] || {};
  const logW4 = last.logW4 || [];
  const vetVids = last.veteranVids || [];
  const logBy = {};
  logW4.forEach(function (e) { if (e.by) logBy[e.by] = (logBy[e.by] || 0) + 1; });
  const vetWithoutKill = vetVids.filter(function (v) { return !logBy[v]; });
  const killersNotVeterans = Object.keys(logBy).filter(function (v) { return vetVids.indexOf(v) < 0; });
  const mismatchDays = daily.filter(function (s) { return s.veteranMismatch === true; }).map(function (s) { return s.day; });
  const killEvents = j.killEvents || [];
  const dedupedKillEvents = killEvents.filter(function (e) { return !e.entryAdded; });
  const veteranKillEvents = killEvents.filter(function (e) { return e.entryAdded; });
  const wave5Faced = ((j.endUnlockedWave | 0) >= 5) || daily.some(function (s) { return (s.w5faced | 0) > 0; });
  const doorOpenDay = firstPeak5 ? firstPeak5.day : null;
  return {
    seed: j.seed, days: j.days, endReason: j.endReason, won: !!j.won,
    scaleRank: j.scaleRank, maxWave: j.maxWave, endUnlockedWave: j.endUnlockedWave,
    endCallMovedPeak: !!j.endCallMovedPeak, peakEnd: (last.peak != null ? last.peak : null),
    readyDayCount: readyDays.length, readyDays: readyDays, readyRuns: readyRuns,
    ready4DayCount: daily.filter(function (s) { return s.readiness4 && s.readiness4.ready; }).length,
    peakTransitions: peakTransitions, doorOpenDay: doorOpenDay,
    releaseLines: releaseLines, holdLineCount: holdLines.length,
    unclassifiedReleases: unclassifiedReleases,
    readyNotReleasedDays: readyNotReleased.length,
    readyBlockedStandingDays: readyBlockedStanding.length,
    readyBlockedOtherDays: readyBlockedOther.length,
    standingOkNotReadyDays: standingOkNotReady.length, shortBarDays: shortBarDays,
    bestCapped: bestSnap ? (bestSnap.capped | 0) : null, bestRaw: bestSnap ? ((bestSnap.standing && bestSnap.standing.total) | 0) : null,
    bestDay: bestSnap ? bestSnap.day : null,
    bestSplit: bestSnap && bestSnap.standing ? { war: bestSnap.standing.war, diplomacy: bestSnap.standing.diplomacy, plenty: bestSnap.standing.plenty } : null,
    bestReady: bestSnap ? !!(bestSnap.readiness5 && bestSnap.readiness5.ready) : null,
    bestShort: bestSnap && bestSnap.readiness5 ? (bestSnap.readiness5.short || []) : null,
    endStanding: last.standing || null, endCapped: (last.capped != null ? last.capped : null),
    endBars: last.readiness5 || null, endVeterans: last.veteranVids || [],
    vetWithoutKill: vetWithoutKill, killersNotVeterans: killersNotVeterans,
    mismatchDays: mismatchDays, logW4Count: logW4.length,
    killEventCount: killEvents.length, veteranKillEventCount: veteranKillEvents.length,
    dedupedKillEventCount: dedupedKillEvents.length,
    wave5Faced: wave5Faced, w4facedMax: daily.reduce(function (m, s) { return Math.max(m, (s.w4faced | 0) || 0); }, 0),
    instrumentErrors: j.instrumentErrors || [],
  };
}

function summarizePanel(seeds) {
  const sums = seeds.map(summarizeSeed);
  const total = function (f) { return sums.reduce(function (a, s) { return a + (f(s) || 0); }, 0); };
  return {
    seeds: sums,
    totals: {
      villages: sums.length, won: total(function (s) { return s.won ? 1 : 0; }),
      readyDayTotal: total(function (s) { return s.readyDayCount; }),
      seedsWithReadyDays: sums.filter(function (s) { return s.readyDayCount > 0; }).length,
      doorOpens: sums.filter(function (s) { return s.doorOpenDay != null; }).length,
      wave5Faced: sums.filter(function (s) { return s.wave5Faced; }).length,
      unclassifiedReleases: total(function (s) { return s.unclassifiedReleases.length; }),
      instrumentErrors: total(function (s) { return s.instrumentErrors.length; }),
      mismatchDays: total(function (s) { return s.mismatchDays.length; }),
      vetWithoutKill: total(function (s) { return s.vetWithoutKill.length; }),
    },
  };
}

module.exports = { summarizeSeed: summarizeSeed, summarizePanel: summarizePanel, isReleaseLine: isReleaseLine, isHoldLine: isHoldLine, contiguousRuns: contiguousRuns };
