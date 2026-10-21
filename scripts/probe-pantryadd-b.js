#!/usr/bin/env node
// probe-pantryadd-b.js — bound the pantryAdd tag-stripping question for
// sim-rotdiff-b: how much kcal flows through Game.pantryAdd (which builds a
// fresh _entry WITHOUT the _rd* tags) on the rotdiff substrate?
// Read-only counters; 60d x 2 seeds x {leadfeast, belongfeast}.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}

(async () => {
  for (const [pid, pol] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
    for (const seed of [22031, 22032]) {
      const { Game } = await loadGame({ seed, mode: 'pantryadd-probe', fullTelemetry: false });
      await setupGame(Game);
      let calls = 0, kcal = 0;
      const oPA = Game.pantryAdd;
      if (typeof oPA === 'function') Game.pantryAdd = function (item) {
        try { calls++; kcal += Math.round((item.kcalEach || 0) * (item.units || 0)); } catch (e) {}
        return oPA.apply(this, arguments);
      };
      await runDays(Game, pol, { days: 60, manifest: null, sampleEvery: 61 });
      console.log(`${pid} s${seed}: pantryAdd calls=${calls} kcal=${Math.round(kcal / 1000)}k`);
    }
  }
})().catch(e => { console.error('PROBE CRASH', e); process.exit(2); });
