#!/usr/bin/env node
// test-firenarr-deploy-b.js — proof for the (v**) firing-evening
// narration DEPLOY (sim-firenarr-deploy-b). Drives the real
// Game._firenarrEvening() method from game.js through the shared
// sim harness (loadGame/setupGame), with the pantry, streak, day,
// and gate inputs set directly per evening. The gate input is
// stubbed on the instance ONLY to select engaged/disengaged
// evenings deterministically; the method under test, the
// templates, and the pantry/streak reads are all real.
// No judged seeds, no RNG assertions, no writes, no Game.save stub.
// Run: node scripts/test-firenarr-deploy-b.js (exit 0 = pass)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
const HUNGER_WORDS = ['hungr', 'starv', 'belly', 'bellies', 'famish'];
function templateOk(line) {
  return typeof line === 'string' && line.length <= 85
    && line.includes('store') && line.includes('recent high')
    && !/\d/.test(line) && !line.includes('%') && !/days/i.test(line)
    && !HUNGER_WORDS.some((w) => line.toLowerCase().includes(w))
    && !/stand|gate|throttle/i.test(line);
}

async function main() {
  const { Game } = await loadGame({ seed: 999201 });
  await setupGame(Game);
  if (typeof Game._firenarrEvening !== 'function') {
    console.log('FAIL hook method missing on Game');
    process.exit(1);
  }
  const said = [];
  const origSay = Game.say;
  Game.say = function (...args) {
    try { said.push(String(args[0] || '')); } catch (e) {}
    return origSay.apply(this, args);
  };
  const v = Game.state.village;
  function evening(day, store, streak, engaged) {
    Game.state.scholar.day = day;
    v.pantry = [{ kcalEach: store, units: 1 }];
    try { Game.progState().hungryStreak = streak; } catch (e) {}
    Game._depositGateEngaged = () => !!engaged;
    const before = said.length;
    const ret = Game._firenarrEvening();
    return { lines: said.slice(before), ret };
  }
  function freshState() { try { delete v._firenarr; } catch (e) {} }

  // 1. E1 first firing, then repeat silence, then escalation.
  freshState();
  let r = evening(8, 10000, 1, false); // stretch start: silent
  check('E1 leg: stretch start silent', r.lines.length === 0, r);
  r = evening(9, 9500, 1, false); // fall 1, 0.95: silent
  check('E1 leg: one fall silent', r.lines.length === 0, r);
  r = evening(10, 8400, 1, false); // fall 2, 0.84 <= 0.85: E1
  check('E1 leg: E1 fires day 10', r.lines.length === 1 && r.lines[0].includes('shelves are thinning') && !r.lines[0].includes('again'), r);
  check('E1 leg: template constraints', r.lines.every(templateOk), r);
  r = evening(11, 8000, 1, false); // repeat: silent (not yet cliff)
  check('E1 leg: repeat silent', r.lines.length === 0, r);
  r = evening(12, 6400, 2, false); // 0.64 <= 0.65: escalation, once
  check('E1 leg: escalation fires', r.lines.length === 1 && r.lines[0].includes('fallen further still'), r);
  r = evening(13, 6000, 2, false); // after escalation: silent
  check('E1 leg: post-escalation silent', r.lines.length === 0, r);

  // 2. Tie evening: E1 + F conditions both hold -> (e**) template wins.
  freshState();
  evening(8, 10000, 1, false);
  evening(9, 9500, 1, false);
  r = evening(10, 7900, 1, false); // falls 2... wait: falls=2, need F falls>=3? falls: 9 (1), 10 (2) -> F needs 3, NOT a tie. Use 3 falls:
  // (corrected below: this evening is E1-only; tie case follows)
  check('tie leg: E1-only evening fires E1', r.lines.length === 1 && r.lines[0].includes('shelves are thinning'), r);
  freshState();
  evening(8, 10000, 1, false);
  evening(9, 9500, 1, false);
  evening(10, 9000, 1, false); // falls 3, 0.90: silent
  r = evening(11, 7900, 1, false); // falls 4, 0.79 <= 0.85 AND <= 0.80: tie -> E1 wins
  check('tie leg: E1 wins over F on tie evening', r.lines.length === 1 && r.lines[0].includes('shelves are thinning') && !r.lines[0].includes('keeps slipping'), r);

  // 3. F-first: slow drain, streak 0 throughout.
  freshState();
  evening(8, 10000, 0, false);
  evening(9, 9600, 0, false);
  evening(10, 9200, 0, false);
  r = evening(11, 7900, 0, false); // falls 3, 0.79 <= 0.80, streak 0: F
  check('F leg: F fires with streak 0', r.lines.length === 1 && r.lines[0].includes('keeps slipping') && r.lines[0].includes('evening after evening'), r);
  check('F leg: template constraints', r.lines.every(templateOk), r);

  // 4. E2 cliff first: streak >= 1, straight to 0.65, no escalation after.
  freshState();
  evening(8, 10000, 1, false);
  r = evening(9, 6400, 1, false); // 0.64 <= 0.65: E2 (falls 1, so not E1)
  check('E2 leg: E2 fires', r.lines.length === 1 && r.lines[0].includes('nearly bare'), r);
  r = evening(10, 5000, 2, false);
  check('E2 leg: no escalation after E2', r.lines.length === 0, r);

  // 5. E2 needs a streak: cliff with streak 0 does NOT fire (e**).
  freshState();
  evening(8, 10000, 0, false);
  r = evening(9, 6400, 0, false); // 0.64, falls 1 < 3: neither clause
  check('streak leg: cliff without streak silent', r.lines.length === 0, r);

  // 6. D < 8 and stretch-start day never fire.
  freshState();
  evening(2, 10000, 1, false);
  r = evening(3, 5000, 1, false); // would be E2, but day < 8
  check('early leg: day < 8 silent', r.lines.length === 0, r);

  // 7. Engaged evening ends the stretch; next stretch uses "again".
  freshState();
  evening(8, 10000, 1, false);
  evening(9, 9500, 1, false);
  r = evening(10, 8400, 1, false);
  check('again leg: first stretch E1', r.lines.length === 1 && !r.lines[0].includes('again'), r);
  r = evening(11, 8400, 1, true); // engaged: ends stretch, silent
  check('again leg: engaged evening silent', r.lines.length === 0, r);
  evening(12, 12000, 0, false); // new stretch start
  evening(13, 11000, 1, false);
  r = evening(14, 10000, 1, false); // falls 2, 10000/12000 = 0.833: E1 again
  check('again leg: second stretch uses again variant', r.lines.length === 1 && r.lines[0].includes('again') && r.lines[0].includes('shelves are thinning'), r);
  check('again leg: template constraints', r.lines.every(templateOk), r);

  // 8. Same-day re-entry never double-fires.
  freshState();
  evening(8, 10000, 1, false);
  evening(9, 9500, 1, false);
  r = evening(10, 8400, 1, false);
  check('re-entry leg: first call fires', r.lines.length === 1, r);
  r = evening(10, 8400, 1, false); // same game day again
  check('re-entry leg: second call same day silent', r.lines.length === 0, r);

  // 9. Rising store updates the peak (no false firing off a stale peak).
  freshState();
  evening(8, 10000, 1, false);
  evening(9, 12000, 1, false); // peak rises to 12000
  r = evening(10, 11000, 1, false); // fall 1, 11000/12000 = 0.917: silent
  check('peak leg: rise updates peak', r.lines.length === 0, r);

  console.log(`test-firenarr-deploy-b: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL', e); process.exit(2); });
