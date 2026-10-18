#!/usr/bin/env node
// scripts/test-huntstaff-b4.js — proof for the REBUILT huntstaff layer
// (arm sim-huntstaff-b4, the §14 escape-hatch re-run of sim-huntstaff-b).
//
// The layer was rebuilt from evidence/2026-10-17/sim-huntstaff-b.md
// §"The layer (built per the corrected spec)" — identical spec to the
// killed b pilot (48 assignments fired, 41 kills, 177k kcal, zero
// hunt-attributable deaths before the metric-broken kill).
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
//   to pristine (no wrapper), 2 fresh seeds x 2 policies x 60d, state-hash
//   compare (the proven test-cookbulk-b Part C pattern).
// PART C — smoke: staffHunt under HUNTSTAFF=1 on a non-lean day does
//   nothing (gate (a)); the layer is a lean-day instrument, not an
//   always-on staffing drive.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-huntstaff-b4.js
'use strict';
const assert = require('assert');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer killed zero-trace per NO-GO verdict (sim-huntstaff-b4, 2026-10-18). Proof was ALL GREEN pre-kill.');
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
    assert.ok(Array.isArray(ctx._hsAssignLog) && ctx._hsAssignLog.length === 1);
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
  ok('leanDay: half-cap boundary', () => {
    assert.strictEqual(HS.leanDay(fakeGame({ kcal: 1199, freshDays: 9 })), true);
    assert.strictEqual(HS.leanDay(fakeGame({ kcal: 1200, freshDays: 9 })), false);
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
  ok('GREEN: refused engine assignment does not count as fired', () => {
    const G = fakeGame();
    G.assignTask = () => ({ ok: false, refused: true });       // engine's obedience gate says no
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(ctx._hsAssignments || 0, 0);
  });
  // B4 HUNTER-ONLY PIN: the layer assigns ONLY hunter-substrate villagers.
  // Pin 1: an all-non-substrate roster never fires, however lean the days.
  ok('HUNTER-ONLY PIN: all-non-substrate roster → null across 8 lean days', () => {
    const G = fakeGame();
    G.getPerson = (id) => ({ id, name: 'X ' + id, dead: false, formerOccupation: 'accountant' });
    const ctx = {};
    for (let d = 5; d < 13; d++) {
      G.state.scholar.day = d;
      assert.strictEqual(HS.staffHunt(G, ctx), null);
    }
    assert.strictEqual(G._attempts.length, 0);
    assert.strictEqual(ctx._hsAssignments || 0, 0);
  });
  // Pin 2: when the only substrate villager dies, the layer stops — a
  // non-substrate villager is NEVER promoted into the slot.
  ok('HUNTER-ONLY PIN: dead substrate hunter → non-substrate never promoted', () => {
    const G = fakeGame();
    const persons = {
      v1: { id: 'v1', name: 'Hank', dead: false, formerOccupation: 'hunting guide' },
      v2: { id: 'v2', name: 'Sara', dead: false, formerOccupation: 'accountant' },
      v3: { id: 'v3', name: 'Tom', dead: false, formerOccupation: 'schoolteacher' },
    };
    G.getPerson = (id) => persons[id] || null;
    const ctx = {};
    G.state.scholar.day = 5;
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');   // Hank staffed — he is substrate
    persons.v1.dead = true;                            // Hank dies in the wild
    delete G.state.village.assignments.v1;             // his assignment clears
    G.state.scholar.day = 6;
    assert.strictEqual(HS.staffHunt(G, ctx), null);    // Sara/Tom are never promoted
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].vid, 'v1');
    const log = ctx._hsAssignLog || [];
    assert.ok(log.length === 1 && log[0].occ === 'hunting guide');
  });
  // Pin 3: a villager whose occupation merely SOUNDS wild-adjacent but is
  // not on the word list ('game warden', 'tracker', 'poacher') is rejected —
  // the list is a closed gate, not a vibe.
  ok('HUNTER-ONLY PIN: near-miss occupations rejected', () => {
    for (const occ of ['game warden', 'tracker', 'poacher', 'huntsman', 'wildlife photographer']) {
      const G = fakeGame();
      G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: occ });
      assert.strictEqual(HS.isHunterSubstrate(G, 'x'), false, occ);
    }
    // and every word-list entry passes
    for (const occ of HS.HUNTER_WORDS) {
      const G = fakeGame();
      G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: occ });
      assert.strictEqual(HS.isHunterSubstrate(G, 'x'), true, occ);
    }
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
  const seeds = [8450, 8473]; // fresh b4 seeds; substrate-only gate, 60d each
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
  console.log(`PART B: ${cleanIdentical}/4 clean-identical, ${substrateNoise} substrate-noise, ${layerDivergent} layer-attributable`);
  assert.strictEqual(layerDivergent, 0, 'det-gate: layer-attributable divergence');
  console.log('PART B green — no layer-attributable divergence');
}

(async () => {
  run();
  await detGate();
  smoke();
  console.log('TEST-HUNTSTAFF-B4: ALL GREEN');
})().catch(e => { console.error('TEST-HUNTSTAFF-B4 FAILED:', e); process.exit(1); });
