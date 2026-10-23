#!/usr/bin/env node
// build-scholardistsafe-panel.js — build the §15 descriptive panel
// compare inputs from the scholar-safe sweep's per-seed JSONs (the
// thindefer-b pattern).
//
// The lever is env-gated, so the automated panel compare is
// descriptive-by-construction (sim-findings.md #796): the manual
// paired-row comparison judges (analyze-scholardistsafe-b.js). This
// builds the two panel.json.gz inputs + runs `balance-panel.js compare`.
//
// Usage: node scripts/build-scholardistsafe-panel.js  (after the sweep completes)
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'evidence', '2026-10-23', 'perseed-scholardistsafe-b');
const OUT = path.join(ROOT, 'evidence', '2026-10-23', 'scholardistsafe-panel-primary');
const score = require('./lib/balance-scorecard');
const contract = require('./balance-metrics.json');

const SEEDS = []; for (let s = 67517; s <= 67532; s++) SEEDS.push(s);
const POLICIES = ['leadfeast', 'belongfeast'];

function rowMetrics(r) {
  const playerDeaths = r.deaths.filter(d => d.player).length;
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.table = r.table ? 1 : 0;
  m.national = r.national ? 1 : 0;
  m.survival30 = r.gameDays >= 30 ? 1 : 0;
  m.survival60 = r.gameDays >= 60 ? 1 : 0;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = playerDeaths / Math.max(1, r.gameDays) * 100;
  m.communityLost = r.communityLost ? 1 : 0;
  return m;
}

function buildPanel(arm) {
  const rows = [];
  for (const policy of POLICIES) {
    for (const seed of SEEDS) {
      const f = path.join(DIR, `${arm}-${policy}-s${seed}.json`);
      if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
      const r = JSON.parse(fs.readFileSync(f, 'utf8'));
      rows.push({ row: { policy, seed }, metrics: rowMetrics(r), warnings: [], observerErrors: [], gear: { errors: [] } });
    }
  }
  return {
    schemaVersion: 1,
    observerDigest: 'scholardistsafe-sweep-instrument-v1',
    contractDigest: score.contractDigest,
    sources: {},
    options: {
      days: 180, policies: POLICIES.slice(), seeds: SEEDS.slice(),
      region: null, origin: 'sim-scholardistsafe-b',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SCHOLARDISTSAFE: '1-armed' },
      nodeVersion: process.version,
    },
    rows,
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(policy => ({ policy, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}

function main() {
  const before = buildPanel('control');
  const after = buildPanel('armed');
  const bf = OUT + '-before.json.gz', af = OUT + '-after.json.gz';
  fs.writeFileSync(bf, zlib.gzipSync(JSON.stringify(before) + '\n'));
  fs.writeFileSync(af, zlib.gzipSync(JSON.stringify(after) + '\n'));
  console.log('wrote ' + bf + ' and ' + af);
  try {
    const out = execSync(`node scripts/balance-panel.js compare --before ${bf} --after ${af} --out ${OUT}`,
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(out);
  } catch (e) {
    // compare exits 2 on review_required (a decision, not a crash)
    console.log((e.stdout || '') + (e.stderr || ''));
    console.log('compare exit: ' + e.status);
  }
  console.log('wrote ' + OUT + '.{md,json}');
}
main();
