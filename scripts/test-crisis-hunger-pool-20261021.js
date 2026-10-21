#!/usr/bin/env node
// test-crisis-hunger-pool-20261021.js — PROOF for journey-crisis r37 (lane B).
//
// BLANK: the hungry-dawn narration was a single line ("Hunger is doing its
// slow work on everyone...") said identically every hungry dawn — the r37
// sims caught it parroting 7+ days straight. Now a 4-variant pool in the
// same quiet register.
//
// RED on pristine HEAD: only 1 distinct hunger line across 12 hungry dawns.
// GREEN post-fix: >=3 distinct lines across 12 hungry dawns, all non-empty,
// all in the same register (no new mechanics, no new say sites).
//
// Usage: node scripts/test-crisis-hunger-pool-20261021.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(31337);
  const { Game } = await loadGame({ seed: 31337, mode: 'hunger-pool', fullTelemetry: false });
  const said = [];
  const _say = Game.say;
  Game.say = function (m) { try { said.push(String(m || '')); } catch (e) {} return _say ? _say.apply(this, arguments) : undefined; };
  await setupGame(Game);

  // force a starving village at dawn: a recent starvation death in the
  // fallen ledger is what starvingVillage() reads (plus empty pantry)
  const v = Game.state.village;
  v.pantry = [];
  v.pantryKcal = 0;
  v.fallen = v.fallen || [];
  v.fallen.push({ cause: 'starvation', day: (Game.state.scholar || {}).day || 1 });
  Game.dayPart = 0;

  const hungerLines = new Set();
  for (let d = 0; d < 12; d++) {
    const before = said.length;
    try { Game.npcDriftTick(); } catch (e) { check('tick-runs', false, String(e && e.message || e)); break; }
    for (const s of said.slice(before)) {
      if (/hunger|hungry|cheekbones/i.test(s)) hungerLines.add(s);
    }
  }
  check('pool-varies', hungerLines.size >= 3, `distinct=${hungerLines.size}`);
  check('all-nonempty', [...hungerLines].every(s => s.length > 20), 'every variant is a real line');
  check('no-repeat-wall', hungerLines.size > 1, 'not a single parroted line');
  for (const s of [...hungerLines].slice(0, 4)) console.log('    · ' + s.slice(0, 90));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
