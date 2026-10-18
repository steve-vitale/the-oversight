#!/usr/bin/env node
// sense-portionwindfall-b.js — capture portion-scaled windfall feast beats for sense-reading.
// Runs a 60d sim with PORTIONWINDFALL=1 on a seed, prints the windfall voice
// lines and the engine feast beats around them. SENSE-TESTING LAW: read the
// beats — does the portion-scaled feast read as a person making a sensible
// call (eat the doomed food before it turns, in portions the village can
// finish), or is it a numbers funnel? Also checks the subset invitation:
// who gets invited and does the fiction track it?
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
let withPortionWindfall;
try { ({ withPortionWindfall } = require('./policies/portionwindfall')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-portionwindfall-b layer killed per protocol; sense capture vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

const wrapped = withPortionWindfall(leadfeast, 'leadfeast+portionwindfall', 't');

(async () => {
  process.env.PORTIONWINDFALL = '1';
  const seed = parseInt(process.env.SEED || '6201', 10);
  const { Game } = await loadGame({ seed, mode: 'sense-portionwindfall', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    if (/won't keep till tomorrow|feast|Feast|FEAST|🍖/i.test(str)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + str.slice(0, 400));
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, wrapped);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; if (oUp) return oUp(G, ctx); };
  await runDays(Game, policy, { days: 60, manifest: null });
  const fires = (ctxCap && ctxCap._pwFireDays) || [];
  console.log('seed=' + seed + ' portion-windfall feasts: ' + ((ctxCap && ctxCap._pwFeasts) || 0) +
    ' fireDays=[' + fires.join(',') + '] doomedEaten=' + Math.round((ctxCap && ctxCap._pwDoomedEaten) || 0));
  console.log('--- beats (windfall voice + the 2 engine lines after) ---');
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
