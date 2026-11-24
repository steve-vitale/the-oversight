// build-fightcap-panels-a.js — §15 balanced-panel build for arm
// sim-fightcap-a (DIAG: can launched parties WIN wave-4 fights? —
// finding #2538, the arrival price). Builds panels in the
// scripts/balance-panel.js schema from the fightcap per-seed
// JSONs: before=ctl leg (LAUNCHPARTY unset), after=arm leg (LAUNCHPARTY=1),
// PAIRED seeds on the same band. Case identity is the seed
// (pseudo-policy 'fightcap-a' in both panels; the corpus label
// lives in row.corpus), so the scorecard reads BASE->ARMED deltas per
// contract metric on paired seeds. The panel is the instrument, NOT the
// judge (the frozen prereg bars are); the BASE->ARMED contrast measures
// the sense fix (the substrate) — reported as such; the panel is
// NOT the judge of the fight-capability question. The two legs share the driver
// filename shape (fightcap-a-s<seed>-fightcap-a-<mode>.json);
// the leg is the DIRECTORY, not the filename.
// Contract metrics mappable from fightcap JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked), table (not instrumented —
// left null, never faked). All other contract metrics are null (not
// observed by this instrument).
// Usage: node scripts/build-fightcap-panels-a.js [--out evidence/2026-11-18/fightcap-a-panel]
//   [--before evidence/2026-11-18/perseed-fightcap-a-ctl] [--after evidence/2026-11-18/perseed-fightcap-a-arm]
//   [--seeds 104501,104502,...,104508]
//   [--prefix launchparty-sense-a] [--run fightcap-a] [--policy fightcap-a] [--origin sim-fightcap-a]
//   Reads <dir>/<prefix>-s<seed>-<run>-<mode>.json per leg.
//   (The driver hardcodes its filename prefix; RUN lands in the middle
//   segment. Defaults are the fightcap-a values; the fightcap-recheck-a
//   port passes --prefix fightcap-recheck-a --run fightcap-recheck-a
//   --policy fightcap-recheck-a --origin sim-fightcap-recheck-a.)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-18/perseed-fightcap-a-ctl'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-18/perseed-fightcap-a-arm'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-18', 'fightcap-a-panel'));

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
  || [104501, 104502, 104503, 104504, 104505, 104506, 104507, 104508];
const PREFIX = argvVal('--prefix', 'launchparty-sense-a');
const RUN = argvVal('--run', 'fightcap-a');
const POLICY = argvVal('--policy', 'fightcap-a');
const ORIGIN = argvVal('--origin', 'sim-fightcap-a');
const POLICIES = [POLICY]; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, mode) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, PREFIX + '-s' + seed + '-' + RUN + '-' + mode + '.json');
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
    observerDigest: 'fightcap-a-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: ORIGIN,
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: POLICY, seed: x.seed, corpus: x.run },
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
  const beforeRows = load(BEFORE_DIR, RUN + '-ctl', 'ctl');
  const afterRows = load(AFTER_DIR, RUN + '-arm', 'arm');
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
