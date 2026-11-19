// build-partysurvive-b-panels.js — §balanced-panel build for arm
// sim-partysurvive-b (DIAGNOSTIC: launch-party survival-to-the-fight
// decomposition — no lever judged). Builds panels in the
// scripts/balance-panel.js schema from the fightcap-driver-b per-seed
// JSONs: before = the FROZEN fightcap-b arm corpus (seeds
// 104770–104777), after = this arm's fresh-band corpus (seeds
// 105941–105948), same substrate (SENSEEXPED=1 PARTYSIZE4=1
// VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1), different
// bands — a same-substrate REPRODUCIBILITY reference, NOT a lever
// before/after (the seeds differ, so no paired deltas are claimed).
// Case identity is the seed; the corpus label lives in row.corpus.
// The panel is the instrument, NOT the judge (the frozen prereg bars
// are). Expectation: wall metrics roughly reproduce across bands —
// trajectories diverge only by seed band, not by any lever.
// Contract metrics mappable from fightcap-driver JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-partysurvive-b-panels.js [--out evidence/2026-11-19/partysurvive-b-panel]
//   [--before evidence/2026-11-19/perseed-fightcap-b-arm] [--after evidence/2026-11-19/perseed-partysurvive-b]
// Reads <dir>/fightcap-b-s<seed>-<run>-arm.json per leg.
// (Adapted from scripts/build-allyslot3-rerun-b-panels.js.)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-19/perseed-fightcap-b-arm'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-19/perseed-partysurvive-b'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-19', 'partysurvive-b-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const BEFORE_SEEDS = [104770, 104771, 104772, 104773, 104774, 104775, 104776, 104777];
// Re-run parametrization (2026-11-19 sim-partysurvive-rerun-b): the
// after seeds/run/origin are argv-overridable; defaults preserve the
// frozen 1230Z behavior exactly (seeds 105941–105948, run
// 'partysurvive-b'). No default changed.
const AFTER_SEEDS = (argvVal('--after-seeds', '105941,105942,105943,105944,105945,105946,105947,105948')).split(',').map(function (s) { return parseInt(s, 10); });
const AFTER_RUN = argvVal('--after-run', 'partysurvive-b');
const AFTER_ORIGIN = argvVal('--after-origin', 'sim-partysurvive-b');
const POLICIES = ['competent'];
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, seeds, run, leg) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'fightcap-b-s' + seed + '-' + run + '-arm.json');
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

function buildPanel(rows, seeds, origin) {
  return {
    schemaVersion: 1,
    observerDigest: 'partysurvive-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: seeds, region: null,
      origin: origin,
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'competent', seed: x.seed, corpus: x.run },
        metrics: metricsFor(x.r),
        warnings: [], observerErrors: [], gear: { errors: [] },
      };
    }),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(function (p) { return { policy: p, seed: seeds[0], match: true, warnings: 0 }; }),
    },
  };
}

function main() {
  const beforeRows = load(BEFORE_DIR, BEFORE_SEEDS, 'fightcap-b', 'fightcap-b-arm');
  const afterRows = load(AFTER_DIR, AFTER_SEEDS, AFTER_RUN, AFTER_RUN);
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, BEFORE_SEEDS, 'sim-fightcap-b')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, AFTER_SEEDS, AFTER_ORIGIN)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
