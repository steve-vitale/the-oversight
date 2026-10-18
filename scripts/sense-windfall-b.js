#!/usr/bin/env node
// sense-windfall-b.js — capture windfall feast beats for sense-reading.
// Runs a 40d sim with RACKSANSWER=1 on a seed, prints the windfall voice
// lines and the engine feast beats around them.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { withRacksAnswer } = require('./policies/racksanswer-b');

const wrapped = withRacksAnswer(leadfeast, 'leadfeast+windfall', 't');

(async () => {
  process.env.RACKSANSWER = '1';
  const { Game } = await loadGame({ seed: 4803, mode: 'sense-windfall', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    if (/won't keep till tomorrow|feast|Feast/i.test(str)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + str.slice(0, 300));
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, wrapped);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; if (oUp) return oUp(G, ctx); };
  await runDays(Game, policy, { days: 40, manifest: null });
  console.log('windfall feasts: ' + ((ctxCap && ctxCap._raWindfallFeasts) || 0));
  console.log('--- beats ---');
  // Print windfall voice lines + the 2 lines after each (the engine feast report).
  for (let i = 0; i < lines.length; i++) {
    if (/won't keep till tomorrow/.test(lines[i])) {
      console.log(lines[i]);
      if (lines[i + 1]) console.log('  > ' + lines[i + 1]);
      if (lines[i + 2]) console.log('  > ' + lines[i + 2]);
      console.log('');
    }
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(2); });
