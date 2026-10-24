#!/usr/bin/env node
// govern-verdict.js — ONE governing verdict for paired rot-ratio summaries
// (sim-governverdict-b, 2026-10-24, oversight-flesh-out-loop-b, axis
// food-economy). Tooling/measurement only: zero src/js game-code changes.
//
// THE PROBLEM IT SOLVES: the leg-2 rot-drift work ended carrying two
// opposite verdicts on one corpus — the deciding per-seed median step
// said STEP CONFIRMED at preserver widening 75fdd9258 while the
// aggregate-sum, ratio-of-medians, and median-per-seed-step diagnostics
// said otherwise. A future deciding run must never have to carry two
// verdicts again, so this tool pre-registers ONE hierarchy and returns
// exactly ONE governing verdict label:
//
//   GOVERNING summary: per-seed median step G = M(commit) / M(parent),
//     where M(A) = median over seeds of r(A, s), and r(A, s) =
//     rot100d(A, pd1, s) / rot100d(A, pd0, s). It governs because it is
//     paired within seed (seed heterogeneity cancels), median-robust
//     (one high-rot seed cannot set it — the documented failure mode
//     of the aggregate), and it answers the "typical seed" question.
//   DIAGNOSTICS ONLY (never overturn the governing verdict): aggregate
//     sum step, ratio-of-medians step, median per-seed step. They are
//     printed in full, and they QUALIFY the verdict via the CONTESTED
//     flag — they never replace it.
//
// BANDS (identical for governing and diagnostics): STEP if step < 0.80;
// NO-STEP if step >= 0.90; INCONCLUSIVE if 0.80 <= step < 0.90.
// Banding uses full-precision floats; 3-decimal printing is display only.
//
// CONTESTED RULE: the verdict is CONTESTED iff ANY defined diagnostic's
// band differs from the governing class's band. CONTESTED annotates, it
// never replaces: "STEP (CONTESTED)" still claims the governing
// direction, but refuses to present it as clean. An UNDEFINED diagnostic
// never contests (reported UNDEFINED with its reason).
//
// TIE-BREAKS: boundary values are exact (0.80 -> INCONCLUSIVE, since
// STEP is strict < 0.80; 0.90 -> NO-STEP). Even-n medians are the mean of
// the two middle values after a NUMERIC sort (never a string sort —
// the leg2decide analyzer's display-sort bug class is rejected here).
// Degenerate per-seed steps (both ratios 0, or parent ratio 0 with
// commit ratio > 0) are EXCLUDED and counted, never imputed as 0 or 1
// (the leg2decide analyzer's 0.000 artifact for seed 9268 is rejected).
// A zero-denominator per-seed ratio (pd0 rot100d 0, or undefined cell)
// is EXCLUDED and counted, never imputed. If the governing median
// itself is undefined (M(parent) == 0, or zero included seeds), the
// verdict is INSUFFICIENT-DATA, uncontested.
//
// INPUT: JSON file holding either an array of records or
// {records: [...]}. Each record is one seed on BOTH anchors and BOTH
// sides: {seed, parent: {pd0: {rot, days}, pd1: {rot, days}},
// commit: {pd0: {rot, days}, pd1: {rot, days}}}, where rot =
// rotFreshKcal + rotPreservedKcal and days = daysAlive. Per-cell
// rot100d = rot / days * 100 (a days == 0 cell is undefined).
//
// CLI: node scripts/govern-verdict.js --input <file> [--pretty]
//   Prints the verdict object as JSON to stdout. Exit 0 on a verdict
//   (including INSUFFICIENT-DATA, which is a verdict, not an error).
//   Exit 2 (FATAL) on unreadable/invalid input: the tool must never
//   silently label a malformed corpus.
//   When required as a module, exports governVerdict(records, opts),
//   median(values), classifyStep(step), and BANDS.
'use strict';
const fs = require('fs');

const BANDS = { stepBelow: 0.80, noStepAt: 0.90 };

function isFiniteNum(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

// Numeric median. Even n -> mean of the two middle values. Returns
// null when the input has no finite values. The sort comparator is
// numeric on purpose: a default (string) sort would order 14.960
// before 2.977 and corrupt every downstream median/quartile.
function median(values) {
  const xs = values.filter(isFiniteNum).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  if (xs.length % 2 === 1) return xs[mid];
  return (xs[mid - 1] + xs[mid]) / 2;
}

function classifyStep(step) {
  if (step === null || step === undefined) return 'UNDEFINED';
  if (step < BANDS.stepBelow) return 'STEP';
  if (step >= BANDS.noStepAt) return 'NO-STEP';
  return 'INCONCLUSIVE';
}

// One cell -> rot100d, or null when undefined (days missing/<=0, or
// rot/days not finite numbers).
function cellRot100d(cell) {
  if (!cell || !isFiniteNum(cell.rot) || !isFiniteNum(cell.days)) return null;
  if (cell.days <= 0) return null;
  return (cell.rot / cell.days) * 100;
}

function validateRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error('input records must be an array');
  }
  for (const rec of records) {
    if (!rec || typeof rec !== 'object' || !isFiniteNum(rec.seed)) {
      throw new Error('each record must be an object with a numeric seed');
    }
    for (const anchor of ['parent', 'commit']) {
      if (!rec[anchor] || typeof rec[anchor] !== 'object') {
        throw new Error(`record seed ${rec.seed}: missing anchor ${anchor}`);
      }
      for (const side of ['pd0', 'pd1']) {
        const cell = rec[anchor][side];
        if (cell !== undefined && cell !== null) {
          if (typeof cell !== 'object' || !isFiniteNum(cell.rot) || !isFiniteNum(cell.days)) {
            throw new Error(
              `record seed ${rec.seed} ${anchor}/${side}: cell must be {rot, days} numbers`
            );
          }
        }
      }
    }
  }
}

// Main entry: records -> full verdict object. Never throws on a
// well-formed corpus, however degenerate: degeneracy is a verdict
// (INSUFFICIENT-DATA) or a counted exclusion, never a crash.
function governVerdict(records, opts = {}) {
  validateRecords(records);
  const counts = {
    seeds: records.length,
    includedRatioSeeds: 0,
    excludedZeroDenominator: 0,
    excludedUndefinedCell: 0,
    degeneratePerSeedSteps: 0,
    identicalRatioSeeds: 0,
    movedDown: 0,
    movedUp: 0,
    denominatorDriven: 0,
    numeratorDriven: 0,
    mixedDriven: 0,
  };

  // Per-seed ratios, per anchor.
  const rParent = new Map(); // seed -> ratio or null (excluded)
  const rCommit = new Map();
  const perSeedSteps = [];
  const ratioPairs = []; // {seed, parent, commit, step|null} for the report
  for (const rec of records) {
    const ratioFor = (anchor) => {
      const pd0 = cellRot100d(rec[anchor].pd0);
      const pd1 = cellRot100d(rec[anchor].pd1);
      if (pd0 === null || pd1 === null) {
        counts.excludedUndefinedCell += 1;
        return null;
      }
      if (pd0 === 0) {
        counts.excludedZeroDenominator += 1;
        return null;
      }
      return pd1 / pd0;
    };
    const rp = ratioFor('parent');
    const rc = ratioFor('commit');
    rParent.set(rec.seed, rp);
    rCommit.set(rec.seed, rc);
    if (rp !== null && rc !== null) counts.includedRatioSeeds += 1;

    // Per-seed step, with degenerate exclusions (never imputed).
    let step = null;
    if (rp !== null && rc !== null) {
      if (rp === 0 && rc === 0) {
        counts.degeneratePerSeedSteps += 1;
      } else if (rp === 0 && rc > 0) {
        counts.degeneratePerSeedSteps += 1; // infinite step: excluded, counted
      } else {
        step = rc / rp;
        perSeedSteps.push(step);
        if (rc === rp) counts.identicalRatioSeeds += 1;
        else if (step < 1) {
          counts.movedDown += 1;
          // Sensitivity view (report-only): what drove the fall?
          const pd0p = cellRot100d(rec.parent.pd0);
          const pd0c = cellRot100d(rec.commit.pd0);
          const pd1p = cellRot100d(rec.parent.pd1);
          const pd1c = cellRot100d(rec.commit.pd1);
          const pd0Rose = pd0c > pd0p;
          const pd1Fell = pd1c < pd1p;
          if (pd0Rose && !pd1Fell) counts.denominatorDriven += 1;
          else if (pd1Fell && !pd0Rose) counts.numeratorDriven += 1;
          else counts.mixedDriven += 1;
        } else if (step > 1) {
          counts.movedUp += 1;
        } else {
          counts.identicalRatioSeeds += 1;
        }
      }
    }
    ratioPairs.push({ seed: rec.seed, parent: rp, commit: rc, step });
  }

  const mParent = median([...rParent.values()].filter((v) => v !== null));
  const mCommit = median([...rCommit.values()].filter((v) => v !== null));
  counts.medianParentN = [...rParent.values()].filter((v) => v !== null).length;
  counts.medianCommitN = [...rCommit.values()].filter((v) => v !== null).length;
  const governingStep =
    mParent === null || mCommit === null
      ? null
      : mParent === 0
        ? null // governing median zero: no step can be formed
        : mCommit / mParent;

  // Aggregate step: sums over defined cells only.
  const aggRatioFor = (anchor) => {
    let rot1 = 0, days1 = 0, rot0 = 0, days0 = 0, ok1 = false, ok0 = false;
    for (const rec of records) {
      const c1 = rec[anchor].pd1;
      const c0 = rec[anchor].pd0;
      if (c1 && isFiniteNum(c1.rot) && isFiniteNum(c1.days) && c1.days > 0) {
        rot1 += c1.rot; days1 += c1.days; ok1 = true;
      }
      if (c0 && isFiniteNum(c0.rot) && isFiniteNum(c0.days) && c0.days > 0) {
        rot0 += c0.rot; days0 += c0.days; ok0 = true;
      }
    }
    if (!ok1 || !ok0 || days1 === 0 || days0 === 0) return null;
    const agg1 = (rot1 / days1) * 100;
    const agg0 = (rot0 / days0) * 100;
    if (agg0 === 0) return null;
    return agg1 / agg0;
  };
  const aggParent = aggRatioFor('parent');
  const aggCommit = aggRatioFor('commit');
  const aggregateStep =
    aggParent === null || aggCommit === null || aggParent === 0
      ? null
      : aggCommit / aggParent;

  // Ratio-of-medians step: medians of per-cell rot100d per side.
  const romRatioFor = (anchor) => {
    const pd1s = [];
    const pd0s = [];
    for (const rec of records) {
      const v1 = cellRot100d(rec[anchor].pd1);
      const v0 = cellRot100d(rec[anchor].pd0);
      if (v1 !== null) pd1s.push(v1);
      if (v0 !== null) pd0s.push(v0);
    }
    const med1 = median(pd1s);
    const med0 = median(pd0s);
    if (med1 === null || med0 === null || med0 === 0) return null;
    return med1 / med0;
  };
  const romParent = romRatioFor('parent');
  const romCommit = romRatioFor('commit');
  const ratioOfMediansStep =
    romParent === null || romCommit === null || romParent === 0
      ? null
      : romCommit / romParent;

  const medianPerSeedStep = median(perSeedSteps);

  const diagnostics = {
    aggregateStep,
    aggregateClass: classifyStep(aggregateStep),
    ratioOfMediansStep,
    ratioOfMediansClass: classifyStep(ratioOfMediansStep),
    medianPerSeedStep,
    medianPerSeedClass: classifyStep(medianPerSeedStep),
  };

  let governingClass;
  let contested = false;
  let label;
  if (governingStep === null) {
    governingClass = 'INSUFFICIENT-DATA';
    label = 'INSUFFICIENT-DATA';
  } else {
    governingClass = classifyStep(governingStep);
    // CONTESTED: any DEFINED diagnostic in a different band. An
    // UNDEFINED diagnostic never contests (tie-break 1).
    contested = [diagnostics.aggregateClass, diagnostics.ratioOfMediansClass,
      diagnostics.medianPerSeedClass].some(
      (c) => c !== 'UNDEFINED' && c !== governingClass
    );
    label = contested ? `${governingClass} (CONTESTED)` : governingClass;
  }

  return {
    verdict: label,
    governingClass,
    contested,
    governingStep,
    medianParent: mParent,
    medianCommit: mCommit,
    aggregateParent: aggParent,
    aggregateCommit: aggCommit,
    ratioOfMediansParent: romParent,
    ratioOfMediansCommit: romCommit,
    diagnostics,
    counts,
    perSeed: ratioPairs,
    bands: { ...BANDS },
  };
}

function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  if (inputIdx === -1 || !args[inputIdx + 1]) {
    console.error('FATAL: usage: node scripts/govern-verdict.js --input <file.json>');
    process.exit(2);
  }
  const file = args[inputIdx + 1];
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`FATAL: cannot read/parse input ${file}: ${e.message}`);
    process.exit(2);
  }
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  let result;
  try {
    result = governVerdict(records);
  } catch (e) {
    console.error(`FATAL: invalid input: ${e.message}`);
    process.exit(2);
  }
  const pretty = args.includes('--pretty');
  process.stdout.write(pretty ? JSON.stringify(result, null, 2) + '\n' : JSON.stringify(result) + '\n');
}

if (require.main === module) main();

module.exports = { governVerdict, median, classifyStep, BANDS };
