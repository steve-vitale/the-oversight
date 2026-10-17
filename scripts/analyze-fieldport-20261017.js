#!/usr/bin/env node
// scripts/analyze-fieldport-20261017.js — analyze the sim-fieldport sweep.
//
// Reads evidence/2026-10-17/perseed-fieldport/*.json, judges the pre-registered
// PRIMARY (attribution correctness on captured port events) and the guardrails
// (national >= control-2, median survival >= control-10d, no new death mode),
// and the NO-COVERAGE rule (<10 port-fights -> diagnostic).
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.EVID || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-fieldport');

const rows = fs.readdirSync(DIR).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const byArm = { honest: [], inverted: [] };
for (const r of rows) { (byArm[r.arm] || (byArm[r.arm] = [])).push(r); }

const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const sum = a => a.reduce((x, y) => x + y, 0);

function aggVerdicts(rs) {
  const o = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.portVerdicts || {})) o[k] = (o[k] || 0) + v;
  return o;
}

const out = {};
for (const arm of ['honest', 'inverted']) {
  const rs = byArm[arm] || [];
  const v = aggVerdicts(rs);
  const portFights = sum(Object.values(v));
  const portEvents = portFights - (v['no-port'] || 0);
  const correctHonest = (v['honest-taxed'] || 0) + (v['honest-defeated'] || 0) + (v['honest-cut'] || 0);
  const correctInverted = v['inverted'] || 0;
  out[arm] = {
    n: rs.length,
    portFights, portEvents,
    verdicts: v,
    attrCorrect: arm === 'honest' ? correctHonest : correctInverted,
    attrRate: portEvents ? ((arm === 'honest' ? correctHonest : correctInverted) / portEvents) : null,
    national: sum(rs.map(r => r.national)),
    table: sum(rs.map(r => r.table)),
    won: sum(rs.map(r => r.won)),
    exiled: sum(rs.map(r => r.exiled)),
    wave4: sum(rs.map(r => r.wave4Reached)),
    wave5: sum(rs.map(r => r.wave5Reached)),
    medianDays: med(rs.map(r => r.days)),
    maxDays: Math.max(0, ...rs.map(r => r.days)),
    deathCauses: rs.reduce((o, r) => { for (const [k, c] of Object.entries(r.deathCauses || {})) o[k] = (o[k] || 0) + c; return o; }, {}),
  };
}

const H = out.honest, I = out.inverted;
const totalPortEvents = H.portEvents + I.portEvents;
const coverage = totalPortEvents >= 10;
const primaryA = coverage &&
  H.attrRate != null && H.attrRate >= 0.9 &&
  I.attrRate != null && I.attrRate >= 0.9;
const gNational = H.national >= I.national - 2;
const gMedian = H.medianDays >= I.medianDays - 10;
const newModes = Object.keys(H.deathCauses).filter(k => (H.deathCauses[k] || 0) >= 3 && !(I.deathCauses[k] || 0));
const gDeath = newModes.length === 0;
const primary = primaryA && gNational && gMedian && gDeath;

console.log(JSON.stringify({ honest: H, inverted: I }, null, 1));
console.log('\n=== VERDICT ===');
console.log(`coverage: portEvents=${totalPortEvents} (need >=10) -> ${coverage ? 'COVERED' : 'NO-COVERAGE (diagnostic)'}`);
if (coverage) {
  console.log(`PRIMARY(a) attribution: honest arm ${(H.attrRate * 100).toFixed(1)}% (need >=90%), inverted arm ${(I.attrRate * 100).toFixed(1)}% (need >=90%) -> ${primaryA ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail national: honest ${H.national} >= inverted ${I.national} - 2 -> ${gNational ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail median survival: honest ${H.medianDays}d >= inverted ${I.medianDays}d - 10d -> ${gMedian ? 'GO' : 'NO-GO'}`);
  console.log(`guardrail new death mode: ${newModes.length ? 'SUSPECT: ' + newModes.join(', ') : 'none'} -> ${gDeath ? 'GO' : 'NO-GO'}`);
  console.log(`PRIMARY: ${primary ? 'GO' : 'NO-GO'}`);
} else {
  console.log('PRIMARY: not judged (no-coverage) — file as diagnostic.');
}
