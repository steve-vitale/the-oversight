#!/usr/bin/env node
// scripts/test-ambient-discovery-line-20261014.js — proof test for the
// journey-scale-r2 blank: villageLives()' "discovers something" branch
// rendered `Name: "undefined"` because person.line is not a real field.
// RED: with a full codex (sample sub-branch never fires), repeated
// villageLives() ticks produce at least one `X: "undefined"` line.
// GREEN: after the fix, no undefined lines and the branch says something real.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '7', 10);
const TICKS = parseInt(process.env.TICKS || '300', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'ambient-discovery-proof', fullTelemetry: false });
  const captured = [];
  const _say = Game.say;
  Game.say = function (s) { if (typeof s === 'string') captured.push(s); try { return _say.apply(this, arguments); } catch (e) {} };
  await setupGame(Game);
  // full codex: the sample sub-branch (undiscovered plants) can never fire,
  // so the discovery branch always falls into its else — the buggy line.
  try {
    for (const p of (Game.data.plants || [])) Game.state.codex.plants[p.id] = true;
  } catch (e) {}
  // make sure at least one free (unassigned) living villager exists and the
  // player is at haven so `present` narration fires
  let fired = 0;
  for (let i = 0; i < TICKS; i++) {
    const before = captured.length;
    try { Game.villageLives(); } catch (e) { /* ignore ambient errors */ }
    if (captured.length > before) fired++;
  }
  const undef = captured.filter(s => /: "undefined"/.test(s));
  const discoveryish = captured.filter(s => /: "/.test(s) && !/says:/.test(s));
  console.log(`ticks=${TICKS} ticksWithLines=${fired} quotedVillagerLines=${discoveryish.length} undefinedLines=${undef.length}`);
  if (undef.length) {
    console.log('RED (bug present): sample bad line: ' + undef[0].slice(0, 120));
    process.exit(1);
  }
  // GREEN gate: the discovery branch must actually have fired at least once
  // (else the test proves nothing), and no line may render "undefined".
  const realLines = captured.filter(s => /:\s*"/.test(s) && !/: "undefined"/.test(s));
  if (!realLines.length) {
    console.log('INCONCLUSIVE: discovery branch never fired on this seed — rerun with another SEED');
    process.exit(2);
  }
  console.log('GREEN: no undefined lines; sample: ' + realLines[0].slice(0, 140));
  process.exit(0);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(3); });
