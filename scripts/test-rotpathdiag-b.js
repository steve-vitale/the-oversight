#!/usr/bin/env node
// test-rotpathdiag-b.js — proof for the sim-rotpathdiag-b diagnostic instruments.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotpathdiag-b.js
//   (SURPLUSFEED must be UNSET — the diagnostic substrate. SEATDRIVE=0 explicit.)
// Read the Usage header BEFORE running any proof (ENV TRAP rule).
//
// RED:    pristine (uninstrumented) runs write no _diagP tags.
// ENGAGE: 2 seeds x 40d instrumented: both choke paths (SP, SS) fire; fast-rot
//         attribution completeness >= 0.99 (tagged / (tagged + untagged));
//         crisis + cap sensors engage (observed or honestly reported).
// DET:    40d x 2 seeds, instrumented vs pristine: canonical state projection
//         byte-identical (instruments are RNG-clean — tags touch only
//         stacksMatch-ignored fields).
//
// Proof seeds 5435/5436 are proof-only (adjacent to the b4 set 5427-5434,
// unused by any judged run).
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachRotPathDiag } = require('./rotpathdiag-lib');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset for the diagnostic substrate');
  process.exit(2);
}

// canonical projection: everything the sim's behavior depends on, minus
// instrument-only fields (_diagP).
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'rotpathdiag-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null;
  if (instrumented) W = attachRotPathDiag(Game);
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W, result };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('RED: pristine runs write no instrument tags');
  {
    const { Game } = await run(5435, 25, false);
    let tagged = 0;
    for (const it of (((Game.state || {}).village || {}).pantry || [])) {
      if (it && ('_diagP' in it)) tagged++;
    }
    ok('no tags when uninstrumented', tagged === 0, tagged + ' tagged items');
  }

  console.log('ENGAGE: instrumented runs record + attribute fully (40d x 2 seeds)');
  for (const seed of [5435, 5436]) {
    const { W, result } = await run(seed, 40, true);
    const choke = W.inflow.SP + W.inflow.SS + W.inflow.DPP;
    ok(`seed ${seed} SP path fires`, W.inflow.SP > 0, 'SP=' + Math.round(W.inflow.SP));
    ok(`seed ${seed} SS path fires`, W.inflow.SS > 0, 'SS=' + Math.round(W.inflow.SS));
    ok(`seed ${seed} chokeTotal > 0`, choke > 0, 'choke=' + Math.round(choke));
    const tagged = Object.values(W.rotByPath).reduce((a, b) => a + b, 0);
    const untagged = W.untaggedRotKcal;
    const total = tagged + untagged;
    const comp = total > 0 ? tagged / total : 1;
    // completeness is only meaningful with real rot volume
    ok(`seed ${seed} fast-rot attribution >= 0.99`, total < 2000 || comp >= 0.99,
      `tagged=${Math.round(tagged)} untagged=${Math.round(untagged)} comp=${comp.toFixed(4)}`);
    const fastTagged = Object.values(W.rotByPathFast).reduce((a, b) => a + b, 0);
    ok(`seed ${seed} fast-rot observed`, fastTagged > 0, 'fast=' + Math.round(fastTagged));
    const crisisSeen = (W.ssCrisisKcal + W.ssNonCrisisKcal) > 0;
    ok(`seed ${seed} crisis sensor engages`, crisisSeen,
      `crisis=${Math.round(W.ssCrisisKcal)} noncrisis=${Math.round(W.ssNonCrisisKcal)}`);
    console.log(`    seed ${seed}: days=${result.days} SP=${Math.round(W.inflow.SP / 1000)}k SS=${Math.round(W.inflow.SS / 1000)}k` +
      ` rot=${Math.round(tagged / 1000)}k fast=${Math.round(fastTagged / 1000)}k` +
      ` ssRefused=${Math.round(W.ssRefused)} spOverCap=${Math.round(W.spOverCapKcal)}` +
      ` mergeMix=${Math.round(W.mergeMixKcal)}`);
  }

  console.log('DET: instrumented vs pristine byte-identical (40d x 2 seeds)');
  for (const seed of [5435, 5436]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed} trajectories identical`, ca === cb, ca.length + ' vs ' + cb.length + ' chars');
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
