#!/usr/bin/env node
// transcript-firenarr-deploy-b.js — reads REAL evenings from live
// sims for sim-firenarr-deploy-b (DIAG ONLY). Runs one seed under
// competent policy, 30d, taps Game.say with the game day, and
// prints every say line of the requested game days in order,
// marking firenarr lines. Used to READ (not synthesize) an
// (F)-first evening, a death-knell evening, and a two-stretch
// evening before finalizing the evidence file.
// Env: POLICY=competent, COMPETENT_FEAST=0, SEATDRIVE=0,
// PLENTYDEPRI=0, DEPOSITGATE=1, DAYS=30, SEED=<one>, DAYS_WANTED=<csv>.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
const SEED = parseInt(process.env.SEED || '', 10);
const WANTED = (process.env.DAYS_WANTED || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!SEED || !WANTED.length) { console.error('FATAL: SEED and DAYS_WANTED must be set'); process.exit(2); }
const FIRENARR_TEMPLATES = [
  '⚠ The store has fallen from its recent high — the shelves are thinning.',
  '⚠ The store has fallen far from its recent high — the shelves are nearly bare.',
  '⚠ The store keeps slipping from its recent high — evening after evening, lower.',
  '⚠ The store has fallen further still from its recent high.',
  '⚠ The store has fallen from its recent high again — the shelves are thinning.',
  '⚠ The store has fallen far from its recent high again — the shelves are nearly bare.',
  '⚠ The store keeps slipping from its recent high again — evening after evening, lower.',
];
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'depositgate-b', fullTelemetry: false });
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (...args) {
    try { sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '') }); } catch (e) {}
    return origSay.apply(this, args);
  };
  await setupGame(Game);
  const result = await runDays(Game, competent, { days: 30, manifest: null });
  console.log('seed ' + SEED + ' endReason=' + result.endReason + ' daysAlive=' + result.days);
  console.log('deaths: ' + JSON.stringify((result.samples && result.samples.deaths) || []));
  for (const d of WANTED) {
    const lines = sayLines.filter((x) => x.day === d);
    console.log('=== day ' + d + ' (' + lines.length + ' say lines) ===');
    lines.forEach((x, i) => {
      const mark = FIRENARR_TEMPLATES.includes(x.line) ? ' [FIRENARR]' : '';
      console.log('  [' + i + ']' + mark + ' ' + x.line);
    });
  }
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
