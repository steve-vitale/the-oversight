#!/usr/bin/env node
// understudy-senseread-20261017.js — sense-testing for the sim-understudy arm.
// Re-runs armed-leadfeast-s4005 and captures the say transcript around the
// fresh_weapon performance (day 82) for meaning/coherence judgment.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SEATDRIVE = '0';
process.env.UNDERHUNT = '1';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast } = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const { withUnderstudy } = require(path.join(REPO, 'scripts', 'policies', 'understudy'));
const { attachTrickresCapture } = require('./trickres-instrument-20261016.js');

(async () => {
  const policy = withUnderstudy(leadfeast, 'understudy-lead', 'sense-read');
  const { Game } = await loadGame({ seed: 4005, mode: 'understudy-sense', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 100, sampleEvery: 30 }); });
  cap.restore();
  // Find the understudy fight(s) and dump say beats around them
  for (const tf of (cap.tbFights || [])) {
    const kinds = ((tf.perfs || {}).understudy || []);
    if (kinds.includes('fresh_weapon')) {
      console.log(`\n=== fresh_weapon performance: day ${tf.day}, result=${tf.result}, mids=[${tf.mids}] ===`);
    }
  }
  // Dump say beats mentioning understudy or weapon switch around day 82
  const beats = (cap.sayBeats || []).filter(b => {
    const d = b.day || 0;
    return d >= 80 && d <= 84;
  });
  console.log(`\n=== say beats days 80-84 (${beats.length}) ===`);
  for (const b of beats.slice(0, 40)) {
    const txt = String(b.text || b.line || '').slice(0, 200);
    if (/understudy|weapon|switch|equipped|fresh|never seen/i.test(txt)) {
      console.log(`d${b.day}: ${txt}`);
    }
  }
})().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
