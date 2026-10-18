#!/usr/bin/env node
// vetwindow-analyze-20261018.js — aggregate the 16 per-seed vetwindow JSONs
// into the diagnostic verdict. READ-ONLY (reads evidence, prints to stdout).
// Usage: node scripts/vetwindow-analyze-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-vetwindow');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('ANALYZE STOP: no per-seed JSONs.'); process.exit(2); }
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
console.log(`runs: ${runs.length}`);

const median = (xs) => {
  const s = xs.filter(x => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// --- 1. veteran deaths by channel (overall + in-window) ----------------------
const chAll = {}, chWin = {};
let vetDeaths = 0, vetDeathsWin = 0, unattrib = 0, phantoms = 0, unmappedOther = 0;
const otherCauses = {};
for (const r of runs) {
  unattrib += r.unattributedCount | 0;
  phantoms += r.phantomCount | 0;
  for (const d of (r.veteranDeaths || [])) {
    vetDeaths++;
    chAll[d.channel] = (chAll[d.channel] || 0) + 1;
    if (d.inWindow) { vetDeathsWin++; chWin[d.channel] = (chWin[d.channel] || 0) + 1; }
    if (d.channel === 'other') {
      unmappedOther++;
      otherCauses[d.cause] = (otherCauses[d.cause] || 0) + 1;
    }
  }
}
console.log('\n== veteran deaths by channel (all) ==');
for (const [c, n] of Object.entries(chAll).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);
console.log('== veteran deaths by channel (IN-WINDOW only) ==');
for (const [c, n] of Object.entries(chWin).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);
console.log(`veteran deaths total=${vetDeaths} inWindow=${vetDeathsWin} unattributed=${unattrib} phantoms=${phantoms}`);
console.log(`'other' veteran deaths=${unmappedOther} causes=${JSON.stringify(otherCauses)}`);

// --- 2. release-window distribution ------------------------------------------
const firstSats = runs.map(r => r.firstVetLegDay).filter(x => x != null);
const winLens = runs.map(r => r.windowDayCount | 0);
const legStats = {};
for (const r of runs) {
  const st = (r.vetLeg && r.vetLeg.status) || '?';
  legStats[st] = (legStats[st] || 0) + 1;
}
console.log('\n== release-window distribution ==');
console.log(`  first-satisfaction day: median=${median(firstSats)} (n=${firstSats.length}/16 satisfied; never=${16 - firstSats.length})`);
console.log(`  window length (days): median=${median(winLens)} range=[${Math.min(...winLens)},${Math.max(...winLens)}]`);
console.log(`  leg durability: ${JSON.stringify(legStats)}`);

// --- 3. binding labels ---------------------------------------------------------
const bindings = {};
for (const r of runs) bindings[r.binding] = (bindings[r.binding] || 0) + 1;
console.log('\n== w4 binding labels (deferral-day method) ==');
for (const [b, n] of Object.entries(bindings).sort((a, b) => b[1] - a[1])) console.log(`  ${b}: ${n}`);

// --- 4. wall numbers -------------------------------------------------------------
const w = (f) => runs.filter(f).length;
console.log('\n== wall numbers (winseat, new bar) ==');
console.log(`  national=${w(r => r.national)} table=${w(r => r.table)} wave4=${w(r => r.maxWave >= 4)} wave5=${w(r => r.maxWave >= 5)} wins=${w(r => r.won)}`);
console.log(`  median survival=${median(runs.map(r => r.gameDays))}d max=${Math.max(...runs.map(r => r.gameDays))}d`);

// --- 5. GO/NO-GO ------------------------------------------------------------------
const windowMetricsComplete = runs.every(r => Array.isArray(r.windowDays) && r.vetLeg && r.firstVetLegDay !== undefined);
const go = unattrib === 0 && windowMetricsComplete;
console.log(`\n== DIAGNOSTIC ${go ? 'GO' : 'NO-GO'} ==`);
console.log(`  unattributed veteran-death rows=${unattrib} (need 0)`);
console.log(`  window metrics complete on all 16 runs=${windowMetricsComplete}`);
if (!go) console.log('  A miss is NO-GO, never re-scored (§14).');
