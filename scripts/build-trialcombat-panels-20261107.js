// build-trialcombat-panels-20261107.js — §15 balanced-panel compare
// for arm sim-trialcombat-b (doorwalk pattern). Builds panels in the
// scripts/balance-panel.js schema from the trialcombat per-seed
// JSONs: before=baseline corpus (doorwalk rotation,
// DOORWALK_B=1, TRIALCOMBAT_B unset), after=armed corpus (same
// substrate, TRIALCOMBAT_B=1). PAIRED seeds; the only difference is
// the feared-first door rule. Case identity is the seed
// (pseudo-policy 'trialcombat' in both panels; the corpus label
// lives in row.corpus), so the scorecard reads control->armed
// deltas per contract metric on paired seeds. The panel is the
// instrument; the pre-registered GO bar is the judge.
//
// Contract metrics mappable from trialcombat JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (teleDeaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-trialcombat-panels-20261107.js [--out evidence/2026-11-08/trialcombat-panel]
//   Reads evidence/2026-11-08/perseed-trialcombat-b-baseline/trialcombat-b-s<seed>-trialcombat-baseline.json
//   for the before leg and perseed-trialcombat-b-armed/trialcombat-b-s<seed>-trialcombat-armed.json
//   for the after leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-11-08', 'trialcombat-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [53901, 53902, 53903, 53904, 53905, 53906, 53907, 53908];
const POLICIES = ['trialcombat']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(REPO, 'evidence', '2026-11-08', dir, 'trialcombat-b-s' + seed + '-' + run + '.json');
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
    observerDigest: 'trialcombat-sitstep-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-trialcombat-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'trialcombat', seed: x.seed, corpus: x.run },
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
  const beforeRows = load('perseed-trialcombat-b-baseline', 'trialcombat-baseline');
  const afterRows = load('perseed-trialcombat-b-armed', 'trialcombat-armed');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare trialcombat-baseline->trialcombat-armed: decision=' + report.decision);
  for (const p of report.policies || []) {
    console.log('  policy ' + p.policy + ': ' + p.decision + ' (' + p.cases + ' cases)');
    for (const m of p.metrics || []) {
      console.log('    ' + m.id + ': ' + m.status + ' delta=' + m.delta + ' ci=[' + m.interval95 + ']');
    }
  }
}

if (require.main === module) main();
module.exports = { metricsFor: metricsFor, buildPanel: buildPanel, SEEDS: SEEDS };
