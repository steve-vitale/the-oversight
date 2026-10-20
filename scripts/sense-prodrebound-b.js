#!/usr/bin/env node
// sense-prodrebound-b.js — sense-test the production-side beats (SENSE-TESTING LAW).
// Runs one seed per policy (observational substrate), captures say-lines,
// and prints the production/economy beats for meaning-reading: smoke drive,
// throttle redirects, surplus shares, cap-door refusals, feast draws.
// Usage: SEED=6810 POLICY=leadfeast DAYS=90 node scripts/sense-prodrebound-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const POLICIES = { leadfeast, belongfeast };
const SEED = parseInt(process.env.SEED || '6810', 10);
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const DAYS = parseInt(process.env.DAYS || '90', 10);

const ECON_PATTERNS = [
  /smoke|rack|preserve/i, /pantry is full/i, /leaves the .* standing/i,
  /carries .* kcal of surplus/i, /share/i, /forage/i, /harvest/i, /haul/i,
  /fresh stuff keeps/i, /spoiled|rotted|rot\b/i, /dinner/i, /seconds/i,
];

(async () => {
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-prodrebound', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (s) {
    try { lines.push({ day: (Game.state.scholar || {}).day || 0, text: String(s) }); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await runDays(Game, Object.assign({}, POLICY), { days: DAYS, manifest: null });
  const econ = lines.filter(l => ECON_PATTERNS.some(p => p.test(l.text)));
  console.log(`seed=${SEED} policy=${POLICY_ID} days=${DAYS}: ${lines.length} total say-lines, ${econ.length} economy lines\n`);
  // Print a spread across the run: early, mid, late samples + all cap-door beats
  const byDay = {};
  for (const l of econ) (byDay[l.day] = byDay[l.day] || []).push(l);
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const pick = new Set();
  for (const d of days) { if (d <= 15 || (d >= 40 && d <= 50) || d >= 75) pick.add(d); }
  for (const l of econ) if (/pantry is full/i.test(l.text)) pick.add(l.day);
  const shown = [...pick].sort((a, b) => a - b).slice(0, 24);
  for (const d of shown) {
    console.log(`--- day ${d} ---`);
    for (const l of byDay[d].slice(0, 6)) console.log('  ' + l.text.slice(0, 300).replace(/\n/g, ' '));
  }
})().catch(e => { console.error('SENSE CRASH', e); process.exit(2); });
