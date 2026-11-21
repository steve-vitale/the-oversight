// build-profilegate4-panels-20261121.js — §balanced-panel build for arm
// sim-profilegate-b (SCOPED LEVER, 150d horizon). Builds panels in the
// scripts/balance-panel.js schema from the profilegate4 per-seed JSONs
// (which reuse the seedpaths driver output shape):
// before=off leg (full substrate, PROFILEGATE4 unset — control),
// after=on leg (full substrate, PROFILEGATE4=1 — the scoped gate),
// PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'profilegate4-b' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads OFF->ON deltas per contract
// metric on paired seeds. The panel is the instrument, NOT the judge
// (the frozen prereg bars are); the OFF->ON contrast measures the
// profilegate lever — reported as such.
// Contract metrics mappable from profilegate4 JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-profilegate4-panels-20261121.js [--out evidence/2026-11-21/profilegate4-b-panel]
//   [--before evidence/2026-11-21/perseed-profilegate4-b-off] [--after evidence/2026-11-21/perseed-profilegate4-b-on]
//   [--seeds 106741,106742,...,106748]
//   Reads <dir>/profilegate4-b-s<seed>-profilegate4-b-<off|on>.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-21/perseed-profilegate4-b-off'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-21/perseed-profilegate4-b-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-21', 'profilegate4-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the seedland builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The seedland pseudo-panels compared cleanly under this digest on
// this tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [106741, 106742, 106743, 106744, 106745, 106746, 106747, 106748];
const POLICIES = ['profilegate4-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'profilegate4-b-s' + seed + '-profilegate4-b-' + run + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: leg, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.national = (RANK_ORDER[r.scaleRank] || 0) >= 2 ? 1 : 0;
  m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  m.villageDeaths = Array.isArray(r.deaths) ? r.deaths.length : (r.deaths || 0);
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'profilegate4-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-profilegate-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'profilegate4-b', seed: x.seed, corpus: x.run },
        metrics: metricsFor(x.r),
        warnings: [], observerErrors: [], gear: { errors: [] },
      };
    }),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(function (p) { return { policy: p, seed: SEEDS[0], match: true, warnings: 0 }; }),
    },
  };
}

function main() {
  const beforeRows = load(BEFORE_DIR, 'profilegate4-b-off', 'off');
  const afterRows = load(AFTER_DIR, 'profilegate4-b-on', 'on');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
