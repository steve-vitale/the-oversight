#!/usr/bin/env node
// test-ledgerunload-20261014.js — LEDGER-BLIND UNLOADS proof (sim-findings #154, loop A r29 ARM 1).
//
// THE BLANK (r28 scholarreserve diagnostic, evidence/2026-10-14/sim-scholarreserve.md):
// the forager homecoming split (game.js returnToVillage) computes givenKcal
// for the say line ("unload 1260 kcal into Haven's pantry") but never writes
// v.gives[vid] and never calls recordGiveHist — the scholar's largest food
// contribution is invisible to the takes/gives ledger and the r8/r9 fair-share
// rate machinery. 30d measured: s11 takes=42148/gives=0/trust=0.
//
// Phase A (RED on pristine): a homecoming unload of known kcal leaves
//   v.gives[vid] unchanged and writes no giveHist entry -> FAIL on pristine.
//   GREEN after the fix: v.gives[vid] += pooled and one dated giveHist entry.
// Phase B (non-regression, both sides): a pure takeFromPantryBulk fixture at
//   deeply-negative cumulative net keeps its exact -2 trust delta and its
//   takes write — the take path is untouched by the fix.
//
// Node harness: sim-harness loadGame (full src/js list, Math.random seeded
// before eval), Game.save never stubbed, deterministic sim clock from r27.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function pantryKcal(Game) {
  return (Game.state.village.pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function giveHist(Game, vid) {
  return ((Game.state.village.giveHist || {})[vid] || []);
}

async function main() {
  const { Game } = await loadGame({ seed: 55, mode: 'proof-ledgerunload' });
  await setupGame(Game);
  const s = Game.state.scholar, v = Game.state.village, vid = Game.villagerId;
  let pass = 0, fail = 0;
  const check = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS', name); }
    else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); }
  };
  if (!vid) { console.log('  FAIL setup: no Game.villagerId'); process.exit(2); }

  // ---------- Phase A: homecoming unload recording ----------
  // 4500 kcal of FINISHED food (foodKind plant + foodState raw = not
  // isUnprocessed, so it never stages to the prep stash). KEEP_KCAL=2000
  // stays in the pack; exactly 2500 must pool.
  v.pantry = []; v.pantryKcal = 0;
  s.inventory = [{ name: 'Trailberries', kcalEach: 100, units: 45,
    spoilDay: (s.day || 1) + 30, plantId: 'test_berry', foodKind: 'plant',
    foodState: 'raw', safe: true, edible: true, unit: 'portion', kg: 0.2 }];
  const gives0 = (v.gives || {})[vid] || 0;
  const gh0 = giveHist(Game, vid).length;
  const pk0 = pantryKcal(Game);
  const lines = [];
  const origSay = Game.say; Game.say = (m) => { lines.push(String(m)); };
  Game.returnToVillage();
  Game.say = origSay;
  const pooled = pantryKcal(Game) - pk0;
  const givesDiff = ((v.gives || {})[vid] || 0) - gives0;
  const gh = giveHist(Game, vid);
  const lastGive = gh[gh.length - 1];
  check('unload pools known kcal (2500)', pooled === 2500, 'pooled=' + pooled);
  check('v.gives[vid] recorded == pooled', givesDiff === pooled,
    `givesDiff=${givesDiff} pooled=${pooled}`);
  check('one dated giveHist entry written',
    gh.length === gh0 + 1 && !!lastGive && lastGive.kcal === pooled && lastGive.day === (s.day || 0),
    JSON.stringify(lastGive));
  const unloadLine = lines.find(l => /unload \d[\d,]* kcal into Haven's pantry/.test(l));
  check('say line honest', !!unloadLine && unloadLine.includes('2500'), unloadLine);

  // ---------- Phase B: take path untouched ----------
  v.pantry = [{ name: 'Bread', kcalEach: 200, units: 20,
    spoilDay: (s.day || 1) + 30, plantId: 'test_bread', foodKind: 'plant',
    foodState: 'raw', safe: true, edible: true, unit: 'loaf', kg: 0.3 }];
  v.takes = v.takes || {}; v.gives = v.gives || {}; v.trust = v.trust || {};
  v.takes[vid] = 60000; v.gives[vid] = 0; v.trust[vid] = 20;
  const t0 = v.trust[vid];
  Game.takeFromPantryBulk({ 0: 2 });
  check('take trust delta unchanged (-2)', v.trust[vid] === t0 - 2,
    `trust ${t0} -> ${v.trust[vid]}`);
  check('take still writes takes (+400)', v.takes[vid] === 60000 + 400,
    'takes=' + v.takes[vid]);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
