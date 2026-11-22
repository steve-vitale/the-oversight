// test-killrate-analysis-a.js — tally + sizing for arm sim-killrate-a.
//   node scripts/test-killrate-analysis-a.js            (unit checks + prior-band regression)
//   node scripts/test-killrate-analysis-a.js --dir <corpusDir>
//       prints the tier tally for a killlootbundle-a corpus as JSON.
// A drop's lootTier IS its roll tier: the tier-4 pool is never empty, so no
// fallback tier can occur at tier 4, and lower-tier pools are never empty
// either. Reads only; never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const items = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'items.json'), 'utf8'));
const tierOf = {};
items.forEach(function (i) { tierOf[i.id] = i.lootTier || 1; });

function tallyDir(dir) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-(ctl|arm)\.json$/.test(f);
  });
  const perSeed = [];
  let total = 0, t4 = 0, sear = 0, errors = 0;
  const byTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const byItem = {};
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const ev = c.killLootEvents || [];
    let sT4 = 0, sSear = 0;
    ev.forEach(function (e) {
      const t = tierOf[e.dropId] || 0;
      total++;
      if (t >= 1 && t <= 4) byTier[t]++;
      if (t === 4) { t4++; sT4++; }
      if (e.dropId === 'searcaster') { sear++; sSear++; }
      byItem[e.dropId] = (byItem[e.dropId] || 0) + 1;
    });
    errors += (c.instrumentErrors || []).length;
    perSeed.push({ seed: c.seed, days: c.gameDays, won: !!c.won, maxWave: c.maxWave,
      standing: c.standing, scaleRank: c.scaleRank, drops: ev.length, t4: sT4, sear: sSear,
      errors: (c.instrumentErrors || []).length });
  });
  return { files: files.length, seeds: perSeed.map(function (s) { return s.seed; }),
    total: total, byTier: byTier, t4: t4, sear: sear, errors: errors,
    t4Rate: total ? t4 / total : null, searRate: total ? sear / total : null,
    dropsPerSeed: perSeed.length ? total / perSeed.length : null,
    byItem: byItem, perSeed: perSeed };
}

// Seeds for P(>=1 arrival in N seeds) >= 90%, given per-drop searcaster
// probability pDrop and drops per seed.
function sizeBand(pDrop, dropsPerSeed) {
  if (!(pDrop > 0) || !(dropsPerSeed > 0)) return null;
  const pSeed = 1 - Math.pow(1 - pDrop, dropsPerSeed);
  if (!(pSeed > 0) || pSeed >= 1) return null;
  return Math.ceil(Math.log(0.1) / Math.log(1 - pSeed));
}

// Poisson P(observing <= k arrivals | expected mean mu).
function poissonCdf(k, mu) {
  let term = Math.exp(-mu), sum = term;
  for (let i = 1; i <= k; i++) { term *= mu / i; sum += term; }
  return sum;
}

if (require.main === module) {
  const dirIdx = process.argv.indexOf('--dir');
  if (dirIdx !== -1) {
    const t = tallyDir(process.argv[dirIdx + 1]);
    t.sizedBandFromMeasured = (t.t4Rate != null && t.dropsPerSeed)
      ? sizeBand(t.t4Rate / 15, t.dropsPerSeed) : null;
    console.log(JSON.stringify(t, null, 2));
    process.exit(0);
  }
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
  // Sizing arithmetic on fixed inputs (prereg §2d).
  check('size: point prediction 0.29%/drop at 6.56/seed -> 120 seeds',
    sizeBand(0.002933, 6.56) === 120, 'got ' + sizeBand(0.002933, 6.56));
  check('size: lower range 0.08%/drop -> 439 seeds',
    sizeBand(0.0008, 6.56) === 439, 'got ' + sizeBand(0.0008, 6.56));
  check('size: upper range 0.60%/drop -> 59 seeds',
    sizeBand(0.006, 6.56) === 59, 'got ' + sizeBand(0.006, 6.56));
  check('size: null on zero rate', sizeBand(0, 6.56) === null);
  check('size: null on zero drops/seed', sizeBand(0.003, 0) === null);
  // Poisson consistency helper: 0 arrivals at expected 0.49 has P ≈ 61%.
  check('poisson: P(<=0 | mu=0.49) ≈ 0.61', approx(poissonCdf(0, 0.49), 0.613, 0.01),
    'got ' + poissonCdf(0, 0.49).toFixed(3));
  check('poisson: P(<=0 | mu=3) ≈ 0.05 (boundary)', approx(poissonCdf(0, 3), 0.0498, 0.002));
  // Prior-band regression: the tally logic must reproduce the known corpus.
  const prior = tallyDir(path.join(REPO, 'evidence', '2026-11-21', 'perseed-killloot16-a-ctl'));
  check('tally: prior ctl corpus has 16 files', prior.files === 16, 'got ' + prior.files);
  check('tally: prior ctl drops = 105', prior.total === 105, 'got ' + prior.total);
  check('tally: prior ctl tier mix 18/61/21/5',
    prior.byTier[1] === 18 && prior.byTier[2] === 61 && prior.byTier[3] === 21 && prior.byTier[4] === 5,
    JSON.stringify(prior.byTier));
  check('tally: prior ctl tier-4 = 5 (4.76%)', prior.t4 === 5 && approx(prior.t4Rate, 5 / 105));
  check('tally: prior ctl searcaster = 0', prior.sear === 0);
  check('tally: prior ctl instrument errors = 0', prior.errors === 0);
  check('tally: prior drops/seed = 6.56', approx(prior.dropsPerSeed, 105 / 16));
  console.log('TEST-KILLRATE-ANALYSIS-A: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

module.exports = { tallyDir: tallyDir, sizeBand: sizeBand, poissonCdf: poissonCdf };
