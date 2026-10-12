#!/usr/bin/env node
// capture-feast-transcript-20261012.js — sense-check helper (not a proof test).
// Runs winseek on seed 8 (~60d, the chain-firing seed), captures EVERY emit
// line to a file. For reading feast/deed/villager beats with human eyes
// (SENSE-TESTING LAW).
'use strict';
const fs = require('fs');
const H = '/home/hatch/workspace/worktrees/sim-winpath-r3/scripts/';
const { loadGame, setupGame, runDays } = require(H + 'sim-harness');
const { winseek } = require(H + 'policies/winseek');
(async () => {
  const { Game } = await loadGame({ seed: 8, mode: 'winseek' });
  await setupGame(Game);
  const lines = [];
  const ogSay = Game.say.bind(Game);
  Game.say = function (text) {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      lines.push(`[d${day}] ${String(text).slice(0, 300)}`);
    } catch (e) {}
    return ogSay(text);
  };
  const p = Object.assign({}, winseek);
  await runDays(Game, p, { days: 60 });
  const out = '/tmp/feast-transcript-20261012.txt';
  fs.writeFileSync(out, lines.join('\n'));
  console.log('captured ' + lines.length + ' lines -> ' + out);
})();
