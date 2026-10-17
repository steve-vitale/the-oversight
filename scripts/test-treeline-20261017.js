#!/usr/bin/env node
// test-treeline-20261017.js — proof for the treeline answer layer
// (scripts/policies/treeline.js, sim-treeline arm, 2026-10-17).
//
// Proves the layer's DECISION (which verb, when) — the engine's hold
// outcome (0 kcal, no blood, opinion -3) is game code, measured for real
// by scripts/sweep-treeline-20261017.js on identical seeds.
//
// RED→GREEN: the same staged-raid fixtures run with the gate OFF (TREELINE
// unset) must NOT answer (RED: the beat survives, pantry untouched by the
// layer); with the gate ON (TREELINE=1) the strong-village fixture MUST
// answer 'hold' (GREEN) and the weak-village fixture must NOT answer
// (GREEN: left for the 800-kcal auto-resolve, which beats give/overrun).
//
// Usage: node scripts/test-treeline-20261017.js
'use strict';
const assert = require('assert');

// Gate-off must be the default: require with TREELINE unset.
delete process.env.TREELINE;
const TL = require('./policies/treeline');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  ok: ${name}`); }
  catch (e) { console.error(`  FAIL: ${name}\n    ${e.message}`); process.exitCode = 1; }
}

// makeGame(pending, rosterN): fake Game with engine-honest hold semantics
// (villageAgency.js answerRaidDefense 'hold' branch): roster >= raiders+1 →
// 'held', pending cleared, pantry untouched; else 'overrun'. The fake
// records which verb the POLICY chose — the layer's decision is the unit
// under test.
function makeGame(pending, rosterN) {
  const calls = [];
  return {
    calls,
    state: {
      scholar: { day: 10 },
      village: { roster: new Array(rosterN).fill('v') },
      pendingRaidDefense: pending ? {
        villageId: 'thornfield', champion: 'Mara', raiders: pending.raiders,
        demand: 2000, day: 9,
      } : null,
    },
    answerRaidDefense(how) {
      calls.push(how);
      const pr = this.state.pendingRaidDefense;
      if (!pr) return null;
      this.state.pendingRaidDefense = null;
      const theirs = (pr.raiders || []).length + 1;
      if (how === 'hold') return rosterN >= theirs ? 'held' : 'overrun';
      if (how === 'give') return 'gave';
      if (how === 'fight') return 'fought';
      return null;
    },
  };
}
const raid3 = { raiders: ['Ash', 'Bram', 'Cora'] }; // theirs = 4

console.log('== test-treeline-20261017 ==');

// runWrapped: drive the layer exactly as the harness does — through the
// withTreeline wrapper's daily (the gate lives in the wrapper, like
// seatdrive's driveSeat; answerRaid is the ungated driver).
function runWrapped(G, ctx) {
  const w = TL.withTreeline({ id: 'x', daily() {} }, 'x-treeline', 'test');
  w.daily(G, ctx || {});
}

// --- RED: gate off → the layer never answers, the beat survives ---
check('RED gate-off: staged raid (strong village) is NOT answered', () => {
  delete process.env.TREELINE;
  assert.strictEqual(TL.layerOn(), false);
  const G = makeGame(raid3, 12);
  const ctx = {};
  runWrapped(G, ctx);
  assert.deepStrictEqual(G.calls, [], 'gate off must not call answerRaidDefense');
  assert.ok(G.state.pendingRaidDefense, 'the beat must survive unanswered');
  assert.strictEqual(ctx.tlRaidsSeen, undefined, 'no counters when gated off');
});

// --- GREEN: gate on, strong village → hold ---
check('GREEN gate-on strong: answers hold, pantry untouched, beat cleared', () => {
  process.env.TREELINE = '1';
  assert.strictEqual(TL.layerOn(), true);
  const G = makeGame(raid3, 12);
  const ctx = {};
  runWrapped(G, ctx);
  assert.deepStrictEqual(G.calls, ['hold']);
  assert.strictEqual(G.state.pendingRaidDefense, null, 'beat answered and cleared');
  assert.strictEqual(ctx.tlHolds, 1);
  delete process.env.TREELINE;
});

// --- GREEN: gate on, weak village → no answer (auto-resolve is cheaper) ---
check('GREEN gate-on weak: roster 3 vs theirs 4 → NOT answered (left for 800 auto)', () => {
  process.env.TREELINE = '1';
  const G = makeGame(raid3, 3);
  const ctx = {};
  runWrapped(G, ctx);
  assert.deepStrictEqual(G.calls, [], 'weak village must not hold (overrun 1500 > auto 800)');
  assert.ok(G.state.pendingRaidDefense, 'the beat stays open for the auto-resolve');
  assert.strictEqual(ctx.tlSkippedWeak, 1);
  delete process.env.TREELINE;
});

// --- boundary: roster exactly equals theirs → hold wins (>=, per engine) ---
check('GREEN boundary: roster 4 vs theirs 4 → hold', () => {
  process.env.TREELINE = '1';
  const G = makeGame(raid3, 4);
  const ctx = {};
  runWrapped(G, ctx);
  assert.deepStrictEqual(G.calls, ['hold']);
  delete process.env.TREELINE;
});

// --- idempotency: answering twice answers once ---
check('idempotent: second answerRaid with no pending is a no-op', () => {
  process.env.TREELINE = '1';
  const G = makeGame(raid3, 12);
  const ctx = {};
  runWrapped(G, ctx);
  runWrapped(G, ctx);
  assert.deepStrictEqual(G.calls, ['hold'], 'one answer only');
  assert.strictEqual(ctx.tlHolds, 1);
  delete process.env.TREELINE;
});

// --- determinism: the answer consumes NO RNG (hold branch has no R() calls) ---
check('deterministic: answerRaid consumes zero Math.random draws', () => {
  process.env.TREELINE = '1';
  let draws = 0;
  const realRandom = Math.random;
  Math.random = function () { draws++; return realRandom(); };
  try {
    const G = makeGame(raid3, 12);
    runWrapped(G, {});
    assert.strictEqual(draws, 0, `hold decision must be RNG-free (drew ${draws})`);
  } finally { Math.random = realRandom; }
  delete process.env.TREELINE;
});

// --- composition: withTreeline wraps the real seatdrive stack, gate-off delegates ---
check('composition: withTreeline(leadseat) delegates base.upkeep/daily when gated off', () => {
  delete process.env.TREELINE;
  let up = 0, dn = 0;
  const fake = { id: 'x', upkeep() { up++; }, daily() { dn++; } };
  const w = TL.withTreeline(fake, 'x-treeline', 'test');
  const G = makeGame(raid3, 12);
  w.upkeep(G, {}); w.daily(G, {});
  assert.strictEqual(up, 1); assert.strictEqual(dn, 1);
  assert.deepStrictEqual(G.calls, [], 'gated off: no answer through the wrapper either');
  assert.ok(G.state.pendingRaidDefense, 'beat survives');
});

// --- the layer never chooses give or fight ---
check('never give/fight: all fixtures choose hold-or-nothing', () => {
  process.env.TREELINE = '1';
  for (const n of [0, 1, 2, 3, 4, 5, 8, 12, 24]) {
    const G = makeGame(raid3, n);
    runWrapped(G, {});
    for (const c of G.calls) assert.ok(c === 'hold', `roster ${n}: chose ${c}, want hold-or-nothing`);
  }
  delete process.env.TREELINE;
});

console.log(passed + ' checks ' + (process.exitCode ? 'WITH FAILURES' : 'GREEN'));
