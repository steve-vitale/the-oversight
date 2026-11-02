#!/usr/bin/env node
// test-falseclose-b.js — proof test for the arrival-conditioned
// false-close proxy (sim-falseclose-b).
//
// Part 1: analyzer cases on fixture corpora (no game needed).
//   F1 the 61802 day-14 shape (engine-refused, new driver): baseline
//      attempts (4,4)->(4,6) 3x with arrived=false, forages elsewhere,
//      day-end home; armed vetoes 3x -> OLD 3, NEW 0.
//   F2 the same shape on LEGACY corpora (no `arrived` field at all):
//      forages (4,3),(3,4),(5,4), day-end home -> OLD 3, NEW 0.
//   F3 true close via the authoritative field: baseline hop
//      arrived=true, day-end home, armed veto -> OLD 1, NEW 1.
//   F4 legacy fallback classes, each counted: forage-at-dest,
//      later-departure-from-dest, day-end-at-dest (direct unit check
//      of arrivalEvidence for the last — see note below).
//   F5 gates still enforced: arrived but baseline day-end away -> 0/0;
//      baseline never attempted the hop -> 0/0.
// Part 2: fake-game guard cases proving the `arrived` field's semantics
//   on the ported policy (installGuard + the policy's own checkHop as
//   the fake engine's refusal rule, so refusal means what the guard
//   means by refusal).
//   G1 engine-accepted hop -> arrived true.
//   G2 engine-refused hop in shadow mode -> arrived false (the 61802
//      shape: attempted, refused, scholar unmoved).
//   G3 vetoed hop -> arrived false, vetoed true, orig never called.
//
// NOTE on fallback class (d) day-end-at-dest: through the gated counter
// it is unreachable in practice — a vetoed hop's destination is never
// haven (homeward hops bypass the guard entirely), and the day-end-home
// gate requires day-end == haven, so day-end == dest would require
// dest == haven. The class is kept in arrivalEvidence as defense in
// depth and unit-tested directly; it is never needed for a counted hop.
//
// Exits 1 on any failure. Usage: node scripts/test-falseclose-b.js
'use strict';
const assert = require('assert');
const { arrivalEvidence, countFalseCloses, foragesIdentical } = require('./analyze-falseclose-b');
const { installGuard, checkHop } = require('./policies/competent-latescape-b');

let passed = 0;
function check(name, cond, extra) {
  assert.ok(cond, name + (extra ? ' :: ' + JSON.stringify(extra) : ''));
  passed++;
  console.log('ok - ' + name);
}

function day(loopDay, hops, forages, endPos, haven) {
  return { loopDay, hops, forages: forages || [],
    end: { pos: endPos, haven: haven || { x: 4, y: 4 } } };
}
function hop(from, to, extra) {
  return Object.assign({ from, to, vetoed: false, shadow: true }, extra || {});
}
function vetoedHop(from, to) {
  return { from, to, vetoed: true, silent: false, shadow: false };
}
const H = { x: 4, y: 4 };

// ---------- Part 1: analyzer fixtures ----------
{
  // F1: 61802 day-14 shape, new driver (arrived=false recorded).
  const base = { seed: 61802, days: [day(14,
    [hop(H, { x: 4, y: 6 }, { arrived: false }),
     hop(H, { x: 4, y: 6 }, { arrived: false }),
     hop(H, { x: 4, y: 6 }, { arrived: false })],
    [{ pos: { x: 4, y: 3 }, ok: true }, { pos: { x: 3, y: 4 }, ok: true }, { pos: { x: 5, y: 4 }, ok: true }],
    H)] };
  const armed = { seed: 61802, days: [day(14,
    [vetoedHop(H, { x: 4, y: 6 }), vetoedHop(H, { x: 4, y: 6 }), vetoedHop(H, { x: 4, y: 6 })],
    [], H)] };
  const r = countFalseCloses(base, armed);
  check('F1 refused hops: old 3', r.old.length === 3, r);
  check('F1 refused hops: new 0', r.counted.length === 0, r);
  check('F1 refused hops: dropped 3 with reason', r.dropped.length === 3 &&
    r.dropped.every((e) => e.reason === 'no-arrival-evidence'), r);
}
{
  // F2: same shape, legacy corpora (no arrived field anywhere).
  const base = { seed: 61802, days: [day(14,
    [hop(H, { x: 4, y: 6 }), hop(H, { x: 4, y: 6 }), hop(H, { x: 4, y: 6 })],
    [{ pos: { x: 4, y: 3 }, ok: true }, { pos: { x: 3, y: 4 }, ok: true }, { pos: { x: 5, y: 4 }, ok: true }],
    H)] };
  const armed = { seed: 61802, days: [day(14,
    [vetoedHop(H, { x: 4, y: 6 }), vetoedHop(H, { x: 4, y: 6 }), vetoedHop(H, { x: 4, y: 6 })],
    [], H)] };
  const r = countFalseCloses(base, armed);
  check('F2 legacy refused hops: old 3, new 0', r.old.length === 3 && r.counted.length === 0, r);
}
{
  // F3: true close via the authoritative field.
  const base = { seed: 99901, days: [day(3,
    [hop(H, { x: 4, y: 6 }, { arrived: true })],
    [{ pos: { x: 4, y: 6 }, ok: true }], H)] };
  const armed = { seed: 99901, days: [day(3, [vetoedHop(H, { x: 4, y: 6 })], [], H)] };
  const r = countFalseCloses(base, armed);
  check('F3 true close: old 1, new 1, evidence arrived-field',
    r.old.length === 1 && r.counted.length === 1 && r.counted[0].evidence === 'arrived-field', r);
}
{
  // F4a: legacy fallback forage-at-dest counts.
  const base = { seed: 99902, days: [day(3,
    [hop(H, { x: 4, y: 6 })],
    [{ pos: { x: 4, y: 6 }, ok: false }], H)] };
  const armed = { seed: 99902, days: [day(3, [vetoedHop(H, { x: 4, y: 6 })], [], H)] };
  const r = countFalseCloses(base, armed);
  check('F4a forage-at-dest counts', r.counted.length === 1 && r.counted[0].evidence === 'forage-at-dest', r);
}
{
  // F4b: legacy fallback later-departure counts (scholar left dest on a later hop).
  const base = { seed: 99903, days: [day(3,
    [hop(H, { x: 4, y: 6 }), hop({ x: 4, y: 6 }, { x: 4, y: 5 })],
    [], H)] };
  const armed = { seed: 99903, days: [day(3, [vetoedHop(H, { x: 4, y: 6 })], [], H)] };
  const r = countFalseCloses(base, armed);
  check('F4b later-departure counts', r.counted.length === 1 && r.counted[0].evidence === 'later-departure-from-dest', r);
}
{
  // F4c: day-end-at-dest class exists (direct unit check; gated path
  // unreachable per the file header note, so tested on arrivalEvidence).
  const bd = day(3, [hop(H, { x: 4, y: 6 })], [], { x: 4, y: 6 });
  check('F4c day-end-at-dest class', arrivalEvidence(bd, hop(H, { x: 4, y: 6 })) === 'day-end-at-dest');
}
{
  // F5a: arrived but baseline day-end away -> gated out of both proxies.
  const base = { seed: 99904, days: [day(3,
    [hop(H, { x: 4, y: 6 }, { arrived: true })], [], { x: 4, y: 6 })] };
  const armed = { seed: 99904, days: [day(3, [vetoedHop(H, { x: 4, y: 6 })], [], { x: 4, y: 6 })] };
  const r = countFalseCloses(base, armed);
  check('F5a day-end-away gates both proxies out', r.old.length === 0 && r.counted.length === 0, r);
}
{
  // F5b: baseline never attempted the hop -> 0/0.
  const base = { seed: 99905, days: [day(3, [hop(H, { x: 4, y: 3 })], [], H)] };
  const armed = { seed: 99905, days: [day(3, [vetoedHop(H, { x: 4, y: 6 })], [], H)] };
  const r = countFalseCloses(base, armed);
  check('F5b never-attempted hop: 0/0', r.old.length === 0 && r.counted.length === 0, r);
}
{
  // F6: forage identity helper — identical lists pass, any diff fails.
  const mk = (forages) => ({ seed: 1, days: [day(1, [], forages, H)] });
  const f = [{ pos: H, ok: true, added: [{ key: 'x', units: 2 }], addedLump: [] }];
  check('F6 forages identical', foragesIdentical(mk(f), mk(f)).identical);
  const f2 = [{ pos: { x: 4, y: 3 }, ok: true, added: [{ key: 'x', units: 2 }], addedLump: [] }];
  check('F6 forages differ detected', !foragesIdentical(mk(f), mk(f2)).identical);
}

// ---------- Part 2: fake-game arrived semantics ----------
function fakeGame(blocks) {
  const tiles = [];
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) row.push({ x, y, revealed: true, type: 'grass', stock: 0 });
    tiles.push(row);
  }
  for (const [k, v] of Object.entries(blocks || {})) {
    const [x, y] = k.split(',').map(Number);
    tiles[y][x].blockFrom = v;
  }
  const G = {
    map: { px: 4, py: 4, tiles },
    state: { village: { px: 4, py: 4 } },
    said: [],
    say(s) { this.said.push(s); },
    inCombat: () => false,
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
      return null;
    },
    travelCalls: [],
    // Engine-faithful refusal: the policy's own checkHop decides.
    travelTo(x, y) {
      this.travelCalls.push([x, y]);
      const chk = checkHop(this, this.map.px, this.map.py, x, y);
      if (chk.blockers.length) return chk.blockers[0];
      this.map.px = x; this.map.py = y;
      return { moved: true };
    },
  };
  return G;
}
{
  // G1: clean board, outward hop the engine accepts -> arrived true.
  const G = fakeGame({});
  const ctx = {};
  const restore = installGuard(G, ctx);
  const res = G.travelTo(4, 1);
  restore();
  check('G1 accepted hop: moved + arrived true',
    res.moved === true && G.map.px === 4 && G.map.py === 1 &&
    ctx.latescapeHopLog.length === 1 && ctx.latescapeHopLog[0].arrived === true, ctx.latescapeHopLog);
}
{
  // G2: (4,5) tree guards the southward entry, so the (4,4)->(4,6)
  // jump is engine-refused; in shadow mode the guard still calls orig,
  // orig refuses, scholar unmoved -> arrived false (the 61802 shape).
  const G = fakeGame({ '4,5': { dx: 0, dy: -1, type: 'fallen_tree' } });
  const ctx = {};
  const restore = installGuard(G, ctx, { shadow: true });
  const res = G.travelTo(4, 6);
  restore();
  check('G2 refused shadow hop: unmoved + arrived false + not vetoed',
    G.map.px === 4 && G.map.py === 4 && (ctx.latescapeVetoes || 0) === 0 &&
    ctx.latescapeHopLog.length === 1 && ctx.latescapeHopLog[0].arrived === false,
    { res, log: ctx.latescapeHopLog });
}
{
  // G3: veto mode -> vetoed, orig never called, arrived false. The block
  // here faces the RETURN sim (northward entry into (4,5) from (4,6)),
  // so escapeCheck from (4,6) home fails and the guard vetoes; G2's
  // block faced the outward hop instead (shadow calls orig regardless,
  // so G2 tests the engine refusal itself).
  const G = fakeGame({ '4,5': { dx: 0, dy: 1, type: 'fallen_tree' } });
  const ctx = {};
  const restore = installGuard(G, ctx);
  G.travelTo(4, 6);
  restore();
  check('G3 vetoed hop: orig never called + vetoed + arrived false',
    G.travelCalls.length === 0 && ctx.latescapeVetoes === 1 &&
    ctx.latescapeHopLog.length === 1 && ctx.latescapeHopLog[0].vetoed === true &&
    ctx.latescapeHopLog[0].arrived === false, ctx);
}

console.log('test-falseclose-b: ' + passed + ' checks passed');
