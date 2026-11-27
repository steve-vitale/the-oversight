// build-departfit-panels-b.js — §15 balanced-panel build for arm
// sim-departfit-b (DEPARTURE-FITNESS: arm + load before launch).
// Cloned from build-depmat-panels-a.js: builds panels in the
// scripts/balance-panel.js schema from the paired departfit per-seed
// JSONs: before=ctl leg (no lever), after=arm leg (check on), PAIRED
// seeds on the same band. Case identity is the seed (pseudo-policy
// 'departfit-b' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads BASE->ARMED deltas per
// contract metric on paired seeds. The panel is the instrument,
// NOT the judge (the frozen prereg bars are).
// Contract metrics mappable from departfit JSONs: won, national
// (scaleRank 'national' or higher), table (progState table flags),
// survival30/60 (gameDays), communityLost (endReason
// village-lost/village-dead/pop-zero), villageDeaths (deaths array
// length), playerDeaths (deaths with player=true). All other
// contract metrics are null (not observed by this instrument).
// Usage: node scripts/build-departfit-panels-b.js [--out evidence/2026-11-27/departfit-b-panel]
//   [--before evidence/2026-11-27/perseed-departfit-b-ctl] [--after evidence/2026-11-27/perseed-departfit-b-arm]
//   [--seeds 111301,111302,111303,111304,111305,111306,111307,111308]
//   Reads <dir>/departfit-b-s<seed>.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-27/perseed-departfit-b-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-27/perseed-departfit-b-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-27', 'departfit-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the depmat builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The depmat pseudo-panels compared cleanly under this digest on this
// tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [111301, 111302, 111303, 111304, 111305, 111306, 111307, 111308];
const POLICIES = ['departfit-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'departfit-b-s' + seed + '.json');
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
  m.table = r.table ? 1 : 0;
  m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  const deaths = Array.isArray(r.deaths) ? r.deaths : [];
  m.villageDeaths = deaths.length;
  m.playerDeaths = deaths.filter(function (d) { return d && d.player; }).length;
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? m.playerDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'departfit-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-departfit-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'departfit-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'departfit-b-ctl');
  const afterRows = load(AFTER_DIR, 'departfit-b-arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
