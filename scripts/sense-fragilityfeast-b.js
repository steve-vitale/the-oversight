#!/usr/bin/env node
// scripts/sense-fragilityfeast-b.js — SENSE-TESTING for SIM-FRAGILITYFEAST.
// Runs the armed fragilityfeast policy and dumps the feast beats + the
// hold-adjacent context with day stamps, for a human meaning read. The
// held feasts themselves are silent by design (the feast is POSTPONED, not
// displaced — no engine beat ever fires), so this reads: (a) fired-feast
// transcripts for coherence, (b) hold counts + fresh-day context around
// held dusks, (c) whether anything reads robotic.
//
// Usage: FEASTSCALE_R13=1 FRAGFEAST=1 node scripts/sense-fragilityfeast-b.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let FF = null;
try { FF = require('./policies/fragilityfeast'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: fragilityfeast layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}

const SEED = parseInt(process.env.SEED || '22', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const PID = process.env.PID || 'fragleadfeast';
const POLICIES = { fragleadfeast: FF.fragleadfeast, fragbelongfeast: FF.fragbelongfeast };

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'fragilityfeast-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg || '') }); } catch (e) {}
    return origSay(msg);
  };
  const policy = Object.assign({}, POLICIES[PID]);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, sampleEvery: DAYS + 1 }); });
  const FS = /FEAST|feast/i;
  const shown = beats.filter(b => FS.test(b.text));
  console.log(`== sense: ${PID} s${SEED} ${DAYS}d ==`);
  console.log(`feasts=${runCtx.fsFeasts || 0} (armed ${runCtx.fsArmedFeasts || 0}) fragileHeld=${runCtx.ffFragileHeld || 0} floorHeld=${runCtx.ffFloorHeld || 0}`);
  console.log(`hungryDays=${(Game.state.village || {}).hungryDays || 0} starveDeaths(seed)=see sweep`);
  console.log(`\n--- feast beats (${shown.length} matching) ---`);
  for (const b of shown.slice(0, 60)) console.log(`[d${b.day}] ${b.text.slice(0, 400)}`);
  if (shown.length > 60) console.log(`... and ${shown.length - 60} more feast beats`);
  // One full feast transcript slice: the first fired feast and the 6 beats around it.
  const fi = beats.findIndex(b => /🍖 FEAST/.test(b.text));
  if (fi >= 0) {
    console.log(`\n--- full feast transcript slice (d${beats[fi].day}) ---`);
    for (const b of beats.slice(Math.max(0, fi - 2), fi + 5)) console.log(`[d${b.day}] ${b.text.slice(0, 500)}`);
  } else {
    console.log('\n(no fired feasts — no transcript slice; holds may have been total)');
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
