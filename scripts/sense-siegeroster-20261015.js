#!/usr/bin/env node
// scripts/sense-siegeroster-20261015.js — sense-testing helper (not a proof).
// Runs the ARMED policy (SIEGEROSTER=1) on a wave-5-unlocking seed, captures
// EVERY Game.say line to a file. For reading the siege window with human
// eyes: muster beats, go-to-ground, hold-Haven, villager dialogue/reactions.
// (SENSE-TESTING LAW: the discipline must read as the village defending
// itself, with the muster visible to the player.)
//
// Usage: SEED=33 DAYS=150 node scripts/sense-siegeroster-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SIEGEROSTER = '1';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let siegerosterleadfeast = null;
try { ({ siegerosterleadfeast } = require('./policies/siegeroster')); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: siegeroster layer deleted per kill protocol (KILLED AT PILOT); sense transcript captured pre-kill — see evidence/2026-10-15/siegeroster-transcript-s33.txt');
    process.exit(0);
  }
  throw e;
}

(async () => {
  const seed = parseInt(process.env.SEED || '33', 10);
  const days = parseInt(process.env.DAYS || '150', 10);
  const { Game } = await loadGame({ seed, mode: 'siegeroster-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const ogSay = Game.say.bind(Game);
  Game.say = function (text) {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      lines.push(`[d${day}] ${String(text).slice(0, 280)}`);
    } catch (e) {}
    return ogSay(text);
  };
  const policy = Object.assign({}, siegerosterleadfeast);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const out = `/home/hatch/workspace/worktrees/sim-siegeroster/evidence/2026-10-15/siegeroster-transcript-s${seed}.txt`;
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`captured ${lines.length} lines -> ${out} (${result.days}d ${result.endReason})`);
  const idx = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /📯|MUSTER|muster|goes to ground|all-clear|holds the|treeline|siege/i.test(l));
  console.log(`muster-relevant lines: ${idx.length}`);
  for (const { l } of idx.slice(0, 40)) console.log('  ' + l);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
