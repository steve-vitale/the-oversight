// test-rotragged-b.js — proof for scripts/analyze-rotragged-b.js.
//
// T1: synthetic classification covers identical / down-sharp / down-mild /
//     up-mild / up-sharp / degenerate (both kinds) / up-from-zero /
//     down-to-zero, exactly per the pre-registered rules.
// T2: synthetic attribution covers numerator-driven / denominator-driven /
//     both / zero-crossing branches.
// T3: real corpora completeness (64/64 per-seed files each), no fatal
//     errors, class counts and medians reproduce the prior runs' values.
// T4: analyzer refuses a bad anchor tag and ignores sweep summaries.
// Zero src/js game changes; analyzer + test + evidence only.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { classifySeed, attributeSeed, analyze, loadCorpus } = require('./analyze-rotragged-b.js');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + e.message); }
}
// Cell builder: rotFresh, rotPreserved, days, depri default 0.
function cell(fresh, pres, days, depri) {
  return { rotFreshKcal: fresh, rotPreservedKcal: pres, daysAlive: days,
    depriKcal: depri || 0, national: true, waveReach: [1, 2],
    deathCauses: {}, policy: 'leadfeast', plentydepri: 0, depositgate: 1,
    seed: 0, anchorCommit: 'x' };
}
function four(p0, p1, c0, c1) {
  return { parentPd0: p0, parentPd1: p1, commitPd0: c0, commitPd1: c1 };
}

// T1 classification.
check('T1 identical: equal ratios', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(200, 0, 100), cell(100, 0, 100), cell(200, 0, 100)));
  assert.strictEqual(r.cls, 'identical');
});
check('T1 down sharp: step 0.25', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(400, 0, 100), cell(100, 0, 100), cell(100, 0, 100)));
  assert.strictEqual(r.cls, 'down'); assert.strictEqual(r.magnitude, 'sharp');
});
check('T1 down mild: step 0.8', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(500, 0, 100), cell(100, 0, 100), cell(400, 0, 100)));
  assert.strictEqual(r.cls, 'down'); assert.strictEqual(r.magnitude, 'mild');
});
check('T1 up mild: step 1.5', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(200, 0, 100), cell(100, 0, 100), cell(300, 0, 100)));
  assert.strictEqual(r.cls, 'up'); assert.strictEqual(r.magnitude, 'mild');
});
check('T1 up sharp: step 5', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(100, 0, 100), cell(100, 0, 100), cell(500, 0, 100)));
  assert.strictEqual(r.cls, 'up'); assert.strictEqual(r.magnitude, 'sharp');
});
check('T1 degenerate undefined-ratio: pd0 rot 0 on commit', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(200, 0, 100), cell(0, 0, 100), cell(200, 0, 100)));
  assert.strictEqual(r.cls, 'degenerate'); assert.strictEqual(r.reason, 'undefined-ratio');
});
check('T1 degenerate pd1-zero-both', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(0, 0, 100), cell(100, 0, 100), cell(0, 0, 100)));
  assert.strictEqual(r.cls, 'degenerate'); assert.strictEqual(r.reason, 'pd1-rot-zero-both');
});
check('T1 up from zero', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(0, 0, 100), cell(100, 0, 100), cell(50, 0, 100)));
  assert.strictEqual(r.cls, 'up'); assert.strictEqual(r.magnitude, 'up-from-zero');
});
check('T1 down to zero', () => {
  const r = classifySeed(four(cell(100, 0, 100), cell(200, 0, 100), cell(100, 0, 100), cell(0, 0, 100)));
  assert.strictEqual(r.cls, 'down'); assert.strictEqual(r.magnitude, 'sharp'); assert.strictEqual(r.step, 0);
});

// T2 attribution.
check('T2 numerator-driven: pd1 falls, pd0 flat', () => {
  const c = four(cell(100, 0, 100), cell(400, 0, 100), cell(100, 0, 100), cell(100, 0, 100));
  assert.strictEqual(attributeSeed(c, 'down'), 'numerator-driven');
});
check('T2 denominator-driven: pd0 rises, pd1 flat', () => {
  const c = four(cell(100, 0, 100), cell(200, 0, 100), cell(400, 0, 100), cell(200, 0, 100));
  assert.strictEqual(attributeSeed(c, 'down'), 'denominator-driven');
});
check('T2 both: pd1 falls and pd0 rises (down)', () => {
  const c = four(cell(100, 0, 100), cell(400, 0, 100), cell(200, 0, 100), cell(200, 0, 100));
  assert.strictEqual(attributeSeed(c, 'down'), 'both');
});
check('T2 both up: pd0 falls and pd1 rises', () => {
  const c = four(cell(400, 0, 100), cell(100, 0, 100), cell(100, 0, 100), cell(400, 0, 100));
  assert.strictEqual(attributeSeed(c, 'up'), 'both');
});
check('T2 zero-crossing: pd1 rot to zero (down)', () => {
  const c = four(cell(100, 0, 100), cell(200, 0, 100), cell(100, 0, 100), cell(0, 0, 100));
  assert.ok(attributeSeed(c, 'down').includes('zero-crossing'));
});
check('T2 non-moved seeds get n/a attribution', () => {
  const c = four(cell(100, 0, 100), cell(200, 0, 100), cell(100, 0, 100), cell(200, 0, 100));
  assert.strictEqual(attributeSeed(c, 'identical'), 'n/a');
  assert.strictEqual(attributeSeed(c, 'degenerate'), 'n/a');
});

// T3 real corpora.
check('T3 primary corpus 64/64, counts 9/5/1/1, medians reproduce leg2decide', () => {
  const { rows, mP, mC, step, fatal } = analyze('evidence/2026-10-24/leg2decide-b-corpus', 9266, 9281);
  assert.deepStrictEqual(fatal, []);
  assert.strictEqual(rows.length, 16);
  const counts = {};
  for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
  assert.deepStrictEqual(counts, { down: 5, identical: 9, degenerate: 1, up: 1 });
  assert.strictEqual(mP.toFixed(3), '0.487');
  assert.strictEqual(mC.toFixed(3), '0.196');
  assert.strictEqual(step.toFixed(3), '0.404');
  const moved = rows.filter((r) => r.cls === 'down' || r.cls === 'up');
  assert.ok(moved.every((r) => r.attr && r.attr !== 'n/a'), 'every moved seed attributed');
});
check('T3 cross-check corpus 64/64, counts 5/4/3/4, medians reproduce rotdecide-govern', () => {
  const { rows, mP, mC, step, fatal } = analyze('evidence/2026-10-24/rotdecide-govern-b-corpus', 9310, 9325);
  assert.deepStrictEqual(fatal, []);
  assert.strictEqual(rows.length, 16);
  const counts = {};
  for (const r of rows) counts[r.cls] = (counts[r.cls] || 0) + 1;
  assert.deepStrictEqual(counts, { degenerate: 4, identical: 5, down: 4, up: 3 });
  assert.strictEqual(mP.toFixed(3), '0.298');
  assert.strictEqual(mC.toFixed(3), '0.192');
  assert.strictEqual(step.toFixed(3), '0.645');
});
check('T3 primary identical seeds are cell-identical; cross-check ratio-identical includes depri-only movers', () => {
  const prim = analyze('evidence/2026-10-24/leg2decide-b-corpus', 9266, 9281).rows;
  assert.ok(prim.filter((r) => r.cls === 'identical').every((r) => r.cellsIdentical));
  const cross = analyze('evidence/2026-10-24/rotdecide-govern-b-corpus', 9310, 9325).rows;
  const ratioIdent = cross.filter((r) => r.cls === 'identical');
  assert.ok(ratioIdent.some((r) => !r.cellsIdentical), 'at least one ratio-identical seed moved at cell level');
});

// T4 refusal + ignore rules.
check('T4 bad anchor tag is fatal; sweep summaries ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rotragged-test-'));
  const P = '1f24a4ef04a857d33138fd0845cfa83df688285c';
  const C = '75fdd92587ad9d83bb12f05da535cdfb49255835';
  const mk = (short, pd, seed, hash) => {
    const d = { seed, policy: 'leadfeast', plentydepri: pd, depositgate: 1,
      daysAlive: 100, villageDays: 900, rotFreshKcal: 100, rotPreservedKcal: 0,
      depriKcal: 0, deathCauses: {}, national: true, table: false, win: false,
      waveReach: [1, 2], medianSurvival: null, anchorCommit: hash };
    fs.writeFileSync(path.join(dir, `leg2drift-b-${short}-pd${pd}-dg1-leadfeast-s${seed}.json`), JSON.stringify(d));
  };
  mk('1f24a4ef', 0, 9901, P); mk('1f24a4ef', 1, 9901, P);
  mk('75fdd925', 0, 9901, C); mk('75fdd925', 1, 9901, 'deadbeef-bad-tag');
  fs.writeFileSync(path.join(dir, 'sweep-junk.json'), JSON.stringify({ junk: true }));
  const { errors, missing } = loadCorpus(dir, 9901, 9901);
  const fatal = errors.filter((e) => !e.startsWith('unexpected filename')).concat(missing);
  assert.ok(fatal.some((f) => /anchor tag mismatch/.test(f)), 'bad tag must be fatal');
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
