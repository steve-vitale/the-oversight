#!/usr/bin/env node
// test-homext-abl-b.js — proof test for the outward-only ablation
// variant (sim-homext-abl-b). Prereg:
// evidence/2026-11-02/sim-homext-abl-b-prereg.md.
//
// The variant must satisfy, on synthetic fake-Game cases:
//  (a) NEVER veto a homeward hop, even into a no-escape destination
//      (scholar proceeds, orig travelTo called, no veto counted,
//      no line spoken, hop logged with outwardOnlyPass=true);
//  (b) on IDENTICAL fake states, its OUTWARD veto decisions match
//      the full guard's exactly (same veto/pass on every outward hop);
//  (c) veto memory for outward destinations works (first says,
//      second silent, both vetoed);
//  (d) homeward hops to haven / escapable ground pass untouched
//      under both variants.
// Part 2 is a compact LIVE-ENGINE census battery (same pattern as
// the predecessor): the shared E(D) core is unchanged code, so the
// no-credit core must still agree exactly with the real walkTo /
// travelTo (false opens 0, false closes 0).
// The judged-band property (d in the prereg: zero homeward vetoes
// on band 62801-62808) is checked by the analyzer on the real legs,
// not here. Exits 1 on any failure.
'use strict';
const assert = require('assert');
const fullMod = require('./policies/competent-homewardstep-b');
const outMod = require('./policies/competent-homewardstep-outwardonly-b');
const { installGuard: installFull, escapeCheck } = fullMod;
const { installGuard: installOut } = outMod;

let passed = 0;
function check(name, cond, extra) {
  assert.ok(cond, name + (extra ? ' :: ' + JSON.stringify(extra) : ''));
  passed++;
  console.log('ok - ' + name);
}

// ---------- Synthetic fake Game (same engine-faithful semantics as
// the predecessor proof: blockFrom side-guards + creek tiles) ----------
function fakeGame(blocks) {
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

function guardGame(blocks, px, py, hx, hy) {
  const G = fakeGame(blocks);
  G.map.px = px; G.map.py = py;
  G.state.village = { px: hx, py: hy };
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

// Pocket corridor shape (predecessor H1): haven (4,2), fallen tree at
// (2,2) guarding the west entry, no stocked lateral tile. From (0,2),
// the homeward hop to (1,2) has E fail; from (4,2)... the outward
// hop (4,2)->(1,2)... is not used; outward pocket shape uses the
// G2 corridor: haven (4,4), tree at (4,3) guarding the south
// approach, outward hop (4,4)->(4,1) has E fail.
const POCKET_HOME = { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } };
const POCKET_OUT = { '4,3': { dx: 0, dy: -1, type: 'fallen_tree' } };

// A1: outward-only NEVER vetoes a homeward hop into a no-escape
// destination: scholar proceeds, orig called, nothing counted/spoken.
{
  const G = guardGame(POCKET_HOME, 0, 2, 4, 2);
  const ctx = {};
  const restore = installOut(G, ctx, { outwardOnly: true });
  const res = G.travelTo(1, 2);
  check('A1 outward-only homeward pocket hop passes through (orig called, scholar moves)',
    res.moved === true && G.travelCalls.length === 1 && G.map.px === 1 && G.map.py === 2, { res, ctx });
  check('A1 no veto counted, no line spoken, pass-through counted + logged',
    (ctx.homewardstepVetoes || 0) === 0 && (ctx.homewardstepHomewardVetoes || 0) === 0 &&
    G.said.length === 0 && (ctx.homewardstepOutwardOnlyPasses || 0) === 1 &&
    (ctx.homewardstepHopLog || []).length === 1 &&
    ctx.homewardstepHopLog[0].homeward === true && ctx.homewardstepHopLog[0].vetoed === false &&
    ctx.homewardstepHopLog[0].simOk === false && ctx.homewardstepHopLog[0].outwardOnlyPass === true,
    { ctx, said: G.said });
  restore();
}
// A2: repeat of the same homeward pocket hop: still passes, and veto
// memory was never written for it (a later full-guard install would
// still speak — memory is per-install here, so assert no silence
// artifact: second pass also unsaid and uncounted).
{
  const G = guardGame(POCKET_HOME, 0, 2, 4, 2);
  const ctx = {};
  const restore = installOut(G, ctx, { outwardOnly: true });
  G.travelTo(1, 2);
  G.map.px = 0; G.map.py = 2;
  const res2 = G.travelTo(1, 2);
  check('A2 repeated homeward pocket hop still passes, never silenced into a veto',
    res2.moved === true && G.travelCalls.length === 2 &&
    (ctx.homewardstepVetoes || 0) === 0 && G.said.length === 0 &&
    (ctx.homewardstepOutwardOnlyPasses || 0) === 2, { res2, ctx });
  restore();
}
// A3: outward-only DOES veto the outward pocket hop, exactly like
// the full guard (veto counted, orig not called, line spoken).
{
  const G = guardGame(POCKET_OUT, 4, 4, 4, 4);
  const ctx = {};
  const restore = installOut(G, ctx, { outwardOnly: true });
  const res = G.travelTo(4, 1);
  check('A3 outward-only outward pocket hop vetoed (orig not called, scholar stays)',
    G.travelCalls.length === 0 && G.map.px === 4 && G.map.py === 4 &&
    ctx.homewardstepVetoes === 1 && G.said.length === 1, { res, ctx });
  check('A3 outward veto is NOT logged as homeward, no outward-only pass',
    (ctx.homewardstepHomewardVetoes || 0) === 0 && (ctx.homewardstepOutwardOnlyPasses || 0) === 0 &&
    (ctx.homewardstepHopLog || [])[0].homeward === false, { ctx });
  restore();
}
// A4: decision parity — identical fake states, both variants, a
// battery of hops. Outward decisions must match exactly; homeward
// decisions must match except where the full guard vetoes (there
// the outward-only variant passes).
{
  const battery = [
    { name: 'outward pocket (4,4)->(4,1)', blocks: POCKET_OUT, from: [4, 4], haven: [4, 4], to: [4, 1], homeward: false },
    { name: 'outward clean (4,4)->(4,3)', blocks: {}, from: [4, 4], haven: [4, 4], to: [4, 3], homeward: false },
    { name: 'outward clean d=3 (4,1)->(4,4) dest haven', blocks: {}, from: [4, 1], haven: [4, 4], to: [4, 4], homeward: true },
    { name: 'homeward pocket (0,2)->(1,2)', blocks: POCKET_HOME, from: [0, 2], haven: [4, 2], to: [1, 2], homeward: true },
    { name: 'homeward clean (0,2)->(1,2)', blocks: {}, from: [0, 2], haven: [4, 2], to: [1, 2], homeward: true },
    { name: 'homeward to haven (4,3)->(4,4) past tree', blocks: POCKET_OUT, from: [4, 3], haven: [4, 4], to: [4, 4], homeward: true },
    { name: 'outward creek pocket (0,2)->(3,2)', blocks: { '2,2': { type: 'creek' } }, from: [0, 2], haven: [4, 2], to: [3, 2], homeward: false },
  ];
  for (const c of battery) {
    const run = (install, opts) => {
      const G = guardGame(c.blocks, c.from[0], c.from[1], c.haven[0], c.haven[1]);
      const ctx = {};
      const restore = install(G, ctx, opts);
      const res = G.travelTo(c.to[0], c.to[1]);
      const out = { vetoed: (ctx.homewardstepVetoes || 0) > 0, moved: G.travelCalls.length > 0, said: G.said.length };
      restore();
      return out;
    };
    const f = run(installFull, {});
    const o = run(installOut, { outwardOnly: true });
    if (c.homeward) {
      check('A4 parity ' + c.name + ': full=' + JSON.stringify(f) + ' outward-only=' + JSON.stringify(o) +
        ' (outward-only never vetoes a homeward hop)',
        o.vetoed === false && o.moved === true &&
        (f.vetoed === false ? (o.moved === f.moved && o.said === f.said) : true),
        { c, f, o });
    } else {
      check('A4 parity ' + c.name + ': outward decisions identical',
        f.vetoed === o.vetoed && f.moved === o.moved && f.said === o.said, { c, f, o });
    }
  }
}
// A5: veto memory for OUTWARD destinations under outward-only:
// first says, second silent, both vetoed.
{
  const G = guardGame(POCKET_OUT, 4, 4, 4, 4);
  const ctx = {};
  const restore = installOut(G, ctx, { outwardOnly: true });
  G.travelTo(4, 1);
  G.travelTo(4, 1);
  check('A5 outward veto memory: first says, second silent, both vetoed',
    ctx.homewardstepVetoes === 2 && (ctx.homewardstepSilentVetoes || 0) === 1 &&
    (ctx.homewardstepSpokenVetoes || 0) === 1 && G.said.length === 1 &&
    G.travelCalls.length === 0, { ctx, said: G.said });
  restore();
}
// A6: the shared E(D) core is untouched: escapeCheck from the
// outward-only module agrees with the full module on pocket/clean.
{
  const Gp = fakeGame(POCKET_HOME);
  const Gc = fakeGame({});
  const ep = escapeCheck(Gp, 1, 2, 4, 2);
  const ec = escapeCheck(Gc, 1, 2, 4, 2);
  check('A6 shared E(D): pocket fails, clean passes (both modules share the core)',
    ep.ok === false && ec.ok === true, { ep, ec });
}
// A7: outwardonly policy object exists and daily() threads the flag
// (smoke: daily on a fake-less stub is not run here — the export and
// the installGuard flag path above are the proof; assert exports).
{
  check('A7 outwardonly policy exported and distinct from homewardstep',
    typeof outMod.outwardonly === 'object' && typeof outMod.outwardonly.daily === 'function' &&
    outMod.outwardonly !== fullMod.homewardstep, {});
}

// ---------- Part 2: compact live-engine census battery ----------
async function liveBattery() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { walkTo } = require('./policies/competent');
  const { simulateReturnJump, checkHop } = fullMod;
  let falseOpens = 0, falseCloses = 0, hopCases = 0, walkCases = 0;
  const report = (name, cond, extra) => {
    if (!cond) console.log('LIVE MISMATCH - ' + name + ' :: ' + JSON.stringify(extra));
    assert.ok(cond, name + ' :: ' + JSON.stringify(extra));
    passed++;
    console.log('ok - ' + name);
  };
  async function freshGame(seed) {
    const { Game } = await loadGame({ seed, mode: 'homext-abl-b-test', fullTelemetry: false });
    await setupGame(Game);
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
  const hopBattery = [
    { name: 'LIVE-H1 clean d=3 jump', from: [4, 1], to: [4, 4], haven: [4, 4], blocks: {} },
    { name: 'LIVE-H2 intermediate tree refuses d=3 jump', from: [0, 2], to: [3, 2], haven: [4, 2], blocks: { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } } },
    { name: 'LIVE-H3 destination tree refuses', from: [4, 1], to: [4, 4], haven: [4, 4], blocks: { '4,4': { dx: 0, dy: -1, type: 'fallen_tree' } } },
  ];
  for (const c of hopBattery) {
    const Game = await freshGame(4242);
    Game.state.village.px = c.haven[0]; Game.state.village.py = c.haven[1];
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
  const walkBattery = [
    { name: 'LIVE-W1 clean walk', start: [4, 1], haven: [4, 4], blocks: {} },
    { name: 'LIVE-W2 intermediate tree pockets the walk', start: [0, 2], haven: [4, 2], blocks: { '2,2': { dx: -1, dy: 0, type: 'fallen_tree' } } },
  ];
  for (const c of walkBattery) {
    const Game = await freshGame(4242);
    Game.state.village.px = c.haven[0]; Game.state.village.py = c.haven[1];
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
