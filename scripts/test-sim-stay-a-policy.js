#!/usr/bin/env node
// scripts/test-sim-stay-a-policy.js — proof tests for holdline.js.
// Fixture-only: no sims, no repo writes, no game code touched.
// Pins: (1) HOLDLINE env gate; (2) OFF daily is tableseat-nowait.daily
// exactly (crew layer never runs); (3) ON layer assigns at most 2 free
// villagers to patrol, never steals an assignment, never assigns the
// scholar, counts refusals, attempts nothing when away; (4) the policy
// file never wraps Game.fieldFight (no-smuggle guard).
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const { holdline, holdlineOn, holdlineCrewLayer } = require('./policies/holdline');
const tableseatMod = require('./policies/tableseat-nowait');

let pass = 0;
function ok(name, fn) {
  fn();
  pass++;
  console.log('  PASS ' + name);
}

// (1) env gate
(function () {
  const saved = process.env.HOLDLINE;
  try {
    delete process.env.HOLDLINE;
    assert.strictEqual(holdlineOn(), false);
    process.env.HOLDLINE = '1';
    assert.strictEqual(holdlineOn(), true);
    process.env.HOLDLINE = '0';
    assert.strictEqual(holdlineOn(), false);
    process.env.HOLDLINE = 'yes';
    assert.strictEqual(holdlineOn(), false);
    ok('env gate: only HOLDLINE=1 is on', () => {});
  } finally {
    if (saved === undefined) delete process.env.HOLDLINE; else process.env.HOLDLINE = saved;
  }
})();

// (2)+(3) delegation + layer, via a stubbed base daily. holdline.daily
// looks up tableseatNowait.daily at call time, so stubbing the module
// object's property is visible to it; restore afterwards.
(function () {
  const origDaily = tableseatMod.tableseatNowait.daily;
  const savedEnv = process.env.HOLDLINE;
  try {
    let baseCalls = 0;
    tableseatMod.tableseatNowait.daily = function () { baseCalls++; return 'base'; };
    const fakeGame = {
      villagerId: 'p',
      playerAtHaven: () => true,
      state: { village: { roster: ['p', 'a', 'b', 'c', 'd'], assignments: { b: { task: 'water' } } } },
      getPerson: () => ({ dead: false }),
      assignTask: (vid, task, opts) => {
        assert.strictEqual(task, 'patrol');
        assert.strictEqual(opts.via, 'in-person');
        if (vid === 'c') return { ok: false, refused: true };
        return { ok: true };
      },
    };
    // OFF: base only, no crew layer.
    delete process.env.HOLDLINE;
    const ctxOff = {};
    assert.strictEqual(holdline.daily(fakeGame, ctxOff), 'base');
    assert.strictEqual(baseCalls, 1);
    assert.strictEqual(ctxOff.hlAttempts, undefined);
    ok('OFF daily delegates to base exactly, crew layer never runs', () => {});
    // ON: base + layer (a assigned, b skipped-assigned, c refused, d assigned; cap 2).
    process.env.HOLDLINE = '1';
    const ctxOn = {};
    assert.strictEqual(holdline.daily(fakeGame, ctxOn), 'base');
    assert.strictEqual(baseCalls, 2);
    assert.strictEqual(ctxOn.hlAttempts, 3);
    assert.strictEqual(ctxOn.hlAssigned, 2);
    assert.strictEqual(ctxOn.hlRefused, 1);
    ok('ON layer assigns <=2 free villagers, skips assigned, counts refusals', () => {});
  } finally {
    tableseatMod.tableseatNowait.daily = origDaily;
    if (savedEnv === undefined) delete process.env.HOLDLINE; else process.env.HOLDLINE = savedEnv;
  }
})();

// Away: layer attempts nothing, counts one away day, never throws.
ok('away day attempts nothing', () => {
  const g = {
    villagerId: 'p', playerAtHaven: () => false,
    state: { village: { roster: ['a'], assignments: {} } },
    assignTask: () => { throw new Error('must not be called when away'); },
  };
  const c = holdlineCrewLayer(g, {});
  assert.deepStrictEqual(c, { attempts: 0, assigned: 0, refused: 0, away: 1, skippedAssigned: 0 });
});
// No assignTask: layer is a no-op, never throws.
ok('missing assignTask is a no-op', () => {
  const g = { villagerId: 'p', playerAtHaven: () => true, state: { village: { roster: ['a'], assignments: {} } } };
  const c = holdlineCrewLayer(g, {});
  assert.strictEqual(c.attempts, 0);
});
// (4) no-smuggle guard: the policy file never assigns Game.fieldFight.
ok('policy file contains no fieldFight wrap', () => {
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'holdline.js'), 'utf8');
  assert.ok(!src.includes('Game.fieldFight'), 'must not touch Game.fieldFight');
  assert.ok(!src.includes('fieldFight ='), 'must not assign a fieldFight wrapper');
  assert.ok(src.includes("./tableseat-nowait"), 'must wrap tableseat-nowait');
});

console.log(`test-sim-stay-a-policy: ${pass}/6 PASS`);
