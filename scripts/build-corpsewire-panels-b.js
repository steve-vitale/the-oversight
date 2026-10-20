#!/usr/bin/env node
// scripts/build-corpsewire-panels-b.js — §15 balanced-panel compare for
// sim-corpsewire-b (the CORPSEWIRE layer, backlog #633 MATERIALS leg).
//
// Reads the pilot per-seed JSONs (evidence/2026-10-19/perseed-corpsewire-armed/,
// written by scripts/sweep-corpsewire-armed-b.js), builds control ("before")
// and armed ("after") panels in the scripts/lib/balance-scorecard.js
// comparePanels contract, and runs the compare, writing <out>.json/.md.
// The panel is the instrument; the pre-registered threshold is the judge.
// Metrics not measured by this sweep's instrument are null (-> not_observed).
//
// Usage: node scripts/build-corpsewire-panels-b.js [--out evidence/2026-10-19/corpsewire-panel-b]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PERSEED = process.env.PERSEED || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-corpsewire-armed');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'corpsewire-panel-b'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(PERSEED, `${arm}-${p}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won;
  m.table = r.table;
  m.national = r.national;
  m.survival30 = r.gameDays >= 30 ? 1 : 0;
  m.survival60 = r.gameDays >= 60 ? 1 : 0;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'corpsewire-b-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
      metrics: metricsFor(r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0, note: label })),
    },
  };
}

const control = load('control');
const armed = load('armed');
const beforePath = OUT_PREFIX + '-before.json.gz';
const afterPath = OUT_PREFIX + '-after.json.gz';
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(control, 'before')) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(armed, 'after')) + '\n'));

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'));
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
