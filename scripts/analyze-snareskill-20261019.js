#!/usr/bin/env node
// Aggregate per-seed JSONs from both sweep modes into the final verdict.
// Usage: node scripts/analyze-snareskill-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'evidence', '2026-10-19');

function load(dir) {
  const out = [];
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (!f.endsWith('.json') || f.includes('transcript') || f.includes('verdict')) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(ROOT, dir, f), 'utf8')));
  }
  return out;
}
function agg(rows) {
  const checks = rows.reduce((t, r) => t + r.trapChecks, 0);
  const catches = rows.reduce((t, r) => t + r.trapCatches, 0);
  return { n: rows.length, checks, catches, rate: checks ? catches / checks : null,
    kcal: rows.reduce((t, r) => t + (r.trapKcal || 0), 0),
    days: rows.map(r => r.days), endReasons: rows.map(r => r.endReason) };
}
function report(title, rows) {
  console.log(`\n=== ${title} ===`);
  const cells = {};
  for (const r of rows) (cells[r.key] = cells[r.key] || []).push(r);
  const A = {};
  for (const [k, rs] of Object.entries(cells)) {
    A[k] = agg(rs);
    console.log(`  ${k}: n=${A[k].n} checks=${A[k].checks} catches=${A[k].catches} rate=${A[k].rate == null ? 'n/a' : (A[k].rate * 100).toFixed(1) + '%'} trapKcal=${A[k].kcal}`);
  }
  // pooled control vs armed
  const cKeys = Object.keys(cells).filter(k => k.endsWith('_control'));
  const aKeys = Object.keys(cells).filter(k => k.endsWith('_armed'));
  const C = agg(cKeys.flatMap(k => cells[k])), Ar = agg(aKeys.flatMap(k => cells[k]));
  const delta = Ar.rate - C.rate;
  console.log(`  POOLED control: ${(C.rate * 100).toFixed(1)}% (${C.catches}/${C.checks})`);
  console.log(`  POOLED armed:   ${(Ar.rate * 100).toFixed(1)}% (${Ar.catches}/${Ar.checks})`);
  console.log(`  DELTA: +${(delta * 100).toFixed(1)}pp  (GO >= +8pp: ${delta >= 0.08 ? 'GO' : 'NO-GO'})`);
  // per-road deltas
  for (const ck of cKeys) {
    const road = ck.replace('_control', ''), ak = road + '_armed';
    if (A[ak]) console.log(`  road ${road}: +${((A[ak].rate - A[ck].rate) * 100).toFixed(1)}pp`);
  }
  // guardrails per road
  for (const ck of cKeys) {
    const road = ck.replace('_control', ''), ak = road + '_armed';
    if (!cells[ak]) continue;
    const cC = {}, aC = {};
    for (const r of cells[ck]) for (const [k, v] of Object.entries(r.deaths || {})) cC[k] = (cC[k] || 0) + v;
    for (const r of cells[ak]) for (const [k, v] of Object.entries(r.deaths || {})) aC[k] = (aC[k] || 0) + v;
    const newModes = Object.keys(aC).filter(k => aC[k] >= 2 && !(cC[k] >= 1));
    const cs = cells[ck].reduce((t, r) => t + r.starveDeaths, 0), as = cells[ak].reduce((t, r) => t + r.starveDeaths, 0);
    const cr = cells[ck].reduce((t, r) => t + r.rotFresh + r.rotPreserved, 0), ar = cells[ak].reduce((t, r) => t + r.rotFresh + r.rotPreserved, 0);
    console.log(`  guardrail ${road}: newDeathModes=[${newModes.join(',') || 'none'}] starve ${cs}->${as} ${as <= cs + 2 ? 'OK' : 'FAIL'} rot ${cr}->${ar} ${cr === 0 ? (ar === 0 ? 'OK' : 'FAIL') : (ar <= cr * 1.15 ? 'OK' : 'FAIL')}`);
  }
  // wall numbers
  const nat = rows.filter(r => r.national).length, tab = rows.filter(r => r.table).length,
    won = rows.filter(r => r.won).length, ex = rows.filter(r => r.exiled).length;
  const surv = rows.map(r => r.days).sort((a, b) => a - b);
  const med = surv.length % 2 ? surv[surv.length >> 1] : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
  const waves = {};
  for (const r of rows) waves[r.waveReach] = (waves[r.waveReach] || 0) + 1;
  console.log(`  WALL: national ${nat}/${rows.length}, table ${tab}/${rows.length}, wins ${won}/${rows.length}, exiled ${ex}/${rows.length}, median survival ${med}d, waves ${JSON.stringify(waves)}`);
  return { cells: A, pooled: { control: C, armed: Ar, delta, go: delta >= 0.08 } };
}

const farm = load('perseed-snareskill-farm');
const policy = load('perseed-snareskill');
const rf = report('FARM SWEEP (mechanical measurement)', farm);
const rp = report('POLICY SWEEP (organic channel + guardrails + wall)', policy);
fs.writeFileSync(path.join(ROOT, 'snareskill-final-verdict.json'),
  JSON.stringify({ farm: rf, policy: rp }, null, 1) + '\n');
console.log('\nWrote evidence/2026-10-19/snareskill-final-verdict.json');
