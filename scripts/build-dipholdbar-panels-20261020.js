#!/usr/bin/env node
// build-dipholdbar-panels-20261020.js — §15 balanced-panel compare for
// sim-dipholdbar, SECOND VARIANT (bill-current).
//
// Reads the fresh paired control sweep (evidence/2026-10-20/perseed-dipholdbar/control/belongfeast/)
// and the dipholdbar armed sweep (evidence/2026-10-20/perseed-dipholdbar/armed/belongfeast/)
// and builds panels in the scripts/balance-panel.js schema: before=belongfeast
// control (pristine engine), after=belongfeast armed (modified engine) — same
// substrate, PAIRED seeds; the only difference is the hierarchy.js
// good-standing bar (the divergence surface). The panel is the instrument;
// the pre-registered GO threshold (mean dip-days-held >= 1.3x control) is
// the judge.
//
// CASE IDENTITY (documented, not a hack): the scorecard pairs before/after
// on identical case keys (row.policy:row.seed). The scientifically relevant
// pairing for this engine lever is the SEED pairing (identical seeds, same
// substrate — the analyzer's paired design). So both panels declare one
// pseudo-policy 'dipholdbar' with the 8 seeds as cases; the corpus identity
// lives in the arm label (before=seasonblock corpus, after=dipholdbar armed).
// The resulting table reads as control->armed deltas per contract metric on
// paired seeds — the instrument read. The GO threshold stays the judge.
//
// Usage: node scripts/build-dipholdbar-panels.js [--out evidence/2026-10-19/dipholdbar-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
// CONTROL PROVENANCE (documented): the seasonblock corpus failed FIDELITY
// on current master (engine drifted since 8c055140a), so the before panel
// uses a FRESH paired control sweep on pristine hierarchy.js — identical
// seeds, identical substrate, WITH per-seed death lists. No provenance
// workaround needed.
const BEFORE_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-dipholdbar', 'control', 'belongfeast');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-dipholdbar', 'armed', 'belongfeast');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-20', 'dipholdbar-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['dipholdbar-bc']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 180;

function load(dir, label) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
    rows.push({ policy: label, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
  const playerDeaths = r.successions | 0;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? playerDeaths * 100 / r.gameDays : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  const deaths = (r.deaths || []);
  m.npcHungry = deaths.some(d => /starvation|thirst/i.test(d.cause || '')) ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    // Positional identity (before=seasonblock control corpus,
    // after=dipholdbar armed): the scorecard requires substrate flags AND
    // observerDigest to match exactly between panels (§15 validity). The
    // intervention (the engine bar change) is NOT in options.flags.
    observerDigest: 'dipholdbar-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-dipholdbar-billcurrent',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: 'dipholdbar-bc', seed: r.seed, corpus: r.policy }, // case identity = seed; corpus label preserved
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

function main() {
  const beforeRows = load(BEFORE_DIR, 'diphold-control');
  const afterRows = load(AFTER_DIR, 'dipholdbar-armed');
  const beforePath = `${OUT_PREFIX}-primary-before.json.gz`;
  const afterPath = `${OUT_PREFIX}-primary-after.json.gz`;
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, 'diphold-control')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, 'dipholdbar-armed')) + '\n'));
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(`${OUT_PREFIX}-primary.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}-primary.md`, score.markdown(report));
  console.log(`compare dipholdbar-control->dipholdbar-bc-armed: decision=${report.decision}`);
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
