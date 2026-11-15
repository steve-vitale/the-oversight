// build-onlylead2-panels-20261115.js — §15 balanced-panel compare
// for arm sim-onlylead2-b (covenant road on a 200d horizon). Builds
// panels in the scripts/balance-panel.js schema from the onlylead2
// per-seed JSONs: before=control leg (competent-scaleclimb-b, covenant
// road OFF), after=armed leg (competent-covenant-b, covenant road ON),
// PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'onlylead2-b' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads OFF->ON deltas per contract
// metric on paired seeds. The panel is the instrument; the
// pre-registered G1/G2/cost bars are the judge. NOTE the contrast here
// is the POLICY (the covenant road), not game code: unlike the cascade
// builder, the two legs run different policy files — the paired-seed
// deltas are the policy's effect, read through one instrument
// (answercourt precedent — the real balance-panel.js compare cannot
// judge a policy contrast; this pseudo-panel is built for the record).
// The ON and OFF legs live in SEPARATE per-seed dirs; pass them with
// --before/--after. Seeds with --seeds (comma list; default the pilot
// band 100421–100428).
//
// Contract metrics mappable from onlylead2 JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-onlylead2-panels-20261115.js [--out evidence/2026-11-15/onlylead2-b-panel]
//   [--before evidence/2026-11-15/perseed-onlylead2-b-control] [--after evidence/2026-11-15/perseed-onlylead2-b-on]
//   [--seeds 100421,100422,...,100428]
//   Reads <dir>/onlylead2-b-s<seed>-competent-<policy>-onlylead2-b.json
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
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-15/perseed-onlylead2-b-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-15/perseed-onlylead2-b-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-15', 'onlylead2-b-panel'));

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
  || [100421, 100422, 100423, 100424, 100425, 100426, 100427, 100428];
const POLICIES = ['onlylead2-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 200;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, policy) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'onlylead2-b-s' + seed + '-competent-' + policy + '-onlylead2-b.json');
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
    observerDigest: 'onlylead2-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-onlylead2-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'onlylead2-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'onlylead2-b-off', 'scaleclimb-b');
  const afterRows = load(AFTER_DIR, 'onlylead2-b-on', 'covenant-b');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare onlylead2-b-off->onlylead2-b-on: decision=' + report.decision);
  for (const p of report.policies || []) {
    console.log('  policy ' + p.policy + ': ' + p.decision + ' (' + p.cases + ' cases)');
    for (const m of p.metrics || []) {
      if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
        console.log('    ' + m.id + ': ' + m.status + ' delta=' + m.delta + ' ci=[' + m.interval95 + ']');
      }
    }
  }
}

if (require.main === module) main();
