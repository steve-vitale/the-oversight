#!/usr/bin/env node
// test-trauma-relief-20261012.js — proof for longsim combat r7 (trauma relief).
// The competent policy's sootheTrauma(): at dawn, when scholar trauma >= 8
// and the System has taught resonance harmonics, channel a ready keepsake
// (−6/channel vs −2/night sleep). Baseline measurement: the policy never did
// this (0 policy-driven channels in 24 runs; only the System's one-time demo).
// Run: default env must PASS (green path); COMPETENT_TRAUMA_RELIEF=0 must
// FAIL to relieve (red legacy path) — the blank reproduced.
// Seeded RNG (modules capture Math.random at load); no Game.save stub.
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function freshGame(seed) {
  let s = seed >>> 0;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  Math.random = rng;
  const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// put the game in the state a real run reaches: a keepsake in the pack,
// the System's resonance-harmonics lesson learned, day advanced past the
// lesson's live demonstration.
function armTraumaScene(Game) {
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  let has = s.inventory.some(it => Game.isKeepsake && Game.isKeepsake(it));
  if (!has) {
    const def = (Game.data.items || []).find(i => i.class === 'sentimental');
    if (!def) throw new Error('no sentimental item def in data');
    s.inventory.push({ itemId: def.id, name: def.name || 'Keepsake', units: 1 });
    has = true;
  }
  try { Game.teachSentiment(); } catch (e) {}
  s.day = (s.day || 1) + 1; // past the demo's once-per-day channel mark
  return has;
}

(async () => {
  const { sootheTrauma } = require('./policies/competent');

  // ---- GREEN: trauma >= 8, taught, keepsake ready -> channels, trauma drops ----
  {
    const Game = await freshGame(424242);
    armTraumaScene(Game);
    const s = Game.state.scholar;
    s.trauma = 40;
    const ctx = {};
    sootheTrauma(Game, ctx);
    check('G1 trauma dropped by >= 6 (channel relief)', (s.trauma || 0) <= 34, 'trauma=' + s.trauma);
    check('G2 ctx.soothed counted', ctx.soothed === 1, 'soothed=' + ctx.soothed);
  }

  // ---- GREEN: low trauma -> no channel (below the game's own threshold) ----
  {
    const Game = await freshGame(777001);
    armTraumaScene(Game);
    const s = Game.state.scholar;
    s.trauma = 5;
    const ctx = {};
    sootheTrauma(Game, ctx);
    check('G3 trauma < 8 leaves trauma untouched', (s.trauma || 0) === 5, 'trauma=' + s.trauma);
    check('G4 no channel counted', ctx.soothed === undefined, 'soothed=' + ctx.soothed);
  }

  // ---- RED (legacy): env gate off -> no relief even at high trauma ----
  {
    const Game = await freshGame(31337);
    armTraumaScene(Game);
    const s = Game.state.scholar;
    s.trauma = 40;
    const ctx = {};
    process.env.COMPETENT_TRAUMA_RELIEF = '0';
    try { sootheTrauma(Game, ctx); } finally { delete process.env.COMPETENT_TRAUMA_RELIEF; }
    check('R1 legacy path leaves trauma untouched (the blank)', (s.trauma || 0) === 40, 'trauma=' + s.trauma);
    check('R2 legacy path counts nothing', ctx.soothed === undefined, 'soothed=' + ctx.soothed);
  }

  // ---- GREEN: no keepsake -> honest no-op ----
  {
    const Game = await freshGame(900001);
    armTraumaScene(Game);
    const s = Game.state.scholar;
    s.inventory = (s.inventory || []).filter(it => !(Game.isKeepsake && Game.isKeepsake(it)));
    s.trauma = 40;
    const ctx = {};
    sootheTrauma(Game, ctx);
    check('G5 no keepsake -> trauma untouched', (s.trauma || 0) === 40, 'trauma=' + s.trauma);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
