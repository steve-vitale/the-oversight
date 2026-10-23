// test-flee-consumed-push-20261023.js — proof test for the r16 consumed-push
// flee fix (M4 blank: deepening harness flee-loop honesty).
//
// BEFORE (inline flee in journey-deepening-r15 + pre-fix r16): tbBarrierExit
// returns TRUE for consumed pushes that do NOT exit the fight (sealed
// barrier, world map edge, stasis field) — game.js says so out loud ("the
// barrier holds", "The known world ends here"). The old code counted every
// truthy return as a flee and re-pushed every turn. Seed 8904 measured
// 4,580,593 "flees" in one fight, nothing ever exited.
//
// AFTER (deepeningFlee): a flee is counted only when the push actually exits
// (fight over or map tile changed). A consumed push marks the fight
// unfleeable (ctx._fleeBlockedFor) so the bot fights it out instead of
// hammering the barrier forever.
//
// Unit cases (mocks, no game load):
//   1. sealed push (true, no exit) -> fled unchanged, blocked, note logged
//   2. real exit (true, f.over) -> fled +1
//   3. world-edge push (true, map unchanged) -> blocked, not counted
//   4. blocked fight re-flee -> push skipped entirely (no tbBarrierExit call)
//   5. not-on-edge (tbBarrierExit false) -> step logic, no crash
// Behavioral case (needs the harness): seed 8904 re-run asserts fled < 50
// and all 6 fights resolve — run separately, see the run note.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { deepeningFlee } = require(path.join(ROOT, 'scripts', 'journey-deepening-r16-20261023.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// mock builder: opts.tbExit = fn or boolean (what tbBarrierExit returns),
// opts.exit = whether the push exits the fight (sets f.over), opts.mapMoved.
function mockGame(opts) {
  const f = { id: 'fx', over: false, round: 5 };
  const G = {
    map: { px: 4, py: 4 },
    tbGridMax: () => 8,
    tbFighter: () => p,
    tbAfterPlayerAction: () => {},
    tbPlayerMove: (tx, ty) => { p.mx = tx; p.my = ty; },
    findPath: (ax, ay, bx, by) => [1],
  };
  const p = { mx: 8, my: 4, moveLeft: 3, acted: false }; // on the east edge
  let calls = 0;
  G.tbBarrierExit = function (dx, dy) {
    calls++;
    const r = typeof opts.tbExit === 'function' ? opts.tbExit(dx, dy) : opts.tbExit;
    if (r && opts.exit) f.over = true;
    if (r && opts.mapMoved) { G.map.px++; }
    return r;
  };
  const ctx = {};
  let ended = 0;
  const endTurn = () => { ended++; p.moveLeft = 0; p.acted = true; };
  return { G, f, p, ctx, endTurn, calls: () => calls, ended: () => ended };
}

// 1. sealed push: tbBarrierExit true, fight continues, map unchanged
{
  const m = mockGame({ tbExit: true, exit: false });
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('sealed: fled not counted', (m.ctx.fled || 0) === 0, `fled=${m.ctx.fled}`);
  ok('sealed: fight marked unfleeable', m.ctx._fleeBlockedFor === 'fx', `_fleeBlockedFor=${m.ctx._fleeBlockedFor}`);
  ok('sealed: note logged', (m.ctx.notes || []).some(n => /consumed-push/.test(n)));
  ok('sealed: turn ended', m.ended() === 1);
  ok('sealed: fleeBlocked counted', m.ctx.fleeBlocked === 1);
}
// 2. real exit: tbBarrierExit true, fight ends
{
  const m = mockGame({ tbExit: true, exit: true });
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('real-exit: fled +1', m.ctx.fled === 1, `fled=${m.ctx.fled}`);
  ok('real-exit: fight not marked blocked', m.ctx._fleeBlockedFor === undefined);
}
// 3. world edge: true, map unchanged, fight continues -> consumed
{
  const m = mockGame({ tbExit: true, exit: false });
  m.G.map.px = 8; // world edge east — push consumed, nothing moves
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('world-edge: fled not counted', (m.ctx.fled || 0) === 0);
  ok('world-edge: marked unfleeable', m.ctx._fleeBlockedFor === 'fx');
}
// 4. re-flee on a blocked fight: tbBarrierExit never called again
{
  const m = mockGame({ tbExit: true, exit: false });
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  const calls1 = m.calls();
  m.p.moveLeft = 3; m.p.acted = false;
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('blocked: push skipped on re-flee', m.calls() === calls1, `calls ${calls1} -> ${m.calls()}`);
}
// 5. not on edge (interior): no push attempt, step logic runs, no crash
{
  const m = mockGame({ tbExit: false, exit: false });
  m.p.mx = 4; m.p.my = 4; // interior
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('interior: no push calls', m.calls() === 0);
  ok('interior: player stepped', m.p.mx !== 4 || m.p.my !== 4, `p=${m.p.mx},${m.p.my}`);
  ok('interior: fled not counted', (m.ctx.fled || 0) === 0);
}
// 6. titan grid (12x12): edge at gmax, not hardcoded 8
{
  const m = mockGame({ tbExit: true, exit: true });
  m.G.tbGridMax = () => 11;
  m.p.mx = 11; m.p.my = 4;
  deepeningFlee(m.G, m.ctx, m.f, m.p, m.endTurn);
  ok('titan-grid: push attempted at gmax edge', m.calls() === 1, `calls=${m.calls()}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
