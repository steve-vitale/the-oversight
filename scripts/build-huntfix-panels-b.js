#!/usr/bin/env node
// scripts/build-huntfix-panels-b.js — §15 balanced-panel compare for
// sim-huntfix-b (the engine-side hunt-detector wiring fix).
//
// Reads the pilot per-seed JSONs (evidence/2026-10-19/perseed-huntfix-b/,
// schema 'huntfix-wall/1'), builds control ("before") and armed ("after")
// panels in the scripts/balance-panel.js schema (scripts/lib/
// balance-scorecard.js comparePanels contract), and runs the compare,
// writing <out>.json/.md.
//
// The panel is the instrument; the pre-registered threshold is the judge.
// Metrics not measured by this sweep's instrument are null (-> not_observed).
// HUNTSTAFF=1 on BOTH arms (the wiring only matters when hunts are staffed);
// the before/after split itself is the treatment — the layer flag is NOT in
// panel flags (same convention as the huntstaff panels).
// Neutrality: the det-gate (test-huntfix-b.js Part B) pins gate-off
// byte-identical trajectories (8 seeds x 2 policies x 60d, fix present vs
// pristine control).
//
// Usage: node scripts/build-huntfix-panels-b.js [--out evidence/2026-10-19/huntfix-panel-b]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PERSEED = process.env.PERSEED || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-huntfix-b');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'huntfix-panel-b'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [31601, 31602, 31603, 31604, 31605, 31606, 31607, 31608]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(PERSEED, `${arm}-${p}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    const r = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (r.schema !== 'huntfix-wall/1') throw new Error('schema mismatch in ' + f);
    rows.push(r);
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.wins;
  m.table = r.table;
  m.national = r.national;
  m.survival30 = r.gameDays >= 30 ? 1 : 0;
  m.survival60 = r.gameDays >= 60 ? 1 : 0;
  m.playerDeaths = r.playerDeaths;
  m.playerDeaths100Days = (r.gameDays > 0 && Number.isFinite(r.playerDeaths))
    ? r.playerDeaths * 100 / r.gameDays : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'huntfix-b-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0', HUNTSTAFF: '1-both-arms' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policyId, seed: r.seed },
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
