#!/usr/bin/env node
// measure-deathcause-20261011.js — coarse death-cause shares for the travel
// r3 baseline: what actually ended each winseek village? Captures the
// game-over say lines per seed.
'use strict';
const H = '/home/hatch/workspace/worktrees/sim-travel-r3/scripts/';
const { loadGame, setupGame, runDays } = require(H + 'sim-harness');
const { winseek } = require(H + 'policies/winseek');
(async () => {
  for (const seed of [1,2,3,4,5,6,7,8,9,10,11,12]) {
    const { Game } = await loadGame({ seed, mode: 'travelwinseek', fullTelemetry: false });
    await setupGame(Game);
    const say = [];
    const osay = Game.say;
    Game.say = function (m) { if (typeof m === 'string') say.push(m); return osay.apply(this, arguments); };
    const res = await runDays(Game, winseek, { days: 200 });
    const over = say.filter(m => /scattering|No one is left|dies out|season ends|wiped out|village is gone/i.test(m));
    console.log(`seed ${seed}: days=${res.days} ${res.endReason} | ` + (over.length ? over[over.length-1].slice(0, 110) : '(no over-line)'));
  }
})().catch(e => console.error('FATAL', e));
