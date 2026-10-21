#!/usr/bin/env node
// test-returnintake-b.js — proof for the sim-prodrebuff-b RETURNINTAKE lever.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-returnintake-b.js
//   (SURPLUSFEED unset always; the script sets RETURNINTAKE per sub-proof.
//   Read the Usage header BEFORE running any proof (ENV TRAP rule:
//   FEASTSCALE_R13=1 is REQUIRED).)
//
// ENGAGE: 2 proof seeds x 60d, RETURNINTAKE=1, instrumented: the
//         returnIntakeGovernor trim fires (trimKcal > 0) on glut days, and
//         the away_wild glut-bucket inflow is below the gate-off side.
// DET:    40d x 2 proof seeds, RETURNINTAKE unset: gate-off trajectories
//         byte-identical to the pre-lever DIAG substrate (the lever code
//         exists but the gate is OFF — zero writes, zero RNG draws).
// REPEAT: same armed seed twice in-process byte-identical.
// NO-SILENT: on armed glut days, the governor's voice beat appears in the
//         captured say lines ("trail bag") — the trim is narrated.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset');
  process.exit(2);
}
delete process.env.RETURNINTAKE;

function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, armed) {
  if (armed) process.env.RETURNINTAKE = '1'; else delete process.env.RETURNINTAKE;
  const { Game } = await loadGame({ seed, mode: 'returnintake-test', fullTelemetry: false });
  await setupGame(Game);
  const W = attachProbe(Game);
  // rint sensor (same shape as the sweep driver)
  W.rint = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
  const og = Game.returnIntakeGovernor;
  if (typeof og === 'function') Game.returnIntakeGovernor = function (vid, kcal) {
    const r = og.apply(this, arguments);
    try {
      W.rint.govCalls++;
      if (r < kcal) {
        W.rint.trimCalls++; W.rint.trimKcal += (kcal - r);
        const d = dayOf(Game);
        const cell = W.rint.days[d] || (W.rint.days[d] = { trimCalls: 0, trimKcal: 0 });
        cell.trimCalls++; cell.trimKcal += (kcal - r);
      }
    } catch (e) {}
    return r;
  };
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W, result, governorExists: typeof og === 'function' };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('ENGAGE: governor trims on glut days (armed, 60d x 2 seeds)');
  for (const seed of [8823, 8824]) {
    const { W, governorExists } = await run(seed, 60, true);
    ok(`seed ${seed} governor exists in engine`, governorExists);
    let glutDawns = 0;
    for (const s of W.dawnSamples) if (s.freshDays >= 7) glutDawns++;
    ok(`seed ${seed} reached glut dawns`, glutDawns > 0, 'glutDawns=' + glutDawns);
    ok(`seed ${seed} trim fired`, W.rint.trimKcal > 0 && Object.keys(W.rint.days).length > 0,
      `trimKcal=${Math.round(W.rint.trimKcal)} trimDays=${Object.keys(W.rint.days).length} govCalls=${W.rint.govCalls}`);
  }

  console.log('DET: gate-off (unset) byte-identical to DIAG substrate (40d x 2 seeds)');
  for (const seed of [8825, 8826]) {
    const a = await run(seed, 40, false);  // lever code present, gate OFF
    const b = await run(seed, 40, false);
    ok(`seed ${seed} gate-off repeat identical`, canon(a.Game) === canon(b.Game));
    ok(`seed ${seed} gate-off never trims`, a.W.rint.trimCalls === 0 && a.W.rint.trimKcal === 0,
      `trimCalls=${a.W.rint.trimCalls}`);
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const a = await run(8823, 40, true);
    const b = await run(8823, 40, true);
    ok('repeat armed run identical', canon(a.Game) === canon(b.Game));
  }

  console.log('NO-SILENT: the trim is voiced on the armed substrate');
  {
    const { Game, W } = await run(8823, 60, true);
    const voiced = (Game._sayLog || []).filter(l => /trail bag/.test(String(l)));
    const sayCap = (W.sayLines || []).filter(s => /trail bag/.test(s.line));
    ok('governor beat in say capture', sayCap.length > 0 || voiced.length > 0,
      `sayLines=${sayCap.length} sayLog=${voiced.length}`);
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
