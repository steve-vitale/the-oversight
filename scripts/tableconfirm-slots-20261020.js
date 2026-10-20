#!/usr/bin/env node
// tableconfirm-slots-20261020.js — scoped door-rotation slot maps for the
// sim-tablepathdriver confirm (flesh-out loop, 2026-10-20).
//
// THE CONSTRAINT: scripts/policies/tablepathdriver.js is a LANDED
// instrument — read-only. Its door rotation (ROTATION in the file header)
// is fixed:
//   leadfeast:   ['indispensable','witness','relay','relay','defiant','relay','defiant','relay']
//   belongfeast: ['witness','indispensable','relay','defiant','relay','defiant','relay','defiant']
// The driver's assignedDoor(policyId, seedIdx) reads ROTATION[seedIdx % 8].
// The probe's runOne computes seedIdx = SEEDS.indexOf(seed) where SEEDS is
// the module-level list built from process.env.SEEDS at require time.
//
// THE SCOPED ROTATION (pre-registered): 12 FRESH seeds per policy — 8 relay
// + 4 witness, zero defiant/indispensable assignments. Achieved by placing
// the fresh seeds at rotation slots that map to relay/witness ONLY on each
// policy's own rotation. Dummy seeds (9900xx, never swept) pad the rest.
//   leadfeast:   relay at idx%8 ∈ {2,3,5,7}; witness at idx%8 = 1
//   belongfeast: relay at idx%8 ∈ {2,4,6}; witness at idx%8 = 0
// Fresh seeds 81301–81312 (NOT the pilot's 64201–64208).
'use strict';

const FRESH_SEEDS = [81301, 81302, 81303, 81304, 81305, 81306, 81307, 81308, 81309, 81310, 81311, 81312];

// 26-entry slot lists: index = seedIdx used by the probe. Dummies pad.
function padList(placements) {
  const list = [];
  let dummy = 990001;
  for (let i = 0; i < 26; i++) list.push(placements[i] != null ? placements[i] : dummy++);
  return list;
}

// leadfeast: relay slots idx%8∈{2,3,5,7} → positions 2,3,5,7,10,11,13,15 (8);
// witness idx%8=1 → positions 1,9,17,25 (4).
const LEADFEAST_SLOTS = padList({
  1: 81301, 2: 81302, 3: 81303, 5: 81304, 7: 81305, 9: 81306,
  10: 81307, 11: 81308, 13: 81309, 15: 81310, 17: 81311, 25: 81312,
});

// belongfeast: relay slots idx%8∈{2,4,6} → positions 2,4,6,10,12,14,18,20 (8);
// witness idx%8=0 → positions 0,8,16,24 (4).
const BELONGFEAST_SLOTS = padList({
  0: 81301, 2: 81302, 4: 81303, 6: 81304, 8: 81305, 10: 81306,
  12: 81307, 14: 81308, 16: 81309, 18: 81310, 20: 81311, 24: 81312,
});

const SLOTS = { leadfeast: LEADFEAST_SLOTS, belongfeast: BELONGFEAST_SLOTS };
const EXPECTED = {
  leadfeast: { relay: 8, witness: 4 },
  belongfeast: { relay: 8, witness: 4 },
};

module.exports = { FRESH_SEEDS, SLOTS, EXPECTED };
