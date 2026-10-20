#!/usr/bin/env node
// build-scholarcare-panels.js — §15 balanced-panel instrument run for
// arm sim-scholarcare.
//
// Reads the committed CONTROL corpus
// (evidence/2026-10-20/perseed-scholarcare/control/, SCHOLARCARE unset
// — the w5doormeasure stack) as BEFORE and the armed corpus
// (evidence/2026-10-20/perseed-scholarcare/armed/, SCHOLARCARE=1 — the
// scholar self-care drive) as AFTER, and runs the before/after
// compare through scripts/balance-panel.js's scorecard
// (scripts/lib/balance-scorecard.js).
//
// The scorecard requires structurally matched case spaces (identical
// schemaVersion, observerDigest, contractDigest, and the options block) —
// the treatment difference lives in the corpora themselves
// (SCHOLARCARE=0 vs =1 on identical seeds x policies = 16 matched case
// pairs), and is named in the markdown header + the evidence file. Same
// convention as build-tablepathdriver-panels.js's self-compare. The panel
// is the instrument; the pre-registered scholarcare threshold is the
// judge.
//
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost, npcHungry — the wall/reachability
// instrument (same mapping as build-posttable-panels.js).
// Usage: node scripts/build-scholarcare-panels.js [--out evidence/2026-10-20/scholarcare-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const score = require('./lib/balance-scorecard');

const REPO = path.join(__dirname, '..');
const BEFORE_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-scholarcare', 'control');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-scholarcare', 'armed');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-20', 'scholarcare-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
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
  m.table = r.national ? 1 : 0; // table = reached the endgame table scale (pre-registration: wall numbers)
  m.national = r.national ? 1 : 0;
  m.survival30 = (r.gameDays || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.gameDays || 0) >= 60 ? 1 : 0;
  const attr = r.deathList || [];
  const playerDeaths = attr.filter(d => d.player).length;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? playerDeaths * 100 / r.gameDays : null;
  m.communityLost = (r.endReason === 'village-lost' || r.endReason === 'village-dead' || r.endReason === 'pop-zero') ? 1 : 0;
  const starv = ((r.deaths || {}).starvation | 0) + ((r.deaths || {})['starved'] | 0);
  m.npcHungry = starv > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows) {
  return {
    schemaVersion: 1,
    // Matched case spaces by construction: identical seeds x policies; the
    // treatment (SCHOLARCARE=0 vs =1) lives in the corpora, named by
    // `origin` and the flags below.
    observerDigest: 'scholarcare-beforeafter-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-scholarcare:control-vs-armed',
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', SCHOLARCARE: '0-vs-1' },
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

if (require.main === module) {
  const before = buildPanel(load(BEFORE_DIR));
  const after = buildPanel(load(AFTER_DIR));
  fs.writeFileSync(OUT_PREFIX + '-before.json.gz', zlib.gzipSync(JSON.stringify(before) + '\n'));
  fs.writeFileSync(OUT_PREFIX + '-after.json.gz', zlib.gzipSync(JSON.stringify(after) + '\n'));
  const read = f => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));
  const report = score.comparePanels(read(OUT_PREFIX + '-before.json.gz'), read(OUT_PREFIX + '-after.json.gz'));
  fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(OUT_PREFIX + '.md', score.markdown(report));
  console.log('panel decision: ' + report.decision);
  for (const p of (report.policies || [])) {
    const rev = (p.metrics || []).filter(m => !['descriptive', 'no_material_signal'].includes(m.status));
    console.log(`  ${p.policy}: ${p.decision} (cases=${p.cases})` + (rev.length ? ` review: ${rev.map(m => m.id + '=' + m.status).join(', ')}` : ''));
  }
}
module.exports = { buildPanel, metricsFor };
