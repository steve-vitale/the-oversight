// test-journey-scale-r101-propose.js -- proof test for the R101
// multi-link propose gate (harness only, zero game code). The r100 gate
// proposed ONLY while Haven had no active link, so no panel could grow
// past one bond and national was unmeasurable. These fixtures prove the
// fixed gate proposes a second and third link, and still refuses at the
// cap, for unknown villages, on cooldown, on low pantry, and while an
// accord/counter is pending.
//
// Usage: node scripts/test-journey-scale-r101-propose.js
'use strict';
const assert = require('assert');
const { proposeGate } = require('./journey-scale-r101-20261104.js');

const V0 = { id: 'village_0', name: 'Emberhold' };
const V1 = { id: 'village_1', name: 'Cinderfall' };
const V2 = { id: 'village_2', name: 'Mossreach' };
const base = {
  day: 60, pantry: 20000, pendingCounter: false, pendingAccord: false,
  links: [], otherVillages: [V0, V1, V2],
  knowsVillage: () => true, linkWith: () => false, cool: {},
};
function run(over) {
  return proposeGate(Object.assign({}, base, over));
}
let n = 0;
function check(label, got, want) {
  n++;
  assert.deepStrictEqual(got, want, label);
  console.log('ok ' + n + ' ' + label);
}
// 1. No links: proposes the first known unlinked village (old behavior kept).
check('no-links proposes village_0', run({}), { target: V0 });
// 2. THE FIX: one active link + a known unlinked village still proposes.
//    (The r100 gate returned nothing here: hasActive blocked it.)
check('one-active-link still proposes village_1',
  run({ links: [{ status: 'active' }], linkWith: (id) => id === 'village_0' }), { target: V1 });
// 3. Two active links: still proposes the third (LEAD needs 3).
check('two-active-links proposes village_2',
  run({ links: [{ status: 'active' }, { status: 'active' }], linkWith: (id) => id !== 'village_2' }), { target: V2 });
// 4. Three active links: at cap, no proposal.
check('three-active-links at cap',
  run({ links: [{ status: 'active' }, { status: 'active' }, { status: 'active' }] }), { skip: 'at-cap' });
// 5. Inactive (broken/pending) links do not count toward the cap.
check('inactive links do not count',
  run({ links: [{ status: 'broken' }], linkWith: (id) => id === 'village_0' }), { target: V1 });
// 6. Unknown villages are never proposed (knowledge gate kept).
check('unknown village skipped',
  run({ knowsVillage: (v) => v.id === 'village_0', linkWith: (id) => id === 'village_0' }), { skip: 'no-known-unlinked' });
// 7. Already-linked villages are never re-proposed.
check('linked village skipped',
  run({ linkWith: () => true }), { skip: 'no-known-unlinked' });
// 8. Per-village 7-day cooldown kept.
check('cooldown blocks', run({ cool: { village_0: 55 } }), { skip: 'cooldown' });
check('cooldown expired proposes', run({ cool: { village_0: 53 } }), { target: V0 });
// 9. Pantry gate kept.
check('pantry-low skips', run({ pantry: 12000 }), { skip: 'pantry-low' });
// 10. Pending accord / counter block proposing.
check('pending-accord blocks', run({ pendingAccord: true }), { skip: 'pending-accord' });
check('pending-counter blocks', run({ pendingCounter: true }), { skip: 'pending-counter' });
// 11. Too early blocks.
check('too-early blocks', run({ day: 24 }), { skip: 'too-early' });
console.log('PASS test-journey-scale-r101-propose: ' + n + '/' + n);
