#!/usr/bin/env node
// test-strandbank2-b.js — proof for the strandbank instrument adaptation
// (sim-strandbank-b). Pure checks always run; corpus checks run with
// --corpus after the basecheck / equivalence / sweep / rerun legs exist.
// Pure: (a) census + strand-run functions on synthetic evening sequences
// (consecutive-run breaks, rescued interleaves, non-creek buckets,
// haven evenings); (b) secondary away-wood-short counting; (c) splitter
// round-trip + bad-line rejection. Corpus: (d) RUNNER EQUIVALENCE —
// stdout-runner legs for 15215 guard+ON deep-equal the verbatim
// basecheck legs on evenings, mornings, nights, errs, daysAlive,
// endReason; (e) sweep completeness (10 seeds x 2 legs, errs 0);
// (f) DETERMINISM — ON rerun files byte-identical to sweep ON files;
// (g) census recomputation matches the stored census JSON.
// Usage: node scripts/test-strandbank2-b.js [--corpus]
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { strandOf } = require('./analyze-fedevening-b');
const { strandChecked, awayWoodShort, analyzeSeed, loadDir } = require('./analyze-strandbank-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function ev(loopDay, bucket, rescued, inside, tile, eveningWood) {
  return { loopDay, woodcarry: { bucket, rescued: !!rescued }, inside, tile, eveningWood };
}
function pure() {
  // (a) strand runs: consecutive still, break on non-creek, rescued flush.
  let d = { evenings: [
    ev(1, 'creek', false), ev(2, 'creek', false), ev(3, 'haven', false),
    ev(4, 'creek', false), ev(5, 'creek', true), ev(6, 'creek', false),
    ev(7, 'creek', false),
  ] };
  let s = strandOf(d);
  check('strand runs split by haven + rescued', JSON.stringify(s.runs) === JSON.stringify([[1, 2], [4], [6, 7]]), s.runs);
  check('strand still list', JSON.stringify(s.still) === JSON.stringify([1, 2, 4, 6, 7]), s.still);
  check('strand rescued list', JSON.stringify(s.rescued) === JSON.stringify([5]), s.rescued);
  check('strand creek list', JSON.stringify(s.creek) === JSON.stringify([1, 2, 4, 5, 6, 7]), s.creek);
  // Non-creek buckets never count; empty evenings give empty runs.
  d = { evenings: [ev(1, 'haven', false), ev(2, null, false), ev(3, 'creek', false)] };
  s = strandOf(d);
  check('non-creek buckets excluded', JSON.stringify(s.runs) === JSON.stringify([[3]]), s.runs);
  d = { evenings: [] };
  s = strandOf(d);
  check('empty evenings empty census', s.creek.length === 0 && s.runs.length === 0, s);
  // (a2) haven check: a haven evening carrying a creek bucket (the
  // 16506 travel-refused artifact) is NOT a creek evening under the
  // prereg definition, and it breaks runs rather than merging them.
  d = { evenings: [
    ev(1, 'creek', false, false, 'creek', 4), ev(2, 'creek', true, true, 'haven', 4),
    ev(3, 'creek', false, false, 'creek', 4), ev(4, 'creek', false, false, 'creek', 4),
  ] };
  s = strandChecked(d);
  check('haven evening not a creek evening', JSON.stringify(s.creek) === JSON.stringify([1, 3, 4]) && s.rescued.length === 0, s);
  check('haven evening splits runs', JSON.stringify(s.runs) === JSON.stringify([[1], [3, 4]]), s.runs);
  check('raw strandOf counts the artifact (contrast)', JSON.stringify(strandOf(d).rescued) === JSON.stringify([2]), strandOf(d));
  // (b) secondary away-wood-short: haven excluded, wood>=4 excluded,
  // wood null excluded, away + wood<4 included.
  d = { evenings: [
    ev(1, 'creek', false, true, 'haven', 0),
    ev(2, 'creek', false, false, 'creek', 2),
    ev(3, 'creek', false, false, 'creek', 4),
    ev(4, 'creek', false, false, 'creek', null),
    ev(5, 'creek', false, false, 'forest', 0),
  ] };
  check('awayWoodShort definition', JSON.stringify(awayWoodShort(d)) === JSON.stringify([2, 5]), awayWoodShort(d));
  // (c) splitter round-trip + bad-line rejection (scratch inside worktree, removed after).
  const scratch = path.join(__dirname, '..', '.strandbank-test-scratch');
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    fs.mkdirSync(scratch, { recursive: true });
    const line1 = JSON.stringify({ seed: 1, evenings: [{ loopDay: 1 }], mornings: [], nights: [] });
    const line2 = JSON.stringify({ seed: 2, evenings: [], mornings: [], nights: [] });
    let r = spawnSync('node', [path.join(__dirname, 'split-strandbank2-jsonl-b.js'), scratch], { input: line1 + '\n' + line2 + '\n', encoding: 'utf8' });
    check('splitter exit 0', r.status === 0, r.stderr);
    const f1 = JSON.parse(fs.readFileSync(path.join(scratch, 'morningcarry-b-nighttravel-s1.json'), 'utf8'));
    const f2 = JSON.parse(fs.readFileSync(path.join(scratch, 'morningcarry-b-nighttravel-s2.json'), 'utf8'));
    check('splitter round-trip seed 1', f1.seed === 1 && f1.evenings.length === 1, f1);
    check('splitter round-trip seed 2', f2.seed === 2 && f2.evenings.length === 0, f2);
    r = spawnSync('node', [path.join(__dirname, 'split-strandbank2-jsonl-b.js'), scratch], { input: '{"seed": 3}\n', encoding: 'utf8' });
    check('splitter rejects no-evenings line', r.status === 2, r.status);
    r = spawnSync('node', [path.join(__dirname, 'split-strandbank2-jsonl-b.js'), scratch], { input: 'not json\n', encoding: 'utf8' });
    check('splitter rejects bad json', r.status === 2, r.status);
  } finally {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }
}
const EV = 'evidence/2026-10-31/';
function corpus() {
  const root = path.join(__dirname, '..', EV);
  const load = (dir) => JSON.parse(fs.readFileSync(path.join(root, dir, fs.readdirSync(path.join(root, dir)).filter((x) => x.includes('15215'))[0]), 'utf8'));
  const EQ_FIELDS = ['evenings', 'mornings', 'nights', 'errs', 'daysAlive', 'endReason'];
  for (const leg of ['guard', 'on']) {
    const base = load('sim-strandbank-b-basecheck-' + leg);
    const eq = load('sim-strandbank-b-equiv-' + leg);
    for (const f of EQ_FIELDS) {
      check('equivalence ' + leg + ' field ' + f, JSON.stringify(base[f]) === JSON.stringify(eq[f]),
        f === 'errs' ? [base[f], eq[f]] : (f + ' differs'));
    }
    check('equivalence ' + leg + ' errCount 0', base.errCount === 0 && eq.errCount === 0, [base.errCount, eq.errCount]);
  }
  // Sweep completeness: 10 seeds x 2 legs, errs 0, 30 evenings each.
  const bank = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];
  for (const leg of ['guard', 'on']) {
    for (const seed of bank) {
      const fp = path.join(root, 'sim-strandbank-b-sweep-' + leg, 'morningcarry-b-nighttravel-s' + seed + '.json');
      const ok = fs.existsSync(fp);
      check('sweep file ' + leg + ' ' + seed, ok);
      if (ok) {
        const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
        check('sweep errs 0 ' + leg + ' ' + seed, d.errCount === 0, d.errCount);
        check('sweep 30 evenings ' + leg + ' ' + seed, d.evenings.length === 30, d.evenings.length);
      }
    }
  }
  // Determinism: ON rerun byte-identical to sweep ON.
  for (const seed of bank) {
    const a = path.join(root, 'sim-strandbank-b-sweep-on', 'morningcarry-b-nighttravel-s' + seed + '.json');
    const b = path.join(root, 'sim-strandbank-b-rerun-on', 'morningcarry-b-nighttravel-s' + seed + '.json');
    const ok = fs.existsSync(b);
    check('rerun file on ' + seed, ok);
    if (ok) check('determinism byte-identical on ' + seed, fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8'));
  }
  // Census recomputation matches stored census JSON.
  const stored = JSON.parse(fs.readFileSync(path.join(root, 'sim-strandbank-b-census.json'), 'utf8'));
  const g = loadDir(path.join(root, 'sim-strandbank-b-sweep-guard'));
  const o = loadDir(path.join(root, 'sim-strandbank-b-sweep-on'));
  let totalStill = 0;
  for (const seed of bank) { totalStill += g[seed].still.length + o[seed].still.length; }
  check('census totalStill recomputed', stored.totalStill === totalStill, [stored.totalStill, totalStill]);
  check('census seeds are the bank', JSON.stringify(stored.seeds) === JSON.stringify(bank), stored.seeds);
}
pure();
if (process.argv.includes('--corpus')) corpus();
console.log('test-strandbank2-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
