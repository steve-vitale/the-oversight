// build-cellgate-floor-panels-b.js — §15 balanced-panel build for arm
// sim-cellgate-floor-b (CELLGATE floor 4 vs floor 3 on the staged
// kill-loot band). Adapted from scripts/build-killlootbundle-panels-a.js:
// the two legs are BOTH driver MODE=arm (STAGE_SEAR requires it), so
// both dirs hold `killlootbundle-a-s<seed>-killlootbundle-a-arm.json`
// files — the legs differ by OUTDIR (floor label lives in each seed
// file's cellgateFloor) and by the panel's corpus label, not by the
// filename mode. TWO legs: before = floor-4 staged control, after =
// floor-3 staged armed, identical seeds 107533-107548. Case identity
// is the seed (pseudo-policy 'killlootbundle-a' in both panels; the
// corpus label lives in row.corpus).
// Contract metrics mappable from killlootbundle JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked), table (not instrumented —
// left null, never faked). All other contract metrics are null (not
// observed by this instrument). The arm's own guardrails (starvation
// deaths + median survival) are judged by analyze-killlootbundle-a.js
// --compare; the panel is the §15 instrument for the standard metrics.
// Usage: node scripts/build-cellgate-floor-panels-b.js [--out evidence/2026-11-23/cellgate-floor-b-panel]
//   [--before evidence/2026-11-21/perseed-cellgate-floor-b-ctl] [--after evidence/2026-11-21/perseed-cellgate-floor-b-arm]
//   [--seeds 107533,107534,...,107548]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-21/perseed-cellgate-floor-b-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-21/perseed-cellgate-floor-b-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-23', 'cellgate-floor-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [107533, 107534, 107535, 107536, 107537, 107538, 107539, 107540,
      107541, 107542, 107543, 107544, 107545, 107546, 107547, 107548];
const POLICIES = ['killlootbundle-a'];
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    // Both legs are driver MODE=arm; the floor label is per-file.
    const fp = path.join(dir, 'killlootbundle-a-s' + seed + '-killlootbundle-a-arm.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (leg === 'cellgate-floor-b-ctl' && r.cellgateFloor !== 4) throw new Error('floor mismatch in ' + fp + ': expected 4, got ' + r.cellgateFloor);
    if (leg === 'cellgate-floor-b-arm' && r.cellgateFloor !== 3) throw new Error('floor mismatch in ' + fp + ': expected 3, got ' + r.cellgateFloor);
    rows.push({ seed: seed, run: leg, r: r });
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
    observerDigest: 'cellgate-floor-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-cellgate-floor-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'killlootbundle-a', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'cellgate-floor-b-ctl');
  const afterRows = load(AFTER_DIR, 'cellgate-floor-b-arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
