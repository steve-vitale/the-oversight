#!/usr/bin/env node
// sense-bufferdepri-b.js — SENSE-TESTING for the PLENTYDEPRI=2 buffer-aware
// easing lever (sim-bufferdepri-b, 2026-10-23/24). Runs 2 strong-engagement
// seeds on the DG=0 leg, PD=0 vs PD=1 vs PD=2, 60d, capturing the day-voice
// lines (Game.say) of the easing and stand-down beats. The author reads the
// transcripts for voice, coherence, and consequences — SENSE-TESTING LAW
// (Steve 2026-10-11): transcripts over counts. The questions: does the
// stand-down voice read as a person making a legible pantry decision (not
// a silent throttle, not a robotic repeat)? Does the ease voice still read
// as PD=1 where the buffer is thick?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=0 \
//   node scripts/sense-bufferdepri-b.js
// Prints PD=0/1/2 transcripts per seed/policy.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.DEPOSITGATE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=0 required');
  process.exit(2);
}
// strong-engagement seeds from the substrate pilot (rot 500k+ on dg0)
const CASES = [
  { seed: 9253, policy: leadfeast, pname: 'leadfeast' },
  { seed: 9255, policy: leadfeast, pname: 'leadfeast' },
];

async function oneCase(seed, policy, pd) {
  process.env.PLENTYDEPRI = String(pd);
  const { Game } = await loadGame({ seed, mode: 'sense-bufferdepri', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (/🍽️|plent|pantry|haul|buffer|surplus|ease|stores behind|back shelves|deep pantry/i.test(t))
        lines.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + t.slice(0, 170));
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, policy, { days: 60, manifest: null });
  const v = Game.state.village || {};
  let depriK = 0, sdK = 0, sdD = 0;
  try {
    for (const d of Object.values((v._plentyDepri || {}).days || {})) {
      depriK += (d.kcal || 0); sdK += (d.standDownKcal || 0); sdD += (d.standDown || 0);
    }
  } catch (e) {}
  return { lines, depriK: Math.round(depriK), sdK: Math.round(sdK), sdD };
}

(async () => {
  for (const { seed, policy, pname } of CASES) {
    for (const pd of [0, 1, 2]) {
      const r = await oneCase(seed, policy, pd);
      console.log(`\n===== seed=${seed} ${pname} PD=${pd} DG=0 (depriK=${r.depriK} standDownK=${r.sdK} standDownDec=${r.sdD}) =====`);
      for (const l of r.lines.slice(0, 40)) console.log(l);
      if (r.lines.length > 40) console.log(`... (${r.lines.length - 40} more lines)`);
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
