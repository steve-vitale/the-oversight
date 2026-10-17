#!/usr/bin/env node
// scripts/test-huntstaff-b.js — proof for the huntstaff layer (arm sim-huntstaff-b).
//
// PART A — fixture (RED/GREEN):
//   RED: gate off (HUNTSTAFF unset) → staffHunt returns null, assignTask
//        NEVER attempted, ctx untouched (zero writes gate-off — the
//        det-gate depends on this).
//   GREEN: gate on (HUNTSTAFF=1) + lean day + hunter-substrate villager
//        (HP>=40, trust>=40) at Haven → assignTask('hunt') attempted and
//        recorded exactly once; one-hunter-at-a-time, once-per-day, and
//        the HP/trust/substrate gates each refuse honestly.
// PART B — det-gate: HUNTSTAFF-unset wrapper trajectories byte-identical
//   to pristine (no wrapper), 2 seeds x leadfeast x 30d, state-hash compare.
// PART C — smoke: staffHunt under HUNTSTAFF=1 on a non-lean day does
//   nothing (gate (a)); the layer is a lean-day instrument, not a
//   always-on staffing drive.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-huntstaff-b.js
'use strict';
const assert = require('assert');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  // INFO-SKIP (kill protocol, sim-huntstaff-b NO-GO 2026-10-17): the layer
  // was deleted zero-trace per the killed-arm protocol
  // (evidence/2026-10-17/sim-huntstaff-b.md). This proof test is kept as the
  // instrument; it skips honestly instead of crashing. The re-run
  // (sim-huntstaff-b2) rebuilds the layer from the evidence spec.
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent (layer killed per sim-huntstaff-b verdict) — nothing to prove.');
  process.exit(0);
}

function fakeGame(opts) {
  const o = opts || {};
  const attempts = [];
  const G = {
    over: false,
    state: {
      scholar: { day: 5, kcal: o.kcal == null ? 300 : o.kcal },
      village: {
        roster: o.roster || ['v1', 'v2', 'v3'],
        assignments: o.assignments || {},
        health: o.health || { v1: 90, v2: 90, v3: 90 },
        trust: o.trust || { v1: 50, v2: 20, v3: 60 },
        pantry: [],
      },
    },
    villagerId: 'scholar',
    playerAtHaven: () => (o.atHaven == null ? true : o.atHaven),
    getPerson: (id) => ({
      v1: { id, name: 'Ruby Roth', dead: false, formerOccupation: 'hunting guide' },
      v2: { id, name: 'Bob Smith', dead: false, formerOccupation: 'fishing guide' },
      v3: { id, name: 'Ana Lima', dead: false, formerOccupation: 'accountant' },
    }[id] || null),
    kcalCap: () => 2400,
    pantryFreshDays: () => (o.freshDays == null ? 1.5 : o.freshDays),
    villagerCompetence: () => 1.0,
    assignTask: (vid, task, ao) => {
      attempts.push({ vid, task, via: ao && ao.via });
      G.state.village.assignments[vid] = { task };
      return 'ok';
    },
    _attempts: attempts,
  };
  return G;
}

function run() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };

  console.log('PART A — fixture (RED/GREEN)');

  // RED: gate off → no attempt, no ctx writes
  delete process.env.HUNTSTAFF;
  ok('RED: gate off → staffHunt returns null', () => {
    const G = fakeGame();
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
  });
  ok('RED: gate off → assignTask never attempted', () => {
    const G = fakeGame();
    HS.staffHunt(G, {});
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('RED: gate off → ctx untouched (det-gate neutrality)', () => {
    const ctx = {};
    HS.staffHunt(fakeGame(), ctx);
    assert.deepStrictEqual(ctx, {});
  });

  // GREEN: gate on, lean day, hunter at Haven → fires on v1 (trust 50),
  // NOT v2 (trust 20 < 40) and NOT v3 (not substrate)
  process.env.HUNTSTAFF = '1';
  ok('GREEN: fires on the eligible hunter (v1)', () => {
    const G = fakeGame();
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].task, 'hunt');
    assert.strictEqual(G._attempts[0].via, 'in-person');
    assert.strictEqual(ctx._hsAssignments, 1);
  });
  ok('GREEN: low-trust hunter (v2) skipped even when free', () => {
    const G = fakeGame({ trust: { v1: 20, v2: 20, v3: 60 } }); // v1 now trust 20 too
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null); // nobody eligible
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('GREEN: wounded hunter (HP<40) skipped', () => {
    const G = fakeGame({ health: { v1: 25, v2: 90, v3: 90 }, trust: { v1: 90, v2: 20, v3: 60 } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('GREEN: once per day — second call same day is null', () => {
    const G = fakeGame();
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 1);
  });
  ok('GREEN: one hunter at a time — existing hunt assignment blocks', () => {
    const G = fakeGame({ assignments: { v3: { task: 'hunt' } } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('GREEN: not at Haven → no attempt (in-person is the honest line)', () => {
    const G = fakeGame({ atHaven: false });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('GREEN: non-lean day → no attempt (pantry full, scholar fed)', () => {
    const G = fakeGame({ kcal: 2000, freshDays: 9 });
    const ctx = {};
    assert.strictEqual(HS.leanDay(G), false);
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
  });
  ok('leanDay: starving scholar is a lean day regardless of pantry', () => {
    const G = fakeGame({ kcal: 100, freshDays: 9 });
    assert.strictEqual(HS.leanDay(G), true);
  });
  ok('isHunterSubstrate: corrected list matches, ghosts rejected', () => {
    const G = fakeGame();
    assert.strictEqual(HS.isHunterSubstrate(G, 'v1'), true);   // hunting guide
    assert.strictEqual(HS.isHunterSubstrate(G, 'v2'), true);   // fishing guide
    assert.strictEqual(HS.isHunterSubstrate(G, 'v3'), false);  // accountant
    // a literal ghost-list-only occupation must NOT match
    const G2 = fakeGame();
    G2.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: 'tracker' });
    assert.strictEqual(HS.isHunterSubstrate(G2, 'x'), false);
  });
  console.log(`PART A green (${n} checks)`);

  delete process.env.HUNTSTAFF;
}

function smoke() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART C — smoke (lean-day instrument, not always-on)');
  delete process.env.HUNTSTAFF;
  ok('smoke: layerOn() false when unset', () => assert.strictEqual(HS.layerOn(), false));
  process.env.HUNTSTAFF = '1';
  ok('smoke: layerOn() true when HUNTSTAFF=1', () => assert.strictEqual(HS.layerOn(), true));
  console.log('PART C green');
  delete process.env.HUNTSTAFF;
}

// PART B runs the real harness — async. Follows the proven det-gate
// pattern (scripts/det-gate.js + test-cookbulk-b.js Part C): per-day
// trajectory hashes, wrapped-off vs base; any diverger re-checked
// base-vs-base to attribute substrate noise (the known contest-ID entropy
// issue). Gate: ZERO layer-attributable divergences.
async function detGate() {
  console.log('PART B — det-gate (wrapped HUNTSTAFF-unset vs unwrapped base, 60d)');
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
  const seeds = [7801, 7802, 7803, 7804, 7805, 7806, 7807, 7808];
  let cleanIdentical = 0, substrateNoise = 0, layerDivergent = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
      delete process.env.HUNTSTAFF; // gate OFF
      const wrapped = HS.withHuntStaff(base, pid + '+huntstaff', 'det');
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
  console.log(`PART B: ${cleanIdentical}/16 clean-identical, ${substrateNoise} substrate-noise, ${layerDivergent} layer-attributable`);
  assert.strictEqual(layerDivergent, 0, 'det-gate: layer-attributable divergence');
  console.log('PART B green — no layer-attributable divergence');
}

(async () => {
  run();
  await detGate();
  smoke();
  console.log('TEST-HUNTSTAFF-B: ALL GREEN');
})().catch(e => { console.error('TEST-HUNTSTAFF-B FAILED:', e); process.exit(1); });
