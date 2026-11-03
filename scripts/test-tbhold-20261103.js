#!/usr/bin/env node
// test-tbhold-20261103.js — proof for the TB-HOLD variant (arm
// sim-tbpolicy-a). ARCHIVED 2026-11-03: the variant was KILLED by its
// own prereg (kills/TB 0.2424 vs GO bar 0.50) and its policy module
// (scripts/policies/tbhold.js) was deleted before the final commit, so
// this test can no longer run — it fails at require time on the missing
// module. It passed 10/10 before the judged leg and on re-run after all
// driver edits; it is kept as the proof record, not as a live test.
// Proves on fixtures + a live-harness drive + analyzer
// math, BEFORE the judged variant leg:
//  (1) on a fresh wave-4 fight the variant takes a fighting turn, never a
//      flee turn (ctx.fled stays 0, a strike or close happens);
//  (2) below the 35% eject line the variant still never flees;
//  (3) on non-wave-4 fights the variant delegates to competent verbatim
//      (losing committed fight presses war_cry; fresh losing fight walks
//      away — the competent flee, preserved outside wave-4);
//  (4) a full driveFights drive of a wave-4 fight progresses (monster HP
//      falls) with ctx.fled == 0 throughout;
//  (5) the variant delegates every non-fight method by reference;
//  (6) the analyzer computes kills/TB + median HP dealt as preregistered
//      on synthetic per-seed JSON.
// Usage: node scripts/test-tbhold-20261103.js
// Exit 0 on pass, 1 on any failed assertion.
'use strict';
const { loadGame, setupGame, driveFights } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { tbhold } = require('./policies/tbhold');
const { summarizeSeed } = require('./tbpolicy-analyze-20261103');

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
    s.abilities = (opts.abilities || []).map(function (id) { return { id: id, level: 1, xp: 0 }; });
    s.kcal = (opts.kcal != null ? opts.kcal : 5000);
    s.health = 100;
    s.monster = { id: monsterId, mx: 6, my: 4 };
    Game.startCombat(monsterId);
    const mf = Game.tbfight && Game.tbfight.fighters.find(function (f) { return f.kind === 'monster'; });
    if (mf) { mf.mx = 6; mf.my = 4; }
    const pf = Game.tbFighter && Game.tbFighter('p');
    if (pf) {
      pf.mx = 5; pf.my = 4;
      if (opts.hpPct != null) pf.hp = Math.round((pf.maxHp || 100) * opts.hpPct);
    }
    if (!Game.tbfight) throw new Error('no tbfight for ' + monsterId);
    return { ctx: {}, mf: mf };
  }

  // A: fresh wave-4 fight, full HP, no abilities -> fighting turn, no flee.
  {
    const { ctx } = startFight('audit', {});
    tbhold.fight(Game, ctx);
    check('A fresh wave-4 audit, full HP: no flee turn',
      (ctx.fled || 0) === 0 && (ctx.fledBad || 0) === 0,
      'fled=' + (ctx.fled || 0) + ' fledBad=' + (ctx.fledBad || 0));
    check('A fresh wave-4 audit, full HP: a fighting turn was taken',
      ((ctx.struck || 0) + (ctx.closed || 0)) >= 1,
      'struck=' + (ctx.struck || 0) + ' closed=' + (ctx.closed || 0));
  }
  // B: wave-4 fight below the 35% eject line -> still no flee.
  {
    const { ctx } = startFight('audit', { hpPct: 0.20 });
    tbhold.fight(Game, ctx);
    check('B wave-4 audit at 20% HP (below eject line): no flee turn',
      (ctx.fled || 0) === 0,
      'fled=' + (ctx.fled || 0) + ' struck=' + (ctx.struck || 0) + ' closed=' + (ctx.closed || 0));
  }
  // C: non-wave-4 losing committed fight delegates (war_cry pressed).
  {
    const { ctx } = startFight('bulldozer', { abilities: ['war_cry', 'pocket_sand'], hpPct: 0.40 });
    ctx._fightObj = Game.tbfight;
    tbhold.fight(Game, ctx);
    check('C non-wave-4 losing committed fight delegates: war_cry pressed',
      (ctx.abilityPresses || {}).war_cry === 1,
      'presses=' + JSON.stringify(ctx.abilityPresses || {}));
  }
  // D: non-wave-4 fresh losing fight delegates (competent walk-away kept).
  {
    const { ctx } = startFight('bulldozer', { hpPct: 0.40 });
    tbhold.fight(Game, ctx);
    check('D non-wave-4 fresh losing fight delegates: walk-away preserved',
      (ctx.fledBad || 0) >= 1 || (ctx.fled || 0) >= 1,
      'fledBad=' + (ctx.fledBad || 0) + ' fled=' + (ctx.fled || 0));
  }
  // E: full drive of a wave-4 fight: progresses, never flees.
  {
    const { ctx, mf } = startFight('audit', {});
    const initialMhp = mf ? mf.hp : 0;
    for (let i = 0; i < 60 && Game.tbfight && !Game.tbfight.over; i++) {
      try { driveFights(Game, tbhold, ctx); } catch (e) { check('E full drive: no throw', false, String(e && e.message)); break; }
      if (!Game.tbfight || Game.tbfight.over || Game.over) break;
      if (Game.tbIsPlayerTurn && !Game.tbIsPlayerTurn()) break;
    }
    const liveM = Game.tbfight ? Game.tbfight.fighters.find(function (f) { return f.kind === 'monster'; }) : null;
    const progressed = !!Game.over || !Game.tbfight || Game.tbfight.over ||
      (liveM && (liveM.hp || 0) < initialMhp);
    check('E full wave-4 drive: fight progressed or resolved (no stall)',
      progressed, 'initialMhp=' + initialMhp + ' liveMhp=' + (liveM ? liveM.hp : 'none') + ' gameOver=' + !!Game.over);
    check('E full wave-4 drive: zero flee turns across the whole drive',
      (ctx.fled || 0) === 0 && (ctx.fledBad || 0) === 0,
      'fled=' + (ctx.fled || 0) + ' fledBad=' + (ctx.fledBad || 0) + ' struck=' + (ctx.struck || 0));
  }
  // F: non-fight methods delegate by reference.
  {
    const keys = Object.keys(competent).filter(function (k) { return k !== 'fight' && k !== 'id'; });
    const bad = keys.filter(function (k) { return tbhold[k] !== competent[k]; });
    check('F non-fight methods delegate by reference',
      bad.length === 0, 'checked=' + keys.length + ' mismatched=' + JSON.stringify(bad));
  }
  // G: analyzer math on synthetic per-seed JSON.
  {
    const synth = {
      seed: 1, days: 100, endReason: 'village-lost', identity: 'MATCH',
      spawnsW4: 2, fieldsW4: 0,
      tbDerived: [
        { seq: 1, day: 10, mid: 'audit', partySizeStart: 1, result: 'won', kills: 1, hpDealtPct: 100, playerTurns: 8, barrierPushes: 0 },
        { seq: 2, day: 20, mid: 'suburb', partySizeStart: 1, result: 'lost', kills: 0, hpDealtPct: 20, playerTurns: 6, barrierPushes: 0 },
      ],
      barrierPushesW4: 0, instrumentErrors: [],
    };
    const sum = summarizeSeed(synth);
    check('G analyzer: kills per TB exposure = 0.5 on synthetic 1-kill/2-fight seed',
      sum.killsPerTbExposure === 0.5, 'got=' + sum.killsPerTbExposure);
    check('G analyzer: median HP dealt = 60 on synthetic fights (100, 20)',
      sum.medianHpDealtPct === 60, 'got=' + sum.medianHpDealtPct);
    check('G analyzer: flee share = 0 on synthetic fights',
      sum.fleeShare === 0, 'got=' + sum.fleeShare);
  }
  console.log(process.exitCode ? 'TBHOLD PROOF: FAILED' : 'TBHOLD PROOF: ALL PASS');
})().catch(function (e) { console.error('TBHOLD PROOF FAIL', (e && e.stack) || e); process.exit(1); });
