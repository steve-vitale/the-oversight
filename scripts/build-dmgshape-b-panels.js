// build-dmgshape-b-panels.js — balanced-panel build for arm
// sim-dmgshape-b (Loop B 0530Z run; DIAGNOSTIC: the damage-per-launch
// re-measurement, finding #2605, designated band 106181-106188; no
// lever). Builds panels in the scripts/balance-panel.js schema from
// per-seed JSONs: before = the frozen dmgsurvey designated-band corpus
// (seeds 106181-106188, full substrate, slot env-only), after = the
// dmgshape-b corpus (same band, same policy, slot PORTED). The compare
// is a SAME-BAND REPRODUCIBILITY REFERENCE, not a lever before/after:
// the seeds match, so the scorecard pairs by matched seed. Case
// identity is the seed (pseudo-policy 'dmgshape-b' in both panels; the
// corpus label lives in row.corpus).
// Contract metrics mappable from these JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-dmgshape-b-panels.js [--out evidence/2026-11-20/dmgshape-b-panel]
//   [--before evidence/2026-11-20/perseed-dmgsurvey-b-106181-106188] [--after evidence/2026-11-20/perseed-dmgshape-b]
//   [--seeds 106181,...,106188] [--before-seeds 106181,...,106188]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-20/perseed-dmgsurvey-b-106181-106188'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-20/perseed-dmgshape-b'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-20', 'dmgshape-b-panel'));

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
  || [106181, 106182, 106183, 106184, 106185, 106186, 106187, 106188];
const BEFORE_SEEDS = (argvVal('--before-seeds', null) ? argvVal('--before-seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [106181, 106182, 106183, 106184, 106185, 106186, 106187, 106188];
const POLICIES = ['dmgshape-b']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 150;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function load(dir, leg, seeds, nameFn) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, nameFn(seed));
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

function buildPanel(rows, seeds) {
  return {
    schemaVersion: 1,
    observerDigest: 'dmgshape-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: seeds, region: null,
      origin: 'sim-dmgshape-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'dmgshape-b', seed: x.seed, corpus: x.run },
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

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust (copied from scripts/dmgshape-driver-b.js): the host
// write flap EPERMs plain writeFileSync in bursts — write to a tmp
// file, verify by readback, then rename, retrying 480x250ms so a
// passing burst is caught instead of failing the build outright.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath);
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp);
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n'); throw e; }
      sleepMs(250);
    }
  }
}

function main() {
  // --mode-before/--mode-after (sim-fleerepair3-allycap-b): the MODE
  // suffix on the per-seed filenames in each leg dir. Defaults ctl/arm
  // (the allyslot3-b contrast). The allycap contrast runs BOTH legs
  // with MODE=arm (both carry PARTYSIZE4=1; only FIGHTALLY2 differs),
  // so it passes --mode-before arm --mode-after arm.
  const beforeRows = load(BEFORE_DIR, 'dmgsurvey-b', BEFORE_SEEDS,
    function (seed) { return 'dmgsurvey-b-s' + seed + '-dmgsurvey-b-vre.json'; });
  const afterRows = load(AFTER_DIR, 'dmgshape-b', SEEDS,
    function (seed) { return 'dmgshape-b-s' + seed + '-dmgshape-b-dmgshape.json'; });
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  writeRobust(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, BEFORE_SEEDS)) + '\n'));
  writeRobust(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, SEEDS)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
