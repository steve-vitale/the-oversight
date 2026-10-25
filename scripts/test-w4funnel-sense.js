#!/usr/bin/env node
// scripts/test-w4funnel-sense.js — SENSE-ONLY replay for sim-w4funnel-a.
// NON-MEASURED: narration replays never enter the census (the harness
// notes narration can shift trajectories). Purpose: read ONE seed's
// wave-4 thread in plain words — best seed 73678, whose census thread
// is: one world arrival (eulogy, tile-entry, d113, never fought,
// still present at the d116 win) PLUS one non-world kill (strike,
// d115, scholar elif_demir, via 'player', no world birth at all).
// The replay hunts the strike's initiation path: feast draw, tent
// intruder, door-flee re-engage, trap, or world bump — and the
// eulogy's arrival beat, if the fiction ever notices it.
// Seed 73678, tableseat-nowait substrate (LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1), 116 days. Wraps Game.say AND Game.sysSay
// after setup; the wraps only record text and call the original,
// drawing no RNG.
// Usage: node scripts/test-w4funnel-sense.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));

const HIT_RE = /strike|inflatable rat|eulogy|feast draw|circling the firelight|tent|burst out through the flap|they'?re still here|waiting|trap|shut the grid down/i;
const FIGHT_RE = /⚔|Turn-based now/i;

(async () => {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed: 73678, mode: 'w4funnel-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const hits = [];
  const fights = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= 100) {
          if (HIT_RE.test(s)) hits.push(`[d${day}] ${s.slice(0, 300)}`);
          if (FIGHT_RE.test(s)) fights.push(`[d${day}] ${s.slice(0, 300)}`);
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  await quietLog(async () => { await runDays(Game, tableseatNowait, { days: 116, manifest: undefined, sampleEvery: 30 }); });
  console.log(`=== w4funnel sense replay: seed=73678 tableseat-nowait narration=on, 116d (NON-MEASURED) ===`);
  console.log(`--- wave-4 / initiation hits from d100 (${hits.length}) ---`);
  for (const h of hits) console.log('  ' + h);
  console.log(`--- fight-start lines from d100 (${fights.length}) ---`);
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no wave-4 thread beats fired in this replay from d100)');
})().catch(e => { console.error('W4FUNNEL SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
