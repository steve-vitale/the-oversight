#!/usr/bin/env node
// analyze-dipslide-b.js — PURE replay analyzer for sim-dipslide-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line, armed arm) and prints a JSON summary to
// stdout. No game load, no file writes, no RNG. Pure functions are exported
// for scripts/test-dipslide-b.js.
//
// Sensor rule (fixed in evidence/2026-11-01/sim-dipslide-b-prereg.md,
// committed BEFORE any judged replay):
//   CANDIDATE on evening day D iff (identical to the trendsensor prereg):
//     (i)   at least 5 prior evening rows exist;
//     (ii)  P(D) <= 0.80 * P(D-5)  (total store fell >= 20% over 5 evenings);
//     (iii) three consecutive evening falls ending at D:
//           P(D-2) < P(D-3) AND P(D-1) < P(D-2) AND P(D) < P(D-1);
//     (iv)  the level rule says engaged that evening (gateEngaged true).
//   A day with a null pantry reading breaks all fall chains and is never
//   a candidate day.
//   EARLY-WINDOW EXCLUSION: a candidate is eligible only if its loopDay
//   is >= 8. Signals on loopDays 1-7 are ignored entirely.
//   RECOVERY CONFIRMATION (N = 5): an eligible candidate day D CONFIRMS
//   iff the loopDay-(D+5) evening row exists with a numeric pantry
//   reading, lies inside the SAME final engaged run (gateEngaged true),
//   and P(D+5) < P(D). (Since P(D) <= 0.80 * P(D-5), this also implies
//   P(D+5) < P(D-5).)
//   Scanning: eligible candidates inside the final engaged run, ascending;
//   the FIRST that confirms yields (candidateDay = D, confirmedDay = D+5).
//   A candidate that fails recovery does not end the scan.
//   Final engaged run = maximal consecutive gateEngaged=true evenings
//   ending at the seed's last engaged evening. Level stand-down day =
//   first gateEngaged=false evening after that run (none if the seed ends
//   engaged). Earliness = levelStandDown - confirmedDay (loopDay units).
//   False fire = a SURVIVED seed with a confirmedDay in its final run.
'use strict';

// Is row i (0-based) a CANDIDATE day? rows: evening census rows in order,
// each {loopDay, pantryKcal, gateEngaged}. Identical to the trendsensor
// isTrendDay condition; eligibility (loopDay >= 8) is applied by callers.
function isCandidateDay(rows, i) {
  if (i < 5) return false;
  const r = rows[i];
  if (r == null || r.gateEngaged !== true) return false;
  const p = (j) => (rows[j] == null ? null : rows[j].pantryKcal);
  const pd = p(i), p5 = p(i - 5);
  if (typeof pd !== 'number' || typeof p5 !== 'number') return false;
  if (!(pd <= 0.80 * p5)) return false;
  const a = p(i - 3), b = p(i - 2), c = p(i - 1);
  if (typeof a !== 'number' || typeof b !== 'number' || typeof c !== 'number') return false;
  if (!(b < a && c < b && pd < c)) return false;
  return true;
}

function isEligibleCandidateDay(rows, i) {
  const r = rows[i];
  if (r == null || typeof r.loopDay !== 'number') return false;
  return r.loopDay >= 8 && isCandidateDay(rows, i);
}

// Does eligible candidate at row index i confirm? rowsByLoopDay maps a
// loopDay to its row index. confirmIdx must lie inside [runStart, runEnd]
// (the same final engaged run) and satisfy P(confirm) < P(candidate).
function confirms(rows, rowsByLoopDay, i, runStart, runEnd) {
  const r = rows[i];
  if (r == null || typeof r.loopDay !== 'number') return false;
  const ci = rowsByLoopDay.get(r.loopDay + 5);
  if (ci == null || ci < runStart || ci > runEnd) return false;
  const cr = rows[ci];
  if (cr == null || cr.gateEngaged !== true) return false;
  if (typeof cr.pantryKcal !== 'number' || typeof r.pantryKcal !== 'number') return false;
  return cr.pantryKcal < r.pantryKcal;
}

function analyzeSeed(seedJson) {
  const rows = seedJson.rows || [];
  const nullPantry = rows.filter((r) => r == null || typeof r.pantryKcal !== 'number').length;
  const censusValid = rows.length > 0 && rows.length === seedJson.daysAlive &&
    rows.every((r) => r != null && typeof r.gateEngaged === 'boolean');
  const rowsByLoopDay = new Map();
  rows.forEach((r, i) => { if (r != null && typeof r.loopDay === 'number') rowsByLoopDay.set(r.loopDay, i); });
  // Final engaged run: scan back from the last engaged row.
  let lastEngaged = -1;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i] != null && rows[i].gateEngaged === true) { lastEngaged = i; break; }
  }
  let runStart = null, runEnd = null;
  if (lastEngaged >= 0) {
    runEnd = lastEngaged;
    runStart = lastEngaged;
    while (runStart - 1 >= 0 && rows[runStart - 1] != null && rows[runStart - 1].gateEngaged === true) runStart--;
  }
  const candidateDaysAnywhere = [];
  for (let i = 0; i < rows.length; i++) if (isCandidateDay(rows, i)) candidateDaysAnywhere.push(rows[i].loopDay);
  const eligibleCandidatesAnywhere = [];
  for (let i = 0; i < rows.length; i++) if (isEligibleCandidateDay(rows, i)) eligibleCandidatesAnywhere.push(rows[i].loopDay);
  // Confirmed anywhere (descriptive only): first eligible candidate over
  // the whole window whose D+5 row exists, is engaged, and is unrecovered.
  let confirmedAnywhere = null, confirmedAnywhereCandidate = null;
  for (let i = 0; i < rows.length; i++) {
    if (!isEligibleCandidateDay(rows, i)) continue;
    const r = rows[i];
    const ci = rowsByLoopDay.get(r.loopDay + 5);
    if (ci == null) continue;
    const cr = rows[ci];
    if (cr == null || cr.gateEngaged !== true) continue;
    if (typeof cr.pantryKcal !== 'number' || typeof r.pantryKcal !== 'number') continue;
    if (cr.pantryKcal < r.pantryKcal) { confirmedAnywhereCandidate = r.loopDay; confirmedAnywhere = cr.loopDay; break; }
  }
  // Final-run scan: first eligible candidate in the run that confirms.
  let candidateDay = null, confirmedDay = null;
  const eligibleCandidatesInRun = [];
  if (runStart != null) {
    for (let i = runStart; i <= runEnd; i++) {
      if (!isEligibleCandidateDay(rows, i)) continue;
      eligibleCandidatesInRun.push(rows[i].loopDay);
      if (candidateDay == null && confirms(rows, rowsByLoopDay, i, runStart, runEnd)) {
        candidateDay = rows[i].loopDay;
        confirmedDay = rows[i].loopDay + 5;
      }
    }
  }
  let levelStandDown = null;
  if (runEnd != null && runEnd + 1 < rows.length) levelStandDown = rows[runEnd + 1].loopDay;
  const earliness = (confirmedDay != null && levelStandDown != null) ? (levelStandDown - confirmedDay) : null;
  const survived = seedJson.endReason === 'survived';
  const collapsed = !survived;
  const falseFire = survived && confirmedDay != null;
  return {
    seed: seedJson.seed, arm: seedJson.arm, endReason: seedJson.endReason,
    survived, collapsed, daysAlive: seedJson.daysAlive,
    maxWaveUnlocked: seedJson.maxWaveUnlocked, waveKills: seedJson.waveKills,
    censusValid, rowCount: rows.length, nullPantryRows: nullPantry,
    finalRun: runStart == null ? null : { startLoopDay: rows[runStart].loopDay, endLoopDay: rows[runEnd].loopDay },
    candidateDay, confirmedDay, eligibleCandidatesInRun,
    candidateDaysAnywhere, eligibleCandidatesAnywhere,
    confirmedAnywhere, confirmedAnywhereCandidate,
    levelStandDown, earliness, falseFire,
    pantrySeries: rows.map((r) => ({ loopDay: r == null ? null : r.loopDay,
      pantryKcal: r == null ? null : r.pantryKcal,
      freshDays: r == null ? null : r.freshDays,
      gateEngaged: r == null ? null : r.gateEngaged,
      hungryStreak: r == null ? null : r.hungryStreak,
      alive: r == null ? null : r.alive })),
  };
}

// Sense lines: "shelves full" family + the known "pot stays full" line.
function extractSense(seedJson) {
  const fullLines = [];
  let potLine = null;
  for (const s of (seedJson.sayLines || [])) {
    const line = s.line || '';
    if (/shelves are full|full to bursting|Full shelves/i.test(line)) {
      fullLines.push({ day: s.day, line });
    }
    if (/pot stays full/i.test(line) && potLine == null) potLine = { day: s.day, line };
  }
  return { fullLines, potLine };
}

function summarize(allSeeds) {
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeed(sj);
    a.sense = extractSense(sj);
    return a;
  });
  const pilot51101 = seeds.find((s) => s.seed === 51101) || null;
  const survivors = seeds.filter((s) => s.survived);
  const falseSeeds = survivors.filter((s) => s.falseFire).map((s) => s.seed);
  const barA = pilot51101 != null && pilot51101.confirmedDay != null &&
    pilot51101.earliness != null && pilot51101.earliness >= 3;
  const barB = falseSeeds.length <= 1;
  const collapsed = seeds.filter((s) => s.collapsed);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      a_51101Earliness: { pass: barA,
        candidateDay: pilot51101 ? pilot51101.candidateDay : null,
        confirmedDay: pilot51101 ? pilot51101.confirmedDay : null,
        levelStandDown: pilot51101 ? pilot51101.levelStandDown : null,
        earliness: pilot51101 ? pilot51101.earliness : null },
      b_falseCap: { pass: barB, falseSeeds, falseCount: falseSeeds.length,
        survivingSeeds: survivors.map((s) => s.seed), survivingCount: survivors.length },
    },
    diagGo: barA && barB,
    wall: {
      seeds: seeds.length, collapsed: collapsed.map((s) => s.seed),
      collapsedCount: collapsed.length,
      medianDaysAlive: med(seeds.map((s) => s.daysAlive)),
      maxDaysAlive: seeds.length ? Math.max(...seeds.map((s) => s.daysAlive)) : null,
      maxWaveUnlocked: seeds.length ? Math.max(...seeds.map((s) => s.maxWaveUnlocked || 1)) : null,
      waveReach: seeds.map((s) => ({ seed: s.seed, maxWaveUnlocked: s.maxWaveUnlocked || 1 })),
    },
    censusValidAll: seeds.every((s) => s.censusValid),
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarize(seeds), null, 2) + '\n');
  });
}

module.exports = { isCandidateDay, isEligibleCandidateDay, confirms, analyzeSeed, extractSense, summarize };
