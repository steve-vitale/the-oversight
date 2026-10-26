#!/usr/bin/env node
// test-onzero9754-b.js — proof test + analyzer for sim-onzero9754-b.
// Reads the 4 current-master per-seed files (seed 9754, off/on x pd0/pd1)
// from evidence/2026-10-25/sim-onzero9754-b-corpus/ and, when present,
// the published preserveact pilot files for the same seed, and judges
// the run ONLY against the pre-registered DIAG bar in
// evidence/2026-10-25/sim-onzero9754-b.md:
//   D1: OFF batches > 0 both sides AND ON batches == 0 both sides.
//   D2: EXACTLY ONE decomposition step is 0 under ON on both sides
//       while > 0 under OFF on at least one side (steps: villager
//       cooking deeds; preserver pool size > 0 counts as a step only
//       via its day-1 skilled count — see note below; eligible days;
//       after-reserve days; racks-full days per skill).
//   D3: batches >= resolutions, villager cooking >= preserving,
//       invHaulActions > 0, arm/base tags + seeds + contrast match.
// Pool note (honest, fixed here): pool membership is a STATE, not a
// count that can be "zero" in the same sense — the pool step meets the
// D2 pattern only if the day-1 skilled pool is 0 under ON on both
// sides while > 0 under OFF on at least one side. A larger ON pool
// (the expected widening direction) does NOT meet the pattern, and
// the pool is then reported as "non-zero both arms" — it cannot be
// the named zero step. The D2 scan below implements exactly this.
// Exit 0 iff D1 + D2 + D3 all hold; otherwise exit 1 with the failed
// condition(s) named. A non-zero exit is a DIAG NO-GO verdict, not a
// test harness failure — the per-check table is the proof.
'use strict';
const fs = require('fs');
const path = require('path');
const WT = path.join(__dirname, '..');
const CORPUS = path.join(WT, 'evidence', '2026-10-25', 'sim-onzero9754-b-corpus');
const PUB = path.join(WT, 'evidence', '2026-10-25', 'preserveact-b-corpus');
const SEED = 9754;
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name} :: ${detail}`); };
const load = (dir, arm, side) => {
  const f = path.join(dir, `${dir === PUB ? 'preserveact-b' : 'onzero9754-b'}-${arm}-${side}-dg1-leadfeast-s${SEED}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};
const cells = [];
for (const arm of ['off', 'on']) for (const side of ['pd0', 'pd1']) {
  const d = load(CORPUS, arm, side);
  cells.push({ arm, side, d });
  check(`T1 file ${arm}/${side}`, !!d, d ? `base=${String(d.baseCommit || '').slice(0, 8)} days=${d.daysAlive}` : 'MISSING');
}
if (cells.some(c => !c.d)) { console.log(`\nRESULT: ${pass} PASS / ${fail} FAIL — corpus incomplete, no verdict`); process.exit(1); }
const get = (arm, side) => cells.find(c => c.arm === arm && c.side === side).d;
// T1b: shared base + contrast match
const bases = new Set(cells.map(c => c.d.baseCommit));
check('T1b shared baseCommit', bases.size === 1, [...bases].map(b => String(b).slice(0, 8)).join(','));
check('T1b seeds/policy/contrast', cells.every(c => c.d.seed === SEED && c.d.policy === 'leadfeast' && c.d.depositgate === 1),
  cells.map(c => `${c.arm}/${c.side}:seed=${c.d.seed},pd=${c.d.plentydepri}`).join(' '));
const villCook = (d) => { let t = 0; for (const [k, v] of Object.entries(d.cookingByVid || {})) if (k !== 'player') t += v; return t; };
const poolSkilled = (d) => { const sn = (d.snapshots || [])[0]; if (!sn || !sn.pool) return null; return (sn.pool[1] || 0) + (sn.pool[2] || 0) + (sn.pool[3] || 0); };
console.log('\nPER-CELL TABLE (batches / resolutions / villagerCooking / playerCooking / poolSkilledDay1 / eligDays / afterResDays / racksFullDays[0..3] / daysAlive / national / wave):');
for (const c of cells) {
  const d = c.d, a = d.snapAgg || {};
  console.log(`  ${c.arm}/${c.side}: ${d.preserveVillagerBatches}/${d.preserveVillagerResolutions} cookVill=${villCook(d)} cookPlayer=${(d.cookingByVid || {}).player || 0} pool=${poolSkilled(d)} eligDays=${a.daysEligibleGt0} afterResDays=${a.daysAfterReserveGt0} racksFull=${JSON.stringify(a.racksFullDays)} days=${d.daysAlive} nat=${d.national} wave=${(d.waveReach || []).join(',')}`);
}
// Published comparison (reported, never re-scored)
console.log('\nPUBLISHED PILOT COUNTS (preserveact-b-corpus, base 9f11741a) vs CURRENT-MASTER REPRODUCTION:');
for (const arm of ['off', 'on']) for (const side of ['pd0', 'pd1']) {
  const p = load(PUB, arm, side), cur = get(arm, side);
  console.log(`  ${arm}/${side}: published batches=${p ? p.preserveVillagerBatches : 'n/a'} res=${p ? p.preserveVillagerResolutions : 'n/a'} -> current batches=${cur.preserveVillagerBatches} res=${cur.preserveVillagerResolutions}${p && p.preserveVillagerBatches !== cur.preserveVillagerBatches ? '  (DIVERGES in exact count)' : ''}`);
}
// D1
const d1 = get('off', 'pd0').preserveVillagerBatches > 0 && get('off', 'pd1').preserveVillagerBatches > 0 &&
  get('on', 'pd0').preserveVillagerBatches === 0 && get('on', 'pd1').preserveVillagerBatches === 0;
check('D1 reproduction pattern', d1, `OFF ${get('off', 'pd0').preserveVillagerBatches}/${get('off', 'pd1').preserveVillagerBatches} ON ${get('on', 'pd0').preserveVillagerBatches}/${get('on', 'pd1').preserveVillagerBatches}`);
// D2 steps
const stepVal = (name, d) => {
  if (name === 'villagerCooking') return villCook(d);
  if (name === 'poolSkilled') return poolSkilled(d);
  if (name === 'eligibleDays') return (d.snapAgg || {}).daysEligibleGt0;
  if (name === 'afterReserveDays') return (d.snapAgg || {}).daysAfterReserveGt0;
  if (name.startsWith('racksFullSkill')) return ((d.snapAgg || {}).racksFullDays || {})[name.slice(-1)];
  return null;
};
const steps = ['villagerCooking', 'poolSkilled', 'eligibleDays', 'afterReserveDays', 'racksFullSkill0', 'racksFullSkill1', 'racksFullSkill2', 'racksFullSkill3'];
const zeroSteps = [];
console.log('\nD2 STEP SCAN (ON==0 both sides AND OFF>0 at least one side):');
for (const st of steps) {
  const off0 = stepVal(st, get('off', 'pd0')), off1 = stepVal(st, get('off', 'pd1'));
  const on0 = stepVal(st, get('on', 'pd0')), on1 = stepVal(st, get('on', 'pd1'));
  const meets = (on0 === 0 && on1 === 0) && (off0 > 0 || off1 > 0);
  if (meets) zeroSteps.push(st);
  console.log(`  ${st}: OFF ${off0}/${off1} ON ${on0}/${on1} -> ${meets ? 'ZERO-STEP' : 'not the step'}`);
}
const d2 = zeroSteps.length === 1;
check('D2 exactly one zero step', d2, zeroSteps.length === 0 ? 'no step zeroes' : `zero step(s): ${zeroSteps.join(', ')}`);
// D3
let d3ok = true;
for (const c of cells) {
  const d = c.d;
  const ok = d.preserveVillagerBatches >= d.preserveVillagerResolutions && villCook(d) >= d.preserveVillagerResolutions && d.invHaulActions > 0 && (d.snapshots || []).length > 0;
  if (!ok) d3ok = false;
  check(`D3 closure ${c.arm}/${c.side}`, ok, `batches>=res ${d.preserveVillagerBatches}>=${d.preserveVillagerResolutions}, villCook>=pres ${villCook(d)}>=${d.preserveVillagerResolutions}, invHaul=${d.invHaulActions}, snapshots=${(d.snapshots || []).length}`);
}
check('D3 all cells', d3ok, d3ok ? 'closure holds' : 'see per-cell D3 above');
console.log(`\nVERDICT: D1=${d1 ? 'PASS' : 'FAIL'} D2=${d2 ? 'PASS' : 'FAIL'} (${zeroSteps.join(', ') || 'none'}) D3=${d3ok ? 'PASS' : 'FAIL'} -> ${d1 && d2 && d3ok ? 'DIAG-GO' : 'DIAG NO-GO'}`);
console.log(`RESULT: ${pass} PASS / ${fail} FAIL`);
process.exit(d1 && d2 && d3ok ? 0 : 1);
