// test-finishersize-addressable-20261107.js — addressable-window proof
// (arm sim-finishersize-adopt-a, run fleshout-20261107T0515Z). Scripts only,
// zero src/js. Proves the corrected metric's classifier BEFORE any judged
// sims on the new band:
//   (1) synthetic-row unit checks of isAddressable / isConvertible /
//       isCommittedKill at every boundary in the prereg definition;
//   (2) re-derivation of the 0221Z pilot corpus (99661-99668): addressable
//       0 on both legs, committed kills 0, and the armed leg's A-fields
//       match the baseline leg on both pilot below-break meetings
//       (the pre-commit-identity claim the denominator leg rests on).
// Usage: node scripts/test-finishersize-addressable-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'finishersize-analyze-20261106'));

let pass = 0, fail = 0;
const fails = [];
function check(name, got, want) {
  if (got === want) { pass++; }
  else { fail++; fails.push(name + ' :: got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }
}

function row(o) {
  return Object.assign({ wave: 4, contactFinishAttempted: true, contactFinishKill: false,
    contactFinishBeastHp: 41, contactFinishDmg: 20, fsIntent: 'engage',
    fsEntryVhpFrac: 0.80, fsCommitMhp: null, outcome: 'mFlee' }, o || {});
}

// (1) Boundary checks. post = hp - dmg; strike = dmg.
// post == strike (41-20=21? no: hp 40 dmg 20 -> post 20 == strike): NOT addressable.
check('post==strike not addressable', A.isAddressable(row({ contactFinishBeastHp: 40, contactFinishDmg: 20 })), false);
// post == strike+1 (hp 41 dmg 20 -> post 21 > 20): addressable, convertible (21 <= 60).
check('post==strike+1 addressable', A.isAddressable(row({ contactFinishBeastHp: 41, contactFinishDmg: 20 })), true);
check('post==strike+1 convertible', A.isConvertible(row({ contactFinishBeastHp: 41, contactFinishDmg: 20 })), true);
// post == 3x strike (hp 80 dmg 20 -> post 60 == 3*20): addressable AND convertible (inclusive).
check('post==3x strike addressable', A.isAddressable(row({ contactFinishBeastHp: 80, contactFinishDmg: 20 })), true);
check('post==3x strike convertible', A.isConvertible(row({ contactFinishBeastHp: 80, contactFinishDmg: 20 })), true);
// post == 3x strike + 1 (hp 81 dmg 20 -> post 61 > 60): addressable, NOT convertible.
check('post==3x+1 addressable', A.isAddressable(row({ contactFinishBeastHp: 81, contactFinishDmg: 20 })), true);
check('post==3x+1 not convertible', A.isConvertible(row({ contactFinishBeastHp: 81, contactFinishDmg: 20 })), false);
// Intent gate.
check('intent learn not addressable', A.isAddressable(row({ fsIntent: 'learn' })), false);
check('intent null not addressable', A.isAddressable(row({ fsIntent: null })), false);
// 60% gate boundary.
check('vhp 0.59 not addressable', A.isAddressable(row({ fsEntryVhpFrac: 0.59 })), false);
check('vhp 0.60 addressable', A.isAddressable(row({ fsEntryVhpFrac: 0.60 })), true);
check('vhp null not addressable', A.isAddressable(row({ fsEntryVhpFrac: null })), false);
// Contact strike killed outright: not addressable (post <= 0).
check('contact kill not addressable', A.isAddressable(row({ contactFinishKill: true, contactFinishBeastHp: 17, contactFinishDmg: 20 })), false);
// No contact attempt / no contact fields: not addressable.
check('no contact attempt not addressable', A.isAddressable(row({ contactFinishAttempted: false })), false);
check('null contact hp not addressable', A.isAddressable(row({ contactFinishBeastHp: null })), false);
check('null contact dmg not addressable', A.isAddressable(row({ contactFinishDmg: null })), false);
// Wave gate: the funnel is wave-4 field.
check('wave 3 not addressable', A.isAddressable(row({ wave: 3 })), false);
check('wave 5 addressable', A.isAddressable(row({ wave: 5 })), true);
// Committed-kill counting.
check('commit+kill is committed kill', A.isCommittedKill(row({ fsCommitMhp: 21, outcome: 'vKill' })), true);
check('commit+flee is not committed kill', A.isCommittedKill(row({ fsCommitMhp: 21, outcome: 'mFlee' })), false);
check('no commit+kill is not committed kill', A.isCommittedKill(row({ fsCommitMhp: null, outcome: 'vKill' })), false);
// Funnel conversion rate on a synthetic set: 4 addressable, 2 committed kills -> 0.5.
const synth = [
  row({ fsCommitMhp: 21, outcome: 'vKill' }),
  row({ contactFinishBeastHp: 45, fsCommitMhp: 25, outcome: 'vKill' }),
  row({ contactFinishBeastHp: 81, contactFinishDmg: 20 }), // addressable, above tail
  row({ contactFinishBeastHp: 41, outcome: 'vFlee' }), // addressable, no commit (would be a bug in real data)
];
const f = A.addressableFunnel(synth);
check('synthetic funnel addressable', f.addressable, 4);
check('synthetic funnel convertible', f.addressableConvertible, 3);
check('synthetic funnel above-tail', f.addressableAboveTail, 1);
check('synthetic funnel committed kills', f.addressableCommittedKills, 2);
check('synthetic funnel conversion rate', f.conversionRate, 0.5);
check('synthetic funnel convertible commit rate', f.convertibleCommitRate, 0.667);
check('empty funnel rate null', A.addressableFunnel([]).conversionRate, null);

// (2) Pilot corpus re-derivation (99661-99668).
const PILOT = path.join(REPO, 'evidence', '2026-11-06', 'perseed-finishersize-a');
function pilotFiles(leg) {
  const out = [];
  for (let s = 99661; s <= 99668; s++) out.push(path.join(PILOT, 'fs-s' + s + '-finishersize-' + leg + '.json'));
  return out;
}
const pb = A.analyzeFiles(pilotFiles('baseline'));
const pa = A.analyzeFiles(pilotFiles('armed'));
check('pilot baseline addressable 0', pb.addressable.addressable, 0);
check('pilot armed addressable 0', pa.addressable.addressable, 0);
check('pilot baseline committed kills 0', pb.addressable.addressableCommittedKills, 0);
check('pilot armed committed kills 0', pa.addressable.addressableCommittedKills, 0);
check('pilot conversion rate null both legs', pa.addressable.conversionRate, null);
// Pre-commit identity: the two pilot below-break meetings agree across
// legs on every A-field the baseline leg can see.
const belowB = pb.fs.belowBreakEntries;
const belowA = pa.fs.belowBreakEntries;
check('pilot below-break meetings 2 each leg', belowB.length === 2 && belowA.length === 2, true);
belowB.forEach(function (rb, i) {
  const ra = belowA[i];
  check('pilot meeting ' + i + ' same seed/day/mid', rb.seed === ra.seed && rb.day === ra.day && rb.mid === ra.mid, true);
  check('pilot meeting ' + i + ' same contact hp/dmg', rb.contactHp === ra.contactHp && rb.contactDmg === ra.contactDmg, true);
});
// The pilot's two meetings fail clause 3 by construction (post <= strike).
check('pilot 99664 post<=strike', belowA[0].contactHp - belowA[0].contactDmg <= belowA[0].contactDmg, true);
check('pilot 99667 post<=strike', belowA[1].contactHp - belowA[1].contactDmg <= belowA[1].contactDmg, true);

console.log('addressable proof: ' + pass + ' passed, ' + fail + ' failed');
if (fail) { fails.forEach(function (m) { console.log('FAIL: ' + m); }); process.exitCode = 1; }
