#!/usr/bin/env node
// analyze-fieldports-20261016.js — aggregate the sim-fieldports pilot sweep.
// Usage: node scripts/analyze-fieldports-20261016.js
// Reads evidence/2026-10-16/perseed-fieldports/*-{treatment,control}.json.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldports');

function load(arm) {
  return fs.readdirSync(DIR)
    .filter(f => f.endsWith(`-${arm}.json`))
    .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
const sum = (a, k) => a.reduce((x, r) => x + (r[k] | 0), 0);
const mean = (a, k) => a.length ? (a.reduce((x, r) => x + (r[k] | 0), 0) / a.length) : 0;
const median = (a, k) => {
  const s = a.map(r => r[k] | 0).sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const max = (a, k) => a.length ? Math.max(...a.map(r => r[k] | 0)) : 0;

for (const arm of ['treatment', 'control']) {
  const rows = load(arm);
  if (!rows.length) { console.log(`${arm}: NO ROWS`); continue; }
  const firings = { herald: 0, finale_crew: 0, finale_opening: 0 };
  const P = { heraldOmenLands: 0, heraldOmenDodged: 0, crewStall: 0, crewClimb: 0, crewSweeps: 0, openingDeclared: 0, openingCardFalls: 0 };
  const deathCauses = {};
  for (const r of rows) {
    for (const k of Object.keys(firings)) firings[k] += (r.portFirings || {})[k] | 0;
    for (const k of Object.keys(P)) P[k] += (r.portPunishments || {})[k] | 0;
    for (const [c, n] of Object.entries(r.deathCauses || {})) deathCauses[c] = (deathCauses[c] || 0) + n;
  }
  const punishRes = sum(rows, 'punishResolutions');
  console.log(`\n===== ${arm.toUpperCase()} (n=${rows.length}) =====`);
  console.log(`port firings: herald=${firings.herald} finale_crew=${firings.finale_crew} finale_opening=${firings.finale_opening} total=${firings.herald + firings.finale_crew + firings.finale_opening}`);
  console.log(`punishments: omenLands=${P.heraldOmenLands} omenDodged=${P.heraldOmenDodged} crewStall=${P.crewStall} crewClimb=${P.crewClimb} crewSweeps=${P.crewSweeps} openingDeclared=${P.openingDeclared} cardFalls=${P.openingCardFalls} totalPunishRes=${punishRes}`);
  console.log(`national=${sum(rows, 'national')}/${rows.length} table=${sum(rows, 'table')}/${rows.length} won=${sum(rows, 'won')}/${rows.length}`);
  console.log(`wave4=${sum(rows, 'wave4Reached')}/${rows.length} wave5=${sum(rows, 'wave5Reached')}/${rows.length}`);
  console.log(`medianDays=${median(rows, 'days')} maxDays=${max(rows, 'days')}`);
  console.log(`deaths=${sum(rows, 'deaths')} fieldDeaths=${sum(rows, 'fieldDeaths')} playerDeaths=${sum(rows, 'playerDeaths')}`);
  console.log(`trickExecutions=${sum(rows, 'trickExecutions')} meanVillagerTricksKnown=${mean(rows, 'villagerTricksKnown').toFixed(2)}`);
  const top = Object.entries(deathCauses).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log('death causes: ' + top.map(([c, n]) => `${c} x${n}`).join(' | '));
}

// PRIMARY verdict (binding): GO iff firings > 0 for each of the 3 newly-ported
// species on treatment AND >=2 honest punishments/trick-resolutions observed.
const T = load('treatment');
const firingsT = { herald: 0, finale_crew: 0, finale_opening: 0 };
for (const r of T) for (const k of Object.keys(firingsT)) firingsT[k] += (r.portFirings || {})[k] | 0;
const punishT = sum(T, 'punishResolutions');
console.log('\n===== PRIMARY =====');
console.log(`firings: herald=${firingsT.herald} finale_crew=${firingsT.finale_crew} finale_opening=${firingsT.finale_opening}`);
console.log(`punishResolutions=${punishT} (need >=2)`);
const goA = firingsT.herald > 0 && firingsT.finale_crew > 0 && firingsT.finale_opening > 0;
const goB = punishT >= 2;
console.log(`PRIMARY: ${goA && goB ? 'GO' : 'NO-GO'} (firings-each>0: ${goA}, punish>=2: ${goB})`);
// GUARDRAILS: national >= control-2, median >= control-10d, no new death mode.
const C = load('control');
const natT = sum(T, 'national'), natC = sum(C, 'national');
const medT = median(T, 'days'), medC = median(C, 'days');
const cCauses = new Set();
for (const r of C) for (const c of Object.keys(r.deathCauses || {})) cCauses.add(c);
const newModes = new Set();
for (const r of T) for (const c of Object.keys(r.deathCauses || {})) if (!cCauses.has(c)) newModes.add(c);
console.log(`GUARDRAILS: national ${natT} >= ${natC - 2}: ${natT >= natC - 2 ? 'GO' : 'MISS'} | median ${medT} >= ${medC - 10}: ${medT >= medC - 10 ? 'GO' : 'MISS'} | new death modes: ${newModes.size ? [...newModes].join(', ') : 'none'}`);
