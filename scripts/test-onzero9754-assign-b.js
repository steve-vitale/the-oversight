#!/usr/bin/env node
// test-onzero9754-assign-b.js — proof test for the assign-call diag layer
// of sim-onzero9754-b. Reads the 4 assign-driver per-seed files and the
// 4 main-corpus per-seed files for seed 9754 and checks:
//   A1: assign-driver batches/resolutions/cooking deeds are IDENTICAL to
//       the main corpus on all 4 cells (wrapper behaviour-neutrality).
//   A2: ON cook staffing is attempted but never lands: cookCalls > 0,
//       cookOk == 0, cookRefused == cookCalls, on BOTH sides, and every
//       ON cook call targets a single villager id.
//   A3: OFF cook staffing lands on at least one side (cookOk > 0), so
//       the ON refusal pattern is not a broken assign instrument.
//   A4: ON staff-days with freshKcal > 1500 and no cook assigned before
//       the daily number > 0 on both sides (the staffing block fires
//       into the refusal loop, it does not sleep).
// Exit 0 iff A1-A4 all hold. This test does NOT change the D1-D3
// verdict in test-onzero9754-b.js; it proves the mechanism layer
// (assignment capture) that the RESULTS section names.
'use strict';
const fs = require('fs');
const path = require('path');
const WT = path.join(__dirname, '..');
const CORPUS = path.join(WT, 'evidence', '2026-10-25', 'sim-onzero9754-b-corpus');
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name} :: ${detail}`); };
const load = (assign, arm, side) => {
  const f = path.join(CORPUS, `onzero9754-b-${assign ? 'assign-' : ''}${arm}-${side}-dg1-leadfeast-s9754.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};
let allOk = true;
for (const arm of ['off', 'on']) for (const side of ['pd0', 'pd1']) {
  const a = load(true, arm, side), m = load(false, arm, side);
  const ok = !!a && !!m && a.preserveVillagerBatches === m.preserveVillagerBatches &&
    a.preserveVillagerResolutions === m.preserveVillagerResolutions && a.cookingDeeds === m.cookingDeeds;
  if (!ok) allOk = false;
  check(`A1 determinism ${arm}/${side}`, ok, a && m ? `${a.preserveVillagerBatches}/${a.preserveVillagerResolutions}/${a.cookingDeeds} == main` : 'MISSING FILE');
}
const on0 = load(true, 'on', 'pd0'), on1 = load(true, 'on', 'pd1');
const off0 = load(true, 'off', 'pd0'), off1 = load(true, 'off', 'pd1');
for (const [nm, d] of [['on/pd0', on0], ['on/pd1', on1]]) {
  const ag = d.assignAgg;
  const vids = Object.keys(ag.cookCallVids || {});
  const ok = ag.cookCalls > 0 && ag.cookOk === 0 && ag.cookRefused === ag.cookCalls && vids.length === 1;
  if (!ok) allOk = false;
  check(`A2 refusal capture ${nm}`, ok, `calls=${ag.cookCalls} ok=${ag.cookOk} refused=${ag.cookRefused} vid=${vids.join(',')}`);
}
const offOk = (off0.assignAgg.cookOk > 0 || off1.assignAgg.cookOk > 0);
if (!offOk) allOk = false;
check('A3 OFF staffing lands', offOk, `off pd0 ok=${off0.assignAgg.cookOk} pd1 ok=${off1.assignAgg.cookOk}`);
for (const [nm, d] of [['on/pd0', on0], ['on/pd1', on1]]) {
  const ok = d.assignAgg.staffDaysFreshGt1500NoCook > 0;
  if (!ok) allOk = false;
  check(`A4 staffing fires, never lands ${nm}`, ok, `fresh>1500-no-cook staff-days=${d.assignAgg.staffDaysFreshGt1500NoCook}`);
}
console.log(`\nRESULT: ${pass} PASS / ${fail} FAIL -> ${allOk ? 'ASSIGN MECHANISM PROVEN' : 'ASSIGN MECHANISM NOT PROVEN'}`);
process.exit(allOk ? 0 : 1);
