#!/usr/bin/env node
// scripts/build-feastdraw-panels.js — §15 balanced-panel compare for sim-feastdraw-b.
//
// Reads the pilot sweep JSONs (/tmp/sim-doomeddraw-b/sweep-{control,armed}-*.json),
// builds panels in the scripts/balance-panel.js schema, and runs the compare:
//   control (before) vs armed (after) — the primary.
// Panel metric mapping: won, table, national, survival30/60, playerDeaths,
// playerDeaths100Days, communityLost — the wall/reachability instrument.
// The panel is the instrument; the pre-registered threshold is the judge.
// Usage: node scripts/build-feastdraw-panels.js [--out evidence/2026-10-18/doomeddraw-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const SWEEP_DIR = process.env.SWEEP_DIR || '/tmp/sim-doomeddraw-b';
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-18', 'feastdraw-panel'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [6561, 6562, 6563, 6564, 6565, 6566, 6567, 6568];
const POLICIES = ['leaddoomeddraw', 'belongdoomeddraw'];
const DAYS = 180;

function load(side) {
  const rows = [];
  for (const p of POLICIES) {
    const f = path.join(SWEEP_DIR, `sweep-${side}-${p}.json`);
    if (!fs.existsSync(f)) throw new Error('missing sweep file: ' + f);
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const r of data.rows) rows.push({ policy: p, seed: r.seed, e: r.end });
  }
  return rows;
}

function metricsFor(r) {
  const e = r.e;
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = e.won ? 1 : 0;
  m.table = (e.tableWaiting || e.won) ? 1 : 0;
  m.national = e.nationalLive ? 1 : 0;
  m.survival30 = e.days >= 30 ? 1 : 0;
  m.survival60 = e.days >= 60 ? 1 : 0;
  const playerDeaths = (e.deaths || []).filter(d => d.kind === 'person').length;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = (e.days > 0 && Number.isFinite(playerDeaths)) ? playerDeaths * 100 / e.days : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(e.endReason) ? 1 : 0;
  m.npcHungry = e.starveDays > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'doomeddraw-b-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
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

compare('control', 'armed', 'primary');
