// test-competent-flee-stuckwalk-20261023.js — proof test for the r37
// stuck-flee-walk fix in the shared competent policy
// (scripts/policies/competent.js), env-gated behind
// COMPETENT_EXIT_VERIFIED_FLEE=1 (default off: legacy behavior byte-identical).
//
// BEFORE (shared driver, legacy path with COMPETENT_DPS_RACE=1, gate on or off):
// the flee branch walks toward the nearest edge; when the walk path fails
// (game.js: "No path there.") the turn ends with the player unmoved — and the
// policy re-flees next turn, forever. Evidence: journey-deepening r36 seed
// 10004, d63 moderator — 25 rounds of "No path there.", the scholar went
// down without striking once. The r36 consumed-push port only covers TRUTHY
// pushes consumed without exiting; a walk that fails (or a push that fails
// silently) never marks the fight unfleeable.
//
// AFTER (gate on): consecutive zero-progress flee turns on the same fight
// are counted; at 3, the fight is marked unfleeable (ctx._fleeBlockedFor) and
// flee() returns false BEFORE endTurn (the failed walk spent nothing), so
// fight() falls through to beast-trick play and strikes — a real player
// reads the room and fights. Legit edge-walks are never counted: any
// movement (or exit, or real push) resets the counter.
//
// Mock: player at 30% HP in the grid center (not on an edge, so no barrier
// pick), one LIVE moderator, tbPlayerMove that never moves (faithful to the
// d63 capture: "No path there." every round).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { competent } = require(path.join(ROOT, 'scripts', 'policies', 'competent.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// opts.move: 'stuck' (walk never moves — the d63 case) or 'walks' (one tile
// per turn toward the edge — the legit case). opts.monsterLive: live monster
// so the strike path is exercised when flee gives up.
function mockGame(opts) {
  const f = { id: 'fw', over: false, fighters: [] };
  const p = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 30, maxHp: 100, moveLeft: 3, acted: false };
  const mon = { key: 'm_0', kind: 'monster', monsterId: 'moderator', hp: 50, maxHp: 50, mx: 5, my: 5, alive: true };
  f.fighters = [p, mon];
  let walks = 0, strikes = 0;
  const G = {
    tbfight: f,
    map: { px: 4, py: 4 },
    data: { monsters: [] },
    tbIsPlayerTurn: () => true,
    tbFighter: () => p,
    tbAfterPlayerAction: () => { p.moveLeft = 0; p.acted = true; },
    tbPlayerMove: (x, y) => { walks++; if (opts.move === 'walks' && p.mx > 0) p.mx -= 1; },
    tbBarrierExit: () => { return false; }, // sealed / no path: silent failure
    tbPlayerStrike: () => { strikes++; },
  };
  const ctx = {};
  return { G, f, p, ctx, walks: () => walks, strikes: () => strikes };
}
function nextTurn(m) { m.p.moveLeft = 3; m.p.acted = false; }
function env(on) {
  process.env.COMPETENT_DPS_RACE = '1';
  if (on) process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
  else delete process.env.COMPETENT_EXIT_VERIFIED_FLEE;
}

// 1. Gate ON, stuck walk: turns 1-2 flee (turn spent), turn 3 fights it out
{
  env(true);
  const m = mockGame({ move: 'stuck' });
  const r1 = competent.fight(m.G, m.ctx);
  ok('on/stuck t1: flee turn ends (true)', r1 === true, `r=${r1}`);
  ok('on/stuck t1: one zero-progress turn counted', (m.ctx._fleeStuck || {}).turns === 1,
    `turns=${(m.ctx._fleeStuck || {}).turns}`);
  ok('on/stuck t1: no strikes yet', m.strikes() === 0, `strikes=${m.strikes()}`);
  nextTurn(m);
  const r2 = competent.fight(m.G, m.ctx);
  ok('on/stuck t2: flee turn ends (true)', r2 === true, `r=${r2}`);
  ok('on/stuck t2: two zero-progress turns counted', (m.ctx._fleeStuck || {}).turns === 2,
    `turns=${(m.ctx._fleeStuck || {}).turns}`);
  nextTurn(m);
  const r3 = competent.fight(m.G, m.ctx);
  ok('on/stuck t3: fight marked unfleeable', m.ctx._fleeBlockedFor === 'fw',
    `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
  ok('on/stuck t3: fleeBlocked counted', m.ctx.fleeBlocked === 1, `fleeBlocked=${m.ctx.fleeBlocked}`);
  ok('on/stuck t3: policy fights it out (struck)', m.strikes() === 1, `strikes=${m.strikes()}`);
  ok('on/stuck t3: fight() played the turn (true)', r3 === true, `r=${r3}`);
  nextTurn(m);
  const r4 = competent.fight(m.G, m.ctx);
  ok('on/stuck t4: no fourth flee attempt, still striking', m.strikes() === 2 && m.ctx.fleeBlocked === 2,
    `strikes=${m.strikes()} fleeBlocked=${m.ctx.fleeBlocked} r=${r4}`);
}
// 2. Gate ON, legit walk (player moves toward the edge): never marked stuck
{
  env(true);
  const m = mockGame({ move: 'walks' });
  competent.fight(m.G, m.ctx); nextTurn(m);
  competent.fight(m.G, m.ctx); nextTurn(m);
  competent.fight(m.G, m.ctx);
  ok('on/walks: movement resets the stuck counter', ((m.ctx._fleeStuck || {}).turns || 0) === 0,
    `turns=${(m.ctx._fleeStuck || {}).turns}`);
  ok('on/walks: fight never marked unfleeable', m.ctx._fleeBlockedFor === undefined,
    `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
}
// 3. Gate OFF (default): legacy behavior byte-identical — the stuck loop
//    persists (no marking, no fighting), exactly the old measurement input
{
  env(false);
  const m = mockGame({ move: 'stuck' });
  for (let t = 0; t < 6; t++) { competent.fight(m.G, m.ctx); nextTurn(m); }
  ok('off/stuck: no unfleeable marking (legacy)', m.ctx._fleeBlockedFor === undefined,
    `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
  ok('off/stuck: no stuck tracking (legacy)', m.ctx._fleeStuck === undefined,
    `_fleeStuck=${JSON.stringify(m.ctx._fleeStuck)}`);
  ok('off/stuck: never strikes (legacy loop)', m.strikes() === 0, `strikes=${m.strikes()}`);
  ok('off/stuck: fleeBlocked untouched (legacy)', (m.ctx.fleeBlocked || 0) === 0,
    `fleeBlocked=${m.ctx.fleeBlocked}`);
}

delete process.env.COMPETENT_DPS_RACE;
delete process.env.COMPETENT_EXIT_VERIFIED_FLEE;
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
