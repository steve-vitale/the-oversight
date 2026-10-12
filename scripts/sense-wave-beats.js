#!/usr/bin/env node
// sense-wave-beats.js — captures all counter/ledger/wave narration lines from
// short sims so a human can READ them (SENSE-TESTING LAW). Prints full lines.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '1,7,16').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '60', 10);

(async () => {
  for (const seed of SEEDS) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);
    const keep = [];
    Game.sysSay = function (...a) {
      const s = String(a.join(' '));
      if (/wave ledger|ratings are up|final draft|mirror draft|producers|show now/i.test(s))
        keep.push({ day: (this.state.scholar || {}).day || 0, who: 'SYS', line: s.slice(0, 400) });
    };
    const rawSay = Game.say;
    Game.say = function (...a) {
      const s = String(a.join(' '));
      if (/counter learned|wave ledger|ratings are up|final draft|mirror draft|producers/i.test(s))
        keep.push({ day: (this.state.scholar || {}).day || 0, who: 'say', line: s.slice(0, 400) });
    };
    await runDays(Game, competent, { days: DAYS, manifest });
    console.log(`\n########## SEED ${seed} (${keep.length} lines) ##########`);
    for (const k of keep) console.log(`[d${k.day} ${k.who}] ${k.line}`);
  }
})();
