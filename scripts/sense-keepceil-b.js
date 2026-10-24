#!/usr/bin/env node
// sense-keepceil-b.js — SENSE-TESTING for the KEEPCEIL keep-ceiling knob
// (sim-keepceil-b, 2026-10-24).
//
// Runs 2 pilot seeds on leadfeast, DG=1, KEEPCEIL=4000/6000/8000, 100d,
// capturing the homecoming keep beats (Game.say lines about keeping,
// pantry fullness, hauls). The author reads the transcripts for voice,
// coherence, and consequences — SENSE-TESTING LAW (Steve 2026-10-11):
// transcripts over counts. Questions: does the keep decision read as a
// person making a legible pantry decision at each ceiling level (not a
// silent throttle, not a robotic repeat)? Does the raised-keep voice
// ("The pantry is bursting past tomorrow…") fire exactly when the keep
// actually exceeded the old 2000 ceiling, and stay silent otherwise?
// Does a lower ceiling (4000) read as a smaller keep in the fiction, not
// just in the ledger?
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 DEPOSITGATE=1 PLENTYDEPRI=0 \
//   node scripts/sense-keepceil-b.js
// Prints KEEPCEIL=4000/6000/8000 transcripts per seed.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' ||
    process.env.DEPOSITGATE !== '1' || process.env.PLENTYDEPRI !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0, DEPOSITGATE=1, PLENTYDEPRI=0 required');
  process.exit(2);
}
const SEEDS = (process.env.SENSE_SEEDS || '9253,9255').split(',').map(s => parseInt(s.trim(), 10));

async function oneCase(seed, kc) {
  process.env.KEEPCEIL = String(kc);
  const { Game } = await loadGame({ seed, mode: 'sense-keepceil', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (/keep|bursting|pantry|haul|unload|pack/i.test(t))
        lines.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + t.slice(0, 200));
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, leadfeast, { days: 100, manifest: null });
  return { lines };
}

(async () => {
  for (const seed of SEEDS) {
    for (const kc of [4000, 6000, 8000]) {
      const r = await oneCase(seed, kc);
      console.log(`\n===== seed=${seed} leadfeast KEEPCEIL=${kc} DG=1 (${r.lines.length} keep/pantry lines) =====`);
      for (const l of r.lines) console.log('  ' + l);
    }
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
