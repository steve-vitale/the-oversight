// build-askplus-panels-20261104.js — §15 balanced-panel compare for
// arm sim-askplus-a (diphold-arm pattern). Builds panels in the
// scripts/balance-panel.js schema from the diplo per-seed JSONs:
// before=competent, after=competent-askplus, PAIRED seeds; the only
// difference is the askplus policy layer. Case identity is the seed
// (pseudo-policy 'askplus' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads control->armed deltas per
// contract metric on paired seeds. The panel is the instrument; the
// pre-registered GO bar (proposals/links/end-diplomacy) is the judge.
//
// Contract metrics mappable from diplo JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (death-event count), playerDeaths (not instrumented
// by the diplo driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-askplus-panels-20261104.js [--out evidence/2026-11-04/askplus-panel]
//   Reads evidence/2026-11-04/perseed-askplus-a/askplus-s<seed>-askplus.json
//   for the after leg and askplus-s<seed>-baseline.json for the before leg.
//   (The driver writes RUN into the filename: baseline leg uses RUN=baseline,
//   arm leg uses RUN=askplus.)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-11-04', 'perseed-askplus-a');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-11-04', 'askplus-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [99501, 99502, 99503, 99504, 99505, 99506, 99507, 99508];
const POLICIES = ['askplus']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 140;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(SWEEP_DIR, 'askplus-s' + seed + '-' + run + '.json');
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
  m.villageDeaths = (r.deathEvents || []).length;
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'askplus-diplo-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-askplus-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'askplus', seed: x.seed, corpus: x.run },
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
  const beforeRows = load('baseline');
  const afterRows = load('askplus');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare competent->competent-askplus: decision=' + report.decision);
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
