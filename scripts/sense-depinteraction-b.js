#!/usr/bin/env node
// sense-depinteraction-b.js — SENSE-TESTING for the PD x DG interaction
// (sim-depinteraction-b, 2026-10-23). Runs 2 strong-engagement seeds
// (leadfeast + belongfeast) on the DG=1 leg, PD=0 vs PD=1, 60d, capturing
// the day-voice lines (Game.say) of both levers' easing beats. The author
// reads the transcripts for voice, coherence, and consequences —
// SENSE-TESTING LAW (Steve 2026-10-11): transcripts over counts.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=1 \
//   node scripts/sense-depinteraction-b.js
// Prints PD=0 vs PD=1 transcripts side by side per seed/policy.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1 required');
  process.exit(2);
}
// strong-engagement seeds from the pilot: leadfeast 9255 (rot 469k dg1 / 397k pd1dg1),
// belongfeast 9256 (rot 316k dg1)
const CASES = [
  { seed: 9255, policy: leadfeast, pname: 'leadfeast' },
  { seed: 9256, policy: belongfeast, pname: 'belongfeast' },
];

async function oneCase(seed, policy, pd) {
  process.env.PLENTYDEPRI = pd ? '1' : '0';
  const { Game } = await loadGame({ seed, mode: 'sense-depinteraction', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (/🍽️|plent|pantry|haul|fire|surplus|ease/i.test(t)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + t.slice(0, 160));
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, policy, { days: 60, manifest: null });
  const v = Game.state.village || {};
  let depriK = 0, dgK = 0;
  try { for (const d of Object.values((v._plentyDepri || {}).days || {})) depriK += (d.kcal || 0); } catch (e) {}
  try { for (const d of Object.values((v._depositGate || {}).days || {})) dgK += (d.shareEased || 0); } catch (e) {}
  return { lines, depriK: Math.round(depriK), dgK: Math.round(dgK) };
}

(async () => {
  for (const { seed, policy, pname } of CASES) {
    for (const pd of [0, 1]) {
      const r = await oneCase(seed, policy, pd);
      console.log(`\n===== seed=${seed} ${pname} PD=${pd} DG=1 (depriK=${r.depriK} dgShareEasedK=${r.dgK}) =====`);
      for (const l of r.lines.slice(0, 40)) console.log(l);
      if (r.lines.length > 40) console.log(`... (${r.lines.length - 40} more lines)`);
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
