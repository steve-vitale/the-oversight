// test-journey-deepening-r51-corpse-range-20261026.js -- proof test for the
// R51 corpse-loot range fix (journey-deepening r51, arm-proven).
//
// BEFORE (bug): _corpseCheckRange / lootCorpse read the scholar's cell with
// `s.mx || 4` / `s.my || 4`, so a scholar standing on row/col 0 was read as
// standing at the center (4,4). Concretely, on 42003 day 37 the scholar stood
// at (4,0) and a corpse at (4,4) PASSED the range gate (the take then failed
// on weight instead of range) — looting from 4 cells away. The mirror case
// falsely refused: scholar at (0,4) beside a corpse at (0,4) read as (4,4)
// vs (0,4) and failed range.
// AFTER (fix): `?? 4` keeps 0 as a real coordinate; undefined still defaults
// to the center. Usage: node scripts/test-journey-deepening-r51-corpse-range-20261026.js
// Exits non-zero on any failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r51-corpse-range-proof', fullTelemetry: true });
  await setupGame(Game);
  // Capture say lines (harness silences say by default).
  const said = [];
  const origSay = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return origSay.apply(this, a); } catch (e) { return a[0]; } };
  // Pin the map node; corpses below all sit on it.
  Game.map.px = 4; Game.map.py = 4;
  const s = Game.state.scholar;
  const mkCorpse = (mx, my) => ({ id: 'corpse_probe', node: { x: 4, y: 4 }, mx, my, items: [], buried: false });
  let failures = 0;
  const check = (label, actual, expected) => {
    const ok = actual === expected;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: got=${actual} want=${expected}`);
    if (!ok) failures++;
  };
  const range = (smx, smy, cmx, cmy) => {
    s.mx = smx; s.my = smy;
    return Game._corpseCheckRange(mkCorpse(cmx, cmy), true);
  };
  // The arm-proven case: scholar (4,0), corpse (4,4) — must NOT pass.
  check('scholar(4,0) vs corpse(4,4) out of range', range(4, 0, 4, 4), false);
  // Mirror case: scholar (0,4), corpse (0,4) — adjacent, must pass.
  check('scholar(0,4) vs corpse(0,4) in range', range(0, 4, 0, 4), true);
  // Scholar (0,0), corpse (0,0) — same edge cell, must pass.
  check('scholar(0,0) vs corpse(0,0) in range', range(0, 0, 0, 0), true);
  // Scholar (0,8), corpse (4,4) — the arm's common EOD position, out of range.
  check('scholar(0,8) vs corpse(4,4) out of range', range(0, 8, 4, 4), false);
  // Center and adjacency still behave.
  check('scholar(4,4) vs corpse(4,4) in range', range(4, 4, 4, 4), true);
  check('scholar(4,3) vs corpse(4,4) adjacent in range', range(4, 3, 4, 4), true);
  check('scholar(4,2) vs corpse(4,4) out of range', range(4, 2, 4, 4), false);
  // Undefined position still defaults to the center (old behavior preserved).
  s.mx = undefined; s.my = undefined;
  check('scholar(undefined) vs corpse(4,4) defaults to center', Game._corpseCheckRange(mkCorpse(4, 4), true), true);
  // lootCorpse's own inline check: scholar (4,0) vs corpse (4,4) with no
  // items must fail on RANGE ('Too far'), not fall through to the
  // 'Nothing left' branch (which is what the bug produced: range passed,
  // then the empty-items branch fired).
  s.mx = 4; s.my = 0;
  said.length = 0;
  const list = Game.corpses();
  list.push({ id: 'corpse_lootprobe', node: { x: 4, y: 4 }, mx: 4, my: 4, items: [], buried: false });
  const r = Game.lootCorpse('corpse_lootprobe', false);
  const saidTooFar = said.some(x => /Too far/.test(x));
  check('lootCorpse scholar(4,0) vs corpse(4,4) returns null', r, null);
  check('lootCorpse scholar(4,0) vs corpse(4,4) says Too far', saidTooFar, true);
  if (failures) { console.log(`RESULT: ${failures} FAILURE(S)`); process.exit(1); }
  console.log('RESULT: all corpse-range checks passed');
  process.exit(0);
})().catch(e => { console.error('PROOF ERROR', e && e.stack); process.exit(1); });
