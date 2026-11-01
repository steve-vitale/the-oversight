#!/usr/bin/env node
// analyze-dipslide-confirm-b.js — CONFIRM-bars wrapper for sim-dipslide-confirm-b.
// (DIAG ONLY.) Reads depositgate-b-driver .jsonl on stdin (one JSON object
// per line, one seed per line, armed arm) and prints a JSON summary to
// stdout. The per-seed sensor analysis is the COMMITTED dipslide analyzer
// (scripts/analyze-dipslide-b.js, reused verbatim via require); this file
// adds ONLY the confirm bars (c) and (d) from
// evidence/2026-11-01/sim-dipslide-confirm-b-prereg.md, committed BEFORE
// any judged sweep. No game load, no file writes, no RNG.
//
// Bar (c): F / S <= 0.25, where S = census-valid confirm seeds whose
//   endReason is 'survived' AND that have a final engaged run (no-run
//   seeds are neither false nor survivors), F = seeds in S with a
//   confirmedDay in their final engaged run. S = 0 -> UNJUDGED.
// Bar (d): if >= 1 census-valid confirm seed collapses, PASS iff >= 1
//   collapsed seed has levelStandDown - confirmedDay >= 3; if zero
//   collapse, UNJUDGED. Earliness undefined (no level stand-down) never
//   counts as passing.
// Verdict: (c) PASS + (d) PASS = GO; (c) PASS + (d) UNJUDGED = GO
//   (earliness unmeasured, stated); (c) FAIL = NO-GO; (c) PASS +
//   (d) FAIL = NO-GO; (c) UNJUDGED = UNJUDGED (no verdict).
// Counted-anywhere false count (confirmedAnywhere on survived seeds) is
// descriptive only, never toward the bars.
'use strict';
const { analyzeSeed, extractSense } = require('./analyze-dipslide-b.js');

function summarizeConfirm(allSeeds) {
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeed(sj);
    a.sense = extractSense(sj);
    return a;
  });
  const valid = seeds.filter((s) => s.censusValid);
  const invalid = seeds.filter((s) => !s.censusValid).map((s) => s.seed);
  const noRun = seeds.filter((s) => s.finalRun == null).map((s) => s.seed);
  const sSet = valid.filter((s) => s.survived && s.finalRun != null);
  const falseSeeds = sSet.filter((s) => s.falseFire).map((s) => s.seed);
  const S = sSet.length, F = falseSeeds.length;
  const rate = S > 0 ? F / S : null;
  const barC = S === 0 ? 'UNJUDGED' : (rate <= 0.25 ? 'PASS' : 'FAIL');
  const collapsed = valid.filter((s) => s.collapsed);
  const collapsedEarliness = collapsed.map((s) => ({
    seed: s.seed, candidateDay: s.candidateDay, confirmedDay: s.confirmedDay,
    levelStandDown: s.levelStandDown, earliness: s.earliness,
  }));
  let barD;
  if (collapsed.length === 0) barD = 'UNJUDGED';
  else barD = collapsed.some((s) => s.earliness != null && s.earliness >= 3) ? 'PASS' : 'FAIL';
  let verdict;
  if (barC === 'FAIL' || (barC === 'PASS' && barD === 'FAIL')) verdict = 'NO-GO';
  else if (barC === 'PASS' && (barD === 'PASS' || barD === 'UNJUDGED')) verdict = 'GO';
  else verdict = 'UNJUDGED';
  const survivedAnywhereFalse = valid
    .filter((s) => s.survived && s.confirmedAnywhere != null).map((s) => s.seed);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      c_falseRate: { verdict: barC, falseSeeds, falseCount: F,
        survivingWithRun: sSet.map((s) => s.seed), survivingWithRunCount: S,
        rate, cap: 0.25 },
      d_collapseEarliness: { verdict: barD, collapsedSeeds: collapsed.map((s) => s.seed),
        collapsedCount: collapsed.length, collapsedEarliness },
    },
    verdict,
    descriptive: {
      countedAnywhereFalseSeeds: survivedAnywhereFalse,
      countedAnywhereFalseCount: survivedAnywhereFalse.length,
      noRunSeeds: noRun,
      censusInvalidSeeds: invalid,
      censusValidAll: invalid.length === 0,
    },
    wall: {
      seeds: seeds.length,
      collapsed: collapsed.map((s) => s.seed),
      collapsedCount: collapsed.length,
      medianDaysAlive: med(seeds.map((s) => s.daysAlive)),
      maxDaysAlive: seeds.length ? Math.max(...seeds.map((s) => s.daysAlive)) : null,
      maxWaveUnlocked: seeds.length ? Math.max(...seeds.map((s) => s.maxWaveUnlocked || 1)) : null,
      waveReach: seeds.map((s) => ({ seed: s.seed, maxWaveUnlocked: s.maxWaveUnlocked || 1 })),
    },
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeConfirm(seeds), null, 2) + '\n');
  });
}

module.exports = { summarizeConfirm };
