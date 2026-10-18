#!/usr/bin/env node
// analyze-prodrebound-b.js — aggregate the sim-prodrebound-b diagnostic
// sweep into the attribution verdict.
//
// Reads evidence/2026-10-18/perseed-prodrebound-b/*.json (control|armed x
// leadfeast|belongfeast, fresh seeds + backfire pairs), pairs on
// (policy, seed), and reports:
//   1. per-channel inflow deltas (armed - control, kcal).
//   2. throttle engagement deltas + dawn-sensor deltas.
//   3. whether ANY channel rebounds (armed > control) — the rebound test.
//   4. wall numbers (national / table / wins, wave 4-5, median survival).
//
// Usage: node scripts/analyze-prodrebound-b.js [perseed-dir]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || 'evidence/2026-10-18/perseed-prodrebound-b';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  // filename patterns:
  //   control-leadfeast-s6206.json      -> side, policy, seed (single)
  //   control-leadfeast-fresh.json      -> side, policy, multi-row
  const m = f.replace('.json', '').match(/^(control|armed)-([a-z]+)-(s(\d+)|fresh)$/);
  if (!m) { console.log('SKIP', f); continue; }
  for (const r of (d.rows || [])) {
    rows.push({ side: m[1], policy: m[2], seed: String(r.seed), end: r.end });
  }
}
const pairs = {};
for (const r of rows) {
  const k = r.policy + '|' + r.seed;
  pairs[k] = pairs[k] || {};
  pairs[k][r.side] = r.end;
}

const CH = ['duty_forage', 'duty_garden', 'duty_fish', 'duty_hunt', 'duty_scout', 'duty_cook',
            'away_wild', 'traps', 'haul_field', 'share_surplus', 'leftovers', 'system', 'other'];
const rot = e => (e.rotFresh || 0) + (e.rotPreserved || 0);
const inflowProd = e => Object.entries(e.inflow || {})
  .reduce((t, [k, v]) => t + ((k === 'leftovers' || k === 'system') ? 0 : v), 0);
const med = arr => { const s = arr.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function pairReport(keys, title) {
  console.log(`\n=== ${title} ===`);
  console.log('policy        seed  rotC    rotA    ratio  fdN  dInfl   dutyPresC dutyPresA thrC    thrA   survC survA');
  const agg = { n: 0, rotC: 0, rotA: 0, inflC: 0, inflA: 0, dCh: {}, dThrC: 0, dThrA: 0, thrCallsC: 0, thrCallsA: 0 };
  for (const k of keys) {
    const p = pairs[k];
    if (!p || !p.control || !p.armed) { console.log(k, 'INCOMPLETE'); continue; }
    const c = p.control, a = p.armed;
    const rC = rot(c), rA = rot(a), iC = inflowProd(c), iA = inflowProd(a);
    const thrC = c.throttleCalls ? (c.throttleEngaged / c.throttleCalls) : 0;
    const thrA = a.throttleCalls ? (a.throttleEngaged / a.throttleCalls) : 0;
    console.log(`${k.padEnd(16)} ${String(Math.round(rC / 1000)).padStart(6)}k ${String(Math.round(rA / 1000)).padStart(6)}k ${(rA / Math.max(1, rC)).toFixed(2).padStart(6)} ${String(a.fdNights).padStart(4)} ${String(Math.round((iA - iC) / 1000)).padStart(6)}k ${String(Math.round(c.dutyPreserved / 1000)).padStart(8)}k ${String(Math.round(a.dutyPreserved / 1000)).padStart(8)}k ${(100 * thrC).toFixed(1).padStart(5)}% ${(100 * thrA).toFixed(1).padStart(5)}% ${String(c.days).padStart(5)} ${String(a.days).padStart(5)}`);
    agg.n++; agg.rotC += rC; agg.rotA += rA; agg.inflC += iC; agg.inflA += iA;
    agg.dThrC += c.throttleEngaged; agg.dThrA += a.throttleEngaged;
    agg.thrCallsC += c.throttleCalls; agg.thrCallsA += a.throttleCalls;
    for (const chn of CH) {
      agg.dCh[chn] = agg.dCh[chn] || 0;
      agg.dCh[chn] += ((a.inflow || {})[chn] || 0) - ((c.inflow || {})[chn] || 0);
    }
  }
  if (!agg.n) return;
  console.log(`\npooled (n=${agg.n}): rot C=${Math.round(agg.rotC / 1000)}k A=${Math.round(agg.rotA / 1000)}k ratio=${(agg.rotA / Math.max(1, agg.rotC)).toFixed(3)}`);
  console.log(`pooled inflow C=${Math.round(agg.inflC / 1000)}k A=${Math.round(agg.inflA / 1000)}k delta=${Math.round((agg.inflA - agg.inflC) / 1000)}k`);
  console.log(`throttle engagement: C=${(100 * agg.dThrC / Math.max(1, agg.thrCallsC)).toFixed(1)}% A=${(100 * agg.dThrA / Math.max(1, agg.thrCallsA)).toFixed(1)}%`);
  console.log('channel deltas (armed - control):');
  for (const r of CH.map(chn => ({ chn, d: agg.dCh[chn] || 0 })).sort((a, b) => b.d - a.d)) {
    if (Math.abs(r.d) > 100) console.log(`  ${r.chn.padEnd(14)} ${String(Math.round(r.d / 1000)).padStart(7)}k`);
  }
  // rebound test: is ANY production channel higher on armed?
  const prodUp = CH.filter(chn => !['leftovers', 'system', 'other'].includes(chn) && (agg.dCh[chn] || 0) > 0);
  console.log(`rebound test: ${prodUp.length ? 'REBOUND in ' + prodUp.join(', ') : 'NO rebound — no production channel higher on armed'}`);
}

const freshKeys = Object.keys(pairs).filter(k => /630[1-8]$/.test(k)).sort();
const backfireKeys = ['leadfeast|6206', 'belongfeast|6202'].filter(k => pairs[k]);
pairReport(freshKeys, 'fresh seeds 6301-6308 (diagnostic sweep)');
pairReport(backfireKeys, 'backfire pairs (original seeds)');

// wall numbers on fresh seeds
console.log('\n=== wall numbers (fresh seeds) ===');
for (const side of ['control', 'armed']) {
  const es = freshKeys.map(k => pairs[k][side]).filter(Boolean);
  const n = es.length;
  const nat = es.filter(e => e.nationalLive).length;
  const tab = es.filter(e => e.tableWaiting).length;
  const won = es.filter(e => e.won).length;
  const w4 = es.filter(e => e.maxWave >= 4).length;
  const w5 = es.filter(e => e.maxWave >= 5).length;
  const surv = es.map(e => e.days).sort((a, b) => a - b);
  console.log(`  ${side}: national ${nat}/${n} table ${tab}/${n} wins ${won}/${n} w4 ${w4}/${n} w5 ${w5}/${n} median ${med(surv)}d max ${surv[surv.length - 1] || 0}d`);
}
