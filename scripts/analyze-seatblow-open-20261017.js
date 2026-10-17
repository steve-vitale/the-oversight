#!/usr/bin/env node
// scripts/analyze-seatblow-open-20261017.js — verdict analyzer for the
// sim-seatblow-open pilot (no sims; reads per-seed JSONs).
//
// Judges against the pre-registered header in evidence/2026-10-17/sim-seatblow-open.md:
//   PRIMARY (GO): armed runs with >=1 villager feasted blow >= 3/16
//                 AND >=1 armed run villager-banked (feastSurgeBy 'v:*')
//                 AND no deed regression (armed holds >= control - 1).
//   GUARDRAILS (any miss = NO-GO per MEASUREMENT.md §14):
//                 armed holds < control - 1;
//                 scholar combat deaths armed > control + 2;
//                 median survival armed < control - 10d;
//                 any new death mode on armed.
//
// Usage: node scripts/analyze-seatblow-open-20261017.js [--dir evidence/2026-10-17/perseed-seatblow]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-seatblow');

const rows = fs.readdirSync(DIR).filter(f => f.startsWith('seatblow-') && f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const byArm = (arm) => rows.filter(r => r.arm === arm);
const sum = (rs, f) => rs.filter(f).length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };

function deathModes(rs) {
  const modes = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.deathCauses || {})) modes[k] = (modes[k] || 0) + v;
  return modes;
}

let verdict = 'GO';
const notes = [];
function guard(name, miss, detail) {
  console.log(`${miss ? 'GUARDRAIL MISS' : 'guardrail ok'}: ${name} — ${detail}`);
  if (miss) { verdict = 'NO-GO'; notes.push(name); }
}

for (const arm of ['armed', 'control']) {
  const rs = byArm(arm);
  const vRuns = sum(rs, r => r.vFeastedBlows > 0);
  const vBanked = sum(rs, r => String(r.foodDeeds.feastSurgeBy || '').startsWith('v:'));
  console.log(`--- ${arm} (n=${rs.length}): holds ${sum(rs, r => r.foodDeeds.holds)}/${rs.length} ` +
    `vFeastRuns ${vRuns}/${rs.length} vBanked ${vBanked}/${rs.length} ` +
    `vFeastBlows ${rs.reduce((a, r) => a + r.vFeastedBlows, 0)} ` +
    `vOverBlows ${rs.reduce((a, r) => a + r.vOverBlows, 0)} ` +
    `schFeastBlows ${rs.reduce((a, r) => a + r.scholarFeastedBlows, 0)} ` +
    `seat ${sum(rs, r => r.seatEver !== 'none')}/${rs.length} ` +
    `waiting ${sum(rs, r => r.waitingDay != null)}/${rs.length} ` +
    `national ${sum(rs, r => r.nationalDay != null)}/${rs.length} ` +
    `table ${sum(rs, r => r.tableWaiting)}/${rs.length} ` +
    `won ${sum(rs, r => r.won)}/${rs.length} ` +
    `medSurv d${median(rs.map(r => r.endDay))} maxSurv d${Math.max(...rs.map(r => r.endDay))} ` +
    `schCombatDeaths ${rs.reduce((a, r) => a + r.scholarCombatDeaths, 0)} ` +
    `instrErr ${rs.reduce((a, r) => a + r.instrumentErrors, 0)}`);
  const by = {};
  for (const r of rs) { const k = r.foodDeeds.feastSurgeBy || 'none'; by[k] = (by[k] || 0) + 1; }
  console.log(`    feastSurgeBy: ${JSON.stringify(by)}`);
}

const A = byArm('armed'), C = byArm('control');
const aHolds = sum(A, r => r.foodDeeds.holds), cHolds = sum(C, r => r.foodDeeds.holds);
const aVRuns = sum(A, r => r.vFeastedBlows > 0);
const aVBanked = sum(A, r => String(r.foodDeeds.feastSurgeBy || '').startsWith('v:'));
const aSchD = A.reduce((a, r) => a + r.scholarCombatDeaths, 0), cSchD = C.reduce((a, r) => a + r.scholarCombatDeaths, 0);
const aMed = median(A.map(r => r.endDay)), cMed = median(C.map(r => r.endDay));
const aModes = deathModes(A), cModes = deathModes(C);
const newModes = Object.keys(aModes).filter(k => !(k in cModes));

// PRIMARY conjuncts
const p1 = aVRuns >= 3, p2 = aVBanked >= 1, p3 = aHolds >= cHolds - 1;
console.log(`\nPRIMARY: vFeastRuns ${aVRuns}/16 >= 3: ${p1 ? 'PASS' : 'FAIL'}; ` +
  `vBanked ${aVBanked} >= 1: ${p2 ? 'PASS' : 'FAIL'}; ` +
  `no deed regression (${aHolds} >= ${cHolds}-1): ${p3 ? 'PASS' : 'FAIL'}`);
if (!(p1 && p2 && p3)) { verdict = 'NO-GO'; notes.push('PRIMARY miss'); }

// GUARDRAILS
guard('deed regression', aHolds < cHolds - 1, `armed ${aHolds} vs control ${cHolds}`);
guard('scholar combat deaths', aSchD > cSchD + 2, `armed ${aSchD} vs control ${cSchD} (bound ${cSchD + 2})`);
guard('median survival', aMed < cMed - 10, `armed d${aMed} vs control d${cMed}`);
guard('new death mode', newModes.length > 0, newModes.length ? newModes.join(',') : 'none');

console.log('\ndeath-cause shares armed:   ' + JSON.stringify(aModes));
console.log('death-cause shares control: ' + JSON.stringify(cModes));
console.log(`\ncompletion: ${rows.length}/32 runs, instrument errors ${rows.reduce((a, r) => a + r.instrumentErrors, 0)}`);
console.log(`\nVERDICT: ${verdict}${notes.length ? ' (' + notes.join('; ') + ')' : ''}`);
process.exit(verdict === 'GO' ? 0 : 2);
