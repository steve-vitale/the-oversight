#!/usr/bin/env node
// analyze-dipslide2-b.js — PURE replay analyzer for sim-dipslide2-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line, armed arm) and prints a JSON summary to
// stdout. No game load, no file writes, no RNG. Pure functions are exported
// for scripts/test-dipslide2-b.js.
//
// Sensor rule (fixed in evidence/2026-11-01/sim-dipslide2-b-prereg.md,
// committed BEFORE any judged sweep). Candidate + eligibility + final-run
// counting are IDENTICAL to the dipslide arms; only the confirmation rule
// changes (design (c) recovery-to-candidate-level):
//   CANDIDATE on evening day D iff (from scripts/analyze-dipslide-b.js,
//   imported verbatim): >= 20% fall over 5 evenings, 3 consecutive evening
//   falls ending at D, gateEngaged true, no null pantry in the chain.
//   ELIGIBLE iff loopDay D >= 8.
//   CONFIRMS (NEW) iff the loopDay-(D+5) evening row exists with a numeric
//   pantry reading, lies inside the SAME final engaged run (gateEngaged
//   true), AND max{P(D+1)..P(D+5)} < P(D) — the pantry never climbs back
//   to the candidate evening's level at any evening in the window. One
//   intermediate evening at or above P(D) kills the candidate even if
//   P(D+5) itself is below P(D). Null/missing intermediate rows cannot
//   demonstrate recovery and are ignored for the max; a null/missing D+5
//   row blocks confirmation.
//   Scanning: eligible candidates inside the final engaged run, ascending;
//   the FIRST that confirms yields (candidateDay = D, confirmedDay = D+5).
//   A candidate that fails confirmation does not end the scan.
//   False fire = a SURVIVED seed with a confirmedDay in its final run.
//   Diagnostic (descriptive): eligible final-run candidates that would
//   confirm under the OLD endpoint rule (P(D+5) < P(D)) but are rejected
//   by the new rule (intermediate recovery present).
'use strict';

const { isCandidateDay, isEligibleCandidateDay } = require('./analyze-dipslide-b');

// Does eligible candidate at row index i confirm under the NEW rule?
// rowsByLoopDay maps a loopDay to its row index. confirmIdx must lie
// inside [runStart, runEnd] (the same final engaged run) and the max over
// the whole D+1..D+5 window must stay below the candidate level.
function confirms2(rows, rowsByLoopDay, i, runStart, runEnd) {
  const r = rows[i];
  if (r == null || typeof r.loopDay !== 'number') return false;
  if (typeof r.pantryKcal !== 'number') return false;
  const ci = rowsByLoopDay.get(r.loopDay + 5);
  if (ci == null || ci < runStart || ci > runEnd) return false;
  const cr = rows[ci];
  if (cr == null || cr.gateEngaged !== true) return false;
  if (typeof cr.pantryKcal !== 'number') return false;
  for (let d = r.loopDay + 1; d <= r.loopDay + 5; d++) {
    const wi = rowsByLoopDay.get(d);
    if (wi == null) continue;
    const wr = rows[wi];
    if (wr == null || typeof wr.pantryKcal !== 'number') continue;
    if (wr.pantryKcal >= r.pantryKcal) return false; // recovered to candidate level
  }
  return true;
}

// Would candidate at row index i confirm under the OLD endpoint rule?
// (Descriptive diagnostic only.) Same run/window requirements, endpoint only.
function confirmsOld(rows, rowsByLoopDay, i, runStart, runEnd) {
  const r = rows[i];
  if (r == null || typeof r.loopDay !== 'number') return false;
  if (typeof r.pantryKcal !== 'number') return false;
  const ci = rowsByLoopDay.get(r.loopDay + 5);
  if (ci == null || ci < runStart || ci > runEnd) return false;
  const cr = rows[ci];
  if (cr == null || cr.gateEngaged !== true) return false;
  if (typeof cr.pantryKcal !== 'number') return false;
  return cr.pantryKcal < r.pantryKcal;
}

function analyzeSeed2(seedJson) {
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
  // Confirmed anywhere (descriptive only): first eligible candidate over
  // the whole window whose D+5 row exists, is engaged, and passes the new
  // no-recovery test (intermediate rows anywhere in the window count).
  let confirmedAnywhere = null, confirmedAnywhereCandidate = null;
  for (let i = 0; i < rows.length; i++) {
    if (!isEligibleCandidateDay(rows, i)) continue;
    const r = rows[i];
    const ci = rowsByLoopDay.get(r.loopDay + 5);
    if (ci == null) continue;
    const cr = rows[ci];
    if (cr == null || cr.gateEngaged !== true) continue;
    if (typeof cr.pantryKcal !== 'number' || typeof r.pantryKcal !== 'number') continue;
    let recovered = false;
    for (let d = r.loopDay + 1; d <= r.loopDay + 5; d++) {
      const wi = rowsByLoopDay.get(d);
      if (wi == null) continue;
      const wr = rows[wi];
      if (wr != null && typeof wr.pantryKcal === 'number' && wr.pantryKcal >= r.pantryKcal) { recovered = true; break; }
    }
    if (!recovered) { confirmedAnywhereCandidate = r.loopDay; confirmedAnywhere = cr.loopDay; break; }
  }
  // Final-run scan: first eligible candidate in the run that confirms.
  let candidateDay = null, confirmedDay = null;
  const eligibleCandidatesInRun = [];
  const rejectedByRecovery = []; // old-rule confirms rejected by new rule
  if (runStart != null) {
    for (let i = runStart; i <= runEnd; i++) {
      if (!isEligibleCandidateDay(rows, i)) continue;
      eligibleCandidatesInRun.push(rows[i].loopDay);
      if (confirmsOld(rows, rowsByLoopDay, i, runStart, runEnd) &&
          !confirms2(rows, rowsByLoopDay, i, runStart, runEnd)) {
        rejectedByRecovery.push(rows[i].loopDay);
      }
      if (candidateDay == null && confirms2(rows, rowsByLoopDay, i, runStart, runEnd)) {
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
    rejectedByRecovery,
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
function extractSense2(seedJson) {
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

function rateBar(seeds) {
  // seeds: analyzed seeds. S = census-valid survived seeds with a final run.
  const sSeeds = seeds.filter((s) => s.censusValid && s.survived && s.finalRun != null);
  const fSeeds = sSeeds.filter((s) => s.falseFire).map((s) => s.seed);
  if (sSeeds.length === 0) return { judged: false, rate: null, falseSeeds: fSeeds, sCount: 0, pass: null };
  const rate = fSeeds.length / sSeeds.length;
  return { judged: true, rate, falseSeeds: fSeeds, sCount: sSeeds.length, pass: rate <= 0.25 };
}

function summarize2(allSeeds) {
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeed2(sj);
    a.sense = extractSense2(sj);
    return a;
  });
  const bar = rateBar(seeds);
  const anyConfirm = seeds.some((s) => s.confirmedDay != null);
  const collapsed = seeds.filter((s) => s.censusValid && s.collapsed);
  const earlinessPass = collapsed.some((s) => s.earliness != null && s.earliness >= 3);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      rate: bar,
      sensitivityAnyConfirm: anyConfirm,
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
    process.stdout.write(JSON.stringify(summarize2(seeds), null, 2) + '\n');
  });
}

module.exports = { confirms2, confirmsOld, analyzeSeed2, extractSense2, rateBar, summarize2 };
