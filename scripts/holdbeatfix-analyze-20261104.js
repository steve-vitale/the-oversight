// holdbeatfix-analyze-20261104.js — pilot-leg analyzer for arm
// sim-holdbeatfix-b. Pure functions over per-seed driver JSONs: no game
// load, no repo writes. Cost-bar clauses (a)–(e) from the prereg, plus
// a baseline-vs-fixed trajectory diff that ignores ONLY hold-beat
// veteran numbers (beat text + moment counts), since those are the
// intended change.
// Usage:
//   node scripts/holdbeatfix-analyze-20261104.js <baseline-glob...> -- <fixed-glob...>
// (globs are expanded by the shell; files pair by seed.)
// Or require() summarizePilot / compareLegs.
'use strict';
const fs = require('fs');

function outcomeCategory(out) {
  if (out.won) return 'won';
  if (out.endReason === 'survived' || out.endReason === 'horizon') return 'survived';
  return 'lost';
}

function summarizePilot(out) {
  const deaths = out.deathEvents || [];
  const starvation = deaths.filter(function (e) { return e && e.cause === 'starvation'; }).length;
  const causes = {};
  deaths.forEach(function (e) { if (e && e.cause != null) causes[e.cause] = (causes[e.cause] || 0) + 1; });
  const holdBeats = (out.beatEvents || []).filter(function (b) { return b && b.kind === 'hold'; });
  const release5 = (out.beatEvents || []).filter(function (b) { return b && b.kind === 'release5'; }).length;
  const w4kills = (out.killEvents || []).filter(function (k) { return k && (k.wave | 0) === 4; }).length;
  const w5faced = (out.daily || []).some(function (d) { return d && d.w5faced; });
  return {
    seed: out.seed, days: out.days, endReason: out.endReason,
    outcome: outcomeCategory(out), won: !!out.won,
    scaleRank: out.scaleRank || null, maxWave: out.maxWave,
    endUnlockedWave: out.endUnlockedWave, peakAfter: out.peakAfterEndCall,
    starvation: starvation, deathTotal: deaths.length, causes: causes,
    holdBeats: holdBeats.length, release5: release5, w4kills: w4kills,
    w5faced: !!w5faced, instrumentErrors: (out.instrumentErrors || []).length,
  };
}

function median(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stripHoldNumbers(obj) {
  // Deep copy with hold-beat veteran numbers removed (the intended
  // change): beatEvents kind 'hold' keep day/seq/kind only; standingLines
  // matching the hold shape keep day/via/seq only.
  const HOLD_RE = /blood your fighters \(\d+ of \d+ veterans\)/;
  const copy = JSON.parse(JSON.stringify(obj));
  if (Array.isArray(copy.beatEvents)) {
    copy.beatEvents = copy.beatEvents.map(function (b) {
      if (b && b.kind === 'hold') return { day: b.day, via: b.via, seq: b.seq, kind: b.kind };
      return b;
    });
  }
  if (Array.isArray(copy.standingLines)) {
    copy.standingLines = copy.standingLines.map(function (l) {
      if (l && typeof l.line === 'string' && HOLD_RE.test(l.line)) return { day: l.day, via: l.via, seq: l.seq };
      return l;
    });
  }
  delete copy.anchorCommit;
  delete copy.run;
  return copy;
}

function diffPaths(a, b, path, out, depth) {
  if (depth > 8) return;
  if (a === b) return;
  if (a == null || b == null || typeof a !== typeof b) { out.push(path + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b)); return; }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) { out.push(path + '.length: ' + a.length + ' vs ' + b.length); }
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) diffPaths(a[i], b[i], path + '[' + i + ']', out, depth + 1);
    return;
  }
  if (typeof a === 'object') {
    const keys = new Set(Object.keys(a).concat(Object.keys(b)));
    keys.forEach(function (k) {
      if (!(k in a)) out.push(path + '.' + k + ': missing vs ' + JSON.stringify(b[k]));
      else if (!(k in b)) out.push(path + '.' + k + ': ' + JSON.stringify(a[k]) + ' vs missing');
      else diffPaths(a[k], b[k], path + '.' + k, out, depth + 1);
    });
    return;
  }
  out.push(path + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
}

function trajectoryDiff(baseOut, fixedOut) {
  const a = stripHoldNumbers(baseOut);
  const b = stripHoldNumbers(fixedOut);
  const diffs = [];
  // Compare the trajectory-bearing fields (daily snapshots, kills,
  // deaths, gate calls, outcomes). standingLines/beatEvents are
  // compared stripped above; anchor/run excluded.
  ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost', 'scaleRank',
   'maxWave', 'endUnlockedWave', 'peakBeforeEndCall', 'peakAfterEndCall',
   'endCallMovedPeak', 'daily', 'killEvents', 'beatEvents', 'gateCalls',
   'deathEvents', 'standingLines'].forEach(function (f) {
    diffPaths(a[f], b[f], f, diffs, 0);
  });
  return diffs;
}

function compareLegs(baseSummaries, fixedSummaries, diffsBySeed) {
  const baseTotalStarv = baseSummaries.reduce(function (n, s) { return n + s.starvation; }, 0);
  const fixedTotalStarv = fixedSummaries.reduce(function (n, s) { return n + s.starvation; }, 0);
  let armOnlyExcess = 0;
  const perSeed = baseSummaries.map(function (b) {
    const f = fixedSummaries.find(function (x) { return x.seed === b.seed; });
    const excess = Math.max(0, (f ? f.starvation : 0) - b.starvation);
    armOnlyExcess += excess;
    return { seed: b.seed, baseStarv: b.starvation, fixedStarv: f ? f.starvation : null,
      baseDays: b.days, fixedDays: f ? f.days : null,
      baseOutcome: b.outcome, fixedOutcome: f ? f.outcome : null,
      flipped: f ? (b.outcome !== f.outcome) : null };
  });
  const baseMedian = median(baseSummaries.map(function (s) { return s.days; }));
  const fixedMedian = median(fixedSummaries.map(function (s) { return s.days; }));
  const baseCauses = new Set();
  baseSummaries.forEach(function (s) { Object.keys(s.causes).forEach(function (c) { baseCauses.add(c); }); });
  const baseEnds = new Set(baseSummaries.map(function (s) { return s.endReason; }));
  const newCauses = new Set(), newEnds = new Set();
  fixedSummaries.forEach(function (s) {
    Object.keys(s.causes).forEach(function (c) { if (!baseCauses.has(c)) newCauses.add(c); });
    if (!baseEnds.has(s.endReason)) newEnds.add(s.endReason);
  });
  const baseErr = baseSummaries.reduce(function (n, s) { return n + s.instrumentErrors; }, 0);
  const fixedErr = fixedSummaries.reduce(function (n, s) { return n + s.instrumentErrors; }, 0);
  const clauses = {
    a_totals: fixedTotalStarv <= baseTotalStarv + 2,
    b_armOnly: armOnlyExcess <= 2,
    c_median: fixedMedian >= 0.8 * baseMedian,
    d_noNewClass: newCauses.size === 0 && newEnds.size === 0,
    e_noFlip: perSeed.every(function (p) { return !p.flipped; }),
    f_zeroErrors: baseErr === 0 && fixedErr === 0,
  };
  clauses.all = Object.keys(clauses).every(function (k) { return clauses[k]; });
  return {
    baseTotalStarv: baseTotalStarv, fixedTotalStarv: fixedTotalStarv,
    armOnlyExcess: armOnlyExcess, baseMedian: baseMedian, fixedMedian: fixedMedian,
    newCauses: Array.from(newCauses), newEnds: Array.from(newEnds),
    baseErrors: baseErr, fixedErrors: fixedErr,
    perSeed: perSeed, clauses: clauses,
    trajectoryDiffs: diffsBySeed || {},
  };
}

module.exports = { summarizePilot: summarizePilot, compareLegs: compareLegs,
  trajectoryDiff: trajectoryDiff, median: median, outcomeCategory: outcomeCategory };

if (require.main === module) {
  const args = process.argv.slice(2);
  const sep = args.indexOf('--');
  if (sep < 0) { console.error('usage: analyze <base files...> -- <fixed files...>'); process.exit(2); }
  const baseFiles = args.slice(0, sep), fixedFiles = args.slice(sep + 1);
  const load = function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); };
  const base = baseFiles.map(load), fixed = fixedFiles.map(load);
  const baseS = base.map(summarizePilot), fixedS = fixed.map(summarizePilot);
  const diffs = {};
  base.forEach(function (b) {
    const f = fixed.find(function (x) { return x.seed === b.seed; });
    if (f) diffs[b.seed] = trajectoryDiff(b, f);
  });
  const cmp = compareLegs(baseS, fixedS, diffs);
  console.log(JSON.stringify({ base: baseS, fixed: fixedS, compare: cmp }, null, 2));
}
