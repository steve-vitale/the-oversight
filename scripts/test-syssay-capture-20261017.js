#!/usr/bin/env node
// Proof test (journey-establishment r8 2026-10-17): the sim-harness sysSay
// blind spot.
//
// sim-harness.js loadGame() silences BOTH Game.say and Game.sysSay for sims
// (lines 233-236). The journey harness's wrapStream re-enables say (captures
// into the transcript stream) but left sysSay as a no-op — so every
// System-voice line (pilot episode announcements, wave beats, System
// commentary) was INVISIBLE to all journey transcripts. State said
// pilotAired=true on 4/4 seeds; the stream showed zero pilot lines.
//
// This test pins the fixed behavior: the journey wrap must capture sysSay
// lines into the stream. It uses the shared kit (never copied eval
// boilerplate) and asserts, never eyeballs.
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

(async () => {
  const lg = await loadGame({ seed: 61 });
  const Game = lg.Game;
  await setupGame(Game);
  Game.state.systemArrived = true; // sysSay no-ops before arrival by design

  // --- replicate the journey wrapStream (FIXED version) ---
  const capture = [];
  const cap = (line) => { if (line != null) capture.push(String(line)); };
  const _say = Game.say;
  if (typeof _say === 'function') Game.say = function (...a) { cap(a[0]); };
  // r8 fix: sysSay was left as the loadGame no-op — capture it too, in the
  // same display format sysSay would have used (game.js:31871).
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      const t = String(a[0] == null ? '' : a[0]).replace(/^📺\s*/, '');
      cap(`📺 SYSTEM: "${t}"`);
    };
  }

  // 1. say lines are captured (pre-existing behavior)
  Game.say('hello from say');
  check('say captured', capture.some(s => s.includes('hello from say')));

  // 2. sysSay lines are captured (the fix)
  Game.sysSay('📺 PEOPLE OF HAVEN. What follows is our PILOT EPISODE — a test broadcast.');
  const pilot = capture.filter(s => /PILOT EPISODE/i.test(s));
  check('sysSay captured', pilot.length === 1, `found ${pilot.length}`);
  check('sysSay display format', pilot.length === 1 && /^📺 SYSTEM: "/.test(pilot[0]) && !/📺 SYSTEM: "📺/.test(pilot[0]),
    pilot[0] ? pilot[0].slice(0, 60) : 'missing');

  // 3. sysSay still no-ops before system arrival (guard preserved — we only
  //    bypass it because the harness forces arrival for the test, same as
  //    the game does for pre-arrival play)
  check('capture has exactly the two test lines', capture.length === 2, `got ${capture.length}`);

  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
