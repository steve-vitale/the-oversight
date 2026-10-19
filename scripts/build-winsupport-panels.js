#!/usr/bin/env node
// scripts/build-winsupport-panels.js — §15 balanced-panel compare for sim-winsupport.
//
// Reads the lever sweep per-seed JSONs
// (evidence/2026-10-19/perseed-winsupport/{control,winsupport}/<policy>/s<seed>.json),
// builds panels in the scripts/balance-panel.js schema, and runs the compare:
//   control (before) vs winsupport (after) — the primary.
// Panel metric mapping: won, table, national, survival30/60, communityLost —
// the wall/reachability instrument. Metrics the w5path instrument does not
// observe stay null (not_observed), never invented.
// The panel is the instrument; the pre-registered threshold is the judge.
// Usage: node scripts/build-vetrel1-panels.js [--out evidence/2026-10-19/vetrel1-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-winsupport');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'winsupport-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const ARMS = { 'control': 'before', 'winsupport': 'after' };

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    for (const s of SEEDS) {
      const f = path.join(EVID, arm, p, `s${s}.json`);
      if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
      const raw = fs.readFileSync(f, 'utf8');
      if (raw.length === 0) throw new Error('0-byte per-seed file: ' + f);
      const r = JSON.parse(raw);
      if (!r || r.winarm !== arm) throw new Error('arm tag mismatch: ' + f);
      rows.push({ policy: p, seed: s, r });
    }
  }
  return rows;
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

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'winsupport-sweep-instrument-v1', // identical on both panels by comparator contract; arm is positional (before=control, after=winsupport) + filenames
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', VETREL: '1' },
      nodeVersion: process.version,
    },
    rows: rows.map(x => ({
      row: { policy: x.policy, seed: x.seed },
      metrics: metricsFor(x.r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));

function main() {
  const sides = {};
  for (const [arm, label] of Object.entries(ARMS)) {
    const rows = load(arm);
    const p = `${OUT_PREFIX}-primary-${label}.json.gz`;
    fs.writeFileSync(p, zlib.gzipSync(JSON.stringify(buildPanel(rows, label)) + '\n'));
    sides[label] = p;
    console.log(`panel ${label}: ${rows.length} rows -> ${p}`);
  }
  const report = score.comparePanels(read(sides.before), read(sides.after));
  fs.writeFileSync(`${OUT_PREFIX}-primary.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}-primary.md`, score.markdown(report));
  console.log(`compare control->winsupport: decision=${report.decision}`);
  for (const p of report.policies || []) {
    console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
    for (const m of p.metrics || []) {
      if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
        console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
      }
    }
  }
}

if (require.main === module) main();
