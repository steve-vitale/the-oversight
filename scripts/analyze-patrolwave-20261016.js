#!/usr/bin/env node
'use strict';
// analyze-patrolwave-20261016.js — verdict analyzer for the sim-patrolwave
// sweep. Reads evidence/2026-10-16/perseed-patrolwave/ and judges the
// pre-registered header:
//
//   PRIMARY: NET post-invite monster-verb villager combat deaths per run
//   ((b)-channel + PATROL channel). GO = armed NET sum <= 0.75x control NET
//   sum on identical seeds.
//   Exercise gates: resolvePatrol fires >0 on armed (0 on control);
//   wave-4/5 stand-downs >0 on armed (the gate must have contact).
//   Guardrails: national >= control-2; median survival >= control-10d;
//   no new death mode; starvation share unchanged; exiled unchanged.
//
// Usage: node scripts/analyze-patrolwave-20261016.js
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-patrolwave');

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

console.log('=== per-pair NET deaths (post-invite monster-verb villager combat: b-channel + PATROL) ===');
console.log('pair               control  armed   bChanC bChanA patC patA firesC firesA sdA');
for (const p of pairs) {
  console.log(`${p.key.padEnd(18)} ${String(p.c.netDeaths).padStart(7)} ${String(p.a.netDeaths).padStart(6)} ` +
    `${String(p.c.bChannel).padStart(6)} ${String(p.a.bChannel).padStart(6)} ` +
    `${String(p.c.patrolChan).padStart(4)} ${String(p.a.patrolChan).padStart(4)} ` +
    `${String(p.c.patrolFires).padStart(6)} ${String(p.a.patrolFires).padStart(6)} ${String(p.a.patrolStanddowns).padStart(3)}`);
}
const cN = sum(pairs.map(p => p.c), 'netDeaths'), aN = sum(pairs.map(p => p.a), 'netDeaths');
const ratio = cN ? aN / cN : (aN === 0 ? 0 : Infinity);
console.log(`\nPRIMARY: control NET sum=${cN}, armed NET sum=${aN}, ratio=${ratio.toFixed(3)} (GO <= 0.750)`);
console.log(ratio <= 0.75 ? 'PRIMARY: GO' : 'PRIMARY: NO-GO');
const cB = sum(pairs.map(p => p.c), 'bChannel'), aB = sum(pairs.map(p => p.a), 'bChannel');
const cP = sum(pairs.map(p => p.c), 'patrolChan'), aP = sum(pairs.map(p => p.a), 'patrolChan');
console.log(`  decomposition: b-channel ${cB} -> ${aB}; PATROL channel ${cP} -> ${aP}`);
let better = 0, worse = 0, tied = 0;
for (const p of pairs) { if (p.a.netDeaths < p.c.netDeaths) better++; else if (p.a.netDeaths > p.c.netDeaths) worse++; else tied++; }
console.log(`  per-pair sign: armed better ${better} / worse ${worse} / tied ${tied}`);

const cF = sum(pairs.map(p => p.c), 'patrolFires'), aF = sum(pairs.map(p => p.a), 'patrolFires');
const aSd = sum(pairs.map(p => p.a), 'patrolStanddowns');
console.log(`\nEXERCISE GATES: control patrol fires=${cF} (want 0), armed fires=${aF} (want >0)`);
console.log(cF === 0 && aF > 0 ? 'EXERCISE fires: PASS' : 'EXERCISE fires: FAIL — kill the arm');
console.log(`wave-4/5 stand-downs on armed=${aSd} (want >0 — the gate must have contact)`);
console.log(aSd > 0 ? 'EXERCISE gate-contact: PASS' : 'EXERCISE gate-contact: FAIL — the gate never met an apex; kill the mechanism claim');

const cNat = sum(pairs.map(p => p.c), 'national'), aNat = sum(pairs.map(p => p.a), 'national');
const cMed = med(pairs.map(p => p.c.gameDays || 0)), aMed = med(pairs.map(p => p.a.gameDays || 0));
const cStarv = pairs.reduce((t, p) => t + ((p.c.famShare || {}).starvation || 0), 0);
const aStarv = pairs.reduce((t, p) => t + ((p.a.famShare || {}).starvation || 0), 0);
const cND = sum(pairs.map(p => p.c), 'nDeaths'), aND = sum(pairs.map(p => p.a), 'nDeaths');
const famsC = new Set(), famsA = new Set();
for (const p of pairs) {
  Object.keys(p.c.famShare || {}).forEach(k => famsC.add(k));
  Object.keys(p.a.famShare || {}).forEach(k => famsA.add(k));
}
const newModes = [...famsA].filter(k => !famsC.has(k));
console.log('\nGUARDRAILS:');
console.log(`  national: control=${cNat} armed=${aNat} (need >= ${cNat - 2}) ${aNat >= cNat - 2 ? 'PASS' : 'FAIL'}`);
console.log(`  median survival: control=${cMed}d armed=${aMed}d (need >= ${cMed - 10}d) ${aMed >= cMed - 10 ? 'PASS' : 'FAIL'}`);
console.log(`  starvation deaths: control=${cStarv} armed=${aStarv} (share ${(cStarv / Math.max(1, cND) * 100).toFixed(1)}% -> ${(aStarv / Math.max(1, aND) * 100).toFixed(1)}%)`);
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

console.log(`\nattribution (armed post-invite monster-verb): ${JSON.stringify(pairs.reduce((t, p) => {
  for (const [k, v] of Object.entries(p.a.postInviteSrcShare || {})) t[k] = (t[k] || 0) + v;
  return t;
}, {}))}`);
