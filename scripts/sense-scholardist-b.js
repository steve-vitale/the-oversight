#!/usr/bin/env node
// sense-scholardist-b.js — sense-test for the scholar's bowl voiced beat.
//
// Loads the game (same harness + substrate as the pilot), arms the
// SCHOLARDIST=1 layer, wraps Game.say to keep a day-stamped transcript,
// runs 60d of leadfeast, and prints every scholar-bowl beat with the 10
// preceding and 4 following narration lines — the actual transcript in
// context, so a human can judge meaning/coherence (SENSE-TESTING LAW),
// not just beat counts.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const scholardist = require('./layers/scholardist-b');

(async () => {
  process.env.SCHOLARDIST = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const seed = 67401;
  const { Game, manifest } = await loadGame({ seed, mode: 'scholardist-sense' });
  await setupGame(Game, 'Columbus, Ohio');
  const { tele, uninstall } = scholardist.install(Game);

  const transcript = [];
  const origSay = Game.say;
  Game.say = function (s) {
    const day = ((this.state && this.state.scholar) || {}).day || 0;
    transcript.push({ day, text: String(s) });
    return origSay ? origSay.call(this, s) : undefined;
  };

  const result = await runDays(Game, belongfeast, { days: 150, manifest });
  uninstall();

  const beatIdx = [];
  transcript.forEach((t, i) => { if (/push half your bowl|second half|Half your share|wave off the second scoop|half-full|eats first tonight/i.test(t.text) && /🍽️/.test(t.text)) beatIdx.push(i); });
  console.log(`days=${result.gameDays} end=${result.endReason} scholar-bowl beats=${beatIdx.length} tele=${JSON.stringify({ halves: tele.halves, voices: tele.voices, errors: tele.errors })}\n`);

  // print the first 3 beats in context (day-stamped)
  for (const bi of beatIdx.slice(0, 3)) {
    console.log('=== beat in context ===');
    for (let i = Math.max(0, bi - 10); i < Math.min(transcript.length, bi + 5); i++) {
      const marker = i === bi ? '  >>> ' : '      ';
      console.log(marker + 'd' + transcript[i].day + ': ' + transcript[i].text.slice(0, 160));
    }
    console.log('');
  }
  if (!beatIdx.length) console.log('NO BEATS — mechanism never voiced in 60d (would be killed-at-pilot)');
})().catch(e => { console.error('SENSE FAIL: ' + (e && e.stack || e)); process.exitCode = 1; });
