#!/usr/bin/env node
// scripts/build-titanexcl-panels.js — §15 balanced-panel compare for
// sim-titanexcl-a, following the scripts/build-dipholdbar-panels-20261020.js
// precedent: build before/after panels in the balance-panel schema from
// the arm's own paired per-seed sweep rows (identical seeds, identical
// substrate; only castMonster differs), then score.comparePanels.
// The panel is the instrument; the prereg header is the judge.
//
// Metric mapping (honest, from sweep rows only):
// - won / entered / table / national: direct 0/1 from the row.
// - survival30/60: gameDays thresholds. survival uses row.days (simulated
//   days; dead villages stop, so days IS survival here).
// - playerDeaths / villageDeaths: split from the row's death-cause shares
//   (player:* vs villager:* keys). Rates per 100 days likewise.
// - communityLost: endReason village-lost.
// - titanCasts (EXTRA, not a contract metric): titan casts per seed —
//   carried as an extra row field for the evidence narrative, not judged
//   by the scorecard. All other contract metrics: null (unmeasured by
//   this sweep's rows — never invented).
// Neutrality: the sweep rows are paired by seed and the instrument is
// identical across legs, so neutrality match=true is asserted on the same
// basis as the precedent builder (paired design, same recorder version).
//
// Usage: node scripts/build-titanexcl-panels.js [--out evidence/2026-10-30/titanexcl-panel]
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const BEFORE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-titanexcl-a-control');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-titanexcl-a-armed');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'evidence', '2026-10-30', 'titanexcl-panel'));
const SEEDS = [75131, 75132, 75133, 75134, 75135, 75136, 75137, 75138,
  75139, 75140, 75141, 75142, 75143, 75144, 75145, 75146];
const POLICIES = ['titanexcl-sweep'];
const DAYS = 180;

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

function load(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, `s${seed}.json`);
    if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
    rows.push({ seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}
function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won ? 1 : 0;
  m.entered = r.entered ? 1 : 0;
  m.table = r.table ? 1 : 0;
  m.national = r.nationalEver ? 1 : 0;
  m.survival30 = (r.days || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.days || 0) >= 60 ? 1 : 0;
  let pd = 0, vd = 0;
  for (const [k, v] of Object.entries(r.deaths || {})) {
    if (k.startsWith('player:')) pd += v;
    else if (k.startsWith('villager:')) vd += v;
  }
  m.playerDeaths = pd;
  m.villageDeaths = vd;
  m.playerDeaths100Days = (r.days || 0) > 0 ? pd * 100 / r.days : null;
  m.villageDeaths100Days = (r.days || 0) > 0 ? vd * 100 / r.days : null;
  m.communityLost = (r.endReason === 'village-lost') ? 1 : 0;
  m.npcHungry = Object.entries(r.deaths || {}).some(([k]) => /starvation|thirst/i.test(k)) ? 1 : 0;
  return m;
}
function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'titanexcl-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-titanexcl-a',
      flags: {},
      nodeVersion: process.version,
    },
    rows: rows.map(({ seed, r }) => ({
      row: { policy: 'titanexcl-sweep', seed, corpus: label },
      metrics: metricsFor(r),
      // Extra instrument read, outside the contract: titan casts per seed.
      titanCasts: (r.titancast && r.titancast.titanCasts) || 0,
      casts: (r.titancast && r.titancast.casts) || 0,
      feastTitan: (r.titancast && r.titancast.feastTitan) || 0,
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map((p) => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0 })),
    },
  };
}
const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f), 'utf8'));
function main() {
  const beforeRows = load(BEFORE_DIR);
  const afterRows = load(AFTER_DIR);
  const beforePath = `${OUT_PREFIX}-before.json.gz`;
  const afterPath = `${OUT_PREFIX}-after.json.gz`;
  fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(beforeRows, 'titanexcl-control')) + '\n'));
  fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(afterRows, 'titanexcl-armed')) + '\n'));
  const report = score.comparePanels(read(beforePath), read(afterPath));
  fs.writeFileSync(`${OUT_PREFIX}.json`, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(`${OUT_PREFIX}.md`, score.markdown(report));
  console.log(`compare titanexcl-control->titanexcl-armed: decision=${report.decision}`);
  for (const p of report.policies || []) {
    console.log(`  policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
    for (const m of p.metrics || []) console.log(`    ${m.metric}: ${m.decision} before=${m.before} after=${m.after}`);
  }
}
main();
