#!/usr/bin/env node
// test-takefrompantry-zero-trust-20261013.js — PROOF (journey-succession 2026-10-13):
// takeFromPantry / takeFromPantryBulk's "taking without giving" -2 trust path used
//   v.trust[vid] = Math.max(0, (v.trust[vid] || 15) - 2)
// When trust was EXACTLY 0, `0 || 15` resurrected it to 15, so the take set it to
// 13: a hated leader could never stay hated — every pantry take bounced 0 -> 13.
// (Seen live: seed 1101, Ji's trust cycled 0->13->11->...->0->13 for 40 days.)
// The codebase already fixed this pattern in bumpTrust and in the revoke path
// directly below ("a real 0 must stay 0"); the two take paths were missed.
// Fix: `v.trust[vid] === undefined ? 15 : v.trust[vid]`.
// Exit 0 = green, 1 = failure. RED-verified on pristine game.js.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

function stockPantry(Game) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Test Stew', kcalEach: 400, units: 10, kg: 0.01, foodState: 'cooked', edible: true });
  return v.pantry.length - 1;
}
// light pack so the carry-capacity guard never interferes with the trust logic
function lightPack(Game) { Game.state.scholar.inventory = []; }

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-zero-trust' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const vid = Game.villagerId;
  v.trust = v.trust || {};
  v.takes = v.takes || {}; v.gives = v.gives || {};

  // force the net < -5000 gate: heavy taker, no gives
  v.takes[vid] = 6000; v.gives[vid] = 0;

  // 1. THE BUG: trust exactly 0 must stay 0 after a take
  lightPack(Game); v.trust[vid] = 0;
  Game.takeFromPantry(stockPantry(Game));
  check('zero-trust stays zero (single take)', v.trust[vid] === 0, `trust=${v.trust[vid]} (pre-fix: 13)`);

  // 2. normal path still works: 10 -> 8
  lightPack(Game); v.trust[vid] = 10;
  Game.takeFromPantry(stockPantry(Game));
  check('ten becomes eight', v.trust[vid] === 8, `trust=${v.trust[vid]}`);

  // 3. unset entry still defaults to 15 -> 13
  lightPack(Game); delete v.trust[vid];
  Game.takeFromPantry(stockPantry(Game));
  check('unset defaults to 15 then -2', v.trust[vid] === 13, `trust=${v.trust[vid]}`);

  // 4. bulk path: zero stays zero (and the take really happened)
  lightPack(Game); v.trust[vid] = 0;
  const bi = stockPantry(Game);
  const unitsBefore = v.pantry[bi].units;
  Game.takeFromPantryBulk({ [bi]: 2 });
  const took = unitsBefore - ((v.pantry[bi] || {}).units || 0);
  check('zero-trust stays zero (bulk take)', v.trust[vid] === 0 && took === 2, `trust=${v.trust[vid]} took=${took}`);

  // 5. floor: trust 1 -> 0, not negative
  lightPack(Game); v.trust[vid] = 1;
  Game.takeFromPantry(stockPantry(Game));
  check('one becomes zero (floor)', v.trust[vid] === 0, `trust=${v.trust[vid]}`);

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})();
