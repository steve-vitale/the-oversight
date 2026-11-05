// test-approachlive-20261105.js — proof for arm sim-approachlive-b.
// (1) Bus unit tests on fixtures: counter snapshots, delta math, per-fight
// rollups (marks, post-firing blocked run, frozen-wait bound).
// (2) Live smoke: the approachlive driver on seed 99601, 2 days, both
// legs, into /tmp (OUTDIR override — never the judged corpus dir):
// asserts the output shape (fallbackCalls array, fallbackTotals,
// per-exposure fallback rollups where exposures exist) and zero
// instrument errors. The smoke is tooling verification, NOT a judged
// leg: the judged panel re-runs 99601-99612 fresh with the committed
// tooling. Run: node scripts/test-approachlive-20261105.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const BUS = require('./approachlive-bus-20261105');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok - ' + name); }

// --- (1) bus unit tests -------------------------------------------------
function call(fightId, before, after, opts) {
  const o = opts || {};
  return {
    fightId: fightId, day: 100, round: o.round || 2, playerTurn: true,
    mids: o.mids || ['influencer'],
    monsterBefore: o.monsterBefore || 'm_0:4,6:322:a',
    monsterAfter: o.monsterAfter || 'm_0:4,6:322:a',
    playerBefore: o.playerBefore || [4, 4], playerAfter: o.playerAfter || [4, 4],
    before: before, after: after,
    delta: { marks: after.marks - before.marks, waits: after.waits - before.waits,
      repicks: after.repicks - before.repicks, stuck: after.stuck - before.stuck },
  };
}
const Z = { marks: 0, waits: 0, repicks: 0, stuck: 0 };
function c(o) { return { marks: o.m || 0, waits: o.w || 0, repicks: o.r || 0, stuck: o.s || 0 }; }

check('snapCounters defaults missing ctx fields to 0', function () {
  assert.deepStrictEqual(BUS.snapCounters({}), { marks: 0, waits: 0, repicks: 0, stuck: 0 });
  assert.deepStrictEqual(BUS.snapCounters(null), { marks: 0, waits: 0, repicks: 0, stuck: 0 });
  assert.deepStrictEqual(BUS.snapCounters({ approachFallbackMarks: 2, approachFallbackWaits: 5 }),
    { marks: 2, waits: 5, repicks: 0, stuck: 0 });
});

check('rollup: 3 stuck turns mark, repick moves, post-firing run 0', function () {
  const calls = [
    call('f1', c({}), c({ s: 1 })),
    call('f1', c({ s: 1 }), c({ s: 2 })),
    call('f1', c({ s: 2 }), c({ m: 1, s: 3 })), // mark on call 3
    call('f1', c({ m: 1, s: 3 }), c({ m: 1, s: 3, r: 1 }), { playerAfter: [4, 5] }), // repick moves
    call('f1', c({ m: 1, s: 3, r: 1 }), c({ m: 1, s: 3, r: 1 })), // strike turn, no deltas
  ];
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.marks, 1);
  assert.strictEqual(r.stuck, 3);
  assert.strictEqual(r.repicks, 1);
  assert.strictEqual(r.firstMarkCallIdx, 2);
  assert.strictEqual(r.postFiringMaxRun, 0);
  assert.strictEqual(r.frozenWaitLoop, false);
});

check('rollup: frozen-wait loop — 11 waits, no repick, monster still', function () {
  const calls = [
    call('f2', c({}), c({ s: 1 })),
    call('f2', c({ s: 1 }), c({ s: 2 })),
    call('f2', c({ s: 2 }), c({ m: 1, s: 3 })),
  ];
  let w = 0;
  for (let i = 0; i < 11; i++) {
    // wait branch: 5 waits -> re-probe fail (re-mark) -> 5 waits -> ...
    const before = c({ m: 1 + Math.floor(i / 6), s: 3, w: w });
    w++;
    const after = c({ m: 1 + Math.floor((i + 1) / 6), s: 3, w: w });
    calls.push(call('f2', before, after));
  }
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.marks >= 1, true);
  assert.strictEqual(r.waitsAfterMark, 11);
  assert.strictEqual(r.repicksAfterMark, 0);
  assert.strictEqual(r.geoChangedAfterMark, false);
  assert.strictEqual(r.frozenWaitLoop, true);
});

check('rollup: 9 waits is under the 10-wait frozen bound', function () {
  const calls = [
    call('f3', c({}), c({ s: 1 })),
    call('f3', c({ s: 1 }), c({ s: 2 })),
    call('f3', c({ s: 2 }), c({ m: 1, s: 3 })),
  ];
  let w = 0;
  for (let i = 0; i < 9; i++) {
    const before = c({ m: 1, s: 3, w: w });
    w++;
    calls.push(call('f3', before, c({ m: 1, s: 3, w: w })));
  }
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.waitsAfterMark, 9);
  assert.strictEqual(r.frozenWaitLoop, false);
});

check('rollup: waits with a monster move after the mark are not frozen', function () {
  const calls = [
    call('f4', c({}), c({ s: 1 })),
    call('f4', c({ s: 1 }), c({ s: 2 })),
    call('f4', c({ s: 2 }), c({ m: 1, s: 3 })),
  ];
  let w = 0;
  for (let i = 0; i < 11; i++) {
    const before = c({ m: 1, s: 3, w: w });
    w++;
    // monster steps closer on the 6th wait cycle call
    const mon = (i === 5) ? 'm_0:4,5:322:a' : 'm_0:4,6:322:a';
    calls.push(call('f4', before, c({ m: 1, s: 3, w: w }), { monsterAfter: mon }));
  }
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.waitsAfterMark, 11);
  assert.strictEqual(r.geoChangedAfterMark, true);
  assert.strictEqual(r.frozenWaitLoop, false);
});

check('rollup: post-firing blocked run counts 4 frozen stuck calls', function () {
  const calls = [
    call('f5', c({}), c({ s: 1 })),
    call('f5', c({ s: 1 }), c({ s: 2 })),
    call('f5', c({ s: 2 }), c({ m: 1, s: 3 })),
    call('f5', c({ m: 1, s: 3 }), c({ m: 1, s: 4 })),
    call('f5', c({ m: 1, s: 4 }), c({ m: 1, s: 5 })),
    call('f5', c({ m: 1, s: 5 }), c({ m: 1, s: 6 })),
    call('f5', c({ m: 1, s: 6 }), c({ m: 1, s: 7 })),
  ];
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.postFiringMaxRun, 4);
  assert.strictEqual(r.frozenWaitLoop, false);
});

check('rollup: a move after the mark resets the post-firing run', function () {
  const calls = [
    call('f6', c({}), c({ s: 1 })),
    call('f6', c({ s: 1 }), c({ s: 2 })),
    call('f6', c({ s: 2 }), c({ m: 1, s: 3 })),
    call('f6', c({ m: 1, s: 3 }), c({ m: 1, s: 4 })),
    call('f6', c({ m: 1, s: 4 }), c({ m: 1, s: 4, r: 1 }), { playerAfter: [4, 5], playerBefore: [4, 4] }),
    call('f6', c({ m: 1, s: 4, r: 1 }), c({ m: 1, s: 5, r: 1 }), { playerAfter: [4, 5], playerBefore: [4, 5] }),
  ];
  const r = BUS.rollupFight(calls);
  // One frozen stuck call (call 4), then the repick moves (run resets),
  // then one more stuck call: max run 1.
  assert.strictEqual(r.postFiringMaxRun, 1);
});

check('rollup: no mark means no post-firing run and no frozen loop', function () {
  const calls = [call('f7', c({}), c({ s: 1 })), call('f7', c({ s: 1 }), c({ s: 2 }))];
  const r = BUS.rollupFight(calls);
  assert.strictEqual(r.firstMarkCallIdx, -1);
  assert.strictEqual(r.postFiringMaxRun, 0);
  assert.strictEqual(r.frozenWaitLoop, false);
});

// --- (2) live smoke: driver, 2 days, seed 99601, both legs, /tmp -------
function smoke(policy, runTag) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'approachlive-smoke-' + runTag + '-'));
  const env = Object.assign({}, process.env, {
    DAYS: '2', SEEDS: '99601', POLICY: policy, RUN: runTag, OUTDIR: dir,
  });
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'approachlive-driver-20261105.js')],
    { env: env, cwd: REPO, timeout: 300000 }).toString();
  assert.ok(out.indexOf('"seed":99601') >= 0, 'smoke log names seed 99601, got: ' + out.slice(0, 300));
  const file = path.join(dir, 'approachlive-s99601-' + runTag + '.json');
  assert.ok(fs.existsSync(file), 'smoke wrote ' + file);
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.strictEqual(j.seed, 99601);
  assert.strictEqual(j.policy, policy);
  assert.ok(Array.isArray(j.fallbackCalls), 'fallbackCalls array present');
  assert.ok(j.fallbackTotals && typeof j.fallbackTotals.marks === 'number', 'fallbackTotals present');
  assert.ok(Array.isArray(j.fallbackMarkedNonExposure), 'fallbackMarkedNonExposure present');
  assert.strictEqual((j.instrumentErrors || []).length, 0,
    'instrument errors: ' + JSON.stringify(j.instrumentErrors));
  for (const ex of (j.exposures || [])) {
    assert.ok(ex.fallback && typeof ex.fallback.marks === 'number',
      'exposure seq ' + ex.seq + ' carries a fallback rollup');
  }
  // The bus must be consistent: run totals equal the sum of per-call deltas.
  let m = 0, w = 0, rp = 0, st = 0;
  for (const rec of j.fallbackCalls) {
    m += rec.delta.marks; w += rec.delta.waits; rp += rec.delta.repicks; st += rec.delta.stuck;
  }
  assert.strictEqual(j.fallbackTotals.marks, m, 'marks total matches call deltas');
  assert.strictEqual(j.fallbackTotals.waits, w, 'waits total matches call deltas');
  assert.strictEqual(j.fallbackTotals.repicks, rp, 'repicks total matches call deltas');
  assert.strictEqual(j.fallbackTotals.stuck, st, 'stuck total matches call deltas');
  fs.rmSync(dir, { recursive: true, force: true });
  return j;
}

check('live smoke: baseline leg writes a fallback-instrumented corpus file', function () {
  smoke('competent', 'baseline');
});

check('live smoke: armed leg writes a fallback-instrumented corpus file', function () {
  smoke('approachfall', 'armed');
});

console.log('test-approachlive-20261105: ALL PASS (' + passed + ' checks)');
