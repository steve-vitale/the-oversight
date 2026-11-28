// build-winflee-b-panels.js — balanced-panel build for arm
// sim-winflee-b (DIAG: winnable-flee race — is the flee call, vs
// damage, the binding wall at the kill line? 150d horizon).
// Builds panels in the scripts/balance-panel.js schema from the
// winflee-b TB-leg per-seed JSONs: before = the calibration leg
// (emptybow armed TB corpus, band 112301-112308 — extracted from the
// held sim-emptybow-b branch; plain-master policy plus the emptybow
// fix) and after = this arm's fresh TB corpus (band 112401-112408,
// plain master). NOT paired seeds (different bands) — the panel here
// is the calibration-leg-vs-fresh-band instrument check, not a
// before/after verdict; the frozen prereg bars are the judge. Case
// identity is the seed (pseudo-policy 'winflee-b' in both panels;
// the corpus label lives in row.corpus).
// Contract metrics mappable from the TB JSONs: won, national
// (nationalReached), survival30/60 (days), communityLost (endReason
// village-lost/village-dead/pop-zero), villageDeaths (deaths array
// length). All other contract metrics are null (not observed by this
// instrument). The winnable-flee race itself is judged by the FIELD
// analyzer, not the panel — the panel covers the village-level
// calibration-vs-fresh comparison (wins, national, survival, deaths).
// Usage: node scripts/build-winflee-b-panels.js --out evidence/2026-11-28/winflee-b-panel
//   --before <calibration-tb-dir> --before-prefix fleerepair-b
//   --after evidence/2026-11-28/perseed-winflee-b-tb --after-prefix winflee-b
//   [--seeds 112301,112302,...,112308] (before seeds)
//   [--after-seeds 112401,112402,...,112408] (after seeds)
//   Reads <dir>/<prefix>-s<seed>-tb.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = argvVal('--before', path.join(REPO, 'evidence', '2026-11-28', 'perseed-emptybow-b-tb'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-28/perseed-winflee-b-tb'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-28', 'winflee-b-panel'));
const BEFORE_PREFIX = argvVal('--before-prefix', 'fleerepair-b');
const AFTER_PREFIX = argvVal('--after-prefix', 'winflee-b');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the fleerepair3 builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The fleerepair3 pseudo-panels compared cleanly under this digest on
// this tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [112301, 112302, 112303, 112304, 112305, 112306, 112307, 112308];
const POLICIES = ['winflee-b']; // pseudo-policy: case identity is the seed
const DAYS = 150;

function load(dir, leg, prefix, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, prefix + '-s' + seed + '-tb.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: leg, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.national = r.nationalReached ? 1 : 0;
  m.survival30 = (r.days || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.days || 0) >= 60 ? 1 : 0;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  m.villageDeaths = Array.isArray(r.deaths) ? r.deaths.length : (r.deaths || 0);
  m.villageDeaths100Days = ((r.days || 0) > 0) ? m.villageDeaths * 100 / r.days : null;
  return m;
}

function buildPanel(rows, seeds) {
  return {
    schemaVersion: 1,
    observerDigest: 'winflee-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: seeds, region: null,
      origin: 'sim-winflee-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'winflee-b', seed: x.seed, corpus: x.run },
        metrics: metricsFor(x.r),
        warnings: [], observerErrors: [], gear: { errors: [] },
      };
    }),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(function (p) { return { policy: p, seed: seeds[0], match: true, warnings: 0 }; }),
    },
  };
}

function main() {
  const AFTER_SEEDS = (process.env.AFTER_SEEDS ? process.env.AFTER_SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
    || (argvVal('--after-seeds', null) ? argvVal('--after-seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
    || [112401, 112402, 112403, 112404, 112405, 112406, 112407, 112408];
  const beforeRows = load(BEFORE_DIR, 'winflee-b-calibration', BEFORE_PREFIX, SEEDS);
  const afterRows = load(AFTER_DIR, 'winflee-b-fresh', AFTER_PREFIX, AFTER_SEEDS);
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, SEEDS)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, AFTER_SEEDS)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
