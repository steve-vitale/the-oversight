#!/usr/bin/env node
// test-exile-grace-20261011.js — PROOF (journey-social leg 2026-10-11).
//
// BUG: the moot is AT Haven, and the exile sentence ("take what you can
// carry and go") never stated a deadline — but justiceTick fired the
// defied-exile uprising on the very next day-part tick, while the exile was
// still standing at the fire. Defiance was a surprise, not a choice.
// FIX: (1) exilePlayer speaks the deadline aloud ("by dawn"); (2)
// justiceTick only treats presence at Haven as defiance once the sentence
// day has passed (today > exileDay).
//
// RED on old code: same-day justiceTick() at Haven starts the uprising.
// GREEN: deadline spoken; same-day ticks quiet; next-day tick at Haven fires
//   the uprising; leaving Haven avoids it entirely.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(cond, label) {
  console.log((cond ? 'ok   ' : 'FAIL ') + label);
  if (!cond) failures++;
}

function atHaven(Game, yes) {
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  if (!Game.map) Game.map = {};
  if (yes) { Game.map.px = hx; Game.map.py = hy; }
  else { Game.map.px = hx + 3; Game.map.py = hy; }
}

(async () => {
  // --- part 1: deadline is spoken ---
  {
    const { Game } = await loadGame({ seed: 777, mode: 'exile-grace' });
    await setupGame(Game);
    const said = [];
    Game.say = function (t) { said.push(String(t == null ? '' : t)); };
    atHaven(Game, true);
    Game.exilePlayer('moot');
    check(said.some(s => /by dawn/i.test(s)), 'exile sentence speaks the dawn deadline');
    check(said.some(s => /won\u2019t ask twice|won't ask twice/i.test(s)), 'deadline names the consequence');
    const j = Game.justiceState();
    check(j.exiled === true && j.exileDay === Game.state.scholar.day, 'exileDay recorded as the sentence day');
  }
  // --- part 2: same-day ticks at Haven do NOT start the uprising ---
  {
    const { Game } = await loadGame({ seed: 777, mode: 'exile-grace' });
    await setupGame(Game);
    Game.say = function () {};
    atHaven(Game, true);
    Game.exilePlayer('moot');
    Game.justiceState().stage = 3; // as syncJusticeAfterMoot('exile') leaves it
    for (let i = 0; i < 4; i++) { try { Game.justiceTick(); } catch (e) {} }
    const uprising = !!(Game.tbfight && Game.tbfight.uprising);
    check(!uprising, 'same-day: 4 justiceTicks at Haven, no uprising');
    check(Game.justiceState().stage === 3, 'same-day: ladder still at stage 3 (enforcement, not war)');
  }
  // --- part 3: next day at Haven DOES fire the uprising ---
  {
    const { Game } = await loadGame({ seed: 777, mode: 'exile-grace' });
    await setupGame(Game);
    Game.say = function () {};
    atHaven(Game, true);
    Game.exilePlayer('moot');
    Game.justiceState().stage = 3;
    Game.state.scholar.day += 1; // dawn came; still here
    try { Game.justiceTick(); } catch (e) {}
    const uprising = !!(Game.tbfight && Game.tbfight.uprising);
    check(uprising, 'next-day: justiceTick at Haven starts the uprising');
    check(Game.justiceState().stage === 4, 'next-day: ladder at stage 4');
  }
  // --- part 4: leaving Haven avoids it ---
  {
    const { Game } = await loadGame({ seed: 777, mode: 'exile-grace' });
    await setupGame(Game);
    Game.say = function () {};
    atHaven(Game, true);
    Game.exilePlayer('moot');
    Game.justiceState().stage = 3;
    Game.state.scholar.day += 1;
    atHaven(Game, false); // walked
    try { Game.justiceTick(); } catch (e) {}
    const uprising = !!(Game.tbfight && Game.tbfight.uprising);
    check(!uprising, 'next-day away from Haven: no uprising (exile obeyed)');
  }

  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
