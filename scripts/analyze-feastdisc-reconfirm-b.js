#!/usr/bin/env node
// analyze-feastdisc-reconfirm-b.js — paired before/after analysis for the
// sim-feastdisc-confirm INDEPENDENT RE-CONFIRM (16 fresh seeds, 64 paired
// configs, 180d death-aware). Seed-agnostic: discovers seeds from the
// perseed corpus filenames (keeps seed tokens out of script content for
// the C1 freshness gate).
//
// Prints the pre-registered primary (damage-majority villager wave-4
// kills), secondaries, guardrails, and wall numbers. Judging is manual
// per the pre-registration (the env-gated intervention makes the
// automated §15 compare invalid by construction).
//
// Usage: node scripts/analyze-feastdisc-reconfirm-b.js [EVID_DIR]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-23', 'perseed-feastdisc-reconfirm-b');
const POLICIES = ['lead', 'belong'];

function discoverSeeds(arm) {
  const seeds = new Set();
  for (const p of POLICIES) {
    for (const f of fs.readdirSync(DIR)) {
      const m = new RegExp('^' + arm + '-' + p + '-s(\\d+)\\.json$').exec(f);
      if (m) seeds.add(parseInt(m[1], 10));
    }
  }
  return [...seeds].sort((a, b) => a - b);
}
function load(arm) {
  const seeds = discoverSeeds(arm);
  if (!seeds.length) { console.error('NO SEEDS for arm ' + arm + ' in ' + DIR); process.exit(2); }
  const rows = [];
  for (const p of POLICIES) {
    for (const s of seeds) {
      const fp = path.join(DIR, `${arm}-${p}-s${s}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return { rows, seeds };
}
function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const { rows: C, seeds: SEEDS } = load('control');
const { rows: A } = load('feastdisc');
const NCFG = C.length;
const key = (r) => String(r.policy).replace(/-feastdisc$/, '') + '|' + r.seed;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => ({ a, c: cMap.get(key(a)) }));
if (pairs.some(p => !p.c)) { console.error('UNPAIRED ROWS'); process.exit(2); }
console.log(`corpus: ${SEEDS.length} seeds [${SEEDS[0]}..${SEEDS[SEEDS.length - 1]}] x 2 policies x 2 arms = ${NCFG * 2} configs`);

// ---- PRIMARY: damage-majority villager wave-4 kills ----
const cDM = C.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
const aDM = A.reduce((x, r) => x + (r.nW4VillagersDmgMaj | 0), 0);
const cDMSeeds = new Set(), aDMSeeds = new Set();
for (const r of C) if ((r.nW4VillagersDmgMaj | 0) >= 1) cDMSeeds.add(r.seed);
for (const r of A) if ((r.nW4VillagersDmgMaj | 0) >= 1) aDMSeeds.add(r.seed);
const SEEDBAR = Math.ceil(SEEDS.length * 0.25);
console.log('== PRIMARY (damage-majority villager wave-4 kills, binding) ==');
console.log(`control: ${cDM} kills on ${cDMSeeds.size}/${SEEDS.length} seeds`);
console.log(`armed:   ${aDM} kills on ${aDMSeeds.size}/${SEEDS.length} seeds`);
console.log(`GO = armed >= control+2 AND >=${SEEDBAR}/${SEEDS.length} armed seeds -> ${aDM >= cDM + 2 && aDMSeeds.size >= SEEDBAR ? 'GO' : 'NO-GO'}`);
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
console.log(`kill-time villager w4 kills: control ${cKT} (${cKTS}/${NCFG} configs) vs armed ${aKT} (${aKTS}/${NCFG})`);
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
  console.log(`${lbl}: national ${sum('national')}/${NCFG}, table ${sum('table')}/${NCFG}, won ${sum('won')}/${NCFG}, ` +
    `wave4 ${sum('wave4')}/${NCFG}, wave5 ${sum('wave5')}/${NCFG}, median ${median(rows.map(r => r.days | 0)).toFixed(1)}d, max ${Math.max(...rows.map(r => r.days | 0))}d`);
}
for (const [lbl, rows] of [['control', C], ['armed', A]]) {
  const dist = {};
  for (const r of rows) dist[r.maxWave | 0] = (dist[r.maxWave | 0] | 0) + 1;
  console.log(`${lbl} maxWave distribution: ` + Object.entries(dist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `w${k}=${v}`).join(' '));
}
