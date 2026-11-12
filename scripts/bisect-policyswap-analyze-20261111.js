// bisect-policyswap-analyze-20261111.js — analyzer for the
// survival-collapse BISECT POLICY-SWAP leg (arm
// sim-bisect-policyswap-a). Reads the 8 per-seed JSONs (seeds
// 190391–190398, the vetphantom band) from
// evidence/2026-11-11/perseed-bisect-policyswap-a/ and judges them
// against the prereg (evidence/2026-11-11/
// sim-bisect-policyswap-a-prereg.md).
//
// PRIMARY METRIC — survived count on 3f136f07e game code with the
// OLD (5157782a4) competent policy, vs the vetphantom fix leg's
// 6/8 (median 150d) and anchor-a's 1/8 (same code, NEW policy):
//   >=5/8 survive -> POLICY_HUNK_IMPLICATED (the garden reorder
//                     explains/contributes to the collapse)
//   <=2/8 survive -> POLICY_EXONERATED (collapse is game-code-only)
//   3–4/8 survive -> INCONCLUSIVE (a bigger band or a re-trace is owed)
// Any of the three is a classified outcome. Exit 0 on a classified
// outcome with a complete corpus and 0 instrument errors; exit 1 on
// corpus incompleteness, instrument failure, or an unclassifiable
// read. The verdict is the classification — never re-scored.
// SECONDARY (reported, not judged): median survival vs 150d;
// death-cause shares vs the combat-heavy profile; wave 4–5
// unlocks; national/table/wins; standing range; tribute-ready
// days (from the final instrument snapshot's tribute read + the
// driver's end tribute field). The in-use policy sha is checked
// per seed (all 8 must be the OLD policy sha).
// Usage: node scripts/bisect-policyswap-analyze-20261111.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-11', 'perseed-bisect-policyswap-a');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'bisect-policyswap-pilot';
const VETPHANTOM_SURVIVED = 6; // vetphantom fix leg, same seeds, old base + old policy
const VETPHANTOM_MEDIAN = 150;
const ANCHOR_A_SURVIVED = 1; // anchor-a, same seeds, 3f136f07e code + NEW policy
const EXPECTED_OLD_POLICY_SHA = '0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05';

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'bisect-policyswap-s' + seed + '-' + RUN + '-fix.json');
}

function classifySurvived(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 5) return 'POLICY_HUNK_IMPLICATED';
  if (n <= 2) return 'POLICY_EXONERATED';
  return 'INCONCLUSIVE';
}

function loadCorpus(seeds, dir) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, dir);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function deathCauseShares(rows) {
  const counts = {};
  let total = 0;
  for (const d of rows) {
    for (const death of (d.deaths || [])) {
      const c = death.cause || death.kind || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
      total++;
    }
  }
  return { total: total, counts: counts };
}

function analyzeRows(rows) {
  const perSeed = rows.map(function (d) {
    const daily = d.daily || [];
    const snap = daily.length ? daily[daily.length - 1] : null;
    return {
      seed: d.seed, anchorCommit: d.anchorCommit, standingFix: d.standingFix, standingSha: d.standingSha,
      policySha: d.policySha || null, policyVersion: d.policyVersion || null,
      policyOk: d.policySha === EXPECTED_OLD_POLICY_SHA,
      days: d.days, endReason: d.endReason, won: !!d.won, villageLost: !!d.villageLost,
      scaleRank: d.scaleRank, maxWave: d.maxWave, unlockedWave: d.unlockedWave,
      standing: d.standing, deaths: (d.deaths || []).length,
      endPantryKcal: d.endPantryKcal, blooded: !!d.blooded,
      tribute: d.tribute, ready4: d.ready4 ? d.ready4.veterans : null,
      ready5: d.ready5 ? d.ready5.veterans : null,
      ladderVets4: d.ladderVets4,
      errors: (d.instrumentErrors || []).length,
      snapshotCount: daily.length,
      finalSnapDay: snap ? snap.day : null,
    };
  });
  const survived = perSeed.filter(function (r) { return !r.villageLost; }).length;
  const wall = {
    wins: perSeed.filter(function (r) { return r.won; }).length,
    national: perSeed.filter(function (r) { return r.scaleRank === 'national'; }).length,
    table: perSeed.filter(function (r) { return r.scaleRank === 'table'; }).length,
    regional: perSeed.filter(function (r) { return r.scaleRank === 'regional'; }).length,
    village: perSeed.filter(function (r) { return r.scaleRank === 'village'; }).length,
    wave5: perSeed.filter(function (r) { return (r.maxWave || 1) >= 5; }).length,
    wave4: perSeed.filter(function (r) { return (r.maxWave || 1) >= 4; }).length,
    medianDays: median(perSeed.map(function (r) { return r.days; })),
    survived: survived,
    deaths: perSeed.reduce(function (a, r) { return a + r.deaths; }, 0),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  const policyOk = perSeed.every(function (r) { return r.policyOk; });
  return { perSeed: perSeed, survived: survived, wall: wall, causes: causes, instrumentErrors: instrumentErrors, policyOk: policyOk };
}

function judge(analysis) {
  const verdict = classifySurvived(analysis.survived);
  const ok = verdict !== 'UNCLASSIFIABLE' && analysis.policyOk;
  return { verdict: verdict, classifiable: ok };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('bisect-policyswap-a: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judge(analysis);
  const summary = {
    seeds: SEEDS, run: RUN,
    vetphantomFixLeg: { survived: VETPHANTOM_SURVIVED, medianDays: VETPHANTOM_MEDIAN },
    anchorALeg: { survived: ANCHOR_A_SURVIVED, base: '3f136f07e', policy: 'new' },
    policySwap: { policyVersion: '5157782a4-competent', policySha: EXPECTED_OLD_POLICY_SHA },
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    classifiable: j.classifiable,
    policyOk: analysis.policyOk,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-11', 'bisect-policyswap-a-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('bisect-policyswap-a: ' + j.verdict + ' (survived ' + analysis.survived + '/8 vs vetphantom fix leg ' + VETPHANTOM_SURVIVED + '/8, anchor-a ' + ANCHOR_A_SURVIVED + '/8)');
  console.log('  policy: all 8 seeds on old policy sha: ' + analysis.policyOk);
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors + ' policyOk ' + r.policyOk);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!j.classifiable || analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, DIR: DIR,
  classifySurvived: classifySurvived,
  loadCorpus: loadCorpus, analyzeRows: analyzeRows, judge: judge,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile,
  EXPECTED_OLD_POLICY_SHA: EXPECTED_OLD_POLICY_SHA,
};
