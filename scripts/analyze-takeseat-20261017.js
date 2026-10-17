#!/usr/bin/env node
// scripts/analyze-takeseat-20261017.js — verdict analyzer for the takeseat
// pilot sweep (no sims; reads evidence/2026-10-17/perseed-takeseat/*.json).
// Prints the PRIMARY / SECONDARY / guardrail verdicts against the
// pre-registered header in evidence/2026-10-17/sim-takeseat.md.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-takeseat');

const rows = fs.readdirSync(EVID)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
console.log('rows:', rows.length);
const sum = (f) => rows.filter(f).length;
const med = (xs) => { const a = xs.slice().sort((p, q) => p - q); return a.length ? a[(a.length - 1) >> 1] : null; };

for (const road of ['leadfeast', 'belongfeast']) {
  for (const arm of ['armed', 'control']) {
    const rs = rows.filter(r => r.road === road && r.arm === arm);
    const n = rs.length;
    console.log(`\n${road}/${arm} (n=${n}):`);
    console.log(`  tableDone        ${sum(r => r.road === road && r.arm === arm && r.tableDone)}/${n}`);
    console.log(`  seatEarned       ${sum(r => r.road === road && r.arm === arm && r.seatEver !== 'none')}/${n}  seatDays: ${rs.filter(r => r.seatEverDay != null).map(r => 'd' + r.seatEverDay).join(',') || '—'}`);
    console.log(`  invited-staged   ${sum(r => r.road === road && r.arm === arm && r.waitingDay != null)}/${n}`);
    console.log(`  announced        ${sum(r => r.road === road && r.arm === arm && r.announcedDay != null)}/${n}`);
    console.log(`  announced→table  ${rs.filter(r => r.announcedDay != null && r.tableDone).length}/${rs.filter(r => r.announcedDay != null).length || 1} announced runs sat`);
    console.log(`  foodDeeds-holds  ${sum(r => r.road === road && r.arm === arm && r.foodDeeds && r.foodDeeds.holds)}/${n}`);
    console.log(`  arcIV            ${sum(r => r.road === road && r.arm === arm && r.arc4Day != null)}/${n}`);
    console.log(`  national         ${sum(r => r.road === road && r.arm === arm && r.nationalDay != null)}/${n}`);
    console.log(`  won              ${sum(r => r.road === road && r.arm === arm && r.won)}/${n}`);
    console.log(`  takeSeatCalls    ${rs.map(r => (r.takeSeatCalls || []).filter(c => c.ok).length + '/' + (r.takeSeatCalls || []).length).join(' ')}`);
    console.log(`  median survival  d${med(rs.map(r => r.endDay))}  (max d${Math.max(...rs.map(r => r.endDay))})`);
    console.log(`  scholar combat deaths (armed vs control compare): ${rs.reduce((a, r) => a + r.scholarCombatDeaths, 0)}`);
  }
}
console.log('\n--- PRIMARY (GO: armed tableDone ≥ control + 3) ---');
for (const arm of ['armed', 'control']) console.log(`  ${arm}: ${sum(r => r.arm === arm && r.tableDone)}/16`);
console.log(`  verdict: armed−control = ${sum(r => r.arm === 'armed' && r.tableDone) - sum(r => r.arm === 'control' && r.tableDone)} (GO iff ≥ 3)`);
console.log('\n--- SECONDARY ---');
console.log(`  wins armed: ${sum(r => r.arm === 'armed' && r.won)}/16   wins control: ${sum(r => r.arm === 'control' && r.won)}/16`);
const sat = rows.filter(r => r.announcedDay != null && r.tableDone).length;
const ann = rows.filter(r => r.announcedDay != null).length;
console.log(`  announced→table conversion (armed): ${sat}/${ann}`);
const seatDays = rows.filter(r => r.arm === 'armed' && r.seatDay != null).map(r => r.seatDay);
console.log(`  seat days armed: ${seatDays.join(',') || '—'}  median d${med(seatDays)}`);
console.log('\n--- GUARDRAILS (kill: armed median < control−10d; armed national < control−2; new death mode armed) ---');
const mA = med(rows.filter(r => r.arm === 'armed').map(r => r.endDay));
const mC = med(rows.filter(r => r.arm === 'control').map(r => r.endDay));
console.log(`  median survival armed d${mA} vs control d${mC} (Δ=${mA - mC})`);
console.log(`  national armed ${sum(r => r.arm === 'armed' && r.nationalDay != null)}/16 vs control ${sum(r => r.arm === 'control' && r.nationalDay != null)}/16`);
const causes = {};
for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) causes[r.arm + ':' + k] = (causes[r.arm + ':' + k] | 0) + v;
console.log('  death-cause shares (armed vs control):');
const keys = [...new Set(Object.keys(causes).map(k => k.split(':')[1]))];
for (const k of keys) console.log(`    ${k}: armed=${causes['armed:' + k] | 0} control=${causes['control:' + k] | 0}`);
console.log('\n--- SUBSTRATE REPLICATION (control) ---');
const ctl = rows.filter(r => r.arm === 'control');
console.log(`  control staged ${sum(r => r.arm === 'control' && r.waitingDay != null)}/${ctl.length}, tableDone ${sum(r => r.arm === 'control' && r.tableDone)}/${ctl.length}`);
