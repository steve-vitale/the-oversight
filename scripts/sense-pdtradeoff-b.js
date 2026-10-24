#!/usr/bin/env node
// sense-pdtradeoff-b.js — SENSE-TESTING for the PLENTYDEPRI=1/0 tradeoff DIAG
// (sim-pdtradeoff-b, 2026-10-24). Derived from scripts/sense-bufferdepri-b.js
// (cited; PD=2 case stripped — the DIAG measures PD=1 vs PD=0 only).
// Runs a strong-engagement seed on the DG=0 leg, PD=0 vs PD=1, 60d,
// capturing the day-voice lines (Game.say) of the easing beat. The author
// reads the PD=1 transcript end to end — SENSE-TESTING LAW (Steve
// 2026-10-11): transcripts over counts. The question: does the ease voice
// still read as a person making a legible pantry decision on current
// master (the bufferdepri sense read is the reference)?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=0 \
//   node scripts/sense-pdtradeoff-b.js
// Prints PD=0/1 transcripts per seed/policy.
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
];

async function oneCase(seed, policy, pd) {
  process.env.PLENTYDEPRI = String(pd);
  const { Game } = await loadGame({ seed, mode: 'sense-pdtradeoff', fullTelemetry: false });
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
  let depriK = 0;
  try {
    for (const d of Object.values((v._plentyDepri || {}).days || {})) depriK += (d.kcal || 0);
  } catch (e) {}
  return { lines, depriK: Math.round(depriK) };
}

(async () => {
  for (const { seed, policy, pname } of CASES) {
    for (const pd of [0, 1]) {
      const r = await oneCase(seed, policy, pd);
      console.log(`\n===== seed=${seed} ${pname} PD=${pd} DG=0 (depriK=${r.depriK}) =====`);
      for (const l of r.lines.slice(0, 60)) console.log(l);
      if (r.lines.length > 60) console.log(`... (${r.lines.length - 60} more lines)`);
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
