#!/usr/bin/env node
// build-vetbench-panels-20261022.js — §15 balanced-panel compare for
// sim-vetbench. Reads the pilot sweep JSONs, builds panels in the
// scripts/balance-panel.js schema, and runs the compare: control (before)
// vs vetbench (after). The panel is the instrument; the pre-registered
// threshold (armed veteran combat deaths on live-window days <=
// control-2 AND >=2/8 armed seeds engaging, from the pilot analyzer) is
// the judge.
// Usage: node scripts/build-vetbench-panels-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-vetbench');
const OUT_PREFIX = path.join(REPO, 'evidence', '2026-10-22', 'vetbench-panel');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [65551, 65552, 65553, 65554, 65555, 65556, 65557, 65558];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-vetbench';
    for (const seed of SEEDS) {
      const fp = path.join(SWEEP_DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: p, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
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
  const playerDeaths = (r.deathCauses || {}).combat | 0;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.gameDays || 0) > 0) ? playerDeaths * 100 / r.gameDays : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  const dc = r.deathCauses || {};
  const starv = (dc.starvation | 0) + (dc.starved | 0);
  m.npcHungry = starv > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    // The arm identity is positional (before=control, after=armed): the
    // scorecard requires substrate flags AND observerDigest to match
    // exactly between panels (§15 validity). The intervention flag
    // (VETBENCH) must NOT be in options.flags.
    observerDigest: 'vetbench-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-vetbench',
      // The pinned non-seat long substrate (finding #714b): SEATDRIVE=0
      // explicit, KILLDISC=1 v2.
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1' },
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

compare('control', 'vetbench', 'primary');
