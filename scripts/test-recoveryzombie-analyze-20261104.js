// test-recoveryzombie-analyze-20261104.js — zombie-clearing analyzer
// (arm sim-recovery-zombie-b). Reuses the polityfrag analyzer's
// analyzeSeed and adds: clear events (a Haven-primary link going
// active -> non-active with trust 0 at break), re-proposals and
// re-links after a clear, diplomacy recovery after a clear, and
// the prereg GO judge against the CITED polityfrag baseline
// (evidence/2026-11-04/sim-polityfrag-b.md — values below, not
// re-derived). Pure functions over per-seed JSONs: no Game.
// Usage: const AN = require('./test-recoveryzombie-analyze-20261104');
'use strict';
const PF = require('./test-polityfrag-analyze-20261104');

// Cited polityfrag baseline (sim-polityfrag-b.md per-seed table).
// trajectory: polityfrag's class; days: polityfrag run days;
// band: survival class per the prereg (early <100d, mid 100-200d).
const BASELINE = {
  99401: { trajectory: 'never', days: 98, band: 'early', neverReason: 'polity-shape' },
  99402: { trajectory: 'collapses', days: 143, band: 'mid' },
  99403: { trajectory: 'collapses', days: 118, band: 'mid' },
  99404: { trajectory: 'never', days: 76, band: 'early', neverReason: 'never-3-seasoned' },
  99409: { trajectory: 'holds-to-death', days: 111, band: 'mid' },
  99410: { trajectory: 'holds-to-death', days: 107, band: 'mid' },
  99411: { trajectory: 'collapses', days: 146, band: 'mid' },
  99412: { trajectory: 'never', days: 64, band: 'early', neverReason: 'died-before-seasoning' },
};
const BAND_ORDER = { early: 0, mid: 1, late: 2, survived: 3 };
function survivalBand(out) {
  if (!out.villageLost) return 'survived';
  if (out.days < 100) return 'early';
  if (out.days <= 200) return 'mid';
  return 'late';
}

function detailMap(snap) {
  const m = {};
  if (snap && snap.linkFunnel && Array.isArray(snap.linkFunnel.detail)) {
    for (const d of snap.linkFunnel.detail) { if (d && d.id != null) m[String(d.id)] = d; }
  }
  return m;
}

// Clear events: a Haven-primary link (primary === 'haven', not a
// peer a/b link) whose status flips active -> non-active while its
// last active trust was 0. Other breaks (trust > 0 at break, e.g.
// a succession snap) are reported separately, never counted as
// clears.
function clearEvents(out) {
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const clears = [], otherBreaks = [];
  const prev = {}; // id -> last active detail
  for (const snap of daily) {
    const m = detailMap(snap);
    for (const id of Object.keys(m)) {
      const d = m[id];
      const isHavenPrimary = d.primary === 'haven' && d.subordinate && d.subordinate !== 'haven';
      if (!isHavenPrimary) continue;
      if (d.status === 'active') { prev[id] = d; continue; }
      if (prev[id]) {
        const rec = { day: snap.day, linkId: id, village: d.subordinate,
          trustAtBreak: prev[id].trust, status: d.status };
        if ((prev[id].trust || 0) <= 0) clears.push(rec);
        else otherBreaks.push(rec);
        prev[id] = null;
      }
    }
  }
  return { clears: clears, otherBreaks: otherBreaks };
}

function analyzeSeed(out) {
  const base = PF.analyzeSeed(out);
  const ce = clearEvents(out);
  const firstClear = ce.clears.length ? ce.clears[0] : null;
  const reproposalsAfterClear = firstClear
    ? (out.proposalEvents || []).filter(function (e) { return e.day > firstClear.day; })
      .map(function (e) { return { day: e.day, fn: e.fn, target: e.target }; })
    : [];
  const relinksAfterClear = firstClear
    ? (out.linkFormedEvents || []).filter(function (f) { return f.day > firstClear.day; })
      .map(function (f) { return { day: f.day, link: f.link }; })
    : [];
  const recoveriesAfterClear = firstClear
    ? (base.recoveries || []).filter(function (r) { return r.day > firstClear.day; })
    : [];
  const band = survivalBand(out);
  const bl = BASELINE[out.seed] || null;
  const regressed = !!(bl && BAND_ORDER[band] < BAND_ORDER[bl.band]);
  const baselineCollapsed = !!(bl && bl.trajectory === 'collapses');
  return Object.assign({}, base, {
    clears: ce.clears, otherBreaks: ce.otherBreaks, firstClear: firstClear,
    reproposalsAfterClear: reproposalsAfterClear,
    relinksAfterClear: relinksAfterClear,
    recoveriesAfterClear: recoveriesAfterClear,
    band: band, baselineBand: bl ? bl.band : null,
    baselineTrajectory: bl ? bl.trajectory : null,
    survivalRegressed: regressed,
    clearOnCollapsedSeed: baselineCollapsed && ce.clears.length > 0,
    goLeg1: baselineCollapsed && ce.clears.length > 0 &&
      reproposalsAfterClear.length > 0 && relinksAfterClear.length > 0,
    goLeg2: recoveriesAfterClear.length > 0,
  });
}

// GO iff: (1) at least 1 seed has clear + re-proposal + re-link on
// a baseline-collapsed seed; AND (2) diplomacy recovers > 0 after a
// clear on at least 1 seed; AND (3) at most 1 seed regresses a
// survival class vs baseline. Otherwise NO-GO. INSUFFICIENT-DATA
// only if > 2 seeds carry instrument errors.
function judgeGo(summaries) {
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  const leg1 = summaries.filter(function (s) { return s.goLeg1; });
  const leg2 = summaries.filter(function (s) { return s.goLeg2; });
  const regressions = summaries.filter(function (s) { return s.survivalRegressed; });
  const verdict = bad > 2 ? 'INSUFFICIENT-DATA'
    : (leg1.length >= 1 && leg2.length >= 1 && regressions.length <= 1 ? 'GO' : 'NO-GO');
  return { leg1Seeds: leg1.map(function (s) { return s.seed; }),
    leg2Seeds: leg2.map(function (s) { return s.seed; }),
    regressionSeeds: regressions.map(function (s) { return s.seed; }),
    badSeeds: bad, verdict: verdict };
}

module.exports = { analyzeSeed: analyzeSeed, judgeGo: judgeGo,
  clearEvents: clearEvents, survivalBand: survivalBand, BASELINE: BASELINE };
