#!/usr/bin/env node
// scripts/carcass-haul-20261013.js — the CARCASS-HAUL PILOT (longsim
// scale-wall r11, 2026-10-13). Lever 0 (food economy) AS A LENS on the scale
// wall. r10's open blank: 97% of edible kill kcal rots on corpses unlooted.
// This run attempts the policy-side fix r10 named: loot corpses in range
// immediately after fights, then work the r10 chain (clean ->
// cautious-test/discovery -> pantry). NO game-code changes.
//
// Pilot (pre-registered in evidence/2026-10-13/sim-carcass-r11.md):
//   seed 11: belongseek (baseline) vs belongseek-haul (after)
//   seed 22: leadcourt  (baseline) vs leadcourt-haul  (after)
//   150d death-aware, identical seeds within each pair. 4 runs total.
//
// Usage:
//   DAYS=150 node scripts/carcass-haul-20261013.js
//   OUTDIR defaults to evidence/2026-10-13; writes carcass-haul-r11.json
//   (full rep), carcass-haul-before.json (2 baseline rows),
//   carcass-haul-after.json (2 haul rows) — the telemetry deviation check's
//   per-seed evidence files.
'use strict';
const fs = require('fs');
const path = require('path');
const { runMeatAudit, printSummary } = require('./meat-discovery-20261013');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const { belongseekHaul, leadcourtHaul } = require('./policies/haul');

const REGISTRY = {
  belongseek, leadcourt,
  'belongseek-haul': belongseekHaul,
  'leadcourt-haul': leadcourtHaul,
};

const PAIRS = [
  { seed: parseInt(process.env.SEED_BELONG || '11', 10), policies: ['belongseek', 'belongseek-haul'] },
  { seed: parseInt(process.env.SEED_LEAD || '22', 10), policies: ['leadcourt', 'leadcourt-haul'] },
];

(async () => {
  const days = parseInt(process.env.DAYS || '150', 10);
  const allRows = [];
  const byPolicy = {};
  for (const pair of PAIRS) {
    const rep = await runMeatAudit({
      label: 'carcass-haul-r11', days,
      seeds: [pair.seed], policies: pair.policies, registry: REGISTRY,
    });
    printSummary(rep);
    for (const r of rep.rows) allRows.push(r);
    for (const pid of pair.policies) byPolicy[pid] = rep.byPolicy[pid];
  }
  const full = { label: 'carcass-haul-r11', days, byPolicy, rows: allRows,
    pairs: PAIRS.map(p => ({ seed: p.seed, policies: p.policies })) };
  const outdir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-13');
  fs.mkdirSync(outdir, { recursive: true });
  const write = (name, obj) => {
    const p = path.join(outdir, name);
    fs.writeFileSync(p, JSON.stringify(obj, null, 1));
    console.log('wrote', p);
  };
  write('carcass-haul-r11.json', full);
  const isHaul = (r) => /-haul$/.test(r.policy);
  // top-level flat wall aggregates: the telemetry deviation check sums
  // metric paths across --current files, so rows alone read as 0.
  const flat = (rows) => ({
    national: rows.reduce((t, r) => t + (r.national || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    wins: rows.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: rows.reduce((t, r) => t + (r.exiled || 0), 0),
  });
  write('carcass-haul-before.json', Object.assign({ label: 'carcass-haul-r11-before',
    rows: allRows.filter(r => !isHaul(r)) }, flat(allRows.filter(r => !isHaul(r)))));
  write('carcass-haul-after.json', Object.assign({ label: 'carcass-haul-r11-after',
    rows: allRows.filter(r => isHaul(r)) }, flat(allRows.filter(r => isHaul(r)))));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
