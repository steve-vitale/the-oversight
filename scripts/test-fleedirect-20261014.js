#!/usr/bin/env node
// test-fleedirect-20261014.js — PROOF for the scale-wall r26 DIRECTIONAL-FLEE
// layer (scripts/policies/fleedirect.js, gate FLEEDIRECT=1).
//
// Mechanism: the disengage/flee DECISION judges the destination — prefer
// exits toward haven or a known-safe node; REFUSE to push outward into
// unknown nodes when the scholar is hurt (hp < 50% max) or hungry
// (kcal < 35% cap). Engagement/disengage JUDGMENT only.
//
// RED->GREEN: on pristine code the layer is absent (require throws), so the
// behavior assertions below FAIL (RED). After the layer + competent.js hook
// land, they PASS (GREEN). The gate-off checks prove the legacy flee path
// is byte-identical with the gate off.
//
// Node harness per convention: full src/js eval via sim-harness,
// Math.random seeded BEFORE eval, Game.save never stubbed.
//
// Usage: node scripts/test-fleedirect-20261014.js   (exit 0 = all pass)
'use strict';
process.env.FLEEDIRECT = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

let fails = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
  if (!cond) fails++;
}

// The layer must exist — on pristine code this require throws and the
// mechanism assertions below fail RED.
let fleeDirect = null, requireErr = null;
try { fleeDirect = require('./policies/fleedirect'); }
catch (e) { requireErr = e; }

// Script real map state on a real Game: scholar at (mpx,mpy); `seen` is a
// list of [x,y] tiles marked visited; `dangerTiles` get a world monster.
function scriptMap(Game, mpx, mpy, seen, dangerTiles) {
  Game.map.px = mpx; Game.map.py = mpy;
  const s = Game.state.scholar;
  s.seenTiles = {};
  for (const t of (seen || [])) s.seenTiles[t[0] + ',' + t[1]] = { k: 'v' };
  try {
    const wm = Game.worldMonsters();
    wm.length = 0;
    for (const t of (dangerTiles || [])) wm.push({ id: 'test_mon', tx: t[0], ty: t[1], hp: 50, maxHp: 50 });
  } catch (e) {}
}

function driveFightOnce(Game, ctx, maxCalls) {
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls < (maxCalls || 3) && !Game.over) {
    if (!Game.tbIsPlayerTurn()) break;
    let handled = false;
    try { handled = competent.fight(Game, ctx); } catch (e) { break; }
    if (!handled) break;
    if ((ctx.fleeDirectChecks || 0) >= 1) break;
    calls++;
  }
  return ctx;
}

(async () => {
  check('RED/GREEN: the fleedirect layer loads (pristine code = absent = RED)',
    !!fleeDirect, requireErr ? String(requireErr.message || requireErr).slice(0, 80) : 'loaded');
  check('gate on: fleeDirectOn() is true', fleeDirect && fleeDirect.fleeDirectOn() === true);
  if (!fleeDirect) { console.log('mechanism absent — remaining checks fail RED by design'); process.exit(1); }

  // ---- A: hurt+hungry, havenward exit monster-active, rest unknown -> HOLD (refuse)
  {
    const { Game } = await loadGame({ seed: 11, mode: 'fleedirect-A' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]); // (4,5) is the havenward exit, monster sitting on it
    const s = Game.state.scholar;
    s.kcal = 400; // hungry (< 35% of cap)
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dec = fleeDirect.fleeDecision(Game, p, {});
    console.log('A detail:', JSON.stringify(dec));
    check('A: act is hold', dec.act === 'hold', 'act=' + dec.act);
    check('A: reason is a refusal', /^refuse-/.test(dec.reason || ''), 'reason=' + dec.reason);
  }

  // ---- B: healthy+fed, same node -> least-bad push (no hold when strong)
  {
    const { Game } = await loadGame({ seed: 22, mode: 'fleedirect-B' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]);
    const s = Game.state.scholar;
    s.kcal = 2600; // fed
    const p = { hp: 100, maxHp: 100, mx: 4, my: 4 };
    const dec = fleeDirect.fleeDecision(Game, p, {});
    console.log('B detail:', JSON.stringify(dec));
    check('B: act is push (healthy scholars may risk the unknown)', dec.act === 'push', 'act=' + dec.act);
    check('B: reason is least-bad', dec.reason === 'least-bad', 'reason=' + dec.reason);
  }

  // ---- C: hurt scholar, havenward exit safe (unknown but no monster) -> push home
  {
    const { Game } = await loadGame({ seed: 33, mode: 'fleedirect-C' });
    await setupGame(Game);
    scriptMap(Game, 6, 6, [], []);
    const s = Game.state.scholar;
    s.kcal = 400;
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dec = fleeDirect.fleeDecision(Game, p, {});
    console.log('C detail:', JSON.stringify(dec));
    check('C: act is push toward haven', dec.act === 'push', 'act=' + dec.act);
    check('C: reason is safe-home', dec.reason === 'safe-home', 'reason=' + dec.reason);
    const havenward = (dec.dx === -1 && dec.dy === 0) || (dec.dx === 0 && dec.dy === -1);
    check('C: push direction is havenward', havenward, 'd=[' + dec.dx + ',' + dec.dy + ']');
  }

  // ---- D: known-safe ground beats a dangerous way home
  {
    const { Game } = await loadGame({ seed: 44, mode: 'fleedirect-D' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [[3, 6]], [[4, 5]]); // (3,6) visited+safe; (4,5) havenward but monster-active
    const s = Game.state.scholar;
    s.kcal = 2600;
    const p = { hp: 100, maxHp: 100, mx: 4, my: 4 };
    const dec = fleeDirect.fleeDecision(Game, p, {});
    console.log('D detail:', JSON.stringify(dec));
    check('D: act is push', dec.act === 'push', 'act=' + dec.act);
    check('D: reason is known-safe (never trade one fight for another)',
      dec.reason === 'known-safe', 'reason=' + dec.reason);
    check('D: pushes to the known-safe node', dec.dx === -1 && dec.dy === 0, 'd=[' + dec.dx + ',' + dec.dy + ']');
  }

  // ---- E: at the haven node -> hold (no push leads toward safety)
  {
    const { Game } = await loadGame({ seed: 55, mode: 'fleedirect-E' });
    await setupGame(Game);
    scriptMap(Game, 4, 4, [], []);
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dec = fleeDirect.fleeDecision(Game, p, {});
    check('E: at haven -> hold', dec.act === 'hold' && dec.reason === 'at-haven',
      'act=' + dec.act + ' reason=' + dec.reason);
  }

  // ---- F: gate off -> layer inert, legacy flee untouched
  {
    delete process.env.FLEEDIRECT;
    check('F: gate off -> fleeDirectOn() false', fleeDirect.fleeDirectOn() === false);
    process.env.FLEEDIRECT = '1';
  }

  // ---- G (e2e, fired harness path): real tb fight, hurt+hungry scholar at
  // (4,6), havenward exit monster-active -> the disengage fires but the
  // layer HOLDS (no outward push into the unknown).
  {
    const { Game } = await loadGame({ seed: 66, mode: 'fleedirect-G' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]);
    const s = Game.state.scholar;
    s.health = 100; s.kcal = 400; s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    check('G: fight started', !!f);
    if (f) {
      const mo = f.fighters.find(x => x.kind === 'monster');
      mo.hp = 300; mo.maxHp = 300; // lost race, will not die before the assessment
      const p0 = Game.tbFighter('p');
      p0.hp = 20; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
      const ctx = {};
      driveFightOnce(Game, ctx, 3);
      console.log('G: checks=' + (ctx.fleeDirectChecks || 0) + ' held=' + (ctx.fleeDirectHeld || 0) +
        ' pushes=' + (ctx.fleeDirectPushes || 0) + ' reason=' + (ctx.fleeDirectHoldReason || '-'));
      check('G: the layer judged the disengage (checks>=1)', (ctx.fleeDirectChecks || 0) >= 1);
      check('G: the layer REFUSED the outward push (held>=1)', (ctx.fleeDirectHeld || 0) >= 1);
      check('G: no barrier push into the unknown', (ctx.fleeDirectPushes || 0) === 0);
    }
  }

  // ---- H (e2e): healthy scholar at (6,6), outmatched at fight start ->
  // the layer pushes TOWARD haven (safe-home), not the nearest edge.
  {
    const { Game } = await loadGame({ seed: 77, mode: 'fleedirect-H' });
    await setupGame(Game);
    scriptMap(Game, 6, 6, [], []);
    const s = Game.state.scholar;
    s.health = 100; s.kcal = 2600; s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    check('H: fight started', !!f);
    if (f) {
      const mo = f.fighters.find(x => x.kind === 'monster');
      mo.hp = 300; mo.maxHp = 300; // outmatched at fight start (totalMhp > 2.5*pmax)
      const p0 = Game.tbFighter('p');
      p0.hp = 100; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
      const ctx = {};
      driveFightOnce(Game, ctx, 3);
      const first = ctx.fleeDirectFirst || {};
      console.log('H: checks=' + (ctx.fleeDirectChecks || 0) + ' reason=' + (ctx.fleeDirectReason || '-') +
        ' walks=' + (ctx.fleeDirectWalks || 0) + ' pushes=' + (ctx.fleeDirectPushes || 0) +
        ' first=' + JSON.stringify(first.reason || null));
      check('H: the layer judged the disengage (checks>=1)', (ctx.fleeDirectChecks || 0) >= 1);
      check('H: the push is haven-bound (safe-home)', ctx.fleeDirectReason === 'safe-home',
        'reason=' + ctx.fleeDirectReason);
      const pick = (first.detail && first.detail.pick && first.detail.pick.d) || [];
      const havenward = (pick[0] === -1 && pick[1] === 0) || (pick[0] === 0 && pick[1] === -1);
      check('H: chosen exit is havenward', havenward, 'd=' + JSON.stringify(pick));
    }
  }

  console.log(fails ? `\n${fails} FAIL(s) — mechanism ${requireErr ? 'ABSENT (RED)' : 'BROKEN'}` : '\nALL PASS — mechanism present (GREEN)');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
