#!/usr/bin/env node
'use strict';
// analyze-patrolassign-20261016.js — verdict analyzer for the
// sim-patrolassign sweep. Reads evidence/2026-10-16/perseed-patrolassign/
// and judges the pre-registered header:
//
//   PRIMARY: (b)-channel post-invite monster-verb villager combat deaths per
//   run (RAID+EXPEDITION+WILD-ENCOUNTER; patrol carved out). GO = armed sum
//   <= 0.7x control sum on identical seeds.
//   Exercise gate: resolvePatrol fires >0 on armed, 0 on control.
//   Guardrails: national >= control-2; median survival >= control-10d;
//   no new death mode; starvation share unchanged; exiled unchanged.
//
// Usage: node scripts/analyze-patrolassign-20261016.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolassign');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const byKey = {};
for (const r of runs) byKey[`${r.policyId}|s${r.seed}|${r.arm}`] = r;

const pairs = [];
for (const r of runs) {
  if (r.arm !== 'control') continue;
  const a = byKey[`${r.policyId}|s${r.seed}|armed`];
  if (a) pairs.push({ key: `${r.policyId}-s${r.seed}`, c: r, a });
}
if (!pairs.length) { console.error('no control/armed pairs found'); process.exit(2); }

const sum = (rs, f) => rs.reduce((t, r) => t + (r[f] || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

console.log('=== per-pair (b)-channel deaths (post-invite monster-verb villager combat, RAID+EXP+WILD) ===');
console.log('pair               control  armed   firesC firesA assignsA');
for (const p of pairs) {
  console.log(`${p.key.padEnd(18)} ${String(p.c.bChannel).padStart(7)} ${String(p.a.bChannel).padStart(6)} ` +
    `${String(p.c.patrolFires).padStart(7)} ${String(p.a.patrolFires).padStart(6)} ${String(p.a.patrolAssigns).padStart(8)}`);
}
const cB = sum(pairs.map(p => p.c), 'bChannel'), aB = sum(pairs.map(p => p.a), 'bChannel');
const ratio = cB ? aB / cB : (aB === 0 ? 0 : Infinity);
console.log(`\nPRIMARY: control b-channel sum=${cB}, armed sum=${aB}, ratio=${ratio.toFixed(3)} (GO <= 0.700)`);
console.log(ratio <= 0.7 ? 'PRIMARY: GO' : 'PRIMARY: NO-GO');

const cF = sum(pairs.map(p => p.c), 'patrolFires'), aF = sum(pairs.map(p => p.a), 'patrolFires');
console.log(`\nEXERCISE GATE: control patrol fires=${cF} (want 0), armed fires=${aF} (want >0)`);
console.log(cF === 0 && aF > 0 ? 'EXERCISE: PASS' : 'EXERCISE: FAIL — kill the arm');

const cNat = sum(pairs.map(p => p.c), 'national'), aNat = sum(pairs.map(p => p.a), 'national');
const cMed = med(pairs.map(p => p.c.gameDays || 0)), aMed = med(pairs.map(p => p.a.gameDays || 0));
const cStarv = sum(pairs.map(p => p.c), 'nDeaths') ? pairs.reduce((t, p) => t + ((p.c.famShare || {}).starvation || 0), 0) : 0;
const aStarv = pairs.reduce((t, p) => t + ((p.a.famShare || {}).starvation || 0), 0);
const cN = sum(pairs.map(p => p.c), 'nDeaths'), aN = sum(pairs.map(p => p.a), 'nDeaths');
const famsC = new Set(), famsA = new Set();
for (const p of pairs) {
  Object.keys(p.c.famShare || {}).forEach(k => famsC.add(k));
  Object.keys(p.a.famShare || {}).forEach(k => famsA.add(k));
}
const newModes = [...famsA].filter(k => !famsC.has(k));
console.log('\nGUARDRAILS:');
console.log(`  national: control=${cNat} armed=${aNat} (need >= ${cNat - 2}) ${aNat >= cNat - 2 ? 'PASS' : 'FAIL'}`);
console.log(`  median survival: control=${cMed}d armed=${aMed}d (need >= ${cMed - 10}d) ${aMed >= cMed - 10 ? 'PASS' : 'FAIL'}`);
console.log(`  starvation deaths: control=${cStarv} armed=${aStarv} (share ${(cStarv / Math.max(1, cN) * 100).toFixed(1)}% -> ${(aStarv / Math.max(1, aN) * 100).toFixed(1)}%)`);
console.log(`  new death modes on armed: ${newModes.length ? newModes.join(', ') + ' — REVIEW' : 'none'} `);
console.log(`  exiled: control=${sum(pairs.map(p => p.c), 'exiled')} armed=${sum(pairs.map(p => p.a), 'exiled')}`);

console.log('\nWALL (armed):');
const aW = pairs.map(p => p.a);
console.log(`  national ${sum(aW, 'national')}/${aW.length} table ${sum(aW, 'table')}/${aW.length} wins ${sum(aW, 'wins')}/${aW.length} ` +
  `wave4+ ${aW.filter(r => r.maxWave >= 4).length}/${aW.length} wave5 ${aW.filter(r => r.maxWave >= 5).length}/${aW.length} ` +
  `median ${med(aW.map(r => r.gameDays || 0))}d exiled ${sum(aW, 'exiled')}`);
console.log('WALL (control):');
const cW = pairs.map(p => p.c);
console.log(`  national ${sum(cW, 'national')}/${cW.length} table ${sum(cW, 'table')}/${cW.length} wins ${sum(cW, 'wins')}/${cW.length} ` +
  `wave4+ ${cW.filter(r => r.maxWave >= 4).length}/${cW.length} wave5 ${cW.filter(r => r.maxWave >= 5).length}/${cW.length} ` +
  `median ${med(cW.map(r => r.gameDays || 0))}d exiled ${sum(cW, 'exiled')}`);

// patrol-channel detail (the lever's own cost channel)
const aPat = pairs.reduce((t, p) => t + (((p.a.postInviteSrcShare || {}).PATROL) || 0), 0);
console.log(`\nPATROL channel (post-invite monster-verb villager deaths via patrol router): armed=${aPat}`);
console.log(`attribution (armed post-invite monster-verb): ${JSON.stringify(pairs.reduce((t, p) => {
  for (const [k, v] of Object.entries(p.a.postInviteSrcShare || {})) t[k] = (t[k] || 0) + v;
  return t;
}, {}))}`);
