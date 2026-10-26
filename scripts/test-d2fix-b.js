#!/usr/bin/env node
// test-d2fix-b.js — proof test for the D2 causal-order metric fix.
// Judged ONLY against the pre-registered header in
// evidence/2026-10-25/sim-d2fix-b.md (G1-G4):
//   R1: real onzero9754 corpus — old scan FAILS with 2 zero steps,
//       new scan PASSES naming villagerCooking, D1 + D3 still PASS,
//       assign sub-proof reads refusal capture.
//   S1-S6: synthetic quads labelling as the fixed order dictates.
//   N1: null-pair dry-runs stay NO-STEP / uncontested.
// Exit 0 iff every GO condition holds; otherwise exit 1 with the
// failed condition(s) named. No game code, no sweeps: all cases
// are built from existing corpus material or synthetic field
// shapes already present in that corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const { scanPair, oldScanPair, villagerCooking } = require('./d2scan-b');
const WT = path.join(__dirname, '..');
const CORPUS = path.join(WT, 'evidence', '2026-10-25', 'sim-onzero9754-b-corpus');
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name} :: ${detail}`); };
const load = (prefix, arm, side) => JSON.parse(fs.readFileSync(
  path.join(CORPUS, `${prefix}-${arm}-${side}-dg1-leadfeast-s9754.json`), 'utf8'));

// ---- R1: real corpus -------------------------------------------------
const main = { off: { pd0: load('onzero9754-b', 'off', 'pd0'), pd1: load('onzero9754-b', 'off', 'pd1') },
  on: { pd0: load('onzero9754-b', 'on', 'pd0'), pd1: load('onzero9754-b', 'on', 'pd1') } };
const old = oldScanPair(main);
check('R1 old scan still FAILS (2 syntactic zero steps)', !old.pass && old.zeroSteps.length === 2,
  `zero steps: ${old.zeroSteps.join(', ')}`);
const r1 = scanPair(main);
check('R1 new scan PASSES naming villagerCooking', r1.status === 'PASS' && r1.named === 'villagerCooking',
  `${r1.status} :: ${r1.detail}`);
check('R1 inhibitor absent (ON blocking 0/0)', !r1.inhibitor,
  `ON blocking ${r1.fields['on/pd0'].blockingDays}/${r1.fields['on/pd1'].blockingDays}, ON villagerCooking ${r1.fields['on/pd0'].villagerCooking}/${r1.fields['on/pd1'].villagerCooking}`);
console.log('  R1 fields: ' + ['off/pd0', 'off/pd1', 'on/pd0', 'on/pd1'].map((k) => `${k}=${JSON.stringify(r1.fields[k])}`).join(' '));
// D1 + D3 unchanged on the same corpus (no leg weakened).
const d1 = main.off.pd0.preserveVillagerBatches > 0 && main.off.pd1.preserveVillagerBatches > 0 &&
  main.on.pd0.preserveVillagerBatches === 0 && main.on.pd1.preserveVillagerBatches === 0;
check('R1 D1 still PASSES', d1, `OFF ${main.off.pd0.preserveVillagerBatches}/${main.off.pd1.preserveVillagerBatches} ON ${main.on.pd0.preserveVillagerBatches}/${main.on.pd1.preserveVillagerBatches}`);
let d3ok = true;
for (const arm of ['off', 'on']) for (const side of ['pd0', 'pd1']) {
  const d = main[arm][side];
  if (!(d.preserveVillagerBatches >= d.preserveVillagerResolutions &&
    villagerCooking(d) >= d.preserveVillagerResolutions && d.invHaulActions > 0)) d3ok = false;
}
check('R1 D3 still PASSES', d3ok, 'batches>=res, villagerCooking>=preserving, invHaul>0 on all 4 cells');
// Assign sub-proof (G4): refusal capture on the ON cells.
const assign = { off: { pd0: load('onzero9754-b-assign', 'off', 'pd0'), pd1: load('onzero9754-b-assign', 'off', 'pd1') },
  on: { pd0: load('onzero9754-b-assign', 'on', 'pd0'), pd1: load('onzero9754-b-assign', 'on', 'pd1') } };
for (const side of ['pd0', 'pd1']) {
  const a = assign.on[side].assignAgg;
  check(`R1 assign sub-proof ${side} refusal capture`,
    a.cookCalls > 0 && a.cookOk === 0 && a.cookRefused === a.cookCalls &&
    Object.keys(a.cookCallVids).length === 1 && a.cookCallVids.rosa_mendez === a.cookCalls,
    `calls=${a.cookCalls} ok=${a.cookOk} refused=${a.cookRefused} targets=${JSON.stringify(a.cookCallVids)}`);
}

// ---- Synthetic cells -------------------------------------------------
// A synthetic cell carries exactly the fields d2scan-b.js reads:
// cookingByVid, snapAgg (days + raw racksFullDays), snapshots
// (blocking conjunction), batches/resolutions.
const snap = (blocking) => blocking
  ? { day: 10, racksFull: { 0: true, 1: false, 2: false, 3: false }, afterReserveKcal: 500, cooks: ['v_cook'] }
  : { day: 10, racksFull: { 0: false, 1: false, 2: false, 3: false }, afterReserveKcal: 0, cooks: [] };
const cell = ({ cook, elig, after, batches, res, blocking, racks0 }) => ({
  cookingByVid: { v_cook: cook },
  snapAgg: { daysEligibleGt0: elig, daysAfterReserveGt0: after, racksFullDays: { 0: racks0, 1: 0, 2: 0, 3: 0 } },
  snapshots: [snap(blocking)],
  preserveVillagerBatches: batches, preserveVillagerResolutions: res,
});
const pair = (off, on) => ({ off: { pd0: off, pd1: off }, on: { pd0: on, pd1: on } });
const healthy = cell({ cook: 80, elig: 90, after: 50, batches: 50, res: 25, blocking: false, racks0: 5 });

// S1 guard-blocked: cook resolves, surplus waits, guard fires, nothing preserved.
{
  const on = cell({ cook: 80, elig: 90, after: 50, batches: 0, res: 0, blocking: true, racks0: 0 });
  const r = scanPair(pair(healthy, on));
  check('S1 guard-blocked PASSES naming racksFullBlocking', r.status === 'PASS' && r.named === 'racksFullBlocking', `${r.status} :: ${r.detail}`);
}
// S2 eligible-zero with after-reserve shadow: eligible 0 entails after 0.
{
  const on = cell({ cook: 80, elig: 0, after: 0, batches: 0, res: 0, blocking: false, racks0: 0 });
  const r = scanPair(pair(healthy, on));
  check('S2 eligible-zero PASSES naming eligibleDays (afterReserve shadow)',
    r.status === 'PASS' && r.named === 'eligibleDays' && r.shadows.includes('afterReserveDays'), `${r.status} :: ${r.detail}`);
}
// S3 after-reserve-only zero: eligible present, reserve swallows it all.
{
  const on = cell({ cook: 80, elig: 90, after: 0, batches: 0, res: 0, blocking: false, racks0: 0 });
  const r = scanPair(pair(healthy, on));
  check('S3 after-reserve-only PASSES naming afterReserveDays', r.status === 'PASS' && r.named === 'afterReserveDays', `${r.status} :: ${r.detail}`);
}
// S4 genuinely ambiguous: two independent throughput zeros.
{
  const on = cell({ cook: 0, elig: 0, after: 0, batches: 0, res: 0, blocking: false, racks0: 0 });
  const r = scanPair(pair(healthy, on));
  check('S4 ambiguous throughput pair still FAILS (both named)',
    r.status === 'FAIL' && r.throughput.includes('villagerCooking') && r.throughput.includes('eligibleDays'),
    `${r.status} :: ${r.detail}`);
}
// S5 throughput + inhibitor both present.
{
  const on = cell({ cook: 80, elig: 0, after: 50, batches: 0, res: 0, blocking: true, racks0: 0 });
  const r = scanPair(pair(healthy, on));
  check('S5 throughput+inhibitor still FAILS (both named)',
    r.status === 'FAIL' && r.throughput.includes('eligibleDays') && r.inhibitor, `${r.status} :: ${r.detail}`);
}
// S6 guard-shadow restated synthetically: cook zero, raw guard days
// OFF>0/ON 0, blocking ON 0 -> racks-full must NOT be named.
{
  const off = cell({ cook: 80, elig: 90, after: 50, batches: 50, res: 25, blocking: false, racks0: 7 });
  const on = cell({ cook: 0, elig: 90, after: 50, batches: 0, res: 0, blocking: false, racks0: 0 });
  const r = scanPair(pair(off, on));
  check('S6 guard-shadow PASSES naming villagerCooking (raw guard days ignored)',
    r.status === 'PASS' && r.named === 'villagerCooking' && !r.inhibitor, `${r.status} :: ${r.detail}`);
}
// N1 null-pairs: identical OFF/ON -> NO-STEP, both shapes.
{
  const rHealthy = scanPair(pair(healthy, healthy));
  check('N1 null-pair (healthy shape) NO-STEP', rHealthy.status === 'NO-STEP', `${rHealthy.status} :: ${rHealthy.detail}`);
  const onShape = cell({ cook: 0, elig: 90, after: 50, batches: 0, res: 0, blocking: false, racks0: 0 });
  const rOn = scanPair(pair(onShape, onShape));
  check('N1 null-pair (ON shape) NO-STEP', rOn.status === 'NO-STEP', `${rOn.status} :: ${rOn.detail}`);
  const rReal = scanPair({ off: { pd0: main.off.pd0, pd1: main.off.pd1 }, on: { pd0: main.off.pd0, pd1: main.off.pd1 } });
  check('N1 null-pair (real OFF cells as both arms) NO-STEP', rReal.status === 'NO-STEP', `${rReal.status} :: ${rReal.detail}`);
}

console.log(`\nRESULT: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
