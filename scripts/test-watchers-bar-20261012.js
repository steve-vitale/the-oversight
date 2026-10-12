#!/usr/bin/env node
// test-watchers-bar-20261012.js — travel lever r5 proof.
// THE LEVER: "the global bar is recalibrated to the earned viewership economy."
// The v1 bar (40) was set under the old pantry-frozen viewership economy where
// it was nearly free by day 2-7; the 2026-10-11 earned-economy fix (arc*5 +
// showmanship + codex breadth, deed spikes) never recalibrated it. Measured on
// 12 fed 200d seeds: a full deed-rich season (national, 8 contests, waves
// 11/6/4, 3 crises, 79 days) plateaus viewership at ~31-38 — 40 was
// unreachable and the Watchers never staged in 24 runs. The bar is now 32
// (docs/SCALE.md), and the staging copy names the real number (was hardcoded
// "Forty" — copy and engine must agree).
//
// RED on pristine: _checkGlobal only stages at >= 40; the copy says "Forty".
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [5150, 7, 99];

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + label + (detail ? ' — ' + detail : '')); }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'watchersbar', fullTelemetry: false });
  await setupGame(Game);
  const say = [];
  const osay = Game.say;
  Game.say = function (m) { if (typeof m === 'string') say.push(m); return osay.apply(this, arguments); };
  const saidHas = (re) => say.some(m => re.test(m));

  // ---- 1. below the bar: no staging ----
  Game.state.nationalLive = true;
  Game.state.globalLive = false;
  Game.state.pendingGlobal = null;
  Game.state.village.viewership = 31;
  Game.state.village._viewShoMark = 999; // freeze the showmanship live-feed
  try { Game._checkGlobal(); } catch (e) {}
  ok(!Game.state.pendingGlobal, '1a no Watchers at viewership 31 (below the 32 bar)');

  // ---- 2. at the bar: stages ----
  Game.state.village.viewership = 32;
  try { Game._checkGlobal(); } catch (e) {}
  ok(!!Game.state.pendingGlobal, '2a the Watchers stage at viewership 32');

  // ---- 3. the copy names the real number, not "Forty" ----
  ok(saidHas(/32\. You see the number/i), '3a staging copy names the real number (32)', say.slice(-3).join(' | ').slice(0, 120));
  ok(!saidHas(/"Forty\. You see the number/i), '3b no hardcoded "Forty" in the staging copy');

  // ---- 4. national is still required ----
  Game.state.nationalLive = false;
  Game.state.globalLive = false;
  Game.state.pendingGlobal = null;
  Game.state.village.viewership = 60;
  try { Game._checkGlobal(); } catch (e) {}
  ok(!Game.state.pendingGlobal, '4a no Watchers without national, even at viewership 60');

  // ---- 5. the beat answers and lands global ----
  Game.state.nationalLive = true;
  Game.state.village.viewership = 33;
  try { Game._checkGlobal(); } catch (e) {}
  ok(!!Game.state.pendingGlobal, '5a restaged for the answer test');
  say.length = 0;
  let ans = null;
  try { ans = Game.answerGlobalChoice('feast'); } catch (e) { ans = null; }
  ok(!!ans, '5b answerGlobalChoice(feast) returns truthy');
  ok(Game.state.globalLive === true, '5c the scale lands global after the answer');
  ok(saidHas(/feasts for the cameras/i), '5d the feast answer is played aloud');

  // ---- 6. idempotent: no double staging ----
  Game.state.pendingGlobal = null;
  try { Game._checkGlobal(); } catch (e) {}
  ok(!Game.state.pendingGlobal, '6a no second staging once globalLive');
}

async function main() {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { fail++; console.log('  FAIL: seed ' + s + ' threw — ' + (e && e.message)); } }
  console.log(`watchers-bar: ${pass} passed, ${fail} failed (seeds ${SEEDS.join(',')})`);
  process.exit(fail ? 1 : 0);
}
main();
