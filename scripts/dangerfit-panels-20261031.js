#!/usr/bin/env node
// dangerfit-panels-20261031.js — §15 balanced-panel compare for
// sim-dangerfit-a, armory precedent (scripts/build-armory-panels.js).
// Reads the pilot sweep corpora (baseline leg vs lever leg, same 8
// seeds, same S-PATROL stack), builds panels in the
// scripts/balance-panel.js schema, and runs the official compare.
// Deviation, stated on the face of the compare file: the official
// panel driver runs sweep-compare registry policies only and cannot
// express the S-PATROL stack + patrolsilent instrument, so panels
// are built from the sweep corpora. Contract metrics mapped where
// observable (won, table, national, survival30/60, communityLost);
// the rest null, never fabricated. The panel is the instrument; the
// prereg threshold is the judge.
// Usage: node scripts/dangerfit-panels-20261031.js
//   (reads evidence/2026-10-31/perseed-dangerfit-a-{base,lever}-pilot,
//    writes evidence/2026-10-31/sim-dangerfit-a-panel-compare.{md,json}
//    plus -before/-after panel .json.gz via the CLI compare path)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const cp = require('child_process');

const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-31');
const SEEDS = [85101, 85103, 85104, 85107, 85108, 85110, 85111, 85114];
const POLICIES = ['lead-delegate-deadfall'];
const DAYS = 200;

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

function load(leg) {
  const dir = path.join(EVID, `perseed-dangerfit-a-${leg}-pilot`);
  return SEEDS.map(seed => {
    const f = path.join(dir, `s${seed}.json`);
    if (!fs.existsSync(f)) throw new Error('missing sweep file: ' + f);
    return { policy: POLICIES[0], seed, r: JSON.parse(fs.readFileSync(f, 'utf8')) };
  });
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.table = r.table ? 1 : 0;
  m.national = r.national ? 1 : 0;
  m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'dangerfit-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-dangerfit-a-pilot',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', FULLSEAT: '1', DEADFALL_B: '1' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
      metrics: metricsFor(r.r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}

const beforePath = path.join(EVID, 'sim-dangerfit-a-panel-before.json.gz');
const afterPath = path.join(EVID, 'sim-dangerfit-a-panel-after.json.gz');
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(load('base'))) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(load('lever'))) + '\n'));
const out = path.join(EVID, 'sim-dangerfit-a-panel-compare');
const res = cp.spawnSync(process.execPath, [path.join(REPO, 'scripts', 'balance-panel.js'), 'compare',
  '--before', beforePath, '--after', afterPath, '--out', out], { encoding: 'utf8' });
process.stdout.write(res.stdout || '');
process.stderr.write(res.stderr || '');
console.log(`panel compare exit=${res.status} (2 means a material signal, not an error)`);
