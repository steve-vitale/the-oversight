#!/usr/bin/env node
// analyze-rotdiff-b.js — analyzes the sim-rotdiff-b diagnostic sweep.
// Reads the lead.json / belong.json corpora from scripts/sweep-rotdiff-b.js
// and attributes the stockPantry-vs-stockSurplus rot differential to named
// engine mechanisms.
//
// Usage: node scripts/analyze-rotdiff-b.js evidence/2026-10-20/perseed-rotdiff-b/lead.json evidence/2026-10-20/perseed-rotdiff-b/belong.json
'use strict';
const fs = require('fs');

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node scripts/analyze-rotdiff-b.js <lead.json> [belong.json]'); process.exit(2); }

const corpora = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const rows = corpora.flatMap(c => (c.rows || []).map(r => r.end));

function sum(rows, fn) { return rows.reduce((t, r) => t + (fn(r) || 0), 0); }
function mean(rows, fn) { return rows.length ? sum(rows, fn) / rows.length : 0; }
const rd = (r) => r.rd || {};
const k1 = (o) => { const r = {}; for (const k of Object.keys(o || {})) r[k] = Math.round(o[k]); return r; };

function report(label, rs) {
  const runDays = sum(rs, r => r.days);
  const wP = sum(rs, r => rd(r).writePantryKcal);
  const wS = sum(rs, r => rd(r).writeSurplusKcal);
  const rotP = sum(rs, r => (rd(r).rotPath || {}).pantry);
  const rotS = sum(rs, r => (rd(r).rotPath || {}).surplus);
  const rotO = sum(rs, r => (rd(r).rotPath || {}).other);
  const unclass = sum(rs, r => rd(r).unclassifiedRot);
  const rc = {};
  for (const r of rs) for (const [k, v] of Object.entries(rd(r).rotClass || {})) rc[k] = (rc[k] || 0) + v;
  const rateP = wP ? rotP / wP : 0, rateS = wS ? rotS / wS : 0;
  const named = (rc['pantry-cap'] || 0) + (rc['pantry-clock6'] || 0) + (rc['pantry-coarse'] || 0);
  const attribShare = rotP ? named / rotP : 0;
  console.log(`\n===== ${label} (n=${rs.length}, runDays=${runDays}) =====`);
  console.log(`inflow: pantryPath=${Math.round(wP / 1000)}k kcal, surplusPath=${Math.round(wS / 1000)}k kcal`);
  console.log(`rot:    pantryPath=${Math.round(rotP / 1000)}k, surplusPath=${Math.round(rotS / 1000)}k, other=${Math.round(rotO / 1000)}k, unclassified=${Math.round(unclass)}`);
  console.log(`rot RATE: pantryPath=${(rateP * 100).toFixed(1)}%  surplusPath=${(rateS * 100).toFixed(1)}  (differential ${(rateP - rateS >= 0 ? '+' : '') + ((rateP - rateS) * 100).toFixed(1)}pp, ratio ${rateS ? (rateP / rateS).toFixed(2) + 'x' : 'n/a'})`);
  console.log(`rotClass: ${JSON.stringify(k1(rc))}`);
  console.log(`GO attribution: named(pantry-cap+clock6+coarse)=${Math.round(named / 1000)}k / pantryRot=${Math.round(rotP / 1000)}k = ${(attribShare * 100).toFixed(1)}% (bar >=80%), unclassified=${Math.round(unclass)} (bar 0)`);
  console.log(`cap: surplusRefusals=${sum(rs, r => rd(r).capRefuseN)} (${Math.round(sum(rs, r => rd(r).capRefuseKcal) / 1000)}k), surplusTrunc=${Math.round(sum(rs, r => rd(r).capTruncateKcal) / 1000)}k, pantryOverCapWrites=${sum(rs, r => rd(r).overCapWriteN)} (${Math.round(sum(rs, r => rd(r).overCapWriteKcal) / 1000)}k)`);
  console.log(`dayRefMismatch=${sum(rs, r => rd(r).dayRefMismatch)}  desperation(p/s/o)=${JSON.stringify(k1({ p: sum(rs, r => (rd(r).desperationByPath || {}).pantry), s: sum(rs, r => (rd(r).desperationByPath || {}).surplus), o: sum(rs, r => (rd(r).desperationByPath || {}).other) }))}`);
  console.log(`clockMix: ${JSON.stringify(k1(rs.reduce((a, r) => { for (const [k, v] of Object.entries(rd(r).clockMix || {})) a[k] = (a[k] || 0) + v; return a; }, {})))}`);
  // draw-order evidence
  const lag = {};
  for (const r of rs) for (const [k, v] of Object.entries(rd(r).firstDrawLag || {})) {
    const c = lag[k] || (lag[k] = { n: 0, s: 0 });
    c.n += v.n; c.s += v.n * v.meanLagDays;
  }
  const lagStr = Object.entries(lag).map(([k, c]) => `${k}: n=${c.n} meanLag=${c.n ? (c.s / c.n).toFixed(1) : 0}d`).join(' | ');
  console.log(`first-draw lag by cohort: ${lagStr}`);
  const rdc = {};
  for (const r of rs) for (const [k, v] of Object.entries(rd(r).rotDrawsByClass || {})) {
    const c = rdc[k] || (rdc[k] = { n: 0, ds: 0, ss: 0 });
    c.n += v.n; c.ds += v.n * v.meanDraws; c.ss += v.n * v.meanSatDays;
  }
  console.log(`rotted-item profile: ${Object.entries(rdc).map(([k, c]) => `${k}: n=${c.n} meanDraws=${(c.ds / c.n).toFixed(1)} meanSat=${(c.ss / c.n).toFixed(1)}d`).join(' | ')}`);
  console.log(`wall: national=${rs.filter(r => r.national).length}/${rs.length} table=${rs.filter(r => r.table).length}/${rs.length} wins=${rs.filter(r => r.won).length}/${rs.length} maxWave>=4: ${rs.filter(r => r.maxWave >= 4).length}/${rs.length} medianDays=${median(rs.map(r => r.days))}`);
  return { label, n: rs.length, runDays, wP, wS, rotP, rotS, rotO, unclass, rc, rateP, rateS, named, attribShare };
}
function median(a) { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }

const byPolicy = {};
for (const c of corpora) {
  const p = (c.meta && c.meta.policy) || 'unknown';
  byPolicy[p] = (c.rows || []).map(r => r.end);
}
const reps = [];
for (const [p, rs] of Object.entries(byPolicy)) reps.push(report('policy ' + p, rs));
const pooled = report('POOLED', rows);

// per-seed table
console.log('\nper-seed:');
for (const r of rows) {
  const q = rd(r);
  console.log(`  s${r.seed} ${r.policy} d=${r.days} ${r.endReason} rotP=${Math.round((q.rotPath || {}).pantry / 1000)}k rotS=${Math.round((q.rotPath || {}).surplus / 1000)}k ` +
    `inP=${Math.round(q.writePantryKcal / 1000)}k inS=${Math.round(q.writeSurplusKcal / 1000)}k class=${JSON.stringify(k1(q.rotClass))}`);
}

// GO verdict
const g = pooled.attribShare >= 0.80 && pooled.unclass === 0;
console.log(`\nGO GATE: attribution ${(pooled.attribShare * 100).toFixed(1)}% >= 80% ${pooled.attribShare >= 0.80 ? 'PASS' : 'FAIL'}; unclassified ${Math.round(pooled.unclass)} == 0 ${pooled.unclass === 0 ? 'PASS' : 'FAIL'} => ${g ? 'DIAG-GO' : 'DIAG-NO-GO'}`);
