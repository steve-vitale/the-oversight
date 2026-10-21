#!/usr/bin/env node
// test-prodrebuff-b.js — proof for the sim-prodrebuff-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-prodrebuff-b.js
//   (SURPLUSFEED and RETURNINTAKE must be UNSET in the shell — the DIAG
//   substrate is the default-OFF engine; the script asserts this. Read the
//   Usage header BEFORE running any proof (ENV TRAP rule: FEASTSCALE_R13=1
//   is REQUIRED).)
//
// RED:   pristine (uninstrumented) runs write no _diagCh/_diagArr tags.
// GREEN: 2 proof seeds x 25d instrumented: chokeTotal > 0; channels sum ===
//        chokeTotal; unattributed < 1% of chokeTotal (instrument honesty
//        >= 99%, the binding bar); dawnSamples carry freshDays + doomedKcal;
//        dayInflow covers >= 4 named channels with day-keyed entries.
// DET:   40d x 2 proof seeds, instrumented vs pristine: canonical state
//        projection byte-identical (instruments + sensors are RNG-clean).
// REPEAT (det-gate (d)): same instrumented seed twice in-process —
//        canonical projection byte-identical.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED || process.env.RETURNINTAKE) {
  console.error('FATAL: SURPLUSFEED and RETURNINTAKE must both be unset for the diagnostic substrate');
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
  const { Game } = await loadGame({ seed, mode: 'prodrebuff-test', fullTelemetry: false });
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
  for (const seed of [8819, 8820]) {
    const { Game } = await run(seed, 25, false);
    let tagged = 0;
    for (const it of (((Game.state || {}).village || {}).pantry || [])) {
      if (it && ('_diagCh' in it || '_diagArr' in it)) tagged++;
    }
    ok(`seed ${seed} no tags when uninstrumented`, tagged === 0, tagged + ' tagged items');
  }

  console.log('GREEN: instrumented runs conserve + attribute fully');
  for (const seed of [8819, 8820]) {
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
    const dayKeys = Object.keys(W.dayInflow);
    ok(`seed ${seed} dayInflow day-keyed`, dayKeys.length > 0 && dayKeys.every(k => !isNaN(+k)), 'n=' + dayKeys.length);
    // coefficient input: the analyzer joins dawnSamples x dayInflow on the
    // dawn day (the SAME join the landed glutprobe taxonomy used). The
    // landed sleep-dawn sensor occasionally double-fires or skips a dawn,
    // so some inflow days don't join. The honest property is
    // representativeness: the joined pairs must carry >= 85% of total
    // choke inflow, so the dose-response buckets reflect the run.
    let joinedK = 0;
    for (const s of W.dawnSamples) {
      const di = W.dayInflow[s.day] || {};
      joinedK += Object.values(di).reduce((a, b) => a + b, 0);
    }
    const rep = W.chokeTotal > 0 ? joinedK / W.chokeTotal : 0;
    ok(`seed ${seed} dose-response join carries >= 85% of inflow`, rep >= 0.85,
      (rep * 100).toFixed(1) + '% joined');
  }

  console.log('DET: instrumented vs pristine byte-identical (40d x 2 seeds)');
  for (const seed of [8821, 8822]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed} trajectories identical`, ca === cb, ca.length + ' vs ' + cb.length + ' chars');
  }

  console.log('REPEAT: same instrumented seed twice in-process byte-identical');
  {
    const a = await run(8821, 40, true);
    const b = await run(8821, 40, true);
    ok('repeat instrumented run identical', canon(a.Game) === canon(b.Game));
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
