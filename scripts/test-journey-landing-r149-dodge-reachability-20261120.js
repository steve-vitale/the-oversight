#!/usr/bin/env node
// test-journey-landing-r149-dodge-reachability-20261120.js — proof test for
// the r149 DODGE-REACHABILITY fix (journey-landing r149 2026-11-20).
//
// The defect (panel r149 BEFORE, seed 1277 d21 vs The Paparazzo, wave 2):
// the scholar stands at the grid corner (8,8) with 3 squares of movement
// left when the Paparazzo's Flash Photography windup fires. The
// move_windup trick calls beastDodgeMove, which tries EVERY free interior
// tile nearest-first — 33 attempts in one turn — although every tile is
// 5+ squares away and the game refuses each one ("Too far — 3 squares
// left."; the engine's consecutive-duplicate dedup silences 29 of the 33,
// so the log reads mostly silent). The scholar's whole turn burns on a
// hopeless scan; the fight ends won on the allies' damage with the scholar
// having stood through it. beastDodgeMove is the only fight-step helper
// without the R140 budget stop and without the step-don't-teleport
// reachability check that closeStep and beastStrikeTarget already carry
// (competent.js) — it attempts tiles the game cannot accept.
//
// The fix (scripts/policies/competent.js beastDodgeMove): mirror the
// game's own up-front pricing before calling tbPlayerMove — skip any
// candidate with no path or whose full path cost exceeds moveLeft — and
// stop the scan at once when moveLeft is spent (R140 budget stop). A turn
// where no tile is reachable records dodgeStuckTurns and ends WITHOUT
// counting the trick, exactly as the r128 dodge-fallback fix established.
//
// Cases (stub Game/fight — beastTrickPlay takes Game, f, ctx, p, endTurn,
// so no full harness is needed; each case runs in its own process so a
// case cannot leak state into another):
//   windup-corner     : the panel shape — scholar (8,8), moveLeft 3,
//             statickite windup telegraph covering every tile within 4
//             of the corner, so every free tile is 5+ away. Zero
//             tbPlayerMove calls, scholar unmoved, beastTricks 0,
//             dodgeStuckTurns 1, kind 'move_windup'. On unfixed code the
//             scan attempts every free tile (30+ calls) -> FAIL.
//   windup-reachable  : scholar (4,4), moveLeft 3, a free tile outside
//             the lane within reach — scholar moves, beastTricks 1.
//             Pins the working path (also green on unfixed code).
//   budget-zero       : scholar (4,4), moveLeft 0 — zero calls, 'stuck'.
//             On unfixed code the scan still attempts every tile -> FAIL.
//   sidestep-corner   : the same cornered shape via the bulldozer
//             sidestep — zero calls, 'stuck', kind 'sidestep'. On
//             unfixed code the scan attempts every free tile -> FAIL.
//
// Usage: node scripts/test-journey-landing-r149-dodge-reachability-20261120.js [case]
//   Default (no arg): runs all four cases, spawning children for the three
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.beastTrickPlay !== 'function') {
  console.log('FAIL beastTrickPlay export missing — the r128 fix is not present (unfixed code)');
  process.exit(1);
}
const { beastTrickPlay } = mod;

const MONSTERS = [
  { id: 'statickite', counter: { kind: 'move_windup' } },
  { id: 'bulldozer', counter: { kind: 'sidestep' } },
  { id: 'bright_idea', counter: { kind: 'keep_distance', tiles: 3 } },
];

// The stub models the game's own movement rules faithfully: findPath
// returns a Chebyshev path (diagonal steps), each tile costs 1, and
// tbPlayerMove prices the whole path up front — no path, or a cost over
// moveLeft, is refused without moving (game.js tbPlayerMove). This is what
// separates a reachable dodge tile from a hopeless one.
function chebPath(x0, y0, x1, y1) {
  const out = [];
  let x = x0, y = y0;
  while (x !== x1 || y !== y1) {
    x += Math.sign(x1 - x);
    y += Math.sign(y1 - y);
    out.push([x, y]);
  }
  return out;
}

function stubGame(sx, sy, moveLeft, mx, my, mid, telegraphCells) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: moveLeft, hp: 100, maxHp: 100 };
  const m = { key: 'm_0', kind: 'monster', monsterId: mid, alive: true, hp: 50, maxHp: 50,
    mx: mx, my: my, telegraph: telegraphCells ? { cells: telegraphCells } : null };
  const f = { id: 'fight1', round: 1, over: false, fighters: [p, m] };
  const calls = [];
  const Game = {
    data: { monsters: MONSTERS },
    state: { monsterCounters: { statickite: 1, bulldozer: 1, bright_idea: 1 }, codex: { monsters: {} }, scholar: {} },
    map: { px: 4, py: 4 },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    findPath: (x0, y0, x1, y1) => chebPath(x0, y0, x1, y1),
    tbTerrainCost: () => 1,
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
      const path = chebPath(p.mx, p.my, x, y);
      if (!path.length) return false;
      if (path.length > p.moveLeft) return false;
      p.moveLeft -= path.length;
      p.mx = x; p.my = y;
      return true;
    },
  };
  return { Game, f, p, m, calls };
}

// The panel's telegraph: every tile within Chebyshev 4 of the corner
// (8,8) — the (4,4)-(7,7) block — so the nearest free tile is 5 away.
function cornerAvoid() {
  const cells = [];
  for (let x = 4; x <= 7; x++) for (let y = 4; y <= 7; y++) cells.push({ cx: x, cy: y });
  return cells;
}

function runCase(which) {
  if (which === 'windup-corner') {
    // Scholar (8,8), moveLeft 3, statickite at (5,5), telegraph covering
    // the whole near-corner block. Every free tile costs 5+ > 3.
    const { Game, f, p, calls } = stubGame(8, 8, 3, 5, 5, 'statickite', cornerAvoid());
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('windup-corner trick plays (turn spent)', r === true, 'got ' + r);
    check('windup-corner NO move attempted (hopeless scan refused)', calls.length === 0, 'calls=' + calls.length);
    check('windup-corner scholar unmoved', p.mx === 8 && p.my === 8, 'at ' + p.mx + ',' + p.my);
    check('windup-corner trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('windup-corner stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('windup-corner stuck detail names the trick', ctx._dodgeStuck && ctx._dodgeStuck.kind === 'move_windup', JSON.stringify(ctx._dodgeStuck));
    check('windup-corner turn ended', ended === true);
  } else if (which === 'windup-reachable') {
    // Scholar (4,4), moveLeft 3, statickite at (5,5), lane (4,4)-(6,4).
    // Nearest free tile outside the lane is (3,3), cost 1 — must land.
    const { Game, f, p, calls } = stubGame(4, 4, 3, 5, 5, 'statickite',
      [{ cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }]);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('windup-reachable trick plays', r === true, 'got ' + r);
    check('windup-reachable scholar moved off the lane', p.mx === 3 && p.my === 3, 'at ' + p.mx + ',' + p.my);
    check('windup-reachable trick counted once', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
    check('windup-reachable turn ended', ended === true);
    check('windup-reachable no stuck recorded', !ctx.dodgeStuckTurns, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('windup-reachable one attempt only', calls.length === 1, 'calls=' + calls.length);
  } else if (which === 'budget-zero') {
    // Scholar (4,4), moveLeft 0 — nothing is reachable; the scan must not
    // even start.
    const { Game, f, p, calls } = stubGame(4, 4, 0, 5, 5, 'statickite',
      [{ cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }]);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('budget-zero trick plays (turn spent)', r === true, 'got ' + r);
    check('budget-zero NO move attempted (no budget)', calls.length === 0, 'calls=' + calls.length);
    check('budget-zero scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('budget-zero trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('budget-zero stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('budget-zero turn ended', ended === true);
  } else if (which === 'sidestep-corner') {
    // The sidestep twin: the scholar must be IN the lane for the trick to
    // fire, so the cornered shape is a lane that covers the scholar's whole
    // neighbourhood — scholar (4,4), moveLeft 1, bulldozer lane = the 3x3
    // block (3..5, 3..5). Every tile outside the lane is 2+ away, so every
    // candidate costs more than the 1 square left.
    const lane = [];
    for (let x = 3; x <= 5; x++) for (let y = 3; y <= 5; y++) lane.push({ cx: x, cy: y });
    const { Game, f, p, calls } = stubGame(4, 4, 1, 5, 5, 'bulldozer', lane);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('sidestep-corner trick plays (turn spent)', r === true, 'got ' + r);
    check('sidestep-corner NO move attempted (hopeless scan refused)', calls.length === 0, 'calls=' + calls.length);
    check('sidestep-corner scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('sidestep-corner trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('sidestep-corner stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('sidestep-corner stuck detail names the trick', ctx._dodgeStuck && ctx._dodgeStuck.kind === 'sidestep', JSON.stringify(ctx._dodgeStuck));
    check('sidestep-corner turn ended', ended === true);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('windup-corner');
  for (const c of ['windup-reachable', 'budget-zero', 'sidestep-corner']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
