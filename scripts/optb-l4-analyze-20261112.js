// optb-l4-analyze-20261112.js — analyzer for the L4 `grants` leg
// (arm sim-optb-l4-a). Reuses the parent analyzer's counting code
// (scripts/optb-rederive-analyze-20261112.js required as a module:
// loadCorpus / analyzeRows / classifyRegional) but applies THIS
// arm's decision rule from evidence/2026-11-12/
// sim-optb-l4-a-prereg.md — NOT the parent arm's rule. The parent
// rule (>=5/8 -> HEALTHY_POLE_REDERIVED) judged the FIRST leg to
// reach 5/8; L3 already holds 5/8, so a tie is no progress for L4:
//
//   >=6/8 survive -> HEALTHY_POLE_MATCH (matches the vetphantom
//                     pole's 6/8 exactly; a second route to the same
//                     count — it does NOT displace L3)
//   5/8 survive   -> NO_GO (tie with tendexact)
//   <=4/8 survive -> NO_GO
//
// Rank read (same as the parent arm):
//   >=5/8 regional -> REGIONAL_INTACT
//   <=2/8 regional -> RANK_STALL
//   3-4/8 regional -> RANK_INCONCLUSIVE
//
// The parent analyzer's main() is NOT run for this leg: a summary
// carrying the parent's verdict label would contradict this prereg
// at 5/8. Reads the 8 per-seed JSONs (seeds 190391-190398) from
// evidence/2026-11-12/perseed-optb-rederive-a-grants/ and writes
// evidence/2026-11-12/optb-l4-a-grants-summary.json. Exit 0 on a
// classified outcome with a complete corpus and 0 instrument errors;
// exit 1 on corpus incompleteness, instrument failure, or an
// unclassifiable read.
// Usage: node scripts/optb-l4-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PARENT = require(path.join(__dirname, 'optb-rederive-analyze-20261112'));
const LEG = 'grants';
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-optb-rederive-a-' + LEG);
const SEEDS = PARENT.SEEDS;
const RUN = PARENT.RUN;
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds
const VETPHANTOM_MEDIAN = 150;
const VETPHANTOM_REGIONAL = 8; // vetphantom fix leg: regional 8/8
const TENDEXACT_SURVIVED = 5; // parent L3 leg, same seeds
const FIRSTPARENT_SURVIVED = 4; // bisect-firstparent-a on 203a32775, same seeds

function classifyL4Survived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 6) return 'HEALTHY_POLE_MATCH';
  return 'NO_GO';
}

function judgeL4(analysis) {
  const verdict = classifyL4Survived(analysis.survived);
  const rankVerdict = PARENT.classifyRegional(analysis.wall.regional);
  const ok = verdict !== 'UNCLASSIFIABLE' && rankVerdict !== 'UNCLASSIFIABLE';
  return {
    verdict: verdict,
    rankVerdict: rankVerdict,
    tieWithTendexact: analysis.survived === TENDEXACT_SURVIVED,
    classifiable: ok,
  };
}

function main() {
  const corpus = PARENT.loadCorpus(SEEDS, DIR);
  if (!corpus.complete) {
    console.error('optb-l4-a-' + LEG + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = PARENT.analyzeRows(corpus.rows);
  const j = judgeL4(analysis);
  const summary = {
    leg: LEG,
    candidate: { commits: ['b6cf13684', 'a16ce1cc8'], label: 'r128 grant-rate dial + r131 cook/mend grants' },
    arm: 'optb-l4-a',
    prereg: 'evidence/2026-11-12/sim-optb-l4-a-prereg.md',
    seeds: SEEDS, run: RUN,
    base: '203a32775', healthyPole: '5157782a4',
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN, regional: VETPHANTOM_REGIONAL },
    tendexactLeg: { survived: TENDEXACT_SURVIVED, base: '203a32775' },
    firstparentLeg: { survived: FIRSTPARENT_SURVIVED, base: '203a32775' },
    standingFixSha: 'f8fda4295a99',
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    tieWithTendexact: j.tieWithTendexact,
    rankVerdict: j.rankVerdict,
    classifiable: j.classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'optb-l4-a-grants-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('optb-l4-a-' + LEG + ' (r128 grant-rate dial + r131 cook/mend grants): ' + j.verdict +
    (j.tieWithTendexact ? ' (tie with tendexact 5/8)' : '') +
    ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, tendexact ' + TENDEXACT_SURVIVED + '/8, firstparent ' + FIRSTPARENT_SURVIVED + '/8)');
  console.log('  rank: ' + j.rankVerdict + ' (regional ' + analysis.wall.regional + '/8 vs vetphantom ' + VETPHANTOM_REGIONAL + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!j.classifiable || analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  LEG: LEG, DIR: DIR, SEEDS: SEEDS, RUN: RUN,
  classifyL4Survived: classifyL4Survived,
  judgeL4: judgeL4,
  TENDEXACT_SURVIVED: TENDEXACT_SURVIVED,
  VETPHANTOM_SURVIVED: VETPHANTOM_SURVIVED,
  FIRSTPARENT_SURVIVED: FIRSTPARENT_SURVIVED,
};
