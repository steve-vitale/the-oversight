#!/usr/bin/env node
// Proof: the armor-cap test's re-baselined bands (finding #1832, prereg
// evidence/2026-11-06/sim-armorcap-b-prereg.md) are exactly what the prereg
// derivation rule produces from the fresh field corpus — no hand-widening.
//
// Recomputes, from the RAW per-seed corpus files (never trusting the
// summary file — it is cross-checked instead):
//   unarmored band per monster: [max(0, floor(m - M)), min(100, ceil(m + M))]
//     M = max(10, 2*SEM) over the 8 per-batch (6-fight) mean HP costs
//   tank avg-absorbed band per monster: [max(0, floor(m - M)), ceil(m + M)]
//     M = max(2, 2*SEM) over per-batch mean absorbed (landed hits only;
//     zero-hit batches excluded; no band if < 4 batches have hits)
// Then asserts scripts/test-armor-cap-20261009.js carries exactly those
// bands, runs 12 tank fights (was 4), and gates the hide-strictly-better
// check on unarmored damage dealt. Also asserts the direction-preservation
// stop rule: corpus pooled mean absorbed exceeds the K=20 references
// (hushwolf 6.2, belltoad 4) from finding #1832.
// Zero src/js touched. Exit 0 iff every assertion passes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CORPUS_DIR = path.join(ROOT, 'evidence', '2026-11-06', 'perseed-armorcap-b');
const TEST_FILE = path.join(ROOT, 'scripts', 'test-armor-cap-20261009.js');
const SEEDS = [20261009, 7, 424242, 20261106, 555, 12345, 999, 31337];
const MONS = ['hushwolf', 'belltoad', 'bulldozer', 'lockpick_raccoon'];
const TANK_MONS = ['hushwolf', 'bulldozer', 'belltoad'];
const K20_REF = { hushwolf: 6.2, belltoad: 4 }; // finding #1832

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function sd(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / (a.length - 1));
}
function parseBandObject(src, name) {
  const m = src.match(new RegExp('const ' + name + ' = \\{([^}]+)\\}'));
  if (!m) return null;
  const out = {};
  // Match each `name: [lo, hi]` pair directly — never split on commas,
  // the values themselves contain commas.
  for (const kv of m[1].matchAll(/(\w+): \[(\d+), ?(\d+)\]/g)) {
    out[kv[1]] = [parseInt(kv[2], 10), parseInt(kv[3], 10)];
  }
  return Object.keys(out).length ? out : null;
}

console.log('== Re-derive bands from the raw corpus ==');
const corpora = SEEDS.map(s => {
  const f = path.join(CORPUS_DIR, `armorcap-${s}.json`);
  check(`corpus file exists for seed ${s}`, fs.existsSync(f), f);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}).filter(Boolean);
check('all 8 corpus seeds present', corpora.length === 8, `${corpora.length}/8`);

const derived = { unarmored: {}, tank: {} };
if (corpora.length === 8) {
  for (const id of MONS) {
    const batchMeans = corpora.map(c => c.part2['spear'][id].batchMeanCost);
    const m = mean(batchMeans), s = sd(batchMeans), sem = s / Math.sqrt(batchMeans.length);
    const M = Math.max(10, 2 * sem);
    derived.unarmored[id] = [Math.max(0, Math.floor(m - M)), Math.min(100, Math.ceil(m + M))];
    console.log(`  unarmored ${id}: batchMeans=[${batchMeans.join(',')}] m=${m.toFixed(2)} sem=${sem.toFixed(2)} M=${M.toFixed(2)} -> band [${derived.unarmored[id]}]`);
  }
  for (const id of TANK_MONS) {
    const batchMeans = corpora.map(c => {
      const landed = c.tank[id].fights.flatMap(f => f.absorbs);
      return landed.length ? mean(landed) : null;
    }).filter(x => x !== null);
    if (batchMeans.length >= 4) {
      const m = mean(batchMeans), s = sd(batchMeans), sem = s / Math.sqrt(batchMeans.length);
      const M = Math.max(2, 2 * sem);
      derived.tank[id] = [Math.max(0, Math.floor(m - M)), Math.ceil(m + M)];
      console.log(`  tank ${id}: batchMeans=[${batchMeans.map(x => x.toFixed(2)).join(',')}] m=${m.toFixed(2)} sem=${sem.toFixed(2)} M=${M.toFixed(2)} -> band [${derived.tank[id]}] (${batchMeans.length} batches with hits)`);
    } else {
      derived.tank[id] = null;
      console.log(`  tank ${id}: only ${batchMeans.length} batches with hits — no band derived`);
    }
  }
}

console.log('== Summary file agrees with the recomputation ==');
{
  const sumPath = path.join(CORPUS_DIR, 'armorcap-corpus-summary.json');
  check('summary file exists', fs.existsSync(sumPath), sumPath);
  if (fs.existsSync(sumPath)) {
    const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
    check('summary seeds are the prereg seeds', JSON.stringify(sum.seeds) === JSON.stringify(SEEDS), JSON.stringify(sum.seeds));
    for (const id of MONS) check(`summary unarmored band ${id} matches recomputation`, JSON.stringify(sum.unarmoredBaseline[id].band) === JSON.stringify(derived.unarmored[id]), JSON.stringify(sum.unarmoredBaseline[id].band) + ' vs ' + JSON.stringify(derived.unarmored[id]));
    for (const id of TANK_MONS) check(`summary tank band ${id} matches recomputation`, JSON.stringify(sum.tank[id].band) === JSON.stringify(derived.tank[id]), JSON.stringify(sum.tank[id].band) + ' vs ' + JSON.stringify(derived.tank[id]));
  }
}

console.log('== Test file carries the derived bands ==');
const testSrc = fs.readFileSync(TEST_FILE, 'utf8');
{
  const expectBand = parseBandObject(testSrc, 'expectBand');
  check('expectBand parses from the test file', expectBand !== null);
  if (expectBand) for (const id of MONS) check(`test expectBand ${id} == derived [${derived.unarmored[id]}]`, JSON.stringify(expectBand[id]) === JSON.stringify(derived.unarmored[id]), JSON.stringify(expectBand[id]) + ' vs ' + JSON.stringify(derived.unarmored[id]));
  const tankBand = parseBandObject(testSrc, 'TANK_AVG_BAND');
  check('TANK_AVG_BAND parses from the test file', tankBand !== null);
  if (tankBand) for (const id of TANK_MONS) check(`test TANK_AVG_BAND ${id} == derived [${derived.tank[id]}]`, JSON.stringify(tankBand[id]) === JSON.stringify(derived.tank[id]), JSON.stringify(tankBand[id]) + ' vs ' + JSON.stringify(derived.tank[id]));
}

console.log('== Test file carries the guard redesign ==');
{
  const tankLoop = testSrc.match(/for \(let i = 0; i < (\d+); i\+\+\) abs\.push\(\.\.\.runTank\(id\)\)/);
  check('tank loop runs 12 fights (was 4)', tankLoop !== null && tankLoop[1] === '12', tankLoop ? tankLoop[1] : 'loop not found');
  check('no "> 0 hits in 4 fights" guard remains', !/hits landed in tank mode/.test(testSrc), 'old brittle guard still present');
  check('hide check is gated on unarmored damage dealt', /if \(un\.avgC > 0\) \{\s*\n?\s*check\(id \+ ': hide \(P=20\) strictly better than unarmored'/.test(testSrc), 'conditional hide check not found');
  check('per-hit checks gated on >= 3 hits', /if \(abs\.length >= 3\) \{/.test(testSrc), 'hit-count gate not found');
  check('avg-absorbed band check present', /avg absorbed in corpus band/.test(testSrc), 'band check not found');
}

console.log('== Direction preservation (stop rule, K=20 refs from #1832) ==');
{
  for (const id of ['hushwolf', 'belltoad']) {
    const allAbs = corpora.flatMap(c => c.tank[id].fights.flatMap(f => f.absorbs));
    const pooled = allAbs.length ? allAbs.reduce((a, b) => a + b, 0) / allAbs.length : 0;
    console.log(`  ${id}: pooled mean absorbed ${pooled.toFixed(2)} over ${allAbs.length} hits (K=20 ref ${K20_REF[id]})`);
    check(`${id}: corpus mean absorbed exceeds K=20 ref ${K20_REF[id]} (retune direction preserved)`, pooled > K20_REF[id], `pooled=${pooled.toFixed(2)}`);
  }
}

console.log('== Test-run consistency (default-seed batch inside the bands) ==');
{
  const d0 = corpora.find(c => c.seed === 20261009);
  check('default-seed corpus batch present', !!d0);
  if (d0) {
    for (const id of MONS) {
      const v = d0.part2['spear'][id].batchMeanCost;
      const [lo, hi] = derived.unarmored[id];
      check(`default-seed unarmored ${id} ${v} in [${lo},${hi}]`, v >= lo && v <= hi, `${v} not in [${lo},${hi}]`);
    }
    for (const id of TANK_MONS) {
      const all = d0.tank[id].fights.flatMap(f => f.absorbs);
      if (all.length && derived.tank[id]) {
        const avg = all.reduce((a, b) => a + b, 0) / all.length;
        const [lo, hi] = derived.tank[id];
        check(`default-seed tank avg ${id} ${avg.toFixed(2)} in [${lo},${hi}]`, avg >= lo && avg <= hi, `${avg.toFixed(2)} not in [${lo},${hi}]`);
      } else {
        console.log(`  ${id}: no landed hits in the default-seed tank batch — avg check vacuous`);
      }
    }
  }
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
