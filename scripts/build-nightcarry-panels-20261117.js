// build-nightcarry-panels-20261117.js — §15 balanced-panel compare
// for arm sim-nightcarry-a. Copied from scripts/build-launchdef-panels-20261116.js
// (panel-building logic UNCHANGED); only leg dirs, file names, seeds,
// pseudo-policy, origin, and observer digest change. Builds panels in
// the scripts/balance-panel.js schema from the nightcarry per-seed
// JSONs: before=control leg (competent verbatim, NIGHTCARRY OFF),
// after=armed leg (competent verbatim, NIGHTCARRY=1),
// PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'nightcarry-a' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads OFF->ON deltas per contract
// metric on paired seeds. The panel is the instrument; the
// pre-registered launched-plans / survival / starvation bars are the judge.
// NOTE the contrast here IS the game code (the lever): the two legs
// share one policy file — the policy is identical on both legs and
// the driver code path is identical, so the paired-seed deltas are
// the lever's effect, read through one instrument.
// Usage: node scripts/build-nightcarry-panels-20261117.js [--out evidence/2026-11-17/nightcarry-a-panel]
//   [--before evidence/2026-11-17/perseed-nightcarry-a-control] [--after evidence/2026-11-17/perseed-nightcarry-a-on]
//   [--seeds 103101,103102,...,103108]
//   Reads <dir>/nightcarry-a-s<seed>-nightcarry-a-<control|on>.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-17/perseed-nightcarry-a-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-17/perseed-nightcarry-a-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-17', 'nightcarry-a-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [103101, 103102, 103103, 103104, 103105, 103106, 103107, 103108];
const POLICIES = ['nightcarry-a']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'nightcarry-a-s' + seed + '-nightcarry-a-' + leg + '.json');
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
    observerDigest: 'nightcarry-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-nightcarry-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'nightcarry-a', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'control');
  const afterRows = load(AFTER_DIR, 'on');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare nightcarry-a-control->nightcarry-a-on: decision=' + report.decision);
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
module.exports = { buildPanel: buildPanel, metricsFor: metricsFor };
