// build-darkwit-panels-20261107.js — §15 balanced-panel compare
// for arm sim-darkwit-b (witnessdoor pattern). Builds panels in the
// scripts/balance-panel.js schema from the darkwit per-seed JSONs:
// before=baseline corpus (witnessdoor armed, WITNESSDOOR_B=1,
// LEDGERDARK unset — witness walked LIGHT), after=armed corpus
// (same substrate, LEDGERDARK=1 — the dark-ledger road). PAIRED
// seeds; the difference is the road. Case identity is the seed
// (pseudo-policy 'darkwit' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads control->armed deltas per
// contract metric on paired seeds. Unlike witnessdoor, the legs
// differ pre-sit by design (the road), so NON-ZERO neutral deltas
// are expected — the panel measures the road's survival cost, and
// its verdict is read with the frozen cost bar, not against a
// zero-delta expectation. The panel is the instrument; the
// pre-registered GO bar is the judge.
//
// Contract metrics mappable from darkwit JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (teleDeaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-darkwit-panels-20261107.js [--out evidence/2026-11-07/darkwit-panel] [--seeds 53201..53212]
//   Reads evidence/2026-11-07/perseed-darkwit-b-baseline/darkwit-b-s<seed>-darkwit-baseline.json
//   for the before leg and perseed-darkwit-b-armed/darkwit-b-s<seed>-darkwit-armed.json
//   for the after leg. With --pilot, reads the pilot corpora instead.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-11-07', 'darkwit-panel'));
const PILOT = process.argv.includes('--pilot');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = PILOT
  ? [53701, 53702, 53703, 53704, 53705, 53706, 53707, 53708]
  : [53201, 53202, 53203, 53204, 53205, 53206, 53207, 53208, 53209, 53210, 53211, 53212];
// The judged pilot ran on the FRESH fallback band (the 53201 band
// failed substrate sanity — see the prereg band note), so the pilot
// corpora live in the -fresh dirs under the -53701 run names.
const BASE_DIR = PILOT ? 'perseed-darkwit-b-pilot-baseline-fresh' : 'perseed-darkwit-b-baseline';
const ARMED_DIR = PILOT ? 'perseed-darkwit-b-pilot-armed-fresh' : 'perseed-darkwit-b-armed';
const BASE_RUN = PILOT ? 'darkwit-pilot-baseline-53701' : 'darkwit-baseline';
const ARMED_RUN = PILOT ? 'darkwit-pilot-armed-53701' : 'darkwit-armed';
const POLICIES = ['darkwit']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(REPO, 'evidence', '2026-11-07', dir, 'darkwit-b-s' + seed + '-' + run + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: run, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
  m.villageDeaths = (r.teleDeaths || []).length;
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'darkwit-sitstep-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-darkwit-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'darkwit', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BASE_DIR, BASE_RUN);
  const afterRows = load(ARMED_DIR, ARMED_RUN);
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare ' + BASE_RUN + '->' + ARMED_RUN + ': decision=' + report.decision);
  for (const p of report.policies || []) {
    console.log('  policy ' + p.policy + ': ' + p.decision + ' (' + p.cases + ' cases)');
    for (const m of p.metrics || []) {
      console.log('    ' + m.id + ': ' + m.status + ' delta=' + m.delta + ' ci=[' + m.interval95 + ']');
    }
  }
}

if (require.main === module) main();
module.exports = { metricsFor: metricsFor, buildPanel: buildPanel, SEEDS: SEEDS };
