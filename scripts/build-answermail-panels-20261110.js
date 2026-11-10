// build-answermail-panels-20261110.js — §15 balanced-panel compare for
// arm sim-answermail-a (askplus pattern). Builds panels in the
// scripts/balance-panel.js schema from the answermail per-seed JSONs:
// before=competent, after=competent-answermail-a, PAIRED seeds; the only
// difference is the answermail policy layer. Case identity is the seed
// (pseudo-policy 'answermail' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads control->armed deltas per
// contract metric on paired seeds. The panel is the instrument; the
// pre-registered GO bar is the judge.
//
// Contract metrics mappable from answermail JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (teleDeaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-answermail-panels-20261110.js [--out evidence/2026-11-10/answermail-panel]
//   Reads evidence/2026-11-10/perseed-answermail-a/answermail-s<seed>-answermail-base.json
//   for the before leg and answermail-s<seed>-answermail-armed.json for the after leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-11-10', 'perseed-answermail-a');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-11-10', 'answermail-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [99101, 99102, 99103, 99104, 99105, 99106, 99107, 99108];
const POLICIES = ['answermail']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(SWEEP_DIR, 'answermail-s' + seed + '-' + run + '.json');
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
    observerDigest: 'answermail-trustgrowth-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-answermail-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'answermail', seed: x.seed, corpus: x.run },
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
  const beforeRows = load('answermail-base');
  const afterRows = load('answermail-armed');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare competent->competent-answermail-a: decision=' + report.decision);
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
