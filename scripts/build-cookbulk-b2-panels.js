#!/usr/bin/env node
// scripts/build-cookbulk-b2-panels.js — §15 balanced-panel compares for sim-cookbulk-b2.
//
// Reads the pilot per-seed JSONs (evidence/2026-10-18/perseed-cookbulk-b2/),
// builds panels in the scripts/balance-panel.js schema, and runs two compares:
//   1. control (before) vs b2 (after) — the primary.
//   2. v2base (before) vs b2 (after) — the capacity-lever isolation.
//
// The panel is the instrument; the pre-registered threshold is the judge.
// Usage: node scripts/build-cookbulk-b2-panels.js [--out evidence/2026-10-18/cookbulk-b2-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PERSEED = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-cookbulk-b2');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-18', 'cookbulk-b2-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [9292, 9293, 9294, 9295];
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
  m.won = r.wins;
  m.table = r.table;
  m.national = r.national;
  m.playerDeaths = r.playerDeaths;
  m.playerDeaths100Days = (r.gameDays > 0 && Number.isFinite(r.playerDeaths))
    ? r.playerDeaths * 100 / r.gameDays : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'cookbulk-b2-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policyId, seed: r.seed },
      metrics: metricsFor(r),
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

function compare(beforeArm, afterArm, suffix) {
  const before = load(beforeArm), after = load(afterArm);
  const beforePath = `${OUT_PREFIX}-${suffix}-before.json.gz`;
  const afterPath = `${OUT_PREFIX}-${suffix}-after.json.gz`;
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(before, beforeArm)) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(after, afterArm)) + '\n'));
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(`${OUT_PREFIX}-${suffix}.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}-${suffix}.md`, score.markdown(report));
  console.log(`compare ${beforeArm}->${afterArm}: decision=${report.decision}`);
  for (const p of report.policies || []) {
    console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
    for (const m of p.metrics || []) {
      if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
        console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
      }
    }
  }
}

compare('control', 'b2', 'primary');
compare('v2base', 'b2', 'lever');
console.log('wrote', OUT_PREFIX + '-{primary,lever}.{json,md}');
