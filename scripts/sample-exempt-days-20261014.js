#!/usr/bin/env node
// Sample real exemption beats from a live sim (sense-test for the
// hunger-exempt throttle arm). Runs leadcourt seed 77 for 170 days with
// say() captured, then prints every exemption beat (🍲) plus a few
// surrounding redirect beats (🌿) for tone comparison.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

(async () => {
  const { Game } = await loadGame({ seed: 77, mode: 'hungerexempt-sample', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say;
  Game.say = function (t) { beats.push(String(t)); return origSay.apply(this, arguments); };
  const policy = Object.assign({}, leadcourt);
  const origDaily = leadcourt.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} } };
  const result = await runDays(Game, policy, { days: 170, manifest: undefined, sampleEvery: 10 });
  const exempt = beats.filter(b => /^🥄/.test(b));
  const redir = beats.filter(b => /^🌿/.test(b));
  console.log(`days=${result.days} end=${result.endReason} exemptionBeats=${exempt.length} redirectBeats=${redir.length}`);
  console.log('\n--- EXEMPTION BEATS (first 6) ---');
  exempt.slice(0, 6).forEach(b => console.log('  ' + b));
  console.log('\n--- EXEMPTION BEATS (last 4) ---');
  exempt.slice(-4).forEach(b => console.log('  ' + b));
  console.log('\n--- REDIRECT BEATS (2, for tone comparison) ---');
  redir.slice(0, 2).forEach(b => console.log('  ' + b));
  // do the exemption beats vary by task? (forage / harvest / fish nets)
  const kinds = { forage: 0, harvest: 0, 'fish nets': 0 };
  for (const b of exempt) { for (const k of Object.keys(kinds)) if (b.includes('keeps working the ' + k)) kinds[k]++; }
  console.log('\nexempt by task:', JSON.stringify(kinds));
  process.exit(0);
})().catch(e => { console.error('SAMPLE CRASH:', e); process.exit(2); });
