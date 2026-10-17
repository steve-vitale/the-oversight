#!/usr/bin/env node
// analyze-compoundidx-20261017.js — read-only analysis of the compoundidx
// census corpus (evidence/2026-10-17/perseed-compoundidx/). Prints the
// PRIMARY verdict, per-part prevalence, policy splits, splinter correlation,
// death-cause shares, and survival distribution. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-compoundidx');
const files = fs.readdirSync(DIR).filter(f => /^compound-(lead|belong)feast-s\d+\.json$/.test(f));
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const lost = recs.filter(r => r.endReason === 'village-lost');
const med = (xs) => { if (!xs.length) return 0; const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

console.log(`corpus: ${recs.length} runs, village-lost ${lost.length}`);
const comp = lost.filter(r => r.classification.compound);
console.log(`PRIMARY: ${comp.length}/${lost.length} village-lost runs compound (>=3 parts) = ` +
  `${lost.length ? (comp.length / lost.length).toFixed(3) : 'n/a'} — ` +
  `${lost.length >= 16 && comp.length / lost.length >= 0.5 ? 'DIAGNOSTIC-GO' : 'DIAGNOSTIC-MISS'}`);

console.log('\nper-part prevalence (village-lost runs):');
for (const k of ['forage', 'raid', 'tribute', 'meatgrinder', 'spiral']) {
  const on = lost.filter(r => r.classification.parts[k]).length;
  console.log(`  ${k}: ${on}/${lost.length}`);
}
console.log('\nby policy (village-lost):');
for (const p of ['leadfeast', 'belongfeast']) {
  const rs = lost.filter(r => r.policyId === p);
  const c = rs.filter(r => r.classification.compound).length;
  console.log(`  ${p}: n=${rs.length} compound=${c} medianSurv=${med(rs.map(r => r.gameDays)).toFixed(0)}d`);
}
console.log('\ncompound rate by hostile-splinter bucket (village-lost):');
for (const [lo, hi, label] of [[0, 0, '0'], [1, 2, '1-2'], [3, 99, '3+']]) {
  const rs = lost.filter(r => r.hostileSplinterEver >= lo && r.hostileSplinterEver <= hi);
  const c = rs.filter(r => r.classification.compound).length;
  console.log(`  splinters ${label}: n=${rs.length} compound=${c}`);
}
console.log('\nmedian signals (village-lost):');
console.log(`  raidKcal=${med(lost.map(r => r.raidKcal)).toFixed(0)} ` +
  `griefGrabs=${med(lost.map(r => r.griefGrabs)).toFixed(0)} ` +
  `tributeMaxTerms=${med(lost.map(r => r.tributeMaxTerms)).toFixed(0)} ` +
  `pantryPeak=${med(lost.map(r => r.pantryPeak)).toFixed(0)} ` +
  `survival=${med(lost.map(r => r.gameDays)).toFixed(0)}d`);
console.log('\ndeath-cause shares (village-lost runs, villager deaths only):');
const tally = {};
for (const r of lost) for (const d of (r.deathLog || [])) {
  if (d.kind !== 'person' && d.kind !== 'villager') continue;
  const k = String(d.cause || '?');
  tally[k] = (tally[k] || 0) + 1;
}
const tot = Object.values(tally).reduce((a, b) => a + b, 0);
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k}: ${v} (${(100 * v / tot).toFixed(1)}%)`);
console.log(`  total villager deaths: ${tot}`);
