// test-killarrive-b.js — arm sim-killarrive-b: the 49-seed kill-loot
// searcaster arrival band (killrate-a sizing, run on current master).
//   node scripts/test-killarrive-b.js            (pre-run checks: frozen
//       band, sizing arithmetic, Poisson judgment helper)
//   node scripts/test-killarrive-b.js --dir <corpusDir>
//       corpus validation: 49 files, one shared anchor, policySha
//       matches scripts/policies/competent.js, 0 instrument errors,
//       tier tally + Poisson read printed as JSON.
// Reads only; never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const { tallyDir, sizeBand, poissonCdf } = require(path.join(REPO, 'scripts', 'test-killrate-analysis-a'));

// Frozen from the prereg.
const BAND_START = 107533;
const BAND_END = 107581;
const BAND_N = 49;
// Reserved ranges the band must not overlap (prereg §4).
const RESERVED = [
  [107501, 107516, 'journey-endgame-r270 (107501-107508) / Loop A original'],
  [107517, 107532, 'Loop A sim-launchsilence-a (moved band)'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107313, 107320, 'sim-killrate-a'],
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
];
// Pooled measured rate (killrate-a §5): tier-4 8.81% of drops, 1/15
// searcaster per tier-4 roll, 8.04 drops/seed.
const POOLED_T4_RATE = 17 / 193;
const POOLED_DROPS_PER_SEED = 8.04;
const P_DROP_SEAR = POOLED_T4_RATE / 15;
const P_SEED_ARRIVAL = 1 - Math.pow(1 - P_DROP_SEAR, POOLED_DROPS_PER_SEED);
const MU_49 = BAND_N * P_SEED_ARRIVAL; // expected arrivals on the band

// Two-sided Poisson consistency at alpha = 0.05 (prereg bar 3).
function poissonConsistent(k, mu) {
  const lo = poissonCdf(k, mu);
  // P(X >= k) = 1 - P(X <= k-1); for k = 0 it is 1.
  const hi = (k <= 0) ? 1 : (1 - poissonCdf(k - 1, mu));
  return { consistent: lo >= 0.025 && hi >= 0.025, pLe: lo, pGe: hi };
}

function validateCorpus(dir) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-ctl\.json$/.test(f);
  });
  const policySha = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'))
    .digest('hex').slice(0, 12);
  const anchors = {};
  const seeds = [];
  let errors = 0;
  let missingPolicySha = 0;
  let missingAnchor = 0;
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(c.seed);
    errors += (c.instrumentErrors || []).length;
    if (!c.anchorCommit) missingAnchor++;
    else anchors[c.anchorCommit] = (anchors[c.anchorCommit] || 0) + 1;
    if (c.policySha !== policySha) missingPolicySha++;
  });
  const tally = tallyDir(dir);
  const mu = tally.dropsPerSeed
    ? tally.files * (1 - Math.pow(1 - P_DROP_SEAR, tally.dropsPerSeed)) : null;
  const read = (mu != null) ? poissonConsistent(tally.sear, mu) : null;
  return {
    files: files.length, seeds: seeds, policySha: policySha,
    anchors: anchors, missingAnchor: missingAnchor,
    policyShaMismatches: missingPolicySha, instrumentErrors: errors,
    tally: { total: tally.total, t4: tally.t4, t4Rate: tally.t4Rate,
      sear: tally.sear, dropsPerSeed: tally.dropsPerSeed,
      sizedBandFromMeasured: tally.sizedBandFromMeasured },
    poisson: read ? { mu: mu, k: tally.sear, pLe: read.pLe, pGe: read.pGe,
      consistent: read.consistent } : null,
  };
}

if (require.main === module) {
  const dirIdx = process.argv.indexOf('--dir');
  if (dirIdx !== -1) {
    const v = validateCorpus(process.argv[dirIdx + 1]);
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === BAND_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.seeds.length === BAND_N
      && v.seeds.every(function (s, i) { return s === BAND_START + i; });
    console.log('TEST-KILLARRIVE-B-CORPUS: ' + (ok ? 'PASS' : 'FAIL'));
    process.exit(ok ? 0 : 1);
  }
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
  // Frozen band.
  check('band: 49 contiguous seeds', BAND_END - BAND_START + 1 === BAND_N,
    BAND_START + '-' + BAND_END);
  check('band: starts at 107533 (above Loop A 107517-107532)',
    BAND_START === 107533);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return BAND_END < r[0] || BAND_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(BAND_END < r[0] || BAND_START > r[1]); })));
  // Sizing arithmetic on fixed inputs (killrate-a §5).
  check('size: pooled rate -> 49 seeds',
    sizeBand(P_DROP_SEAR, POOLED_DROPS_PER_SEED) === 49,
    'got ' + sizeBand(P_DROP_SEAR, POOLED_DROPS_PER_SEED));
  check('size: per-seed arrival ≈ 4.6%', approx(P_SEED_ARRIVAL, 0.046, 0.002),
    'got ' + P_SEED_ARRIVAL.toFixed(4));
  check('size: expected arrivals on 49 seeds ≈ 2.25', approx(MU_49, 2.25, 0.05),
    'got ' + MU_49.toFixed(2));
  // Poisson judgment helper (prereg §2, bar 3).
  check('poisson: P(0 | mu=2.25) ≈ 0.105', approx(poissonCdf(0, MU_49), 0.105, 0.005),
    'got ' + poissonCdf(0, MU_49).toFixed(3));
  check('poisson: 0 arrivals is consistent (two-sided)',
    poissonConsistent(0, MU_49).consistent === true);
  check('poisson: 2 arrivals is consistent (two-sided)',
    poissonConsistent(2, MU_49).consistent === true);
  check('poisson: 5 arrivals is consistent (two-sided)',
    poissonConsistent(5, MU_49).consistent === true);
  check('poisson: 9 arrivals is inconsistent (two-sided)',
    poissonConsistent(9, MU_49).consistent === false);
  check('poisson: P(<=2 | mu=2.25) ≈ 0.61',
    approx(poissonCdf(2, MU_49), 0.61, 0.02),
    'got ' + poissonCdf(2, MU_49).toFixed(3));
  console.log('TEST-KILLARRIVE-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

module.exports = { BAND_START: BAND_START, BAND_END: BAND_END, BAND_N: BAND_N,
  RESERVED: RESERVED, POOLED_T4_RATE: POOLED_T4_RATE,
  POOLED_DROPS_PER_SEED: POOLED_DROPS_PER_SEED, P_DROP_SEAR: P_DROP_SEAR,
  P_SEED_ARRIVAL: P_SEED_ARRIVAL, MU_49: MU_49,
  poissonConsistent: poissonConsistent, validateCorpus: validateCorpus };
