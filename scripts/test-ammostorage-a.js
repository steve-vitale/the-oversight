#!/usr/bin/env node
// scripts/test-ammostorage-a.js — proof for sim-ammostorage-a.
// Re-derives EVERY summary number from the corpus files
// (evidence/2026-10-26/perseed-ammostorage-a/*.json + summary.json)
// and from the volley-a cross-check corpus, deterministically.
// No harness, no RNG, no writes. Exit 1 on any FAIL.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-ammostorage-a');
const VOLLEY = path.join(REPO, 'evidence', '2026-10-26', 'perseed-volley-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const AMMO_IDS = ['arrow', 'bolt', 'stone', 'heartseeker_arrows', 'fusion_cell'];
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };
let PASS = 0, FAIL = 0;
function check(name, cond, detail) {
  if (cond) { PASS++; }
  else { FAIL++; console.log(`FAIL ${name} :: ${detail || ''}`); }
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}
function sumType(rows, fn) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  for (const r of rows) { const v = fn(r) || {}; for (const id of AMMO_IDS) out[id] += (v[id] | 0); }
  return out;
}
function sectionTotal(storage) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  try {
    const secs = (storage && storage.stashSections) || {};
    for (const name of Object.keys(secs)) for (const id of AMMO_IDS) out[id] += (secs[name][id] | 0);
  } catch (e) {}
  return out;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const rows = {};
for (const seed of SEEDS) {
  for (const pid of ['baseline', 'armed']) {
    rows[`${seed}-${pid}`] = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-${pid}.json`), 'utf8'));
  }
}
// 1. Corpus shape.
check('corpus: 16 rows', Object.keys(rows).length === 16, String(Object.keys(rows).length));
for (const seed of SEEDS) {
  const b = rows[`${seed}-baseline`], a = rows[`${seed}-armed`];
  check(`seed ${seed} armed has ammostorage rows`, Array.isArray(a.ammostorage.fieldFights) && Array.isArray(a.ammostorage.dailySnapshots), '');
  check(`seed ${seed} baseline snapshot-only`, b.note === 'snapshot-only: no event lists on the baseline arm', b.note || '');
  check(`seed ${seed} G2 days`, b.days === a.days, `${b.days} vs ${a.days}`);
  check(`seed ${seed} G2 gameDays`, b.gameDays === a.gameDays, `${b.gameDays} vs ${a.gameDays}`);
  check(`seed ${seed} G2 ts`, eq(b.ts, a.ts), JSON.stringify(b.ts) + ' vs ' + JSON.stringify(a.ts));
  check(`seed ${seed} G2 starvation`, b.starvationDeaths === a.starvationDeaths, `${b.starvationDeaths} vs ${a.starvationDeaths}`);
  check(`seed ${seed} G2 faced`, eq(b.faced, a.faced), '');
  check(`seed ${seed} G2 kills`, eq((b.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]), (a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])), '');
  check(`seed ${seed} diag clean`, (a.ammostorage.diag.errs | 0) === 0 && (a.ammostorage.diag.overflow.fieldFights | 0) === 0 && (a.ammostorage.diag.overflow.dailySnapshots | 0) === 0 && (a.ammostorage.noRecord | 0) === 0,
    `errs=${a.ammostorage.diag.errs} overflow=${JSON.stringify(a.ammostorage.diag.overflow)} noRecord=${a.ammostorage.noRecord}`);
  check(`seed ${seed} every row gated + storage`, a.ammostorage.fieldFights.every(f => !!f.gate && !!f.storage), '');
  check(`seed ${seed} daily snapshots cover days`, a.ammostorage.dailySnapshots.length >= 1 && a.ammostorage.dailySnapshots.length <= a.days + 2,
    `snaps=${a.ammostorage.dailySnapshots.length} days=${a.days}`);
}
// 2. Volley-a cross-check, recomputed from BOTH corpora.
let totalField = 0, totalField4 = 0, volleyTotalField = 0, volleyTotalField4 = 0;
for (const seed of SEEDS) {
  const a = rows[`${seed}-armed`];
  const v = JSON.parse(fs.readFileSync(path.join(VOLLEY, `s${seed}-armed.json`), 'utf8'));
  const vf = (v.volley && v.volley.fieldFights) || [];
  const mf = a.ammostorage.fieldFights;
  const vf4 = vf.filter(f => (f.wave | 0) === 4), mf4 = mf.filter(f => (f.wave | 0) === 4);
  totalField += mf.length; totalField4 += mf4.length;
  volleyTotalField += vf.length; volleyTotalField4 += vf4.length;
  check(`seed ${seed} field count vs volley-a`, mf.length === vf.length, `${mf.length} vs ${vf.length}`);
  check(`seed ${seed} field4 count vs volley-a`, mf4.length === vf4.length, `${mf4.length} vs ${vf4.length}`);
  check(`seed ${seed} gatesAll vs volley-a`, eq(counter(mf, f => f.gate), counter(vf, f => f.gate)),
    JSON.stringify(counter(mf, f => f.gate)) + ' vs ' + JSON.stringify(counter(vf, f => f.gate)));
  check(`seed ${seed} gates4 vs volley-a`, eq(counter(mf4, f => f.gate), counter(vf4, f => f.gate)), '');
  check(`seed ${seed} volleyDmg vs volley-a`, mf.reduce((t, f) => t + (f.volleyDmg | 0), 0) === vf.reduce((t, f) => t + (f.volleyDmg | 0), 0), '');
}
check('band field total vs volley-a', totalField === volleyTotalField, `${totalField} vs ${volleyTotalField}`);
check('band field4 total vs volley-a', totalField4 === volleyTotalField4, `${totalField4} vs ${volleyTotalField4}`);
check('band field total is 1179', totalField === 1179, String(totalField));
check('band field4 total is 12', totalField4 === 12, String(totalField4));
// 3. Summary band table, re-derived.
function bandOf(pid) {
  const rs = SEEDS.map(s => rows[`${s}-${pid}`]);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}
const bb = bandOf('baseline'), ab = bandOf('armed');
check('summary baselineBand', eq(summary.baselineBand, bb), JSON.stringify(summary.baselineBand) + ' vs ' + JSON.stringify(bb));
check('summary armedBand', eq(summary.armedBand, ab), '');
const diff = {
  wins: bb.won - BAND1920.wins, nationalEver: bb.nationalEver - BAND1920.nationalEver,
  nationalFinal: bb.nationalFinal - BAND1920.nationalFinal, table: bb.table - BAND1920.table,
  entered: bb.entered - BAND1920.entered, wave4: bb.wave4 - BAND1920.wave4, wave5: bb.wave5 - BAND1920.wave5,
  medianDays: bb.medianDays - BAND1920.medianDays, deaths: bb.deathTotal - BAND1920.deaths,
  starvation: bb.starvationTotal - BAND1920.starvation,
};
check('summary diffVs1920', eq(summary.gates.diffVs1920, diff), JSON.stringify(summary.gates.diffVs1920) + ' vs ' + JSON.stringify(diff));
check('summary rebaselineExact', summary.gates.rebaselineExact === Object.keys(diff).every(k => diff[k] === 0), '');
check('summary g2Pass', summary.gates.g2Pass === true, String(summary.gates.g2Pass));
check('summary corpusOk', summary.gates.corpusOk === true, String(summary.gates.corpusOk));
// 4. Storage aggregates, re-derived.
const allF = SEEDS.flatMap(s => rows[`${s}-armed`].ammostorage.fieldFights);
const allF4 = allF.filter(f => (f.wave | 0) === 4);
const allSnaps = SEEDS.flatMap(s => rows[`${s}-armed`].ammostorage.dailySnapshots);
check('summary fieldAll', summary.fieldAll === allF.length, `${summary.fieldAll} vs ${allF.length}`);
check('summary field4', summary.field4 === allF4.length, '');
check('summary bandGatesAll', eq(summary.bandGatesAll, counter(allF, f => f.gate)), '');
check('summary bandGates4', eq(summary.bandGates4, counter(allF4, f => f.gate)), '');
check('summary G7 zero', (summary.bandGatesAll['G7-fires'] | 0) === 0, String(summary.bandGatesAll['G7-fires']));
check('summary fighterCarried', eq(summary.bandFighterCarriedByType, sumType(allF, f => f.fighterCarriedByType)), JSON.stringify(summary.bandFighterCarriedByType));
check('summary fighterCarriedFights', summary.bandFighterCarriedFights === allF.filter(f => AMMO_IDS.some(id => (f.fighterCarriedByType[id] | 0) > 0)).length, '');
check('summary fighterStashed', eq(summary.bandFighterStashedByType, sumType(allF, f => f.fighterStashedByType)), '');
check('summary stashStoneFights', summary.bandStashStoneFights === allF.filter(f => ((f.storage.stashMaterials.stone) | 0) > 0).length, '');
check('summary otherCarried', eq(summary.bandOtherCarriedByType, sumType(allF, f => f.storage.otherPersonsCarried)), '');
check('summary otherStashed', eq(summary.bandOtherStashedByType, sumType(allF, f => f.storage.otherPersonsStashed)), '');
check('summary sectionAmmo', eq(summary.bandSectionAmmoByType, sumType(allF, f => sectionTotal(f.storage))), '');
check('summary pantryAmmo', eq(summary.bandPantryAmmoByType, sumType(allF, f => f.storage.pantry.byType)), '');
check('summary scholarAmmo', eq(summary.bandScholarAmmoByType, sumType(allF, f => f.storage.scholarInventory)), '');
check('summary scholarFights', summary.bandScholarFights === allF.filter(f => !!f.isScholar).length, '');
check('summary dailySnapshots', summary.bandDailySnapshots === allSnaps.length, `${summary.bandDailySnapshots} vs ${allSnaps.length}`);
const snapArrowBolt = allSnaps.filter(s => {
  const st = s.storage || {};
  const pools = [sectionTotal(st), st.otherPersonsCarried || {}, st.otherPersonsStashed || {}, st.scholarInventory || {}, (st.pantry && st.pantry.byType) || {}];
  return pools.some(p => ((p.arrow | 0) > 0 || (p.bolt | 0) > 0));
}).length;
check('summary snapDaysWithArrowBolt', summary.bandSnapDaysWithArrowBolt === snapArrowBolt, `${summary.bandSnapDaysWithArrowBolt} vs ${snapArrowBolt}`);
const snapStone = allSnaps.filter(s => ((s.storage.stashMaterials.stone) | 0) > 0).length;
check('summary snapDaysWithStone', summary.bandSnapDaysWithStone === snapStone, '');
// 5. Verdict rule, re-derived.
const coverageAll = volleyTotalField ? totalField / volleyTotalField : 0;
const coverage4 = volleyTotalField4 ? totalField4 / volleyTotalField4 : 0;
const expectVerdict = (coverageAll >= 0.95 && coverage4 === 1) ? 'DIAG-GO' : 'DIAG-NO-GO';
check('summary verdict', summary.verdict === expectVerdict, `${summary.verdict} vs ${expectVerdict} (coverageAll=${coverageAll} coverage4=${coverage4})`);
check('summary coverageAll', summary.volleyCrossCheck.coverageAll === coverageAll, '');
check('summary coverage4', summary.volleyCrossCheck.coverage4 === coverage4, '');
// 6. Wave-4 rows carry full storage detail (the 100% bar is per-row, not just count).
check('wave-4 rows all carry storage+fighter detail', allF4.every(f => !!f.storage && !!f.fighterCarriedByType && !!f.fighterStashedByType), '');
console.log(`\nAMMOSTORAGE-A PROOF: ${PASS} PASS, ${FAIL} FAIL`);
if (FAIL) process.exit(1);
