// build-holdspeak-a-panels.js — balanced-panel build for arm
// sim-holdspeak-a (finding #2713, 150d horizon). Builds panels in the
// scripts/balance-panel.js schema from the holdspeak per-seed JSONs
// (dawnchoke driver output shape):
// before=ctl leg (base code, hold lines absent), after=arm leg (hold
// voice on), PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'holdspeak-a' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads CTL->ARM deltas per contract
// metric on paired seeds. The panel is the instrument, NOT the judge
// (the frozen prereg bars are).
// Contract metrics mappable from dawnchoke JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), villageDeaths100Days. Table
// entry/sitting are not instrumented by this driver — left null,
// never faked. All other contract metrics are null (not observed by
// this instrument).
// Usage: node scripts/build-holdspeak-a-panels.js [--out evidence/2026-11-24/holdspeak-a-panel]
//   [--before evidence/2026-11-22/perseed-holdspeak-a-before] [--after evidence/2026-11-22/perseed-holdspeak-a-after]
//   [--seeds 109409,...,109416] [--run holdspeak-a-confirm]
//   Reads <dir>/dawnchoke-a-s<seed>-holdspeak-a-<before|after>-<ctl|arm>.json per leg
//   (--run holdspeak-a-confirm reads the confirm legs instead).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-22/perseed-holdspeak-a-before'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-22/perseed-holdspeak-a-after'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-24', 'holdspeak-a-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const RUN_PREFIX = argvVal('--run', 'holdspeak-a'); // 'holdspeak-a' (pilot) or 'holdspeak-a-confirm'
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [109409, 109410, 109411, 109412, 109413, 109414, 109415, 109416];
const POLICIES = ['holdspeak-a']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, run, mode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'dawnchoke-a-s' + seed + '-' + RUN_PREFIX + '-' + run + '-' + mode + '.json');
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
    observerDigest: 'holdspeak-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-holdspeak-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'holdspeak-a', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, RUN_PREFIX + '-before', 'before', 'ctl');
  const afterRows = load(AFTER_DIR, RUN_PREFIX + '-after', 'after', 'arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
