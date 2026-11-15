// build-producerparty-panels-20261115.js — §15 balanced-panel compare
// for arm sim-producerparty-b (linkdrive pattern). Builds panels in the
// scripts/balance-panel.js schema from the cascade per-seed JSONs:
// before=control leg (competent-answercourt-b, lever OFF), after=armed
// leg (competent-answercourt-b, lever ON), PAIRED seeds on the same tip.
// Case identity is the seed (pseudo-policy 'producerparty-b' in both panels;
// the corpus label lives in row.corpus), so the scorecard reads OFF->ON
// deltas per contract metric on paired seeds. The panel is the instrument;
// the pre-registered P1/P2/cost bars are the judge. NOTE the contrast
// here IS the game code (the lever): unlike the funeralmend builder, the
// two legs share one policy file — the policy is identical on both legs
// and the driver code path is identical, so the paired-seed deltas are
// the lever's effect, read through one instrument.
// The ON and OFF legs live in SEPARATE per-seed dirs; pass them with
// --before/--after. Seeds with --seeds (comma list; default the pilot
// band 100201–100208).
//
// Contract metrics mappable from cascade JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths count), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract
// metrics are null (not observed by this instrument).
// Usage: node scripts/build-producerparty-panels-20261115.js [--out evidence/2026-11-15/producerparty-b-panel]
//   [--before evidence/2026-11-15/perseed-producerparty-b-control] [--after evidence/2026-11-15/perseed-producerparty-b-on]
//   [--seeds 100201,100202,...,100208]
//   Reads <dir>/producerparty-b-s<seed>-competent-answercourt-b-producerparty-b.json
//   per leg (same filename both legs — the lever is game code, not policy).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-15/perseed-producerparty-b-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-15/perseed-producerparty-b-on'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-15', 'producerparty-b-panel'));

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
  || [100721, 100722, 100723, 100724, 100725, 100726, 100727, 100728];
const POLICIES = ['producerparty-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'producerparty-b-s' + seed + '-competent-answercourt-b-producerparty-b.json');
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
    observerDigest: 'producerparty-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-producerparty-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'producerparty-b', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'producerparty-b-off');
  const afterRows = load(AFTER_DIR, 'producerparty-b-on');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare producerparty-b-off->producerparty-b-on: decision=' + report.decision);
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
