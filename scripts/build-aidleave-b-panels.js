// build-aidleave-b-panels.js — balanced-panel build for arm
// sim-aidleave-b (DIAG: the aid-path leave-hit, finding #2540,
// 150d horizon). Builds panels in the scripts/balance-panel.js
// schema from the aidleave per-seed JSONs (which reuse the
// launchfunnel driver output shape):
// before=ctl leg (VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 —
// substrate on, lever off), after=arm leg (ctl + FLEEREPAIR3=1 —
// lever on), PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'aidleave-b' in both panels; the corpus label lives
// in row.corpus), so the scorecard reads CTL->ARM deltas per contract
// metric on paired seeds. The panel is the instrument, NOT the judge
// (the frozen prereg bars are).
// Contract metrics mappable from aidleave JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-aidleave-b-panels.js [--out evidence/2026-11-18/aidleave-b-panel]
//   [--before evidence/2026-11-18/perseed-aidleave-b-ctl] [--after evidence/2026-11-18/perseed-aidleave-b-arm]
//   [--seeds 104411,104412,...,104418]
//   Reads <dir>/aidleave-b-s<seed>-aidleave-b-<ctl|arm>.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-18/perseed-aidleave-b-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-18/perseed-aidleave-b-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-18', 'aidleave-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the seedland builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The seedland pseudo-panels compared cleanly under this digest on
// this tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [104411, 104412, 104413, 104414, 104415, 104416, 104417, 104418];
const POLICIES = ['aidleave-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'aidleave-b-s' + seed + '-aidleave-b-' + run + '.json');
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
  m.villageDeaths = Array.isArray(r.deaths) ? r.deaths.length : (r.deaths || 0);
  m.villageDeaths100Days = ((r.gameDays || 0) > 0) ? m.villageDeaths * 100 / r.gameDays : null;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'aidleave-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-aidleave-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'aidleave-b', seed: x.seed, corpus: x.run },
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
  // --mode-before/--mode-after (sim-fleerepair3-allycap-b): the MODE
  // suffix on the per-seed filenames in each leg dir. Defaults ctl/arm
  // (the aidleave-b contrast). The allycap contrast runs BOTH legs
  // with MODE=arm (both carry PARTYSIZE4=1; only FIGHTALLY2 differs),
  // so it passes --mode-before arm --mode-after arm.
  const beforeRows = load(BEFORE_DIR, 'aidleave-b-ctl', argvVal('--mode-before', 'ctl'));
  const afterRows = load(AFTER_DIR, 'aidleave-b-arm', argvVal('--mode-after', 'arm'));
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
