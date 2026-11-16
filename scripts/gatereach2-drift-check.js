// gatereach2-drift-check.js — drift smoke for sim-gatereach2-b A/B:
// did control (seed call absent) and instrument (seed call on)
// trajectories diverge BEFORE the seed call could act?
// The seed call's earliest possible effect is the first
// winPlanSeedFromFight on a wave-4+ flee (first wave-4+ w5seeds row
// in the instrument leg). Before that day, identical seeds +
// identical policy + identical substrate must give identical daily
// snapshots. A divergence on an earlier day proves substrate (tip)
// drift, not a seed-call effect.
// NOTE (prereg Correction C1): the verbatim vetparty drift script
// reads `daily` (T-class fingerprints) and `v4seeds`, which the
// gatereach substrate does not carry — run verbatim it reads zero
// days and reports a vacuous IDENTICAL. This script implements the
// SAME verdict logic over the series fingerprint (standing, faced
// counts per wave, vets, readiness flags, population, pantry, wave
// kills) with first-lever-day = first wave-4+ w5seeds day.
// Fingerprint per series row: stRaw, war, dip, plenty, w1–w5 faced,
// vet4, vet5, rd4ready, rd5ready, pop, pantry, wave kills.
// Usage: node scripts/gatereach2-drift-check.js <controlDir> <onDir>
'use strict';
const fs = require('fs');
const path = require('path');

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function fp(row) {
  return JSON.stringify({
    st: row.stRaw, war: row.war, dip: row.dip, plenty: row.plenty,
    w1: row.w1, w2: row.w2, w3: row.w3, w4: row.w4, w5: row.w5,
    vet4: row.vet4, vet5: row.vet5,
    r4: row.rd4ready, r5: row.rd5ready,
    pop: row.pop, pantry: row.pantry,
    wk: row.wk || {},
  });
}
function firstSeedDay(j) {
  const rows = (j.w5seeds || []).filter(function (s) { return ((s.wave | 0) >= 4); });
  if (!rows.length) return null;
  return Math.min.apply(null, rows.map(function (s) { return s.day; }));
}
const control = loadDir(process.argv[2]);
const armed = loadDir(process.argv[3]);
let drift = 0;
for (const seed of Object.keys(control).sort()) {
  const c = control[seed], a = armed[seed];
  if (!a) { console.log(seed + ': armed file missing'); continue; }
  const firstLeverDay = firstSeedDay(a);
  const days = Math.min((c.series || []).length, (a.series || []).length);
  let firstDiv = null;
  for (let i = 0; i < days; i++) {
    if (fp(c.series[i]) !== fp(a.series[i])) { firstDiv = c.series[i].d; break; }
  }
  const verdict = firstDiv == null ? 'IDENTICAL' :
    (firstLeverDay != null && firstDiv >= firstLeverDay ? 'CLEAN (diverges day ' + firstDiv + ', lever first acted day ' + firstLeverDay + ')' :
    'DRIFT (diverges day ' + firstDiv + ', lever first acted day ' + firstLeverDay + ')');
  if (firstDiv != null && (firstLeverDay == null || firstDiv < firstLeverDay)) drift++;
  console.log(seed + ': firstLeverDay=' + firstLeverDay + ' firstDivDay=' + firstDiv + ' -> ' + verdict);
}
console.log(drift ? 'DRIFT SEEDS: ' + drift : 'NO PRE-LEVER DRIFT');
process.exit(drift ? 1 : 0);

module.exports = { loadDir: loadDir, fp: fp, firstSeedDay: firstSeedDay };
