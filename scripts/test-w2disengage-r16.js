#!/usr/bin/env node
// scripts/test-w2disengage-r16.js — proof test for the scale-wall r16 arm B
// W2-DISENGAGE lever (scripts/policies/competent.js, gate
// COMPETENT_W2DISENGAGE=1).
//
// Mechanism: an unarmored (P<20) scholar skips a forage tile holding a
// visible wave-2 top-4 monster (review_drone/bright_idea/mirror_stag/
// moderator) when the damage race is lost; armored (P>=20) scholars and
// non-top-4 monsters are unaffected; gate OFF = pure delegation
// (byte-identical legacy: never skips).
//
// RED phase: with the gate OFF the policy walks into the tile (returns
// false) — the instrument is inert. With the gate ON it skips.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const comp = require('./policies/competent');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function plantMonster(Game, mid, tx, ty) {
  try { Game.state.worldMonsters = (Game.state.worldMonsters || []).filter(m => !(m.tx === tx && m.ty === ty)); } catch (e) {}
  const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid) || {};
  const hp = (def.hp && def.hp[1]) || def.hp || 100;
  const wm = { id: mid, monsterId: mid, tx, ty, mx: 4, my: 4, hp, maxHp: hp };
  Game.worldMonsters().push(wm);
  return wm;
}

(async () => {
  process.env.COMPETENT_W2DISENGAGE = '0';
  const { Game } = await loadGame({ seed: 42, mode: 'w2d-test' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.hp = 100; s.health = 100;

  const realArmor = Game.armorBonus;
  const setArmor = (p) => { Game.armorBonus = () => p; };

  // RED: gate OFF — w2disengageOn() is false, so the call site (the forage
  // picker: `if (w2disengageOn() && w2disengageSkipTile(...))`) short-circuits
  // and never skips — pure delegation, byte-identical legacy.
  plantMonster(Game, 'review_drone', 3, 3);
  ok('gate OFF: w2disengageOn() false (call site short-circuits)',
    comp.w2disengageOn() === false);
  process.env.COMPETENT_W2DISENGAGE = '1';
  ok('gate ON: w2disengageOn() true', comp.w2disengageOn() === true);
  let ctx = {};
  ok('gate ON, empty tile: no skip', comp.w2disengageSkipTile(Game, ctx, 5, 5) === false);

  // gate ON, non-top-4 monster (bulldozer) — no skip.
  plantMonster(Game, 'bulldozer', 4, 4);
  ctx = {};
  ok('gate ON, bulldozer tile: no skip (not top-4)',
    comp.w2disengageSkipTile(Game, ctx, 4, 4) === false && (ctx.w2dSkipped || 0) === 0);

  // gate ON, review_drone, unarmored — SKIP.
  setArmor(0);
  ctx = {};
  const skipped = comp.w2disengageSkipTile(Game, ctx, 3, 3);
  ok('gate ON, unarmored vs review_drone: tile skipped',
    skipped === true && ctx.w2dSkipped === 1, 'skipped=' + skipped + ' n=' + ctx.w2dSkipped);
  ok('gate ON: first-decline detail captured', !!ctx.w2dFirst);

  // gate ON, review_drone, ARMORED (P=25) — no skip (fight: the r14 "slow" answer).
  setArmor(25);
  ctx = {};
  ok('gate ON, P=25 vs review_drone: no skip (armored: fight)',
    comp.w2disengageSkipTile(Game, ctx, 3, 3) === false && (ctx.w2dSkipped || 0) === 0);

  // gate ON, bright_idea + moderator + mirror_stag, unarmored — all skip.
  setArmor(5);
  for (const mid of ['bright_idea', 'moderator', 'mirror_stag']) {
    plantMonster(Game, mid, 2, 2);
    ctx = {};
    ok('gate ON, unarmored vs ' + mid + ': tile skipped',
      comp.w2disengageSkipTile(Game, ctx, 2, 2) === true && ctx.w2dSkipped === 1);
  }

  // gate OFF again — the call site short-circuits; no leaked gate state.
  process.env.COMPETENT_W2DISENGAGE = '0';
  ok('gate OFF again: w2disengageOn() false (no leaked gate state)',
    comp.w2disengageOn() === false);

  Game.armorBonus = realArmor;
  delete process.env.COMPETENT_W2DISENGAGE;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
