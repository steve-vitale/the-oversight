#!/usr/bin/env node
// analyze-dipslide3-b.js — PURE replay analyzer for sim-dipslide3-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line, armed arm) and prints a JSON summary to
// stdout. No game load, no file writes, no RNG. Pure functions are exported
// for scripts/test-dipslide3-b.js.
//
// Sensor rule (fixed in evidence/2026-11-01/sim-dipslide3-b-prereg.md,
// committed BEFORE any judged sweep). Candidate + eligibility + final-run
// counting are IDENTICAL to the dipslide arms; only the confirmation rule
// changes (tolerance recovery test):
//   CANDIDATE on evening day D iff (from scripts/analyze-dipslide-b.js,
//   imported verbatim): >= 20% fall over 5 evenings, 3 consecutive evening
//   falls ending at D, gateEngaged true, no null pantry in the chain.
//   ELIGIBLE iff loopDay D >= 8.
//   CONFIRMS (TOLERANCE) iff the loopDay-(D+5) evening row exists with a
//   numeric pantry reading, lies inside the SAME final engaged run
//   (gateEngaged true), P(D+5) < P(D), AND no tolerance-recovery in
//   D+1..D+5, where tolerance-recovery is EITHER:
//     (a) margin breach: some evening P >= 1.05 * P(D); OR
//     (b) sustained at-level: two consecutive evenings (both numeric,
//       both inside the window) with P >= P(D) each.
//   Null/missing intermediate rows cannot satisfy (a) and BREAK
//   consecutiveness for (b). A null/missing D+5 row blocks confirmation.
//   HAIRLINE-ONLY confirmation: the confirming candidate's window contains
//   an evening with P(D) < P < 1.05 * P(D) AND exactly one evening in the
//   window has P > P(D) (strictly above level).
//   Scanning: eligible candidates inside the final engaged run, ascending;
//   the FIRST that confirms yields (candidateDay = D, confirmedDay = D+5).
//   False fire (reported, dipslide2 definition) = a SURVIVED seed with a
//   confirmedDay in its final run.
//   Diagnostics (descriptive): dipslide2-rule confirms rejected by the
//   tolerance rule; tolerance-rule confirms rejected by the dipslide2 rule
//   (the restored set).
'use strict';

const { isCandidateDay, isEligibleCandidateDay } = require('./analyze-dipslide-b');
const { confirms2 } = require('./analyze-dipslide2-b');

// Window rows for candidate at row index i, as {loopDay, pantryKcal} list
// for loopDays D+1..D+5 (missing loopDays absent, null rows kept as null).
function windowRows(rows, rowsByLoopDay, i) {
  const r = rows[i];
  const out = [];
  for (let d = r.loopDay + 1; d <= r.loopDay + 5; d++) {
    const wi = rowsByLoopDay.get(d);
    if (wi == null) { out.push({ loopDay: d, pantryKcal: null, present: false }); continue; }
    const wr = rows[wi];
    out.push({ loopDay: d, pantryKcal: wr == null ? null : wr.pantryKcal, present: wr != null });
  }
  return out;
}

// Does the window show tolerance-recovery? Returns {recovered, reason}
// reason: null | 'margin' | 'sustained'.
function toleranceRecovery(rows, rowsByLoopDay, i) {
  const r = rows[i];
  if (r == null || typeof r.pantryKcal !== 'number') return { recovered: false, reason: null };
  const win = windowRows(rows, rowsByLoopDay, i);
  for (const w of win) {
    if (typeof w.pantryKcal === 'number' && w.pantryKcal >= 1.05 * r.pantryKcal) {
      return { recovered: true, reason: 'margin' };
    }
  }
  for (let k = 0; k + 1 < win.length; k++) {
    const a = win[k], b = win[k + 1];
    if (a.loopDay + 1 !== b.loopDay) continue; // consecutiveness is by loopDay
    if (typeof a.pantryKcal === 'number' && typeof b.pantryKcal === 'number' &&
        a.pantryKcal >= r.pantryKcal && b.pantryKcal >= r.pantryKcal) {
      return { recovered: true, reason: 'sustained' };
    }
  }
  return { recovered: false, reason: null };
}

// Is the confirming candidate at row index i hairline-only?
function isHairlineOnly(rows, rowsByLoopDay, i) {
  const r = rows[i];
  if (r == null || typeof r.pantryKcal !== 'number') return false;
  const win = windowRows(rows, rowsByLoopDay, i);
  let aboveCount = 0;
  let hasSubMarginUplift = false;
  for (const w of win) {
    if (typeof w.pantryKcal !== 'number') continue;
    if (w.pantryKcal > r.pantryKcal) {
      aboveCount++;
      if (w.pantryKcal < 1.05 * r.pantryKcal) hasSubMarginUplift = true;
    }
  }
  return hasSubMarginUplift && aboveCount === 1;
}

// Does eligible candidate at row index i confirm under the TOLERANCE rule?
function confirms3(rows, rowsByLoopDay, i, runStart, runEnd) {
  const r = rows[i];
  if (r == null || typeof r.loopDay !== 'number') return false;
  if (typeof r.pantryKcal !== 'number') return false;
  const ci = rowsByLoopDay.get(r.loopDay + 5);
  if (ci == null || ci < runStart || ci > runEnd) return false;
  const cr = rows[ci];
  if (cr == null || cr.gateEngaged !== true) return false;
  if (typeof cr.pantryKcal !== 'number') return false;
  if (!(cr.pantryKcal < r.pantryKcal)) return false;
  return !toleranceRecovery(rows, rowsByLoopDay, i).recovered;
}

function analyzeSeed3(seedJson) {
  const rows = seedJson.rows || [];
  const nullPantry = rows.filter((r) => r == null || typeof r.pantryKcal !== 'number').length;
  const censusValid = rows.length > 0 && rows.length === seedJson.daysAlive &&
    rows.every((r) => r != null && typeof r.gateEngaged === 'boolean');
  const rowsByLoopDay = new Map();
  rows.forEach((r, i) => { if (r != null && typeof r.loopDay === 'number') rowsByLoopDay.set(r.loopDay, i); });
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
  // Confirmed anywhere (descriptive only, tolerance rule, no run constraint
  // beyond the D+5 row being engaged).
  let confirmedAnywhere = null, confirmedAnywhereCandidate = null;
  for (let i = 0; i < rows.length; i++) {
    if (!isEligibleCandidateDay(rows, i)) continue;
    const r = rows[i];
    const ci = rowsByLoopDay.get(r.loopDay + 5);
    if (ci == null) continue;
    const cr = rows[ci];
    if (cr == null || cr.gateEngaged !== true) continue;
    if (typeof cr.pantryKcal !== 'number' || typeof r.pantryKcal !== 'number') continue;
    if (cr.pantryKcal >= r.pantryKcal) continue;
    if (toleranceRecovery(rows, rowsByLoopDay, i).recovered) continue;
    confirmedAnywhereCandidate = r.loopDay; confirmedAnywhere = cr.loopDay; break;
  }
  // Final-run scan.
  let candidateDay = null, confirmedDay = null, hairlineOnly = null;
  let confirmingWindow = null;
  const eligibleCandidatesInRun = [];
  const rejectedByTolerance = []; // dipslide2 confirms rejected by tolerance rule
  const restoredByTolerance = []; // tolerance confirms rejected by dipslide2 rule
  if (runStart != null) {
    for (let i = runStart; i <= runEnd; i++) {
      if (!isEligibleCandidateDay(rows, i)) continue;
      eligibleCandidatesInRun.push(rows[i].loopDay);
      const oldConf = confirms2(rows, rowsByLoopDay, i, runStart, runEnd);
      const newConf = confirms3(rows, rowsByLoopDay, i, runStart, runEnd);
      if (oldConf && !newConf) rejectedByTolerance.push(rows[i].loopDay);
      if (newConf && !oldConf) restoredByTolerance.push(rows[i].loopDay);
      if (candidateDay == null && newConf) {
        candidateDay = rows[i].loopDay;
        confirmedDay = rows[i].loopDay + 5;
        hairlineOnly = isHairlineOnly(rows, rowsByLoopDay, i);
        confirmingWindow = windowRows(rows, rowsByLoopDay, i).map((w) => ({ loopDay: w.loopDay, pantryKcal: w.pantryKcal }));
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
    candidateDay, confirmedDay, hairlineOnly, confirmingWindow,
    eligibleCandidatesInRun,
    rejectedByTolerance, restoredByTolerance,
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

function extractSense3(seedJson) {
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

function rateBar3(seeds) {
  const sSeeds = seeds.filter((s) => s.censusValid && s.survived && s.finalRun != null);
  const fSeeds = sSeeds.filter((s) => s.falseFire).map((s) => s.seed);
  if (sSeeds.length === 0) return { judged: false, rate: null, falseSeeds: fSeeds, sCount: 0, pass: null };
  const rate = fSeeds.length / sSeeds.length;
  return { judged: true, rate, falseSeeds: fSeeds, sCount: sSeeds.length, pass: rate <= 0.25 };
}

function summarize3(allSeeds) {
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeed3(sj);
    a.sense = extractSense3(sj);
    return a;
  });
  const bar = rateBar3(seeds);
  const confirmedSeeds = seeds.filter((s) => s.confirmedDay != null).map((s) => s.seed);
  const hairlineSeeds = seeds.filter((s) => s.confirmedDay != null && s.hairlineOnly).map((s) => s.seed);
  const collapsed = seeds.filter((s) => s.censusValid && s.collapsed);
  const earlinessPass = collapsed.some((s) => s.earliness != null && s.earliness >= 3);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      falseFireRate: bar,
      confirmedCount: confirmedSeeds.length,
      confirmedSeeds,
      hairlineOnlyCount: hairlineSeeds.length,
      hairlineOnlySeeds: hairlineSeeds,
      sensitivityAnyConfirm: confirmedSeeds.length > 0,
      collapseEarliness: collapsed.length === 0
        ? { judged: false, pass: null, collapsedSeeds: [] }
        : { judged: true, pass: earlinessPass,
            collapsedSeeds: collapsed.map((s) => ({ seed: s.seed, confirmedDay: s.confirmedDay, levelStandDown: s.levelStandDown, earliness: s.earliness })) },
    },
    wall: {
      seeds: seeds.length,
      collapsed: seeds.filter((s) => s.collapsed).map((s) => s.seed),
      collapsedCount: seeds.filter((s) => s.collapsed).length,
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
    process.stdout.write(JSON.stringify(summarize3(seeds), null, 2) + '\n');
  });
}

module.exports = { confirms3, toleranceRecovery, isHairlineOnly, analyzeSeed3, extractSense3, rateBar3, summarize3 };
