#!/usr/bin/env node
// scripts/kitchen-20261013.js — the KITCHEN PILOT (longsim scale-wall r12,
// 2026-10-13). Lever 0 (food economy) AS A LENS on the scale wall. r11's
// open blank: the fight->food chain ends at "revealed" — scholar-eaten
// monster-meat kcal = 0 on all arms. Competent's cookPack only cooks
// foodState === 'raw', so revealed cleaned meat (edible:true, foodState
// 'cleaned', ~2-day shelf) rots uncooked. The lever: a policy-side
// withKitchen layer (scripts/policies/kitchen.js) that cooks REVEALED
// cleaned meat when fire is near, near-expiry first, then lets the
// existing competentEat/Game.eat() eat it. Gate: COMPETENT_KITCHEN=1
// (opt-in; the before arms don't carry the layer at all).
//
// Pre-registration (see evidence/2026-10-13/sim-kitchen-r12.md):
//   primary metric: scholar-eaten monster-meat kcal (meatEatenK)
//   GO (pilot gate): eaten >= 25% of revealed kcal on the addressable pair
//     (seed 11), visible in raw numbers. Miss -> killed-at-pilot.
//   horizon: 150 days, death-aware. Seeds: 11 (belongseek pair), 22
//     (leadcourt pair) — identical within pairs.
//
// Usage:
//   DAYS=150 node scripts/kitchen-20261013.js
//   OUTDIR defaults to evidence/2026-10-13; writes kitchen-r12.json
//   (full rep), kitchen-before.json, kitchen-after.json — per-seed
//   evidence for the coordinator's telemetry deviation check.
'use strict';
const fs = require('fs');
const path = require('path');
const { runMeatAudit, printSummary } = require('./meat-discovery-20261013');
const { belongseekHaul, leadcourtHaul } = require('./policies/haul');
const { belongseekHaulKitchen, leadcourtHaulKitchen } = require('./policies/kitchen');

process.env.COMPETENT_KITCHEN = '1'; // opt-in for the kitchen arms; before arms lack the layer

const REGISTRY = {
  'belongseek-haul': belongseekHaul,
  'leadcourt-haul': leadcourtHaul,
  'belongseek-haul-kitchen': belongseekHaulKitchen,
  'leadcourt-haul-kitchen': leadcourtHaulKitchen,
};

const PAIRS = [
  { seed: parseInt(process.env.SEED_BELONG || '11', 10), policies: ['belongseek-haul', 'belongseek-haul-kitchen'] },
  { seed: parseInt(process.env.SEED_LEAD || '22', 10), policies: ['leadcourt-haul', 'leadcourt-haul-kitchen'] },
];

(async () => {
  const days = parseInt(process.env.DAYS || '150', 10);
  const allRows = [];
  const byPolicy = {};
  for (const pair of PAIRS) {
    const rep = await runMeatAudit({
      label: 'kitchen-r12', days,
      seeds: [pair.seed], policies: pair.policies, registry: REGISTRY,
    });
    printSummary(rep);
    for (const r of rep.rows) allRows.push(r);
    for (const pid of pair.policies) byPolicy[pid] = rep.byPolicy[pid];
  }
  const full = { label: 'kitchen-r12', days, byPolicy, rows: allRows,
    pairs: PAIRS.map(p => ({ seed: p.seed, policies: p.policies })) };
  const outdir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-13');
  fs.mkdirSync(outdir, { recursive: true });
  const write = (name, obj) => {
    const p = path.join(outdir, name);
    fs.writeFileSync(p, JSON.stringify(obj, null, 1));
    console.log('wrote', p);
  };
  write('kitchen-r12.json', full);
  const isKitchen = (r) => /-kitchen$/.test(r.policy);
  // top-level flat wall aggregates: the telemetry deviation check sums
  // metric paths across --current files, so rows alone read as 0.
  const flat = (rows) => ({
    national: rows.reduce((t, r) => t + (r.national || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    wins: rows.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: rows.reduce((t, r) => t + (r.exiled || 0), 0),
  });
  write('kitchen-before.json', Object.assign({ label: 'kitchen-r12-before',
    rows: allRows.filter(r => !isKitchen(r)) }, flat(allRows.filter(r => !isKitchen(r)))));
  write('kitchen-after.json', Object.assign({ label: 'kitchen-r12-after',
    rows: allRows.filter(r => isKitchen(r)) }, flat(allRows.filter(r => isKitchen(r)))));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
