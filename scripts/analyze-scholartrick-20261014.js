#!/usr/bin/env node
// scripts/analyze-scholartrick-20261014.js — before/after comparison for the
// scholartrick pilot. Usage:
//   node scripts/analyze-scholartrick-20261014.js /tmp/scholartrick-baseline.json /tmp/scholartrick-after.json
'use strict';
const fs = require('fs');
const [,, baseF, afterF] = process.argv;
const base = JSON.parse(fs.readFileSync(baseF, 'utf8'));
const after = JSON.parse(fs.readFileSync(afterF, 'utf8'));

function agg(runs) {
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  return {
    n: runs.length,
    won: runs.reduce((t, r) => t + r.won, 0),
    medDays: med, maxDays: days.length ? days[days.length - 1] : 0,
    maxWave: Math.max(...runs.map(r => r.waveReach), 1),
    wave3plus: runs.filter(r => r.waveReach >= 3).length,
    national: runs.reduce((t, r) => t + r.national, 0),
    table: runs.reduce((t, r) => t + r.table, 0),
    scholarObs: runs.reduce((t, r) => t + (r.scholarObs || 0), 0),
    scholarDisc: runs.reduce((t, r) => t + (r.scholarDisc || 0), 0),
    villObs: runs.reduce((t, r) => t + (r.villObs || 0), 0),
  };
}
const b = agg(base.runs), a = agg(after.runs);
console.log('metric            baseline   after');
console.log(`n                 ${b.n}         ${a.n}`);
console.log(`won               ${b.won}         ${a.won}`);
console.log(`medDays           ${b.medDays}        ${a.medDays}   (guardrail: within +-10d)`);
console.log(`maxDays           ${b.maxDays}       ${a.maxDays}`);
console.log(`maxWave           ${b.maxWave}         ${a.maxWave}`);
console.log(`wave3+ unlocks    ${b.wave3plus}         ${a.wave3plus}`);
console.log(`national          ${b.national}         ${a.national}`);
console.log(`table             ${b.table}         ${a.table}`);
console.log(`scholarObs        ${b.scholarObs}         ${a.scholarObs}   (GO: >=4 across pilot)`);
console.log(`scholarDisc       ${b.scholarDisc}         ${a.scholarDisc}   (GO: >=1)`);
console.log(`villObs           ${b.villObs}         ${a.villObs}`);
console.log('\nper-seed scholarObs/scholarDisc (after):');
for (const r of after.runs) console.log(`  ${r.policy} s${r.seed}: days=${r.days} end=${r.endReason} wave=${r.waveReach} scholarObs=${r.scholarObs} scholarDisc=${r.scholarDisc} villObs=${r.villObs}`);
console.log('\nGO verdict:',
  (a.scholarObs >= 4 && a.scholarDisc >= 1) ? 'GO (primary)' : 'NO-GO (primary)',
  '| guardrail medDays:', Math.abs(a.medDays - b.medDays) <= 10 ? 'PASS' : 'FAIL',
  '| wave-3 unlocks on pilot:', a.wave3plus > 0 ? a.wave3plus + ' seeds' : 'NONE (mechanism-starved kill clause)');
