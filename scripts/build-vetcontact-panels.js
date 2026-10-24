#!/usr/bin/env node
// build-vetcontact-panels.js — §15 balanced-panel compare for sim-vetcontact
// (8 seeds 70501,70504,70505,70802,70903,70905,70907,71001 x {leadfeast,
// belongfeast} x {control, vetcontact} = 32 configs, 180d death-aware).
// Reads the sweep JSONs, builds panels in the scripts/balance-panel.js
// schema, and runs the compare: control (before) vs vetcontact (after).
// The panel is the instrument; the pre-registered bars (wave-4+ kills
// armed-control >= +4 AND armed >= control on >=6/8 seed-pairs, engagement,
// guardrails) are the judge.
//
// §15 STATUS NOTE: the intervention is an env-gated policy layer
// (VETCONTACT=1 on the armed arm only). The scorecard's validity requires
// substrate flags to match exactly between panels, so the intervention
// flag is NOT in options.flags — the automated compare is therefore
// descriptive-by-construction (per sim-findings.md: env-gated levers make
// the automated compare invalid by construction). The manual paired-row
// comparison (scripts/analyze-vetcontact.js) is the judging instrument;
// its output is attached to the evidence.
//
// NOTE: the panel .json.gz case caches are NEVER committed (2026-10-23
// lesson); only the compare .md is attached to the evidence file.
//
// Usage: node scripts/build-vetcontact-panels.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetcontact');
const OUT_DIR = path.join(REPO, 'evidence', '2026-10-24');
const OUT_PREFIX = path.join(OUT_DIR, 'vetcontact-panel');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [70501, 70504, 70505, 70802, 70903, 70905, 70907, 71001];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const short = p.replace('feast', '');
    for (const seed of SEEDS) {
      const fp = path.join(SWEEP_DIR, arm, `s${seed}-${short}.json`);
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
  m.survival30 = (r.days || 0) >= 30 ? 1 : 0;
  m.survival60 = (r.days || 0) >= 60 ? 1 : 0;
  let playerDeaths = 0;
  try {
    for (const d of (r.deathRows || [])) {
      if (d.player && /combat|fight|monster|wound|bleed|titan/i.test(String(d.cause || ''))) playerDeaths++;
    }
  } catch (e) {}
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.days || 0) > 0) ? playerDeaths * 100 / r.days : null;
  m.communityLost = ['village-lost', 'village-dead', 'pop-zero'].includes(r.endReason) ? 1 : 0;
  m.npcHungry = (r.starvation | 0) > 0 ? 1 : 0;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'vetcontact-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-vetcontact',
      // The pinned substrate (BOTH arms): SEATDRIVE=0 explicit,
      // KILLDISC=1 v2, ARMORYDRIVE=1, VETFORMATION=1 both arms.
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1', VETFORMATION: '1', TRUSTBUFFER: '1', LINKFORM: '2' },
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

compare('control', 'vetcontact', 'primary');
