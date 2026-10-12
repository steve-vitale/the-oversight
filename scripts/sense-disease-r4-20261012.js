#!/usr/bin/env node
// sense-disease-r4-20261012.js — SENSE transcripts for the seeker (longsim
// disease r4). Read for meaning: does the seeker arc read sensically? Does
// the bargain (achy joints forever, food goes further) land as a story?
// Usage: SEED=7 DAYS=60 node scripts/sense-disease-r4-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { seeker } = require('./policies/seeker');
const { competent } = require('./policies/competent');

const RE = /tick|mosquito|lemons|eurika|east.?nile|whine|questing|latch|latched|drink|drank|proboscis|engorge|blood-sense|sensory hairs|faceted|crows?screaming|flock warns|howl|gristle|ribbit|shellgut|witness|flockmind|succumbed|feverish|diagnos|on the mend/i;

async function run(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'sense', fullTelemetry: true });
  await setupGame(Game);
  const log = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t, ...r) { try { if (t && RE.test(String(t))) log.push('d' + ((this.state.scholar || {}).day || 0) + ': ' + String(t).slice(0, 220)); } catch (e) {} return origSay(t, ...r); };
  await runDays(Game, policy, { days });
  const cases = {};
  for (const ev of (Game.state.telemetry || [])) {
    if (ev.type === 'disease') cases[ev.id] = (cases[ev.id] || 0) + 1;
  }
  console.log('=== policy=' + policy.id + ' seed=' + seed + ' days=' + ((Game.state.scholar || {}).day || 0) + ' cases=' + JSON.stringify(cases));
  // curated window: from the first giant-vector line, plus disease beats
  const picks = [];
  let giantSeen = false;
  for (const l of log) {
    if (/Something moves out there — (tick|mosquito)/i.test(l)) giantSeen = true;
    if (giantSeen && picks.length < 45) picks.push(l);
    else if (/lemons|eurika|east.?nile|engorge|blood-sense|succumbed|diagnos/i.test(l) && picks.length < 70) picks.push(l);
  }
  for (const p of picks.slice(0, 70)) console.log(' ', p);
  console.log('  (total disease-relevant lines:', log.length + ')');
}

(async () => {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '60', 10);
  const which = process.env.POLICY || 'seeker';
  await run(which === 'competent' ? competent : seeker, seed, days);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
