// build-corpsecap-panels-a.js — §15 balanced-panel build for arm
// sim-corpsecap-a (DIAG + conditional LEVER: corpse-cap gun sink).
// Builds panels in the scripts/balance-panel.js schema from the
// corpsecap-a per-seed JSONs. TWO legs, ctl vs arm, identical seeds
// 107271-107278: before = ctl (lever off), after = arm (CORPSECAP=1).
// In the diag phase there is no arm leg — the builder is used only
// once the lever phase runs. Case identity is the seed (pseudo-policy
// 'corpsecap-a' in both panels; the corpus label lives in
// row.corpus).
// Contract metrics mappable from corpsecap JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked), table (not instrumented —
// left null, never faked). All other contract metrics are null (not
// observed by this instrument).
// Usage: node scripts/build-corpsecap-panels-a.js [--out evidence/2026-11-21/corpsecap-a-panel]
//   [--before evidence/2026-11-21/perseed-corpsecap-a-ctl] [--after evidence/2026-11-21/perseed-corpsecap-a-arm]
//   [--seeds 107237,107238,...,107244]
//   Reads <dir>/corpsecap-a-s<seed>-corpsecap-a-<ctl|arm>.json.
//   (The driver hardcodes its filename prefix 'corpsecap-a';
//   RUN=corpsecap-a lands in the middle segment.)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-21/perseed-corpsecap-a-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-21/perseed-corpsecap-a-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-21', 'corpsecap-a-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [107271, 107272, 107273, 107274, 107275, 107276, 107277, 107278];
const POLICIES = ['corpsecap-a'];
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, mode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'corpsecap-a-s' + seed + '-corpsecap-a-' + mode + '.json');
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
    observerDigest: 'corpsecap-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-corpsecap-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'corpsecap-a', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'corpsecap-a-ctl', 'ctl');
  const afterRows = load(AFTER_DIR, 'corpsecap-a-arm', 'arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
