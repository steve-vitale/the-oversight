#!/usr/bin/env node
// test-heraldpos-20261031.js — sim-heraldpos-a proof test.
//
// SYNTHETIC fixtures only (no band seeds, no sims): exercises the
// analyzer's placement parsing, distance math, move attribution,
// proximity counting, window statistics, and never-located handling,
// plus the instrument's purity contract on a fake Game (pure property
// reads only: no nodePos materialisation, no worldMonsters array
// creation, no Game method calls, zero RNG draws). Exits non-zero on
// any failure.
'use strict';
const A = require('./heraldpos-analyze-20261031');
const HP = require('./heraldpos-instrument-20261031');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}

// ---- distance / edge helpers ----
check('manhattan 3,4 -> 7', A.man(0, 0, 3, 4) === 7);
check('chebyshev diagonal = 1', A.cheb(4, 4, 5, 5) === 1);
check('chebyshev knight-ish = 2', A.cheb(4, 4, 6, 5) === 2);
check('edge x=0', A.isEdge(0, 4) === true);
check('edge y=8', A.isEdge(4, 8) === true);
check('interior 4,4 not edge', A.isEdge(4, 4) === false);

// ---- fixture seed: located, lair 7,4, window 30 days ----
function dailyRow(day, hx, hy, opts) {
  const o = opts || {};
  return {
    day: day, kind: 'daily',
    herald: { tx: hx, ty: hy, mx: 4, my: 4, hp: 800 },
    player: { x: 4, y: 4 }, haven: { x: 4, y: 4 },
    distHaven: Math.abs(hx - 4) + Math.abs(hy - 4),
    distPlayer: Math.abs(hx - 4) + Math.abs(hy - 4),
    playerCoincide: false, playerAdjacent: false,
    nearest: o.nearest || { vid: 'v9', man: 3, cheb: 3 },
    nOn: o.nOn || 0, onVids: o.onVids || [],
    nAdj: o.nAdj || 0, adjVids: o.adjVids || [],
    nAway: o.nAway || 0, nNodes: 1,
    nodeList: o.nodeList || ['4,4'],
  };
}
const fixture = {
  seed: 99991, gameDays: 140, won: 0, national: 1, table: 0, maxWave: 4,
  w4Day: 82, endReason: 'village-lost', endOmenStage: 2, endOmenDay: 106,
  posPlacement: [{
    day: 106, line: '🗺️ Scouts found its lair — tile 7,4. THE HERALD — test.',
    spoken: { x: 7, y: 4 }, entry: { tx: 7, ty: 4, mx: 4, my: 4, hp: 800 },
    agrees: true, player: { x: 4, y: 4 }, haven: { x: 4, y: 4 },
    distHaven: 3, distPlayer: 3, tileType: 'thicket',
  }],
  posDaily: [
    dailyRow(106, 7, 4),
    dailyRow(107, 7, 4),
    dailyRow(120, 7, 5, { nearest: { vid: 'v9', man: 2, cheb: 2 } }),
    dailyRow(121, 8, 5, { nearest: { vid: 'v9', man: 1, cheb: 1 }, nAdj: 1, adjVids: ['v9'] }),
    dailyRow(136, 8, 5, { nearest: { vid: 'v9', man: 1, cheb: 1 }, nAdj: 1, adjVids: ['v9'], nodeList: ['4,4', '8,5'] }),
  ],
  posTick: [
    Object.assign(dailyRow(115, 7, 4), { kind: 'tick' }),
    Object.assign(dailyRow(121, 8, 5, { nOn: 1, onVids: ['v9'] }), { kind: 'tick' }),
  ],
  posMoves: [{ day: 121, kind: 'wander', from: { tx: 7, ty: 5 }, to: { tx: 8, ty: 5 }, stepMan: 1 }],
  posFinal: dailyRow(136, 8, 5),
  posSayLines: [{ day: 106, line: '🗺️ Scouts found its lair — tile 7,4.' }],
  posInstrumentErrors: [], instrumentErrors: [],
  attempts: [], fieldFights: [], musterRefusals: [], musterEvents: [],
};
const an = A.analyzeSeed(fixture);
check('placement spoken 7,4 agrees', an.placement && an.placement.agrees && an.placement.spoken.x === 7 && an.placement.spoken.y === 4);
check('lair = entry tile', an.lair && an.lair.x === 7 && an.lair.y === 4);
check('window = gameDays 140 - placement 106 = 34 (window runs to run end, not last daily row)', an.windowDays === 34, String(an.windowDays));
check('completeness: placement + final + gaps<=2? NO — gaps 13/15 exist, so incomplete is honest',
  an.completeness.complete === false && an.completeness.gaps.length === 2, JSON.stringify(an.completeness.gaps));
check('wander moves counted 1', an.movement.wanderMoves === 1);
check('distinct tiles = 3 (7,4 / 7,5 / 8,5)', an.movement.distinctTiles === 3, String(an.movement.distinctTiles));
check('max displacement from lair = 2 (8,5 vs 7,4)', an.movement.maxDisplacementFromLair === 2);
check('final displacement = 2', an.movement.finalDisplacementFromLair === 2);
check('adjacent daily days = 2 (121, 136)', JSON.stringify(an.proximityDaily.adjDays) === JSON.stringify([121, 136]));
check('coincide daily days = 0 (tick coincidence does not leak into daily)', an.proximityDaily.coincideDays.length === 0);
check('coincide tick rows = 1', an.proximityTick.coincideRows === 1);
check('min nearest man = 1', an.proximityDaily.minNearestMan === 1);
check('lair on path? nodeLists never contain 7,4 -> null', an.lairOnPathDay === null);
check('no contact', an.contactDay === null && an.heraldAttempts === 0);

// ---- complete small window: consecutive daily rows, no gaps ----
const tight = JSON.parse(JSON.stringify(fixture));
tight.posDaily = [dailyRow(106, 7, 4), dailyRow(107, 7, 4), dailyRow(108, 7, 4)];
tight.posTick = [];
tight.posMoves = [];
tight.gameDays = 108;
tight.posFinal = dailyRow(108, 7, 4);
const anT = A.analyzeSeed(tight);
check('tight window completeness = true', anT.completeness.complete === true, JSON.stringify(anT.completeness));
check('tight window stationary share = 1', anT.movement.stationaryShare === 1);
check('tight window distinct tiles = 1', anT.movement.distinctTiles === 1);

// ---- placement mismatch is reported, not agreed ----
const mis = JSON.parse(JSON.stringify(tight));
mis.posPlacement = [Object.assign({}, mis.posPlacement[0], { entry: { tx: 6, ty: 4, mx: 4, my: 4, hp: 800 }, agrees: false })];
const anM = A.analyzeSeed(mis);
check('mismatch: agrees false, completeness false', anM.placement.agrees === false && anM.completeness.complete === false);

// ---- never-located seed: no crash, no invented lair ----
const never = {
  seed: 99992, gameDays: 201, won: 0, national: 1, table: 0, maxWave: 3,
  w4Day: null, endReason: 'survived', endOmenStage: null, endOmenDay: null,
  posPlacement: [], posDaily: [], posTick: [], posMoves: [], posFinal: null,
  posSayLines: [], posInstrumentErrors: [], instrumentErrors: [],
  attempts: [], fieldFights: [], musterRefusals: [], musterEvents: [],
};
const anN = A.analyzeSeed(never);
check('never-located: lair null, window null, completeness not applicable',
  anN.lair === null && anN.windowDays === null && anN.completeness.applicable === false);
check('never-located: movement tiles 0', anN.movement.distinctTiles === 0);

// ---- instrument purity on a fake Game ----
function fakeGame() {
  const state = {
    scholar: { day: 5 },
    village: { roster: ['v1', 'v2'], px: 4, py: 4 },
    worldMonsters: [],
  };
  const map = { px: 4, py: 4, tiles: [] };
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) row.push({ type: (x === 4 && y === 4) ? 'haven' : 'meadow' });
    map.tiles.push(row);
  }
  const calls = { say: 0, sleep: 0, wander: 0, tick: 0 };
  return {
    state: state, map: map, villagerId: 'player',
    say: function () { calls.say++; },
    sleep: function () { calls.sleep++; },
    wanderWorldMonsters: function () {
      calls.wander++;
      // The fake wander moves the herald one tile east (a game-side move
      // the recorder must observe, not cause).
      const m = state.worldMonsters.find((e) => e.id === 'herald');
      if (m) m.tx += 1;
    },
    worldTick: function () { calls.tick++; },
    _calls: calls,
  };
}
const fg = fakeGame();
const origSay = fg.say, origSleep = fg.sleep;
const store = { placement: [], daily: [], tick: [], moves: [], sayLines: [], instrumentErrors: [] };
const ctl = HP.install(fg, store);
// No herald yet: sleep records nothing, state untouched.
fg.sleep();
check('no herald -> no daily row', store.daily.length === 0);
check('purity: no nodePos materialised by sleep', fg.state.village.nodePos === undefined);
// Place the herald (game-side, as titanPlace would).
fg.state.worldMonsters.push({ id: 'herald', tx: 7, ty: 4, mx: 4, my: 4, hp: 800, titan: true });
fg.state.village.nodePos = { v1: { nx: 4, ny: 4 }, v2: { nx: 7, ny: 5 } };
fg.sleep();
check('herald present -> daily row at lair 7,4', store.daily.length === 1 && store.daily[0].herald.tx === 7 && store.daily[0].herald.ty === 4);
check('daily distHaven = 3', store.daily[0].distHaven === 3);
check('daily nearest = v2 man 1 (7,5 vs 7,4)', store.daily[0].nearest && store.daily[0].nearest.vid === 'v2' && store.daily[0].nearest.man === 1);
check('daily adjacent: v2 adjacent, not on', store.daily[0].nAdj === 1 && store.daily[0].nOn === 0);
fg.say('🗺️ Scouts found its lair — tile 7,4. THE HERALD — test. It is WAITING.');
check('say-line placement parsed + agrees', store.placement.length === 1 && store.placement[0].agrees === true && store.placement[0].spoken.x === 7);
fg.wanderWorldMonsters();
check('wander move recorded 7,4 -> 8,4', store.moves.length === 1 && store.moves[0].kind === 'wander' && store.moves[0].to.tx === 8 && store.moves[0].to.ty === 4);
fg.worldTick();
check('tick row after wander at 8,4', store.tick.length === 1 && store.tick[0].herald.tx === 8);
const fin = ctl.finalSnapshot();
check('final snapshot at 8,4', fin && fin.herald.tx === 8);
check('instrument errors 0 on fake Game', store.instrumentErrors.length === 0, JSON.stringify(store.instrumentErrors));
ctl.uninstall();
check('uninstall restores say + sleep', fg.say === origSay && fg.sleep === origSleep);
check('original methods still called (sleep count 2)', fg._calls.sleep === 2);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
