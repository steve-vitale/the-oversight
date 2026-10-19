#!/usr/bin/env node
// sense-windyield-b.js — capture windyield beats for sense-reading.
// Runs a 60d sim with WINDYIELD=1 on a seed, prints the windfall voice lines
// and the engine feast beats around them. SENSE-TESTING LAW: read the beats
// — does the portion-scaled feast read as a person making a sensible call
// (eat the doomed food before it turns, in portions the village can finish),
// or is it a numbers funnel? The yield-skip is silent-by-design (the absence
// of an impromptu feast needs no announcement; the cook's duty narrates the
// racks work) — the capture shows yield days as counted quiet days, and the
// sense question is whether the silence reads honest. Also checks the subset
// invitation: who gets invited and does the fiction track it?
// SEED=<seed> node scripts/sense-windyield-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
let withWindyield;
try { ({ withWindyield } = require('./policies/windyield')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windyield-b layer killed per protocol; sense capture vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

const wrapped = withWindyield(leadfeast, 'leadfeast+windyield', 't');

(async () => {
  process.env.WINDYIELD = '1';
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const seed = parseInt(process.env.SEED || '6901', 10);
  const { Game } = await loadGame({ seed, mode: 'sense-windyield', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    const str = String(s);
    if (/won't keep till tomorrow|feast|Feast|FEAST|🍖|smoke racks|racks are already full/i.test(str)) lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + str.slice(0, 400));
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, wrapped);
  let ctxCap = null;
  const oUp = policy.upkeep;
  policy.upkeep = (G, ctx) => { ctxCap = ctx; if (oUp) return oUp(G, ctx); };
  await runDays(Game, policy, { days: 60, manifest: null });
  const fires = (ctxCap && ctxCap._wyFireDays) || [];
  const skips = (ctxCap && ctxCap._wyYieldSkipDays) || [];
  console.log('seed=' + seed + ' windfall feasts: ' + ((ctxCap && ctxCap._wyFeasts) || 0) +
    ' fireDays=[' + fires.join(',') + '] doomedEaten=' + Math.round((ctxCap && ctxCap._wyDoomedEaten) || 0));
  console.log('yield-skips: ' + ((ctxCap && ctxCap._wyYieldSkips) || 0) + ' skipDays=[' + skips.join(',') + '] doomedYielded=' + Math.round((ctxCap && ctxCap._wyYieldDoomed) || 0));
  console.log('--- beats (windfall voice + the 2 engine lines after; yield days are quiet by design) ---');
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
