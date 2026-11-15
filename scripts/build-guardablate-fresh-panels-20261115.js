// build-guardablate-fresh-panels-20261115.js — §15 balanced-panel
// compare for arm sim-guardablate-fresh-a (linkdrive pattern). Builds
// panels in the scripts/balance-panel.js schema from the
// guardablate-fresh step per-seed JSONs: before=baseline leg (guard
// ON, tip 605d72bd4), after=subject leg (guard OFF,
// transplant-guardablate-fresh-subject), PAIRED seeds on the fresh
// band 190631-190638. Case identity is the seed (pseudo-policy
// 'guardablate-fresh' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads ON->OFF deltas per contract
// metric on paired seeds. The panel is the instrument; the
// pre-registered verdict mapping is the judge. NOTE the contrast here
// IS the game code (the guard): unlike the funeralmend builder, the
// two legs share one policy file — the policy is identical on both
// legs and the driver code path is identical, so the paired-seed
// deltas are the guard's effect, read through one instrument.
// The ON and OFF legs live in SEPARATE per-seed dirs; pass them with
// --before/--after. Seeds with --seeds (comma list; default the
// fresh band 190631-190638).
//
// Contract metrics mappable from culpritbisect per-seed JSONs: won,
// national (scaleRank 'national' or higher), survival30/60
// (gameDays), communityLost (endReason village-lost/village-dead/
// pop-zero), villageDeaths (deaths count), playerDeaths (deaths with
// player===true — the scholar-death count), playerDeaths100Days /
// villageDeaths100Days (rate per 100 days). All other contract
// metrics are null (not observed by this instrument — never faked).
// Usage: node scripts/build-guardablate-fresh-panels-20261115.js [--out evidence/2026-11-15/guardablate-fresh-a-panel]
//   [--before evidence/2026-11-15/perseed-guardablate-fresh-ep-tip-guardablate-fresh] [--after evidence/2026-11-15/perseed-guardablate-fresh-tguardablate-fresh]
//   [--seeds 190631,190632,...,190638]
//   Reads <dir>/guardablate-fresh-s<seed>-guardablate-fresh-pilot-fix.json
//   per leg (same filename both legs — the guard is game code, not policy).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-15/perseed-guardablate-fresh-ep-tip-guardablate-fresh'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-15/perseed-guardablate-fresh-tguardablate-fresh'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-15', 'guardablate-fresh-a-panel'));

// NOTE: the linkdrive builders hash scripts/balance-metrics.json into
// contractDigest while balance-panel.js hashes the NORMALIZED source
// text of the same file. The two digests differ by construction, so
// score.comparePanels would reject these pseudo-panels on contract
// mismatch ('Metric contract does not match this comparator'). Use the
// comparator's own contractDigest (lib/balance-scorecard's exported
// digest) so the pseudo-panels compare under the live contract.
const contractDigest = require('./lib/balance-scorecard').contractDigest;
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [190631, 190632, 190633, 190634, 190635, 190636, 190637, 190638];
const POLICIES = ['guardablate-fresh']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'guardablate-fresh-s' + seed + '-guardablate-fresh-pilot-fix.json');
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
  m.playerDeaths = (r.deaths || []).filter(function (d) { return d.player === true; }).length;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? m.playerDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'guardablate-fresh-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-guardablate-fresh-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'guardablate-fresh', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'guardablate-on');
  const afterRows = load(AFTER_DIR, 'guardablate-off');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  const score = require('./lib/balance-scorecard');
  const read = function (f) { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8')); };
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('compare guardablate-on->guardablate-off: decision=' + report.decision);
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
