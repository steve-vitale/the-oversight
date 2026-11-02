#!/usr/bin/env node
// Tents-band comparison for journey-establishment r76 (2026-11-02).
// Reads r76 tents per-seed JSONs (2026-11-02) and the banked controls:
// r73 control seeds 370-372 (2026-11-01) and r75 control/tents seed 369
// (2026-11-01/r75-tents). Prints disease deaths in-window (d14-42,
// sickness + "a wound that wouldn't close"), alive, pantry, tier,
// relief answers/refusals, and the pre-registered per-seed verdicts.
// Usage: node scripts/analyze-journey-establishment-r76-20261102.js
'use strict';
const fs = require('fs');
const H = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence';
const disease = d => /sickness/i.test(d.cause || '') || /wound that wouldn/i.test(d.cause || '');
function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
function summ(d) {
  if (!d) return null;
  const deaths = d.deaths || [];
  const dis = deaths.filter(x => x.day >= 14 && x.day <= 42 && disease(x));
  const rel = d.reliefLog || [];
  const ans = rel.filter(r => r.action === 'answer');
  const spent = ans.reduce((t, r) => t + Math.max(0, (r.pantryBefore || 0) - (r.pantryAfter || 0)), 0);
  const shorts = ans.filter(r => /short/i.test(String(r.result || '')));
  return { reached: d.reachedDay, alive: d.guardrails && d.guardrails.popAlive,
    pantry: d.guardrails && d.guardrails.pantryKcal, tier: d.guardrails && d.guardrails.tier,
    deathsTotal: deaths.length, disease: dis.length,
    diseaseDetail: dis.map(x => `d${x.day}:${x.who}`).join(', ') || 'none',
    answers: ans.length, skips: rel.filter(r => r.action === 'skip-used').length,
    spent, perAnswer: ans.map(r => (r.pantryBefore || 0) - (r.pantryAfter || 0)).join(','),
    shorts: shorts.length, kinds: ans.map(r => `${r.kind}@d${r.day}`).join(',') || 'none' };
}
const controls = {
  369: load(`${H}/2026-11-01/r75-control/journey-establishment-r75-seed369.json`),
  370: load(`${H}/2026-11-01/journey-establishment-r73-seed370.json`),
  371: load(`${H}/2026-11-01/journey-establishment-r73-seed371.json`),
  372: load(`${H}/2026-11-01/journey-establishment-r73-seed372.json`),
};
const tents369old = load(`${H}/2026-11-01/r75-tents/journey-establishment-r75-seed369.json`);
for (const seed of [369, 370, 371, 372]) {
  const c = summ(controls[seed]);
  const t = summ(load(`${H}/2026-11-02/journey-establishment-r76-seed${seed}.json`));
  console.log(`\n== seed ${seed} ==`);
  console.log(`control: ${c ? JSON.stringify(c) : 'MISSING'}`);
  console.log(`tents76: ${t ? JSON.stringify(t) : 'MISSING'}`);
  if (c && t) {
    const bar = seed === 369 ? (t.disease <= 5 && t.alive >= 6) : (t.disease <= c.disease && t.alive >= c.alive - 1);
    console.log(`verdict: ${bar ? 'GO' : 'NO-GO'} (disease ${c.disease}->${t.disease}, alive ${c.alive}->${t.alive})`);
  }
}
console.log(`\n369 r75-tents (replication reference): ${JSON.stringify(summ(tents369old))}`);
