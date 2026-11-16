// build-gatelever-panels-20261116.js — §balanced-panel build for arm
// sim-gatelever-b (gate lever pilot, 150d horizon). Builds panels in the
// scripts/balance-panel.js schema from the gatelever per-seed JSONs:
// before=control leg (seed call only), after=lever leg (seed call +
// gate changes), PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'gatelever-b' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads OFF->ON deltas per contract
// metric on paired seeds. The panel is the instrument; the
// pre-registered GO bars are the judge. The contrast here is GAME CODE
// (the lever), not policy: both legs run the competent verbatim policy
// on identical seeds; only the tip differs (control tip aaf9d13b6,
// lever tip 757b3be05). This builder writes ONLY the before/after
// panels; the compare itself runs through scripts/balance-panel.js
// (`node scripts/balance-panel.js compare --before <panel>-before.json.gz
// --after <panel>-after.json.gz --out <prefix>`).
//
// Contract metrics mappable from gatelever JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths count — a NUMBER in this driver, not an
// array), playerDeaths (not instrumented by this driver — left null,
// never faked). All other contract metrics are null (not observed by
// this instrument).
// Usage: node scripts/build-gatelever-panels-20261116.js [--out evidence/2026-11-16/gatelever-b-panel]
//   [--before evidence/2026-11-16/perseed-gatelever-b-control] [--after evidence/2026-11-16/perseed-gatelever-b-lever]
//   [--seeds 102101,102102,...,102108]
//   Reads <dir>/gatelever-b-s<seed>-competent-gatelever-b-<control|lever>.json
//   per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-16/perseed-gatelever-b-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-16/perseed-gatelever-b-lever'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-16', 'gatelever-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the courtship builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The courtship pseudo-panels compared cleanly under this digest on
// this tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [102101, 102102, 102103, 102104, 102105, 102106, 102107, 102108];
const POLICIES = ['gatelever-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'gatelever-b-s' + seed + '-competent-' + run + '.json');
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
    observerDigest: 'gatelever-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-gatelever-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'gatelever-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'gatelever-b-off', 'gatelever-b-control');
  const afterRows = load(AFTER_DIR, 'gatelever-b-on', 'gatelever-b-lever');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
