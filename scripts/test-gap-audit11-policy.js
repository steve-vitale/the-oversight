#!/usr/bin/env node
// test-gap-audit11-policy.js — leg 1 (competent policy presses combat
// buttons) fixture proof.
// Claim: before this arm, competent.fight never called useAbility, so held
// combat abilities sat at 0 calls. After it, the policy presses a held
// combat button when its condition holds and the dinner test passes.
// Usage: node scripts/test-gap-audit11-policy.js
// Exit 0 on pass, 1 on any failed assertion.
'use strict';
const { loadGame, setupGame, driveFights } = require('./sim-harness');
const { competent } = require('./policies/competent');

function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) process.exitCode = 1;
}

(async () => {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  const s = Game.state.scholar;

  function startFight(monsterId, opts) {
    opts = opts || {};
    if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    Game.state.village.roster = [];
    const vpos = Game.state.village.positions || {};
    for (const k of Object.keys(vpos)) vpos[k] = { mx: 8, my: 8 };
    s.mx = 5; s.my = 4;
    if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
    s.abilities = (opts.abilities || []).map(id => ({ id, level: 1, xp: 0 }));
    s.kcal = (opts.kcal != null ? opts.kcal : 5000);
    s.health = 100;
    s.monster = { id: monsterId, mx: 6, my: 4 };
    Game.startCombat(monsterId);
    const mf = Game.tbfight && Game.tbfight.fighters.find(f => f.kind === 'monster');
    if (mf) { mf.mx = 6; mf.my = 4; }
    const pf = Game.tbFighter && Game.tbFighter('p');
    if (pf) {
      pf.mx = 5; pf.my = 4;
      if (opts.hpPct != null) pf.hp = Math.round((pf.maxHp || 100) * opts.hpPct);
    }
    if (opts.secondMonster && mf) {
      // Clone the monster fighter as a second live monster (turncoat case).
      const m2 = Object.assign({}, mf, { key: 'm_1', mx: 6, my: 5 });
      Game.tbfight.fighters.push(m2);
    }
    if (!Game.tbfight) throw new Error('no tbfight for ' + monsterId);
    const ctx = {};
    return { ctx, mf };
  }

  // A: healthy bulldozer, full combat kit -> bird strike on entry.
  {
    const { ctx } = startFight('bulldozer', { abilities: ['bird_strike', 'rage', 'pocket_sand', 'war_cry', 'turncoat'] });
    competent.fight(Game, ctx);
    check('A healthy bulldozer: bird strike pressed on entry',
      (ctx.abilityPresses || {}).bird_strike === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // B: healthy bulldozer, rage only -> rage pressed (winning + nontrivial).
  {
    const { ctx } = startFight('bulldozer', { abilities: ['rage'] });
    competent.fight(Game, ctx);
    check('B healthy bulldozer, rage only: rage pressed',
      (ctx.abilityPresses || {}).rage === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // C: losing (40% HP, above the 35% flee line), war_cry + pocket -> rally first.
  // NOTE: the policy's turn-1 walk-away (hpPct < 0.5 = outmatched) outranks
  // presses, so a fresh losing fight flees instead of pressing — that is
  // the existing walk-away, not a press failure. Losing presses fire once
  // the fight is committed, which the fixture simulates by marking the
  // fight as already assessed (ctx._fightObj = fight, i.e. turn 2+ / HP
  // lost mid-fight).
  {
    const { ctx } = startFight('bulldozer', { abilities: ['war_cry', 'pocket_sand'], hpPct: 0.40 });
    ctx._fightObj = Game.tbfight;
    competent.fight(Game, ctx);
    check('C losing at 40% HP (committed fight): war_cry pressed before controls',
      (ctx.abilityPresses || {}).war_cry === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // D: losing, pocket only -> pocket sand pressed.
  {
    const { ctx } = startFight('bulldozer', { abilities: ['pocket_sand'], hpPct: 0.40 });
    ctx._fightObj = Game.tbfight;
    competent.fight(Game, ctx);
    check('D losing at 40% HP (committed fight), pocket only: pocket_sand pressed',
      (ctx.abilityPresses || {}).pocket_sand === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // E: trivial fight (lone glasswing, 18-26 HP) -> no combat button pressed.
  // (A lone hummice is not a thing: it spawns as a 4-choir, which counts
  // as multi-monster and therefore non-trivial by design.)
  {
    const { ctx } = startFight('glasswing', { abilities: ['bird_strike', 'rage'] });
    competent.fight(Game, ctx);
    check('E lone glasswing (trivial): no combat button pressed',
      Object.keys(ctx.abilityPresses || {}).length === 0,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // F: dinner reserve — 250 kcal, bird costs 60, 250-60 < 200 -> no press.
  {
    const { ctx } = startFight('bulldozer', { abilities: ['bird_strike'], kcal: 250 });
    competent.fight(Game, ctx);
    check('F dinner reserve (250 kcal): bird NOT pressed',
      !(ctx.abilityPresses || {}).bird_strike,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // G: two live monsters -> turncoat splits the fight first.
  {
    const { ctx } = startFight('bulldozer', { abilities: ['turncoat', 'bird_strike'], secondMonster: true });
    competent.fight(Game, ctx);
    check('G two monsters: turncoat pressed first',
      (ctx.abilityPresses || {}).turncoat === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // H: full drive — bird exactly once per fight, fight progresses, no crash,
  // no stall. A bulldozer can honestly kill the scholar, so death counts
  // as a resolved fight, not a failure; what matters is the drive moves
  // (monster HP falls, or the fight/game ends) instead of spinning.
  {
    const { ctx, mf } = startFight('bulldozer', { abilities: ['bird_strike', 'rage'] });
    const initialMhp = mf ? mf.hp : 0;
    for (let i = 0; i < 40 && Game.tbfight && !Game.tbfight.over; i++) {
      try { driveFights(Game, competent, ctx); } catch (e) { check('H full drive: no throw', false, String(e && e.message)); break; }
      if (!Game.tbfight || Game.tbfight.over || Game.over) break;
      if (Game.tbIsPlayerTurn && !Game.tbIsPlayerTurn()) break;
    }
    const liveM = Game.tbfight ? Game.tbfight.fighters.find(f => f.kind === 'monster') : null;
    const progressed = !!Game.over || !Game.tbfight || Game.tbfight.over ||
      (liveM && (liveM.hp || 0) < initialMhp);
    check('H full drive: bird pressed exactly once per fight',
      (ctx.abilityPresses || {}).bird_strike === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
    check('H full drive: fight progressed or resolved (no stall)',
      progressed, 'initialMhp=' + initialMhp + ' liveMhp=' + (liveM ? liveM.hp : 'none') + ' gameOver=' + !!Game.over);
  }
  console.log(process.exitCode ? 'LEG1 FIXTURE: FAILED' : 'LEG1 FIXTURE: ALL PASS');
})().catch(e => { console.error('LEG1 FIXTURE FAIL', e && e.stack || e); process.exit(1); });
