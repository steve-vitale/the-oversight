#!/usr/bin/env node
// test-abandonspeak-b.js — abandonment narration proof
// (sim-abandonspeak-b). Fake-Game cases driving installBudget with a
// stubbed guarded travelTo that mimics the guard's counter behavior
// (silent veto increments homewardstepSilentVetoes +
// homewardstepVetoes; spoken veto increments only homewardstepVetoes;
// pass moves the position). The fake Game.say captures every spoken
// line. No live game, no repo writes — stdout only.
// Exit 1 on any failure.
'use strict';
const { installBudget, VETOBUDGET_N, ABANDON_LINE, stepKey } = require('./policies/competent-vetobudget-b');

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function makeFake(script, opts) {
  opts = opts || {};
  const ctx = {};
  const said = [];
  const Game = {
    over: false,
    map: { px: 4, py: 4 },
    inCombat: () => !!opts.inCombat,
    travelToCalls: 0,
    say(line) { said.push(line); },
  };
  if (opts.sayThrows) Game.say = () => { throw new Error('say boom'); };
  if (opts.noSay) delete Game.say;
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
    Game.map.px = x; Game.map.py = y;
    return {};
  };
  return { Game, ctx, said };
}

// 1. The line exists, is the guard's voice (second person), and carries
// no programmer shorthand: no veto/budget/abandon/step/coordinate/count words.
check('ABANDON_LINE exported and non-empty', typeof ABANDON_LINE === 'string' && ABANDON_LINE.length > 20, ABANDON_LINE);
check('line is second-person narration voice', /^You /.test(ABANDON_LINE), ABANDON_LINE);
check('line has no programmer shorthand', !/veto|budget|abandon|step|\(\d,\d\)|\d,\d->\d,\d|\bN\b|silent|suppress/i.test(ABANDON_LINE), ABANDON_LINE);
check('VETOBUDGET_N still 3 (unchanged)', VETOBUDGET_N === 3, VETOBUDGET_N);

// 2. Exactly one line at the abandonment moment; none before, none after.
{
  const { Game, ctx, said } = makeFake({ '4,4->4,1': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1);
  check('no line before the Nth silent veto', said.length === 0, said);
  Game.travelTo(4, 1); // 3rd silent = abandonment
  check('exactly one line at abandonment', said.length === 1 && said[0] === ABANDON_LINE, said);
  Game.travelTo(4, 1); Game.travelTo(4, 1); // suppressions
  check('suppressed attempts stay silent (still exactly one line)', said.length === 1, said);
  check('abandonment still counted once', ctx.vetobudgetAbandonments === 1, ctx.vetobudgetAbandonments);
}

// 3. Spoken vetoes never speak the abandonment line; the 1-spoken +
// 3-silent shape speaks exactly once, at the 3rd silent.
{
  const script = {};
  const { Game, ctx, said } = makeFake(script);
  installBudget(Game, ctx);
  script['4,4->4,1'] = 'spoken';
  Game.travelTo(4, 1);
  script['4,4->4,1'] = 'silent';
  Game.travelTo(4, 1); Game.travelTo(4, 1);
  check('spoken + 2 silent: no abandonment line yet', said.length === 0, said);
  Game.travelTo(4, 1); // 3rd silent
  check('spoken + 3 silent: exactly one abandonment line', said.length === 1 && said[0] === ABANDON_LINE && ctx.vetobudgetAbandonments === 1, said);
}

// 4. Each abandoned step speaks once (independent budgets, independent lines).
{
  const { Game, ctx, said } = makeFake({ '4,4->4,1': 'silent', '4,4->5,4': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1); Game.travelTo(4, 1);
  Game.travelTo(5, 4); Game.travelTo(5, 4); Game.travelTo(5, 4);
  check('two abandonments speak exactly twice', said.length === 2 && said.every((l) => l === ABANDON_LINE) && ctx.vetobudgetAbandonments === 2, said);
}

// 5. Passing hops and passthrough calls never speak.
{
  const { Game, ctx, said } = makeFake({ '4,4->4,1': 'silent' });
  installBudget(Game, ctx);
  Game.travelTo(4, 1); Game.travelTo(4, 1); Game.travelTo(4, 1); // abandoned, 1 line
  Game.travelTo(4, 1, true); // force
  Game.travelTo(4, 1, false, true); // combatExit
  Game.travelTo(4, 4); // self-call
  check('force/combatExit/self calls add no line', said.length === 1, said);
  const { Game: G2, said: said2 } = makeFake({ '4,4->4,1': 'pass' });
  installBudget(G2, {});
  G2.travelTo(4, 1);
  check('passing hop speaks nothing', said2.length === 0, said2);
}

// 6. Narration failure never breaks travel; a missing say is a safe no-op.
{
  const { Game, ctx } = makeFake({ '4,4->4,1': 'silent' }, { sayThrows: true });
  installBudget(Game, ctx);
  let r = null;
  try { Game.travelTo(4, 1); Game.travelTo(4, 1); r = Game.travelTo(4, 1); } catch (e) { r = { threw: true }; }
  check('say throwing still abandons and returns the veto block', r && r.vetoed === true && ctx.vetobudgetAbandonments === 1, { r, abandonments: ctx.vetobudgetAbandonments });
  const { Game: G2, ctx: C2 } = makeFake({ '4,4->4,1': 'silent' }, { noSay: true });
  installBudget(G2, C2);
  let r2 = null;
  try { G2.travelTo(4, 1); G2.travelTo(4, 1); r2 = G2.travelTo(4, 1); } catch (e) { r2 = { threw: true }; }
  check('missing say still abandons and returns the veto block', r2 && r2.vetoed === true && C2.vetobudgetAbandonments === 1, { r2, abandonments: C2.vetobudgetAbandonments });
}

console.log('abandonspeak proof: ' + (checks - fails) + '/' + checks + ' checks pass');
process.exit(fails ? 1 : 0);
