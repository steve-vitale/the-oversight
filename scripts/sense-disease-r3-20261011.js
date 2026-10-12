#!/usr/bin/env node
// sense-disease-r3-20261011.js — SENSE transcripts: the giant fights, the
// lemons/eurika arcs, named villager sickness deaths. Read for meaning.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { treatment_seeking } = require('./policies/treatment-seeking');

const RE = /tick|mosquito|lemons|eurika|east.?nile|succumbed|on the mend|is sick|feverish|wound fever|gut rot|tick fever|diagnos|antibiotics|engorge|blood-sense|sensory hairs|faceted|ringed|whine|questing|latch/i;

async function run(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'sense', fullTelemetry: true });
  await setupGame(Game);
  const log = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t, ...r) { try { if (t && RE.test(String(t))) log.push('d' + ((this.state.scholar || {}).day || 0) + ': ' + String(t).slice(0, 200)); } catch (e) {} return origSay(t, ...r); };
  const res = await runDays(Game, policy, { days });
  console.log('=== policy=' + policy.id + ' seed=' + seed + ' days=' + ((Game.state.scholar || {}).day || 0));
  // print a curated window: first giant-fight-adjacent lines + disease beats
  const picks = [];
  let giantSeen = false;
  for (const l of log) {
    if (/Something moves out there — (tick|mosquito)/i.test(l)) giantSeen = true;
    if (giantSeen && picks.length < 40) picks.push(l);
    else if (/lemons|eurika|succumbed|diagnos/i.test(l) && picks.length < 60) picks.push(l);
  }
  for (const p of picks.slice(0, 60)) console.log(' ', p);
  console.log('  (total disease-relevant lines:', log.length + ')');
}

(async () => {
  await run(treatment_seeking, 2026, 60); // lemons arc seed
  await run(competent, 7, 45);            // eurika arc seed
})();
