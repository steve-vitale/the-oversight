#!/usr/bin/env node
// scripts/sense-traphandbook-b.js — SENSE-TESTING LAW reader for the
// sim-traphandbook-b arm (2026-10-18, loop B food-economy axis).
//
// Prints the actual fiction text the arm produces, for human judgment:
//   1. the day-0 beat (pit-background scholar, seed 105101 — probe-verified
//      pit occupation)
//   2. book-channel moments on a live 60d run (finds, reads, grants)
//
// Judged by sense (sensical, in-voice, in-fiction), not by counts.
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-traphandbook-b.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadTrapHandbook } = require('./policies/traphandbook');

(async () => {
  // 1. the day-0 beat in a real newGame transcript
  {
    const { Game } = await loadGame({ seed: 105101, mode: 'sense-th-beat', fullTelemetry: false });
    const says = [];
    const oSay = Game.say;
    Game.say = function (m) { says.push(String(m)); return oSay.apply(this, arguments); };
    Game.genRoster('Columbus, Ohio');
    const cg = Game.data.characterGen || {};
    const pitChar = Game.generatedRoster.find(c => ((cg.occupations || []).find(o => o.id === c.occupationId) || {}).knowsPit);
    await quietLog(async () => { Game.newGame('Columbus, Ohio', null, pitChar.id); });
    Game.say = oSay;
    console.log('=== DAY-0 BEAT (pit-background scholar) ===');
    for (const s of says) if (/old life comes back|pit you dug/i.test(s)) console.log(s + '\n');
  }
  // 2. book-channel moments on a live run
  {
    const { Game } = await loadGame({ seed: 6901, mode: 'sense-th-run', fullTelemetry: false });
    await setupGame(Game);
    const moments = [];
    const oSay = Game.say;
    Game.say = function (m) {
      try {
        const s = String(m || '');
        if (/You find a book|Trapper Handbook|Recipe: Pit Trap|pit with stakes/i.test(s)) {
          const day = (Game.state.scholar || {}).day || 0;
          moments.push(`[day ${day}] ${s}`);
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, leadTrapHandbook, { days: 60 }); });
    console.log(`=== BOOK MOMENTS (seed 6901, 60d, ${result.endReason}) ===`);
    if (!moments.length) console.log('(no book moments on this run — the channel is a lottery ticket; see the probe for the honest rate)');
    for (const m of moments.slice(0, 20)) console.log(m + '\n');
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
