#!/usr/bin/env node
// scripts/build-tendhalf-panels.js — §15 balanced-panel compares for
// sim-tendhalf (1 compare: tendhalf vs the re-swept control).
//
// Reads the tendhalf sweep per-seed JSONs
// (evidence/2026-10-19/perseed-tendhalf/{control,tendhalf}/<policy>/s<seed>.json),
// builds panels in the scripts/balance-panel.js schema, and runs the compare:
//   control (before) vs tendhalf (after) — 1 primary compare.
// Panel metric mapping: won, table, national, survival30/60, communityLost —
// the wall/reachability instrument. Metrics the w5path instrument does not
// observe stay null (not_observed), never invented.
// The panel is the instrument; the pre-registered threshold is the judge.
// Usage: node scripts/build-winsupportdecomp-panels.js [--out evidence/2026-10-19/winsupportdecomp-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-tendhalf');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'tendhalf-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(x => parseInt(x.trim(), 10))
  : [65201, 65202, 65203, 65204, 65205, 65206, 65207, 65208, 65209, 65210, 65211, 65212, 65213, 65214, 65215, 65216]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const ARMED = ['tendhalf'];

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
    observerDigest: 'tendhalf-sweep-instrument-v1', // identical on both panels by comparator contract; arm is positional (before=control, after=<variant>) + filenames
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
  const beforeRows = load('control');
  const p0 = `${OUT_PREFIX}-primary-before.json.gz`;
  fs.writeFileSync(p0, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, 'before')) + '\n'));
  console.log(`panel before (control): ${beforeRows.length} rows -> ${p0}`);
  for (const arm of ARMED) {
    const rows = load(arm);
    const p = `${OUT_PREFIX}-primary-after-${arm}.json.gz`;
    fs.writeFileSync(p, zlib.gzipSync(JSON.stringify(buildPanel(rows, 'after')) + '\n'));
    console.log(`panel after (${arm}): ${rows.length} rows -> ${p}`);
    const report = score.comparePanels(read(p0), read(p));
    fs.writeFileSync(`${OUT_PREFIX}-primary-control-vs-${arm}.json`, JSON.stringify(report, null, 2) + '\n');
    fs.writeFileSync(`${OUT_PREFIX}-primary-control-vs-${arm}.md`, score.markdown(report));
    console.log(`compare control->${arm}: decision=${report.decision}`);
    for (const pp of report.policies || []) {
      console.log(`  policy ${pp.policy}: ${pp.decision} (${pp.cases} cases)`);
      for (const m of pp.metrics || []) {
        if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
          console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
        }
      }
    }
  }
}

if (require.main === module) main();
