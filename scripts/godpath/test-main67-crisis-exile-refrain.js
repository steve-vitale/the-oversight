#!/usr/bin/env node
// test-crisis-exile-refrain-20261019.js — CRISIS LEG r28 (lane B): EXILE REFRAIN.
//
// Blank: the post-exile cold-shoulder line in returnToVillage() fired VERBATIM
// on every return to the Haven tile (transcript-verified: seed 7 drain run,
// days 17-24, 8 identical lines). Filler loop — the cold shoulder should be
// silence, not a nagging identical paragraph.
// Fix: full line on 1st return, short variant on 2nd, quiet afterwards with
// an occasional short line every 3rd return. exileReturnCount resets on exile.
// Usage: node scripts/test-crisis-exile-refrain-20261019.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('../sim-harness');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL: ' + msg); } };
const E = (s) => console.error(s);

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'exile-refrain' });
  await setupGame(Game);
  const s = Game.state.scholar;

  // simulate exile (the state exilePlayer sets, without the full ceremony)
  s.exiled = true;
  s.exileStartDay = s.day;
  try { Game.justiceState().exiled = true; } catch (e) { console.warn('[main67 proof]', e); }

  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); return _say(t); };

  // return to the Haven tile 7 times; capture ONLY the exile-refrain lines
  const refrainLines = [];
  for (let i = 0; i < 7; i++) {
    said.length = 0;
    try { Game.returnToVillage(); } catch (e) { E('  returnToVillage threw: ' + e.message); }
    const refrains = said.filter(t => /Nobody meets your eyes|averted eyes|old paths/i.test(t));
    refrainLines.push(refrains);
  }

  E('refrain lines per return: ' + refrainLines.map(r => r.length).join(','));
  refrainLines.forEach((r, i) => { if (r[0]) E(`  return ${i + 1}: ${r[0].slice(0, 90)}...`); });

  // T1: first return says the full line (pantry closed + amends path named)
  ok(refrainLines[0].length === 1 && /pantry is closed to you/.test(refrainLines[0][0]) && /earning your way back/.test(refrainLines[0][0]),
    'T1 first return: full exile line with amends path');
  // T2: second return varies (not verbatim repeat)
  ok(refrainLines[1].length === 1 && refrainLines[1][0] !== refrainLines[0][0],
    'T2 second return: varied line, not verbatim');
  // T3: third return is quiet (cold shoulder = silence)
  ok(refrainLines[2].length === 0, 'T3 third return: silent (got ' + refrainLines[2].length + ' lines)');
  // T4: fourth return is quiet
  ok(refrainLines[3].length === 0, 'T4 fourth return: silent');
  // T5: fifth return is quiet (5 % 3 != 0)
  ok(refrainLines[4].length === 0, 'T5 fifth return: silent');
  // T6: sixth return (6 % 3 == 0) says the occasional short line
  ok(refrainLines[5].length === 1 && refrainLines[5][0] !== refrainLines[0][0],
    'T6 sixth return: occasional short line');
  // T7: seventh return quiet again
  ok(refrainLines[6].length === 0, 'T7 seventh return: silent');
  // T8: no two consecutive returns repeat verbatim
  let verbatimRepeat = false;
  for (let i = 1; i < 7; i++) {
    if (refrainLines[i].length && refrainLines[i - 1].length && refrainLines[i][0] === refrainLines[i - 1][0]) verbatimRepeat = true;
  }
  ok(!verbatimRepeat, 'T8 no verbatim consecutive repeats');

  E(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
