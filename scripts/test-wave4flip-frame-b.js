#!/usr/bin/env node
// test-wave4flip-frame-b.js — framing-line capture for seed 10421
// (sim-wave4flip-b; diagnostic follow-up, NOT a judged metric change).
// Same band substrate as test-wave4flip-b.js (competent, 100d), plus a
// READ-ONLY capture of r64 betrayal case-framing lines
// ("Nobody's settled ..." / "There's still the matter of ...") with
// the scholar day at capture time, to test whether the r64 framing
// beat actually fires inside the 10421 run.
// Run: node scripts/test-wave4flip-frame-b.js 10421
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = Number(process.argv[2] || 10421);
  const { Game } = await loadGame({ seed, mode: 'caughtlift-fix-band', fullTelemetry: false });
  const frames = [];
  // NOTE: sayLine writes to the DIALOGUE transcript (c.transcript), never
  // to the Game.say narration feed — so the capture wraps sayLine itself.
  const origSayLine = Game.sayLine;
  if (typeof origSayLine === 'function') {
    Game.sayLine = function (vid, line, opts) {
      try {
        const l = String(line || '');
        if (/Nobody's settled|still the matter of/.test(l)) {
          frames.push({ day: Game.state.scholar ? Game.state.scholar.day : '?', line: l });
        }
      } catch (e) {}
      return origSayLine.apply(this, arguments);
    };
  }
  await setupGame(Game);
  const result = await runDays(Game, competent, { days: 100, sampleEvery: 10 });
  console.log('FRAME seed=' + seed + ' days=' + result.days + ' end=' + result.endReason + ' wave=' + (result.maxWaveUnlocked || 1));
  console.log('FRAMES ' + JSON.stringify(frames, null, 1));
})().catch(e => { console.error('FRAME CRASH', e && e.stack || e); process.exit(2); });
