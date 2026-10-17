#!/usr/bin/env node
// scripts/analyze-shellrevive-20261017.js — pilot analysis for arm sim-shellrevive-b.
//
// REVIVAL of sim-shelltask-b with the corrected §14 pre-registration:
//   PRIMARY (both must hold):
//     (a) shelled-kcal converted >= 1k on starvation days across the armed
//         side (mechanism engagement; control never shells);
//     (b) paired pantry-draw displacement >= 0: sum over identical-seed pairs
//         of (control scholarPantryTakes - armed scholarPantryTakes) — the
//         pure-gain exoneration; shelling must not divert village food.
//   GUARDRAILS: starvation deaths armed <= control+2 (NOISE MARGIN, replacing
//     the killed run's literal <= bound); national >= control-2; median
//     survival >= control-10d; no new death mode; det-gate byte-identical
//     gate-off (from the proof test).
//
// §15 note: the official balance-panel driver cannot express this arm
// (policy-side layer, FEASTSCALE_R13 substrate, leadfeast/belongfeast — not
// panel policies; contract lacks exiled/median-survival/starvation/shelled-
// kcal/pantry metrics; fabricating validity gates would be dishonest). This
// script instead: (1) emits light per-seed panel-schema JSONs for the wall
// metrics + arm metrics; (2) runs the scorecard's compareMetric (the panel's
// own paired-interval statistics) on the contract-overlapping metrics;
// (3) judges the pre-registered metrics directly. Deviation noted in the
// evidence's metric review.
'use strict';
const fs = require('fs');
const path = require('path');
const { compareMetric, mean } = require('./lib/balance-scorecard');
const { minimumPairs } = require('./balance-metrics.json');

const DIR = process.env.DIR || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellrevive');
const PANELDIR = process.env.PANELDIR || path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellrevive');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const by = (arm) => rows.filter(r => r.arm === arm);
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

for (const arm of ['control', 'armed']) {
  const R = by(arm);
  console.log(`=== ${arm.toUpperCase()} (${R.length} runs) ===`);
  console.log(`  shellDays=${sum(R, r => r.shellDays)} shelledKcal=${sum(R, r => r.shelledKcal)} shelledKcalStarvDays=${sum(R, r => r.shelledKcalStarvDays)} shelledDayEatKcal=${sum(R, r => r.shelledDayEatKcal)}`);
  console.log(`  scholarPantryTakes=${sum(R, r => r.scholarPantryTakes)}`);
  console.log(`  starvationDeaths=${sum(R, r => r.starvationDeaths)} playerStarvationDeaths=${sum(R, r => r.playerStarvationDeaths)} starvedDays=${sum(R, r => r.starvedDays)}`);
  console.log(`  national=${sum(R, r => r.national)}/${R.length} table=${sum(R, r => r.table)} wins=${sum(R, r => r.wins)} exiled=${sum(R, r => r.exiled)}`);
  console.log(`  wave4=${sum(R, r => r.wave4)} wave5=${sum(R, r => r.wave5)} arc2=${sum(R, r => r.arc2)} arc3=${sum(R, r => r.arc3)} arc4=${sum(R, r => r.arc4)} fourRealm=${sum(R, r => r.fourRealm)}`);
  console.log(`  medianSurvival=${med(R.map(r => r.gameDays))}d maxSurvival=${Math.max(...R.map(r => r.gameDays))}d`);
  const cc = {};
  for (const r of R) for (const [k, v] of Object.entries(r.causeCounts || {})) cc[k] = (cc[k] || 0) + v;
  const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`  deaths: ${top}`);
}

// ---- pairing: identical (seed, policy) control/armed ----
const C = by('control'), A = by('armed');
const key = (r) => `${r.seed}:${r.policyId}`;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => [cMap.get(key(a)), a]).filter(([c, a]) => c && a);
console.log(`\npaired cases: ${pairs.length} (minimumPairs=${minimumPairs})`);

// ---- light panel-schema JSONs (wall + arm metrics, per seed) ----
const WALL = ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths', 'shelledKcal', 'shelledKcalStarvDays', 'scholarPantryTakes'];
function lightPanel(armRows) {
  return {
    schema: 'shellrevive-b-light-panel/1',
    note: 'Light panel: honest per-seed metrics from the sim-shellrevive-b pilot sweep. NOT a balance-panel.js panel (no observer, no validity gates) — see metric review.',
    wallMetrics: WALL,
    rows: armRows.map(r => ({ seed: r.seed, policy: r.policyId, arm: r.arm,
      metrics: { national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        survivalDays: r.gameDays, starvationDeaths: r.starvationDeaths,
        shelledKcal: r.shelledKcal, shelledKcalStarvDays: r.shelledKcalStarvDays,
        scholarPantryTakes: num(r.scholarPantryTakes) } })),
  };
}
fs.mkdirSync(PANELDIR, { recursive: true });
fs.writeFileSync(path.join(PANELDIR, 'control.json'), JSON.stringify(lightPanel(C), null, 1) + '\n');
fs.writeFileSync(path.join(PANELDIR, 'armed.json'), JSON.stringify(lightPanel(A), null, 1) + '\n');
console.log(`light panels written to ${PANELDIR}/`);

// ---- scorecard compareMetric on contract-overlapping metrics (paired) ----
const SPEC = {
  won:   { id: 'won',   label: 'Table win rate',   unit: 'fraction', direction: 'neutral', tolerance: 0.02, reviewChanges: true },
  table: { id: 'table', label: 'Table invitation', unit: 'fraction', direction: 'higher',  tolerance: 0.02 },
  national: { id: 'national', label: 'National scale', unit: 'fraction', direction: 'higher', tolerance: 0.02 },
  survival30: { id: 'survival30', label: 'Survival to day 30', unit: 'fraction', direction: 'higher', tolerance: 0.02 },
  survival60: { id: 'survival60', label: 'Survival to day 60', unit: 'fraction', direction: 'higher', tolerance: 0.02 },
};
const vals = {
  won: r => r.wins, table: r => r.table, national: r => r.national,
  survival30: r => (r.gameDays > 30 ? 1 : 0), survival60: r => (r.gameDays > 60 ? 1 : 0),
};
const cmp = {};
console.log('\n=== scorecard compareMetric (paired control->armed, contract-overlapping) ===');
for (const [id, spec] of Object.entries(SPEC)) {
  const b = pairs.map(([c]) => vals[id](c)), a = pairs.map(([, x]) => vals[id](x));
  const m = compareMetric(b, a, spec, id);
  cmp[id] = m;
  console.log(`  ${id}: before=${m.before.toFixed(3)} after=${m.after.toFixed(3)} delta=${m.delta >= 0 ? '+' : ''}${m.delta.toFixed(3)} [${m.interval95[0].toFixed(3)},${m.interval95[1].toFixed(3)}] status=${m.status}`);
}

// ---- corrected GO verdict ----
const starvDaysEngA = sum(A, r => r.shelledKcalStarvDays), engC = sum(C, r => r.shelledKcal);
const starvA = sum(A, r => r.starvationDeaths), starvC = sum(C, r => r.starvationDeaths);
const natA = sum(A, r => r.national), natC = sum(C, r => r.national);
const medA = med(A.map(r => r.gameDays)), medC = med(C.map(r => r.gameDays));
// paired pantry-draw displacement (control - armed), null-safe
const displPairs = pairs.map(([c, a]) => (num(c.scholarPantryTakes) != null && num(a.scholarPantryTakes) != null) ? (c.scholarPantryTakes - a.scholarPantryTakes) : null).filter(v => v != null);
const displ = displPairs.reduce((t, v) => t + v, 0);
const ccA = {}, ccC = {};
for (const r of A) for (const [k, v] of Object.entries(r.causeCounts || {})) ccA[k] = (ccA[k] || 0) + v;
for (const r of C) for (const [k, v] of Object.entries(r.causeCounts || {})) ccC[k] = (ccC[k] || 0) + v;
const newModes = Object.keys(ccA).filter(k => !(k in ccC));
const signLine = pairs.map(([c, a]) => a.starvationDeaths - c.starvationDeaths);
const nBetter = signLine.filter(d => d < 0).length, nWorse = signLine.filter(d => d > 0).length, nTied = signLine.filter(d => d === 0).length;

console.log('\n=== CORRECTED GO VERDICT (pre-registered) ===');
console.log(`  PRIMARY(a) engagement on starvation days: armed=${starvDaysEngA} (need >=1000), control=${engC} (need 0) -> ${starvDaysEngA >= 1000 && engC === 0 ? 'HOLD' : 'MISS'}`);
console.log(`  PRIMARY(b) pantry displacement (control-armed, ${displPairs.length}/${pairs.length} pairs): ${displ >= 0 ? '+' : ''}${displ} kcal (need >=0) -> ${displ >= 0 ? 'HOLD' : 'MISS'}`);
console.log(`  GUARD starvation: armed=${starvA} <= control+2=${starvC + 2} ? ${starvA <= starvC + 2} (paired sign: ${nBetter} better / ${nWorse} worse / ${nTied} tied)`);
console.log(`  GUARD national: armed=${natA} >= control-2=${natC - 2} ? ${natA >= natC - 2}`);
console.log(`  GUARD median survival: armed=${medA}d >= control-10d=${medC - 10}d ? ${medA >= medC - 10}`);
console.log(`  GUARD new death modes: ${newModes.length ? newModes.map(k => k + ':' + ccA[k]).join(' ') : 'none'}`);
const GO = starvDaysEngA >= 1000 && engC === 0 && displ >= 0 && starvA <= starvC + 2 && natA >= natC - 2 && medA >= medC - 10 && newModes.length === 0;
console.log(`\n  ==> ${GO ? 'GO' : 'NO-GO'}`);

// ---- compare .md (attached to evidence) ----
const lines = ['# sim-shellrevive-b — before/after compare (pilot, 8 seeds x 2 policies x control/armed)',
  '', `**Decision: ${GO ? 'GO' : 'NO-GO'}** (corrected §14 pre-registration)`, '',
  `Paired cases: ${pairs.length}. Light panels: control.json / armed.json in this directory.`,
  'The contract-overlapping metrics below use the scorecard compareMetric statistics;',
  'pre-registered metrics are judged directly (see metric review in the evidence).', '',
  '| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |',
  '| --- | ---: | ---: | ---: | --- | ---: | --- |'];
for (const [id, m] of Object.entries(cmp)) {
  lines.push(`| ${m.label} | ${m.before.toFixed(3)} | ${m.after.toFixed(3)} | ${m.delta >= 0 ? '+' : ''}${m.delta.toFixed(3)} | [${m.interval95[0].toFixed(3)}, ${m.interval95[1].toFixed(3)}] | ${m.pairs} | ${m.status} |`);
}
lines.push('', '## Pre-registered judgement',
  `- PRIMARY(a) shelled-kcal on starvation days (armed): **${starvDaysEngA}** (GO >= 1000); control **${engC}** (GO = 0). ${starvDaysEngA >= 1000 && engC === 0 ? '**HOLD**' : '**MISS**'}`,
  `- PRIMARY(b) paired pantry-draw displacement (control − armed): **${displ >= 0 ? '+' : ''}${displ}** kcal over ${displPairs.length} pairs (GO >= 0). ${displ >= 0 ? '**HOLD**' : '**MISS**'}`,
  `- GUARD starvation deaths: armed **${starvA}** vs control **${starvC}** (GO <= control+2 = ${starvC + 2}); paired sign ${nBetter}/${nWorse}/${nTied} (better/worse/tied). ${starvA <= starvC + 2 ? '**HOLD**' : '**MISS**'}`,
  `- GUARD national: armed **${natA}/${A.length}** vs control **${natC}/${C.length}** (GO >= control−2). ${natA >= natC - 2 ? '**HOLD**' : '**MISS**'}`,
  `- GUARD median survival: armed **${medA}d** vs control **${medC}d** (GO >= control−10d). ${medA >= medC - 10 ? '**HOLD**' : '**MISS**'}`,
  `- GUARD new death modes: ${newModes.length ? newModes.map(k => '`' + k + '`:' + ccA[k]).join(' ') : 'none'}.`,
  `- GUARD det-gate: from scripts/test-shelltask-b.js Part C (byte-identical gate-off).`,
  '', `**Overall: ${GO ? 'GO' : 'NO-GO'}**`, '');
fs.writeFileSync(path.join(PANELDIR, 'compare-shellrevive-b.md'), lines.join('\n'));
console.log(`compare .md written to ${PANELDIR}/compare-shellrevive-b.md`);
