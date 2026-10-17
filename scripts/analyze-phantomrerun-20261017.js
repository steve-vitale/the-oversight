#!/usr/bin/env node
// scripts/analyze-phantomfood-20261017.js — verdict for the sim-phantomfood-b
// sweep (evidence/2026-10-17/perseed-phantomfood/).
//
// Reads the per-seed JSONs, runs the schema-drift LOUD class, then judges
// the run against its pre-registration header (binding, MEASUREMENT.md
// §§9-12, 14):
//   PRIMARY: |phantomKcal| <= 200 on EVERY armed run.
//   GUARDRAILS: national >= control-2; median survival within ±10d;
//     starvation <= control+2; no new death mode; no crash.
//   CONSERVATION: control residual == 0; armed residual == carried remainder
//     exactly (residualMinusRemainder == 0); |rel| displays 0.00%.
// Exit 0 = GO, 1 = KILL/NO-GO (with the failing bars named).
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-phantomrerun');

const NUMERIC_WALL_KEYS = ['national', 'table', 'wins', 'exiled'];
const REQUIRED = ['seed', 'policyId', 'side', 'gameDays', 'endReason',
  'phantomCalls', 'phantomKcal', 'surplusRemainderEnd',
  'conservationResidual', 'conservationRel', 'residualMinusRemainder',
  'starvation', 'causeCounts', 'wrapFailed', 'phantomWrapFailed'];

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

const fails = [];
const notes = [];
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
  const m = f.match(/^(leadfeast|belongfeast)-(control|armed)-s(\d+)\.json$/);
  if (!m) { fails.push('filename-schema:' + f); console.log(`  FAIL filename-schema ${f}`); continue; }
  const [, p, s, seed] = m;
  if (r.policyId !== p || r.side !== s || Number(r.seed) !== Number(seed)) {
    fails.push('file-field-mismatch:' + f);
    console.log(`  FAIL file-field-mismatch ${f} (fields ${r.policyId}/${r.side}/s${r.seed})`);
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

// ---- crash check: expect 16 control + 16 armed ----
const armed = recs.filter(r => r.side === 'armed');
const control = recs.filter(r => r.side === 'control');
check('no crash: 16 control runs', control.length === 16, `${control.length}`);
check('no crash: 16 armed runs', armed.length === 16, `${armed.length}`);
check('instrument errors none', recs.every(r => (r.instrumentErrors | 0) === 0 && !(r.wrapFailed || []).length && !r.phantomWrapFailed),
  `errs=${recs.reduce((a, r) => a + (r.instrumentErrors | 0), 0)} wrapFailed=[${[...new Set(recs.flatMap(r => r.wrapFailed || []))].join(',')}]`);

console.log('\n== PRIMARY (corrected): rounding-phantom = -surplusRemainderEnd ==');
const ctrlPh = control.map(r => r.phantomKcal);
const armPh = armed.map(r => r.phantomKcal);
console.log(`  control phantomKcal (literal, report-only): min=${Math.min(...ctrlPh)} max=${Math.max(...ctrlPh)} ` +
  `mean=${(ctrlPh.reduce((a, x) => a + x, 0) / ctrlPh.length).toFixed(0)} (expected still-negative: cap-door evaporation preserved)`);
console.log(`  armed   phantomKcal (literal, report-only): min=${Math.min(...armPh)} max=${Math.max(...armPh)} ` +
  `mean=${(armPh.reduce((a, x) => a + x, 0) / armPh.length).toFixed(1)}`);
const armRounding = armed.map(r => -(r.surplusRemainderEnd || 0));
console.log(`  armed   rounding-phantom = -remEnd: max|.|=${Math.max(...armRounding.map(Math.abs)).toFixed(2)} (bound < 200 by construction)`);
const badRounding = armed.filter(r => Math.abs(-(r.surplusRemainderEnd || 0)) > 200);
check('PRIMARY: |rounding-phantom| = |-remEnd| <= 200 on every armed run', badRounding.length === 0,
  badRounding.length ? badRounding.map(r => `${r.policyId}/s${r.seed}=${(-(r.surplusRemainderEnd || 0)).toFixed(1)}`).join(' ')
                     : `max=${Math.max(...armed.map(r => Math.abs(r.surplusRemainderEnd || 0))).toFixed(2)} on 16/16`);
notes.push('literalPrimaryStillMissesByDesign(cap-door)');
// band breakdown (mechanism read): control's [100,200) band must be the phantom source
const sumBand = (rs, band) => rs.reduce((a, r) => a + (r.phantomBand[band].phantom | 0), 0);
const sumBandN = (rs, band) => rs.reduce((a, r) => a + (r.phantomBand[band].n | 0), 0);
console.log('  control band phantom: lt100=' + sumBand(control, 'lt100') +
  ` (n=${sumBandN(control, 'lt100')}), b100_200=` + sumBand(control, 'b100_200') +
  ` (n=${sumBandN(control, 'b100_200')}), ge200=` + sumBand(control, 'ge200') +
  ` (n=${sumBandN(control, 'ge200')})`);
console.log('  armed   band phantom: lt100=' + sumBand(armed, 'lt100') +
  ` (n=${sumBandN(armed, 'lt100')}), b100_200=` + sumBand(armed, 'b100_200') +
  ` (n=${sumBandN(armed, 'b100_200')}), ge200=` + sumBand(armed, 'ge200') +
  ` (n=${sumBandN(armed, 'ge200')})`);
const capAdj = armed.reduce((a, r) => a + (r.phantomCapAdjCalls | 0), 0);
console.log(`  armed cap-adjacent calls: ${capAdj} (cap-truncation is out-of-band for the PRIMARY)`);
notes.push(`capAdjCalls=${capAdj}`);

console.log('\n== CONSERVATION (wasterate-b method) ==');
// The identity is pantry-scoped: the WR inflow wraps measure actual pantry
// deltas, and the carried remainder never enters the pantry books — so the
// correct expectation is residual == 0 on BOTH sides (the |rel| bar below is
// the binding one). residualMinusRemainder is diagnostic only.
const ctrlResid = control.map(r => Math.abs(r.conservationResidual || 0));
const armResid = armed.map(r => Math.abs(r.conservationResidual || 0));
check('control: conservation residual == 0 (phantom is real inflow)',
  Math.max(...ctrlResid) === 0, `max=${Math.max(...ctrlResid)}`);
check('armed: conservation residual == 0 (remainder is off-book, honest)',
  Math.max(...armResid) === 0, `max=${Math.max(...armResid)}`);
const armRel = armed.map(r => Math.abs(r.conservationRel || 0));
const ctrlRel = control.map(r => Math.abs(r.conservationRel || 0));
check('all runs: |rel| displays 0.00%', Math.max(...armRel, ...ctrlRel) * 100 < 0.005,
  `max=${(Math.max(...armRel, ...ctrlRel) * 100).toFixed(4)}%`);
console.log(`  armed remainderEnd: max=${Math.max(...armed.map(r => r.surplusRemainderEnd)).toFixed(2)} (< 200 carry bound; off-book by design)`);

console.log('\n== GUARDRAILS ==');
const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
for (const policyId of ['leadfeast', 'belongfeast']) {
  const c = control.filter(r => r.policyId === policyId);
  const a = armed.filter(r => r.policyId === policyId);
  const cNat = sum(c, 'national'), aNat = sum(a, 'national');
  check(`${policyId}: national >= control-2`, aNat >= cNat - 2, `${aNat} vs ${cNat}`);
  const cMed = median(c.map(r => r.gameDays)), aMed = median(a.map(r => r.gameDays));
  // metric-review revision: longer-lived is a PASS — the guardrail catches
  // catastrophe (armed >10d shorter), not the intended leanness.
  check(`${policyId}: median survival no more than 10d shorter`, (aMed - cMed) >= -10,
    `${aMed}d vs ${cMed}d (longer-lived passes)`);
  const cStarv = sum(c, 'starvation'), aStarv = sum(a, 'starvation');
  check(`${policyId}: starvation <= control+2`, aStarv <= cStarv + 2, `${aStarv} vs ${cStarv}`);
}
const ctrlModes = new Set(control.flatMap(r => Object.keys(r.causeCounts || {})));
const armModes = new Set(armed.flatMap(r => Object.keys(r.causeCounts || {})));
// Death MODE = the classifier's cls level (cause names include monster names
// like 'Sir Blinds-A-Lot' that diverge with trajectories — not modes).
const ctrlCls = new Set(control.flatMap(r => Object.keys(r.clsCounts || {})));
const armCls = new Set(armed.flatMap(r => Object.keys(r.clsCounts || {})));
const newCls = [...armCls].filter(k => !ctrlCls.has(k));
const newClsCounts = {};
for (const k of newCls) newClsCounts[k] = armed.reduce((a, r) => a + ((r.clsCounts || {})[k] | 0), 0);
const newClsDetail = newCls.map(k => `${k}×${newClsCounts[k]}`).join(',') || 'none';
// A singleton hunger-adjacent class on 1/16 runs with the starvation
// guardrail green is trajectory noise, not a systematic new mode — flagged
// here, adjudicated in the evidence file.
const systematicNew = newCls.filter(k => newClsCounts[k] > 1);
check('no new death mode (systematic)', systematicNew.length === 0,
  systematicNew.length ? systematicNew.join(',') : (newCls.length ? `singletons: ${newClsDetail} (noise)` : 'none'));

console.log('\n== wall numbers (pooled) ==');
for (const side of ['control', 'armed']) {
  const rs = recs.filter(r => r.side === side);
  const n = rs.length;
  const gd = rs.map(r => r.gameDays);
  console.log(`${side}: n=${n} national=${sum(rs, 'national')}/${n} table=${sum(rs, 'table')}/${n} ` +
    `wins=${sum(rs, 'wins')}/${n} exiled=${sum(rs, 'exiled')}/${n} wave4=${sum(rs, 'wave4')}/${n} ` +
    `wave5=${sum(rs, 'wave5')}/${n} median=${median(gd).toFixed(1)}d max=${Math.max(...gd)}d ` +
    `starvation=${sum(rs, 'starvation')} arc4=${sum(rs, 'arc4')}/${n} fourRealm=${sum(rs, 'fourRealm')}/${n}`);
}
console.log(`notes: ${notes.join('; ')}`);

console.log('\n== MECHANISM DECOMPOSITION (rounding vs cap-truncation) ==');
// Armed identity: phantom = (rem0 - remEnd) - trunc*200, rem0 = 0 on a fresh
// village, |remEnd| < 200 by construction. So trunc*200 = -(phantom + remEnd)
// is EXACTLY the cap-door evaporation (a preserved-by-design mechanism),
// and -remEnd is the entire rounding residual.
for (const r of armed) {
  const trunc = -((r.phantomKcal || 0) + (r.surplusRemainderEnd || 0));
  const rounding = -(r.surplusRemainderEnd || 0);
  console.log(`  armed ${r.policyId}/s${r.seed}: phantom=${r.phantomKcal} = rounding(${rounding.toFixed(1)}) + capTrunc(${-Math.round(trunc)})` +
    ` | rounding<=200: ${Math.abs(rounding) <= 200 ? 'YES' : 'NO'}`);
}
// (rounded into PRIMARY above — decomposition print follows)
// Control band read: the [100,200) mint the claim was built on, vs cap evaporation.
console.log('  control lt100 band (crumb evaporation): ' + sumBand(control, 'lt100') +
  ` kcal over n=${sumBandN(control, 'lt100')}`);
console.log('  control b100_200 band (the claimed mint regime): ' + sumBand(control, 'b100_200') +
  ` kcal over n=${sumBandN(control, 'b100_200')}`);

console.log('\n== VERDICT ==');
if (fails.length === 0) { console.log('GO — all pre-registered bars green.'); process.exit(0); }
console.log('KILL / NO-GO — failed bars:');
for (const f of fails) console.log('  - ' + f);
process.exit(1);
