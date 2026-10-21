#!/usr/bin/env node
// scripts/analyze-huntdecomp-b.js — attribution analysis for sim-huntstaff-decomp-b.
// Reads evidence/2026-10-21/perseed-huntdecomp-b/ (schema 'huntdecomp/1'),
// rep1 only, and prints the three-hypothesis attribution tables plus the
// completeness accounting against the pre-registered bar.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-huntdecomp-b');
const rows = fs.readdirSync(DIR).filter(f => f.endsWith('-rep1.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const armed = rows.filter(r => r.side === 'armed');
const control = rows.filter(r => r.side === 'control');
console.log(`n: armed=${armed.length} control=${control.length}`);
const sum = (a) => a.reduce((t, x) => t + x, 0);
const mean = (a) => a.length ? sum(a) / a.length : 0;
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[(s.length - 1) >> 1] : 0; };
const pk = (r) => `${r.policy}/s${r.seed}`;
// paired config keys present on both sides
const keys = [...new Set(armed.map(pk))].filter(k => control.some(r => pk(r) === k));
console.log(`paired configs: ${keys.length}`);
const A = (k) => armed.find(r => pk(r) === k), C = (k) => control.find(r => pk(r) === k);

const perDay = (r, v) => v / Math.max(1, r.days);
function channelTable(chs) {
  console.log('\n== H1/H2 channel inflow (kcal/day, paired means) ==');
  console.log('channel'.padEnd(24) + 'control'.padStart(10) + 'armed'.padStart(10) + 'delta'.padStart(10));
  for (const ch of chs) {
    const c = mean(keys.map(k => perDay(C(k), (C(k).inflow[ch] || 0))));
    const a = mean(keys.map(k => perDay(A(k), (A(k).inflow[ch] || 0))));
    console.log(ch.padEnd(24) + c.toFixed(0).padStart(10) + a.toFixed(0).padStart(10) + (a - c).toFixed(0).padStart(10));
  }
}
const allCh = [...new Set(rows.flatMap(r => Object.keys(r.inflow)))].sort();
channelTable(allCh);

console.log('\n== H1 labor-days (paired means, per run totals / days) ==');
const allT = [...new Set(rows.flatMap(r => Object.keys(r.laborDays)))].sort();
console.log('task'.padEnd(14) + 'control'.padStart(10) + 'armed'.padStart(10) + 'delta'.padStart(10));
for (const t of allT) {
  const c = mean(keys.map(k => (C(k).laborDays[t] || 0) / Math.max(1, C(k).days)));
  const a = mean(keys.map(k => (A(k).laborDays[t] || 0) / Math.max(1, A(k).days)));
  console.log(t.padEnd(14) + c.toFixed(2).padStart(10) + a.toFixed(2).padStart(10) + (a - c).toFixed(2).padStart(10));
}

console.log('\n== H1 staffing efficiency (armed only) ==');
{
  const res = sum(armed.map(r => r.staffMatch.resolved));
  const ch = sum(armed.map(r => r.staffMatch.churned));
  const ot = sum(armed.map(r => r.staffMatch.other));
  const rk = sum(armed.map(r => r.staffMatch.resolvedKcal));
  const dc = sum(armed.map(r => r.staffMatch.draftedChore));
  const tot = res + ch + ot;
  console.log(`staffings=${tot} resolved=${res} (${(100 * res / tot).toFixed(1)}%) churned=${ch} (${(100 * ch / tot).toFixed(1)}%) other=${ot}`);
  console.log(`resolved kcal=${Math.round(rk)}  draftedChore=${dc} (${(100 * dc / tot).toFixed(1)}% of staffings drafted a water/fish/wood/cook/garden worker)`);
  const parts = {};
  for (const r of armed) for (const [p, n] of Object.entries(r.staffPartHist)) parts[p] = (parts[p] || 0) + n;
  console.log('staffing part histogram (daily fires at end-of-day):', JSON.stringify(parts));
  const hadAsg = armed.flatMap(r => r.assignLog).filter(e => e.hadAssignment).length;
  console.log(`staffings with an ACTIVE assignment at staffing time: ${hadAsg} (D1-as-coded audit)`);
  // who got drafted: occupation mix of staffed hunters
  const occ = {};
  for (const r of armed) for (const e of r.assignLog) occ[e.occ] = (occ[e.occ] || 0) + 1;
  const top = Object.entries(occ).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log('staffed occupation mix (top):', top.map(([o, n]) => `${o}=${n}`).join(' '));
}

console.log('\n== H2 fast-rot attribution (paired totals per 100d) ==');
{
  const fr = (r) => r.fastRotTotal / Math.max(1, r.days) * 100;
  const c = mean(keys.map(k => fr(C(k)))), a = mean(keys.map(k => fr(A(k))));
  console.log(`fastRot/100d: control=${c.toFixed(0)} armed=${a.toFixed(0)} ratio=${(a / Math.max(1, c)).toFixed(2)}x`);
  const chs = [...new Set(rows.flatMap(r => Object.keys(r.rotByChFast)))].sort();
  console.log('channel'.padEnd(24) + 'control'.padStart(10) + 'armed'.padStart(10) + 'delta'.padStart(10) + 'share-of-excess'.padStart(16));
  const excess = a - c;
  for (const ch of chs) {
    const cc = mean(keys.map(k => (C(k).rotByChFast[ch] || 0) / Math.max(1, C(k).days) * 100));
    const aa = mean(keys.map(k => (A(k).rotByChFast[ch] || 0) / Math.max(1, A(k).days) * 100));
    const sh = excess > 0 ? (aa - cc) / excess : 0;
    console.log(ch.padEnd(24) + cc.toFixed(0).padStart(10) + aa.toFixed(0).padStart(10) + (aa - cc).toFixed(0).padStart(10) + (100 * sh).toFixed(1).padStart(15) + '%');
  }
}

console.log('\n== H3 hunter mortality ==');
{
  const hd = armed.flatMap(r => r.hunterDeaths.map(d => ({ ...d, seed: r.seed, policy: r.policy })));
  const byCause = {};
  for (const d of hd) byCause[d.cause] = (byCause[d.cause] || 0) + 1;
  console.log(`hunter deaths (vid-linked, armed): ${hd.length}`);
  console.log('by cause:', Object.entries(byCause).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}=${n}`).join(' '));
  const allD = armed.flatMap(r => r.vidDeaths.map(d => ({ ...d, seed: r.seed })));
  console.log(`all vid-linked deaths armed: ${allD.length}`);
  // hunter deaths as share of all armed deaths; median day of hunter death vs run
  const hdays = hd.map(d => d.day).sort((a, b) => a - b);
  console.log(`hunter-death day median=${med(hdays)} (n=${hdays.length})`);
  // causes novel vs control kinds
  const cCauses = new Set(control.flatMap(r => r.deaths.map(d => String(d.cause))));
  const novel = Object.keys(byCause).filter(c => ![...cCauses].some(cc => cc === c));
  console.log('hunter-death causes absent from control death kinds:', novel.join(' | ') || '(none)');
}

console.log('\n== completeness: survival & starvation (paired) ==');
{
  const dSurv = keys.map(k => A(k).days - C(k).days);
  const dStarv = keys.map(k => A(k).starvationDeaths - C(k).starvationDeaths);
  console.log(`median survival: control=${med(keys.map(k => C(k).days))} armed=${med(keys.map(k => A(k).days))} pairedDeltaMed=${med(dSurv)}`);
  console.log(`starvation deaths: control=${sum(keys.map(k => C(k).starvationDeaths))} armed=${sum(keys.map(k => A(k).starvationDeaths))} excess=${sum(dStarv)}`);
  console.log(`throttle engagement: control=${mean(keys.map(k => C(k).throttleEngaged / Math.max(1, C(k).throttleCalls))).toFixed(2)} armed=${mean(keys.map(k => A(k).throttleEngaged / Math.max(1, A(k).throttleCalls))).toFixed(2)}`);
  console.log(`starveDays: control=${sum(keys.map(k => C(k).starveDays))} armed=${sum(keys.map(k => A(k).starveDays))}`);
  // wall numbers
  for (const [nm, rs] of [['control', control], ['armed', armed]]) {
    console.log(`${nm}: national=${rs.filter(r => r.national).length}/${rs.length} table=${rs.filter(r => r.table).length}/${rs.length} won=${rs.filter(r => r.won).length}/${rs.length} w4=${rs.filter(r => r.maxWave >= 4).length}/${rs.length} w5=${rs.filter(r => r.maxWave >= 5).length}/${rs.length}`);
  }
}
