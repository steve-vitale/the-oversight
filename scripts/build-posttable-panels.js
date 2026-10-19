#!/usr/bin/env node
// build-posttable-panels.js — §15 balanced-panel instrument run for
// sim-posttable.
//
// Reads the sweep JSONs (evidence/2026-10-19/perseed-posttable/), builds the
// panel in the scripts/balance-panel.js schema, and runs the compare as a
// SELF-COMPARE (before = after = the single diagnostic corpus). This is a
// pure diagnostic: there is no lever and no before/after treatment, so the
// only valid panel compare is the corpus against itself — it exercises the
// §15 instrument on the corpus and documents the metric distributions. The
// pre-registered DIAG-GO bar (≥12/16 table-reaching runs fully attributed,
// 0 unattributed) is the judge; the panel is the instrument.
//
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost, npcHungry — the wall/reachability
// instrument (same mapping as build-armory-panels.js).
// Usage: node scripts/build-posttable-panels.js [--out evidence/2026-10-19/posttable-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-posttable');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19', 'posttable-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load() {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(SWEEP_DIR, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
  const attr = r.deathsAttributed || {};
  const playerDeaths = ((attr.attributed || []).filter(d => d.player)).length;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? playerDeaths * 100 / r.gameDays : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  const starv = ((attr.causeSpace || {}).starvation | 0) + ((attr.causeSpace || {})['starved'] | 0);
  m.npcHungry = starv > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    // Self-compare: before and after are the same corpus, so flags and
    // observerDigest are identical by construction.
    observerDigest: 'posttable-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-posttable',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1' },
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

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));

const rows = load();
const beforePath = `${OUT_PREFIX}-before.json.gz`;
const afterPath = `${OUT_PREFIX}-after.json.gz`;
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(rows)) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(rows)) + '\n'));
const report = score.comparePanels(read(beforePath), read(afterPath));
fs.writeFileSync(`${OUT_PREFIX}.json`, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(`${OUT_PREFIX}.md`, score.markdown(report));
console.log(`self-compare corpus->corpus: decision=${report.decision}`);
for (const p of report.policies || []) {
  console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
    }
  }
}
if (report.decision === 'invalid') { console.error('errors:', (report.errors || []).join(' | ')); process.exit(2); }
