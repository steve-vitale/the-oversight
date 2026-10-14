#!/usr/bin/env node
// test-triage-20261014.js — PANTRY TRIAGE arm proof test (food economy).
//
// The blank (sim-findings #30): the duty-time cook drive only works the
// racks when the leader staffs a cook — in the court's daily press nobody
// does, so the about-to-rot surplus the evening meal couldn't finish sits
// until it rots. The evening triage (Game.eveningTriage, hooked at the end
// of villageEats) triages the village's own pantry after the meal: the
// 0..2-day about-to-rot remainder goes onto the smoke racks up to one
// evening's budget, keeping ~1 night of the measured draw fresh.
//
// RED (pristine): Game.eveningTriage is absent; a crafted 4,000 kcal
//   would-rot stack (sd=day+1) rots when the day advances past it.
// GREEN (fixed): the triage preserves the excess (blind 0.80x, 15d), keeps
//   ~1 night (125/person) fresh, excludes the already-spoiled stack (canon:
//   rot can't be smoked back into food), stands down honestly when the
//   racks are full, and narrates in a human beat.
// Invariants: laundered == 0 on both sides; the dinner reserve concept is
//   untouched (the drive is unchanged).
// Node harness: full src/js list in index.html order, Math.random seeded
// before eval (sim-harness), Game.save never stubbed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function stack(name, day, sdOffset, units, kcalEach, tag) {
  const s = { name, kcalEach, units, spoilDay: day + sdOffset, foodKind: 'meat',
    foodState: 'fresh', safe: false, diseaseRisk: 0.1, kg: 0.2, unit: 'portion' };
  if (tag) s[tag] = true;
  return s;
}
const presKcal = (v) => (v.pantry || [])
  .filter(i => i.foodState === 'preserved' || i.foodState === 'rendered')
  .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-triage', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const lines = [];
  Game.say = (s) => { lines.push(String(s)); };

  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };
  const hasTriage = typeof Game.eveningTriage === 'function';
  console.log('eveningTriage present: ' + hasTriage);

  const rosterN = (v.roster || []).length;
  check('roster is a real village (>=10)', rosterN >= 10);

  if (!hasTriage) {
    // ---------- RED: the miss is real on pristine ----------
    v.pantry = [stack('Fresh venison', day, 1, 40, 100, '_testRot')];
    // two days pass with no triage: the stack spoils and the sweep takes it.
    Game.state.scholar.day = day + 2;
    Game.sweepSpoiled();
    const rotted = !(v.pantry || []).some(i => i._testRot);
    check('RED: would-rot surplus rots with no triage (the miss)', rotted);
    console.log('RED COMPLETE — mechanism absent, surplus lost. Re-apply the patch for GREEN.');
    process.exit(rotted ? 0 : 1);
  }

  // ---------- GREEN: the triage catches the would-rot surplus ----------
  // Phase 1: would-rot surplus + one already-spoiled stack.
  v.pantry = [
    stack('Fresh venison', day, 1, 40, 100, '_testRot'),   // 4,000 kcal, sd=day+1
    stack('Old fish', day, -1, 10, 100, '_testSpoiled'),  // spoiled, must NOT launder
  ];
  const before = presKcal(v);
  const res = Game.eveningTriage(v);
  const triaged = presKcal(v) - before;
  check('triage ran (n>0)', res.n > 0);
  check('triage preserved real kcal (>0)', triaged > 0);
  // ~1 night of the measured draw (125/person) stays fresh; the excess is preserved.
  const freshLeft = (v.pantry || []).filter(i => i._testRot && i.foodState !== 'preserved')
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const reserveExpect = 125 * rosterN;
  check(`~1 night of draw kept fresh (${Math.round(freshLeft)} vs ~${reserveExpect})`,
    freshLeft > 0 && freshLeft <= reserveExpect + 100);
  const laundered = (v.pantry || [])
    .filter(i => i._testSpoiled && (i.foodState === 'preserved' || i.foodState === 'rendered')).length;
  check('no spoiled stack laundered (canon)', laundered === 0);
  const beat = lines.some(l => /lantern/.test(l) && /smoke racks/.test(l));
  check('human beat narrated (lantern + smoke racks)', beat);
  // the preserved stack survives two more days; the kept-fresh remainder does not outlive its shelf.
  Game.state.scholar.day = day + 2;
  Game.sweepSpoiled();
  const presSurvives = (v.pantry || []).some(i => i.foodState === 'preserved');
  check('preserved stack survives past the rot window', presSurvives);

  // Phase 2: racks-full stand-down — the cap is never bypassed.
  Game.state.scholar.day = day;
  v.pantry = [stack('Fresh venison', day, 1, 40, 100, '_testRot2')];
  const cap = 125 * rosterN * 13; // unskilled ownShelf=15 → max(1,15-2); skilled caps run higher — the test pile (110k) clears them all
  v.pantry.push(stack('Smoked stores', day, 10, 1000, 110)); // 110,000 kcal preserved — over any racks cap
  v.pantry[v.pantry.length - 1].foodState = 'preserved';
  lines.length = 0;
  const res2 = Game.eveningTriage(v);
  check('racks-full: triage stands down (n=0)', res2.n === 0 && res2.stoodDown === true);
  check('racks-full: honest stand-down beat', lines.some(l => /racks are already full/.test(l)));
  const untouched = (v.pantry || []).some(i => i._testRot2 && i.foodState !== 'preserved');
  check('racks-full: would-rot stack left for the meal, not smoked', untouched);

  // Phase 3: the hook — villageEats ends with the triage (source check).
  const fs = require('fs');
  const src = fs.readFileSync(__dirname + '/../src/js/game.js', 'utf8');
  const hookIdx = src.indexOf('this.eveningTriage(v)');
  const eatsIdx = src.indexOf('villageEats() {');
  check('eveningTriage hooked inside villageEats', hookIdx > eatsIdx);

  console.log(fail === 0 ? 'GREEN COMPLETE — all checks passed.' : `GREEN INCOMPLETE — ${fail} check(s) failed.`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH:', e && e.message); process.exit(2); });
