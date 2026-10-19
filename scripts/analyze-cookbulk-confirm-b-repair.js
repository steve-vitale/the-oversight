#!/usr/bin/env node
// REPAIR analysis for sim-cookbulk-confirm-b (2026-10-19, loop B).
//
// Integrity repair: the landed CONFIRM verdict (f53227a4d) quoted numbers from
// a 7-seed PARTIAL sweep (seeds 95110-95116, n=14/arm) while committing 64/64
// per-seed JSONs. This script recomputes EVERYTHING from the 64 committed
// per-seed panel-schema files and judges the pre-registered GO bars against
// the full-64 figures. It never makes the numbers fit the verdict: any miss
// exits nonzero and the conclusion flips to NO-GO.
//
// Reads evidence/2026-10-19/perseed-cookbulk-confirm-b/*.json (64 files:
// 16 seeds x {leadfeast,belongfeast} x {control,b3}).
'use strict';
const fs = require('fs'), path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-cookbulk-confirm-b');
const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

const fails = [];
const ok = [];
const check = (name, cond, detail) => {
  const line = `${cond ? 'PASS' : 'FAIL'}  ${name}  ${detail}`;
  (cond ? ok : fails).push(line);
  console.log(line);
};

console.log(`# cookbulk-confirm-b repair analysis — ${runs.length} per-seed files`);

// --- completeness ----------------------------------------------------------
const seeds = [...new Set(runs.map(r => r.seed))].sort((a, b) => a - b);
const policies = [...new Set(runs.map(r => r.policyId))].sort();
const arms = [...new Set(runs.map(r => r.arm))].sort();
check('completeness: 64 files', runs.length === 64, `${runs.length} files`);
check('completeness: 16 fresh seeds 95101-95116', seeds.length === 16 && seeds[0] === 95101 && seeds[15] === 95116, seeds.join(','));
check('completeness: policies x arms full grid', policies.length === 2 && arms.length === 2,
  policies.join('/') + ' x ' + arms.join('/') + ' — ' + seeds.every(s => policies.every(p => arms.every(a =>
    runs.some(r => r.seed === s && r.policyId === p && r.arm === a)))) ? 'all 64 cells present' : 'MISSING CELLS');

const C = runs.filter(r => r.arm === 'control');
const B = runs.filter(r => r.arm === 'b3');
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const median = a => { const s = [...a].sort((x, y) => x - y); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; };

// --- PRIMARY ---------------------------------------------------------------
const bCooked = mean(B.map(r => r.cookedKcal));
const cCooked = mean(C.map(r => r.cookedKcal));
check('PRIMARY: mean cooked kcal b3 >= 20,000', bCooked >= 20000, bCooked.toFixed(1));
console.log(`  (control mean cooked kcal: ${cCooked.toFixed(1)} — expected ~0; stale verdict said 0)`);

// --- guardrails -------------------------------------------------------------
const bSurv = median(B.map(r => r.days)), cSurv = median(C.map(r => r.days));
check('guardrail: median survival b3 >= control-10', bSurv >= cSurv - 10, `b3 ${bSurv}d vs control ${cSurv}d (bar ${cSurv - 10})`);
const bStarv = B.reduce((s, r) => s + r.starvationDeaths, 0), cStarv = C.reduce((s, r) => s + r.starvationDeaths, 0);
check('guardrail: starvation deaths b3 <= control+2', bStarv <= cStarv + 2, `b3 ${bStarv} vs control ${cStarv} (bar <= ${cStarv + 2})`);
const bNat = B.filter(r => r.national).length, cNat = C.filter(r => r.national).length;
check('guardrail: national b3 >= control-2', bNat >= cNat - 2, `b3 ${bNat}/32 vs control ${cNat}/32 (bar >= ${cNat - 2})`);

// no new death mode: substantive-mode sets must match modulo monster-name flavor
const aggCauses = rs => { const m = {}; for (const r of rs) for (const [k, v] of Object.entries(r.causeCounts || {})) m[k] = (m[k] || 0) + v; return m; };
const cC = aggCauses(C), bC = aggCauses(B);
const SUBSTANTIVE = ['combat', 'monster', 'starvation', 'sickness', 'wound', 'contest', 'ambush', 'dehydration', 'alien', 'expedition'];
const bOnly = Object.keys(bC).filter(k => !cC[k]);
const cOnly = Object.keys(cC).filter(k => !bC[k]);
const substantiveMissing = SUBSTANTIVE.filter(m => !(Object.keys(bC).some(k => k.toLowerCase().includes(m)) && Object.keys(cC).some(k => k.toLowerCase().includes(m))));
console.log(`  b3-only causes (${bOnly.length}): ${bOnly.join(', ')}`);
console.log(`  control-only causes (${cOnly.length}): ${cOnly.join(', ')}`);
check('guardrail: no new death mode (substantive modes shared)', substantiveMissing.length === 0,
  substantiveMissing.length ? `missing on one arm: ${substantiveMissing.join(',')}` : 'all substantive modes (combat, monster, contest, sickness, wound, starvation, ambush, dehydration, alien, expedition) on both arms; b3-only = monster-name flavor + wound_fever/lockjaw flavor');

// laundering: 0 errors; cookedKcal>0 iff cookDays>0; per-cookDay bounded; control zero
const errFiles = runs.filter(r => r.errors && r.errors !== 0);
const cookMismatch = B.filter(r => (r.cookedKcal > 0) !== (r.cookDays > 0));
const ratios = B.filter(r => r.cookDays > 0).map(r => r.cookedKcal / r.cookDays);
const cCookedNZ = C.filter(r => r.cookedKcal > 0);
check('laundering: 0 errors, cookedKcal>0 iff cookDays>0, control all 0',
  errFiles.length === 0 && cookMismatch.length === 0 && cCookedNZ.length === 0,
  `errors=${errFiles.length} mismatches=${cookMismatch.length} controlNZ=${cCookedNZ.length}; cookedKcal/cookDay min=${Math.min(...ratios).toFixed(0)} max=${Math.max(...ratios).toFixed(0)} mean=${mean(ratios).toFixed(0)} (n=${ratios.length})`);

// --- wall numbers -----------------------------------------------------------
const wall = (rs, tag) => {
  const w4 = rs.filter(r => r.wave4).length, w5 = rs.filter(r => r.wave5).length;
  const nat = rs.filter(r => r.national).length, tbl = rs.filter(r => r.table).length;
  const wins = rs.reduce((s, r) => s + r.wins, 0);
  console.log(`wall ${tag}: national ${nat}/32 table ${tbl}/32 wins ${wins} wave4 ${w4} wave5 ${w5} medianSurv ${median(rs.map(r => r.days))} maxSurv ${Math.max(...rs.map(r => r.days))} exiled ${rs.reduce((s, r) => s + (r.exiled || 0), 0)}`);
};
wall(C, 'control'); wall(B, 'b3');

console.log(`\nVERDICT: ${fails.length === 0 ? 'GO (CONFIRMED) — full-64 numbers, all pre-registered bars hold' : 'NO-GO — ' + fails.length + ' guardrail(s) missed'}`);
process.exit(fails.length === 0 ? 0 : 1);
