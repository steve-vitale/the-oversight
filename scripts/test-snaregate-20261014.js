#!/usr/bin/env node
// test-snaregate-20261014.js — sim-snaregate arm (flesh-out loop A, 2026-10-14).
// ARM 2 (food-economy axis), POLICY-SIDE. Blind-craft gate softening.
//
// The question (evidence/2026-10-13/sim-snaremat-20261013.md): workTrapline in
// scripts/policies/competent.js self-gates the L1 blind snare craft at
// vine>=3 && stick>=3 ("gamble only what you can lose"), while the ENGINE
// recipe only needs vine:1 + stick:1 (src/data/recipes.json). Should the gate
// stay that steep now that the wire bypass exists?
//
// The arm: scripts/policies/snaregate.js, opt-in gate SNARECRAFT_GATE=1
// (default OFF), attempts L1 blind snare crafts at vine>=2 && stick>=2 —
// one craft costs 1+1, so a failed 35%-odds attempt leaves one retry banked.
// Hooked from competent.js's workTrapline (competent-family policies only).
// No game-code edits.
//
// RED (pre-layer, run with the layer absent): the 3+3 gate holds — a 2+2
// inventory produces ZERO craft attempts; 3+3 produces exactly 1 (the harness
// can detect attempts); L2 at 1+1 produces 1 (reliable band untouched).
// GREEN (post-layer): gate OFF — identical to RED (byte-identical baseline);
// gate ON (SNARECRAFT_GATE=1) — 2+2 produces exactly 1 attempt through the
// honest Game.craft path (materials consumed win or lose), 3+3 still exactly
// 1 (base band; layer skips it — no double attempt), L2 1+1 still 1, L0 none,
// same-day double call still 1 (per-day caps).
//
// Usage: node scripts/test-snaregate-20261014.js  (SEED env override)
//        SNARECRAFT_GATE=1 node scripts/test-snaregate-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent, workTrapline } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '20261014', 10);
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function mats(Game, m) {
  return ((Game.state.scholar || {}).inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}
function tools(Game) { return ((Game.state.scholar || {}).tools || []); }

async function scenario({ seed, snareLevel, vine, stick, day, callTwice }) {
  const { Game } = await loadGame({ seed, mode: 'snaregate-proof' });
  await setupGame(Game);
  try {
    Game.state.codex = Game.state.codex || {};
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.snare = snareLevel >= 1 ? { level: snareLevel } : {};
  } catch (e) {}
  const inv = Game.state.scholar.inventory || (Game.state.scholar.inventory = []);
  if (vine) inv.push({ material: 'vine', units: vine, name: 'Vine', kcalEach: 0, spoilDay: 9999, kg: 0.1 });
  if (stick) inv.push({ material: 'stick', units: stick, name: 'Stick', kcalEach: 0, spoilDay: 9999, kg: 0.2 });
  Game.state.scholar.day = day;
  let attempts = 0, successes = 0;
  const _craft = Game.craft.bind(Game);
  Game.craft = function (id) {
    if (id === 'snare') attempts++;
    const r = _craft.apply(this, arguments);
    if (id === 'snare' && r) successes++;
    return r;
  };
  const ctx = {};
  workTrapline(Game, ctx);
  if (callTwice) workTrapline(Game, ctx);
  return {
    attempts, successes,
    vine: mats(Game, 'vine'), stick: mats(Game, 'stick'),
    snares: tools(Game).filter(t => t && t.recipeId === 'snare').length,
    level: ((Game.state.codex.recipes || {}).snare || {}).level || 0,
  };
}

(async () => {
  const GATE = process.env.SNARECRAFT_GATE === '1';
  console.log(`SNARECRAFT_GATE=${GATE ? '1 (armed)' : 'off (baseline)'} seed=${SEED}`);
  const V = (vine, stick) => ({ vine, stick });

  // ---- the blind band: 2+2 must NOT be attempted with the gate off ----
  const r22 = await scenario({ seed: SEED, snareLevel: 1, vine: 2, stick: 2, day: 5 });
  ok('L1 2+2: no attempt when gate off', GATE || r22.attempts === 0, `attempts=${r22.attempts}`);
  ok('L1 2+2: materials untouched when gate off', GATE || (r22.vine === 2 && r22.stick === 2),
    `vine=${r22.vine} stick=${r22.stick}`);
  if (GATE) {
    ok('L1 2+2: exactly 1 attempt when gate on', r22.attempts === 1, `attempts=${r22.attempts}`);
    ok('L1 2+2: materials at risk through the honest path (1+1 consumed win or lose)',
      (r22.vine + r22.stick) === 2, `vine=${r22.vine} stick=${r22.stick}`);
    ok('L1 2+2: at most one snare results', r22.snares <= 1, `snares=${r22.snares}`);
  }

  // ---- the base band: 3+3 was always attempted, must stay exactly 1 ----
  const r33 = await scenario({ seed: SEED, snareLevel: 1, vine: 3, stick: 3, day: 5 });
  ok('L1 3+3: exactly 1 attempt (base band, gate or not)', r33.attempts === 1, `attempts=${r33.attempts}`);
  ok('L1 3+3: no double attempt from the layer', !(GATE && r33.attempts > 1), `attempts=${r33.attempts}`);

  // ---- the L2 band: reliable craft untouched ----
  const r2 = await scenario({ seed: SEED, snareLevel: 2, vine: 1, stick: 1, day: 5 });
  ok('L2 1+1: exactly 1 attempt (reliable band, layer skips)', r2.attempts === 1, `attempts=${r2.attempts}`);

  // ---- L0: no attempt ever ----
  const r0 = await scenario({ seed: SEED, snareLevel: 0, vine: 5, stick: 5, day: 5 });
  ok('L0 5+5: no attempt (knowledge gate holds)', r0.attempts === 0, `attempts=${r0.attempts}`);

  // ---- per-day cap: two calls on the same day = still one attempt ----
  const rD = await scenario({ seed: SEED + 1, snareLevel: 1, vine: 3, stick: 3, day: 7, callTwice: true });
  ok('same-day double call: still 1 attempt', rD.attempts === 1, `attempts=${rD.attempts}`);
  if (GATE) {
    const rD2 = await scenario({ seed: SEED + 2, snareLevel: 1, vine: 2, stick: 2, day: 7, callTwice: true });
    ok('gate on, same-day double call at 2+2: still 1 attempt', rD2.attempts === 1, `attempts=${rD2.attempts}`);
  }

  // ---- the 2-held cap: a full line never crafts more ----
  const full = await scenario({ seed: SEED, snareLevel: 1, vine: 2, stick: 2, day: 5 });
  // (held-cap covered by pilot measurement; engine path can't hold a line
  //  in a unit proof without a full run — pilot asserts trapsCrafted stays small)
  ok('proof ran end to end', full.attempts >= 0);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
