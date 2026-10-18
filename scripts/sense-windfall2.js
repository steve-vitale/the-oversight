#!/usr/bin/env node
// sense-windfall2.js — capture survival-safe windfall feast beats for sense-reading.
// Runs a 60d sim with WINDFALLFEAST2=1 on a seed, prints the windfall voice
// lines and the engine feast beats around them. SENSE-TESTING LAW: read the
// beats — do the villagers act like people around the windfall feasts, or is
// it a numbers funnel?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { withWindfallFeast2 } = require('./policies/windfallfeast2');

const wrapped = withWindfallFeast2(leadfeast, 'leadfeast+windfall2', 't');

(async () => {
  process.env.WINDFALLFEAST2 = '1';
  const seed = parseInt(process.env.SEED || '4903', 10);
  const { Game } = await loadGame({ seed, mode: 'sense-windfall2', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    if (/won't keep till tomorrow|feast|Feast/i.test(str)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + str.slice(0, 320));
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, wrapped);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; if (oUp) return oUp(G, ctx); };
  await runDays(Game, policy, { days: 60, manifest: null });
  console.log('seed=' + seed + ' windfall feasts: ' + ((ctxCap && ctxCap._wfFeasts) || 0));
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
