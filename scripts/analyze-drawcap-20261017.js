#!/usr/bin/env node
// scripts/analyze-drawcap-20261017.js — verdict analysis for sim-drawcap-b.
// Reads evidence/2026-10-17/perseed-drawcap/*.json, judges the pre-registered
// PRIMARY / CO-PRIMARY / GO / ENGAGEMENT / GUARDRAILS / HETEROGENEITY, and
// prints the wall numbers + death-cause shares. Read-only.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-drawcap');
const recs = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const by = (s) => recs.filter(r => r.side === s);
const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

console.log(`n: control=${by('control').length} armed=${by('armed').length}`);
for (const side of ['control', 'armed']) {
  const rs = by(side), n = rs.length;
  const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
  const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
  console.log(`--- ${side} (n=${n}) ---`);
  console.log(`starvation=${sum(rs, 'starvation')}  starv/vday=${(sum(rs, 'starvation') / Math.max(1, vd) * 1000).toFixed(2)}/1000vd`);
  console.log(`freshRot=${Math.round(rot / 1000)}k  rot/vday=${(rot / Math.max(1, vd)).toFixed(0)}`);
  console.log(`national=${sum(rs, 'national')}/${n} table=${sum(rs, 'table')}/${n} wins=${sum(rs, 'wins')}/${n} exiled=${sum(rs, 'exiled')}/${n}`);
  console.log(`medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d maxSurv=${Math.max(...rs.map(r => r.gameDays))}d`);
  console.log(`wave: max=[${rs.map(r => r.maxWave).join(',')}] wave4=${sum(rs, 'wave4')}/${n} wave5=${sum(rs, 'wave5')}/${n}`);
  console.log(`dehydration=${sum(rs, 'dehydration')} halfRationDays=${sum(rs, 'halfRationDays')}`);
  console.log(`dcAid=${sum(rs, 'dcAid')} dcFeasts=${sum(rs, 'dcFeasts')} dcAidKcal=${Math.round(sum(rs, 'dcAidKcal') / 1000)}k dcFeastKcal=${Math.round(sum(rs, 'dcFeastKcal') / 1000)}k`);
  console.log(`dcGateHeld=${sum(rs, 'dcGateHeld')} dcCapDays=${sum(rs, 'dcCapDays')} dcCapHeld=${sum(rs, 'dcCapHeld')}`);
}
// verdicts
const C = by('control'), A = by('armed');
const vdC = C.reduce((a, r) => a + (r.villagerDays || 0), 0), vdA = A.reduce((a, r) => a + (r.villagerDays || 0), 0);
const rotC = C.reduce((a, r) => a + (r.freshRotKcal || 0), 0), rotA = A.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
const stC = sum(C, 'starvation'), stA = sum(A, 'starvation');
console.log('\n== VERDICT ==');
console.log(`PRIMARY starvation armed<=control: ${stA} <= ${stC} -> ${stA <= stC ? 'PASS' : 'FAIL'}`);
console.log(`PRIMARY rate armed<=control*1.15: ${(stA / Math.max(1, vdA) * 1000).toFixed(2)} <= ${(stC / Math.max(1, vdC) * 1000 * 1.15).toFixed(2)} -> ${(stA / Math.max(1, vdA)) <= (stC / Math.max(1, vdC)) * 1.15 ? 'PASS' : 'FAIL'}`);
console.log(`CO-PRIMARY rot armed<=0.75x control: ${Math.round(rotA / 1000)}k <= 0.75*${Math.round(rotC / 1000)}k=${Math.round(rotC * 0.75 / 1000)}k -> ${rotA <= rotC * 0.75 ? 'PASS' : 'FAIL'}`);
const verbsA = sum(A, 'dcAid') + sum(A, 'dcFeasts');
console.log(`ENGAGEMENT (a) verbs>=20 armed: ${verbsA} -> ${verbsA >= 20 ? 'PASS' : 'FAIL'}`);
console.log(`ENGAGEMENT (b) capHeld>=8: ${sum(A, 'dcCapHeld')} -> ${sum(A, 'dcCapHeld') >= 8 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD national>=control-2: ${sum(A, 'national')} >= ${sum(C, 'national') - 2} -> ${sum(A, 'national') >= sum(C, 'national') - 2 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD median within 10d: ${median(A.map(r => r.gameDays)).toFixed(1)} vs ${median(C.map(r => r.gameDays)).toFixed(1)} -> ${Math.abs(median(A.map(r => r.gameDays)) - median(C.map(r => r.gameDays))) <= 10 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD table>=control-2: ${sum(A, 'table')} >= ${sum(C, 'table') - 2} -> ${sum(A, 'table') >= sum(C, 'table') - 2 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD dehydration<=control+1: ${sum(A, 'dehydration')} <= ${sum(C, 'dehydration') + 1} -> ${sum(A, 'dehydration') <= sum(C, 'dehydration') + 1 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD wins 0=0: ${sum(C, 'wins')}=${sum(A, 'wins')} -> ${sum(C, 'wins') === 0 && sum(A, 'wins') === 0 ? 'PASS' : 'FAIL'}`);
console.log(`GUARD exiled 0=0: ${sum(C, 'exiled')}=${sum(A, 'exiled')} -> ${sum(C, 'exiled') === 0 && sum(A, 'exiled') === 0 ? 'PASS' : 'FAIL'}`);
// death modes
const modes = (rs) => { const m = new Set(); for (const r of rs) for (const k of Object.keys(r.deaths || {})) m.add(k); return m; };
const newModes = [...modes(A)].filter(k => !modes(C).has(k));
console.log(`GUARD no new death mode: ${newModes.length ? 'FAIL new=' + newModes.join(',') : 'PASS'}`);
// heterogeneity
const deltas = A.map(r => { const c = C.find(x => x.policyId === r.policyId && x.seed === r.seed); return c ? { seed: r.seed, policyId: r.policyId, d: r.starvation - c.starvation } : null; }).filter(Boolean);
console.log(`HETERO max paired starvation delta<=+3: ${Math.max(...deltas.map(x => x.d))} -> ${Math.max(...deltas.map(x => x.d)) <= 3 ? 'PASS' : 'FAIL'}`);
console.log('paired deltas: ' + deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
// byte-identical pairs
let identical = 0;
for (const r of A) { const c = C.find(x => x.policyId === r.policyId && x.seed === r.seed); if (c && r.hashes.length === c.hashes.length && r.hashes.every((h, i) => h === c.hashes[i])) identical++; }
console.log(`byte-identical armed/control pairs: ${identical}/${A.length}`);
