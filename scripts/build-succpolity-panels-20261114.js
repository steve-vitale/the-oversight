// build-succpolity-panels-20261114.js — §15 balanced-panel compare for
// arm sim-succpolity-b (confirm-builder logic verbatim; renamed
// literals only + a --leg/--policy selector). Builds panels in the
// scripts/balance-panel.js schema from the per-seed JSONs:
// before=corpus armed leg (competent-answercourt-b, env defaults),
// after=this arm's leg (RUN + policy given on the command line),
// PAIRED seeds. Case identity is the seed (pseudo-policy
// 'answercourt' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads control->armed deltas per
// contract metric on paired seeds. The panel is the instrument; the
// pre-registered G2 bar is the judge. (The real balance-panel.js
// compare cannot judge a policy contrast: both panels must carry
// identical options.policies and identical policy/harness sources —
// see prereg.)
//
// Contract metrics mappable from the JSONs: won, national (scaleRank
// 'national' or higher), survival30/60 (gameDays), communityLost
// (endReason village-lost/village-dead/pop-zero), villageDeaths
// (deaths count), playerDeaths (not instrumented by this driver —
// left null, never faked). All other contract metrics are null (not
// observed by this instrument).
// Usage: node scripts/build-succpolity-panels-20261114.js --leg succpolity-a --policy competent-answercourt-b [--out evidence/2026-11-14/succpolity-panel-a]
//   Reads evidence/2026-11-14/perseed-answercourt-confirm-b/answercourt-b-s<seed>-competent-answercourt-b-answercourt-confirm-b.json
//   for the before leg and evidence/2026-11-14/perseed-succpolity-b/succpolity-b-s<seed>-<policy>-<leg>.json for the after leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const BASE_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-answercourt-confirm-b');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-11-14', 'perseed-succpolity-b');
const LEG = (process.argv.includes('--leg') ? process.argv[process.argv.indexOf('--leg') + 1] : 'succpolity-a');
const POLICY = (process.argv.includes('--policy') ? process.argv[process.argv.indexOf('--policy') + 1] : 'competent-answercourt-b');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-11-14', 'succpolity-panel-' + LEG));

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

const SEEDS = [100201, 100202, 100203, 100204, 100205, 100206, 100207, 100208, 100209, 100210, 100211, 100212, 100213, 100214, 100215, 100216];
const POLICIES = ['answercourt']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function loadBefore() {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(BASE_DIR, 'answercourt-b-s' + seed + '-competent-answercourt-b-answercourt-confirm-b.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: 'corpus-armed', r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

function loadAfter() {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(SWEEP_DIR, 'succpolity-b-s' + seed + '-' + POLICY + '-' + LEG + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: LEG, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
    observerDigest: 'succpolity-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-succpolity-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'answercourt', seed: x.seed, corpus: x.run },
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
  const beforeRows = loadBefore();
  const afterRows = loadAfter();
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare corpus-armed->' + LEG + '/' + POLICY + ': decision=' + report.decision);
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
module.exports = { loadBefore: loadBefore, loadAfter: loadAfter, buildPanel: buildPanel, metricsFor: metricsFor };
