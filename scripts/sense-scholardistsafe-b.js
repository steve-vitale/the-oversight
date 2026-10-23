#!/usr/bin/env node
// sense-scholardistsafe-b.js — sense-test for the scholar-safe voiced beat.
//
// Loads the game (same harness + substrate as the sweep), arms the
// SCHOLARDISTSAFE=1 layer, wraps Game.say to keep a day-stamped
// transcript, runs 150d of belongfeast on fresh seed 67517 (in the sweep
// corpus), and prints every scholar's-share beat with the 10 preceding
// and 4 following narration lines — the actual transcript in context, so
// a human can judge meaning/coherence (SENSE-TESTING LAW), not just beat
// counts. Also prints the day-1 window to show the gated day is silent
// (nothing happens, nothing narrated — canon: no narration of a
// non-event).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const scholardistsafe = require('./layers/scholardistsafe-b');

(async () => {
  process.env.SCHOLARDISTSAFE = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const seed = 67517;
  const { Game, manifest } = await loadGame({ seed, mode: 'scholardistsafe-sense' });
  await setupGame(Game, 'Columbus, Ohio');
  const { tele, uninstall } = scholardistsafe.install(Game);

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
  console.log(`days=${result.gameDays} end=${result.endReason} scholar-safe beats=${beatIdx.length} ` +
    `tele=${JSON.stringify({ halves: tele.halves, grants: tele.grants, voices: tele.voices, gatedBurn: tele.gatedBurn, gatedHunger: tele.gatedHunger, gatedNoMouth: tele.gatedNoMouth, errors: tele.errors })}\n`);

  // the day-1 window: gated days are silent — show the first meal lines to
  // prove no grant beat fires where the old layer fired one.
  console.log('=== day-1 window (the gated day: must be silent) ===');
  for (const t of transcript.filter(t => t.day <= 1).slice(0, 14)) {
    console.log('      d' + t.day + ': ' + t.text.slice(0, 160));
  }
  console.log('');

  // print the first 4 grant beats in context (day-stamped)
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
