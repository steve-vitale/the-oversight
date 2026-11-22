// build-pinquaddoor-b-panels.js — balanced-panel build for arm
// sim-pinquaddoor-b (Loop B 2130Z run) AND its wide re-run
// sim-pinquaddoor-wide-b (Loop B 0030Z run; LEVER: PIN THE QUAD +
// OPEN THE DOOR, finding #2619, wide band 106501-106516). Builds
// panels in the scripts/balance-panel.js schema from per-seed JSONs:
// before = the pinquaddoor CONTROL corpus (same band, same policy,
// slot ported, PINQUAD unset), after = the pinquaddoor ARMED corpus
// (same band, same policy, PINQUAD=1). The compare is a SAME-BAND
// LEVER BEFORE/AFTER: the seeds match, so the scorecard pairs by
// matched seed. Case identity is the seed (pseudo-policy
// 'pinquaddoor-b' in both panels; the corpus label lives in
// row.corpus).
// Contract metrics mappable from these JSONs: won, national
// (scaleRank 'national' or higher), survival30/60 (gameDays),
// communityLost (endReason village-lost/village-dead/pop-zero),
// villageDeaths (deaths array length), playerDeaths (not instrumented
// by this driver — left null, never faked). All other contract metrics
// are null (not observed by this instrument).
// Usage: node scripts/build-pinquaddoor-b-panels.js [--out evidence/2026-11-20/pinquaddoor-wide-b-panel]
//   [--before evidence/2026-11-20/perseed-pinquaddoor-wide-b-control] [--after evidence/2026-11-20/perseed-pinquaddoor-wide-b-armed]
//   [--seeds 106501,...,106516] [--before-seeds 106501,...,106516]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const BEFORE_DIR = path.join(REPO, argvVal('--before', 'evidence/2026-11-20/perseed-pinquaddoor-wide-b-control'));
const AFTER_DIR = path.join(REPO, argvVal('--after', 'evidence/2026-11-20/perseed-pinquaddoor-wide-b-armed'));
const OUT_PREFIX = argvVal('--out', path.join(REPO, 'evidence', '2026-11-20', 'pinquaddoor-wide-b-panel'));

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
  || [106501, 106502, 106503, 106504, 106505, 106506, 106507, 106508, 106509, 106510, 106511, 106512, 106513, 106514, 106515, 106516];
const BEFORE_SEEDS = (argvVal('--before-seeds', null) ? argvVal('--before-seeds', '').split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [106501, 106502, 106503, 106504, 106505, 106506, 106507, 106508, 106509, 106510, 106511, 106512, 106513, 106514, 106515, 106516];
const POLICIES = ['pinquaddoor-b']; // pseudo-policy: case identity is the seed (paired design)
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
    observerDigest: 'pinquaddoor-b-instrument-v1',
    contractDigest: contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: seeds, region: null,
      origin: 'sim-pinquaddoor-b',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(function (x) {
      return {
        row: { policy: 'pinquaddoor-b', seed: x.seed, corpus: x.run },
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
  // REPREREG (sim-pinquaddoor-reprereg-b, 2026-11-21): corpus prefix and
  // RUN are env-overridable so a fresh dated run reuses this builder;
  // defaults preserve the wide run exactly.
  const CORPUS_PREFIX = process.env.CORPUS_PREFIX || 'pinquaddoor-wide-b';
  const PANEL_RUN = process.env.RUN || 'pinquaddoor-wide-b';
  const beforeRows = load(BEFORE_DIR, PANEL_RUN + '-control', BEFORE_SEEDS,
    function (seed) { return CORPUS_PREFIX + '-s' + seed + '-' + PANEL_RUN + '-pinquaddoor.json'; });
  const afterRows = load(AFTER_DIR, PANEL_RUN + '-armed', SEEDS,
    function (seed) { return CORPUS_PREFIX + '-s' + seed + '-' + PANEL_RUN + '-pinquaddoor.json'; });
  const beforePath = OUT_PREFIX + '-before.json.gz';
  const afterPath = OUT_PREFIX + '-after.json.gz';
  writeRobust(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, BEFORE_SEEDS)) + '\n'));
  writeRobust(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, SEEDS)) + '\n'));
  console.log('wrote ' + beforePath + ' + ' + afterPath);
  console.log('compare with: node scripts/balance-panel.js compare --before ' + beforePath + ' --after ' + afterPath + ' --out ' + OUT_PREFIX);
}

if (require.main === module) main();
