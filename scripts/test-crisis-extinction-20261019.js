#!/usr/bin/env node
// test-crisis-extinction-20261019.js — CRISIS LEG r25 proof.
// Blank: a village ground to ZERO living villagers by violence kept
// simulating a ghost village. Observed in the wild: seed 42 ran 40+
// game-days with 0 living on a 6-deep roster (ids on the roster whose
// person records are gone — the death spiral's ghost state), endReason
// 'survived', Game.over false. The famine path (villageEats scatter check)
// sets over + villageLost, but only famine could end a village. Canon: the
// run ends when the village "dies out (game over)" — the scattering isn't
// the only death.
// The ghost state is built the way the sim builds it: ids left on the
// roster with no living person record (rosterChars entry gone). The fix
// lives in endDay (game.js), right after villageEats — NOT inside
// villageEats, whose roster is pre-filtered to members-only by the
// membership wrap (dead villagers aren't members).
// RED on pristine: the extinction asserts fail (no such check exists).
// GREEN after fix. Run: node scripts/test-crisis-extinction-20261019.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const proofCase = require('./godpath/isolated-proof-cases')(['7','42','99']);
const SEEDS = [Number(proofCase)];
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
// Count canonical living people; a snapshot is neither required nor sufficient.
function livingCount(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { const c = id && Game.vpOf(id); return c && c.id === id && !c.dead && c.alive !== false; }).length;
}
// build the observed ghost state: every roster id loses its person record,
// the way the death spiral leaves them (id on roster, nobody home). The
// scholar's id stays on the roster too — the ghost scholar is the bug.
function ghostTheVillage(Game, keepOne) {
  const v = Game.state.village || {};
  const rc = v.rosterChars || {};
  const ids = (v.roster || []).slice();
  const keep = keepOne ? ids[0] : null;
  for (const id of ids) {
    if (id === keep) continue;
    delete rc[id];
    const di = (Game.data.villagers || []).findIndex(x => x && x.id === id);
    if (di >= 0) Game.data.villagers.splice(di, 1);
  }
}

(async () => {
  for (const seed of SEEDS) {
    console.log('seed ' + seed);
    const { Game } = await loadGame({ seed, mode: 'crisis-extinction' });
    await setupGame(Game);

    // control: one living soul on the roster → the run must continue
    ghostTheVillage(Game, true);
    ok('precondition: one living', livingCount(Game) === 1, 'living=' + livingCount(Game));
    Game.over = false; Game.villageLost = false;
    try { Game.endDay(); } catch (e) { console.log('  (endDay threw: ' + e.message + ')'); }
    ok('one living soul keeps the run alive', Game.over === false,
       'over=' + Game.over);

    // the blank: ZERO living, roster non-empty → the run must end
    ghostTheVillage(Game, false);
    ok('precondition: zero living, roster non-empty',
       livingCount(Game) === 0 && (Game.state.village.roster || []).length > 0,
       'living=' + livingCount(Game) + ' roster=' + (Game.state.village.roster || []).length);
    Game.over = false; Game.villageLost = false;
    try { Game.endDay(); } catch (e) { console.log('  (endDay threw: ' + e.message + ')'); }
    ok('violent extinction ends the run', Game.over === true && Game.villageLost === true,
       'over=' + Game.over + ' villageLost=' + Game.villageLost);
    ok('extinction flag set (fires once)', (Game.state.village || {}).extinct === true,
       'extinct=' + (Game.state.village || {}).extinct);

    // once-flag: a second tick must not re-announce / re-wipe / throw
    let threw = false;
    try { Game.endDay(); } catch (e) { threw = true; }
    ok('repeat ticks safe after extinction', !threw && Game.over === true,
       threw ? 'threw' : 'over=' + Game.over);
  }
  console.log(pass + '/' + (pass + fail) + ' green');
  process.exit(fail ? 1 : 0);
})();
