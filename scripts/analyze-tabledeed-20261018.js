#!/usr/bin/env node
// analyze-tabledeed-20261018.js — attribution table + verdict for sim-tabledeed.
//
// Reads evidence/2026-10-18/perseed-tabledeed/<LABEL>/<policy>/<policy>-s<seed>.json
// and prints: every tableWaiting set (day, value, callsite, seat, gate bars),
// attribution coverage, the verdict (GATING / PRECEDING-BY-DESIGN / BROKEN),
// and the wall numbers.
//
// Usage: node scripts/analyze-tabledeed-20261018.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.argv[2] || path.join(REPO, 'evidence', '2026-10-18', 'perseed-tabledeed', 'tabledeed');

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.json$/.test(f) && f !== '_summary.json') files.push(p);
  }
})(EVID);
files.sort();

let total = 0, totalSets = 0, unattributed = 0;
let trueSets = 0, falseSets = 0;
let trueSetsBySite = {};
let trueSetsGateOk = 0, trueSetsSeatFull = 0, trueSetsSeatLesser = 0, trueSetsSeatNone = 0;
let national = 0, table = 0, won = 0, daysSum = 0, maxWaveCounts = {};
const seedLines = [];
const allSets = [];

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  total++;
  national += j.national | 0; table += j.table | 0; won += j.won | 0;
  daysSum += j.finalDay | 0;
  const mw = 'w' + (j.maxWave | 0);
  maxWaveCounts[mw] = (maxWaveCounts[mw] || 0) + 1;
  seedLines.push(`${j.policy} s${j.seed}: day ${j.finalDay}, maxWave ${j.maxWave}, arc ${j.arc}, rank ${j.rank}, seat ${j.seat}, gateOk ${j.gateOk}, sets ${j.sets.length}`);
  for (const s of (j.sets || [])) {
    totalSets++;
    allSets.push({ seed: j.seed, policy: j.policy, ...s });
    if (s.value) {
      trueSets++;
      const site = s.fn && s.callsite ? `${s.fn} @ ${s.callsite}` : (s.callsite || '?');
      trueSetsBySite[site] = (trueSetsBySite[site] || 0) + 1;
      if (s.gateOk) trueSetsGateOk++;
      if (s.seat === 'full') trueSetsSeatFull++;
      else if (s.seat === 'lesser') trueSetsSeatLesser++;
      else trueSetsSeatNone++;
    } else falseSets++;
    if (!s.callsite && !s.fn) unattributed++;
  }
}

console.log('=== per-seed ===');
for (const l of seedLines) console.log('  ' + l);
console.log(`\n=== attribution: ${totalSets} sets across ${total} runs; unattributed ${unattributed} ===`);
console.log(`  true-sets (invitations extended): ${trueSets}`);
for (const [site, n] of Object.entries(trueSetsBySite).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${n}x ${site}`);
}
console.log(`  false-sets (withdrawals/clears): ${falseSets}`);
console.log(`  invitation sets with gateOk=true (deedGateReady 5/5/4/3/2 met): ${trueSetsGateOk}`);
console.log(`  invitation sets by seat — full ${trueSetsSeatFull} / lesser ${trueSetsSeatLesser} / none ${trueSetsSeatNone}`);

console.log('\n=== all invitation sets (seat at set time + gate bars) ===');
for (const s of allSets.filter(s => s.value)) {
  const b = s.gateBars ? `bars ${s.gateBars.w1}/${s.gateBars.w2}/${s.gateBars.w3}/${s.gateBars.w4}/${s.gateBars.w5} c${s.gateBars.contestsN} cr${s.gateBars.crisesN}` : 'bars n/a';
  console.log(`  ${s.policy} s${s.seed} d${s.day}: ${s.fn} (${s.callsite}) seat=${s.seat} gateOk=${s.gateOk} ${b} arc=${s.arc} rank=${s.rank}`);
}
console.log('\n=== all withdrawal/clear sets ===');
for (const s of allSets.filter(s => !s.value)) {
  console.log(`  ${s.policy} s${s.seed} d${s.day}: ${s.fn} (${s.callsite}) seat=${s.seat}`);
}

console.log(`\n=== wall numbers: national ${national}/${total}, table ${table}/${total}, wins ${won}/${total}, mean days ${(daysSum / total).toFixed(1)}, maxWave ${JSON.stringify(maxWaveCounts)} ===`);

let verdict;
if (unattributed > 0) verdict = 'BROKEN (instrumentation gap: unattributed sets)';
else if (trueSets > 0 && trueSetsGateOk === trueSets && trueSetsSeatFull === trueSets) verdict = 'GATING';
else if (trueSets > 0 && trueSetsGateOk === 0 && trueSetsSeatLesser === trueSets) verdict = 'PRECEDING-BY-DESIGN';
else verdict = 'MIXED (see table)';
console.log(`\nVERDICT: ${verdict}`);
