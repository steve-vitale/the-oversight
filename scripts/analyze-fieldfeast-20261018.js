#!/usr/bin/env node
// KILLED AT SWEEP 2026-10-18 (flesh-out loop) — PRIMARY NO-GO
// (0 field-fight deed-banking events vs bar >= 4). Layer deleted
// zero-trace per kill protocol; game code reverted. Instruments
// kept; see evidence/2026-10-17/sim-fieldfeast.md.
// scripts/analyze-fieldfeast-20261018.js — verdict analyzer for the
// sim-fieldfeast pilot (no sims; reads per-seed JSONs).
//
// Judges against the pre-registered header in
// evidence/2026-10-17/sim-fieldfeast.md:
//   PRIMARY (GO): >= 4 armed field-fight deed-banking events total
//                 vs 0 control.
//   GUARDRAILS (any miss = NO-GO per MEASUREMENT.md §14):
//                 national armed < control;
//                 wins armed < control;
//                 median survival armed < control - 10d;
//                 any new death mode on armed;
//                 det-gate pair divergences > 0.
//
// Usage: node scripts/analyze-fieldfeast-20261018.js [--dir evidence/2026-10-17/perseed-fieldfeast]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-fieldfeast');

const rows = fs.readdirSync(DIR).filter(f => f.startsWith('fieldfeast-') && f.endsWith('.json'))
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
  const ffBanks = rs.reduce((a, r) => a + (r.ffBankEvents || 0), 0);
  const ffFeast = rs.reduce((a, r) => a + (r.ffFeastedStrikes || 0), 0);
  const ffOver = rs.reduce((a, r) => a + (r.ffOverStrikes || 0), 0);
  const vBanked = sum(rs, r => String(r.foodDeeds.feastSurgeBy || '').startsWith('v:'));
  console.log(`--- ${arm} (n=${rs.length}): holds ${sum(rs, r => r.foodDeeds.holds)}/${rs.length} ` +
    `ffBankEvents ${ffBanks} ffFeastStrikes ${ffFeast} ffOverStrikes ${ffOver} ` +
    `vBanked ${vBanked}/${rs.length} ` +
    `tbVFeast ${rs.reduce((a, r) => a + r.vFeastedBlows, 0)} ` +
    `tbVOver ${rs.reduce((a, r) => a + r.vOverBlows, 0)} ` +
    `schFeast ${rs.reduce((a, r) => a + r.scholarFeastedBlows, 0)} ` +
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
  const ffShares = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.ffBankShares || {})) ffShares[k] = (ffShares[k] || 0) + v;
  console.log(`    ffBankShares: ${JSON.stringify(ffShares)}`);
}

const A = byArm('armed'), C = byArm('control');
const aBanks = A.reduce((a, r) => a + (r.ffBankEvents || 0), 0);
const cBanks = C.reduce((a, r) => a + (r.ffBankEvents || 0), 0);
const aNat = sum(A, r => r.nationalDay != null), cNat = sum(C, r => r.nationalDay != null);
const aWon = sum(A, r => r.won), cWon = sum(C, r => r.won);
const aMed = median(A.map(r => r.endDay)), cMed = median(C.map(r => r.endDay));
const aModes = deathModes(A), cModes = deathModes(C);
const newModes = Object.keys(aModes).filter(k => !(k in cModes));

// PRIMARY
const p1 = aBanks >= 4 && cBanks === 0;
console.log(`\nPRIMARY: armed ffBankEvents ${aBanks} >= 4 AND control ${cBanks} == 0: ${p1 ? 'PASS' : 'FAIL'}`);
if (!p1) { verdict = 'NO-GO'; notes.push('PRIMARY miss'); }

// GUARDRAILS
guard('national regression', aNat < cNat, `armed ${aNat} vs control ${cNat}`);
guard('wins regression', aWon < cWon, `armed ${aWon} vs control ${cWon}`);
guard('median survival', aMed < cMed - 10, `armed d${aMed} vs control d${cMed}`);
guard('new death mode', newModes.length > 0, newModes.length ? newModes.join(',') : 'none');

console.log('\ndeath-cause shares armed:   ' + JSON.stringify(aModes));
console.log('death-cause shares control: ' + JSON.stringify(cModes));
console.log(`\ncompletion: ${rows.length}/32 runs, instrument errors ${rows.reduce((a, r) => a + r.instrumentErrors, 0)}`);
console.log(`\nVERDICT: ${verdict}${notes.length ? ' (' + notes.join('; ') + ')' : ''}`);
process.exit(verdict === 'GO' ? 0 : 2);
