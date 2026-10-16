#!/usr/bin/env node
// scripts/analyze-aidfeastint-20261016.js — SIM-AIDFEASTINT-B analysis.
// Reads the sweep output JSON (OUT=) and prints the pre-registered
// verdict: PRIMARY interaction on the lead road, validity floor,
// guardrails, wall numbers, per-seed ratios, death-cause shares.
//
// Usage:
//   node scripts/analyze-aidfeastint-20261016.js evidence/2026-10-16/aidfeastint-sweep.json
'use strict';
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.error('usage: analyze-aidfeastint-20261016.js <sweep.json>'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(f, 'utf8'));
const rows = data.rows;
const byKey = {};
for (const r of rows) { (byKey[r.key] = byKey[r.key] || []).push(r); }
const sum = (rs, fn) => rs.reduce((t, r) => t + (fn(r) || 0), 0);
const rot = (key) => sum(byKey[key] || [], r => r.rotFresh);

function roadReport(road) {
  const n = byKey[`${road}_neither`], a = byKey[`${road}_aid`],
        fe = byKey[`${road}_feast`], b = byKey[`${road}_both`];
  const rn = rot(`${road}_neither`), ra = rot(`${road}_aid`),
        rf = rot(`${road}_feast`), rb = rot(`${road}_both`);
  const rAid = ra / Math.max(1, rn), rFeast = rf / Math.max(1, rn), rBoth = rb / Math.max(1, rn);
  const I = rBoth / Math.max(1e-9, rAid * rFeast);
  console.log(`\n== ${road.toUpperCase()} ROAD ==`);
  console.log(`  rot neither=${(rn / 1000).toFixed(1)}k aid=${(ra / 1000).toFixed(1)}k feast=${(rf / 1000).toFixed(1)}k both=${(rb / 1000).toFixed(1)}k`);
  console.log(`  ratios: aid/neither=${rAid.toFixed(3)} feast/neither=${rFeast.toFixed(3)} both/neither=${rBoth.toFixed(3)}`);
  console.log(`  INTERACTION I = ${rBoth.toFixed(3)} / (${rAid.toFixed(3)} x ${rFeast.toFixed(3)}) = ${I.toFixed(3)}`);
  // per-seed ratios
  const seeds = [...new Set(rows.map(r => r.seed))].sort((x, y) => x - y);
  const psr = [];
  for (const s of seeds) {
    const rn1 = (byKey[`${road}_neither`].find(r => r.seed === s) || {}).rotFresh || 0;
    const rb1 = (byKey[`${road}_both`].find(r => r.seed === s) || {}).rotFresh || 0;
    const rr = rn1 > 5000 ? rb1 / rn1 : null; // near-zero guard (aiddrain lesson)
    psr.push(`s${s}:${rr === null ? 'nz' : rr.toFixed(2)}`);
  }
  console.log(`  per-seed both/neither: ${psr.join(' ')}`);
  // engagement
  const bAid = sum(b, r => r.adAid), bFeast = sum(b, r => r.fdFeasts),
        bTrig = sum(b, r => r.triggerDays);
  const aAid = sum(a, r => r.adAid), fFeast = sum(fe, r => r.fdFeasts);
  console.log(`  engagement: both-cell aid=${bAid} (aid-cell ${aAid}) feasts=${bFeast} (feast-cell ${fFeast}) trigger-days=${bTrig}`);
  // guardrails
  const nat = (rs) => sum(rs, r => r.national);
  const starve = (rs) => sum(rs, r => r.starveDeaths);
  const hungry = (rs) => sum(rs, r => r.hungryDays);
  const w5 = (rs) => rs.filter(r => (r.waveReach || 1) >= 5).length;
  console.log(`  guardrails: national neither=${nat(n)} aid=${nat(a)} feast=${nat(fe)} both=${nat(b)} (need both >= ${nat(n) - 2})`);
  console.log(`  guardrails: starve neither=${starve(n)} aid=${starve(a)} feast=${starve(fe)} both=${starve(b)} (need both <= ${starve(n) + 2})`);
  console.log(`  guardrails: hungry neither=${hungry(n)} both=${hungry(b)} (need <= ${(hungry(n) * 1.409).toFixed(0)})`);
  console.log(`  guardrails: wave5 neither=${w5(n)} both=${w5(b)}; social-verb sanity aid ${bAid}>=0.5x${aAid}=${(0.5 * aAid).toFixed(0)} feast ${bFeast}>=0.5x${fFeast}=${(0.5 * fFeast).toFixed(0)}`);
  return { I, rAid, rFeast, rBoth, rn, ra, rf, rb, bAid, bFeast, bTrig, aAid, fFeast };
}

console.log('== SIM-AIDFEASTINT-B analysis ==');
const lead = roadReport('lead');
const belong = roadReport('belong');

console.log('\n== PRIMARY VERDICT (pre-registered) ==');
console.log(`  I_lead = ${lead.I.toFixed(3)} — GO needs <= 0.7`);
console.log(`  I_belong (replication) = ${belong.I.toFixed(3)}`);
const bothAid = lead.bAid + belong.bAid, bothFeast = lead.bFeast + belong.bFeast,
      bothTrig = lead.bTrig + belong.bTrig;
const floorOk = bothAid >= 24 && bothFeast >= 8 && bothTrig >= 32;
console.log(`\n== VALIDITY FLOOR (pre-registered) ==`);
console.log(`  both-cell engagement: aid=${bothAid} (floor 24) feasts=${bothFeast} (floor 8) trigger-days=${bothTrig} (floor 32)`);
console.log(`  floor ${floorOk ? 'MET — the interaction verdict is interpretable' : 'MISSED — verdict is "inconclusive (channel starved)", NOT the trajectory verdict'}`);

console.log('\n== WALL NUMBERS (all 64 runs) ==');
const keys = Object.keys(byKey);
for (const k of keys) {
  const rs = byKey[k];
  const med = rs.map(r => r.days).sort((a, b) => a - b);
  console.log(`  ${k}: nat=${sum(rs, r => r.national)}/${rs.length} tab=${sum(rs, r => r.table)}/${rs.length} win=${sum(rs, r => r.won)}/${rs.length} exiled=${sum(rs, r => r.exiled)} maxArc=${Math.max(...rs.map(r => r.maxArc))} w4=${rs.filter(r => r.waveReach >= 4).length} w5=${rs.filter(r => r.waveReach >= 5).length} medD=${med[Math.floor(med.length / 2)]} maxD=${med[med.length - 1]}`);
}
console.log('\n== DEATH-CAUSE SHARES (both-cell vs neither, both roads) ==');
const share = (rss) => {
  const m = {};
  for (const rs of rss) for (const r of rs) for (const k of Object.keys(r.deaths || {})) m[k] = (m[k] || 0) + r.deaths[k];
  const tot = Object.values(m).reduce((t, x) => t + x, 0);
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}(${(100 * v / Math.max(1, tot)).toFixed(0)}%)`).join(' ');
};
const bothDeaths = share([byKey.lead_both, byKey.belong_both]);
const neitherDeaths = share([byKey.lead_neither, byKey.belong_neither]);
console.log(`  both: ${bothDeaths || '(no death capture — instrument gap)'}`);
console.log(`  neither: ${neitherDeaths || '(no death capture — instrument gap)'}`);

console.log('\n== VERDICT ==');
if (!floorOk) {
  console.log('  INCONCLUSIVE (channel starved) — the validity floor missed; no trajectory verdict.');
} else if (lead.I <= 0.7) {
  console.log(`  GO — aid×feast interaction exists and is rot-reducing (I=${lead.I.toFixed(3)} <= 0.7).`);
} else {
  console.log(`  KILLED — no rot-reducing interaction (I=${lead.I.toFixed(3)} > 0.7). Verdict: driver-level trajectory effect; the verb space is closed.`);
}
