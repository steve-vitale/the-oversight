#!/usr/bin/env node
// test-endpos-b.js — pure proof test for scripts/analyze-endpos-b.js (DIAG ONLY).
// (sim-endpos-b; prereg: evidence/2026-11-01/sim-endpos-b-prereg.md.)
// No filesystem writes: the analyzer is exercised through
// analyzeInstances on synthetic in-memory corpora, so the test is
// immune to the container's intermittent /tmp EPERM flap.
'use strict';
const assert = require('assert');
const { manhattan, bandOf, endposClass, mechanismOf, analyzeInstances } = require('./analyze-endpos-b.js');

let n = 0;
function check(name, fn) {
  n++;
  try { fn(); console.log('ok ' + n + ' ' + name); }
  catch (e) { console.error('FAIL ' + n + ' ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

check('manhattan (5,3)->(4,4) = 2', () => assert.strictEqual(manhattan(5, 3), 2));
check('manhattan (2,0)->(4,4) = 6', () => assert.strictEqual(manhattan(2, 0), 6));
check('manhattan haven->haven = 0', () => assert.strictEqual(manhattan(4, 4), 0));
check('band boundaries 3/4 and 5/6', () => {
  assert.strictEqual(bandOf(3), 'A<=3'); assert.strictEqual(bandOf(4), 'B4-5');
  assert.strictEqual(bandOf(5), 'B4-5'); assert.strictEqual(bandOf(6), 'C>=6');
});

check('endpos: offer-no evening = snap band B', () => {
  const eve = { loopDay: 1, eveningOutcome: 'out-of-reach', travelledHome: false, tile: 'creek', mapPx: 2, mapPy: 0, inside: false };
  const ep = endposClass(eve, { mapPx: 2, mapPy: 0, tile: 'creek', distance: 6, provenance: 'evening-snap' });
  assert.strictEqual(ep.cls, 'C>=6'); assert.strictEqual(ep.dist, 6);
});
check('endpos: hop evening = departure band, not haven snap', () => {
  const eve = { loopDay: 1, eveningOutcome: 'completed', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: true };
  const ep = endposClass(eve, { mapPx: 5, mapPy: 3, tile: 'forest_floor', distance: 2, provenance: 'creekseek-from' });
  assert.strictEqual(ep.cls, 'A<=3'); assert.strictEqual(ep.dist, 2);
});
check('endpos: hop with no distance = UNPINNED, never banded', () => {
  const eve = { loopDay: 1, eveningOutcome: 'completed', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: true };
  const ep = endposClass(eve, { mapPx: null, mapPy: null, tile: null, distance: null, provenance: 'unpinned' });
  assert.strictEqual(ep.cls, 'UNPINNED');
});
check('endpos: line-derived hop bands by line distance, tile null', () => {
  const eve = { loopDay: 1, eveningOutcome: 'completed', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: true };
  const ep = endposClass(eve, { mapPx: null, mapPy: null, tile: null, distance: 5, provenance: 'day-line hop distance' });
  assert.strictEqual(ep.cls, 'B4-5'); assert.strictEqual(ep.dist, 5); assert.strictEqual(ep.tile, null);
});
check('endpos: travel-refused rescued to haven = departure band', () => {
  const eve = { loopDay: 1, eveningOutcome: 'travel-refused', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true,
    woodcarry: { classification: { departure: { mapPx: 3, mapPy: 3, tile: 'meadow' } } } };
  const ep = endposClass(eve, { mapPx: 3, mapPy: 3, tile: 'meadow', distance: 2, provenance: 'woodcarry-departure' });
  assert.strictEqual(ep.cls, 'A<=3');
});
check('endpos: completed non-hop = H-IN', () => {
  const eve = { loopDay: 1, eveningOutcome: 'completed', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true };
  assert.strictEqual(endposClass(eve, null).cls, 'H-IN');
});
check('endpos: already-inside = H-IN', () => {
  const eve = { loopDay: 1, eveningOutcome: 'already-inside', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true };
  assert.strictEqual(endposClass(eve, null).cls, 'H-IN');
});
check('endpos: walk-interrupted-combat on haven tile = H-OUT', () => {
  const eve = { loopDay: 1, eveningOutcome: 'walk-interrupted-combat', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: false };
  assert.strictEqual(endposClass(eve, null).cls, 'H-OUT');
});
check('endpos: blocked-combat away = snap band', () => {
  const eve = { loopDay: 1, eveningOutcome: 'blocked-combat', travelledHome: false, tile: 'grove', mapPx: 0, mapPy: 5, inside: false, inCombat: true };
  assert.strictEqual(endposClass(eve, null).cls, 'B4-5');
});
check('endpos: blocked-combat on haven tile, not inside = H-OUT', () => {
  const eve = { loopDay: 1, eveningOutcome: 'blocked-combat', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: false, inCombat: true };
  assert.strictEqual(endposClass(eve, null).cls, 'H-OUT');
});
check('endpos: haven-tile snap off (4,4) is a coord violation case (analyzer flags it)', () => {
  const inst = { seed: 9, policy: 'nighttravel-stack', errCount: 0, decisions: [],
    evenings: [{ loopDay: 1, eveningOutcome: 'completed', travelledHome: false, tile: 'haven', mapPx: 5, mapPy: 5, inside: false, dayLines: [] }] };
  const res = analyzeInstances([{ file: 'x.json', inst }]);
  assert.strictEqual(res.havenCoordViolations.length, 1);
});

check('mechanism priority: ROAD beats CREEK-BLOCKED', () => {
  const eve = { eveningOutcome: 'out-of-reach', roadActive: true, dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'] };
  const { mech } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: { tile: 'haven', mapPx: 4, mapPy: 4 }, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(mech, 'ROAD');
});
check('mechanism priority: COMBAT beats CREEK-BLOCKED', () => {
  const eve = { eveningOutcome: 'blocked-combat', inCombat: true, dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'] };
  const { mech } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: { tile: 'haven', mapPx: 4, mapPy: 4 }, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(mech, 'COMBAT');
});
check('mechanism: CREEK-BLOCKED from day line', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: ['Travel 1 tile to creek.', 'The creek runs fast here — no crossing without a bridge or a swim.'] };
  const { mech, descriptors } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: { tile: 'haven', mapPx: 4, mapPy: 4 }, prevEndpos: null, dayCtx: { forageTrips: 1 } });
  assert.strictEqual(mech, 'CREEK-BLOCKED'); assert.strictEqual(descriptors.creekBlockLine, true);
  assert.strictEqual(descriptors.lastTravelDest, 'creek');
});
check('mechanism: CAMPED via previous evening same coords', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: [] };
  const { mech } = mechanismOf(eve, { mapPx: 1, mapPy: 7 }, { morning: { tile: 'creek', mapPx: 1, mapPy: 7 }, prevEndpos: { mapPx: 1, mapPy: 7 }, dayCtx: {} });
  assert.strictEqual(mech, 'CAMPED');
});
check('mechanism: CAMPED via morning same tile (no previous evening)', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: [] };
  const { mech } = mechanismOf(eve, { mapPx: 1, mapPy: 7 }, { morning: { tile: 'creek', mapPx: 1, mapPy: 7 }, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(mech, 'CAMPED');
});
check('mechanism: OUT-AND-NOT-BACK from haven morning', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: ['Travel 2 tiles to grove.'] };
  const { mech } = mechanismOf(eve, { mapPx: 6, mapPy: 7 }, { morning: { tile: 'haven', mapPx: 4, mapPy: 4 }, prevEndpos: { mapPx: 4, mapPy: 4 }, dayCtx: { forageTrips: 2 } });
  assert.strictEqual(mech, 'OUT-AND-NOT-BACK');
});
check('mechanism: AWAY-MOVED when morning away and coords differ', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: ['Travel 1 tile to creek.'] };
  const { mech } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: { tile: 'grove', mapPx: 0, mapPy: 5 }, prevEndpos: { mapPx: 0, mapPy: 5 }, dayCtx: {} });
  // prevEndpos == morning coords but != endpos: not CAMPED (prev differs from endpos), not OUT-AND-NOT-BACK (morning away) -> AWAY-MOVED
  assert.strictEqual(mech, 'AWAY-MOVED');
});
check('mechanism: OTHER when morning missing and no signal', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: [] };
  const { mech } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: null, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(mech, 'OTHER');
});
check('descriptor: restless does NOT count as wound/rest', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: ['A person paces the hall, restless, then sits.'] };
  const { descriptors } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: null, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(descriptors.woundRestLine, false);
});
check('descriptor: standalone rest DOES count as wound/rest', () => {
  const eve = { eveningOutcome: 'out-of-reach', dayLines: ['You rest a while by the creek.'] };
  const { descriptors } = mechanismOf(eve, { mapPx: 2, mapPy: 0 }, { morning: null, prevEndpos: null, dayCtx: {} });
  assert.strictEqual(descriptors.woundRestLine, true);
});

function synthLeg(seed, policy, days) {
  // days: [{ loopDay, morning, evening }] — decisions carry morning + ctxDelta.
  return { seed, policy, errCount: 0, daysAlive: days.length,
    decisions: days.map((d) => ({ loopDay: d.loopDay, morning: d.morning, ctxDelta: d.ctxDelta || {} })),
    evenings: days.map((d) => d.evening) };
}
check('analyzer wiring: outcome x class table reconciles on synthetic legs', () => {
  const leg = synthLeg(1, 'nighttravel-stack', [
    { loopDay: 1,
      morning: { tile: 'haven', mapPx: 4, mapPy: 4, inside: true, vesselId: 'v1' },
      evening: { loopDay: 1, eveningOutcome: 'completed', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true, dayLines: [] } },
    { loopDay: 2,
      morning: { tile: 'haven', mapPx: 4, mapPy: 4, inside: true, vesselId: 'v1' },
      evening: { loopDay: 2, eveningOutcome: 'out-of-reach', travelledHome: false, tile: 'creek', mapPx: 2, mapPy: 0, inside: false,
        dayLines: ['Travel 1 tile to creek.', 'The creek runs fast here — no crossing without a bridge or a swim.'] },
      ctxDelta: { forageTrips: 1 } },
    { loopDay: 3,
      morning: { tile: 'creek', mapPx: 2, mapPy: 0, inside: false, vesselId: 'v1' },
      evening: { loopDay: 3, eveningOutcome: 'out-of-reach', travelledHome: false, tile: 'creek', mapPx: 2, mapPy: 0, inside: false,
        dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'] },
      ctxDelta: {} },
    { loopDay: 4,
      morning: { tile: 'creek', mapPx: 2, mapPy: 0, inside: false, vesselId: 'v1' },
      evening: { loopDay: 4, eveningOutcome: 'travel-refused', travelledHome: false, tile: 'meadow', mapPx: 3, mapPy: 3, inside: false,
        woodcarry: { classification: { departure: { mapPx: 3, mapPy: 3, tile: 'meadow' } } }, dayLines: [] },
      ctxDelta: {} },
    { loopDay: 5,
      morning: { tile: 'creek', mapPx: 2, mapPy: 0, inside: false, vesselId: 'v1' },
      evening: { loopDay: 5, eveningOutcome: 'out-of-reach', travelledHome: false, tile: 'creek', mapPx: 2, mapPy: 0, inside: false,
        dayLines: [] },
      ctxDelta: {} },
  ]);
  const res = analyzeInstances([{ file: 's.json', inst: leg }]);
  assert.strictEqual(res.pooled.evenings, 5);
  assert.strictEqual(res.pooled.table.completed['H-IN'], 1);
  assert.strictEqual(res.pooled.table['out-of-reach']['C>=6'], 3);
  assert.strictEqual(res.pooled.table['travel-refused']['A<=3'], 1);
  // Days 2 AND 3 carry the creek-block line, so priority classes both
  // CREEK-BLOCKED (creek beats camped); day 5 is the clean CAMPED case
  // (morning away at the endpos tile, no creek line, prev endpos differs).
  assert.strictEqual(res.pooled.mech['CREEK-BLOCKED'], 2);
  assert.strictEqual(res.pooled.mech.CAMPED, 1);
  assert.strictEqual(res.pooled.desc.n, 3);
  assert.strictEqual(res.pooled.desc.creekBlockLine, 2);
  // Day 3 is morning-same-tile AND prev-same-tile; day 5 is
  // morning-same-tile only (prev endpos is day 4's meadow).
  assert.strictEqual(res.pooled.desc.morningSameTile, 2);
  assert.strictEqual(res.pooled.desc.prevSameTile, 1);
  assert.strictEqual(res.surprises.length, 0);
  assert.strictEqual(res.havenCoordViolations.length, 0);
  // Bucket totals reconcile.
  const bsum = Object.values(res.pooled.buckets['1-10']).reduce((a, b) => a + b, 0);
  assert.strictEqual(bsum, 5);
});
check('analyzer wiring: errCount != 0 leg counted as errLeg, not dropped', () => {
  const leg = synthLeg(2, 'creekseek-stack', [
    { loopDay: 1, morning: { tile: 'haven', mapPx: 4, mapPy: 4, inside: true, vesselId: 'v1' },
      evening: { loopDay: 1, eveningOutcome: 'already-inside', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true, dayLines: [] } },
  ]);
  leg.errCount = 3;
  const res = analyzeInstances([{ file: 'e.json', inst: leg }]);
  assert.strictEqual(res.pooled.errLegs, 1);
  assert.strictEqual(res.pooled.evenings, 1);
});

console.log('test-endpos-b: ' + n + '/' + n + ' green');
