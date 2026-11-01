#!/usr/bin/env node
// Focused cascade comparison for journey-establishment r74 (2026-11-01).
// Reads the three arm JSONs (r74-control / r74-care / r74-capacity subdirs)
// and prints deaths by cause/day, cascade window counts, alive, pantry,
// and care-round counts, plus the pre-registered verdicts.
// Usage: node scripts/analyze-journey-establishment-r74-20261101.js
'use strict';
const fs = require('fs');
const BASE = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-01';
const ARMS = ['control', 'care', 'capacity'];
function cascade(deaths) {
  return (deaths || []).filter(d => d.day >= 26 && d.day <= 42 &&
    (/sickness/i.test(d.cause || '') || /wound that wouldn/i.test(d.cause || '')));
}
for (const arm of ARMS) {
  const p = `${BASE}/r74-${arm}/journey-establishment-r74-seed369.json`;
  let d;
  try { d = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`${arm}: MISSING ${p} (${e.message})`); continue; }
  const cas = cascade(d.deaths);
  const sick = cas.filter(x => /sickness/i.test(x.cause || '')).length;
  const wound = cas.length - sick;
  const care = d.careLog || [];
  const treats = care.filter(r => r.kind === 'treat').length;
  const tends = care.filter(r => r.kind === 'tend').length;
  const days = care.filter(r => r.kind === 'day-summary');
  console.log(`\n== ${arm} == reachedDay=${d.reachedDay} alive=${d.guardrails && d.guardrails.popAlive} ` +
    `pantry=${d.guardrails && d.guardrails.pantryKcal} deathsTotal=${(d.deaths || []).length}`);
  console.log(`cascade d26-42: ${cas.length} (sickness ${sick}, wounds ${wound})`);
  console.log(`cascade detail: ${cas.map(x => `d${x.day}:${x.who}`).join(', ') || 'none'}`);
  console.log(`care rounds: ${days.length} days, treats=${treats} tends=${tends} grant=${JSON.stringify(d.capacityGranted)}`);
  const byDay = {};
  for (const r of days) byDay[r.day] = `t${r.treated}/t${r.tended}`;
  console.log(`care by day: ${Object.entries(byDay).map(([k, v]) => `d${k}:${v}`).join(' ') || 'none'}`);
}
console.log('\n-- prereg verdicts --');
console.log('CONTROL: cascade within 8-12 and alive within 2-5 = determinism holds');
console.log('CAPACITY GO: cascade <=5 AND alive >=6; NO-GO: cascade >=8');
