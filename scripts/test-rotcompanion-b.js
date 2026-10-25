// test-rotcompanion-b.js — proof for scripts/analyze-rotcompanion-b.js.
//
// Proves, in order:
//  (1) the companion metric computation on hand-computed cases
//      (abs rate, ratio, step, every classification incl. degenerate
//      handling and the flat-equality rule);
//  (2) reproduction of the rotragged classification split on BOTH
//      existing corpora (same membership, plus the mixed class for
//      the both-pushes seeds rotragged attributed as "both");
//  (3) reproduction of both corpora's governing ratio medians as a
//      CHECK (standing verdicts are not re-judged here).
// Usage: node scripts/test-rotcompanion-b.js
// Exits non-zero on any failed assertion. Reads only per-seed files.
'use strict';
const assert = require('assert');
const path = require('path');
const {
  classifyCompanion, absRot, totalRot, loadCorpus, analyze, companionVerdict,
} = require('./analyze-rotcompanion-b');

function cell(rotFresh, rotPreserved, daysAlive, extra) {
  return Object.assign({
    rotFreshKcal: rotFresh, rotPreservedKcal: rotPreserved, daysAlive,
    depriKcal: 0, national: false, waveReach: [],
  }, extra || {});
}
function cells(p0, p1, c0, c1) {
  return { parentPd0: p0, parentPd1: p1, commitPd0: c0, commitPd1: c1 };
}

// (1a) abs rate: (3000 + 1000) / 50 * 100 = 8000.
assert.strictEqual(absRot(cell(3000, 1000, 50)), 8000);
assert.strictEqual(totalRot(cell(3000, 1000, 50)), 4000);
assert.strictEqual(absRot(cell(0, 0, 0)), null);
assert.strictEqual(absRot(cell(100, 0, null)), null);

// (1b) genuine: pd1 falls 20000 -> 10000, pd0 flat 10000. r 2 -> 1, step 0.5.
let cl = classifyCompanion(cells(
  cell(10000, 0, 100), cell(20000, 0, 100),
  cell(10000, 0, 100), cell(10000, 0, 100)));
assert.strictEqual(cl.cls, 'genuine');
assert.strictEqual(cl.step, 0.5);

// (1c) denominator-driven: pd0 rises 10000 -> 40000, pd1 flat 20000. r 2 -> 0.5, step 0.25.
cl = classifyCompanion(cells(
  cell(10000, 0, 100), cell(20000, 0, 100),
  cell(40000, 0, 100), cell(20000, 0, 100)));
assert.strictEqual(cl.cls, 'denominator-driven');
assert.strictEqual(cl.step, 0.25);

// (1d) flat-pd1 + rising-pd0 is denominator-driven, NOT genuine (9275 shape).
cl = classifyCompanion(cells(
  cell(41541, 0, 100), cell(43743, 0, 100),
  cell(115793, 0, 100), cell(43743, 0, 100)));
assert.strictEqual(cl.cls, 'denominator-driven');

// (1e) mixed: pd1 falls AND pd0 rises (9317 shape).
cl = classifyCompanion(cells(
  cell(19418, 0, 100), cell(48902, 0, 100),
  cell(206166, 0, 100), cell(22796, 0, 100)));
assert.strictEqual(cl.cls, 'mixed');
assert.ok(cl.step < 0.1);

// (1f) identical: all four cells equal.
const same0 = cell(5000, 0, 100);
const same1 = cell(9000, 0, 100);
cl = classifyCompanion(cells(same0, same1, cell(5000, 0, 100), cell(9000, 0, 100)));
assert.strictEqual(cl.cls, 'identical');
assert.strictEqual(cl.step, 1);

// (1g) degenerate (a): pd0 rot 0 on parent -> ratio undefined.
cl = classifyCompanion(cells(
  cell(0, 0, 100), cell(25439, 0, 100),
  cell(0, 0, 100), cell(25439, 0, 100)));
assert.strictEqual(cl.cls, 'degenerate');
assert.strictEqual(cl.reason, 'undefined-ratio');
assert.strictEqual(cl.step, null);

// (1h) degenerate (b): pd1 rot 0 on BOTH anchors, pd0 > 0.
cl = classifyCompanion(cells(
  cell(8000, 0, 100), cell(0, 0, 100),
  cell(8000, 0, 100), cell(0, 0, 100)));
assert.strictEqual(cl.cls, 'degenerate');
assert.strictEqual(cl.reason, 'pd1-rot-zero-both');

// (1i) up: r 1 -> 2, step 2.
cl = classifyCompanion(cells(
  cell(10000, 0, 100), cell(10000, 0, 100),
  cell(10000, 0, 100), cell(20000, 0, 100)));
assert.strictEqual(cl.cls, 'up');
assert.strictEqual(cl.step, 2);

// (1j) up-from-zero: parent pd1 rot 0 (ratio 0), commit pd1 > 0.
cl = classifyCompanion(cells(
  cell(10000, 0, 100), cell(0, 0, 100),
  cell(10000, 0, 100), cell(5000, 0, 100)));
assert.strictEqual(cl.cls, 'up');
assert.strictEqual(cl.magnitude, 'up-from-zero');
assert.strictEqual(cl.step, null);

// (1k) down-to-zero: commit pd1 rot 0, pd0 flat -> genuine, step 0.
cl = classifyCompanion(cells(
  cell(10000, 0, 100), cell(23830, 0, 100),
  cell(10000, 0, 100), cell(0, 0, 100)));
assert.strictEqual(cl.cls, 'genuine');
assert.strictEqual(cl.step, 0);

// (1l) companion verdict rule.
assert.strictEqual(companionVerdict(true, 100, 90, { genuine: 2, 'denominator-driven': 1, mixed: 0 }), 'GENUINE');
assert.strictEqual(companionVerdict(true, 100, 110, { genuine: 2, 'denominator-driven': 1, mixed: 0 }), 'DENOMINATOR-DRIVEN');
assert.strictEqual(companionVerdict(true, 100, 100, { genuine: 2, 'denominator-driven': 1, mixed: 0 }), 'DENOMINATOR-DRIVEN');
assert.strictEqual(companionVerdict(true, 100, 90, { genuine: 1, 'denominator-driven': 2, mixed: 1 }), 'MIXED');
assert.strictEqual(companionVerdict(false, 100, 90, { genuine: 2, 'denominator-driven': 0, mixed: 0 }), 'n/a (governing verdict not STEP)');

// (2) + (3) Corpus reproduction. Corpus dirs are relative to this script's repo root.
const root = path.join(__dirname, '..');
function checkCorpus(dir, lo, hi, expect) {
  const { cells, errors, missing, fileCount } = loadCorpus(path.join(root, dir), lo, hi);
  assert.strictEqual(fileCount, 64, `${dir}: expected 64 per-seed files, got ${fileCount}`);
  assert.deepStrictEqual(missing, [], `${dir}: missing cells`);
  const fatal = errors.filter((e) => !e.startsWith('unexpected filename'));
  assert.deepStrictEqual(fatal, [], `${dir}: loader errors`);
  void cells;
  const res = analyze(path.join(root, dir), lo, hi);
  assert.deepStrictEqual(res.fatal, [], `${dir}: analyzer fatal`);
  assert.strictEqual(res.rows.length, 16, `${dir}: expected 16 seeds`);
  assert.strictEqual(res.counts.ambiguous || 0, 0, `${dir}: ambiguous seeds must be 0`);
  for (const [seed, cls] of Object.entries(expect.bySeed)) {
    const row = res.rows.find((r) => r.seed === Number(seed));
    assert.ok(row, `${dir}: seed ${seed} missing`);
    assert.strictEqual(row.cls, cls, `${dir}: seed ${seed} expected ${cls}, got ${row.cls}`);
  }
  assert.deepStrictEqual(res.counts, expect.counts, `${dir}: counts`);
  // Governing median reproduction CHECK (tolerance 0.002 for 3-decimal prints).
  assert.ok(Math.abs(res.mP - expect.mP) < 0.002, `${dir}: M(parent) ${res.mP} vs ${expect.mP}`);
  assert.ok(Math.abs(res.mC - expect.mC) < 0.002, `${dir}: M(commit) ${res.mC} vs ${expect.mC}`);
  assert.ok(Math.abs(res.step - expect.step) < 0.002, `${dir}: step ${res.step} vs ${expect.step}`);
  return res;
}

// Primary: rotragged membership — 2 numerator-driven (genuine), 3
// denominator-driven, 0 mixed; identical 9, up 1, degenerate 1.
const primary = checkCorpus('evidence/2026-10-24/leg2decide-b-corpus', 9266, 9281, {
  bySeed: {
    9266: 'genuine', 9267: 'identical', 9268: 'degenerate', 9269: 'genuine',
    9270: 'identical', 9271: 'identical', 9272: 'identical', 9273: 'identical',
    9274: 'denominator-driven', 9275: 'denominator-driven', 9276: 'identical',
    9277: 'denominator-driven', 9278: 'identical', 9279: 'identical',
    9280: 'identical', 9281: 'up',
  },
  counts: { genuine: 2, identical: 9, degenerate: 1, 'denominator-driven': 3, up: 1 },
  mP: 0.487, mC: 0.196, step: 0.404,
});
// Cross-check: 1 genuine (9313), 1 denominator-driven (9315), 2 mixed
// (9316 zero-crossing both, 9317 both); identical 5, up 3, degenerate 4.
const cross = checkCorpus('evidence/2026-10-24/rotdecide-govern-b-corpus', 9310, 9325, {
  bySeed: {
    9310: 'degenerate', 9311: 'identical', 9312: 'degenerate', 9313: 'genuine',
    9314: 'identical', 9315: 'denominator-driven', 9316: 'mixed', 9317: 'mixed',
    9318: 'identical', 9319: 'identical', 9320: 'up', 9321: 'degenerate',
    9322: 'up', 9323: 'up', 9324: 'identical', 9325: 'degenerate',
  },
  counts: { degenerate: 4, identical: 5, genuine: 1, 'denominator-driven': 1, mixed: 2, up: 3 },
  mP: 0.298, mC: 0.192, step: 0.645,
});

// Ratio-identical but NOT cell-identical seeds stay visible (rotragged nuance).
for (const row of [cross.rows.find((r) => r.seed === 9318), cross.rows.find((r) => r.seed === 9324)]) {
  assert.strictEqual(row.cls, 'identical');
  assert.strictEqual(row.cellsIdentical, false);
}
// Degenerate reasons split correctly on the cross-check.
assert.strictEqual(cross.rows.find((r) => r.seed === 9310).reason, 'undefined-ratio');
assert.strictEqual(cross.rows.find((r) => r.seed === 9321).reason, 'pd1-rot-zero-both');

console.log('test-rotcompanion-b: all assertions passed');
console.log(`primary: counts=${JSON.stringify(primary.counts)} medAbs pd0 ${primary.medAbs.pd0Parent.toFixed(0)}->${primary.medAbs.pd0Commit.toFixed(0)} pd1 ${primary.medAbs.pd1Parent.toFixed(0)}->${primary.medAbs.pd1Commit.toFixed(0)} companion-if-STEP=${companionVerdict(true, primary.medAbs.pd1Parent, primary.medAbs.pd1Commit, primary.down)}`);
console.log(`cross: counts=${JSON.stringify(cross.counts)} medAbs pd0 ${cross.medAbs.pd0Parent.toFixed(0)}->${cross.medAbs.pd0Commit.toFixed(0)} pd1 ${cross.medAbs.pd1Parent.toFixed(0)}->${cross.medAbs.pd1Commit.toFixed(0)} companion-if-STEP=${companionVerdict(true, cross.medAbs.pd1Parent, cross.medAbs.pd1Commit, cross.down)}`);
