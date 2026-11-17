// build-part2target-panels-20261117.js — §15 balanced-panel compare
// for arm sim-part2target-a (DIAG). Adapted from
// scripts/build-nightcarry-panels-20261117.js (panel-building logic
// UNCHANGED); only leg dirs, file names, seeds, pseudo-policy, origin,
// and observer digest change. Builds panels in the
// scripts/balance-panel.js schema from the part2target per-seed JSONs.
// THE COMPARE IS RECORDER-OFF vs RECORDER-ON on the SAME band/seeds/
// policy: the OFF leg (driver run with PART2TARGET_RECORDER=off) and
// the ON leg (recorder on) must produce identical trajectories — any
// delta is a neutrality finding, reported, not hidden. A DIAG
// self-compare is NOT run: it is degenerate by design and proves
// nothing about the recorder. The prereg bar is the judge, not this
// panel. No cross-band compare: the part2night corpus is a different
// band (103411–103418), so its deltas would be seed effects, not
// neutrality evidence.
// Usage: node scripts/build-part2target-panels-20261117.js [--out evidence/2026-11-17/part2target-a-panel]
//   [--dir evidence/2026-11-17/perseed-part2target-a]
//   [--dirOff evidence/2026-11-17/perseed-part2target-a-off]
//   [--seeds 103421,103422,...,103428]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const DIR = path.join(REPO, argvVal('--dir', 'evidence/2026-11-17/perseed-part2target-a'));
const DIR_OFF = path.join(REPO, argvVal('--dirOff', 'evidence/2026-11-17/perseed-part2target-a-off'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-17', 'part2target-a-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [103421, 103422, 103423, 103424, 103425, 103426, 103427, 103428];
const POLICIES = ['part2target-a']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, pattern) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, pattern(seed));
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, run: pattern(seed), r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'part2target-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-part2target-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'part2target-a', seed: x.seed, corpus: label },
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

function compare(beforePath, afterPath, outPrefix) {
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(outPrefix + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(outPrefix + '.md', score.markdown(report));
  return report;
}

function main() {
  const offRows = load(DIR_OFF, function (seed) { return 'part2target-a-s' + seed + '-part2target-a-diag.json'; });
  const onRows = load(DIR, function (seed) { return 'part2target-a-s' + seed + '-part2target-a-diag.json'; });
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(offRows, 'recorder-off')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(onRows, 'recorder-on')) + '\n'));
  const report = compare(beforePath, afterPath, OUT_PREFIX);
  console.log('compare part2target-a recorder-off->recorder-on: decision=' + report.decision);
}

if (require.main === module) main();
module.exports = { buildPanel: buildPanel, metricsFor: metricsFor };
