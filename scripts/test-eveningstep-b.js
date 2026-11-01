#!/usr/bin/env node
// test-eveningstep-b.js — pure proof test for the evening-step leg
// decomposition analyzer (sim-eveningstep-b). No sims, no repo writes:
// the synthetic corpus dir lives under os.tmpdir().
// Usage: node scripts/test-eveningstep-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { legPathOf, eveClass, decidingLeg, pairDay, censusOfDir } = require('./analyze-eveningstep-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }

function eve(o) {
  return Object.assign({
    inside: false, insideTent: null, tile: 'forest_floor', mapPx: 5, mapPy: 3,
    havenPx: null, havenPy: null, roadActive: false, roadOnRoad: false,
    eveningOutcome: 'policy-no-record', travelledHome: false, inCombat: false,
  }, o);
}

// --- legPathOf: every outcome in the taxonomy ---
check('L0 no-step', () => assert.strictEqual(legPathOf(eve({})).path, 'L0-no-step'));
check('L1 guard game-over', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'game-over' })).path, 'L1-guard-game-over'));
check('L1 guard combat', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'blocked-combat', inCombat: true })).path, 'L1-guard-combat'));
check('L1 guard tent', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'blocked-tent', insideTent: true })).path, 'L1-guard-tent'));
check('L2 offer-no', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'out-of-reach' })).path, 'L2-offer-no'));
check('L3 hop-no', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'travel-refused' })).path, 'L3-hop-no'));
check('L3 hop-yes entry-yes completed', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'completed', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4 })).path, 'L3-hop-yes-entry-yes'));
check('L3 hop-yes entry-yes already-inside', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'already-inside', travelledHome: true, inside: true })).path, 'L3-hop-yes-entry-yes'));
check('L3 hop-yes entry-no walk-no-path', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'walk-no-path', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4 })).path, 'L3-hop-yes-entry-no'));
check('L3 hop-yes entry-no entry-refused', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'entry-refused', travelledHome: true })).path, 'L3-hop-yes-entry-no'));
check('L3 hop-yes entry-no no-go-inside-button', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'no-go-inside-button', travelledHome: true })).path, 'L3-hop-yes-entry-no'));
check('L4 entry-only completed', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'completed', tile: 'haven', mapPx: 4, mapPy: 4 })).path, 'L4-entry-only'));
check('L4 entry-no-only walk-no-path no travel', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'walk-no-path', tile: 'haven', mapPx: 4, mapPy: 4 })).path, 'L4-entry-no-only'));
check('LX arrived-combat', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'travel-arrived-combat', travelledHome: true })).path, 'LX-arrived-combat'));
check('LX hop-died', () => assert.strictEqual(legPathOf(eve({ eveningOutcome: 'travel-died' })).path, 'LX-hop-died'));
check('LX haven-unknown is surprise', () => { const r = legPathOf(eve({ eveningOutcome: 'haven-unknown' })); assert.strictEqual(r.path, 'LX-haven-unknown'); assert.strictEqual(r.surprise, true); });
check('LX step-error is surprise', () => { const r = legPathOf(eve({ eveningOutcome: 'step-error' })); assert.strictEqual(r.surprise, true); });
check('LX detour is surprise (gate OFF)', () => { const r = legPathOf(eve({ eveningOutcome: 'detour-stopped' })); assert.strictEqual(r.surprise, true); });
check('LX unknown outcome is surprise', () => { const r = legPathOf(eve({ eveningOutcome: 'something-new' })); assert.strictEqual(r.surprise, true); });
check('non-surprise paths are not surprise', () => {
  for (const o of ['policy-no-record', 'blocked-combat', 'out-of-reach', 'travel-refused', 'completed']) {
    assert.strictEqual(legPathOf(eve({ eveningOutcome: o })).surprise, false, o);
  }
});

// --- eveClass ---
check('eveClass inside true is haven', () => assert.strictEqual(eveClass(eve({ inside: true })), 'haven'));
check('eveClass tile haven is haven', () => assert.strictEqual(eveClass(eve({ tile: 'haven', mapPx: 4, mapPy: 4 })), 'haven'));
check('eveClass road is road not away', () => assert.strictEqual(eveClass(eve({ roadActive: true })), 'road'));
check('eveClass wild tile is away', () => assert.strictEqual(eveClass(eve({})), 'away'));

// --- decidingLeg ---
check('deciding hop with FAILED entry (17563 day 5 shape)', () => {
  const p1 = eve({ eveningOutcome: 'walk-no-path', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: false });
  const bare = eve({ eveningOutcome: 'policy-no-record' });
  const d = decidingLeg(p1, bare);
  assert.strictEqual(d.leg, 'L3-hop');
  assert.match(d.reason, /proven unnecessary/);
});
check('deciding hop with succeeded entry still names hop', () => {
  const p1 = eve({ eveningOutcome: 'completed', travelledHome: true, inside: true, tile: 'haven', mapPx: 4, mapPy: 4 });
  const d = decidingLeg(p1, eve({}));
  assert.strictEqual(d.leg, 'L3-hop');
});
check('deciding daytime-divergence (no travel, P1 home / BARE away)', () => {
  const p1 = eve({ eveningOutcome: 'completed', tile: 'haven', mapPx: 4, mapPy: 4 });
  const d = decidingLeg(p1, eve({}));
  assert.strictEqual(d.leg, 'daytime-divergence');
});
check('deciding offer-no keeps away', () => {
  const d = decidingLeg(eve({ eveningOutcome: 'out-of-reach' }), eve({}));
  assert.strictEqual(d.leg, 'L2-offer-no');
});
check('deciding hop-no keeps away', () => {
  const d = decidingLeg(eve({ eveningOutcome: 'travel-refused' }), eve({}));
  assert.strictEqual(d.leg, 'L3-hop-no');
});
check('deciding guard-combat keeps away', () => {
  const d = decidingLeg(eve({ eveningOutcome: 'blocked-combat', inCombat: true }), eve({}));
  assert.strictEqual(d.leg, 'L1-guard-combat');
});
check('deciding no-step-difference when both haven', () => {
  const d = decidingLeg(eve({ eveningOutcome: 'completed', tile: 'haven', mapPx: 4, mapPy: 4 }), eve({ eveningOutcome: 'policy-no-record', tile: 'haven', mapPx: 4, mapPy: 4 }));
  assert.strictEqual(d.leg, 'no-step-difference');
});
check('deciding daytime-walk-home vs evening-hop distinction', () => {
  // Daytime walk home: day ends at haven by daily travel, evening entry
  // only, travelledHome false — must NOT be called an evening hop.
  const p1 = eve({ eveningOutcome: 'completed', tile: 'haven', mapPx: 4, mapPy: 4, travelledHome: false });
  const d = decidingLeg(p1, eve({}));
  assert.strictEqual(d.leg, 'daytime-divergence');
  assert.strictEqual(p1.travelledHome, false);
});
check('deciding UNISOLATED on surprise outcome', () => {
  const d = decidingLeg(eve({ eveningOutcome: 'detour-stopped' }), eve({}));
  assert.strictEqual(d.leg, 'UNISOLATED');
});

// --- pairDay wiring on synthetic instances ---
function inst(seed, days) {
  return {
    seed,
    decisions: days.map((d) => ({ loopDay: d.day, morning: d.morning, ctxDelta: { forageTrips: d.forage || 0 } })),
    evenings: days.map((d) => Object.assign(eve(d.eve), { loopDay: d.day, dayLines: d.lines || [] })),
  };
}
check('pairDay 17563-day-5 shape end to end', () => {
  const morn = { tile: 'forest_floor', mapPx: 5, mapPy: 3, inside: false, kcal: 0, dayTicks: 256, vesselId: 'gen_x' };
  const p1 = inst(17563, [{ day: 5, morning: morn, eve: { eveningOutcome: 'walk-no-path', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: false }, lines: ['Travel 2 tiles to Haven.', 'You come home after 2 days.'] }]);
  const bare = inst(17563, [{ day: 5, morning: morn, eve: { eveningOutcome: 'policy-no-record', tile: 'forest_floor', mapPx: 5, mapPy: 3 } }]);
  const pr = pairDay(p1, bare, null, 5);
  assert.strictEqual(pr.p1.legPath, 'L3-hop-yes-entry-no');
  assert.strictEqual(pr.bare.legPath, 'L0-no-step');
  assert.strictEqual(pr.deciding.leg, 'L3-hop');
  assert.deepStrictEqual(pr.p1.quotedLines, ['Travel 2 tiles to Haven.', 'You come home after 2 days.']);
});
check('pairDay missing record is UNISOLATED', () => {
  const p1 = inst(1, []);
  const bare = inst(1, []);
  const pr = pairDay(p1, bare, null, 9);
  assert.strictEqual(pr.deciding.leg, 'UNISOLATED');
});

// --- censusOfDir wiring on a synthetic corpus dir ---
check('censusOfDir counts leg paths and travelledHome', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eveningstep-test-'));
  const seed = {
    seed: 99999, errCount: 0, endReason: 'survived', daysAlive: 30,
    evenings: [
      eve({ loopDay: 1, eveningOutcome: 'completed', tile: 'haven', mapPx: 4, mapPy: 4 }),
      eve({ loopDay: 2, eveningOutcome: 'out-of-reach' }),
      eve({ loopDay: 3, eveningOutcome: 'walk-no-path', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4 }),
    ],
  };
  fs.writeFileSync(path.join(dir, 's99999.json'), JSON.stringify(seed));
  const c = censusOfDir(dir);
  assert.strictEqual(c.evenings, 3);
  assert.strictEqual(c.travelledHome, 1);
  assert.strictEqual(c.legCounts['L4-entry-only'], 1);
  assert.strictEqual(c.legCounts['L2-offer-no'], 1);
  assert.strictEqual(c.legCounts['L3-hop-yes-entry-no'], 1);
  assert.strictEqual(c.surprises, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log('PASS test-eveningstep-b ' + n + '/' + n);
