#!/usr/bin/env node
// test-armup-r1.js — PROOF for the combat-r1 "ARM UP" lever (policy-side).
// Asserts the MECHANISM: on seed 11, the competent policy crafts a stone_knife
// via armUp (armedKnife counter fires) and the player is observed armed
// (non-unarmed weapon) at least once in the first 20 days. Survival is
// measured by the sweep, not here — the lever was KILLED AT PILOT (it does
// not move the wall), but the mechanism itself works.
// Usage: node scripts/test-armup-r1.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const base = require('./policies/competent').competent;

(async () => {
  const { Game } = await loadGame({ seed: 11, mode: 'armup-proof' });
  await setupGame(Game);
  const policy = Object.assign({}, base); policy.id = 'competent-armup';
  let cap = null, everArmed = false;
  const od = base.daily;
  policy.daily = (G, c) => {
    cap = c;
    const r = od(G, c);
    try {
      const w = (G.equippedWeapon && G.equippedWeapon()) || {};
      if (!w.unarmed) everArmed = true;
    } catch (e) {}
    return r;
  };
  await runDays(Game, policy, { days: 20 });
  const crafted = cap && (cap.armedKnife || 0) > 0;
  console.log('armedKnife crafts=' + (cap && cap.armedKnife), 'everArmed=' + everArmed);
  let fails = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fails++; };
  check('armUp crafts a stone_knife when materials are on hand', crafted);
  check('player observed armed (non-bare-hands) during the run', everArmed);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
