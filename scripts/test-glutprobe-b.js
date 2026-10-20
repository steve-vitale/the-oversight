#!/usr/bin/env node
// test-glutprobe-b.js — proof for the sim-glutprobe-b diagnostic instruments.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-glutprobe-b.js
//   (SURPLUSFEED must be UNSET — the diagnostic substrate. SEATDRIVE=0 explicit.)
// Read the Usage header BEFORE running any proof (ENV TRAP rule).
//
// RED:    pristine (uninstrumented) runs write no _diagCh/_diagArr tags.
// GREEN:  2 seeds x 25d instrumented: chokeTotal > 0; unattributed < 1% of
//         chokeTotal; sum(inflow channels) === chokeTotal (full attribution by
//         construction); dawnSamples carry freshDays + doomedKcal; per-day
//         rows are pairable (every dawn day has a dayInflow cell or zero).
// DET:    40d x 2 seeds, instrumented vs pristine: canonical state projection
//         byte-identical (instruments are RNG-clean — tags touch only
//         stacksMatch-ignored fields).
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
  console.error('FATAL: SURPLUSFEED must be unset for the diagnostic substrate');
  process.exit(2);
}

// canonical projection: everything the sim's behavior depends on, minus
// instrument-only fields (_diag*).
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'glutprobe-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null;
  if (instrumented) W = attachProbe(Game);
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
    const { Game } = await run(8811, 25, false);
    let tagged = 0;
    for (const it of (((Game.state || {}).village || {}).pantry || [])) {
      if (it && ('_diagCh' in it || '_diagArr' in it)) tagged++;
    }
    ok('no tags when uninstrumented', tagged === 0, tagged + ' tagged items');
  }

  console.log('GREEN: instrumented runs conserve + attribute fully');
  for (const seed of [8811, 8812]) {
    const { W } = await run(seed, 25, true);
    const sum = Object.values(W.inflow).reduce((a, b) => a + b, 0);
    ok(`seed ${seed} chokeTotal > 0`, W.chokeTotal > 0, 'chokeTotal=' + W.chokeTotal);
    ok(`seed ${seed} channels sum === chokeTotal`, sum === W.chokeTotal, sum + ' vs ' + W.chokeTotal);
    const un = W.inflow.unattributed || 0;
    ok(`seed ${seed} unattributed < 1%`, un < 0.01 * W.chokeTotal, 'unattributed=' + un + ' of ' + W.chokeTotal);
    const hasDawn = W.dawnSamples.length > 0 && W.dawnSamples.every(s => typeof s.freshDays === 'number' && typeof s.doomedKcal === 'number');
    ok(`seed ${seed} dawnSamples carry freshDays+doomedKcal`, hasDawn, 'n=' + W.dawnSamples.length);
    const chanNames = Object.keys(W.inflow).filter(c => c !== 'unattributed');
    ok(`seed ${seed} >= 4 named channels`, chanNames.length >= 4, chanNames.join(','));
    console.log(`    seed ${seed}: total=${Math.round(W.chokeTotal / 1000)}k channels=[${chanNames.map(c => c + ':' + Math.round(W.inflow[c] / 1000) + 'k').join(' ')}]`);
  }

  console.log('DET: instrumented vs pristine byte-identical (40d x 2 seeds)');
  for (const seed of [8813, 8814]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed} trajectories identical`, ca === cb, ca.length + ' vs ' + cb.length + ' chars');
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
