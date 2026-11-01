#!/usr/bin/env node
// analyze-falsefire-b.js — FALSE-FIRE DEFINITION SETTLEMENT analyzer
// for sim-falsefire-b. (DIAG ONLY.) Reads depositgate-b-driver .jsonl on
// stdin (one JSON object per line, one seed per line, armed arm) and prints
// a JSON summary to stdout. No game load, no file writes, no RNG. Pure
// functions are exported for scripts/test-falsefire-b.js.
//
// This analyzer REUSES scripts/analyze-dipslide3-b.js verbatim (candidate,
// eligibility, final-run counting, tolerance confirmation rule, hairline
// flag) and adds ONLY the two settlement layers fixed in
// evidence/2026-11-01/sim-falsefire-b-prereg.md, committed BEFORE any
// judged sweep or judged re-analysis:
//
//   (1) SETTLED FALSE-FIRE DEFINITION (replaces the dipslide2 definition
//   "confirmed fire on a survived seed", which is jointly unsatisfiable
//   with any sensitivity bar on an all-survived band). For a confirmed
//   fire in a seed's final engaged run, with candidate level L = pantry
//   on the candidate evening and confirmedDay C:
//     - COLLAPSED seed -> TRUE WARNING (not a false fire). The slide
//       ended in collapse; the warning described a real slide.
//     - Else, if the pantry climbs back to L at ANY evening in
//       C+1..C+10 (post-confirmation recovery horizon N = 10, twice the
//       5-evening confirmation window) -> FALSE FIRE ("quick
//       recovery": the "slide" was a transient dip that self-corrected
//       within two windows).
//     - Else -> TRUE WARNING ("sustained slide": the store stayed below
//       its candidate level for the full 10-evening horizon, whether the
//       village later survived or not). Survival alone is NEVER a
//       false fire under this definition: a village that slides, stays
//       down for 10 evenings, and then recovers got a correct early
//       warning, not a false alarm.
//     - CENSORED: if fewer than 10 evenings after C exist in the window
//       and no recovery was seen, the fire is a true warning AS
//       OBSERVED, flagged censored with the observed horizon length.
//       Recovery rows are numeric-pantry evenings only; null/missing
//       evenings are skipped (they cannot show a recovery) and do NOT
//       extend the horizon. Gate engagement is NOT required for the
//       recovery scan: the store is the store whether the level rule
//       is engaged or not.
//   (2) SEPARATED-WIGGLE FLAG (closes the dipslide3 hairline-only gap).
//   A confirming candidate's window shape is classified from its D+1..D+5
//   evenings relative to L:
//     - 'clean': no evening strictly above L.
//     - 'hairline': exactly one evening strictly above L, and it is a
//       sub-margin uplift (L < P < 1.05 * L). (Dipslide3 definition,
//       verbatim.)
//     - 'separated': two or more evenings strictly above L, ALL of them
//       sub-margin, with NO two consecutive (by loopDay) above-level
//       evenings. This is the dipslide3 gap shape: it confirmed and was
//       flagged as neither hairline nor anything else.
//     - 'other': any other above-level pattern on a confirming window
//       (cannot occur under the tolerance rule: a margin breach or a
//       sustained pair rejects the candidate; an equality-only evening
//       is not strictly above and falls under 'clean').
//   The firing rule is UNCHANGED: a separated-wiggle candidate CONFIRMS
//   under dipslide3 exactly as before (the extension is ADOPTED). What
//   changes is the flag: separated confirmations are now counted and
//   named, and they do not silently pass as clean. A confirmation whose
//   first-confirming candidate is 'separated' is EXTENSION-RESTING: it
//   rests on the extension, i.e. it would NOT confirm under a strict
//   variant that treats any second above-level evening as recovery.
'use strict';

const { analyzeSeed3, isHairlineOnly } = require('./analyze-dipslide3-b');

const RECOVERY_HORIZON = 10;

// Classify a confirming window's above-level shape. win: [{loopDay,
// pantryKcal}] for D+1..D+5 (from analyzeSeed3 confirmingWindow); level L.
function classifyWindowShape(win, level) {
  if (typeof level !== 'number') return { shape: 'other', aboveCount: 0, aboveDays: [] };
  const above = [];
  for (const w of win || []) {
    if (w != null && typeof w.pantryKcal === 'number' && w.pantryKcal > level) above.push(w);
  }
  const aboveCount = above.length;
  if (aboveCount === 0) return { shape: 'clean', aboveCount: 0, aboveDays: [] };
  const allSubMargin = above.every((w) => w.pantryKcal < 1.05 * level);
  let hasConsecutiveAbove = false;
  for (let k = 0; k + 1 < above.length; k++) {
    if (above[k + 1].loopDay === above[k].loopDay + 1) { hasConsecutiveAbove = true; break; }
  }
  if (aboveCount === 1 && allSubMargin) return { shape: 'hairline', aboveCount: 1, aboveDays: above.map((w) => w.loopDay) };
  if (aboveCount >= 2 && allSubMargin && !hasConsecutiveAbove) {
    return { shape: 'separated', aboveCount, aboveDays: above.map((w) => w.loopDay) };
  }
  return { shape: 'other', aboveCount, aboveDays: above.map((w) => w.loopDay) };
}

// Post-confirmation recovery scan. series: [{loopDay, pantryKcal}] full
// evening series; confirmedDay C; candidate level L. Returns
// {recoveredWithin10, recoveryDay, observedEvenings, censored}.
function recoveryAfterConfirmation(series, confirmedDay, level) {
  const out = { recoveredWithin10: false, recoveryDay: null, observedEvenings: 0, censored: false };
  if (confirmedDay == null || typeof level !== 'number') return out;
  for (let d = confirmedDay + 1; d <= confirmedDay + RECOVERY_HORIZON; d++) {
    const row = (series || []).find((r) => r != null && r.loopDay === d);
    if (row == null || typeof row.pantryKcal !== 'number') continue;
    out.observedEvenings++;
    if (row.pantryKcal >= level) {
      out.recoveredWithin10 = true;
      out.recoveryDay = d;
      return out;
    }
  }
  out.censored = out.observedEvenings < RECOVERY_HORIZON;
  return out;
}

function analyzeSeedFalsefire(seedJson) {
  const a = analyzeSeed3(seedJson);
  const series = a.pantrySeries || [];
  let candidateLevel = null;
  if (a.candidateDay != null) {
    const row = series.find((r) => r != null && r.loopDay === a.candidateDay);
    if (row != null && typeof row.pantryKcal === 'number') candidateLevel = row.pantryKcal;
  }
  const shape = a.confirmedDay != null
    ? classifyWindowShape(a.confirmingWindow, candidateLevel)
    : { shape: null, aboveCount: 0, aboveDays: [] };
  const separatedWiggle = shape.shape === 'separated';
  // Descriptive: all eligible in-run candidates that confirm under the
  // tolerance rule with a separated-wiggle window shape. (Recomputed from
  // the seed's own rows via analyzeSeed3's window logic is not exported,
  // so this is derived from the first-confirming candidate only when it
  // is the separated one; the full-candidate list is reported via the
  // dipslide3 fields restoredByTolerance/eligibleCandidatesInRun.)
  const recovery = a.confirmedDay != null
    ? recoveryAfterConfirmation(series, a.confirmedDay, candidateLevel)
    : { recoveredWithin10: false, recoveryDay: null, observedEvenings: 0, censored: false };
  let fireClass = null; // null = no confirmed fire in final run
  let fireReason = null;
  if (a.confirmedDay != null) {
    if (a.collapsed) { fireClass = 'true'; fireReason = 'collapsed'; }
    else if (recovery.recoveredWithin10) { fireClass = 'false'; fireReason = 'quick-recovery'; }
    else { fireClass = 'true'; fireReason = 'sustained-slide'; }
  }
  // Old definition, for comparison reporting only (never a bar here):
  const oldFalseFire = a.falseFire; // survived + confirmedDay in final run
  return Object.assign({}, a, {
    candidateLevel,
    windowShape: shape.shape,
    windowAboveDays: shape.aboveDays,
    windowAboveCount: shape.aboveCount,
    separatedWiggle,
    extensionResting: separatedWiggle, // first-confirming candidate rests on the extension
    recoveryWithin10: recovery.recoveredWithin10,
    recoveryDay: recovery.recoveryDay,
    recoveryObservedEvenings: recovery.observedEvenings,
    recoveryCensored: recovery.censored,
    fireClass, fireReason,
    oldFalseFire,
  });
}

function summarizeFalsefire(allSeeds) {
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeedFalsefire(sj);
    // Sense lines: reuse dipslide3's extractor via analyzeSeed3 path is
    // inside analyzeSeedFalsefire's base; attach sense from the raw seed
    // the same way summarize3 does.
    const fullLines = [];
    let potLine = null;
    for (const s of (sj.sayLines || [])) {
      const line = s.line || '';
      if (/shelves are full|full to bursting|Full shelves/i.test(line)) fullLines.push({ day: s.day, line });
      if (/pot stays full/i.test(line) && potLine == null) potLine = { day: s.day, line };
    }
    a.sense = { fullLines, potLine };
    return a;
  });
  const confirmed = seeds.filter((s) => s.confirmedDay != null);
  const falseSeeds = confirmed.filter((s) => s.fireClass === 'false');
  const trueSeeds = confirmed.filter((s) => s.fireClass === 'true');
  const censoredTrue = trueSeeds.filter((s) => s.recoveryCensored);
  const extensionResting = confirmed.filter((s) => s.extensionResting);
  const survivedWithRun = seeds.filter((s) => s.censusValid && s.survived && s.finalRun != null);
  const oldFalse = survivedWithRun.filter((s) => s.oldFalseFire);
  const med = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  return {
    seeds,
    bars: {
      confirmedCount: confirmed.length,
      confirmedSeeds: confirmed.map((s) => s.seed),
      falseCount: falseSeeds.length,
      falseSeeds: falseSeeds.map((s) => s.seed),
      trueCount: trueSeeds.length,
      trueSeeds: trueSeeds.map((s) => s.seed),
      censoredTrueSeeds: censoredTrue.map((s) => s.seed),
      // JUDGED rate (prereg, conservative): censored true fires are
      // excluded from BOTH numerator and denominator — dropping true
      // cases can only raise the false rate, so a pass is not bought
      // with thin observations. observedRate counts them as true.
      newFalseFireRate: (confirmed.length - censoredTrue.length) === 0
        ? { judged: false, rate: null, pass: null,
            observedRate: confirmed.length === 0 ? null : falseSeeds.length / confirmed.length }
        : { judged: true,
            rate: falseSeeds.length / (confirmed.length - censoredTrue.length),
            observedRate: falseSeeds.length / confirmed.length,
            pass: (falseSeeds.length / (confirmed.length - censoredTrue.length)) <= 0.25 },
      extensionRestingCount: extensionResting.length,
      extensionRestingSeeds: extensionResting.map((s) => s.seed),
      sensitivityExcludingExtension: confirmed.length - extensionResting.length,
      hairlineOnlyCount: confirmed.filter((s) => s.hairlineOnly).length,
      hairlineOnlySeeds: confirmed.filter((s) => s.hairlineOnly).map((s) => s.seed),
      oldFalseFireRate: survivedWithRun.length === 0
        ? { judged: false, rate: null }
        : { judged: true, rate: oldFalse.length / survivedWithRun.length,
            falseSeeds: oldFalse.map((s) => s.seed), sCount: survivedWithRun.length },
      collapseEarliness: seeds.filter((s) => s.censusValid && s.collapsed).length === 0
        ? { judged: false, pass: null, collapsedSeeds: [] }
        : { judged: true,
            pass: seeds.filter((s) => s.censusValid && s.collapsed)
              .some((s) => s.earliness != null && s.earliness >= 3),
            collapsedSeeds: seeds.filter((s) => s.censusValid && s.collapsed)
              .map((s) => ({ seed: s.seed, confirmedDay: s.confirmedDay, levelStandDown: s.levelStandDown, earliness: s.earliness })) },
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
    process.stdout.write(JSON.stringify(summarizeFalsefire(seeds), null, 2) + '\n');
  });
}

module.exports = { RECOVERY_HORIZON, classifyWindowShape, recoveryAfterConfirmation, analyzeSeedFalsefire, summarizeFalsefire };
