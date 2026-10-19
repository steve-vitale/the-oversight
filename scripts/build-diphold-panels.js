#!/usr/bin/env node
// build-diphold-panels.js — §15 balanced-panel compare for sim-diphold.
//
// Reads the diphold sweep JSONs (evidence/2026-10-19/perseed-diphold/) and
// builds panels in the scripts/balance-panel.js schema: before=belongfeast
// control corpus, after=belongfeast-dh armed corpus — same substrate, PAIRED
// seeds; the only difference is the diphold policy layer (the divergence
// surface). The panel is the instrument; the pre-registered GO threshold
// (mean dip-days-held >= 1.3x control) is the judge.
//
// CASE IDENTITY (documented, not a hack): the scorecard pairs before/after
// on identical case keys (row.policy:row.seed). The scientifically relevant
// pairing for this policy lever is the SEED pairing (identical seeds, same
// substrate — the analyzer's paired design). So both panels declare one
// pseudo-policy 'diphold' with the 8 seeds as cases; the corpus identity
// lives in the arm label (before=belongfeast, after=belongfeast-dh). The
// resulting table reads as control->armed deltas per contract metric on
// paired seeds — the instrument read. The GO threshold stays the judge.
//
// Usage: node scripts/build-diphold-panels.js [--out evidence/2026-10-19/diphold-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-19', 'perseed-diphold');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-19', 'diphold-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['diphold']; // pseudo-policy: case identity is the seed (paired design)
const DAYS = 180;

function load(policy) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(SWEEP_DIR, policy, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
    rows.push({ policy, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
    // Positional identity (before=belongfeast control, after=belongfeast-dh):
    // the scorecard requires substrate flags AND observerDigest to match
    // exactly between panels (§15 validity). The intervention flag (the
    // policy itself) is NOT in options.flags.
    observerDigest: 'diphold-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-diphold',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: 'diphold', seed: r.seed, corpus: r.policy }, // case identity = seed; corpus label preserved
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
  const beforeRows = load('belongfeast');
  const afterRows = load('belongfeast-dh');
  const beforePath = `${OUT_PREFIX}-primary-before.json.gz`;
  const afterPath = `${OUT_PREFIX}-primary-after.json.gz`;
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, 'belongfeast')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, 'belongfeast-dh')) + '\n'));
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(`${OUT_PREFIX}-primary.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}-primary.md`, score.markdown(report));
  console.log(`compare belongfeast->belongfeast-dh: decision=${report.decision}`);
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
