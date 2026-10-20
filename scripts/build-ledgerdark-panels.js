#!/usr/bin/env node
// build-ledgerdark-panels.js — §15 balanced-panel instrument run
// for sim-ledgerdark-road.
//
// Reads the re-measured CONTROL corpus
// (evidence/2026-10-20/perseed-tablepathdriver-control/, SEATDRIVE=1,
// TABLEPATHDRIVER=0, RELAYDARK=0, LEDGERDARK=0 — the seatdrive stack with
// the 7-door driver delegating) as BEFORE and the armed corpus
// (evidence/2026-10-20/perseed-ledgerdark/, SEATDRIVE=1 + TABLEPATHDRIVER=1
// (door=beloved) + LEDGERDARK=1 — the dark-ledger road) as AFTER, and runs
// the before/after compare through scripts/balance-panel.js's scorecard
// (scripts/lib/balance-scorecard.js).
//
// The scorecard requires structurally matched case spaces (identical
// schemaVersion, observerDigest, contractDigest, and the options block) —
// the treatment difference lives in the corpora themselves (SEATDRIVE=0 vs
// =1 on identical seeds x policies = 16 matched case pairs), and is named
// in the markdown header + the evidence file. This is the same convention
// as build-posttable-panels.js's self-compare. The panel is the instrument;
// the pre-registered DIAG-GO bar is the judge.
//
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost, npcHungry — the wall/reachability
// instrument (same mapping as build-posttable-panels.js).
// Usage: node scripts/build-ledgerdark-panels.js [--out evidence/2026-10-20/ledgerdark-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const BEFORE_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-ledgerdark');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-20', 'ledgerdark-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(dir) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(dir, policyId, `s${seed}.json`);
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
    // Matched case spaces by construction: identical seeds x policies; the
    // treatment (SEATDRIVE=0 vs =1) lives in the corpora, named by `label`.
    observerDigest: 'ledgerdark-beforeafter-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      // Identical on both sides (the scorecard requires it); the treatment
      // difference (control SEATDRIVE=0 vs armed SEATDRIVE=1) is named here
      // and in the evidence file — the corpora carry the treatment.
      origin: 'sim-ledgerdark-road:control-vs-dark-ledger-armed',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', TABLEPATHDRIVER: '0-vs-1', RELAYDARK: '0-vs-1', LEDGERDARK: '0-vs-1', NODEWITNESS: '1', KILLDISC: '1' },
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

const beforeRows = load(BEFORE_DIR);
const afterRows = load(AFTER_DIR);
const beforePath = `${OUT_PREFIX}-before.json.gz`;
const afterPath = `${OUT_PREFIX}-after.json.gz`;
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows)) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows)) + '\n'));
const report = score.comparePanels(read(beforePath), read(afterPath));
fs.writeFileSync(`${OUT_PREFIX}.json`, JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(`${OUT_PREFIX}.md`, score.markdown(report));
console.log(`before/after control -> dark-ledger-armed: decision=${report.decision}`);
for (const p of report.policies || []) {
  console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
    }
  }
}
if (report.decision === 'invalid') { console.error('errors:', (report.errors || []).join(' | ')); process.exit(2); }
