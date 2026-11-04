// test-holdbeatfix-20261104.js — proof tests for arm sim-holdbeatfix-b.
// Stage 1 (pure): pilot analyzer semantics — cost-bar clauses, starvation
// counting, hold-number stripping in trajectory diffs. Stage 2 (live,
// appended with the fix commit): recordWaveKill ordering probe — the log
// entry must already be present when the kill's own unlock check runs —
// across player / wild / companion / pyrrhic / duplicate / _attrKills-off
// paths, with counters/ledger/codex side effects pinned unchanged.
// Usage: node scripts/test-holdbeatfix-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'holdbeatfix-analyze-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
function pilot(seed, over) {
  return Object.assign({ seed: seed, days: 100, endReason: 'survived', won: false,
    scaleRank: 'village', maxWave: 4, endUnlockedWave: 4, peakAfterEndCall: 4,
    deathEvents: [], beatEvents: [], killEvents: [], daily: [], gateCalls: [],
    standingLines: [], instrumentErrors: [] }, over || {});
}
function sum(out) { return AN.summarizePilot(out); }

ok('summarizePilot: starvation counted, causes pooled, outcome categories', function () {
  const s = sum(pilot(1, { days: 81, endReason: 'village-lost',
    deathEvents: [{ cause: 'starvation', player: false }, { cause: 'starvation', player: true }, { cause: 'combat', player: false }] }));
  assert.strictEqual(s.starvation, 2);
  assert.strictEqual(s.deathTotal, 3);
  assert.strictEqual(s.outcome, 'lost');
  assert.strictEqual(sum(pilot(2, { endReason: 'survived' })).outcome, 'survived');
  assert.strictEqual(sum(pilot(3, { won: true, endReason: 'survived' })).outcome, 'won');
});

ok('compareLegs: all clauses pass on a clean band', function () {
  const base = [1, 2, 3, 4].map(function (s) { return sum(pilot(s, { days: 100, deathEvents: [{ cause: 'starvation' }] })); });
  const fixed = [1, 2, 3, 4].map(function (s) { return sum(pilot(s, { days: 100, deathEvents: [{ cause: 'starvation' }] })); });
  const cmp = AN.compareLegs(base, fixed, {});
  assert.strictEqual(cmp.clauses.a_totals, true);
  assert.strictEqual(cmp.clauses.b_armOnly, true);
  assert.strictEqual(cmp.clauses.c_median, true);
  assert.strictEqual(cmp.clauses.d_noNewClass, true);
  assert.strictEqual(cmp.clauses.e_noFlip, true);
  assert.strictEqual(cmp.clauses.all, true);
});

ok('compareLegs: each failing clause detected', function () {
  const mk = function (starv, days, end) {
    return sum(pilot(1, { days: days, endReason: end,
      deathEvents: Array.from({ length: starv }, function () { return { cause: 'starvation' }; }) }));
  };
  const base = [mk(0, 100, 'survived')];
  let cmp = AN.compareLegs(base, [mk(3, 100, 'survived')], {});
  assert.strictEqual(cmp.clauses.a_totals, false);
  assert.strictEqual(cmp.clauses.b_armOnly, false);
  cmp = AN.compareLegs(base, [mk(0, 70, 'survived')], {});
  assert.strictEqual(cmp.clauses.c_median, false);
  cmp = AN.compareLegs(base, [sum(pilot(1, { days: 100, endReason: 'survived', deathEvents: [{ cause: 'drowned' }] }))], {});
  assert.strictEqual(cmp.clauses.d_noNewClass, false);
  cmp = AN.compareLegs(base, [mk(0, 100, 'village-lost')], {});
  assert.strictEqual(cmp.clauses.e_noFlip, false);
});

ok('trajectoryDiff: hold-beat numbers ignored, everything else compared', function () {
  const a = pilot(1, { beatEvents: [{ day: 5, kind: 'hold', seq: 9, beatVeterans: 0, momentVeterans: 0, line: 'blood your fighters (0 of 2 veterans)' }],
    standingLines: [{ day: 5, via: 'sysSay', seq: 9, line: 'blood your fighters (0 of 2 veterans)' }],
    killEvents: [{ day: 5, mid: 'eulogy' }], daily: [{ day: 5, peak: 4 }] });
  const b = pilot(1, { beatEvents: [{ day: 5, kind: 'hold', seq: 9, beatVeterans: 1, momentVeterans: 1, line: 'blood your fighters (1 of 2 veterans)' }],
    standingLines: [{ day: 5, via: 'sysSay', seq: 9, line: 'blood your fighters (1 of 2 veterans)' }],
    killEvents: [{ day: 5, mid: 'eulogy' }], daily: [{ day: 5, peak: 4 }] });
  assert.deepStrictEqual(AN.trajectoryDiff(a, b), []);
  const c = pilot(1, { killEvents: [{ day: 5, mid: 'spool' }], daily: [{ day: 5, peak: 4 }] });
  const diffs = AN.trajectoryDiff(a, c);
  assert.ok(diffs.some(function (d) { return d.indexOf('killEvents') === 0; }), 'kill change reported: ' + diffs.join('; '));
});

console.log('PASS ' + pass + '/' + pass + ' (pure stage; live stage appended with the fix)');
