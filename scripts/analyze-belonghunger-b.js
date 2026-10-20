#!/usr/bin/env node
// scripts/analyze-belonghunger-b.js — attribution analysis for the belong-road
// hunger diagnostic (fleshout loop B, 2026-10-19, arm sim-belonghunger-b).
//
// Reads evidence/2026-10-19/belonghunger-b.json (the instrumented pilot).
// For each hunger event day H: compares channel flows over [H-7, H-1] against
// the run's BASELINE daily rates (all non-hunger-window days). Ranks channels
// by (window - baseline): what CHANGED before the hunger — a drain spike or
// an inflow collapse. Also breaks the `in` channel into tag groups and
// reports full-run channel totals per run (where the food goes).
//
// Usage: node scripts/analyze-belonghunger-b.js [path-to-belonghunger-b.json]
'use strict';
const fs = require('fs');
const path = process.argv[2] || 'evidence/2026-10-19/belonghunger-b.json';
const D = JSON.parse(fs.readFileSync(path, 'utf8'));

const INFLOWS = new Set(['in', 'in-granary']);

function chanSigned(k, v) { return INFLOWS.has(k) ? -v : v; } // + = drains pantry

function baseline(run) {
  // daily rates over days NOT within 7d of any hunger event
  const hot = new Set();
  for (const e of (run.hungryEvents || [])) for (let d = e.day - 8; d <= e.day + 1; d++) hot.add(d);
  for (const dth of (run.deaths || [])) if (/starv/i.test(dth.cause)) for (let d = dth.day - 8; d <= dth.day + 1; d++) hot.add(d);
  const sum = {}, n = { count: 0 };
  const inTags = {};
  for (const [ds, rec] of Object.entries(run.ledgerDays)) {
    const d = +ds;
    if (hot.has(d)) continue;
    n.count++;
    for (const [k, v] of Object.entries(rec.ch || {})) sum[k] = (sum[k] || 0) + chanSigned(k, v);
    for (const [gg, cnt] of Object.entries((rec.tagGroups || {})['in'] || {})) inTags[gg] = (inTags[gg] || 0) + cnt;
  }
  const rates = {};
  for (const [k, v] of Object.entries(sum)) rates[k] = n.count ? v / n.count : 0;
  return { rates, days: n.count, inTags };
}

function window7(run, H) {
  const sum = {}, inTags = {};
  let startK = null, endK = null;
  for (let d = H - 7; d <= H - 1; d++) {
    const rec = run.ledgerDays[String(d)];
    if (!rec) continue;
    if (startK === null && rec.start !== null) startK = rec.start;
    for (const [k, v] of Object.entries(rec.ch || {})) sum[k] = (sum[k] || 0) + chanSigned(k, v);
    for (const [gg, cnt] of Object.entries((rec.tagGroups || {})['in'] || {})) inTags[gg] = (inTags[gg] || 0) + cnt;
  }
  const recH = run.ledgerDays[String(H)];
  endK = recH && recH.start !== null ? recH.start : null;
  return { sum, inTags, startK, endK };
}

console.log('=== per-run full-horizon channel totals (kcal; + = net drain) ===');
for (const r of D.rows) {
  const tot = {};
  for (const rec of Object.values(r.ledgerDays)) for (const [k, v] of Object.entries(rec.ch || {})) tot[k] = (tot[k] || 0) + chanSigned(k, v);
  const ranked = Object.entries(tot).sort((a, b) => b[1] - a[1]);
  const inTags = {};
  for (const rec of Object.values(r.ledgerDays)) for (const [gg] of Object.keys((rec.tagGroups || {})['in'] || {})) inTags[gg] = true;
  console.log(`\n[${r.policy} s${r.seed}] days=${r.days} end=${r.endReason} hungerEvents=${(r.hungryEvents || []).length} starve=${r.starveDeaths} feasts=${r.fsFeasts} recon=${(r.recon.residShare * 100).toFixed(1)}%`);
  console.log('  net: ' + ranked.map(([k, v]) => `${k}:${v >= 0 ? '+' : ''}${Math.round(v / 1000)}k`).join(' '));
  // inflow tag groups by count
  const tg = {};
  for (const rec of Object.values(r.ledgerDays)) for (const [gg, cnt] of Object.entries((rec.tagGroups || {})['in'] || {})) tg[gg] = (tg[gg] || 0) + cnt;
  console.log('  in-tags: ' + Object.entries(tg).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([g, c]) => `${g}:${c}`).join(' '));
}

console.log('\n\n=== hunger-event windows: [H-7,H-1] vs baseline daily rate x7 ===');
const deltas = {}; // channel -> sum of (window - baseline*7) over events, per policy
for (const r of D.rows) {
  const bl = baseline(r);
  const evts = [];
  for (const e of (r.hungryEvents || [])) evts.push({ day: e.day, kind: 'hungry' });
  for (const dth of (r.deaths || [])) if (/starv/i.test(dth.cause)) evts.push({ day: dth.day, kind: 'STARVATION' });
  if (!evts.length) continue;
  console.log(`\n[${r.policy} s${r.seed}] baselineDays=${bl.days}`);
  for (const e of evts) {
    const w = window7(r, e.day);
    console.log(`  H=day ${e.day} (${e.kind}) pantry ${w.startK !== null ? Math.round(w.startK / 1000) + 'k' : '?'} -> ${w.endK !== null ? Math.round(w.endK / 1000) + 'k' : '?'}`);
    const rows = [];
    const keys = new Set([...Object.keys(w.sum), ...Object.keys(bl.rates)]);
    for (const k of keys) {
      const win = w.sum[k] || 0, base = (bl.rates[k] || 0) * 7;
      const d = win - base;
      rows.push([k, win, base, d]);
      const pp = deltas[r.policy] = deltas[r.policy] || {};
      pp[k] = (pp[k] || 0) + d;
    }
    rows.sort((a, b) => b[3] - a[3]);
    for (const [k, win, base, d] of rows.slice(0, 8)) {
      if (Math.abs(d) < 500 && Math.abs(win) < 500) continue;
      console.log(`    ${k}: window ${Math.round(win).toLocaleString('en-US')} vs base7 ${Math.round(base).toLocaleString('en-US')}  delta ${d >= 0 ? '+' : ''}${Math.round(d).toLocaleString('en-US')}`);
    }
    const tg = Object.entries(w.inTags).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (tg.length) console.log(`    in-tags(window): ${tg.map(([g, c]) => `${g}:${c}`).join(' ')}`);
  }
}

console.log('\n\n=== RANKED: sum over events of (window - baseline*7), by policy (+ = hunger-associated drain) ===');
for (const pid of Object.keys(deltas)) {
  console.log(`  ${pid}:`);
  for (const [k, v] of Object.entries(deltas[pid]).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`    ${k}: ${v >= 0 ? '+' : ''}${Math.round(v).toLocaleString('en-US')}`);
  }
}
