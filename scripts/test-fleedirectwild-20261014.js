#!/usr/bin/env node
// test-fleedirectwild-20261014.js — PROOF for the scale-wall r36
// WILDERNESS-REFUSAL layer (scripts/policies/fleedirectwild.js, gate
// FLEEDIRECTWILD=1) on the wildrange substrate (scripts/policies/wildrange.js).
//
// Mechanism (finding #203): the r26 fleedirect headline judgment — REFUSE
// outward pushes into unknown nodes when hurt (hp < 50% maxHp) or hungry
// (kcal < 35% kcalCap) — proven 17/17 under r26 but fired 0 times in the
// wild under leadfeast. This arm isolates the WILDERNESS half: the layer
// refuses the judged least-bad push into the unknown in wilderness
// disengages. At-haven behavior is out of scope by construction (the hook
// sits after chooseFleeDir's at-haven null-hold, which is already measured).
//
// RED->GREEN: on pristine code the layer is absent (require throws), so the
// behavior assertions below FAIL (RED). After the layer + competent.js hook
// land, they PASS (GREEN). The gate-off checks prove the r2 directional
// path is byte-identical with the gate off.
//
// Node harness per convention: full src/js eval via sim-harness,
// Math.random seeded BEFORE eval, Game.save never stubbed.
//
// Usage: node scripts/test-fleedirectwild-20261014.js   (exit 0 = all pass)
'use strict';
process.env.FLEEDIRECTWILD = '1';
process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { competent, chooseFleeDir } = require('./policies/competent');

let fails = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
  if (!cond) fails++;
}

// The layer must exist — on pristine code this require throws and the
// mechanism assertions below fail RED.
let fdw = null, requireErr = null;
try { fdw = require('./policies/fleedirectwild'); }
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

function kcalCap(Game) {
  try { return Game.kcalCap(); } catch (e) { return 2400; }
}

function driveFightOnce(Game, ctx, maxCalls) {
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls < (maxCalls || 3) && !Game.over) {
    if (!Game.tbIsPlayerTurn()) break;
    let handled = false;
    try { handled = competent.fight(Game, ctx); } catch (e) { break; }
    if (!handled) break;
    calls++;
  }
  return ctx;
}

(async () => {
  check('RED/GREEN: the fleedirectwild layer loads (pristine code = absent = RED)',
    !!fdw, requireErr ? String(requireErr.message || requireErr).slice(0, 80) : 'loaded');
  check('gate on: fdWildOn() is true', fdw && fdw.fdWildOn() === true);
  if (!fdw) { console.log('mechanism absent — remaining checks fail RED by design'); process.exit(1); }

  // ---- A: hurt+hungry, havenward exit monster-active, rest unknown ->
  // REFUSE (the headline judgment, r26 fixture A ported)
  {
    const { Game } = await loadGame({ seed: 11, mode: 'fdwild-A' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]); // (4,5) is the havenward exit, monster sitting on it
    const s = Game.state.scholar;
    s.kcal = Math.floor(kcalCap(Game) * 0.2); // hungry (< 35% cap)
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dir = chooseFleeDir(Game, 4, 6);
    const r = fdw.wildernessRefusal(Game, p, dir);
    console.log('A detail:', JSON.stringify(r), 'dir:', JSON.stringify(dir && { d: [dir.dx, dir.dy], known: dir.known, danger: dir.danger, havenward: dir.havenward }));
    check('A: REFUSE the outward push into the unknown', r.refuse === true, 'refuse=' + r.refuse);
    check('A: reason is refuse-hurt-hungry', r.reason === 'refuse-hurt-hungry', 'reason=' + r.reason);
  }

  // ---- B: healthy+fed, same node -> no refusal (strong scholars may risk it)
  {
    const { Game } = await loadGame({ seed: 22, mode: 'fdwild-B' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]);
    const s = Game.state.scholar;
    s.kcal = Math.floor(kcalCap(Game) * 0.8); // fed
    const p = { hp: 100, maxHp: 100, mx: 4, my: 4 };
    const dir = chooseFleeDir(Game, 4, 6);
    const r = fdw.wildernessRefusal(Game, p, dir);
    console.log('B detail:', JSON.stringify(r));
    check('B: no refusal for the strong', r.refuse === false, 'refuse=' + r.refuse);
    check('B: reason is least-bad-strong', r.reason === 'least-bad-strong', 'reason=' + r.reason);
  }

  // ---- C: hurt scholar, havenward exit safe (unknown but no monster) ->
  // push home (safe-home is not the layer's business)
  {
    const { Game } = await loadGame({ seed: 33, mode: 'fdwild-C' });
    await setupGame(Game);
    scriptMap(Game, 6, 6, [], []);
    const s = Game.state.scholar;
    s.kcal = Math.floor(kcalCap(Game) * 0.2);
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dir = chooseFleeDir(Game, 6, 6);
    const r = fdw.wildernessRefusal(Game, p, dir);
    console.log('C detail:', JSON.stringify(r), 'dir:', JSON.stringify(dir && { d: [dir.dx, dir.dy], havenward: dir.havenward, danger: dir.danger }));
    check('C: no refusal on a safe way home', r.refuse === false, 'refuse=' + r.refuse);
    check('C: reason is safe-home', r.reason === 'safe-home', 'reason=' + r.reason);
    const havenward = (dir.dx === -1 && dir.dy === 0) || (dir.dx === 0 && dir.dy === -1);
    check('C: judged direction is havenward', havenward, 'd=[' + dir.dx + ',' + dir.dy + ']');
  }

  // ---- D: known-safe ground beats a dangerous way home -> push through
  {
    const { Game } = await loadGame({ seed: 44, mode: 'fdwild-D' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [[3, 6]], [[4, 5]]); // (3,6) visited+safe; (4,5) havenward but monster-active
    const s = Game.state.scholar;
    s.kcal = Math.floor(kcalCap(Game) * 0.8);
    const p = { hp: 100, maxHp: 100, mx: 4, my: 4 };
    const dir = chooseFleeDir(Game, 4, 6);
    const r = fdw.wildernessRefusal(Game, p, dir);
    console.log('D detail:', JSON.stringify(r), 'dir:', JSON.stringify(dir && { d: [dir.dx, dir.dy], known: dir.known }));
    check('D: no refusal onto known-safe ground', r.refuse === false, 'refuse=' + r.refuse);
    check('D: reason is known-safe', r.reason === 'known-safe', 'reason=' + r.reason);
  }

  // ---- E: at the haven node -> the layer stays SILENT (out of scope;
  // the r2 at-haven hold owns it and is already measured)
  {
    const { Game } = await loadGame({ seed: 55, mode: 'fdwild-E' });
    await setupGame(Game);
    scriptMap(Game, 4, 4, [], []);
    const s = Game.state.scholar;
    s.kcal = Math.floor(kcalCap(Game) * 0.2);
    const p = { hp: 20, maxHp: 100, mx: 4, my: 4 };
    const dir = chooseFleeDir(Game, 4, 4);
    const r = fdw.wildernessRefusal(Game, p, dir);
    console.log('E detail:', JSON.stringify(r), 'dir:', dir);
    check('E: no direction at haven (r2 hold owns it)', dir === null);
    check('E: the layer is silent (reason at-haven)', r.refuse === false && r.reason === 'at-haven',
      'refuse=' + r.refuse + ' reason=' + r.reason);
  }

  // ---- F: gate off -> hook inert, r2 path untouched
  {
    delete process.env.FLEEDIRECTWILD;
    check('F: gate off -> fdWildOn() false', fdw.fdWildOn() === false);
    const refused = fdw.hookFleeDecision({}, { hp: 1, maxHp: 100 },
      { dx: -1, dy: 0, haven: false, known: false, danger: false, havenward: false }, {});
    check('F: gate off -> hookFleeDecision false (r2 path)', refused === false);
    process.env.FLEEDIRECTWILD = '1';
  }

  // ---- G (e2e, fired harness path): real tb fight, hurt+hungry scholar at
  // (4,6), havenward exit monster-active -> the disengage is judged, the
  // layer REFUSES the outward push (no barrier push into the unknown).
  {
    const { Game } = await loadGame({ seed: 66, mode: 'fdwild-G' });
    await setupGame(Game);
    scriptMap(Game, 4, 6, [], [[4, 5]]);
    const s = Game.state.scholar;
    s.health = 100; s.kcal = Math.floor(kcalCap(Game) * 0.2); s.hydration = 80; s.energy = 100; s.trauma = 0;
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
      console.log('G: refusals=' + (ctx.fdWildRefusals || 0) + ' checks=' + (ctx.fdWildChecks || 0) +
        ' reason=' + (ctx.fdWildRefuseReason || '-') + ' dirPushes=' + (ctx.dirPushes || 0));
      check('G: the layer judged the disengage (checks+refusals>=1)',
        ((ctx.fdWildChecks || 0) + (ctx.fdWildRefusals || 0)) >= 1);
      check('G: the layer REFUSED the outward push (refusals>=1)', (ctx.fdWildRefusals || 0) >= 1);
      check('G: no judged push into the unknown (dirPushes==0)', (ctx.dirPushes || 0) === 0);
    }
  }

  // ---- H (e2e): healthy scholar at (6,6), outmatched at fight start ->
  // the refusal does NOT fire; the safe-home push proceeds.
  {
    const { Game } = await loadGame({ seed: 77, mode: 'fdwild-H' });
    await setupGame(Game);
    scriptMap(Game, 6, 6, [], []);
    const s = Game.state.scholar;
    s.health = 100; s.kcal = Math.floor(kcalCap(Game) * 0.8); s.hydration = 80; s.energy = 100; s.trauma = 0;
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    check('H: fight started', !!f);
    if (f) {
      const mo = f.fighters.find(x => x.kind === 'monster');
      mo.hp = 300; mo.maxHp = 300; // outmatched at fight start (totalMhp > 2.5*pmax)
      const p0 = Game.tbFighter('p');
      p0.hp = 100; p0.maxHp = Math.max(p0.maxHp || 100, 100); p0.alive = true;
      const ctx = {};
      driveFightOnce(Game, ctx, 4);
      console.log('H: refusals=' + (ctx.fdWildRefusals || 0) + ' fled=' + (ctx.fled || 0) +
        ' reason=' + (ctx.fdWildRefuseReason || '-'));
      check('H: the layer judged the disengage', ((ctx.fdWildChecks || 0) + (ctx.fdWildRefusals || 0)) >= 1);
      check('H: no refusal for the strong (refusals==0)', (ctx.fdWildRefusals || 0) === 0);
      check('H: the flee proceeded (fled>=1)', (ctx.fled || 0) >= 1);
    }
  }

  console.log(fails ? `\n${fails} FAIL(s) — mechanism ${requireErr ? 'ABSENT (RED)' : 'BROKEN'}` : '\nALL PASS — mechanism present (GREEN)');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
