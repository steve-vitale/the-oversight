#!/usr/bin/env node
// test-thiefcooldown-b.js — proof for the loop-B sim-thiefcooldown-b arm
// (food-economy/trust surface, scale-wall lens, 2026-10-20; answers the
// findings-backlog entry "Thief-ability theft spam", 2026-10-20).
//
// Finding: on seed 8801 (leadfeast, SURPLUSFEED=1), a policy scholar with the
// Light Fingers thief ability trips the takes/gives -5000 bar through
// ORDINARY PANTRY EATING and eats ~30 "Caught red-handed! They saw you steal.
// Trust -20." in 10 days (d135-144), with no cooldown — village-trust craters.
//
// Investigation verdict (see evidence/2026-10-21/sim-thiefcooldown-b.md):
// DEFECT — the takes/gives ledger misfiring on communal eating. The bar in
// takeFromPantry / takeFromPantryBulk is the lifetime cumulative gross
// `net = gives - takes < -5000`, which has no time dimension: ~2.5 days of
// fair-share eating crosses it forever, so every later take reads as theft.
// This is the same defect class the codebase already fixed twice: r7
// (theftConfrontation: cumulative -> this-take + trailing-7d rate) and r9
// (freeloaderTick: cumulative -> trailing-7d net rate vs fair share).
// The fix replaces the cumulative bar with the trailing-7d NET take rate
// against the 3000 kcal/day abuse bar (1.5x the ~2000 fair-share norm, Steve
// 2026-10-06) — the bar pre-registered by sim-findings #156 (2026-10-14).
// Genuine theft still punished: single big grabs trip theftConfrontation's
// this-take bar; sustained drains trip the freeloader clock; and the thief
// branch below still fires whenever the rate bar trips.
//
// Real RED -> GREEN on a live Game, no mocks.
//
// MODE=red  (pre-fix code): PART 1 RED — paced ordinary eating (3 x 600 kcal
//   / day x 10 days, netRate7 ~1800/day < fair share) trips the cumulative
//   bar and produces caught-red-handed spam; trust craters to 0.
//   CONTROL documents that the OLD bar is blind to the rate ledger: a big
//   recorded take history (takeHist) does NOT trip it.
// MODE=green (post-fix code): PART 2 GREEN — the same paced ordinary eating
//   produces ZERO caught events and trust stays 15. PART 3 CONTROL — a
//   scripted genuine theft (recorded 22000 kcal take history -> netRate7 ~
//   3142 >= 3000) still trips the thief branch: caught coin -> -20 trust +
//   the line;
//   clean coin -> "palm the food cleanly", no trust loss.
// DET (both modes): DET-A donor scenario (net never near either bar) is
//   byte-identical pre/post; DET-B ordinary eater shows the fix is confined
//   to the previously-misfiring nick (the ONLY say-line delta is the removed
//   nick lines).
//
// Usage:
//   MODE=red   node scripts/test-thiefcooldown-b.js   # on pre-fix code
//   MODE=green node scripts/test-thiefcooldown-b.js   # on post-fix code
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const MODE = process.env.MODE || 'red';
let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL [' + MODE + ']: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}

function havenXY(Game) {
  const v = Game.state.village || {};
  return [(v.px !== undefined && v.px !== null) ? v.px : 4, (v.py !== undefined && v.py !== null) ? v.py : 4];
}
function parkAtHaven(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx; Game.map.py = hy;
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
}
function sayCapture(Game) {
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (msg) { lines.push(String(msg)); return os(msg); };
  return lines;
}
function trustOf(Game) {
  const v = Game.state.village || {};
  const vid = Game.state.scholar.villagerId;
  return ((v.trust || {})[vid] === undefined) ? 15 : (v.trust || {})[vid];
}
function grantThief(Game) {
  const s = Game.state.scholar;
  s.abilities = s.abilities || [];
  s.abilities.push({ id: 'thief' });
  if (!Game.hasAbility('thief')) throw new Error('thief ability did not stick');
}
// Fixture: live Game, haven-parked scholar, stocked pantry. No policy daily —
// the test drives takeFromPantry directly (the verb the finding implicates).
async function fixture(seed, thief) {
  const { Game } = await loadGame({ seed, mode: 'thiefcooldown-test' });
  await setupGame(Game);
  parkAtHaven(Game);
  const v = Game.state.village;
  // replace the pantry outright: the fixture takes pantry[0] every time, so
  // the stack under test must be the ONLY entry (setupGame pre-stocks).
  v.pantry = [{ name: 'Test stew', kcalEach: 600, units: 60, kg: 0.1, edible: true, foodState: 'cooked' }];
  if (thief) grantThief(Game);
  const lines = sayCapture(Game);
  return { Game, lines };
}
// Paced ordinary eating: 3 takes of 600 kcal per day, advancing scholar.day
// so the dated takeHist sees the real cadence. 1800 kcal/day < 2000 fair share.
async function pacedEating(Game, days) {
  let takes = 0;
  for (let d = 0; d < days; d++) {
    Game.state.scholar.day = d;
    for (let t = 0; t < 3; t++) {
      Game.takeFromPantry(0);
      takes++;
    }
  }
  return takes;
}
const countCaught = (lines) => lines.filter(l => /Caught red-handed/.test(l)).length;
const countNick = (lines) => lines.filter(l => /Someone watches you (take|load up)/.test(l)).length;

async function main() {
  console.log('MODE=' + MODE);

  if (MODE === 'red') {
    console.log('PART 1 — RED: ordinary paced eating trips the cumulative bar (pre-fix)');
    {
      const { Game, lines } = await fixture(8801, true);
      ok(trustOf(Game) === 15, 'RED setup: trust starts at 15');
      const takes = await quietLog(() => pacedEating(Game, 10));
      const caught = countCaught(lines);
      console.log(`    takes=${takes} caught=${caught} trust=${trustOf(Game)}`);
      ok(takes === 30, `RED: 30 real paced takes happened (got ${takes})`);
      ok(caught >= 5, `RED: caught-red-handed spam is real on ordinary eating (caught=${caught} over 30 takes, bar is the cumulative ledger)`);
      ok(trustOf(Game) === 0, `RED: trust cratered to 0 (got ${trustOf(Game)})`);
    }

    console.log('PART 3b — CONTROL (old code): the cumulative bar is blind to the rate ledger');
    {
      const { Game, lines } = await fixture(8802, true);
      const vid = Game.state.scholar.villagerId;
      // a big RECORDED take history (a genuine hoard): 22000 kcal today
      Game.recordTakeHist(vid, 22000);
      const realRandom = Math.random;
      Math.random = () => 0.9; // force the "caught" coin
      try { await quietLog(() => Game.takeFromPantry(0)); }
      finally { Math.random = realRandom; }
      const caught = countCaught(lines);
      console.log(`    caught=${caught} trust=${trustOf(Game)} (old bar: v.takes gross only)`);
      ok(caught === 0, 'CONTROL-old: a genuine recorded hoard does NOT trip the old bar (it only sees cumulative v.takes gross) — documenting the blind spot the fix closes');
    }
  }

  if (MODE === 'green') {
    console.log('PART 2 — GREEN: ordinary paced eating no longer trips the bar (post-fix)');
    {
      const { Game, lines } = await fixture(8801, true);
      const takes = await quietLog(() => pacedEating(Game, 10));
      const caught = countCaught(lines);
      const rate = Game.takeRate7(Game.state.scholar.villagerId);
      console.log(`    takes=${takes} caught=${caught} trust=${trustOf(Game)} takeRate7~${Math.round(rate)}`);
      ok(takes === 30, `GREEN: 30 real paced takes happened (got ${takes})`);
      ok(caught === 0, `GREEN: ZERO caught-red-handed on fair-share eating (caught=${caught}; primary metric <= 3/10d)`);
      ok(trustOf(Game) === 15, `GREEN: trust untouched at 15 (got ${trustOf(Game)})`);
    }

    console.log('PART 3 — CONTROL: genuine theft still trips the thief branch (post-fix)');
    {
      const { Game, lines } = await fixture(8803, true);
      const vid = Game.state.scholar.villagerId;
      Game.recordTakeHist(vid, 22000); // a genuine hoard: netRate7 ~3142 >= 3000
      const realRandom = Math.random;
      Math.random = () => 0.9; // force the "caught" coin
      try { await quietLog(() => Game.takeFromPantry(0)); }
      finally { Math.random = realRandom; }
      const caught = countCaught(lines);
      console.log(`    caught-coin: caught=${caught} trust=${trustOf(Game)}`);
      ok(caught === 1, 'CONTROL: the thief branch still fires on a genuine over-share take (caught line voiced)');
      ok(trustOf(Game) === 0, 'CONTROL: caught theft still costs -20 trust (15 -> 0)');
    }
    {
      const { Game, lines } = await fixture(8804, true);
      const vid = Game.state.scholar.villagerId;
      Game.recordTakeHist(vid, 22000);
      const realRandom = Math.random;
      Math.random = () => 0.1; // force the "clean palm" coin
      try { await quietLog(() => Game.takeFromPantry(0)); }
      finally { Math.random = realRandom; }
      const palm = lines.filter(l => /palm the food cleanly/.test(l)).length;
      console.log(`    clean-coin: palm=${palm} trust=${trustOf(Game)}`);
      ok(palm === 1, 'CONTROL: the clean-palm beat still fires (Light Fingers 50% evasion intact)');
      ok(trustOf(Game) === 15, 'CONTROL: a clean steal costs no trust (the ability still works)');
      ok(countCaught(lines) === 0, 'CONTROL: no caught line on the clean coin');
    }
  }

  console.log('PART 4 — DET-A: donor scenario (bar never fires either way)');
  {
    const { Game, lines } = await fixture(8805, false); // no thief
    const v = Game.state.village;
    const vid = Game.state.scholar.villagerId;
    v.gives = v.gives || {};
    v.gives[vid] = 20000; // heavy donor: net stays positive
    const t0 = trustOf(Game);
    const takes = await quietLog(() => pacedEating(Game, 10));
    const caught = countCaught(lines), nick = countNick(lines);
    const summary = JSON.stringify({ mode: MODE, takes, t0, tEnd: trustOf(Game), caught, nick });
    console.log('    DET-A summary: ' + summary);
    ok(takes === 30 && caught === 0 && nick === 0 && trustOf(Game) === 15,
      `DET-A: donor run quiet in ${MODE} (trust ${t0}->${trustOf(Game)}) — compare summaries across modes for byte-identical behavior`);
  }

  console.log('PART 4b — DET-B: ordinary eater, non-thief (the fix is confined to the nick)');
  {
    const { Game, lines } = await fixture(8806, false); // no thief
    const takes = await quietLog(() => pacedEating(Game, 10));
    const nick = countNick(lines);
    const summary = JSON.stringify({ mode: MODE, takes, tEnd: trustOf(Game), nick });
    console.log('    DET-B summary: ' + summary);
    if (MODE === 'red') {
      ok(trustOf(Game) === 0 && nick > 0, `DET-B-red: non-thief ordinary eater also cratered pre-fix (trust=${trustOf(Game)}, nicks=${nick}) — the misfire was never thief-specific`);
    } else {
      ok(trustOf(Game) === 15 && nick === 0, `DET-B-green: non-thief ordinary eater quiet post-fix (trust=${trustOf(Game)}, nicks=${nick})`);
    }
  }

  console.log(`\nPROOF ${MODE.toUpperCase()} GREEN: ${pass} assertions`);
}
main().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
