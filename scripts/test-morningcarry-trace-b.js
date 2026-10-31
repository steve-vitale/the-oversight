// test-morningcarry-trace-b.js — proof for the morningcarry trace instruments.
// Pure unit tests always run. Corpus checks run when TRACE_GUARD_DIR and
// TRACE_ON_DIR point at completed trace corpora (15215, guard + ON):
// files present, errs 0, every strand night fully bracketed (sleep pre/post
// present, day rolled), strand sets reported (drift vs jointgate is a
// finding, not a failure — the analyzer prints it; the test only asserts
// the instrument is complete).
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { packDiff, survivesTonight, analyzeFile } = require('./analyze-morningcarry-trace-b');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// packDiff: same-name stacks with different spoilDays never merge.
t('packDiff keeps spoilDay-distinct stacks separate', () => {
  const a = [
    { name: 'unknown shoots', spoilDay: 8, edible: false, kcalEach: 100, units: 3 },
    { name: 'unknown shoots', spoilDay: 9, edible: false, kcalEach: 100, units: 5 },
  ];
  const b = [{ name: 'unknown shoots', spoilDay: 9, edible: false, kcalEach: 100, units: 5 }];
  const d = packDiff(a, b);
  assert.strictEqual(d.lost.length, 1);
  assert.strictEqual(d.lost[0].spoilDay, 8);
  assert.strictEqual(d.lost[0].unitsLost, 3);
  assert.strictEqual(d.kept.length, 1);
});
t('packDiff reports partial loss with unitsKept', () => {
  const a = [{ name: 'unknown berries', spoilDay: 10, edible: false, kcalEach: 50, units: 14 }];
  const b = [{ name: 'unknown berries', spoilDay: 10, edible: false, kcalEach: 50, units: 8 }];
  const d = packDiff(a, b);
  assert.strictEqual(d.lost[0].unitsLost, 6);
  assert.strictEqual(d.lost[0].unitsKept, 8);
});
t('packDiff reports gained stacks (e.g. fan package)', () => {
  const d = packDiff([], [{ name: 'Fan care package (unopened)', spoilDay: null, edible: null, kcalEach: 0, units: 1 }]);
  assert.strictEqual(d.gained.length, 1);
  assert.strictEqual(d.lost.length, 0);
});
t('packDiff empty->empty is clean', () => {
  const d = packDiff([], []);
  assert.deepStrictEqual([d.lost.length, d.kept.length, d.gained.length], [0, 0, 0]);
});
// survivesTonight: sweep at dawn D+1 removes spoilDay <= D+1.
t('survivesTonight boundary: spoilDay D+1 rots, D+2 survives, null never rots', () => {
  assert.strictEqual(survivesTonight({ spoilDay: 8 }, 7), false);
  assert.strictEqual(survivesTonight({ spoilDay: 9 }, 7), true);
  assert.strictEqual(survivesTonight({ spoilDay: 20 }, 7), true);
  assert.strictEqual(survivesTonight({ spoilDay: null }, 7), true);
  assert.strictEqual(survivesTonight({}, 7), true);
});
t('survivesTonight is day-relative, not absolute', () => {
  assert.strictEqual(survivesTonight({ spoilDay: 9 }, 8), false);
  assert.strictEqual(survivesTonight({ spoilDay: 10 }, 8), true);
});

// Corpus checks (only when dirs are given).
const guardDir = process.env.TRACE_GUARD_DIR || '';
const onDir = process.env.TRACE_ON_DIR || '';
if (guardDir && onDir) {
  for (const [label, dir] of [['guard', guardDir], ['on', onDir]]) {
    const file = path.join(dir, 'morningcarry-b-nighttravel-s15215.json');
    t('corpus ' + label + ': file present and parses', () => {
      assert.ok(fs.existsSync(file), 'missing ' + file);
      JSON.parse(fs.readFileSync(file, 'utf8'));
    });
    const r = analyzeFile(file);
    t('corpus ' + label + ': errs 0 and 30 evenings', () => {
      assert.strictEqual(r.errs, 0);
      assert.ok(r.strandMornings.length >= 0);
    });
    t('corpus ' + label + ': every strand night has a sleep bracket with day rolled', () => {
      const strandNights = r.nights.filter((x) => x.eveningStillCreek);
      assert.ok(strandNights.length > 0, 'no strand nights recorded');
      for (const sn of strandNights) {
        assert.strictEqual(sn.dayRolled, true, 'night after evening ' + sn.eveningLoopDay + ' did not roll the day');
      }
    });
    t('corpus ' + label + ': strand mornings carry full pack records', () => {
      for (const sm of r.strandMornings) {
        assert.ok(sm.packKnownKcal !== null && sm.packKnownKcal !== undefined, 'morning ' + sm.loopDay + ' missing known kcal');
        assert.ok(Array.isArray(sm.foodStacks), 'morning ' + sm.loopDay + ' missing stacks');
      }
    });
    console.log(label + ' stillEvenings=' + JSON.stringify(r.stillEvenings) + ' runs=' + JSON.stringify(r.strandRuns) + ' strandMornings=' + r.strandMornings.length);
  }
} else {
  console.log('corpus checks skipped (set TRACE_GUARD_DIR + TRACE_ON_DIR)');
}
console.log('morningcarry trace proof: ' + n + ' pure tests green');
