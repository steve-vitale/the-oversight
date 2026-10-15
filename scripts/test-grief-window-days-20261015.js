#!/usr/bin/env node
// Proof test: grief/cheer decay is per-DAY, not per day-part
// (journey-social r16 2026-10-15).
// The fields are documented in days ("days of village-wide grief (death)"),
// but tickNeeds() — which ran the decay — is called once per day-PART
// (advancePart, 4/day). So villageEvent('death')'s 3-day window was burning
// in 3 parts (~0.75 days): the acute grief window opened and closed between
// conversation rounds, and the r16 pilot caught 2 of 8 runs with deaths but
// zero grief-thread conversations because the window had already burned out.
//
// RED (pre-fix): 3 tickNeeds() calls (3 day-parts) drain v.grief 3 -> 0.
// GREEN (post-fix): 3 tickNeeds() calls leave v.grief untouched; one
//   endDay() drains exactly 1 (3 -> 2), i.e. the window lasts 3 days.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

async function main() {
  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const v = Game.state.village;

  // 1. a full day's worth of parts must NOT drain the grief window
  v.grief = 3;
  Game.tickNeeds(); Game.tickNeeds(); Game.tickNeeds();
  console.log(`  grief after 3 tickNeeds (3 day-parts): ${v.grief}`);
  ok(v.grief === 3, '3 day-parts do not drain the grief window (was: drained to 0)');
  ok(v.grief > 0, 'grief window still open after a day of parts');

  // 2. cheer behaves the same (documented in days too)
  v.cheer = 1;
  Game.tickNeeds();
  ok(v.cheer === 1, '1 day-part does not drain the cheer window');

  // 3. one endDay drains exactly one day's worth
  const dayBefore = (Game.state.scholar || {}).day;
  v.grief = 3;
  Game.endDay();
  const dayAfter = (Game.state.scholar || {}).day;
  console.log(`  grief after one endDay: ${v.grief} (day ${dayBefore} -> ${dayAfter})`);
  ok(v.grief === 2, 'one endDay drains exactly 1 grief day (3 -> 2)');
  ok(dayAfter === dayBefore + 1, 'endDay advanced exactly one day');

  // 4. observable effect: villageEvent('death') opens a 3-DAY window,
  // not a 3-part one
  v.grief = 0;
  Game.villageEvent('death');
  let partsSurvived = 0;
  for (let i = 0; i < 3; i++) { Game.tickNeeds(); if (v.grief > 0) partsSurvived++; }
  console.log(`  window open after 3 parts post-death: grief=${v.grief}`);
  ok(v.grief > 0 && partsSurvived === 3, 'death opens a window that survives 3 day-parts');

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
