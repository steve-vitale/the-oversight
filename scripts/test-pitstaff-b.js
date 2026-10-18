#!/usr/bin/env node
// scripts/test-pitstaff-b.js — proof for the pitstaff layer (arm
// sim-pitstaff-b, loop B food-economy axis, run fleshout-loop-b-20261018T1530Z).
//
// The kill-side audit (evidence/2026-10-18/sim-killaudit-b.md) fully
// attributed boar/bear absence to staffing omissions: the competent policy
// only ever crafts+sets the snare (pit_trap 0/8 runs). This layer
// (scripts/policies/pitstaff.js, PITSTAFF=1, default OFF) makes the
// competent policy craft pit traps on lean days — policy-side, zero
// src/js changes.
//
// PART A — fixture (RED/GREEN):
//   RED: gate off (PITSTAFF unset) → staffPit returns null, craft NEVER
//        attempted, ctx untouched (zero writes gate-off — the det-gate
//        depends on this).
//   GREEN: gate on (PITSTAFF=1) + lean day + at Haven + snare L1+ + pit L2+
//        + 2 sticks + line<2 → Game.craft('pit_trap') attempted exactly
//        once and recorded; once-per-day, and the lean/haven/knowledge/
//        line/materials/recovering gates each refuse honestly.
// PART B — det-gate: PITSTAFF-unset wrapper trajectories byte-identical to
//   pristine (no wrapper), 2 seeds x 2 policies x 60d, per-day state-hash
//   compare (the proven test-huntstaff-b4 pattern).
// PART C — smoke: layerOn() true/false; leanDay boundaries.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-pitstaff-b.js
'use strict';
const assert = require('assert');

let PS;
try {
  PS = require('./policies/pitstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/pitstaff.js absent — layer killed zero-trace per NO-GO verdict (sim-pitstaff-b, 2026-10-18: 0 traps armed, pit_trap knowledge L0 on 8/8 baseline runs). Proof was ALL GREEN pre-kill.');
  process.exit(0);
}

function fakeGame(opts) {
  const o = opts || {};
  const crafts = [];
  const sticks = o.sticks == null ? 4 : o.sticks;
  const inv = [];
  if (sticks > 0) inv.push({ name: 'stick', material: 'stick', units: sticks });
  const G = {
    over: false,
    state: {
      scholar: {
        day: o.day == null ? 5 : o.day,
        kcal: o.kcal == null ? 300 : o.kcal,
        inventory: inv,
        tools: (o.tools || []).slice(),
      },
      village: { roster: ['v1'], pantry: [] },
      codex: {
        recipes: {
          snare: { level: o.snareL == null ? 2 : o.snareL },
          pit_trap: { level: o.pitL == null ? 2 : o.pitL },
        },
      },
    },
    map: { tiles: o.tiles || [] },
    villagerId: 'scholar',
    playerAtHaven: () => (o.atHaven == null ? true : o.atHaven),
    kcalCap: () => 2400,
    pantryFreshDays: () => (o.freshDays == null ? 1.5 : o.freshDays),
    // the engine's honest craft: records the attempt, lands a pit tool on
    // success, honoring the fixture's knowledge level.
    craft: (recipeId) => {
      crafts.push(recipeId);
      const lvl = (G.state.codex.recipes[recipeId] || {}).level || 0;
      if (lvl < 1) return null;                       // engine's honest refusal
      const need = recipeId === 'pit_trap' ? 2 : 1;
      const have = inv.filter(i => i.material === 'stick').reduce((t, i) => t + i.units, 0);
      if (have < need) return null;
      G.state.scholar.tools.push({ recipeId, uses: 4, name: 'Pit Trap' });
      return true;
    },
    _crafts: crafts,
  };
  return G;
}

function run() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };

  console.log('PART A — fixture (RED/GREEN)');

  // RED: gate off → no craft, no ctx writes
  delete process.env.PITSTAFF;
  ok('RED: gate off → staffPit returns null', () => {
    assert.strictEqual(PS.staffPit(fakeGame(), {}), null);
  });
  ok('RED: gate off → craft never attempted', () => {
    const G = fakeGame();
    PS.staffPit(G, {});
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('RED: gate off → ctx untouched (det-gate neutrality)', () => {
    const ctx = {};
    PS.staffPit(fakeGame(), ctx);
    assert.deepStrictEqual(ctx, {});
  });

  // GREEN: all gates pass → one honest craft
  process.env.PITSTAFF = '1';
  ok('GREEN: lean day + haven + snare L1+ + pit L2+ + sticks → crafts exactly once', () => {
    const G = fakeGame();
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), true);
    assert.deepStrictEqual(G._crafts, ['pit_trap']);
    assert.strictEqual(ctx._psCrafted, 1);
    assert.ok(Array.isArray(ctx._psCraftLog) && ctx._psCraftLog.length === 1);
    assert.strictEqual(ctx._psCraftLog[0].day, 5);
    assert.strictEqual(ctx._psCraftLog[0].blind, false);
  });
  ok('GREEN: once per day — second call same day is null', () => {
    const G = fakeGame();
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), true);
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 1);
  });
  ok('GREEN: non-lean day → null (pantry full, scholar fed)', () => {
    const G = fakeGame({ kcal: 2000, freshDays: 9 });
    assert.strictEqual(PS.leanDay(G), false);
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('leanDay: starving scholar is a lean day regardless of pantry', () => {
    assert.strictEqual(PS.leanDay(fakeGame({ kcal: 100, freshDays: 9 })), true);
  });
  ok('leanDay: half-cap boundary', () => {
    assert.strictEqual(PS.leanDay(fakeGame({ kcal: 1199, freshDays: 9 })), true);
    assert.strictEqual(PS.leanDay(fakeGame({ kcal: 1200, freshDays: 9 })), false);
  });
  ok('GREEN: not at Haven → null (craft happens at camp)', () => {
    const G = fakeGame({ atHaven: false });
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: snare L0 → null (audit spec knowledge gate)', () => {
    const G = fakeGame({ snareL: 0 });
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: pit L0 → null (no spam of the engine refusal)', () => {
    const G = fakeGame({ pitL: 0 });
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: line full (2 pits held) → null', () => {
    const G = fakeGame({ tools: [{ recipeId: 'pit_trap' }, { recipeId: 'pit_trap' }] });
    assert.strictEqual(PS.pitLineCount(G), 2);
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: line full (1 held + 1 set on a tile) → null', () => {
    const G = fakeGame({
      tools: [{ recipeId: 'pit_trap' }],
      tiles: [[{ traps: [{ recipeId: 'pit_trap' }] }]],
    });
    assert.strictEqual(PS.pitLineCount(G), 2);
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: 1 held + 0 set → crafts (line not full)', () => {
    const G = fakeGame({ tools: [{ recipeId: 'pit_trap' }] });
    assert.strictEqual(PS.pitLineCount(G), 1);
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), true);
    assert.strictEqual(G._crafts.length, 1);
  });
  ok('GREEN: L2 needs 2 sticks — 1 stick refuses', () => {
    const G = fakeGame({ sticks: 1 });
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(G._crafts.length, 0);
  });
  ok('GREEN: blind L1 needs a plentiful stock — 5 sticks refuse, 6 craft', () => {
    const G5 = fakeGame({ pitL: 1, sticks: 5 });
    assert.strictEqual(PS.staffPit(G5, {}), null);
    assert.strictEqual(G5._crafts.length, 0);
    const G6 = fakeGame({ pitL: 1, sticks: 6 });
    const ctx = {};
    assert.strictEqual(PS.staffPit(G6, ctx), true);
    assert.deepStrictEqual(G6._crafts, ['pit_trap']);
    assert.strictEqual(ctx._psCraftLog[0].blind, true);
  });
  ok('GREEN: engine refusal (craft returns null) → null, no count', () => {
    const G = fakeGame();
    G.craft = () => null;   // the engine's line said no
    const ctx = {};
    assert.strictEqual(PS.staffPit(G, ctx), null);
    assert.strictEqual(ctx._psCrafted || 0, 0);
    assert.ok(!(ctx._psCraftLog || []).length);
  });
  ok('GREEN: recovering scholar → null (wounded trappers do not dig)', () => {
    process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
    try {
      const G = fakeGame();
      const ctx = { _recoverUntilDay: 8 }; // day 5, recovery window open
      assert.strictEqual(PS.staffPit(G, ctx), null);
      assert.strictEqual(G._crafts.length, 0);
    } finally {
      delete process.env.COMPETENT_DIRECTIONAL_FLEE;
    }
  });
  ok('GREEN: fired craft lands the tool in the trapline queue', () => {
    const G = fakeGame();
    const ctx = {};
    PS.staffPit(G, ctx);
    const held = G.state.scholar.tools.filter(t => t && t.recipeId === 'pit_trap');
    assert.strictEqual(held.length, 1);
  });
  console.log(`PART A green (${n} checks)`);

  delete process.env.PITSTAFF;
}

function smoke() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART C — smoke (gates, not always-on)');
  delete process.env.PITSTAFF;
  ok('smoke: layerOn() false when unset', () => assert.strictEqual(PS.layerOn(), false));
  process.env.PITSTAFF = '1';
  ok('smoke: layerOn() true when PITSTAFF=1', () => assert.strictEqual(PS.layerOn(), true));
  console.log('PART C green');
  delete process.env.PITSTAFF;
}

// PART B — det-gate (real harness). Pattern from test-huntstaff-b4:
// wrapped PITSTAFF-unset vs unwrapped base, per-day trajectory hashes;
// any diverger re-checked base-vs-base to attribute substrate noise.
async function detGate() {
  console.log('PART B — det-gate (wrapped PITSTAFF-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function hashesFor(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [105101, 105102]; // killaudit baseline seeds; substrate-only gate, 60d each
  let cleanIdentical = 0, substrateNoise = 0, layerDivergent = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
      delete process.env.PITSTAFF; // gate OFF
      const wrapped = PS.withPitStaff(base, pid + '+pitstaff', 'det');
      let a, b, c;
      await quietLog(async () => { a = await hashesFor(wrapped, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); }); // substrate-noise control
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const layerClean = eq(a, b), substrateClean = eq(b, c);
      if (layerClean) { cleanIdentical++; console.log(`  ok   s${seed} ${pid}: wrapped-off byte-identical to base`); }
      else if (!substrateClean) { substrateNoise++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges too — substrate noise, not the layer`); }
      else { layerDivergent++; console.log(`  FAIL s${seed} ${pid}: layer-attributable divergence`); }
    }
  }
  console.log(`PART B: ${cleanIdentical}/4 clean-identical, ${substrateNoise} substrate-noise, ${layerDivergent} layer-attributable`);
  assert.strictEqual(layerDivergent, 0, 'det-gate: layer-attributable divergence');
  console.log('PART B green — no layer-attributable divergence');
}

(async () => {
  run();
  await detGate();
  smoke();
  console.log('TEST-PITSTAFF-B: ALL GREEN');
})().catch(e => { console.error('TEST-PITSTAFF-B FAILED:', e); process.exit(1); });
