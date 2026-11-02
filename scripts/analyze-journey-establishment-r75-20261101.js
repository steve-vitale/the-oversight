#!/usr/bin/env node
// Focused cascade comparison for journey-establishment r75 (2026-11-01).
// Reads the two arm JSONs (r75-control / r75-tents subdirs) and prints
// deaths by cause/day, cascade window counts, alive, pantry, reachedDay,
// and the tents arm's relief-log rows, plus the pre-registered verdicts.
// Usage: node scripts/analyze-journey-establishment-r75-20261101.js
'use strict';
const fs = require('fs');
const BASE = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-01';
const ARMS = ['control', 'tents'];
function cascade(deaths) {
  return (deaths || []).filter(d => d.day >= 26 && d.day <= 42 &&
    (/sickness/i.test(d.cause || '') || /wound that wouldn/i.test(d.cause || '')));
}
for (const arm of ARMS) {
  const p = `${BASE}/r75-${arm}/journey-establishment-r75-seed369.json`;
  let d;
  try { d = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`${arm}: MISSING ${p} (${e.message})`); continue; }
  const cas = cascade(d.deaths);
  const sick = cas.filter(x => /sickness/i.test(x.cause || '')).length;
  const wound = cas.length - sick;
  const rel = d.reliefLog || [];
  const answers = rel.filter(r => r.action === 'answer');
  const skips = rel.filter(r => r.action === 'skip-used');
  const spent = answers.reduce((t, r) => t + Math.max(0, (r.pantryBefore || 0) - (r.pantryAfter || 0)), 0);
  console.log(`\n== ${arm} == reachedDay=${d.reachedDay} alive=${d.guardrails && d.guardrails.popAlive} ` +
    `pantry=${d.guardrails && d.guardrails.pantryKcal} deathsTotal=${(d.deaths || []).length}`);
  console.log(`cascade d26-42: ${cas.length} (sickness ${sick}, wounds ${wound})`);
  console.log(`cascade detail: ${cas.map(x => `d${x.day}:${x.who}`).join(', ') || 'none'}`);
  console.log(`relief rows: ${rel.length} (answers=${answers.length} skip-used=${skips.length})`);
  for (const r of rel) {
    console.log(`  relief d${r.day} kind=${r.kind} sinceDay=${r.sinceDay} action=${r.action} result=${r.result || '-'} pantry=${r.pantryBefore}->${r.pantryAfter} sick=${r.sickBefore}->${r.sickAfter} woundedBefore=${r.woundedBefore} hygieneUntil=${r.hygieneUntil}`);
  }
  if (arm === 'tents') console.log(`tents kcal spent (pantry delta sum): ${spent}`);
}
console.log('\n-- prereg verdicts --');
console.log('CONTROL DETERMINISM: cascade within 8-12 and alive within 2-5');
console.log('TENTS GO: cascade <=5 AND alive >=6; PARTIAL: cascade 6-7 or alive 4-5; NO-GO: cascade >=8');
console.log('EXPOSURE: >=1 relief proposal d14-42 AND >=1 tents answer fired; else EXPOSURE FAILURE');
