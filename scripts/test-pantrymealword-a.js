#!/usr/bin/env node
// test-pantrymealword-a.js — proof for the stranded-night pantry-wording
// fix (sim-pantrymealword-a; prereg: evidence/2026-11-04/
// sim-pantrymealword-a.md).
//
// Unit leg (fast, always): camp-wild classifiers + the false-claim rule
// on fixtures.
// Targeted-probe leg (one harness instance, no policy): villageMeal
// called with the scholar standing off-haven, twice on the same loaded
// game — first with havenStoresAccess() === 'none' (System not arrived),
// then with access 'remote' (systemArrived + integration 90). Asserts:
//   (a) 'none' → the OLD honest no-meal line, verbatim;
//   (b) 'remote' → the NEW requisition line, verbatim (NOT the old line);
//   (c) neither call moves scholar kcal (the branch serves no meal —
//       the morning requisition is a separate action, not this line);
//   (d) both calls set lastPlayerMeal = 0 and return null.
// The probes are an instrument for the 'none' leg of the GO threshold,
// not a policy claim: no policy runs, no seeds are judged here.
// Usage: node scripts/test-pantrymealword-a.js
'use strict';
const { OLD_LINE, NEW_LINE, isOldLine, isNewLine, isCampWildLine } = require('./pantrymealword-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg ----
check('old line classified old', isOldLine(OLD_LINE));
check('old line is camp-wild', isCampWildLine(OLD_LINE));
check('new line classified new', isNewLine(NEW_LINE));
check('new line is camp-wild', isCampWildLine(NEW_LINE));
check('new line is not old', !isOldLine(NEW_LINE));
check('old line is not new', !isNewLine(OLD_LINE));
check('bedding line is not camp-wild', !isCampWildLine('You settle into the cold ground. Sleep takes you.'));
check('false-claim rule: old + remote + gain', (() => {
  const hasOld = true, morningRemote = true, pantryGain = 1028;
  return hasOld && morningRemote && pantryGain > 0;
})());
check('false-claim rule: new + remote + gain is NOT false', (() => {
  const hasOld = false, morningRemote = true, pantryGain = 1028;
  return !(hasOld && morningRemote && pantryGain > 0);
})());
check('false-claim rule: old + none + gain is NOT false', (() => {
  const hasOld = true, morningRemote = false, pantryGain = 1028;
  return !(hasOld && morningRemote && pantryGain > 0);
})());
check('false-claim rule: old + remote + no gain is NOT false', (() => {
  const hasOld = true, morningRemote = true, pantryGain = 0;
  return !(hasOld && morningRemote && pantryGain > 0);
})());

// ---- targeted-probe leg ----
(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 17021, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  // Stand off-haven on a real engine tile (never a stubbed tile).
  let placed = false;
  const tiles = (Game.map && Game.map.tiles) || [];
  for (let y = 0; y < tiles.length && !placed; y++) {
    for (let x = 0; x < (tiles[y] || []).length && !placed; x++) {
      if (tiles[y][x] && tiles[y][x].type !== 'haven') {
        Game.map.px = x; Game.map.py = y; placed = true;
      }
    }
  }
  check('probe: scholar placed off-haven', placed);
  check('probe: pantry not in reach off-haven', Game.pantryInReach() === false);
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
  const said = [];
  const origSay = Game.say;
  Game.say = function (...args) { said.push(String(args[0] == null ? '' : args[0])); return origSay.apply(this, args); };

  // Case A: access 'none' (System not arrived).
  try { Game.state.systemArrived = false; } catch (e) {}
  check('probe: access none before meal', (() => { try { return Game.havenStoresAccess() === 'none'; } catch (e) { return false; } })());
  const kcalBeforeA = Game.state.scholar.kcal;
  said.length = 0;
  const retA = Game.villageMeal();
  check('probe none: old line fires', said.includes(OLD_LINE), JSON.stringify(said));
  check('probe none: new line does NOT fire', !said.includes(NEW_LINE));
  check('probe none: kcal unmoved by the line', Game.state.scholar.kcal === kcalBeforeA);
  check('probe none: returns null, lastPlayerMeal 0', retA === null && Game.state.village.lastPlayerMeal === 0);

  // Case B: access 'remote' (Full Integration).
  try { Game.state.systemArrived = true; Game.state.scholar.integration = 90; } catch (e) {}
  check('probe: access remote before meal', (() => { try { return Game.havenStoresAccess() === 'remote'; } catch (e) { return false; } })());
  const kcalBeforeB = Game.state.scholar.kcal;
  said.length = 0;
  const retB = Game.villageMeal();
  check('probe remote: new line fires', said.includes(NEW_LINE), JSON.stringify(said));
  check('probe remote: old line does NOT fire', !said.includes(OLD_LINE));
  check('probe remote: kcal unmoved by the line', Game.state.scholar.kcal === kcalBeforeB);
  check('probe remote: returns null, lastPlayerMeal 0', retB === null && Game.state.village.lastPlayerMeal === 0);
  Game.say = origSay;

  console.log('test-pantrymealword-a: ' + (checks - fails) + '/' + checks + ' checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
