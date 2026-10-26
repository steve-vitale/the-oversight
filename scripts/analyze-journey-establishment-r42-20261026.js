#!/usr/bin/env node
// Analyzer for journey ESTABLISHMENT r42 (2026-10-26): re-derives the panel
// verdicts C1/C2/C3/C4, the W intervention-window audit, and the X
// counterfactual summary from the panel + arm JSONs. Read-only: prints to
// stdout, writes nothing. Usage:
//   node scripts/analyze-journey-establishment-r42-20261026.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const load = (n) => JSON.parse(fs.readFileSync(path.join(EVID, n), 'utf8'));
const SEEDS = [209, 228, 238, 239];
const panel = {};
for (const s of SEEDS) panel[s] = load(`journey-establishment-r42-seed${s}.json`);
const arm = load('journey-establishment-r42-counterfactual-seed239.json');

console.log('== C1/C2 (panel totals vs pristine re-score) ==');
for (const t of ['cook', 'builder']) {
  const n1 = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].n1, 0);
  const old = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].old_n1, 0);
  console.log(`  ${t}: living>=1 ${n1} vs pristine ${old} -> ${n1 > old ? 'GO' : 'NO-GO'}`);
}
const regr = SEEDS.reduce((a, s) => a + panel[s].regressions.length, 0);
console.log(`  regressions total: ${regr} -> ${regr === 0 ? 'GO' : 'NO-GO'}`);

console.log('== C3/C4 per seed ==');
for (const s of SEEDS) {
  const d = panel[s];
  console.log(`  ${s}: C3 ${d.c3.verdict} (starvation ${d.c3.starvationDeaths}, maxCrisisStreak ${d.c3.maxCrisisStreak}) | C4 ${d.c4.verdict} (convos ${d.c4.convos}, null ${d.c4.nullCount}, err ${d.c4.errorCount})`);
}

console.log('== W: intervention-window audit (seeds with maxCrisisStreak>=3) ==');
for (const s of SEEDS) {
  const d = panel[s];
  if (d.c3.maxCrisisStreak < 3) { console.log(`  ${s}: no streak window (maxCrisisStreak ${d.c3.maxCrisisStreak})`); continue; }
  const led = d.foodLedger;
  const first = led.find(r => r.hungryStreak >= 3);
  const starv = d.deaths.find(x => /starvat|hunger|thirst/.test(String(x.cause || '')));
  const endDay = starv ? starv.day : led[led.length - 1].day;
  const win = led.filter(r => r.day >= first.day && r.day <= endDay);
  const forage = win.reduce((a, r) => a + (r.typeCounts.forage || 0), 0);
  const contests = d.guardrails.contestList.filter(c => c.day >= first.day && c.day <= endDay);
  const arrivals = d.arrivals.filter(a => a.day >= first.day && a.day <= endDay);
  const tiers = d.guardrails.tierUps.filter(t => t.day >= first.day && t.day <= endDay);
  const broke = win.some(r => r.hungryStreak === 0);
  console.log(`  ${s}: window d${first.day} (hs>=3 first) -> d${endDay} (${starv ? 'starvation ' + starv.who + ' d' + starv.day : 'no starvation'})`);
  console.log(`    hs path: ${win.map(r => 'd' + r.day + ':' + r.hungryStreak).join(' ')}`);
  console.log(`    pantry path: ${win.map(r => 'd' + r.day + ':' + r.pantryKcal).join(' ')}`);
  console.log(`    contests in window: ${JSON.stringify(contests)} | arrivals: ${JSON.stringify(arrivals)} | tierUps: ${JSON.stringify(tiers)} | forage tele: ${forage}`);
  console.log(`    verdict: ${(!starv || broke) ? 'INTERVENED' : 'UNINTERVENED (streak ran to a starvation death; no food intervention in window)'}`);
}

console.log('== X: counterfactual arm (239 + 20k kcal at dawn d22) ==');
console.log(`  topUp: ${JSON.stringify(arm.topUp)}`);
console.log(`  arm C3: ${arm.c3.verdict} (starvation ${arm.c3.starvationDeaths}, maxCrisisStreak ${arm.c3.maxCrisisStreak}) vs panel C3: ${panel[239].c3.verdict} (starvation ${panel[239].c3.starvationDeaths}, maxCrisisStreak ${panel[239].c3.maxCrisisStreak})`);
console.log(`  arm deaths: ${JSON.stringify(arm.deaths.filter(x => /starvat/.test(String(x.cause || ''))))}`);
console.log(`  arm hs d22+: ${arm.foodLedger.filter(r => r.day >= 22).map(r => 'd' + r.day + ':' + r.hungryStreak).join(' ')}`);
console.log(`  arm end pantry ${arm.guardrails.pantryKcal} alive ${arm.guardrails.popAlive} tier ${arm.guardrails.tier} vs panel pantry ${panel[239].guardrails.pantryKcal} alive ${panel[239].guardrails.popAlive} tier ${panel[239].guardrails.tier}`);

console.log('== T aggregates (panel sums; baseline establishment.json: deaths 41, popAlive 38, pantryKcal 77861, starvation 1) ==');
console.log(`  deaths ${SEEDS.reduce((a, s) => a + panel[s].guardrails.deaths, 0)} | popAlive ${SEEDS.reduce((a, s) => a + panel[s].guardrails.popAlive, 0)} | pantryKcal ${SEEDS.reduce((a, s) => a + panel[s].guardrails.pantryKcal, 0)} | starvation ${SEEDS.reduce((a, s) => a + panel[s].c3.starvationDeaths, 0)}`);
