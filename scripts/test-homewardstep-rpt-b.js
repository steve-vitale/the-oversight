#!/usr/bin/env node
// test-homewardstep-b.js — proof test for the travelTo-jump-faithful
// return sim + pocket-entry guard (sim-homewardstep-b).
//
// Re-ported for sim-homewardstep-rpt-b; prereg:
// evidence/2026-11-02/sim-homewardstep-rpt-b-prereg.md. Part 1 is
// synthetic (fake Game with engine-faithful travelBlockage side-guard
// semantics). Part 2 is the LIVE-ENGINE census battery: fresh harness
// games, blockages placed by setting tile.blockFrom directly, sim
// prediction compared against the REAL travelTo hop result and the
// REAL competent walkTo reached-home result on the SAME map state
// (sim first — the sim does not mutate). The no-credit core must
// agree EXACTLY with the real walk (false opens 0, false closes 0);
// the credit-1 divergence is verified separately as designed behavior
// (single rubble: sim ok with creditUsed 1, real walkTo fails).
// Exits 1 on any failure. Usage: node scripts/test-homewardstep-b.js
'use strict';
const assert = require('assert');
const { simulateReturnJump, checkHop, installGuard, escapeCheck } = require('./policies/competent-homewardstep-b');

let passed = 0;
function check(name, cond, extra) {
  assert.ok(cond, name + (extra ? ' :: ' + JSON.stringify(extra) : ''));
  passed++;
  console.log('ok - ' + name);
}

// ---------- Part 1: synthetic fake Game ----------
function fakeGame(blocks) {
  // blocks: {"x,y": {dx, dy, type}} blockFrom entries; optional creek
  // tiles: {"x,y": {type:'creek', needsBridge:true, bridged:false}}.
  const tiles = [];
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) row.push({ x, y, revealed: true, type: 'grass', stock: 0 });
    tiles.push(row);
  }
  for (const [k, v] of Object.entries(blocks || {})) {
    const [x, y] = k.split(',').map(Number);
    if (v && v.type === 'creek') Object.assign(tiles[y][x], { type: 'creek', needsBridge: true, bridged: false });
    else tiles[y][x].blockFrom = v;
  }
  return {
    map: { px: 0, py: 0, tiles },
    state: { village: { px: 4, py: 4 } },
    tileAt(x, y) { return (this.map.tiles[y] || [])[x]; },
    travelBlockage(x, y, fx, fy) {
      const dest = this.tileAt(x, y);
      if (!dest) return null;
      const sx = (fx === undefined) ? this.map.px : fx;
      const sy = (fy === undefined) ? this.map.py : fy;
      const dx = Math.sign(x - sx), dy = Math.sign(y - sy);
      const bf = dest.blockFrom;
      if (bf && ((bf.dx !== 0 && bf.dx === -dx) || (bf.dy !== 0 && bf.dy === -dy))) {
        return { kind: 'blockage', blockType: bf.type, x, y };
      }
      if (dest.type === 'creek' && dest.needsBridge && !dest.bridged) {
        return { kind: 'blockage', blockType: 'creek', x, y };
      }
      return null;
    },
  };
}

// S1 clean jump straight home: (4,1) -> (4,4) in one d=3 hop.
{
  const G = fakeGame({});
  const r = simulateReturnJump(G, 4, 1, 4, 4);
  check('S1 clean d=3 jump home', r.ok === true && r.hops === 1, r);
}
// S2 the 0459 root-cause shape: orthogonal path exists (via the north
// row) but the greedy d=3 jump (0,2)->(3,2) is refused by a fallen tree
// on intermediate (2,2) guarding the west entry.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
  const chk = checkHop(G, 0, 2, 3, 2);
  check('S2 hop blockers name the intermediate tree',
    chk.blockers.some((b) => b.x === 2 && b.y === 2 && b.blockType === 'fallen_tree'), chk);
  const r = simulateReturnJump(G, 0, 2, 4, 2);
  check('S2 sim fails despite an orthogonal path existing',
    r.ok === false && r.reason === 'blocked:fallen_tree', r);
}
// S3 same layout, no blockage: two hops home.
{
  const G = fakeGame({});
  const r = simulateReturnJump(G, 0, 2, 4, 2);
  check('S3 clean walk home', r.ok === true && r.hops === 2, r);
}
// S4 single rubble: credit passes, creditUsed 1; credit 0 fails.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'rubble' } });
  const r = simulateReturnJump(G, 0, 2, 4, 2);
  check('S4 single rubble passes on the credit', r.ok === true && r.creditUsed === 1, r);
  const r0 = simulateReturnJump(G, 0, 2, 4, 2, { credit: 0 });
  check('S4 no-credit core fails the same hop', r0.ok === false && r0.creditUsed === 0, r0);
}
// S5 rubble on TWO distinct tiles blocking one hop: credit cannot cover both.
{
  const G = fakeGame({ '1,2': { dx: -1, dy: 0, type: 'rubble' }, '2,2': { dx: -1, dy: 0, type: 'rubble' } });
  const r = simulateReturnJump(G, 0, 2, 4, 2);
  check('S5 two rubble tiles fail even with credit', r.ok === false && r.creditUsed === 0, r);
}
// S6 diagonal jump: greedy pick (2,1) over (1,2) by row-major tie order,
// then refused by a tree on intermediate (1,1) guarding the west entry.
{
  const G = fakeGame({ '1,1': { dx: -1, dy: 0, type: 'fallen_tree' } });
  const r = simulateReturnJump(G, 0, 0, 2, 2);
  check('S6 diagonal jump refused by intermediate tree', r.ok === false && r.reason === 'blocked:fallen_tree', r);
  const G2 = fakeGame({});
  const r2 = simulateReturnJump(G2, 0, 0, 2, 2);
  check('S6 tie-break picks (2,1) first, home in 2 hops',
    r2.ok === true && r2.hops === 2 && r2.path[1].x === 2 && r2.path[1].y === 1, r2);
}
// S7 creek intermediate blocks (non-rubble, no credit rescue).
{
  const G = fakeGame({ '2,2': { type: 'creek' } });
  const r = simulateReturnJump(G, 0, 2, 4, 2);
  check('S7 creek intermediate blocks', r.ok === false && r.reason === 'blocked:creek', r);
}
// S8 destination blocked (haven itself guarded) fails.
{
  const G = fakeGame({ '4,4': { dx: 0, dy: -1, type: 'fallen_tree' } });
  const r = simulateReturnJump(G, 4, 1, 4, 4);
  check('S8 blocked destination fails', r.ok === false && r.reason === 'blocked:fallen_tree', r);
}
// S9 already home: ok, 0 hops.
{
  const G = fakeGame({});
  const r = simulateReturnJump(G, 4, 4, 4, 4);
  check('S9 already home', r.ok === true && r.hops === 0, r);
}
// G1-G4 guard wrapper behavior on a fake Game.
function fakeGuardGame() {
  const G = fakeGame({ '4,3': { dx: 0, dy: -1, type: 'fallen_tree' } });
  G.map.px = 4; G.map.py = 4;
  G.state.village = { px: 4, py: 4 };
  G.said = [];
  G.say = (s) => { G.said.push(s); };
  G.inCombat = () => false;
  G.travelCalls = [];
  G.travelTo = function (x, y) {
    G.travelCalls.push([x, y]);
    const block = this.travelBlockage(x, y);
    if (block) return block;
    this.map.px = x; this.map.py = y;
    return { moved: true };
  };
  return G;
}
{
  // G1 homeward hop to haven passes untouched (E(haven) succeeds in 0 hops).
  const G = fakeGuardGame();
  G.map.px = 4; G.map.py = 3;
  const ctx = {};
  const restore = installGuard(G, ctx);
  const res = G.travelTo(4, 4);
  check('G1 homeward hop to haven never vetoed (E passes)', res.moved === true && (ctx.homewardstepVetoes || 0) === 0, { res, ctx });
  restore();
  // G2 outward hop into a pocket vetoed: sim from (4,1) to (4,4) must
  // cross blocked (4,3) (guarded from the south approach (4,2)).
  const G2 = fakeGuardGame();
  const ctx2 = {};
  const restore2 = installGuard(G2, ctx2);
  const res2 = G2.travelTo(4, 1);
  check('G2 pocket hop vetoed, orig not called, veto counted',
    G2.travelCalls.length === 0 && ctx2.homewardstepVetoes === 1 && G2.map.px === 4 && G2.map.py === 4, { res2, ctx2 });
  check('G2 veto narrates honestly', G2.said.some((s) => /couldn't get home/.test(s)), G2.said);
  restore2();
  // G3 shadow mode: same hop, orig called, no veto.
  const G3 = fakeGuardGame();
  const ctx3 = {};
  const restore3 = installGuard(G3, ctx3, { shadow: true });
  const res3 = G3.travelTo(4, 1);
  check('G3 shadow never vetoes', G3.travelCalls.length === 1 && (ctx3.homewardstepVetoes || 0) === 0 && G3.said.length === 0, { res3, ctx3 });
  restore3();
  // G4 self-call and force passthrough.
  const G4 = fakeGuardGame();
  const ctx4 = {};
  const restore4 = installGuard(G4, ctx4);
  G4.travelTo(4, 4);
  G4.travelTo(0, 0, true);
  check('G4 self + force passthrough', G4.travelCalls.length === 2 && (ctx4.homewardstepSimChecks || 0) === 0, { ctx4 });
  restore4();
}


// ---------- Lateral-escape synthetic cases (the 0619Z false close) ----------
// L1 61705 miniature: direct walk from (0,2) to haven (4,2) fails — the
// greedy d=3 jump (0,2)->(3,2) is refused by a fallen tree on intermediate
// (2,2) guarding the west entry — but a chain of stocked lateral tiles
// leads out: (0,5) is a clean single hop away, then (3,5), from which
// the direct walk home succeeds ((3,5)->(3,2)->home). Note the greedy
// walk from (0,5) alone does NOT succeed (it oscillates back to (0,2)
// and blocks) — the escape needs the second forage pick, exactly as
// the real 61705 escape needed several onward picks. E must PASS where
// walkTo-only FAILS.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
  G.map.tiles[5][0].stock = 5;
  G.map.tiles[5][3].stock = 5;
  const direct = simulateReturnJump(G, 0, 2, 4, 2, { credit: 0 });
  check('L1 walkTo-only sim fails the 61705 miniature', direct.ok === false, direct);
  const esc = escapeCheck(G, 0, 2, 4, 2);
  check('L1 lateral escape PASSES (via lateral, directOk false)',
    esc.ok === true && esc.via === 'lateral' && esc.directOk === false, esc);
}
// L2 true pocket (61704 miniature): same tree, NO stocked lateral tile.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
  const esc = escapeCheck(G, 0, 2, 4, 2);
  check('L2 true pocket FAILS (no stocked lateral candidate)',
    esc.ok === false && esc.directOk === false, esc);
}
// L3 stocked lateral tile exists but its hop is itself blocked by a tree.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' }, '0,4': { dx: 0, dy: -1, type: 'fallen_tree' } });
  G.map.tiles[5][0].stock = 5;
  const esc = escapeCheck(G, 0, 2, 4, 2);
  check('L3 blocked lateral hop FAILS', esc.ok === false, esc);
}
// L4 lateral hop passes on the single shared credit (rubble intermediate);
// creditUsed across the whole evaluation is at most 1.
{
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' }, '0,4': { dx: 0, dy: -1, type: 'rubble' } });
  G.map.tiles[5][0].stock = 5;
  G.map.tiles[5][3].stock = 5;
  const esc = escapeCheck(G, 0, 2, 4, 2);
  check('L4 lateral rubble hop passes on the shared credit, creditUsed==1',
    esc.ok === true && esc.via === 'lateral' && esc.creditUsed === 1, esc);
}
// G5/G6 veto memory on the fake guard game: same pocket hop twice —
// first veto says, second is silent, both still veto, trajectory same.
{
  const G = fakeGuardGame();
  const ctx = {};
  const restore = installGuard(G, ctx);
  const r1 = G.travelTo(4, 1);
  const r2 = G.travelTo(4, 1);
  check('G5 first veto says, second veto silent, both vetoed',
    ctx.homewardstepVetoes === 2 && (ctx.homewardstepSilentVetoes || 0) === 1 &&
    (ctx.homewardstepSpokenVetoes || 0) === 1 && G.said.length === 1 &&
    G.travelCalls.length === 0 && G.map.px === 4 && G.map.py === 4, { r1, r2, ctx, said: G.said });
  restore();
  // A different destination says again (memory is per destination).
  const G2 = fakeGuardGame();
  const ctx2 = {};
  const restore2 = installGuard(G2, ctx2);
  G2.travelTo(4, 1);
  G2.map.px = 4; G2.map.py = 4;
  // (4,0) is a second pocket hop (same blocked corridor): must say again.
  G2.travelTo(4, 0);
  check('G6 a new destination says again (memory keyed by destination)',
    (ctx2.homewardstepSpokenVetoes || 0) === 2 && G2.said.length === 2, { ctx2, said: G2.said });
  restore2();
}


// ---------- Homeward-step cases (THIS ARM: the removed exemption) ----------
// H1 homeward hop into a no-escape destination IS vetoed: haven (4,2),
// fallen tree at (2,2) guarding the west entry pockets the (1,2)->home
// walk, no stocked lateral tile. Scholar at (0,2) hops homeward to
// (1,2) (engine would allow it, E((1,2)) fails) — guard vetoes, scholar
// stays at (0,2), orig never called, veto counted, line spoken.
function fakeHomewardGame() {
  const G = fakeGame({ '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
  G.map.px = 0; G.map.py = 2;
  G.state.village = { px: 4, py: 2 };
  G.said = [];
  G.say = (s) => { G.said.push(s); };
  G.inCombat = () => false;
  G.travelCalls = [];
  G.travelTo = function (x, y) {
    G.travelCalls.push([x, y]);
    const block = this.travelBlockage(x, y);
    if (block) return block;
    this.map.px = x; this.map.py = y;
    return { moved: true };
  };
  return G;
}
{
  const G = fakeHomewardGame();
  const ctx = {};
  const restore = installGuard(G, ctx);
  const res = G.travelTo(1, 2);
  check('H1 homeward hop into no-escape destination vetoed, scholar stays',
    G.travelCalls.length === 0 && G.map.px === 0 && G.map.py === 2 &&
    ctx.homewardstepVetoes === 1 && ctx.homewardstepHomewardVetoes === 1 &&
    G.said.length === 1, { res, ctx, said: G.said });
  const log = ctx.homewardstepHopLog || [];
  check('H1 veto logged as homeward with origin E recorded',
    log.length === 1 && log[0].homeward === true && log[0].vetoed === true &&
    log[0].originSimOk === false, { log });
  // Repeat: silent, still vetoed (veto memory covers homeward dests).
  const res2 = G.travelTo(1, 2);
  check('H1 repeat homeward veto silent, still vetoed',
    ctx.homewardstepVetoes === 2 && (ctx.homewardstepSilentVetoes || 0) === 1 &&
    G.said.length === 1 && G.travelCalls.length === 0, { res2, ctx });
  restore();
}
// H2 same shape, no tree: homeward hop passes (E succeeds), orig called.
{
  const G = fakeGame({});
  G.map.px = 0; G.map.py = 2;
  G.state.village = { px: 4, py: 2 };
  G.said = [];
  G.say = (s) => { G.said.push(s); };
  G.inCombat = () => false;
  G.travelCalls = [];
  G.travelTo = function (x, y) {
    G.travelCalls.push([x, y]);
    this.map.px = x; this.map.py = y;
    return { moved: true };
  };
  const ctx = {};
  const restore = installGuard(G, ctx);
  const res = G.travelTo(1, 2);
  check('H2 homeward hop into escapable destination passes untouched',
    res.moved === true && G.map.px === 1 && (ctx.homewardstepVetoes || 0) === 0, { res, ctx });
  restore();
}
// H3 shadow mode: homeward pocket hop evaluated + logged, never vetoed.
{
  const G = fakeHomewardGame();
  const ctx = {};
  const restore = installGuard(G, ctx, { shadow: true });
  const res = G.travelTo(1, 2);
  const log = ctx.homewardstepHopLog || [];
  check('H3 shadow homeward hop never vetoed but logged with simOk=false',
    G.travelCalls.length === 1 && G.map.px === 1 && (ctx.homewardstepVetoes || 0) === 0 &&
    log.length === 1 && log[0].homeward === true && log[0].simOk === false, { res, ctx, log });
  restore();
}
// H4 vetoed homeward step with escapable origin: scholar at (0,2) with a
// stocked lateral tile at (0,5) reachable... (origin E passes via the
// lateral chain only if the chain leads home; here (0,5) stock + (3,5)
// stock mirror L1 but haven (4,2): direct from (0,5) fails, lateral
// (3,5) then direct home succeeds, so E((0,2)) passes via lateral
// while E((1,2)) fails — the stay is on escapable ground.
{
  const G = fakeHomewardGame();
  G.map.tiles[5][0].stock = 5;
  G.map.tiles[5][3].stock = 5;
  const oesc = escapeCheck(G, 0, 2, 4, 2);
  check('H4 origin E passes via lateral while destination E fails',
    oesc.ok === true && oesc.via === 'lateral', { oesc });
  const ctx = {};
  const restore = installGuard(G, ctx);
  G.travelTo(1, 2);
  const log = ctx.homewardstepHopLog || [];
  check('H4 vetoed homeward hop records originSimOk=true (safe stay)',
    log.length === 1 && log[0].originSimOk === true &&
    (ctx.homewardstepVetoOriginPass || 0) === 1, { log, ctx });
  restore();
}

// ---------- Part 2: live-engine census battery ----------
async function liveBattery() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { walkTo } = require('./policies/competent');
  let falseOpens = 0, falseCloses = 0, hopCases = 0, walkCases = 0;
  const cases = [];
  const report = (name, cond, extra) => {
    if (!cond) console.log('LIVE MISMATCH - ' + name + ' :: ' + JSON.stringify(extra));
    assert.ok(cond, name + ' :: ' + JSON.stringify(extra));
    passed++;
    console.log('ok - ' + name);
  };
  async function freshGame(seed) {
    const { Game } = await loadGame({ seed, mode: 'homewardstep-b-test', fullTelemetry: false });
    await setupGame(Game);
    // Hermetic board: clear every NATURAL blockage and bridge every
    // natural creek, then reveal every home tile (mirrors the
    // synthetic revealed assumption; the sim reads live revealed).
    // setBlocks below places exactly the test blockages.
    for (const row of Game.map.tiles) for (const t of row) {
      delete t.blockFrom;
      if (t.type === 'creek') t.bridged = true;
      t.revealed = true;
    }
    return Game;
  }
  function setBlocks(Game, blocks) {
    for (const [k, v] of Object.entries(blocks)) {
      const [x, y] = k.split(',').map(Number);
      const t = Game.tileAt(x, y);
      if (!t) throw new Error('no tile at ' + k);
      if (v && v.type === 'creek') Object.assign(t, { type: 'creek', needsBridge: true, bridged: false });
      else t.blockFrom = v;
    }
  }
  function setHaven(Game, hx, hy) {
    Game.state.village.px = hx; Game.state.village.py = hy;
  }
  // Hop-level battery: checkHop (no blockers) vs real travelTo moved.
  const hopBattery = [
    { name: 'H1 clean d=3 jump', from: [4, 1], to: [4, 4], haven: [4, 4], blocks: {} },
    { name: 'H2 intermediate tree refuses d=3 jump', from: [0, 2], to: [3, 2], haven: [4, 2], blocks: { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } } },
    { name: 'H3 destination tree refuses', from: [4, 1], to: [4, 4], haven: [4, 4], blocks: { '4,4': { dx: 0, dy: -1, type: 'fallen_tree' } } },
    { name: 'H4 diagonal intermediate tree refuses', from: [0, 0], to: [2, 1], haven: [2, 2], blocks: { '1,1': { dx: -1, dy: 0, type: 'fallen_tree' } } },
    { name: 'H5 creek intermediate refuses', from: [0, 2], to: [3, 2], haven: [4, 2], blocks: { '2,2': { type: 'creek' } } },
    { name: 'H6 side-guard miss does NOT refuse (tree guards the far side)', from: [0, 2], to: [3, 2], haven: [4, 2], blocks: { '2,2': { dx: 1, dy: 0, type: 'fallen_tree' } } },
    { name: 'H7 single rubble refuses the raw hop (credit is a sim layer, not the engine)', from: [0, 2], to: [3, 2], haven: [4, 2], blocks: { '2,2': { dx: -1, dy: 0, type: 'rubble' } } },
  ];
  for (const c of hopBattery) {
    const Game = await freshGame(4242);
    setHaven(Game, c.haven[0], c.haven[1]);
    setBlocks(Game, c.blocks);
    Game.map.px = c.from[0]; Game.map.py = c.from[1];
    const chk = checkHop(Game, c.from[0], c.from[1], c.to[0], c.to[1]);
    const before = { x: Game.map.px, y: Game.map.py };
    let res = null;
    try { res = Game.travelTo(c.to[0], c.to[1]); } catch (e) { res = { error: e.message }; }
    const moved = Game.map.px !== before.x || Game.map.py !== before.y;
    const predicted = chk.blockers.length === 0;
    hopCases++;
    if (predicted && !moved) falseOpens++;
    if (!predicted && moved) falseCloses++;
    report(c.name + ' (predicted-pass=' + predicted + ' moved=' + moved + ')',
      predicted === moved, { chk, res, moved });
  }
  // Walk-level battery: no-credit sim vs real walkTo reached-home.
  const walkBattery = [
    { name: 'W1 clean walk', start: [4, 1], haven: [4, 4], blocks: {} },
    { name: 'W2 intermediate tree pockets the walk', start: [0, 2], haven: [4, 2], blocks: { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } } },
    { name: 'W3 diagonal intermediate tree pockets the walk', start: [0, 0], haven: [2, 2], blocks: { '1,1': { dx: -1, dy: 0, type: 'fallen_tree' } } },
    { name: 'W4 creek intermediate pockets the walk', start: [0, 2], haven: [4, 2], blocks: { '2,2': { type: 'creek' } } },
    { name: 'W5 far-side tree does not pocket', start: [0, 2], haven: [4, 2], blocks: { '2,2': { dx: 1, dy: 0, type: 'fallen_tree' } } },
    { name: 'W6 two-step pocket (tree on the second leg)', start: [1, 1], haven: [4, 4], blocks: { '4,3': { dx: 0, dy: -1, type: 'fallen_tree' } } },
  ];
  for (const c of walkBattery) {
    const Game = await freshGame(4242);
    setHaven(Game, c.haven[0], c.haven[1]);
    setBlocks(Game, c.blocks);
    Game.map.px = c.start[0]; Game.map.py = c.start[1];
    const sim = simulateReturnJump(Game, c.start[0], c.start[1], c.haven[0], c.haven[1], { credit: 0 });
    walkTo(Game, c.haven[0], c.haven[1]);
    const reached = Game.map.px === c.haven[0] && Game.map.py === c.haven[1];
    walkCases++;
    if (sim.ok && !reached) falseOpens++;
    if (!sim.ok && reached) falseCloses++;
    report(c.name + ' (sim-ok=' + sim.ok + ' reached=' + reached + ')',
      sim.ok === reached, { sim, reached, end: { x: Game.map.px, y: Game.map.py } });
  }

  // Live lateral cases: same tree pocket, with / without a stocked lateral tile.
  {
    const Game = await freshGame(4242);
    setHaven(Game, 4, 2);
    setBlocks(Game, { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
    Game.tileAt(0, 5).stock = 50;
    const direct = simulateReturnJump(Game, 0, 2, 4, 2, { credit: 0 });
    const esc = escapeCheck(Game, 0, 2, 4, 2);
    report('LIVE-L1 stocked lateral tile: direct fails, escape passes via lateral',
      direct.ok === false && esc.ok === true && esc.via === 'lateral', { direct, esc });
  }
  {
    const Game = await freshGame(4242);
    setHaven(Game, 4, 2);
    setBlocks(Game, { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } });
    // Hermetic for stock too: the live board regrows natural stock, so
    // zero every tile — otherwise some stocked tile always offers a
    // lateral step and this is not a pocket at all.
    for (const row of Game.map.tiles) for (const t of row) t.stock = 0;
    const esc = escapeCheck(Game, 0, 2, 4, 2);
    report('LIVE-L2 unstocked lateral ground: escape fails (true pocket)',
      esc.ok === false, { esc });
  }
  // Credit-1 designed divergence: single rubble, sim ok on credit,
  // real walkTo fails (the credit models future roadwork, not the engine).
  {
    const Game = await freshGame(4242);
    setHaven(Game, 4, 2);
    setBlocks(Game, { '2,2': { dx: -1, dy: 0, type: 'rubble' } });
    Game.map.px = 0; Game.map.py = 2;
    const sim = simulateReturnJump(Game, 0, 2, 4, 2);
    walkTo(Game, 4, 2);
    const reached = Game.map.px === 4 && Game.map.py === 2;
    report('W7 credit-1 divergence is exactly as designed (sim ok on 1 credit, real walk fails)',
      sim.ok === true && sim.creditUsed === 1 && reached === false, { sim, reached });
  }
  console.log('CENSUS: hopCases=' + hopCases + ' walkCases=' + walkCases +
    ' falseOpens=' + falseOpens + ' falseCloses=' + falseCloses);
  assert.strictEqual(falseOpens, 0, 'census false opens must be 0');
  assert.strictEqual(falseCloses, 0, 'census false closes must be 0');
  passed++;
  console.log('ok - census agreement 100% (no-credit core vs real walkTo/travelTo)');
}

liveBattery().then(() => {
  console.log('PASS ' + passed + ' checks');
}).catch((e) => {
  console.error('FAIL: ' + (e && (e.stack || e)));
  process.exit(1);
});
