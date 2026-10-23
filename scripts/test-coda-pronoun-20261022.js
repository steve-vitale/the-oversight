#!/usr/bin/env node
// test-coda-pronoun-20261022.js — journey-endgame r41 blank fix (lane B).
// BEFORE: the beloved win coda put the SUBJECT pronoun after a preposition
// ("the lights stay warm behind he" — seed 83014 transcript).
// AFTER: object case ("behind him / her / them").
// Drives the real Game.tableEpilogue (src/js/table.js) on a live setupGame
// scholar for all three gender states and asserts the rendered line.
// Zero new RNG draws; the game seed only fixes setupGame's roster.
// Run: node scripts/test-coda-pronoun-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 83014, mode: 'coda-pronoun', fullTelemetry: false });
  await setupGame(Game);

  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = (t) => { lines.push(String(t)); return oSay(t); };
  Game.save = () => {};
  Game.tableAscended = () => [];

  function codaLineFor(gender) {
    lines.length = 0;
    const pg = Game.progState();
    pg.table = { path: 'beloved', branch: 'light', facilitated: {} };
    // the epilogue names the Bearer <redacted> data.villagers + villagerId
    const v = (Game.data.villagers || [])[0];
    if (v) { v.name = 'Test Bearer'; v.gender = gender; }
    Game.tableEpilogue({ name: 'The Beloved' }, 'light', { id: 'quiet', label: 'Speak for the quiet ones.' });
    return lines.find(l => l.indexOf('leaves humming') >= 0) || null;
  }

  const male = codaLineFor('m');
  ok(male && /behind him\./.test(male), 'male bearer: "behind him"', male ? male.slice(-60) : 'no coda line');
  ok(male && !/behind he[.\s]/.test(male), 'male bearer: no "behind he"');

  const female = codaLineFor('f');
  ok(female && /behind her\./.test(female), 'female bearer: "behind her"', female ? female.slice(-60) : 'no coda line');
  ok(female && !/behind she[.\s]/.test(female), 'female bearer: no "behind she"');

  const unknown = codaLineFor(null);
  ok(unknown && /behind them\./.test(unknown), 'unknown gender: "behind them"', unknown ? unknown.slice(-60) : 'no coda line');

  // subject-position uses elsewhere are untouched
  ok(/which is how he walked in/.test(male || ''), 'beloved coda keeps subject "he" in subject position');

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
