#!/usr/bin/env node
// analyze-feastdisc-confirm-20261022.js — paired before/after analysis for
// the sim-feastdiscipline CONFIRM. Reads
// evidence/2026-10-22/perseed-feastdisc-confirm/*.json and prints the
// pre-registered primary (damage-majority villager wave-4 kills), the
// secondaries, the guardrails, and the wall numbers.
//
// Judging is manual per the pre-registration (the env-gated intervention
// makes the automated §15 compare invalid by construction — see the
// evidence file).
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-feastdisc-confirm');
const SEEDS = [66111, 66112, 66113, 66114, 66115, 66116, 66117, 66118, 66119, 66120, 66121, 66122];
const POLICIES = ['lead', 'belong'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    for (const s of SEEDS) {
      const fp = path.join(DIR, `${arm}-${p}-s${s}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const C = load('control'), A = load('feastdisc');
const key = (r) => String(r.policy).replace(/-feastdisc$/, '') + '|' + r.seed;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => ({ a, c: cMap.get(key(a)) }));

// ---- PRIMARY: damage-majority villager wave-4 kills ----
const cDM = C.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
const aDM = A.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
const cDMSeeds = new Set(), aDMSeeds = new Set();
for (const r of C) if ((r.nW4VillagersDmgMaj | 0) >= 1) cDMSeeds.add(r.seed);
for (const r of A) if ((r.nW4VillagersDmgMaj | 0) >= 1) aDMSeeds.add(r.seed);
console.log('== PRIMARY (damage-majority villager wave-4 kills, binding) ==');
console.log(`control: ${cDM} kills on ${cDMSeeds.size}/12 seeds`);
console.log(`armed:   ${aDM} kills on ${aDMSeeds.size}/12 seeds`);
console.log(`GO = armed >= control+2 AND >=3/12 armed seeds -> ${aDM >= cDM + 2 && aDMSeeds.size >= 3 ? 'GO' : 'NO-GO'}`);
for (const r of A.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1)) {
  const rows = (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager);
  console.log(`  armed ${r.policy} s${r.seed}: ` + rows.map(k => `${k.byName} d${k.day} ${k.mid} share=${k.nonScholarShare}`).join('; '));
}
for (const r of C.filter(r => (r.nW4VillagersDmgMaj | 0) >= 1)) {
  const rows = (r.w4killRows || []).filter(k => k.dmgMaj && k.killTimeVillager);
  console.log(`  ctrl  ${r.policy} s${r.seed}: ` + rows.map(k => `${k.byName} d${k.day} ${k.mid} share=${k.nonScholarShare}`).join('; '));
}

// ---- SECONDARIES ----
const cKT = C.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
const aKT = A.reduce((x, r) => x + (r.nW4Villagers | 0), 0);
const cKTS = C.filter(r => (r.nW4Villagers | 0) >= 1).length;
const aKTS = A.filter(r => (r.nW4Villagers | 0) >= 1).length;
const cEng = C.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
const aEng = A.reduce((x, r) => x + (r.w4EngageEvents | 0), 0);
const cEngF = C.reduce((x, r) => x + (r.w4EngageFeasted | 0), 0);
const aEngF = A.reduce((x, r) => x + (r.w4EngageFeasted | 0), 0);
const cStg = C.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
const aStg = A.reduce((x, r) => x + (((r.fdTele || {}).feastsStaged) | 0), 0);
const cFst = C.reduce((x, r) => x + (r.nFeasts | 0), 0);
const aFst = A.reduce((x, r) => x + (r.nFeasts | 0), 0);
console.log('\n== SECONDARY ==');
console.log(`kill-time villager w4 kills: control ${cKT} (${cKTS}/24 configs) vs armed ${aKT} (${aKTS}/24)`);
console.log(`feasted-engagement rate: control ${cEngF}/${cEng} (${(100 * cEngF / Math.max(1, cEng)).toFixed(1)}%) vs armed ${aEngF}/${aEng} (${(100 * aEngF / Math.max(1, aEng)).toFixed(1)}%)`);
console.log(`layer-staged feasts: control ${cStg} vs armed ${aStg} (tele.feastsStaged; control should be 0)`);
console.log(`total feasts: control ${cFst} vs armed ${aFst}`);
console.log(`mean non-scholar damage share on armed kill-time villager kills: ` +
  (() => {
    const rows = A.flatMap(r => (r.w4killRows || []).filter(k => k.killTimeVillager));
    return rows.length ? (rows.reduce((x, k) => x + k.nonScholarShare, 0) / rows.length).toFixed(2) + ` (n=${rows.length})` : 'n/a (0 kills)';
  })());

// ---- GUARDRAILS ----
const survDiffs = pairs.map(p => (p.a.days | 0) - (p.c.days | 0));
const cStarv = C.reduce((x, r) => x + (r.starvationDeaths | 0), 0);
const aStarv = A.reduce((x, r) => x + (r.starvationDeaths | 0), 0);
const cCauses = {}, aCauses = {};
for (const r of C) for (const [k, v] of Object.entries(r.deathCauses || {})) cCauses[k] = (cCauses[k] | 0) + v;
for (const r of A) for (const [k, v] of Object.entries(r.deathCauses || {})) aCauses[k] = (aCauses[k] | 0) + v;
const allCauses = new Set([...Object.keys(cCauses), ...Object.keys(aCauses)]);
const newModes = [...allCauses].filter(k => (aCauses[k] | 0) >= 2 && !(cCauses[k] | 0));
console.log('\n== GUARDRAILS ==');
console.log(`median survival: control ${median(C.map(r => r.days | 0)).toFixed(1)}d vs armed ${median(A.map(r => r.days | 0)).toFixed(1)}d; paired median diff ${median(survDiffs).toFixed(1)}d (bar: >= -10)`);
console.log(`survival paired diffs range: ${Math.min(...survDiffs)}..${Math.max(...survDiffs)}`);
console.log(`starvation deaths: control ${cStarv} vs armed ${aStarv} (bar: <= control+3)`);
console.log(`new death modes (>=2-event rule): ${newModes.length ? newModes.join(', ') : 'none'}`);
console.log('top death causes both arms:');
for (const [lbl, m] of [['control', cCauses], ['armed', aCauses]]) {
  const top = Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}=${v}`).join(', ');
  console.log(`  ${lbl}: ${top}`);
}

// ---- WALL NUMBERS ----
console.log('\n== WALL (scale-onramp) ==');
for (const [lbl, rows] of [['control', C], ['armed', A]]) {
  const sum = (k) => rows.reduce((x, r) => x + (r[k] | 0), 0);
  console.log(`${lbl}: national ${sum('national')}/24, table ${sum('table')}/24, won ${sum('won')}/24, ` +
    `wave4 ${sum('wave4')}/24, wave5 ${sum('wave5')}/24, median ${median(rows.map(r => r.days | 0)).toFixed(1)}d, max ${Math.max(...rows.map(r => r.days | 0))}d`);
}
// wave 1-3 reach (proxy: maxWave distribution)
for (const [lbl, rows] of [['control', C], ['armed', A]]) {
  const dist = {};
  for (const r of rows) dist[r.maxWave | 0] = (dist[r.maxWave | 0] | 0) + 1;
  console.log(`${lbl} maxWave distribution: ` + Object.entries(dist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `w${k}=${v}`).join(' '));
}
