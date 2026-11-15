// culpritbisect-analyze-guardablate-fresh-20261115.js — analyzer for
// the FRESH-BAND guardablate arm (sim-guardablate-fresh-a). Identical
// mechanics to culpritbisect-analyze-20261115.js (same SC.analyzeRows,
// same classifyStep raw labels GOOD >= 3 / BAD <= 1 / AMBIGUOUS = 2,
// same rank read) but on the fresh band 190631–190638 with corpora
// under evidence/2026-11-15/perseed-guardablate-fresh-<step>/. The raw
// labels are INSTRUMENT labels only: the fresh verdict (CONFIRMED /
// REFUTED / AMBIGUOUS, revised bar S <= B-3 / S >= B-1) is judged
// RELATIVE to the fresh-band baseline leg in the prereg
// (evidence/2026-11-15/sim-guardablate-fresh-a-prereg.md) — the
// analyzer never re-scores. The endpoints block records the
// matched-band guardablate-a references, not this band's numbers: the
// fresh baseline's own per-seed days live in its step summary's
// perSeed.
//
// BISECT RULE (per step):
//   survived >= 3 -> GOOD (git bisect good)
//   survived <= 1 -> BAD (git bisect bad)
//   survived == 2 -> AMBIGUOUS (re-run once per the prereg; the
//     re-run decides, or the step is recorded AMBIGUOUS and the
//     bisect proceeds treating it as BAD)
// RANK READ (same bands as r10/masterregress):
//   >=5/8 regional -> REGIONAL_INTACT; <=2/8 -> RANK_STALL;
//   3–4/8 -> RANK_INCONCLUSIVE
// BOUNDARY JUDGE (judgeBoundary): the boundary pair (parent P,
// culprit C) plus their confirmation re-runs must reproduce the
// split (P >= 3/8, C <= 1/8 on both the step and the re-run) for
// GO-CULPRIT-COMMIT; anything else is NO-GO_BOUNDARY_NOT_REPRODUCED.
// Exit 0 on a classified outcome with a complete corpus and 0
// instrument errors; exit 1 on corpus incompleteness, instrument
// failure, or an unclassifiable read. The verdict is the
// classification — never re-scored.
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4–5 unlocks; national/table/wins; standing range;
// tribute-ready; blooded count.
// Usage: STEP=ep-tip-guardablate-fresh node scripts/culpritbisect-analyze-guardablate-fresh-20261115.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STEP = process.env.STEP || '';
const SEEDS = [190631, 190632, 190633, 190634, 190635, 190636, 190637, 190638];
const RUN = 'guardablate-fresh-pilot';
const SC = require('./masterregress-analyze-20261113');

function dirFor(step) { return path.join(REPO, 'evidence', '2026-11-15', 'perseed-guardablate-fresh-' + step); }
function perSeedFile(seed, step) {
  return path.join(dirFor(step), 'guardablate-fresh-s' + seed + '-' + RUN + '-fix.json');
}

function classifyStep(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 3) return 'GOOD';
  if (n <= 1) return 'BAD';
  return 'AMBIGUOUS';
}

function classifyRegional(n) { return SC.classifyRegional(n); }

// judgeBoundary(parentN, culpritN, parentReN, culpritReN): the
// boundary-pair confirmation rule from the prereg. Both the step
// reads and the confirmation re-runs must show the split.
function judgeBoundary(parentN, culpritN, parentReN, culpritReN) {
  const ns = [parentN, culpritN, parentReN, culpritReN];
  if (ns.some(function (n) { return typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8; })) return 'UNCLASSIFIABLE';
  if (parentN >= 3 && culpritN <= 1 && parentReN >= 3 && culpritReN <= 1) return 'GO-CULPRIT-COMMIT';
  return 'NO-GO_BOUNDARY_NOT_REPRODUCED';
}

function loadCorpus(seeds, step) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, step);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function analyzeStep(step) {
  const corpus = loadCorpus(SEEDS, step);
  if (!corpus.complete) {
    console.error('guardablate-fresh ' + step + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    return { step: step, complete: false, missing: corpus.missing };
  }
  const analysis = SC.analyzeRows(corpus.rows);
  const verdict = classifyStep(analysis.survived);
  const rankVerdict = classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  const summary = {
    step: step, seeds: SEEDS, run: RUN,
    endpoints: {
      // Matched-band references only — NOT this band's numbers.
      // The fresh-band baseline's own per-seed days live in the
      // baseline step summary's perSeed (step ep-tip-guardablate-fresh).
      // 1715Z guardablate-a on the matched band 190391-190398:
      // baseline 4/8 (tip 53e7b6a1e), subject 1/8 — AMBIGUOUS under the
      // frozen bar, CONFIRMED under this arm's revised bar (1 <= 4-3).
      matchedBaseline: { survived: 4, base: '53e7b6a1e', band: '190391-190398', note: 'matched-band baseline (reference only)' },
      matchedSubject: { survived: 1, base: 'transplant-guardablate-subject', band: '190391-190398', note: 'matched-band subject (reference only)' },
    },
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: verdict,
    rankVerdict: rankVerdict,
    classifiable: ok,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-15', 'guardablate-fresh-' + step + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('guardablate-fresh ' + step + ': ' + verdict + ' (survived ' + analysis.survived + '/8)');
  console.log('  rank: ' + rankVerdict + ' (regional ' + analysis.wall.regional + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  return { step: step, complete: true, survived: analysis.survived, verdict: verdict, rankVerdict: rankVerdict, classifiable: ok, instrumentErrors: analysis.instrumentErrors, summary: summary };
}

function main() {
  if (!STEP) {
    console.error('guardablate-fresh: STEP required (ep-tip-guardablate-fresh | tguardablate-fresh | tguardablate-fresh-r).');
    process.exit(2);
  }
  const res = analyzeStep(STEP);
  if (!res.complete) process.exit(1);
  if (!res.classifiable || res.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN,
  classifyStep: classifyStep, classifyRegional: classifyRegional,
  judgeBoundary: judgeBoundary, loadCorpus: loadCorpus,
  analyzeStep: analyzeStep, perSeedFile: perSeedFile, dirFor: dirFor,
};
