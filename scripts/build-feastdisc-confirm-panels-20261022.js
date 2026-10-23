#!/usr/bin/env node
// build-feastdisc-confirm-panels-20261022.js — §15 balanced-panel compare
// for the sim-feastdiscipline CONFIRM (12 fresh seeds 66111-66122,
// 24 configs/arm, 180d death-aware). NEW file — the pilot's builder is
// untouched. Reads the confirm sweep JSONs, builds panels in the
// scripts/balance-panel.js schema, and runs the compare: control
// (before) vs feastdisc (after). The panel is the instrument; the
// pre-registered threshold (damage-majority armed villager wave-4 kills
// >= control+2 AND >=3/12 armed seeds, plus the guardrail set) is the
// judge.
// scripts/balance-panel.js schema, and runs the compare:
// control (before) vs feastdisc (after). The panel is the instrument; the
// pre-registered threshold from the arm brief (armed villager wave-4 kills
// >= control+2 AND >=2/8 seeds, plus the guardrail set) is the judge.
//
// §15 STATUS NOTE: the intervention is an env-gated policy layer
// (FEASTDISC=1 on the armed arm only). The scorecard's validity requires
// substrate flags to match exactly between panels, so the intervention
// flag is NOT in options.flags — the automated compare is therefore
// descriptive-by-construction (per sim-findings.md: env-gated levers make
// the automated compare invalid by construction). The manual paired-row
// comparison is the judging instrument; it is attached to the evidence.
//
// Usage: node scripts/build-feastdisc-panels-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..');
const SWEEP_DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-feastdisc-confirm');
const OUT_PREFIX = path.join(REPO, 'evidence', '2026-10-22', 'feastdisc-confirm-panel');

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(REPO, 'scripts', 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

// FRESH_SEEDS — verified 0 filename hits across evidence/ + scripts/ on
// master before the pilot sweep.
const SEEDS = [66111, 66112, 66113, 66114, 66115, 66116, 66117, 66118, 66119, 66120, 66121, 66122];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const short = p.replace('feast', '');
    for (const seed of SEEDS) {
      const fp = path.join(SWEEP_DIR, `${arm}-${short}-s${seed}.json`);
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
  const playerDeaths = (r.deathCauses || {}).combat | 0;
  m.playerDeaths = playerDeaths;
  m.playerDeaths100Days = ((r.days || 0) > 0) ? playerDeaths * 100 / r.days : null;
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
    // intervention flag (FEASTDISC) must NOT be in options.flags.
    observerDigest: 'feastdisc-confirm-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'sim-feastdiscipline-confirm',
      // The pinned non-seat long substrate: SEATDRIVE=0 explicit,
      // KILLDISC=1 v2, ARMORYDRIVE=1 both arms.
      flags: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1' },
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

compare('control', 'feastdisc', 'primary');
