#!/usr/bin/env node
// test-stafffallback-b.js — proof test for sim-stafffallback-b.
// Reads ONLY the pilot per-seed corpus and asserts:
//  (1) instrument integrity: all 32 files parse, arm/base/policy/contrast
//      tags match, batches >= resolutions, villager cooking >= preserving,
//      invHaulActions > 0 (non-vacuous haul), base tag identical across arms;
//  (2) the pre-registered GO bar (G1/G2/G3) as computed by the analyzer's
//      own rules (recomputed here independently of the analyzer script);
//  (3) the 9754 reproduction: control 9754 cells show the onzero capture
//      signature (cook calls > 0, cook ok == 0, cook deeds == 0).
// Exit 0 iff every check passes. A GO verdict requires all three groups
// green; a KILLED/NO-GO verdict shows up here as the GO-bar group failing
// with the failing condition named — that failure IS the verdict, and the
// exit code is 1 in that case (the evidence file names it, not this test).
'use strict';
const fs = require('fs');
const path = require('path');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-25', 'sim-stafffallback-b-corpus');
const SEEDS = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const SIDES = ['pd0', 'pd1'];
let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log('PASS ' + name); }
  else { fail += 1; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
};
function load(arm, side, seed) {
  const f = path.join(CORPUS, `stafffallback-b-${arm}-${side}-dg1-leadfeast-s${seed}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
const cells = {};
for (const arm of ['off', 'on']) for (const side of SIDES) for (const seed of SEEDS) {
  const r = load(arm, side, seed);
  cells[`${arm}/${side}/${seed}`] = r;
  check(`file parses + tags ${arm}/${side}/${seed}`,
    r.arm === arm && r.baseCommit && /^[0-9a-f]{7,40}$/.test(r.baseCommit) && r.policy === 'leadfeast' && r.depositgate === 1 && r.seed === seed && r.plentydepri === (side === 'pd1' ? 1 : 0),
    `arm=${r.arm} base=${r.baseCommit} policy=${r.policy} seed=${r.seed} pd=${r.plentydepri}`);
  check(`instrument bounds ${arm}/${side}/${seed}`,
    r.preserveVillagerBatches >= r.preserveVillagerResolutions && r.cookingDeeds >= r.preserveVillagerResolutions && r.invHaulActions > 0,
    `batches=${r.preserveVillagerBatches} res=${r.preserveVillagerResolutions} cookDeeds=${r.cookingDeeds} invHaul=${r.invHaulActions}`);
}
const bases = new Set(Object.values(cells).map(r => r.baseCommit));
check('single shared base tag across all 32 cells', bases.size === 1, [...bases].join(','));
function stats(r) {
  const aa = r.assignAgg || {};
  let denom = 0, numer = 0;
  for (const sd of (r.staffDays || [])) {
    const pre = Object.values(sd.asgPre || {}).some(t => t === 'cook');
    const post = Object.values(sd.asgPost || {}).some(t => t === 'cook');
    if (!pre && (sd.freshKcalPre || 0) > 1500) { denom += 1; if (post) numer += 1; }
  }
  let starv = 0;
  for (const [k, v] of Object.entries(r.deathCauses || {})) if (/starv/.test(k)) starv += v;
  return { calls: aa.cookCalls || 0, ok: aa.cookOk || 0, rate: denom ? numer / denom : null, denom, numer, res: r.preserveVillagerResolutions || 0, days: r.daysAlive || 0, starv };
}
const classCells = [];
for (const side of SIDES) for (const seed of SEEDS) {
  const o = stats(cells[`off/${side}/${seed}`]);
  if (o.calls > 0 && o.ok === 0) classCells.push({ side, seed });
}
check('9754-class cells exist (capture reproduced in pilot control)', classCells.length > 0, `class=${JSON.stringify(classCells)}`);
const c9754pd0 = stats(cells['off/pd0/9754']);
const c9754pd1 = stats(cells['off/pd1/9754']);
check('9754 control capture signature pd0 (calls>0, ok==0, deeds==0)',
  c9754pd0.calls > 0 && c9754pd0.ok === 0 && cells['off/pd0/9754'].cookingDeeds === 0,
  `calls=${c9754pd0.calls} ok=${c9754pd0.ok} deeds=${cells['off/pd0/9754'].cookingDeeds}`);
check('9754 control capture signature pd1 (calls>0, ok==0, deeds==0)',
  c9754pd1.calls > 0 && c9754pd1.ok === 0 && cells['off/pd1/9754'].cookingDeeds === 0,
  `calls=${c9754pd1.calls} ok=${c9754pd1.ok} deeds=${cells['off/pd1/9754'].cookingDeeds}`);
// GO bar, recomputed independently.
let g1ok = classCells.length > 0;
for (const c of classCells) {
  const s = stats(cells[`on/${c.side}/${c.seed}`]);
  if (!(s.ok > 0 && s.rate !== null && s.rate >= 0.5)) g1ok = false;
}
check('G1 every class cell armed ok>0 and staffRate>=0.5', g1ok, `class=${JSON.stringify(classCells.map(c => `${c.seed}/${c.side} ok=${stats(cells[`on/${c.side}/${c.seed}`]).ok} rate=${stats(cells[`on/${c.side}/${c.seed}`]).rate}`))}`);
let g2ok = classCells.length > 0;
for (const c of classCells) if (!(stats(cells[`on/${c.side}/${c.seed}`]).res > 0)) g2ok = false;
check('G2 every class cell armed resolutions>0', g2ok);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
let g3ok = true;
for (const side of SIDES) {
  const offS = SEEDS.reduce((t, sd) => t + stats(cells[`off/${side}/${sd}`]).starv, 0);
  const onS = SEEDS.reduce((t, sd) => t + stats(cells[`on/${side}/${sd}`]).starv, 0);
  const offM = median(SEEDS.map(sd => stats(cells[`off/${side}/${sd}`]).days));
  const onM = median(SEEDS.map(sd => stats(cells[`on/${side}/${sd}`]).days));
  const ok = onS <= offS + 2 && onM >= 0.8 * offM;
  if (!ok) g3ok = false;
  check(`G3 ${side} starv on<=off+2 and median on>=0.8*off`, ok, `starv off=${offS} on=${onS}; median off=${offM} on=${onM}`);
}
console.log(`\n${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
