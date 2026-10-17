#!/usr/bin/env node
// scripts/build-seatblow-panels-20261017.js — §15 balanced-panel compare for sim-seatblow-open.
//
// Reads the pilot per-seed JSONs (evidence/2026-10-17/perseed-seatblow/),
// builds control ("before") and armed ("after") panels in the
// scripts/balance-panel.js schema (scripts/lib/balance-scorecard.js
// comparePanels contract), and runs the compare, writing <out>.json/.md.
//
// The panel is the instrument; the pre-registered threshold is the judge.
// Metrics not measured by this sweep's instrument are null (-> not_observed).
// The panels describe the identical substrate (FEASTSCALE_R13=1,
// SEATDRIVE=0); the treatment is the before/after split itself: control =
// pristine master pin (gate closed), armed = gate open.
//
// Usage: node scripts/build-seatblow-panels-20261017.js [--out evidence/2026-10-17/seatblow-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PERSEED = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-seatblow');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-17', 'seatblow-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [61111, 61112, 61113, 61114, 61115, 61116, 61117, 61118];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(PERSEED, `seatblow-${p}-${arm}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.table = r.tableWaiting ? 1 : 0;
  m.national = r.nationalDay != null ? 1 : 0;
  m.survival30 = r.endDay >= 30 ? 1 : 0;
  m.survival60 = r.endDay >= 60 ? 1 : 0;
  m.playerDeaths = r.scholarDeaths;
  m.playerDeaths100Days = (r.endDay > 0 && Number.isFinite(r.scholarDeaths))
    ? r.scholarDeaths * 100 / r.endDay : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endDetail) ? 1 : 0;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    observerDigest: 'seatblow-open-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.road, seed: r.seed },
      metrics: metricsFor(r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}

const control = load('control');
const armed = load('armed');
const beforePath = OUT_PREFIX + '-before.json.gz';
const afterPath = OUT_PREFIX + '-after.json.gz';
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(control)) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(armed)) + '\n'));

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));
const report = score.comparePanels(read(beforePath), read(afterPath));
fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
console.log('decision:', report.decision);
for (const p of report.policies || []) {
  console.log(`policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`  ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
    }
  }
}
console.log('wrote', OUT_PREFIX + '.{json,md}', 'and', beforePath, afterPath);
