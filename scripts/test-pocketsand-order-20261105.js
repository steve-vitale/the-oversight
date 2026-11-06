#!/usr/bin/env node
// scripts/test-pocketsand-order-20261105.js — proof tests for the
// pocket_sand flee-order fix (build-smallfixes, 2026-11-05).
//
// The bug (trickcensus, Nov 4): the competent policy's fight order ran the
// mid-fight flee check (HP < 35% -> retreat) BEFORE abilityPressPlay, so a
// held pocket_sand — whose losing window is HP < 50% — never fired: a
// fighter jumping 58.5% -> 31.5% in one round went straight past the window
// and the losing turn went to a flee move.
//
// The fix (scripts/policies/competent.js): a losing-control attempt
// (abilityPressPlay with {onlyLosing:true}) runs immediately BEFORE the 35%
// eject, and pocket_sand is once per fight (mirror of bird_strike's gate).
//
// Fixtures (synthetic TB fights, seeded, deterministic). RED on baseline:
// with the pre-eject attempt removed, case A flees and presses nothing
// (verified by running against master:scripts/policies/competent.js —
// see evidence/2026-11-05/smallfixes-pocketsand.md).
// Usage: node scripts/test-pocketsand-order-20261105.js
'use strict';
const L = require('./godpath/lib.js');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

function setHp(Game, pct) {
  const p = Game.tbFighter('p');
  if (!p) throw new Error('no player fighter');
  p.hp = Math.round((p.maxHp || 100) * pct);
  try { if (Game.state && Game.state.scholar) Game.state.scholar.health = p.hp; } catch (e) {}
  p.acted = false;
  p.moveLeft = 9;
  return p;
}

// Start a fight at full HP and play turn 1 through the policy, so the
// fight is mid-flight (ctx._fightObj set, round-1 assessment done) before
// the losing turn under test. Returns the policy ctx.
async function openFight(Game) {
  L.fight(Game, 'gallowdeer', { hp: 100 });
  if (!Game.tbIsPlayerTurn()) throw new Error('not player turn after startCombat');
  const ctx = {};
  competent.fight(Game, ctx);
  if (!Game.tbfight || Game.tbfight.over) throw new Error('fight ended on turn 1');
  if (!Game.tbIsPlayerTurn()) throw new Error('not player turn after turn 1');
  return ctx;
}

async function main() {
  // ---- A: sand fires in the 35-50% window instead of fleeing ----
  {
    const Game = await L.load({ seed: 99421 });
    L.newRun(Game, 'Columbus, Ohio');
    L.openSlots(Game, 6);
    L.giveAbility(Game, 'pocket_sand', { force: true });
    Game.state.scholar.kcal = 5000;
    const ctx = await openFight(Game);
    setHp(Game, 0.31); // 31%: below the 35% eject line, inside sand's losing
    // window (<50%) — the exact 99103 jump shape (58.5% -> 31.5%). On
    // baseline this turn flees before any press; armed, sand fires first.
    competent.fight(Game, ctx);
    check('A: pocket_sand pressed once in the pre-empted zone (HP < 35%)',
      (ctx.abilityPresses || {}).pocket_sand === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
    check('A: no flee attempted on the sand turn',
      !(ctx.fled || 0), 'fled=' + (ctx.fled || 0));
    check('A: fight still ongoing after the sand turn',
      !!(Game.tbfight && !Game.tbfight.over));
    // ---- A2: the once-per-fight gate holds on a later losing turn ----
    setHp(Game, 0.35);
    if (Game.tbIsPlayerTurn()) competent.fight(Game, ctx);
    check('A2: pocket_sand NOT pressed a second time in the same fight',
      (ctx.abilityPresses || {}).pocket_sand === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  }

  // ---- B: without the ability, flee still fires at <35% ----
  {
    const Game = await L.load({ seed: 99422 });
    L.newRun(Game, 'Columbus, Ohio');
    Game.state.scholar.kcal = 5000;
    const ctx = await openFight(Game);
    setHp(Game, 0.30); // 30%: below the flee line, no losing ability held
    competent.fight(Game, ctx);
    check('B: flee fires at <35% with no losing ability held',
      (ctx.fled || 0) >= 1, 'fled=' + (ctx.fled || 0));
    check('B: nothing pressed', !ctx.abilityPresses || Object.keys(ctx.abilityPresses).length === 0);
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  }

  // ---- D: winning (HP >= 50%) — the pre-check presses nothing ----
  {
    const Game = await L.load({ seed: 99423 });
    L.newRun(Game, 'Columbus, Ohio');
    L.openSlots(Game, 6);
    L.giveAbility(Game, 'pocket_sand', { force: true });
    Game.state.scholar.kcal = 5000;
    const ctx = await openFight(Game);
    setHp(Game, 0.90); // 90%: winning — sand's losing window is closed
    competent.fight(Game, ctx);
    check('D: no sand press while winning (HP >= 50%)',
      !(ctx.abilityPresses || {}).pocket_sand, 'presses=' + JSON.stringify(ctx.abilityPresses || {}));
    check('D: no flee while winning', !(ctx.fled || 0));
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  }

  // ---- E: sand spent already — flee fires at <35% ----
  {
    const Game = await L.load({ seed: 99424 });
    L.newRun(Game, 'Columbus, Ohio');
    L.openSlots(Game, 6);
    L.giveAbility(Game, 'pocket_sand', { force: true });
    Game.state.scholar.kcal = 5000;
    const ctx = await openFight(Game);
    setHp(Game, 0.40);
    competent.fight(Game, ctx); // presses sand (case A shape)
    check('E: setup — sand pressed on the first losing turn',
      (ctx.abilityPresses || {}).pocket_sand === 1);
    setHp(Game, 0.30); // now below the flee line, sand already spent
    if (Game.tbIsPlayerTurn()) competent.fight(Game, ctx);
    check('E: flee fires at <35% once sand is spent',
      (ctx.fled || 0) >= 1, 'fled=' + (ctx.fled || 0));
    check('E: sand still pressed only once',
      (ctx.abilityPresses || {}).pocket_sand === 1);
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  }

  // ---- F: freeze_tag fallback — sand absent, freeze held, window fires ----
  {
    const Game = await L.load({ seed: 99425 });
    L.newRun(Game, 'Columbus, Ohio');
    L.openSlots(Game, 6);
    L.giveAbility(Game, 'freeze_tag', { force: true });
    Game.state.scholar.kcal = 5000;
    const ctx = await openFight(Game);
    setHp(Game, 0.40);
    competent.fight(Game, ctx);
    check('F: freeze_tag pressed in the window when sand is absent',
      (ctx.abilityPresses || {}).freeze_tag === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
    check('F: no flee attempted on the freeze turn', !(ctx.fled || 0));
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  }

  console.log(`\nPOCKETSAND-ORDER PROOF: ${pass} pass, ${fail} fail`);
  if (fail) { console.error('PROOF FAILED'); process.exit(1); }
  console.log('PROOF GREEN');
}

main().catch(e => { console.error('POCKETSAND FATAL:', e && e.stack || e); process.exit(1); });
