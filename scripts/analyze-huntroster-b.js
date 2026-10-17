#!/usr/bin/env node
// scripts/analyze-huntroster-b.js — aggregate the sim-huntroster-b census.
// Reads evidence/2026-10-17/perseed-huntroster/wall-*.json (panel schema)
// and prints: occupation histogram + chi-square vs uniform, definition
// comparison (coarse vs engine vs substrate), the plus20 dead-code check,
// joiner effects (day0 vs day90), wall numbers, death causes, and a beat
// sample for the fiction check.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntroster');
const files = fs.readdirSync(DIR).filter(f => f.startsWith('wall-') && f.endsWith('.json')).sort();
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log(`seeds: ${rows.length} (${files.join(', ')})`);

const DEFKEYS = ['coarse14', 'coarse12', 'engine14', 'engine12', 'plus20', 'substrateSkill', 'knowledgeHunt'];
const tot = {}, perSeed = [];
let nRoster = 0;
const hist = {};
for (const r of rows) {
  const d = (r.rosterCensus && r.rosterCensus.day0defs) || {};
  nRoster += 12; // day-0 roster is always 12 by construction
  const ps = {};
  for (const k of DEFKEYS) { tot[k] = (tot[k] || 0) + (d[k] || 0); ps[k] = d[k] || 0; }
  perSeed.push(`${r.policy}-${r.seed}: ` + DEFKEYS.map(k => `${k}=${d[k] || 0}`).join(' '));
  for (const [k, n] of Object.entries((r.rosterCensus && r.rosterCensus.day0occHist) || {})) hist[k] = (hist[k] || 0) + n;
}

console.log('\n=== per-seed day-0 definitions ===');
for (const s of perSeed) console.log('  ' + s);
console.log(`\n=== definition totals (${rows.length} runs) ===`);
for (const k of DEFKEYS) console.log(`  ${k}: ${tot[k]} = ${(tot[k] / rows.length).toFixed(3)}/seed`);

// chi-square vs uniform over the 55-occupation table (genCharacter half only
// is uniform; background draws are a second uniform — combined expectation
// is reported qualitatively; the test here is against flat 1/55 per person
// as a rough uniformity smell-check on the genCharacter channel).
const OCCN = 55;
const total = Object.values(hist).reduce((a, b) => a + b, 0);
const exp = total / OCCN;
let chi2 = 0, zeros = 0;
for (const k of Object.keys(hist)) { chi2 += Math.pow(hist[k] - exp, 2) / exp; }
zeros = OCCN - Object.keys(hist).length;
console.log(`\n=== occupation histogram: ${Object.keys(hist).length}/${OCCN} occupations seen, ${total} people ===`);
const sorted = Object.entries(hist).sort((a, b) => b[1] - a[1]);
console.log('top 12: ' + sorted.slice(0, 12).map(([k, n]) => `${k}(${n})`).join(', '));
console.log(`chi2 vs uniform(1/${OCCN}) = ${chi2.toFixed(1)} (df~${OCCN - 1}); unseen occupations: ${zeros}`);

// which occupations actually carried the substrate?
console.log('\n=== hunter-substrate occupations seen (counts) ===');
const HUNTY = ['hunting_guide', 'fishing_guide', 'rancher', 'exterminator', 'trail_crew', 'forager', 'pilot', 'soldier', 'farmer', 'butcher', 'fisherman', 'veterinarian', 'mortician', 'dentist'];
for (const k of HUNTY) console.log(`  ${k}: ${hist[k] || 0}`);

// wall
const wall = { national: 0, table: 0, wins: 0, w4: 0, w5: 0 };
const surv = [];
const causes = {};
for (const r of rows) {
  const m = r.metrics || {};
  if (m.national) wall.national++;
  if (m.table) wall.table++;
  if (m.wins) wall.wins++;
  if (m.maxWave >= 4) wall.w4++;
  if (m.maxWave >= 5) wall.w5++;
  if (r.days != null) surv.push(r.days);
  for (const [c, n] of Object.entries(m.deathCauses || {})) causes[c] = (causes[c] || 0) + n;
}
surv.sort((a, b) => a - b);
console.log(`\n=== wall === national=${wall.national}/${rows.length} table=${wall.table}/${rows.length} wins=${wall.wins}/${rows.length} wave4=${wall.w4} wave5=${wall.w5} medianSurvival=${surv.length ? surv[Math.floor(surv.length / 2)] : 'n/a'} (n=${surv.length})`);
console.log('death causes: ' + Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k}(${n})`).join(', '));

// day0 vs day90 (joiner channel)
let d90 = 0, n90 = 0;
for (const r of rows) {
  const d = r.rosterCensus && r.rosterCensus.day90defs;
  if (d) { n90++; d90 += (d.substrateSkill || 0); }
}
console.log(`\nday-90 re-snapshot: ${n90}/${rows.length} runs alive at d90; substrateSkill total ${d90} (day-0 total ${tot.substrateSkill})`);

// beat sample for the fiction check
console.log('\n=== hunt-beat sample (first 25 across runs) ===');
let shown = 0;
for (const r of rows) {
  for (const b of (r.huntBeats || [])) {
    if (shown >= 25) break;
    console.log(`  [d${b.day} ${r.policy}-${r.seed}] ${b.text}`);
    shown++;
  }
  if (shown >= 25) break;
}
if (!shown) console.log('  (no hunt-flavored beats captured)');

// ---- full JSONs: engineComp distribution + hunter-substrate member roll ----
const fullRows = [];
for (const f of fs.readdirSync(DIR).filter(f => /^(lead|belong)feast-\d+\.json$/.test(f)).sort()) {
  try { fullRows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); } catch (e) {}
}
const compDist = {};
const hunters = [];
for (const r of fullRows) {
  for (const m of ((r.census0 || {}).members || [])) {
    const k = String(m.engineComp);
    compDist[k] = (compDist[k] || 0) + 1;
    if (m.substrateSkill || m.c14 || m.c12) {
      hunters.push({ seed: `${r.policy}-${r.seed}`, name: m.name, occ: m.occName, eng: m.engineComp, plus20: m.plus20, skills: (m.granted || []).join(','), snare: m.knowsSnare, kh: m.knowledgeHunt, bs: (m.backstory || '').slice(0, 160) });
    }
  }
}
console.log('\n=== engineComp distribution (all day-0 roster members) ===');
for (const k of Object.keys(compDist).sort()) console.log(`  comp=${k}: ${compDist[k]}`);
console.log(`\n=== hunter-substrate villagers (${hunters.length}) — who they were ===`);
for (const h of hunters.slice(0, 40)) {
  console.log(`  [${h.seed}] ${h.name} (${h.occ}) eng=${h.eng} plus20=${h.plus20} skills=[${h.skills}] snare=${h.snare} knowHunt=${h.kh}`);
}
if (hunters.length > 40) console.log(`  ... and ${hunters.length - 40} more`);
console.log('\n=== hunter backstory samples ===');
const seen = new Set();
for (const h of hunters) {
  if (seen.has(h.occ) || seen.size >= 6) continue;
  seen.add(h.occ);
  console.log(`  [${h.occ}] ${h.bs}...`);
}
