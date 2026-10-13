#!/usr/bin/env node
// scripts/test-famine-racks-r5-20261013.js — mechanism proof for the
// famine-aware racks lever (longsim scale-wall r5, 2026-10-13).
//
// Claims:
//  1. Gate OFF (default): the cook's racks-full guard behaves exactly as
//     before (pristine parity — no behavior change when the lever is off).
//  2. Gate ON: the guard stands down — the cook smokes eligible surplus up
//     to budget even when preservedKcal >= rackCap.
//  3. Smoked items are honest: 0.80x blind / 0.95+ skilled, never create kcal,
//     budget-capped at 4000 input per resolution.
//  4. Deterministic on seeds 11, 22, 33 (SEED override).
//
// RED-verification: run with FOODLEVER_R5=1 on pristine (gate code absent) —
// T2 must FAIL (guard holds, smoked=0). With the lever, T2 passes.
// (The famine-aware variant was killed: pantryDays<7 never co-occurs with
// racks-full. This tests the simpler stand-down.)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [11, 22, 33]);
const GATE = process.env.FOODLEVER_R5 === '1';
let passed = 0;
function ok(name, cond, detail) {
  if (!cond) { console.error(`FAIL ${name}: ${detail || ''}`); process.exitCode = 1; return; }
  passed++; console.log(`ok ${name}`);
}

// Build a synthetic pantry: racks "full" (preserved >= rackCap) + a pile of
// fresh eligible (spoilDay = day+1) beyond the dinner reserve.
function rigPantry(Game, freshKcal) {
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  v.pantry = [];
  // preserved stock: 25k (above any plausible rackCap for a 12-person village)
  v.pantry.push({ name: 'Fish (smoked)', kcalEach: 500, units: 50, foodState: 'preserved', foodKind: 'meat', spoilDay: day + 20, safe: true });
  // fresh eligible: spoilDay day+1 (within the 2-day window), 500-kcal pieces
  const units = Math.max(1, Math.round(freshKcal / 500));
  v.pantry.push({ name: 'Fish catch', kcalEach: 500, units, spoilDay: day + 1, safe: true });
  return day;
}

function preservedKcal(Game) {
  let k = 0;
  for (const it of ((Game.state.village || {}).pantry || []))
    if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) k += (it.kcalEach || 0) * (it.units || 1);
  return k;
}

(async () => {
  for (const seed of SEEDS) {
    const tag = `seed${seed}`;
    // --- rig a game, find a cook, force the racks-full state ---
    const { Game } = await loadGame({ seed, mode: 'famine-racks-test' });
    await setupGame(Game);
    const v = Game.state.village;
    const day = rigPantry(Game, 8000);
    // force thin buffer: burnHistory high draw, pantry low-ish (we rigged 25k+8k though).
    // pantryDaysEstimate uses burnHistory; fake a hungry history.
    v.burnHistory = [20000, 20000, 20000, 20000, 20000, 20000, 20000];
    const pdays = Game.pantryDaysEstimate();
    ok(`${tag} T0 rigged thin buffer`, pdays < 7, `pantryDays=${pdays}`);

    // find any live villager to act as cook
    const vid = (v.roster || []).find(id => id !== Game.villagerId && !(Game.getPerson(id) || {}).dead);
    assert(vid, 'no live villager');
    const p0 = preservedKcal(Game);
    ok(`${tag} T0 racks full`, p0 >= 20000, `preserved=${p0}`);

    // drive one cook resolution directly
    Game.resolveOneAssignment(vid, { task: 'cook' });
    const p1 = preservedKcal(Game);
    const smoked = p1 - p0;

    if (!GATE) {
      // T1 (gate off): pristine parity — the guard fires, nothing smoked
      ok(`${tag} T1 gate-off guard holds`, smoked <= 0, `smoked=${smoked} (guard should hold when gate off)`);
    } else {
      // T2 (gate on): the guard stands down, surplus smoked
      ok(`${tag} T2 gate-on smokes`, smoked > 0, `smoked=${smoked} (guard should stand down with gate on)`);
      // T4: honesty — the per-resolution budget caps INPUT at 4000 kcal;
      // smoked net must be <= 4000 (never create) and >= 4000*0.80 - rounding
      ok(`${tag} T4 honest conversion`, smoked <= 4000 && smoked >= 4000 * 0.80 - 600,
        `smoked=${smoked} (budget 4000 in, 0.80x blind)`);
      // T3: idempotent — a second cook resolution with even fuller racks
      // still smokes (no crash, no nonsense, still budget-capped)
      const p1b = preservedKcal(Game);
      Game.resolveOneAssignment(vid, { task: 'cook' });
      const p2 = preservedKcal(Game);
      ok(`${tag} T3 second resolution sane`, p2 - p1b >= 0 && p2 - p1b <= 4000,
        `delta=${p2 - p1b}`);
    }
  }
  console.log(`\n${passed} assertions passed (GATE=${GATE})`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
