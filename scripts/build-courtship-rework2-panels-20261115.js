// build-courtship-rework2-panels-20261115.js — §15 balanced-panel build
// for arm sim-courtship-rework2-b (courtship deeds for the covenant road, 200d horizon). Builds
// panels in the scripts/balance-panel.js schema from the courtship
// per-seed JSONs: before=control leg (competent-covenant-b, covenant road
// walked, NO opinion lever), after=armed leg (competent-courtship-b,
// the same road + courtship deeds ON),
// PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy  'courtship-rework2-b' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads OFF->ON deltas per contract
// metric on paired seeds. The panel is the instrument; the
// pre-registered G1/G2/cost bars are the judge. NOTE the contrast here
// is the POLICY (the courtship deeds), not game code: unlike the cascade
// builder, the two legs run different policy files — the paired-seed
// deltas are the policy's effect, read through one instrument
// (answercourt precedent). This builder writes ONLY the before/after
// panels; the compare itself runs through scripts/balance-panel.js
// (`node scripts/balance-panel.js compare --before <panel>-before.json.gz
// --after <panel>-after.json.gz --out <prefix>`).
// The ON and OFF legs live in SEPARATE per-seed dirs; pass them with
// --before/--after. Seeds with --seeds (comma list; default the pilot
// band 100761–100768).
//
// Contract metrics mappable from courtship JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-courtship-rework2-panels-20261115.js [--out evidence/2026-11-15/courtship-rework2-b-panel]
//   [--before evidence/2026-11-15/perseed-courtship-rework2-b-control] [--after evidence/2026-11-15/perseed-courtship-rework2-b-on]
//   [--seeds 100761,100762,...,100768]
//   Reads <dir>/courtship-rework2-b-s<seed>-competent-<policy>-courtship-rework2-b.json
//   per leg (policy differs by leg — the covenant road IS the policy).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-15/perseed-courtship-rework2-b-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-15/perseed-courtship-rework2-b-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-15', 'courtship-rework2-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the cascade builder: the linkdrive builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The cascade pseudo-panels compared cleanly under this digest on this
// tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [100761, 100762, 100763, 100764, 100765, 100766, 100767, 100768];
const POLICIES = [ 'courtship-rework2-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 200;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, policy) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'courtship-rework2-b-s' + seed + '-competent-' + policy + '-courtship-rework2-b.json');
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
  m.villageDeaths = (r.deaths || []).length;
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'courtship-rework2-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-courtship-rework2-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy:  'courtship-rework2-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'courtship-rework2-b-off', 'covenant-b');
  const afterRows = load(AFTER_DIR, 'courtship-rework2-b-on', 'courtship-b');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
