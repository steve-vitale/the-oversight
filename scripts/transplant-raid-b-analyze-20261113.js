// transplant-raid-b-analyze-20261113.js — analyzer for the H1 TRANSPLANT
// (arm sim-transplant-raid-b, family 2). Reads one step's 8 per-seed JSONs
// (seeds 190391–190398, the vetphantom band) from
// evidence/2026-11-13/perseed-transplant-raid-b-<step>/ and classifies
// the step against the transplant prereg
// (evidence/2026-11-13/sim-transplant-raid-b.md).
//
// TRANSPLANT RULE (per step, pre-registered):
//   survived >= 3 -> NOT-CARRIER (family alone does not collapse)
//   survived <= 1 -> CARRIER (family alone collapses the far end)
//   survived == 2 -> AMBIGUOUS (re-run once per the prereg; the
//     re-run decides, or the step is recorded AMBIGUOUS and treated
//     as NOT-CARRIER for ordering but kept on the suspect list)
// RANK READ (same bands as the bisect): >=5/8 regional ->
// REGIONAL_INTACT; <=2/8 -> RANK_STALL; 3–4/8 -> RANK_INCONCLUSIVE
// Exit 0 on a classified outcome with a complete corpus and 0
// instrument errors; exit 1 on corpus incompleteness, instrument
// failure, or an unclassifiable read. The verdict is the
// classification — never re-scored.
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4–5 unlocks; national/table/wins; standing range;
// tribute-ready; blooded count.
// Derived mechanically from scripts/culpritbisect-analyze-20261113.js.
// Usage: STEP=subject node scripts/transplant-raid-b-analyze-20261113.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STEP = process.env.STEP || '';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'transplant-raid-b-pilot';
const SC = require('./masterregress-analyze-20261113');

function dirFor(step) { return path.join(REPO, 'evidence', '2026-11-13', 'perseed-transplant-raid-b-' + step); }
function perSeedFile(seed, step) {
  return path.join(dirFor(step), 'transplant-raid-b-s' + seed + '-' + RUN + '-fix.json');
}

function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 3) return 'NOT-CARRIER';
  if (n <= 1) return 'CARRIER';
  return 'AMBIGUOUS';
}
// classifyStep kept as an alias for the shared classification table.
function classifyStep(n) { return classifyTransplant(n); }

function classifyRegional(n) { return SC.classifyRegional(n); }

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
    console.error('transplant-raid-b ' + step + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    return { step: step, complete: false, missing: corpus.missing };
  }
  const analysis = SC.analyzeRows(corpus.rows);
  const verdict = classifyTransplant(analysis.survived);
  const rankVerdict = classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  const summary = {
    step: step, seeds: SEEDS, run: RUN,
    endpoints: {
      far: { survived: 4, base: '203a32775', days: { 190391: 86, 190392: 144, 190393: 150, 190394: 43, 190395: 150, 190396: 87, 190397: 150, 190398: 150 } },
      merge: { survived: 1, base: 'e4dbe581b', days: { 190391: 103, 190392: 150, 190393: 115, 190394: 140, 190395: 76, 190396: 126, 190397: 115, 190398: 136 } },
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
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'transplant-raid-b-' + step + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('transplant-raid-b ' + step + ': ' + verdict + ' (survived ' + analysis.survived + '/8)');
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
    console.error('transplant-raid-b: STEP required.');
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
  classifyTransplant: classifyTransplant, classifyStep: classifyStep, classifyRegional: classifyRegional,
  loadCorpus: loadCorpus,
  analyzeStep: analyzeStep, perSeedFile: perSeedFile, dirFor: dirFor,
};
