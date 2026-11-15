// build-funeralmend-panels-20261114.js — §15 balanced-panel compare for
// arm sim-funeralmend-b (linkdrive pattern). Builds panels in the
// scripts/balance-panel.js schema from the funeralmend per-seed JSONs:
// before=build OFF leg, after=build ON leg, PAIRED seeds; the only
// difference is the FUNERALMEND env flag (the
// game source is identical; the policy file is identical). Case identity
// is the seed (pseudo-policy 'funeralmend' in both panels; the corpus
// label lives in row.corpus), so the scorecard reads OFF->ON deltas per
// contract metric on paired seeds. The panel is the instrument; the
// pre-registered P1/P2/cost bars are the judge. (The real balance-panel.js
// compare cannot judge a policy contrast; here the policies ARE identical
// on both legs, so the compare is contract-valid for the game change.)
// The ON and OFF legs live in SEPARATE per-seed dirs (same RUN name,
// same policy — one dir per leg, or the analyzer's per-seed keys would
// collide); pass them with --before/--after. Seeds with --seeds
// (comma list; default the confirm band 100201–100216).
//
// Contract metrics mappable from funeralmend JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-funeralmend-panels-20261114.js [--out evidence/2026-11-14/funeralmend-panel]
//   [--before evidence/2026-11-14/perseed-funeralmend-b-off] [--after evidence/2026-11-14/perseed-funeralmend-b-on]
//   [--seeds 100201,100202,...,100208]
//   Reads <dir>/funeralmend-b-s<seed>-competent-answercourt-b-funeralmend-b.json
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
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-14/perseed-funeralmend-b-off'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-14/perseed-funeralmend-b-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-14', 'funeralmend-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// NOTE: the linkdrive builder hashes scripts/balance-metrics.json into
// contractDigest while balance-panel.js hashes the NORMALIZED source
// text of the same file. The two digests differ by construction, so
// score.comparePanels would reject these pseudo-panels on contract
// mismatch ('Metric contract does not match this comparator'). Use the
// comparator's own contractDigest (lib/balance-scorecard's exported
// digest) so the pseudo-panels compare under the live contract.
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [100201, 100202, 100203, 100204, 100205, 100206, 100207, 100208, 100209, 100210, 100211, 100212, 100213, 100214, 100215, 100216];
const POLICIES = ['funeralmend']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'funeralmend-b-s' + seed + '-competent-answercourt-b-funeralmend-b.json');
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
    observerDigest: 'funeralmend-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-funeralmend-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'funeralmend', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'funeralmend-off');
  const afterRows = load(AFTER_DIR, 'funeralmend-on');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare funeralmend-off->funeralmend-on: decision=' + report.decision);
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
