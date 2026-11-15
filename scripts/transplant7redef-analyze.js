// transplant7redef-analyze.js — analyzer for the REDEFINED family-7
// ablation (arm sim-transplant7redef-a). The culpritbisect analyzer
// hardcodes SEEDS 190391-190398 (the matched band), so it cannot read a
// fresh band; this analyzer takes STEP + SEEDS from the environment and
// otherwise reuses the shared module (masterregress-analyze-20261113,
// SC.analyzeRows) so the per-seed fields, wall, death causes, and
// instrument errors are computed identically to every bisect leg.
//
// Reads one step's 8 per-seed JSONs (seeds from SEEDS env) from
// evidence/2026-11-13/perseed-culpritbisect-a-<step>/ and classifies
// the leg (the bisect classifier reused as a leg classifier):
//   survived >= 3 -> GOOD
//   survived <= 1 -> BAD
//   survived == 2 -> AMBIGUOUS (re-run once per the prereg; the
//     transplant verdict is the subject-minus-baseline DELTA, judged
//     by the proof — NOT by this analyzer)
// RANK READ (same bands as r10/masterregress):
//   >=5/8 regional -> REGIONAL_INTACT; <=2/8 -> RANK_STALL;
//   3-4/8 -> RANK_INCONCLUSIVE
// SECONDARY (reported, not judged): median survival; death-cause
// shares; wave 4-5 unlocks; national/table/wins; standing range;
// tribute-ready; blooded count.
// Exit 0 on a classified outcome with a complete corpus and 0
// instrument errors; exit 1 on corpus incompleteness, instrument
// failure, or an unclassifiable read. The verdict is the
// classification — never re-scored.
// Usage: STEP=t7redef-23245d5d6 SEEDS=190581,190582,190583,190584,190585,190586,190587,190588 node scripts/transplant7redef-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STEP = process.env.STEP || '';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const RUN = 'culpritbisect-pilot';
const SC = require('./masterregress-analyze-20261113');

function dirFor(step) { return path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + step); }
function perSeedFile(seed, step) {
  return path.join(dirFor(step), 'culpritbisect-s' + seed + '-' + RUN + '-fix.json');
}

function classifyStep(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 3) return 'GOOD';
  if (n <= 1) return 'BAD';
  return 'AMBIGUOUS';
}

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
  if (!step) {
    console.error('transplant7redef: STEP is required');
    process.exit(1);
  }
  if (SEEDS.length !== 8) {
    console.error('transplant7redef: SEEDS must name exactly 8 seeds (got ' + SEEDS.length + ')');
    process.exit(1);
  }
  const corpus = loadCorpus(SEEDS, step);
  if (!corpus.complete) {
    console.error('transplant7redef ' + step + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = SC.analyzeRows(corpus.rows);
  const verdict = classifyStep(analysis.survived);
  const rankVerdict = classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  const summary = {
    step: step, seeds: SEEDS, run: RUN,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: verdict,
    rankVerdict: rankVerdict,
    classifiable: ok,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + step + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('transplant7redef ' + step + ': ' + verdict + ' (survived ' + analysis.survived + '/8)');
  console.log('  rank: ' + rankVerdict + ' (regional ' + analysis.wall.regional + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!ok) process.exit(1);
  if (analysis.instrumentErrors !== 0) process.exit(1);
  return { step: step, complete: true, survived: analysis.survived, verdict: verdict, rankVerdict: rankVerdict, classifiable: ok, instrumentErrors: analysis.instrumentErrors, summary: summary };
}

if (require.main === module) {
  try {
    analyzeStep(STEP);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports = { analyzeStep: analyzeStep, classifyStep: classifyStep, classifyRegional: classifyRegional, loadCorpus: loadCorpus, dirFor: dirFor, perSeedFile: perSeedFile };
