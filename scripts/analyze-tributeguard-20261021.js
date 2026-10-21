#!/usr/bin/env node
// analyze-tributeguard-20261021.js — analyzer for the sim-tributeguard pilot.
//
// Reads evidence/2026-10-21/perseed-tributeguard/ per-seed JSONs (both arms),
// judges the pre-registered PRIMARY + GUARDRAILS, reports the SECONDARY and
// the wall numbers, and prints a per-seed table.
//
// Usage: node scripts/analyze-tributeguard-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-21', 'perseed-tributeguard');

function load(arm) {
  const rows = [];
  for (const f of fs.readdirSync(EVID)) {
    if (f.indexOf(arm + '-belongfeast-tributeguard-s') === 0 && f.endsWith('.json')) {
      rows.push(JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
    }
  }
  rows.sort((a, b) => a.seed - b.seed);
  return rows;
}
const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] | 0), 0);
const median = (a) => { const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function starvDeaths(rows) {
  let n = 0;
  for (const r of rows) {
    const dc = r.deathCauses || {};
    for (const k of Object.keys(dc)) if (/starv/i.test(k)) n += dc[k];
  }
  return n;
}

const control = load('control');
const armed = load('armed');
if (!control.length || !armed.length) { console.error('missing per-seed JSONs'); process.exit(1); }

console.log(`seeds: control=${control.length} armed=${armed.length}`);
console.log('seed     arm      skips guardPaid partial  dissol arrearsTrip nat ever/nat table won w5 days  end');
for (const r of control.concat(armed)) {
  console.log(`${r.seed} ${r.arm.padEnd(7)} ${String(r.tgSkips).padStart(5)} ${String(r.tgGuardPaid).padStart(9)} ${String(r.tgGuardPartial).padStart(7)} ${String(r.dissolutions).padStart(7)} ${String(r.arrearsTrippedDissolutions).padStart(11)} ${r.nationalEver}/${r.national}    ${r.table}    ${r.won}   ${r.wave5} ${String(r.gameDays).padStart(4)} ${r.endReason}`);
}

// PRIMARY (mechanism): armed skips == 0 AND control skips >= 1.
const cSkips = sum(control, 'tgSkips');
const aSkips = sum(armed, 'tgSkips');
const aGuardPaid = sum(armed, 'tgGuardPaid');
const aPartial = sum(armed, 'tgGuardPartial');
console.log('\nPRIMARY (mechanism pilot):');
console.log(`  control tgSkips = ${cSkips} | armed tgSkips = ${aSkips} | armed tgGuardPaid = ${aGuardPaid} (partial ${aPartial})`);
const primaryGo = aSkips === 0 && cSkips >= 1;
console.log(`  GO = (armed skips == 0) AND (control skips >= 1): ${primaryGo ? 'GO' : 'NO-GO'}`);

// GUARDRAILS (hard).
const cStarv = starvDeaths(control), aStarv = starvDeaths(armed);
const cMed = median(control.map(r => r.gameDays)), aMed = median(armed.map(r => r.gameDays));
console.log('\nGUARDRAILS (hard):');
console.log(`  starvation deaths: armed ${aStarv} vs control ${cStarv} (bar <= control+1 = ${cStarv + 1}): ${aStarv <= cStarv + 1 ? 'PASS' : 'MISS'}`);
console.log(`  median survival: armed ${aMed}d vs control ${cMed}d (bar >= control-10 = ${cMed - 10}): ${aMed >= cMed - 10 ? 'PASS' : 'MISS'}`);

// SECONDARY (report only): arrears-tripped dissolutions.
console.log('\nSECONDARY (report only, never judged):');
console.log(`  dissolution transitions: control ${sum(control, 'dissolutions')} (arrears-tripped ${sum(control, 'arrearsTrippedDissolutions')}) | armed ${sum(armed, 'dissolutions')} (arrears-tripped ${sum(armed, 'arrearsTrippedDissolutions')})`);

// Wall numbers.
function wall(rows) {
  return {
    n: rows.length,
    natEnd: sum(rows, 'national'), natEver: sum(rows, 'nationalEver'),
    table: sum(rows, 'table'), won: sum(rows, 'won'),
    wave4: sum(rows, 'wave4'), wave5: sum(rows, 'wave5'),
    exiled: sum(rows, 'exiled'),
    medSurv: median(rows.map(r => r.gameDays)),
    maxSurv: Math.max(...rows.map(r => r.gameDays)),
  };
}
console.log('\nWALL NUMBERS:');
console.log('  control:', JSON.stringify(wall(control)));
console.log('  armed:  ', JSON.stringify(wall(armed)));

// Guard/skip event samples (first few per arm) for the sense read.
console.log('\nEVENT SAMPLES:');
for (const r of control.concat(armed)) {
  const evs = (r.tgEvents || []).slice(0, 3);
  if (evs.length) console.log(`  s${r.seed} ${r.arm}: ` + evs.map(e => `${e.kind}@d${e.day}(trust${e.trust}/arr${e.arrears}/trib${e.trib}/pantry${e.pantryKcal})`).join(' '));
}
