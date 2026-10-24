#!/usr/bin/env node
// test-gap-w1-fieldbeat.js — proof for gap-phase2 W1 line 471 (vetcompose):
// off-screen companion kills were narratively silent. A villager's wave-3+
// field-fight kill (via 'wild' / 'patrol') now takes the same companion
// kill beat as a TB killing blow (tele 'companion_kill_beat' fires);
// contest kills keep their own narration and stay out of this beat.
// Usage: node scripts/test-gap-w1-fieldbeat.js (from the repo root)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 42, fullTelemetry: true });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== Game.villagerId);
  const vid = roster[0];
  const beats = () => (Game.state.telemetry || []).filter(e => e.type === 'companion_kill_beat').length;
  const base = beats();
  // 'spool' is a wave-3 monster; a villager field kill of it is the vetcompose case.
  await quietLog(async () => { Game.recordWaveKill('spool', vid, 'wild', null); });
  ok('471 field (wild) wave-3 villager kill fires the beat', beats() === base + 1,
    `base=${base} after=${beats()}`);
  await quietLog(async () => { Game.recordWaveKill('spool', vid, 'patrol', 'shoutx1'); });
  ok('471 field (patrol) wave-3 villager kill fires the beat', beats() === base + 2,
    `after=${beats()}`);
  await quietLog(async () => { Game.recordWaveKill('spool', vid, 'contest', null); });
  ok('471 contest kills stay out of this beat', beats() === base + 2,
    `after=${beats()}`);
  await quietLog(async () => { Game.recordWaveKill('hushwolf', vid, 'wild', null); });
  ok('471 wave-1 field kill does not fire the beat', beats() === base + 2,
    `after=${beats()}`);
  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
