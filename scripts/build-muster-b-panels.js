// build-muster-b-panels.js — balanced-panel build for arm sim-muster-b
// (Loop B 20261124). Builds panels in the scripts/balance-panel.js
// schema from the two per-seed corpora:
// before=tbrefuse -v2 leg (competent verbatim — the never-sounding
// control), after=muster-b leg (competent + sounding stack), PAIRED
// seeds on the same tip. Case identity is the seed (pseudo-policy
// 'muster-b' in both panels; the corpus label lives in row.corpus), so
// the scorecard reads CTL->ARM deltas per contract metric on paired
// seeds. The panel is the instrument, NOT the judge (the frozen prereg
// bars are). Contract metrics mappable from both corpora: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deathEvents length), villageDeaths100Days.
// playerDeaths and gear metrics are not instrumented by either driver
// — left null, never faked.
// Usage: node scripts/build-muster-b-panels.js [--out evidence/2026-11-24/muster-b-panel]
//   [--before evidence/2026-11-24/perseed-tbrefuse-b] [--after evidence/2026-11-24/perseed-muster-b]
//   [--seeds 109310,...,109325]
// Compare with: node scripts/balance-panel.js compare --before <out>-before.json.gz --after <out>-after.json.gz --out <out>
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-24/perseed-tbrefuse-b'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-24/perseed-muster-b'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-24', 'muster-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the aidleave-b builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The aidleave-b pseudo-panels compared cleanly under this digest on
// their tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');
const { writeFileFlapSafe } = require('./muster-b-write');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [109310, 109311, 109312, 109313, 109314, 109315, 109316, 109317, 109318, 109319, 109320, 109321, 109322, 109323, 109324, 109325];
const POLICIES = ['muster-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, fileFor) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, fileFor(seed));
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
  m.villageDeaths = Array.isArray(r.deathEvents) ? r.deathEvents.length : (r.deaths || 0);
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'muster-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-muster-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'muster-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'tbrefuse-b-v2', function (seed) { return 'tbrefuse-b-s' + seed + '-tbrefuse-b-v2.json'; });
  const afterRows = load(AFTER_DIR, 'muster-b', function (seed) { return 'muster-b-s' + seed + '-muster-b-muster-b.json'; });
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  writeFileFlapSafe(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  writeFileFlapSafe(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
