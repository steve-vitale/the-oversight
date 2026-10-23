#!/usr/bin/env node
// sense-scholardist-confirm-b.js — sense-test for the scholar's share voiced
// beat on a FRESH confirm seed.
//
// Loads the game (same harness + substrate as the confirm sweep), arms the
// SCHOLARDIST=1 layer, wraps Game.say to keep a day-stamped transcript,
// runs 150d of belongfeast, and prints every scholar's-share beat with the
// 10 preceding and 4 following narration lines — the actual transcript in
// context, so a human can judge meaning/coherence (SENSE-TESTING LAW), not
// just beat counts. Seed via SENSE_SEED (default 67501, the r1 fresh seed;
// r2 uses 92801) — must be a fresh seed, never used before.
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
  const seed = process.env.SENSE_SEED ? +process.env.SENSE_SEED : 67501;
  const { Game, manifest } = await loadGame({ seed, mode: 'scholardist-confirm-sense' });
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
  console.log(`days=${result.gameDays} end=${result.endReason} scholar-share beats=${beatIdx.length} tele=${JSON.stringify({ halves: tele.halves, voices: tele.voices, errors: tele.errors })}\n`);

  // print the first 4 beats in context (day-stamped)
  for (const bi of beatIdx.slice(0, 4)) {
    console.log('=== beat in context ===');
    for (let i = Math.max(0, bi - 10); i < Math.min(transcript.length, bi + 5); i++) {
      const marker = i === bi ? '  >>> ' : '      ';
      console.log(marker + 'd' + transcript[i].day + ': ' + transcript[i].text.slice(0, 160));
    }
    console.log('');
  }
  if (!beatIdx.length) console.log('NO BEATS — mechanism never voiced in 150d (would be killed-at-pilot)');
})().catch(e => { console.error('SENSE FAIL: ' + (e && e.stack || e)); process.exitCode = 1; });
