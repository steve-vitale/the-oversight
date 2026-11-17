// build-part2night-panels-20261117.js — §15 balanced-panel compare
// for arm sim-part2night-a (DIAG). Adapted from
// scripts/build-nightcarry-panels-20261117.js (panel-building logic
// UNCHANGED); only leg dirs, file names, seeds, pseudo-policy, origin,
// and observer digest change. Builds panels in the
// scripts/balance-panel.js schema from the part2night per-seed JSONs.
// SINGLE-LEG DIAG: the compare is a SELF-compare (before = after =
// this corpus). Degenerate BY DESIGN — the expected decision is
// no_material_signal with all deltas 0; it verifies the corpus rows
// parse through the scorecard and states that no contrast exists for
// a DIAG. The prereg bar is the judge, not this panel.
// Optional cross-instrument compare: if the sibling arm
// sim-launchfunnel-a's corpus is present at
// evidence/2026-11-17/perseed-launchfunnel-a/ with files
// launchfunnel-a-s<seed>-launchfunnel-a-diag.json, the builder ALSO
// compares this corpus against it (same band/seeds/policy, both
// pure-read recorders — trajectories must be identical; any delta is
// a neutrality finding, reported, not hidden). If the sibling corpus
// is absent, the cross-compare is skipped and the evidence says so.
// Usage: node scripts/build-part2night-panels-20261117.js [--out evidence/2026-11-17/part2night-a-panel]
//   [--dir evidence/2026-11-17/perseed-part2night-a]
//   [--seeds 103411,103412,...,103418]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const DIR = path.join(REPO, argvVal('--dir', 'evidence/2026-11-17/perseed-part2night-a'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-17', 'part2night-a-panel'));
const CROSS_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-launchfunnel-a');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [103411, 103412, 103413, 103414, 103415, 103416, 103417, 103418];
const POLICIES = ['part2night-a']; // pseudo-policy: case identity is the seed (paired design)
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
    observerDigest: 'part2night-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-part2night-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'part2night-a', seed: x.seed, corpus: label },
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
  const rows = load(DIR, function (seed) { return 'part2night-a-s' + seed + '-part2night-a-diag.json'; });
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(rows, 'diag')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(rows, 'diag')) + '\n'));
  const report = compare(beforePath, afterPath, OUT_PREFIX);
  console.log('compare part2night-a-diag->part2night-a-diag (SELF): decision=' + report.decision);
  // Optional cross-instrument compare against the sibling DIAG corpus.
  const crossFiles = SEEDS.map(function (seed) { return path.join(CROSS_DIR, 'launchfunnel-a-s' + seed + '-launchfunnel-a-diag.json'); });
  if (crossFiles.every(function (f) { return fs.existsSync(f); })) {
    const crossRows = load(CROSS_DIR, function (seed) { return 'launchfunnel-a-s' + seed + '-launchfunnel-a-diag.json'; });
    const crossAfter = OUT_PREFIX + '-cross-after.json.gz';
    fs.writeFileSync(crossAfter, zlib.gzipSync(JSON.stringify(buildPanel(crossRows, 'launchfunnel-a')) + '\n'));
    const crossReport = compare(beforePath, crossAfter, OUT_PREFIX + '-cross');
    console.log('compare part2night-a-diag->launchfunnel-a-diag (CROSS): decision=' + crossReport.decision);
  } else {
    console.log('cross-compare skipped: sibling corpus not present at ' + CROSS_DIR);
  }
}

if (require.main === module) main();
module.exports = { buildPanel: buildPanel, metricsFor: metricsFor };
