#!/usr/bin/env node
// build-tableconfirm-panels-20261020.js — §15 balanced-panel instrument run
// for the sim-tablepathdriver scoped confirm.
//
// Reads the fresh CONTROL corpus
// (evidence/2026-10-20/perseed-tableconfirm/control/, TABLEPATHDRIVER=0 +
// RELAYDARK=0 — pure delegation) as BEFORE and the armed corpus
// (evidence/2026-10-20/perseed-tableconfirm/armed/, TABLEPATHDRIVER=1 +
// RELAYDARK=1 — the 7-door driver + dark road) as AFTER, and runs the
// before/after compare through scripts/balance-panel.js's scorecard
// (scripts/lib/balance-scorecard.js).
//
// The scorecard requires structurally matched case spaces (identical
// schemaVersion, observerDigest, contractDigest, and the options block) —
// the treatment difference lives in the corpora themselves (pure
// delegation vs the 7-door driver + dark road on identical seeds x
// policies = 24 matched case pairs), and is named in the markdown header
// + the evidence file. This is the same convention as the pilot's
// build-tablepathdriver-panels.js. The panel is the instrument; the
// pre-registered GO bar is the judge.
//
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost, npcHungry — the wall/reachability
// instrument (same mapping as the pilot).
// Usage: node scripts/build-tableconfirm-panels-20261020.js [--out evidence/2026-10-20/tableconfirm-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const BEFORE_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tableconfirm', 'control');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tableconfirm', 'armed');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-20', 'tableconfirm-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [81301, 81302, 81303, 81304, 81305, 81306, 81307, 81308, 81309, 81310, 81311, 81312];
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
    // treatment (pure delegation vs 7-door driver + dark road) lives in the
    // corpora, named by `label`.
    observerDigest: 'tableconfirm-beforeafter-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      // Identical on both sides (the scorecard requires it); the treatment
      // difference (control delegation vs armed driver+road) is named here
      // and in the evidence file — the corpora carry the treatment.
      origin: 'sim-tablepathdriver-confirm:delegation-control-vs-7door-armed',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', TABLEPATHDRIVER: '0-vs-1', RELAYDARK: '0-vs-1', NODEWITNESS: '1', KILLDISC: '1' },
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
console.log(`before/after delegation-control -> 7door-armed: decision=${report.decision}`);
for (const p of report.policies || []) {
  console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`    ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
    }
  }
}
if (report.decision === 'invalid') { console.error('errors:', (report.errors || []).join(' | ')); process.exit(2); }
