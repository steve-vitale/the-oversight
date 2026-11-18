// build-partysize4-b-panels.js — §balanced-panel build for arm
// sim-partysize4-rerun-b (BUILD: the PARTYSIZE4 lever — 4th companion seat
// on wave-4+ hunt plans, 150d horizon). Builds panels in the
// scripts/balance-panel.js schema from the partysize4 per-seed JSONs
// (which reuse the partyquads driver output shape):
// before=ctl leg (PARTYSIZE4 unset), after=arm leg (PARTYSIZE4=1),
// PAIRED seeds on the same tip. Case identity is the seed
// (pseudo-policy 'partysize4-rerun-b' in both panels; the corpus label
// lives in row.corpus), so the scorecard reads CTL->ARM deltas per
// contract metric on paired seeds. The panel is the instrument, NOT
// the judge (the frozen prereg bars are). The lever adds one
// companion to some wave-4 launches, so the panel expectation is
// small or no material signal on the wall metrics — trajectories
// diverge only where the lever fires.
// Contract metrics mappable from partysize4 JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-partysize4-b-panels.js [--out evidence/2026-11-18/partysize4-b-panel]
//   [--before evidence/2026-11-18/perseed-partysize4-b-ctl] [--after evidence/2026-11-18/perseed-partysize4-b-arm]
//   [--seeds 104704,104705,...,104711]
//   Reads <dir>/partysize4-b-s<seed>-partysize4-b-<ctl|arm>.json per leg.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-18/perseed-partysize4-b-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-18/perseed-partysize4-b-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-18', 'partysize4-b-panel'));

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
  || [104704, 104705, 104706, 104707, 104708, 104709, 104710, 104711];
const POLICIES = ['partysize4-rerun-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, run) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'partysize4-b-s' + seed + '-partysize4-rerun-b-' + run + '.json');
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
    observerDigest: 'partysize4-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-partysize4-rerun-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'partysize4-rerun-b', seed: x.seed, corpus: x.run },
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
  // (the partysize4-b contrast). The allycap contrast runs BOTH legs
  // with MODE=arm (both carry PARTYSIZE4=1; only FIGHTALLY2 differs),
  // so it passes --mode-before arm --mode-after arm.
  const beforeRows = load(BEFORE_DIR, 'partysize4-b-ctl', argvVal('--mode-before', 'ctl'));
  const afterRows = load(AFTER_DIR, 'partysize4-b-arm', argvVal('--mode-after', 'arm'));
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
