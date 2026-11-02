#!/usr/bin/env node
// test-vetobudget-b.js — veto-budget wrapper proof (sim-vetobudget-b).
// Census (prereg, proof not judged evidence): synthetic fake-Game cases
// driving installBudget with a stubbed guarded travelTo that mimics the
// guard's counter behavior (silent veto increments
// homewardstepSilentVetoes + homewardstepVetoes; spoken veto increments
// only homewardstepVetoes; pass moves the position). No live game, no
// repo writes — stdout only. Exit 1 on any failure.
'use strict';
const { installBudget, VETOBUDGET_N, stepKey } = require('./policies/competent-vetobudget-b');

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// Fake Game with a scripted guarded travelTo. script maps stepKey ->
// 'silent' | 'spoken' | 'pass' | 'veto-shaped-no-count' (returns a veto
// block WITHOUT touching counters — proves the wrapper counts from
// guard counters, never from return shape).
function makeFake(script, opts) {
  opts = opts || {};
  const ctx = {};
  const Game = {
    over: false,
    map: { px: 4, py: 4 },
    inCombat: () => !!opts.inCombat,
    travelToCalls: 0,
  };
  Game.travelTo = function (x, y, force, combatExit) {
    Game.travelToCalls++;
    const key = stepKey(Game.map.px, Game.map.py, x, y);
    const action = script[key] || 'pass';
    if (action === 'silent') {
      ctx.homewardstepSilentVetoes = (ctx.homewardstepSilentVetoes || 0) + 1;
      ctx.homewardstepVetoes = (ctx.homewardstepVetoes || 0) + 1;
      return { blockType: 'homewardstep', vetoed: true };
    }
    if (action === 'spoken') {
      ctx.homewardstepVetoes = (ctx.homewardstepVetoes || 0) + 1;
      return { blockType: 'homewardstep', vetoed: true };
    }
    if (action === 'veto-shaped-no-count') return { blockType: 'homewardstep', vetoed: true };
    Game.map.px = x; Game.map.py = y;
    return {};
  };
  return { Game, ctx };
}

// 1. N is preregged at 3.
check('VETOBUDGET_N === 3', VETOBUDGET_N === 3, VETOBUDGET_N);

// 2. Spoken vetoes do NOT count toward N: 5 spoken vetoes, no abandonment.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'spoken' });
  const restore = installBudget(Game, ctx);
  for (let i = 0; i < 5; i++) Game.travelTo(4, 1);
  check('spoken vetoes never counted (no abandonment after 5)', (ctx.vetobudgetAbandonments || 0) === 0 && !(ctx.vetobudgetAbandoned && ctx.vetobudgetAbandoned.size), { abandonments: ctx.vetobudgetAbandonments, abandoned: ctx.vetobudgetAbandoned && [...ctx.vetobudgetAbandoned] });
  check('spoken vetoes still reach the guard every time', Game.travelToCalls === 5, Game.travelToCalls);
  check('spoken vetoes produce zero suppressions', (ctx.vetobudgetSuppressions || 0) === 0, ctx.vetobudgetSuppressions);
  restore();
  check('restore returns travelTo to the guarded stub', Game.travelToCalls === 5, Game.travelToCalls);
}

// 3. Silent vetoes accumulate; the Nth triggers abandonment; later
// attempts are suppressed with the guard never called again.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1);
  check('2 silent vetoes: not yet abandoned', !(ctx.vetobudgetAbandoned && ctx.vetobudgetAbandoned.has('4,4->4,1')), ctx.vetobudgetAbandoned && [...ctx.vetobudgetAbandoned]);
  Game.travelTo(4, 1); // 3rd silent = Nth
  check('3rd silent veto abandons the step', ctx.vetobudgetAbandoned && ctx.vetobudgetAbandoned.has('4,4->4,1') && ctx.vetobudgetAbandonments === 1, { abandoned: ctx.vetobudgetAbandoned && [...ctx.vetobudgetAbandoned], abandonments: ctx.vetobudgetAbandonments });
  const callsAtAbandon = Game.travelToCalls;
  const r1 = Game.travelTo(4, 1), r2 = Game.travelTo(4, 1);
  check('post-abandonment attempts never reach the guard', Game.travelToCalls === callsAtAbandon, { before: callsAtAbandon, after: Game.travelToCalls });
  check('post-abandonment attempts return the veto block', r1 && r1.vetoed === true && r1.blockType === 'homewardstep' && r2 && r2.vetoed === true, { r1, r2 });
  check('post-abandonment attempts counted as suppressions', ctx.vetobudgetSuppressions === 2, ctx.vetobudgetSuppressions);
  check('scholar never moved on suppressed attempts', Game.map.px === 4 && Game.map.py === 4, Game.map);
}

// 4. Different step keys carry independent budgets.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'silent', '4,4->5,4': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1); Game.travelTo(4, 1); // abandon (4,4)->(4,1)
  Game.travelTo(5, 4); Game.travelTo(5, 4); // 2 silent on the other step (scholar never moved: still at 4,4)
  check('other step not abandoned at 2 silent vetoes', !(ctx.vetobudgetAbandoned.has('4,4->5,4')), [...ctx.vetobudgetAbandoned]);
  const callsBefore = Game.travelToCalls;
  Game.travelTo(5, 4); // 3rd silent on the other step -> reaches guard, then abandons
  check('other step reaches the guard for its 3rd silent veto', Game.travelToCalls === callsBefore + 1, { before: callsBefore, after: Game.travelToCalls });
  check('other step abandoned after its own 3rd silent veto', ctx.vetobudgetAbandoned.has('4,4->5,4') && ctx.vetobudgetAbandonments === 2, [...ctx.vetobudgetAbandoned]);
}

// 5. Force, combatExit, self-calls, and in-combat calls are never suppressed.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1); Game.travelTo(4, 1); // abandoned
  const callsAtAbandon = Game.travelToCalls;
  Game.travelTo(4, 1, true); // force
  Game.travelTo(4, 1, false, true); // combatExit
  Game.travelTo(4, 4); // self-call
  check('force/combatExit/self calls reach the guard despite abandonment', Game.travelToCalls === callsAtAbandon + 3, { before: callsAtAbandon, after: Game.travelToCalls });
  check('force/combatExit/self calls add no suppressions', ctx.vetobudgetSuppressions === 0, ctx.vetobudgetSuppressions);
  // Abandon a step first under non-combat, then verify combat passes through
  // (use a fresh Game with inCombat false to abandon, then flip the flag):
  const { Game: G3, ctx: C3 } = makeFake({ '4,4->4,1': 'silent' });
  installBudget(G3, C3);
  G3.travelTo(4, 1); G3.travelTo(4, 1); G3.travelTo(4, 1);
  const c3Before = G3.travelToCalls;
  G3.inCombat = () => true;
  G3.travelTo(4, 1);
  check('in-combat call reaches the guard despite abandonment', G3.travelToCalls === c3Before + 1, { before: c3Before, after: G3.travelToCalls });
}

// 6. Non-vetoed hops pass through untouched.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'pass' });
  installBudget(Game, ctx);
  const r = Game.travelTo(4, 1);
  check('passing hop moves the scholar', Game.map.px === 4 && Game.map.py === 1, Game.map);
  check('passing hop returns the guard result', r && !r.vetoed, r);
  check('passing hop counts nothing', (ctx.vetobudgetSuppressions || 0) === 0 && (ctx.vetobudgetAbandonments || 0) === 0, ctx);
}

// 7. Return-shape vetoes without counter movement are NOT counted.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'veto-shaped-no-count' });
  installBudget(Game, ctx);
  for (let i = 0; i < 5; i++) Game.travelTo(4, 1);
  check('veto-shaped blocks without counter delta never abandon', !(ctx.vetobudgetAbandoned && ctx.vetobudgetAbandoned.size), ctx.vetobudgetAbandoned && [...ctx.vetobudgetAbandoned]);
  check('veto-shaped blocks without counter delta reach the guard every time', Game.travelToCalls === 5, Game.travelToCalls);
}

// 8. Spoken-then-silent mix mirrors the 62808 shape: 1 spoken + 3
// silent = 4 guard vetoes, then suppression.
{
  const script = {};
  const { Game, ctx } = makeFake(script);
  installBudget(Game, ctx);
  // Drive the script by mutating it between calls (spoken first, then silent).
  script['4,4->4,1'] = 'spoken';
  Game.travelTo(4, 1);
  script['4,4->4,1'] = 'silent';
  Game.travelTo(4, 1); Game.travelTo(4, 1); Game.travelTo(4, 1);
  check('1 spoken + 3 silent abandons (guard vetoes = 4)', ctx.vetobudgetAbandoned.has('4,4->4,1') && ctx.homewardstepVetoes === 4 && ctx.homewardstepSilentVetoes === 3,
    { vetoes: ctx.homewardstepVetoes, silent: ctx.homewardstepSilentVetoes });
  const callsBefore = Game.travelToCalls;
  Game.travelTo(4, 1);
  check('5th attempt suppressed, guard not called', Game.travelToCalls === callsBefore && ctx.vetobudgetSuppressions === 1,
    { callsBefore, callsAfter: Game.travelToCalls, suppressions: ctx.vetobudgetSuppressions });
}

// 9. Wrapper error before the guarded call falls back to exactly one
// guarded call (no double execution, no swallowed travel).
{
  const ctx = {};
  let guardCalls = 0;
  const Game = {
    over: false,
    travelTo(x, y) { guardCalls++; return { ok: true }; },
  };
  Object.defineProperty(Game, 'map', { get() { throw new Error('map boom'); } });
  installBudget(Game, ctx);
  const r = Game.travelTo(4, 1);
  check('map-read error falls back to exactly one guarded call', guardCalls === 1 && r && r.ok === true, { guardCalls, r });
}

// 10. installBudget with no ctx or no travelTo is a safe no-op.
{
  const G = { travelTo(x, y) { return { ok: true }; } };
  const restore = installBudget(G, null);
  check('no-ctx install leaves travelTo untouched', G.travelTo(1, 1).ok === true, null);
  restore();
  const G2 = {};
  const restore2 = installBudget(G2, {});
  check('no-travelTo install is a safe no-op', typeof restore2 === 'function', null);
  restore2();
}

console.log('vetobudget proof: ' + (checks - fails) + '/' + checks + ' checks pass');
process.exit(fails ? 1 : 0);
