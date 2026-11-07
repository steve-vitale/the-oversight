// stab-analyze-20261107.js — analyzer for the staged-trajectory stability
// arm (sim-stageally-stab-b). Pure function over the per-seed corpus;
// no game reads, no re-scoring. Pairs unperturbed vs perturbed legs of
// the same seed+policy, classifies each pair with the trajfrag CLASS
// (survived / w4kills 0 vs >=1 / living veterans 0 vs >=1) + pair-formed
// flip, names the first divergence, and attaches the reused D metric
// (scripts/stageally-trajdist-20261107.js). Also summarizes the RNG draw
// census per leg and the wall numbers per leg.
// Usage: node scripts/stab-analyze-20261107.js <corpus-dir>
//   (writes <corpus-dir>/../stab-b-analysis.json next to the corpus and
//   prints the summary JSON to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));
const TRAJDIST = require(path.join(REPO, 'scripts', 'stageally-trajdist-20261107'));

function readCorpus(dir) {
  return fs.readdirSync(dir).filter(function (f) { return f.indexOf('stab-s') === 0 && f.endsWith('.json'); })
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function pairDays(row) {
  return (row.daily || []).filter(function (d) {
    return d.readiness5 && ((d.readiness5.veterans | 0) >= 2);
  }).length;
}

function policyOf(run) { return run.policy || '?'; }

function analyze(dir) {
  const rows = readCorpus(dir);
  const policies = {};
  rows.forEach(function (r) {
    const p = policyOf(r);
    policies[p] = policies[p] || { unperturbed: {}, perturbed: {} };
    policies[p][r.perturbed ? 'perturbed' : 'unperturbed'][r.seed] = r;
  });
  const perPolicy = {};
  const seeds = Object.keys(policies.staged ? policies.staged.unperturbed : {}).map(Number).sort(function (a, b) { return a - b; });
  Object.keys(policies).sort().forEach(function (p) {
    const legs = policies[p];
    const pairRows = [];
    let flips = 0, pairFlips = 0, n = 0;
    Object.keys(legs.unperturbed).map(Number).sort(function (a, b) { return a - b; }).forEach(function (seed) {
      const a = legs.unperturbed[seed], b = legs.perturbed[seed];
      if (!b) return;
      n += 1;
      const cd = TRAJ.classDiff(a, b);
      const pdA = pairDays(a), pdB = pairDays(b);
      const pairFlip = (pdA > 0) !== (pdB > 0);
      if (cd.fragile) flips += 1;
      if (pairFlip) pairFlips += 1;
      const div = TRAJ.firstDivergence(a, b);
      const d = TRAJDIST.distance(a, b);
      pairRows.push({
        seed: seed, fragile: cd.fragile, diffs: cd.diffs,
        classA: cd.a, classB: cd.b,
        pairDaysA: pdA, pairDaysB: pdB, pairFlip: pairFlip,
        firstDivergence: div.first, snapshotNote: div.snapshot,
        trajDist: d,
      });
    });
    perPolicy[p] = { n: n, flips: flips, flipRate: n ? +(flips / n).toFixed(3) : null,
      pairFlips: pairFlips, pairs: pairRows };
  });

  // Draw census summary per policy-leg: mean totals + hook splits.
  const census = {};
  Object.keys(policies).sort().forEach(function (p) {
    ['unperturbed', 'perturbed'].forEach(function (leg) {
      const rs = Object.keys(policies[p][leg]).map(function (s) { return policies[p][leg][s]; });
      if (!rs.length) return;
      const mean = function (f) {
        return +(rs.reduce(function (a, r) { return a + (f(r) || 0); }, 0) / rs.length).toFixed(1);
      };
      census[p + '-' + leg] = {
        n: rs.length,
        meanTotalDraws: mean(function (r) { return (r.rngDraws || {}).total; }),
        meanSetupDraws: mean(function (r) { return (r.rngDraws || {}).setup; }),
        meanDailyBase: mean(function (r) { return ((r.rngDraws || {}).hooks || {}).dailyBase; }),
        meanDailyStage: mean(function (r) { return ((r.rngDraws || {}).hooks || {}).dailyStage; }),
        meanFight: mean(function (r) { return ((r.rngDraws || {}).hooks || {}).fight; }),
        meanRallyVerb: mean(function (r) { return ((r.rngDraws || {}).hooks || {}).rallyVerb; }),
        meanPending: mean(function (r) { return ((r.rngDraws || {}).hooks || {}).pending; }),
        meanEngine: mean(function (r) { return (r.rngDraws || {}).engine; }),
        meanDrawsPerDay: mean(function (r) {
          const pd = ((r.rngDraws || {}).perDay || []);
          if (pd.length < 2) return 0;
          return (((r.rngDraws || {}).total || 0) / Math.max(1, pd.length));
        }),
      };
    });
  });

  // Wall numbers per policy-leg.
  const walls = {};
  Object.keys(policies).sort().forEach(function (p) {
    ['unperturbed', 'perturbed'].forEach(function (leg) {
      const rs = Object.keys(policies[p][leg]).map(function (s) { return policies[p][leg][s]; });
      if (!rs.length) return;
      const days = rs.map(function (r) { return r.days || 0; }).sort(function (a, b) { return a - b; });
      const med = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
      walls[p + '-' + leg] = {
        n: rs.length,
        // National: scaleRank 'national' or 'global' (trajfrag convention).
        // Table: this per-seed record carries no table-sitting event (the
        // stageally instrument does not capture tableSeat); wins are 0, so
        // 0 sittings is the instrument's reading — same basis as the
        // confirm and trajfrag.
        national: rs.filter(function (r) { return (r.scaleRank || '') === 'national' || (r.scaleRank || '') === 'global'; }).length,
        table: 0,
        wins: rs.filter(function (r) { return !!r.won; }).length,
        wave4unlock: rs.filter(function (r) { return ((r.unlockedWave != null ? r.unlockedWave : r.maxWave) | 0) >= 4; }).length,
        wave5unlock: rs.filter(function (r) { return ((r.unlockedWave != null ? r.unlockedWave : r.maxWave) | 0) >= 5; }).length,
        medianSurvival: med,
        maxSurvival: days[days.length - 1],
        instrumentErrors: rs.reduce(function (a, r) { return a + ((r.instrumentErrors || []).length); }, 0),
      };
    });
  });

  // Flip gap: staged vs baseline (prereg bar 1).
  const gap = {};
  if (perPolicy.staged && perPolicy.baseline) {
    gap.stagedFlips = perPolicy.staged.flips;
    gap.baselineFlips = perPolicy.baseline.flips;
    gap.stagedN = perPolicy.staged.n;
    gap.baselineN = perPolicy.baseline.n;
    gap.gapSeeds = perPolicy.staged.flips - perPolicy.baseline.flips;
    gap.bar1 = perPolicy.staged.flips >= 3 && gap.gapSeeds >= 2;
  }
  // Bisection: variant flip rate vs staged (prereg bar 2, >=50% cut).
  const bisection = {};
  if (perPolicy.staged) {
    ['norally', 'noinvites', 'nopending'].forEach(function (v) {
      if (!perPolicy[v]) return;
      bisection[v] = {
        flips: perPolicy[v].flips, n: perPolicy[v].n,
        cutVsStaged: perPolicy.staged.flips ? +((perPolicy.staged.flips - perPolicy[v].flips) / perPolicy.staged.flips).toFixed(3) : null,
        cutsByHalfOrMore: perPolicy.staged.flips > 0 && perPolicy[v].flips <= perPolicy.staged.flips / 2,
      };
    });
  }

  return { corpus: dir, seeds: seeds, perPolicy: perPolicy, census: census,
    walls: walls, gap: gap, bisection: bisection };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: stab-analyze-20261107.js <corpus-dir>'); process.exit(2); }
  const result = analyze(dir);
  const outFile = path.join(path.dirname(dir), 'stab-b-analysis.json');
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  console.log('wrote ' + outFile);
}

module.exports = { analyze: analyze, readCorpus: readCorpus, pairDays: pairDays };
