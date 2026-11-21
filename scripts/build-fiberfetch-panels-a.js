// build-fiberfetch-panels-a.js — §15 balanced-panel build for arm
// sim-fiberfetch-a (FIBERFETCH: the trailhead fiber fetch — at the
// departure arrow-craft attempt for a served bow, if pile fiber is
// short, the crafter gathers the missing fiber at the departure
// site; DEPMAT + ROLL35 + AMMO substrate on the arm leg only,
// gate ON both legs under live BOWCRAFT — finding #2590 serve half).
// Cloned from build-ammo-panels-a.js: the ammo builder hardcodes
// its RUN segment, and the fiberfetch driver writes
// RUN=fiberfetch-a corpora (prefix 'fiberfetch-a').
// Builds panels in the scripts/balance-panel.js schema from the
// fiberfetch per-seed JSONs: before=ctl leg (substrate OFF),
// after=arm leg (DEPMAT=1, ROLL35=1, AMMO=1, FIBERFETCH=1), PAIRED
// seeds on the same band. Case identity is the seed (pseudo-policy
// 'fiberfetch-a' in both panels; the corpus label lives in
// row.corpus), so the scorecard reads BASE->ARMED deltas per
// contract metric on paired seeds. The panel is the instrument,
// NOT the judge (the frozen prereg bars are); the BASE->ARMED
// contrast measures the fiber-fetch effect — reported as such. The
// two legs share the driver filename shape
// (fiberfetch-a-s<seed>-fiberfetch-a-<mode>.json); the leg is the
// DIRECTORY, not the filename.
// Contract metrics mappable from fiberfetch JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked), table (not instrumented —
// left null, never faked). All other contract metrics are null (not
// observed by this instrument).
// Usage: node scripts/build-fiberfetch-panels-a.js [--out evidence/2026-11-21/fiberfetch-a-panel]
//   [--before evidence/2026-11-21/perseed-fiberfetch-a-ctl] [--after evidence/2026-11-21/perseed-fiberfetch-a-arm]
//   [--seeds 107101,107102,107103,107104,107105,107106,107107,107108]
//   Reads <dir>/fiberfetch-a-s<seed>-fiberfetch-a-<mode>.json per leg.
//   (The driver hardcodes its filename prefix 'fiberfetch-a';
//   RUN=fiberfetch-a lands in the middle segment.)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-21/perseed-fiberfetch-a-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-21/perseed-fiberfetch-a-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-21', 'fiberfetch-a-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
// (Same note as the notickexact builder: the builder hashes
// scripts/balance-metrics.json into contractDigest while
// balance-panel.js hashes the NORMALIZED source text of the same file.
// The notickexact pseudo-panels compared cleanly under this digest on
// this tip, so this builder keeps the identical construction.)
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || (argvVal('--seeds', null) ? argvVal('--seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [107101, 107102, 107103, 107104, 107105, 107106, 107107, 107108];
const POLICIES = ['fiberfetch-a']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, mode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'fiberfetch-a-s' + seed + '-fiberfetch-a-' + mode + '.json');
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
    observerDigest: 'fiberfetch-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-fiberfetch-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'fiberfetch-a', seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, 'fiberfetch-a-ctl', 'ctl');
  const afterRows = load(AFTER_DIR, 'fiberfetch-a-arm', 'arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
