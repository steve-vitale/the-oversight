// test-competent-flee-consumedpush-20261023.js — proof test for the r36
// port of the r16 consumed-push flee fix into the shared competent policy
// (scripts/policies/competent.js), env-gated behind
// COMPETENT_EXIT_VERIFIED_FLEE=1 (default off: legacy behavior byte-identical).
//
// BEFORE (shared driver, legacy path with COMPETENT_DPS_RACE=1):
// tbBarrierExit returns TRUE for pushes CONSUMED without exiting the fight
// (sealed barrier, world edge, stasis — game.js says so out loud). The policy
// counted every truthy return as a barrier push (ctx.barrierPushes += 1) and
// re-pushed every turn, spamming barrier say-lines into captures and
// inflating flee telemetry — the same class as the r16 seed-8904 4.58M-flee
// loop (that one lived in the journey driver's own flee; this one lives in
// the SHARED driver).
//
// AFTER (gate on): a push is counted only when it actually exits (fight over
// or map tile changed). A consumed push marks the fight unfleeable
// (ctx._fleeBlockedFor) so the next flee() returns false and fight() falls
// through to beast-trick play and strikes — a real player reads the barrier
// message once and fights it out.
//
// Mock cases (no game load): the flee closure is exercised through the real
// competent.fight(Game, ctx) with the player at 30% HP on a grid edge.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { competent } = require(path.join(ROOT, 'scripts', 'policies', 'competent.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Mock Game: player at 30% HP on the west edge (px=0), one dead monster
// (so fight() falls through cleanly when flee returns false), tbBarrierExit
// mock controlled by opts (consumed: true but no exit; exit: f.over = true).
function mockGame(opts) {
  const f = { id: 'fx', over: false, fighters: [] };
  const p = { key: 'p', kind: 'player', mx: 0, my: 4, hp: 30, maxHp: 100, moveLeft: 3, acted: false };
  const dead = { key: 'm_0', kind: 'monster', monsterId: 'belltoad', hp: 0, maxHp: 50, mx: 4, my: 4, alive: false };
  f.fighters = [p, dead];
  let pushes = 0;
  const G = {
    tbfight: f,
    map: { px: 4, py: 4 },
    data: { monsters: [] },
    tbIsPlayerTurn: () => true,
    tbFighter: () => p,
    tbAfterPlayerAction: () => { p.moveLeft = 0; p.acted = true; },
    tbBarrierExit: (dx, dy) => {
      pushes++;
      if (opts.exit) f.over = true;
      return true; // consumed pushes also return true (game.js is honest about it)
    },
  };
  const ctx = {};
  return { G, f, p, ctx, pushes: () => pushes };
}
function env(on) {
  process.env.COMPETENT_DPS_RACE = '1';
  if (on) process.env.COMPETENT_EXIT_VERIFIED_FLEE = '1';
  else delete process.env.COMPETENT_EXIT_VERIFIED_FLEE;
}

// 1. Gate ON, consumed push: not counted, fight marked unfleeable, turn ended
{
  env(true);
  const m = mockGame({ exit: false });
  const r = competent.fight(m.G, m.ctx);
  ok('on/consumed: fight() returns true (turn ended)', r === true, `r=${r}`);
  ok('on/consumed: barrierPushes NOT inflated', (m.ctx.barrierPushes || 0) === 0, `barrierPushes=${m.ctx.barrierPushes}`);
  ok('on/consumed: fight marked unfleeable', m.ctx._fleeBlockedFor === 'fx', `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
  ok('on/consumed: fleeBlocked counted', m.ctx.fleeBlocked === 1, `fleeBlocked=${m.ctx.fleeBlocked}`);
  ok('on/consumed: exactly one push attempt', m.pushes() === 1, `pushes=${m.pushes()}`);
}
// 2. Gate ON, re-flee on the blocked fight: NO second barrier push (no spam)
{
  env(true);
  const m = mockGame({ exit: false });
  competent.fight(m.G, m.ctx); // first: consumed, marked
  const pushes1 = m.pushes();
  m.p.moveLeft = 3; m.p.acted = false; // next turn
  competent.fight(m.G, m.ctx); // second: must fight it out, not re-push
  ok('on/reflee: no second barrier push', m.pushes() === pushes1, `pushes ${pushes1} -> ${m.pushes()}`);
  ok('on/reflee: fleeBlocked incremented', m.ctx.fleeBlocked === 2, `fleeBlocked=${m.ctx.fleeBlocked}`);
  ok('on/reflee: barrierPushes still 0', (m.ctx.barrierPushes || 0) === 0, `barrierPushes=${m.ctx.barrierPushes}`);
}
// 3. Gate ON, real exit: counted as one push, fight not marked blocked
{
  env(true);
  const m = mockGame({ exit: true });
  competent.fight(m.G, m.ctx);
  ok('on/exit: barrierPushes +1', m.ctx.barrierPushes === 1, `barrierPushes=${m.ctx.barrierPushes}`);
  ok('on/exit: fight not marked blocked', m.ctx._fleeBlockedFor === undefined, `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
}
// 4. Gate OFF (default): legacy behavior byte-identical — truthy push counted
//    even when consumed, no unfleeable marking
{
  env(false);
  const m = mockGame({ exit: false });
  competent.fight(m.G, m.ctx);
  ok('off/consumed: barrierPushes +1 (legacy)', m.ctx.barrierPushes === 1, `barrierPushes=${m.ctx.barrierPushes}`);
  ok('off/consumed: no unfleeable marking (legacy)', m.ctx._fleeBlockedFor === undefined, `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
  ok('off/consumed: fleeBlocked untouched (legacy)', (m.ctx.fleeBlocked || 0) === 0, `fleeBlocked=${m.ctx.fleeBlocked}`);
}
// 5. Gate OFF, real exit: same as gate-on exit (no regression either way)
{
  env(false);
  const m = mockGame({ exit: true });
  competent.fight(m.G, m.ctx);
  ok('off/exit: barrierPushes +1', m.ctx.barrierPushes === 1, `barrierPushes=${m.ctx.barrierPushes}`);
}
// 6. Gate ON, map-tile exit (f.over false, map moved): counted as a real exit
{
  env(true);
  const m = mockGame({ exit: false });
  m.G.tbBarrierExit = () => { m.G.map.px = 5; return true; };
  competent.fight(m.G, m.ctx);
  ok('on/mapmove: barrierPushes +1', m.ctx.barrierPushes === 1, `barrierPushes=${m.ctx.barrierPushes}`);
  ok('on/mapmove: fight not marked blocked', m.ctx._fleeBlockedFor === undefined);
}

delete process.env.COMPETENT_DPS_RACE;
delete process.env.COMPETENT_EXIT_VERIFIED_FLEE;
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
