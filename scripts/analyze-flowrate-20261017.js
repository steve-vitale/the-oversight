#!/usr/bin/env node
// scripts/analyze-flowrate-20261017.js — verdict for the sim-flowrate-b
// sweep (evidence/2026-10-17/perseed-flowrate/).
//
// Reads the per-seed JSONs, runs the schema-drift LOUD class, then judges
// the run against its pre-registration header (binding, MEASUREMENT.md
// §§9-12, 14):
//   PRIMARY (attribution gate): 100% of pantry rot attributed to
//     flow/stock/rounding on 16/16 runs — rotRounding <= 1% of rotTotal per
//     run, AND the attribution reconciles with the WR books
//     (attrResidual == 0, sweep/desperation/day parities == 0).
//   COMPLETENESS: conservation |rel| <= 3% on all 16 runs (WR method).
// Then delivers the four calibration products:
//   (1) per-day pantry income-rate distribution
//   (2) rot decomposed into flow-driven / stock-driven / rounding
//       (phantomfood phantomBand pattern)
//   (3) rot-per-pantry-kcal (waste rate) baseline
//   (4) max-theoretical-drawdown volume table for flow-trigger thresholds X
// Exit 0 = GO, 1 = NO-GO (with the failing bars named).
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-flowrate');

const NUMERIC_WALL_KEYS = ['national', 'table', 'wins', 'exiled'];
const REQUIRED = ['seed', 'policyId', 'side', 'gameDays', 'endReason',
  'rotTotal', 'rotFlow', 'rotStock', 'rotRounding', 'roundingShare',
  'attrResidual', 'sweepParity', 'despFreshParity', 'despPreservedParity',
  'dayAttrParity', 'inflowByDay', 'inflowDayAttributed', 'pantryInKcal',
  'pantryStartKcal', 'conservationRel', 'wasteRate', 'rotBand',
  'starvation', 'causeCounts', 'wrapFailed', 'instrumentErrors',
  'wave4', 'wave5', 'maxWave', 'arc4', 'fourRealm'];

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function quantile(xs, q) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.floor(q * s.length)));
  return s[i];
}

const fails = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
console.log(`== loading ${files.length} per-seed JSONs ==`);
const recs = [];
for (const f of files) {
  const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  // schema-drift LOUD: filename <-> field cross-check
  const m = f.match(/^(leadfeast|belongfeast)-flowrate-s(\d+)\.json$/);
  if (!m) { fails.push('filename-schema:' + f); console.log(`  FAIL filename-schema ${f}`); continue; }
  const [, p, seed] = m;
  if (r.policyId !== p || Number(r.seed) !== Number(seed)) {
    fails.push('file-field-mismatch:' + f);
    console.log(`  FAIL file-field-mismatch ${f} (fields ${r.policyId}/s${r.seed})`);
    continue;
  }
  for (const k of REQUIRED) {
    if (!(k in r)) { fails.push(`missing-key:${k}:${f}`); console.log(`  FAIL missing-key ${k} in ${f}`); }
  }
  for (const k of NUMERIC_WALL_KEYS) {
    if (typeof r[k] !== 'number') { fails.push(`wall-key-not-number:${k}:${f}`); console.log(`  FAIL wall-key-not-number ${k} in ${f}`); }
  }
  recs.push(r);
}

// ---- crash check: expect 16 runs ----
check('no crash: 16 runs', recs.length === 16, `${recs.length}`);
check('instrument errors none', recs.every(r => (r.instrumentErrors | 0) === 0 && !(r.wrapFailed || []).length),
  `errs=${recs.reduce((a, r) => a + (r.instrumentErrors | 0), 0)} wrapFailed=[${[...new Set(recs.flatMap(r => r.wrapFailed || []))].join(',')}]`);

console.log('\n== PRIMARY: 100% rot attribution (flow/stock/rounding) ==');
const badRound = recs.filter(r => r.roundingShare > 0.01);
check('roundingShare <= 1% on 16/16 runs', badRound.length === 0,
  badRound.length ? badRound.map(r => `${r.policyId}/s${r.seed}=${(r.roundingShare * 100).toFixed(2)}%`).join(' ')
    : `max=${(Math.max(...recs.map(r => r.roundingShare)) * 100).toFixed(3)}%`);
const badAttr = recs.filter(r => r.attrResidual !== 0);
check('attrResidual == 0 (flow+stock+rounding == rotTotal)', badAttr.length === 0,
  badAttr.length ? badAttr.map(r => `${r.policyId}/s${r.seed}=${r.attrResidual}`).join(' ') : 'exact');
const badPar = recs.filter(r => r.sweepParity !== 0 || r.despFreshParity !== 0 ||
  r.despPreservedParity !== 0 || r.dayAttrParity !== 0);
check('scan parities == 0 (FR vs WR books)', badPar.length === 0,
  badPar.length ? badPar.map(r => `${r.policyId}/s${r.seed}`).join(' ') : 'all zero');
const badCons = recs.filter(r => Math.abs(r.conservationRel) > 0.03);
check('COMPLETENESS: conservation |rel| <= 3% on 16/16', badCons.length === 0,
  badCons.length ? badCons.map(r => `${r.policyId}/s${r.seed}=${(r.conservationRel * 100).toFixed(2)}%`).join(' ')
    : `max=${(Math.max(...recs.map(r => Math.abs(r.conservationRel))) * 100).toFixed(3)}%`);

console.log('\n== (2) ROT DECOMPOSITION — flow-driven vs stock-driven vs rounding ==');
// phantomfood phantomBand pattern: per-run mechanism lines + pooled bands.
for (const r of recs) {
  const rt = r.rotTotal || 1;
  console.log(`  ${r.policyId}/s${r.seed}: rot=${Math.round(r.rotTotal / 1000)}k = ` +
    `flow(${(100 * r.rotFlow / rt).toFixed(1)}%) + stock(${(100 * r.rotStock / rt).toFixed(1)}%) + ` +
    `rounding(${(100 * r.rotRounding / rt).toFixed(2)}%) | untaggedItems=${r.rotUntaggedItems}`);
}
const sumK = (f) => recs.reduce((a, r) => a + (r[f] || 0), 0);
const pRot = sumK('rotTotal'), pFlow = sumK('rotFlow'), pStock = sumK('rotStock'), pRound = sumK('rotRounding');
console.log(`  POOLED: rot=${Math.round(pRot / 1000)}k = flow ${(100 * pFlow / pRot).toFixed(1)}% + ` +
  `stock ${(100 * pStock / pRot).toFixed(1)}% + rounding ${(100 * pRound / pRot).toFixed(2)}%`);
console.log('  bands (phantomfood pattern):');
for (const b of ['lt100', 'b100_200', 'ge200']) {
  const bandOf = (r) => ((r.rotBand || {})[b]) || {};
  const bf = recs.reduce((a, r) => a + (bandOf(r).flow || 0), 0);
  const bs = recs.reduce((a, r) => a + (bandOf(r).stock || 0), 0);
  const br = recs.reduce((a, r) => a + (bandOf(r).rounding || 0), 0);
  const bn = recs.reduce((a, r) => a + (bandOf(r).n || 0), 0);
  console.log(`    ${b}: ${Math.round((bf + bs + br) / 1000)}k over n=${bn} items ` +
    `(flow ${(100 * bf / Math.max(1, bf + bs + br)).toFixed(0)}% / stock ${(100 * bs / Math.max(1, bf + bs + br)).toFixed(0)}%)`);
}

console.log('\n== (1) INCOME-RATE DISTRIBUTION (kcal/day into the pantry) ==');
const rates = [];
for (const r of recs) {
  const byDay = r.inflowByDay || {};
  for (let d = 1; d <= (r.gameDays | 0); d++) rates.push(byDay[d] | 0);
}
const posRates = rates.filter(x => x > 0);
console.log(`  run-days: n=${rates.length}, with income: ${posRates.length} (${(100 * posRates.length / Math.max(1, rates.length)).toFixed(1)}%)`);
console.log(`  all days: p10=${quantile(rates, 0.10)} p25=${quantile(rates, 0.25)} ` +
  `median=${quantile(rates, 0.50)} p75=${quantile(rates, 0.75)} p90=${quantile(rates, 0.90)} ` +
  `p95=${quantile(rates, 0.95)} p99=${quantile(rates, 0.99)} max=${Math.max(...rates)}`);
console.log(`  income days only: median=${quantile(posRates, 0.50)} p75=${quantile(posRates, 0.75)} ` +
  `p90=${quantile(posRates, 0.90)} max=${Math.max(...posRates)}`);
const GRID = [250, 500, 1000, 2000, 4000, 8000, 16000];
for (const X of GRID) {
  const n = rates.filter(x => x > X).length;
  console.log(`    days with income > ${X}: ${n} (${(100 * n / Math.max(1, rates.length)).toFixed(2)}%)`);
}

console.log('\n== (3) WASTE-RATE BASELINE (rot-per-pantry-kcal) ==');
for (const r of recs) {
  console.log(`  ${r.policyId}/s${r.seed}: wasteRate=${(r.wasteRate * 100).toFixed(1)}% ` +
    `(rot ${Math.round(r.rotTotal / 1000)}k / throughput ${Math.round(((r.pantryStartKcal || 0) + (r.pantryInKcal || 0)) / 1000)}k)`);
}
const wrAll = recs.map(r => r.wasteRate);
console.log(`  pooled: mean=${(100 * wrAll.reduce((a, x) => a + x, 0) / wrAll.length).toFixed(1)}% ` +
  `median=${(100 * median(wrAll)).toFixed(1)}% range=${(100 * Math.min(...wrAll)).toFixed(1)}–${(100 * Math.max(...wrAll)).toFixed(1)}%`);

console.log('\n== (4) MAX-THEORETICAL-DRAWDOWN VOLUME TABLE ==');
console.log('  For a flow-triggered honest drain (trigger: income-rate > X kcal/day):');
console.log('  triggerDays = days the arm would fire; inflowOnTrigger = absolute');
console.log('  ceiling (all inflow on trigger days); surplusOnTrigger = sustainable');
console.log('  ceiling (only the above-X surplus). Per run, then median/p10/p90.');
const medRot = median(recs.map(r => r.rotTotal));
console.log(`  (reference: median rotTotal/run = ${Math.round(medRot / 1000)}k)`);
for (const X of GRID) {
  const rows = recs.map(r => {
    const byDay = r.inflowByDay || {};
    let trig = 0, inflow = 0, surplus = 0;
    for (let d = 1; d <= (r.gameDays | 0); d++) {
      const v = byDay[d] | 0;
      if (v > X) { trig++; inflow += v; surplus += (v - X); }
    }
    return { trig, inflow, surplus };
  });
  const med = (f) => median(rows.map(f));
  const p10 = (f) => quantile(rows.map(f), 0.10);
  const p90 = (f) => quantile(rows.map(f), 0.90);
  const totInflow = rows.reduce((a, r) => a + r.inflow, 0);
  const totSurplus = rows.reduce((a, r) => a + r.surplus, 0);
  console.log(`  X=${X}: triggerDays med=${med(r => r.trig).toFixed(0)} (p10 ${p10(r => r.trig).toFixed(0)}/p90 ${p90(r => r.trig).toFixed(0)}) | ` +
    `inflowOnTrigger med=${Math.round(med(r => r.inflow) / 1000)}k | ` +
    `surplusOnTrigger med=${Math.round(med(r => r.surplus) / 1000)}k ` +
    `(p10 ${Math.round(p10(r => r.surplus) / 1000)}k/p90 ${Math.round(p90(r => r.surplus) / 1000)}k) | ` +
    `pooled surplus=${Math.round(totSurplus / 1000)}k = ${(100 * totSurplus / Math.max(1, recs.reduce((a, r) => a + r.rotTotal, 0))).toFixed(1)}% of pooled rot`);
}

console.log('\n== wall numbers (pooled) ==');
{
  const n = recs.length;
  const s = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
  const gd = recs.map(r => r.gameDays);
  console.log(`n=${n} national=${s('national')}/${n} table=${s('table')}/${n} wins=${s('wins')}/${n} exiled=${s('exiled')}/${n} ` +
    `wave4=${s('wave4')}/${n} wave5=${s('wave5')}/${n} arc2=${s('arc2')}/${n} arc3=${s('arc3')}/${n} arc4=${s('arc4')}/${n} fourRealm=${s('fourRealm')}/${n} ` +
    `median=${median(gd).toFixed(1)}d max=${Math.max(...gd)}d starvation=${s('starvation')} halfRationDays=${s('halfRationDays')}`);
}
console.log('death-cause shares (pooled):');
{
  const cc = {};
  for (const r of recs) for (const [k, v] of Object.entries(r.causeCounts || {})) cc[k] = (cc[k] || 0) + v;
  const tot = Object.values(cc).reduce((a, x) => a + x, 0);
  const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('  ' + top.map(([k, v]) => `${k} ${v} (${(100 * v / Math.max(1, tot)).toFixed(1)}%)`).join(' | '));
}

console.log('\n== VERDICT ==');
if (fails.length === 0) { console.log('GO — diagnostic attribution complete on 16/16 runs.'); process.exit(0); }
console.log('NO-GO — failed bars:');
for (const f of fails) console.log('  - ' + f);
process.exit(1);
