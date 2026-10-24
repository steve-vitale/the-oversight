#!/usr/bin/env node
// sense-depositrelief-b.js — SENSE-TESTING for the DEPOSITRELIEF=1
// buffer-aware deposit-gate stand-down (sim-depositrelief-b, 2026-10-24).
// Runs 2 seeds on the DG=1 leg, DR=0 vs DR=1, 60d, capturing the day-voice
// lines (Game.say) of the gate ease and relief stand-down beats. The author
// reads the transcripts for voice, coherence, and consequences —
// SENSE-TESTING LAW (Steve 2026-10-11): transcripts over counts. The
// questions: does the stand-down voice read as a person making a legible
// pantry decision (not a silent throttle, not a robotic repeat)? Does the
// contrast with the eased keep-raise voice read as designed (same speaker
// reads the pantry one level deeper and chooses the opposite action)?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=1 PLENTYDEPRI=0 \
//   node scripts/sense-depositrelief-b.js
// Prints DR=0/1 transcripts per seed/policy.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' ||
    process.env.DEPOSITGATE !== '1' || process.env.PLENTYDEPRI !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1, PLENTYDEPRI=0 required');
  process.exit(2);
}
// seeds picked from the sweep pilot for strong relief engagement
const SEEDS = (process.env.SENSE_SEEDS || '9253,9255').split(',').map(s => parseInt(s.trim(), 10));

async function oneCase(seed, dr) {
  process.env.DEPOSITRELIEF = String(dr);
  const { Game } = await loadGame({ seed, mode: 'sense-depositrelief', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (/🍽️|plent|pantry|haul|buffer|surplus|keep|deep|stores behind|back shelves|front shelves|deep pantry/i.test(t))
        lines.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + t.slice(0, 170));
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, leadfeast, { days: 60, manifest: null });
  const v = Game.state.village || {};
  let easedK = 0, sdD = 0, sdDays = 0;
  try {
    for (const d of Object.values((v._depositGate || {}).days || {})) {
      easedK += (d.shareEased || 0) + (d.returnEased || 0) * 0 + (d.bigHaulEased || 0) * 0;
    }
    for (const d of Object.values((v._depositRelief || {}).days || {})) {
      sdD += (d.standDown || 0); if ((d.standDown || 0) > 0) sdDays++;
    }
  } catch (e) {}
  return { lines, easedK: Math.round(easedK), sdD, sdDays };
}

(async () => {
  for (const seed of SEEDS) {
    for (const dr of [0, 1]) {
      const r = await oneCase(seed, dr);
      console.log(`\n===== seed=${seed} leadfeast DR=${dr} DG=1 (easedK=${r.easedK} standDownDec=${r.sdD} standDownDays=${r.sdDays}) =====`);
      for (const l of r.lines.slice(0, 45)) console.log(l);
      if (r.lines.length > 45) console.log(`... (${r.lines.length - 45} more lines)`);
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
