#!/usr/bin/env node
// scripts/analyze-hauldrive-20261016.js — GO/NO-GO analysis for the
// sim-hauldrive-b pilot (reads evidence/2026-10-16/perseed-hauldrive/*.json).
//
// PRIMARY (binding): player-hauled gross kcal share armed >= 2x control.
// GUARDRAILS: starvation deaths <= control+2; national >= control-2;
//   no new death mode; median survival >= control-10d;
//   alien quirks <= control+2.
// SECONDARY (report-only): eaten kcal/run; hunger-days.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-hauldrive');

const rows = [];
for (const f of fs.readdirSync(EVID)) {
  const mt = f.match(/^([a-z]+)-(control|armed)-s(\d+)\.json$/);
  if (!mt) continue;
  const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  if (!r.error) rows.push(r);
}
const by = (side) => rows.filter(r => r.side === side);
const sum = (rs, f) => rs.reduce((t, r) => t + (f(r) || 0), 0);
const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };

function side(name) {
  const rs = by(name);
  const killed = sum(rs, r => r.killed), hauled = sum(rs, r => r.hauled);
  return {
    n: rs.length, name,
    killed, hauled,
    share: killed > 0 ? hauled / killed : 0,
    hdHauled: sum(rs, r => r.hdHauled), hdCleaned: sum(rs, r => r.hdCleaned),
    hdKnifeSkips: sum(rs, r => r.hdKnifeSkips), hdSampled: sum(rs, r => r.hdSampled || 0),
    meatTests: sum(rs, r => r.meatTests),
    reveals: sum(rs, r => r.reveals),
    eaten: sum(rs, r => r.eatenAnyone),
    eatenPerRun: rs.length ? sum(rs, r => r.eatenAnyone) / rs.length : 0,
    quirks: sum(rs, r => r.quirks),
    starveDeaths: sum(rs, r => r.starveDeaths),
    hungryDays: sum(rs, r => r.hungryDays),
    national: sum(rs, r => r.national ? 1 : 0),
    medDays: med(rs.map(r => r.days)),
    deaths: {},
  };
}
for (const r of rows) {
  const s = r.side === 'control' ? null : null;
}
const C = side('control'), A = side('armed');
// death modes
for (const r of rows) {
  const tgt = r.side === 'control' ? C : A;
  for (const [k, v] of Object.entries(r.deaths || {})) tgt.deaths[k] = (tgt.deaths[k] || 0) + v;
}

console.log('=== sim-hauldrive-b pilot analysis ===');
console.log(`rows: control=${C.n} armed=${A.n}`);
console.log('');
console.log('PRIMARY: player-hauled gross kcal share');
console.log(`  control: hauled=${C.killed ? (C.hauled / 1000).toFixed(1) : 0}k / killed=${(C.killed / 1000).toFixed(1)}k = ${(C.share * 100).toFixed(1)}%`);
console.log(`  armed:   hauled=${(A.hauled / 1000).toFixed(1)}k / killed=${(A.killed / 1000).toFixed(1)}k = ${(A.share * 100).toFixed(1)}%`);
console.log(`  bar: armed >= 2x control = >= ${(C.share * 2 * 100).toFixed(1)}%`);
const goPrimary = A.share >= C.share * 2 && C.n > 0 && A.n > 0;
console.log(`  => ${goPrimary ? 'GO' : 'MISS'}`);
console.log('');
console.log('MECHANISM LIVENESS (armed):');
console.log(`  hdHauled=${A.hdHauled} hdCleaned=${A.hdCleaned} hdKnifeSkips=${A.hdKnifeSkips} hdSampled=${A.hdSampled} meatTests=${A.meatTests} reveals=${A.reveals}`);
console.log('');
console.log('GUARDRAILS:');
console.log(`  starvation deaths: control=${C.starveDeaths} armed=${A.starveDeaths} (bar <= ${C.starveDeaths + 2}) => ${A.starveDeaths <= C.starveDeaths + 2 ? 'GO' : 'MISS'}`);
console.log(`  national: control=${C.national}/${C.n} armed=${A.national}/${A.n} (bar >= ${C.national - 2}) => ${A.national >= C.national - 2 ? 'GO' : 'MISS'}`);
console.log(`  median survival: control=${C.medDays}d armed=${A.medDays}d (bar >= ${C.medDays - 10}d) => ${A.medDays >= C.medDays - 10 ? 'GO' : 'MISS'}`);
console.log(`  alien quirks: control=${C.quirks} armed=${A.quirks} (bar <= ${C.quirks + 2}) => ${A.quirks <= C.quirks + 2 ? 'GO' : 'MISS'}`);
const cModes = Object.keys(C.deaths), aModes = Object.keys(A.deaths);
const newModes = aModes.filter(m => !cModes.includes(m) && (A.deaths[m] || 0) >= 3);
console.log(`  new death mode (n>=3): ${newModes.length ? newModes.join(',') + ' MISS' : 'none GO'}`);
console.log('');
console.log('SECONDARY (report-only):');
console.log(`  eaten kcal/run: control=${C.eatenPerRun.toFixed(0)} armed=${A.eatenPerRun.toFixed(0)}`);
console.log(`  hunger-days: control=${C.hungryDays} armed=${A.hungryDays}`);
console.log('');
console.log('DEATH MODES:');
console.log('  control:', JSON.stringify(C.deaths));
console.log('  armed:  ', JSON.stringify(A.deaths));
const goAll = goPrimary &&
  A.starveDeaths <= C.starveDeaths + 2 &&
  A.national >= C.national - 2 &&
  A.medDays >= C.medDays - 10 &&
  A.quirks <= C.quirks + 2 &&
  newModes.length === 0;
console.log('');
console.log(`OVERALL: ${goAll ? 'GO — land the layer' : 'NO-GO — kill protocol'}`);
