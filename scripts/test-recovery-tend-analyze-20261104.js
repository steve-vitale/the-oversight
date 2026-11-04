// test-recovery-tend-analyze-20261104.js — tend-through wrapper over the
// polityfrag analyzer (arm sim-recovery-tend-b). The polityfrag analyzer
// is REUSED verbatim (not modified); this file only adds the tend-through
// reporting fields the prereg requires: post-drop days lived, tend counts
// (incl. tends attempted while pantry <= 20,000 kcal — proof the lever
// fired), survival bands vs the cited polityfrag baseline, and the
// prereg GO judge. Pure functions over per-seed JSONs: no Game, no
// harness. When run directly, it reads
// evidence/2026-11-04/perseed-recovery-tend-b/ and prints one JSON line
// per seed plus the GO verdict.
// Usage: node scripts/test-recovery-tend-analyze-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const AN = require(path.join(__dirname, 'test-polityfrag-analyze-20261104'));

// Cited baseline, evidence/2026-11-04/sim-polityfrag-b.md (NOT re-derived).
const BASELINE = {
  99401: { days: 98, band: 'D', trajectory: 'never', firstDiplo: null, diploDays: 0, holdShare: null, drops: 0, recov: 0, scaleRank: 'regional', maxWave: 4, w5faced: false, readyDays: 0 },
  99402: { days: 143, band: 'C', trajectory: 'collapses', firstDiplo: 60, diploDays: 29, holdShare: 0.345, drops: 1, recov: 0, scaleRank: 'regional', maxWave: 5, w5faced: true, readyDays: 27 },
  99403: { days: 118, band: 'C', trajectory: 'collapses', firstDiplo: 57, diploDays: 60, holdShare: 0.968, drops: 1, recov: 0, scaleRank: 'regional', maxWave: 4, w5faced: false, readyDays: 0 },
  99404: { days: 76, band: 'D', trajectory: 'never', firstDiplo: null, diploDays: 0, holdShare: null, drops: 0, recov: 0, scaleRank: 'regional', maxWave: 4, w5faced: false, readyDays: 0 },
  99409: { days: 111, band: 'C', trajectory: 'holds-to-death', firstDiplo: 57, diploDays: 56, holdShare: 1.000, drops: 0, recov: 0, scaleRank: 'global', maxWave: 4, w5faced: false, readyDays: 0 },
  99410: { days: 107, band: 'C', trajectory: 'holds-to-death', firstDiplo: 57, diploDays: 51, holdShare: 1.000, drops: 0, recov: 0, scaleRank: 'global', maxWave: 4, w5faced: false, readyDays: 0 },
  99411: { days: 146, band: 'C', trajectory: 'collapses', firstDiplo: 58, diploDays: 78, holdShare: 0.867, drops: 1, recov: 0, scaleRank: 'regional', maxWave: 4, w5faced: false, readyDays: 0 },
  99412: { days: 64, band: 'D', trajectory: 'never', firstDiplo: null, diploDays: 0, holdShare: null, drops: 0, recov: 0, scaleRank: 'village', maxWave: 4, w5faced: false, readyDays: 0 },
};
const COLLAPSED = [99402, 99403, 99411];
const BAND_ORDER = { D: 0, C: 1, B: 2, A: 3 };

function bandFor(days, endReason) {
  if (endReason === 'horizon' || days >= 300) return 'A';
  if (days >= 150) return 'B';
  if (days >= 100) return 'C';
  return 'D';
}

function pantryAt(out, day) {
  let found = null;
  for (const snap of (out.daily || [])) {
    if (snap.day > day) break;
    if (typeof snap.pantryKcal === 'number') found = snap.pantryKcal;
  }
  return found;
}

function summarize(out) {
  const s = AN.analyzeSeed(out);
  const daily = (out.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  const lastDay = daily.length ? daily[daily.length - 1].day : null;
  const tends = (out.courtshipEvents || []).filter(function (e) { return e.fn === 'tendLink'; });
  const tendByLink = {};
  let lowPantryTends = 0, unknownPantryTends = 0;
  for (const e of tends) {
    const k = String(e.target);
    tendByLink[k] = (tendByLink[k] || 0) + 1;
    const p = pantryAt(out, e.day);
    if (p == null) unknownPantryTends++;
    else if (p <= 20000) lowPantryTends++;
  }
  const postDropDaysLived = s.drops.map(function (d) { return lastDay == null ? null : (lastDay - d.dropDay); });
  const band = bandFor(s.days, s.endReason);
  const base = BASELINE[s.seed] || null;
  const regressed = !!(base && BAND_ORDER[band] < BAND_ORDER[base.band]);
  const heldOrRecovered = (s.trajectory === 'holds-to-death' || (s.recoveries && s.recoveries.length > 0));
  const sayNear = function (day, span) {
    return (out.sayLines || []).filter(function (l) { return Math.abs(l.day - day) <= span; })
      .map(function (l) { return { day: l.day, line: l.line }; });
  };
  return Object.assign({}, s, {
    baseline: base, survivalBand: band, baselineBand: base ? base.band : null,
    regressed: regressed, heldOrRecovered: heldOrRecovered,
    lastDay: lastDay, postDropDaysLived: postDropDaysLived,
    tendTotal: tends.length, tendByLink: tendByLink,
    lowPantryTends: lowPantryTends, unknownPantryTends: unknownPantryTends,
    tendDays: tends.map(function (e) { return e.day; }),
    sayNearDrop: s.drops.map(function (d) { return { dropDay: d.dropDay, lines: sayNear(d.dropDay, 2) }; }),
    sayNearRecovery: (s.recoveries || []).map(function (r) { return { day: r.day, lines: sayNear(r.day, 2) }; }),
  });
}

function judgeGo(summaries) {
  const collapsed = summaries.filter(function (s) { return COLLAPSED.indexOf(s.seed) >= 0; });
  const successes = collapsed.filter(function (s) { return s.heldOrRecovered; });
  const regressions = summaries.filter(function (s) { return s.regressed; });
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0; }).length;
  let verdict;
  if (bad > 2) verdict = 'INSUFFICIENT-DATA';
  else if (successes.length >= 2 && regressions.length <= 1) verdict = 'GO';
  else verdict = 'NO-GO';
  return { verdict: verdict, collapsedN: collapsed.length, successes: successes.map(function (s) { return s.seed; }),
    regressions: regressions.map(function (s) { return s.seed; }), badSeeds: bad, total: summaries.length };
}

module.exports = { analyzeSeed: AN.analyzeSeed, summarize: summarize, judgeGo: judgeGo, BASELINE: BASELINE, bandFor: bandFor, COLLAPSED: COLLAPSED };

if (require.main === module) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-recovery-tend-b');
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const summaries = files.map(function (f) { return summarize(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  for (const s of summaries) {
    console.log(JSON.stringify({ seed: s.seed, days: s.days, endReason: s.endReason, scaleRank: s.scaleRank,
      maxWave: s.maxWave, endUnlockedWave: s.endUnlockedWave, firstDiploDay: s.firstDiploDay,
      diploDays: s.diploDays, holdShare: s.holdShare, drops: s.drops.length, recoveries: s.recoveries.length,
      trajectory: s.trajectory, w5faced: s.w5faced, readyDays: s.readyDays,
      postDropDaysLived: s.postDropDaysLived, tendTotal: s.tendTotal, lowPantryTends: s.lowPantryTends,
      survivalBand: s.survivalBand, baselineBand: s.baselineBand, regressed: s.regressed,
      heldOrRecovered: s.heldOrRecovered, errors: s.instrumentErrors, deathTotal: s.deathTotal }));
  }
  console.log(JSON.stringify(judgeGo(summaries)));
}
