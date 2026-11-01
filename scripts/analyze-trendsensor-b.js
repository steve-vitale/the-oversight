#!/usr/bin/env node
// analyze-trendsensor-b.js — PURE replay analyzer for sim-trendsensor-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line, armed arm) and prints a JSON summary to
// stdout. No game load, no file writes, no RNG. Pure functions are exported
// for scripts/test-trendsensor-b.js.
//
// Trend rule (fixed in evidence/2026-11-01/sim-trendsensor-b-prereg.md,
// committed BEFORE any judged analysis):
//   TREND-NOT-FULL on evening day D iff:
//     (i)   at least 5 prior evening rows exist;
//     (ii)  P(D) <= 0.80 * P(D-5)  (total store fell >= 20% over 5 evenings);
//     (iii) three consecutive evening falls ending at D:
//           P(D-2) < P(D-3) AND P(D-1) < P(D-2) AND P(D) < P(D-1);
//     (iv)  the level rule says engaged that evening (gateEngaged true).
//   A day with a null pantry reading breaks all fall chains and is never
//   a trend day.
//   Final engaged run = maximal consecutive gateEngaged=true evenings
//   ending at the seed's last engaged evening. Trend stand-down day =
//   first TREND-NOT-FULL day inside that run. Level stand-down day =
//   first gateEngaged=false evening after that run (none if the seed ends
//   engaged). Earliness = levelStandDown - trendDay (loopDay units).
//   False stand-down seed = a SURVIVED seed with a trend stand-down day
//   in its final engaged run (per the prereg's deliberately strict rule).
'use strict';

// Is row i (0-based) a TREND-NOT-FULL day? rows: evening census rows in
// order, each {loopDay, pantryKcal, gateEngaged}.
function isTrendDay(rows, i) {
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

function analyzeSeed(seedJson) {
  const rows = seedJson.rows || [];
  const nullPantry = rows.filter((r) => r == null || typeof r.pantryKcal !== 'number').length;
  const censusValid = rows.length > 0 && rows.length === seedJson.daysAlive &&
    rows.every((r) => r != null && typeof r.gateEngaged === 'boolean');
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
  const trendDaysAnywhere = [];
  for (let i = 0; i < rows.length; i++) if (isTrendDay(rows, i)) trendDaysAnywhere.push(rows[i].loopDay);
  let trendDay = null;
  if (runStart != null) {
    for (let i = runStart; i <= runEnd; i++) {
      if (isTrendDay(rows, i)) { trendDay = rows[i].loopDay; break; }
    }
  }
  const trendDaysInRun = [];
  if (runStart != null) {
    for (let i = runStart; i <= runEnd; i++) if (isTrendDay(rows, i)) trendDaysInRun.push(rows[i].loopDay);
  }
  let levelStandDown = null;
  if (runEnd != null && runEnd + 1 < rows.length) levelStandDown = rows[runEnd + 1].loopDay;
  const earliness = (trendDay != null && levelStandDown != null) ? (levelStandDown - trendDay) : null;
  const survived = seedJson.endReason === 'survived';
  const collapsed = !survived;
  const falseStandDown = survived && trendDay != null;
  return {
    seed: seedJson.seed, arm: seedJson.arm, endReason: seedJson.endReason,
    survived, collapsed, daysAlive: seedJson.daysAlive,
    maxWaveUnlocked: seedJson.maxWaveUnlocked, waveKills: seedJson.waveKills,
    censusValid, rowCount: rows.length, nullPantryRows: nullPantry,
    finalRun: runStart == null ? null : { startLoopDay: rows[runStart].loopDay, endLoopDay: rows[runEnd].loopDay },
    trendDay, trendDaysInRun, trendDaysAnywhere,
    levelStandDown, earliness, falseStandDown,
    // Evening pantry series (loopDay -> kcal) for the evidence slide table.
    pantrySeries: rows.map((r) => ({ loopDay: r == null ? null : r.loopDay,
      pantryKcal: r == null ? null : r.pantryKcal,
      freshDays: r == null ? null : r.freshDays,
      gateEngaged: r == null ? null : r.gateEngaged,
      hungryStreak: r == null ? null : r.hungryStreak,
      alive: r == null ? null : r.alive })),
  };
}

// Sense lines: "shelves full" family + the known "pot stays full" line,
// with the scholar day recorded by the driver.
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
  const falseSeeds = survivors.filter((s) => s.falseStandDown).map((s) => s.seed);
  const barA = pilot51101 != null && pilot51101.trendDay != null &&
    pilot51101.earliness != null && pilot51101.earliness >= 3;
  const barB = falseSeeds.length <= 2;
  const collapsed = seeds.filter((s) => s.collapsed);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      a_51101Earliness: { pass: barA,
        trendDay: pilot51101 ? pilot51101.trendDay : null,
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

module.exports = { isTrendDay, analyzeSeed, extractSense, summarize };
