#!/usr/bin/env node
// scripts/test-huntstaff-b5.js — proof for arm sim-huntstaff-b5
// (loop B, run fleshout-loop-b-20261018T1530Z).
//
// The HUNTSTAFF layer landed default-OFF with sim-huntstaff-b4 (GO);
// this proof pins the landed layer's gates RED->GREEN (Part A, carried
// from test-huntstaff-b4.js — the layer must still gate exactly as
// landed) AND the NEW boar/bear engagement instrument
// (scripts/policies/huntengage.js, Part A2).
//
// PART A — fixture (RED/GREEN): the landed layer.
//   RED: gate off (HUNTSTAFF unset) → staffHunt returns null, assignTask
//        NEVER attempted, ctx untouched (zero writes gate-off — the
//        det-gate depends on this).
//   GREEN: gate on (HUNTSTAFF=1) + lean day + hunter-substrate villager
//        (HP>=40, trust>=40) at Haven → assignTask('hunt') attempted and
//        recorded exactly once; one-hunter-at-a-time, once-per-day, and
//        the HP/trust/substrate gates each refuse honestly; the three
//        HUNTER-ONLY pins.
// PART A2 — the engagement instrument (huntengage.js):
//   RED: unobserved fake Game → no ledger rows (the instrument does not
//        exist until installed — the wrap is the instrument).
//   GREEN: observed fake Game with scripted villagerHuntResolve returns:
//     - kill with aid 'wild_boar' → one engagement row, killed, kcal,
//       source 'layer-staffed' when v.assignments[vid].task==='hunt'
//     - kill with aid 'black_bear' + task-lead (no assignment) → row,
//       source 'engine-tasklead'
//     - stalk-miss msg "stalks a Black Bear all morning" (no aid) → row
//       via the miss-name parser, killed=false
//     - miss msg for a rabbit (aid null, no name match) → NO row
//     - hunted-out msg (no prey) → NO row
//     - hurtVillager(vid, 24, 'hunting') → one wound row;
//       hurtVillager(vid, 10, 'contest') → NO wound row
//     - Math.random draw-count unchanged across the observed call
//       (the instrument draws no RNG); fake Game state deep-equal
//       before/after (zero state writes).
// PART B — det-gate: (i) HUNTSTAFF-unset wrapper trajectories byte-identical
//   to pristine (no wrapper), 2 seeds x 2 policies x 60d; (ii) armed
//   (HUNTSTAFF=1) + observation wraps byte-identical to armed WITHOUT the
//   wraps — proves the new observation layer is perturbation-free.
// PART C — smoke: layerOn + observeGame presence + lean-day instrument.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-huntstaff-b5.js
'use strict';
const assert = require('assert');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer killed zero-trace. Proof was ALL GREEN pre-kill.');
  process.exit(0);
}
let HE;
try {
  HE = require('./policies/huntengage');
} catch (e) {
  console.log('FAIL: scripts/policies/huntengage.js absent — the b5 engagement instrument is the arm\'s deliverable.');
  process.exit(1);
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

  console.log('PART A — fixture (RED/GREEN) on the landed layer');

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
    const G = fakeGame({ trust: { v1: 20, v2: 20, v3: 60 } });
    const ctx = {};
    assert.strictEqual(HS.staffHunt(G, ctx), null);
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
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1');
    persons.v1.dead = true;
    delete G.state.village.assignments.v1;
    G.state.scholar.day = 6;
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].vid, 'v1');
  });
  ok('HUNTER-ONLY PIN: near-miss occupations rejected', () => {
    for (const occ of ['game warden', 'tracker', 'poacher', 'huntsman', 'wildlife photographer']) {
      const G = fakeGame();
      G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: occ });
      assert.strictEqual(HS.isHunterSubstrate(G, 'x'), false, occ);
    }
    for (const occ of HS.HUNTER_WORDS) {
      const G = fakeGame();
      G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: occ });
      assert.strictEqual(HS.isHunterSubstrate(G, 'x'), true, occ);
    }
  });
  console.log(`PART A green (${n} checks)`);
  delete process.env.HUNTSTAFF;
}

function runA2() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART A2 — engagement instrument (huntengage.js)');

  function observedFake(scripted, assignments) {
    const G = fakeGame({ assignments: assignments || {} });
    G.villagerHuntResolve = function (vid, eff) {
      return scripted[(G._ri = (G._ri || 0) + 1) - 1];
    };
    const wounds = [];
    G.hurtVillager = function (vid, dmg, cause) { wounds.push({ vid, dmg, cause }); };
    G._wounds = wounds;
    return G;
  }

  ok('RED: unobserved fake Game → no ledger (the wrap is the instrument)', () => {
    const t = {};
    assert.strictEqual(t.bbEngagements, undefined);
    assert.strictEqual(t.huntWounds, undefined);
  });

  ok('GREEN: boar kill → engagement row, killed, layer-staffed source', () => {
    const G = observedFake(
      [{ kcal: 12600, aid: 'wild_boar', msg: '🏹 Ruby brings down a Wild Boar — clean kill, +12600 kcal to the pantry.' }],
      { v1: { task: 'hunt' } });
    const t = {};
    HE.observeGame(G, t);
    const r = G.villagerHuntResolve('v1', 1.0);
    assert.strictEqual(r.kcal, 12600);
    assert.strictEqual(t.bbEngagements.length, 1);
    const row = t.bbEngagements[0];
    assert.strictEqual(row.aid, 'wild_boar');
    assert.strictEqual(row.killed, true);
    assert.strictEqual(row.kcal, 12600);
    assert.strictEqual(row.source, 'layer-staffed');
    assert.strictEqual(row.day, 5);
    assert.strictEqual(t.huntKills, 1);
  });

  ok('GREEN: bear kill, no assignment → engine-tasklead source', () => {
    const G = observedFake(
      [{ kcal: 18000, aid: 'black_bear', msg: '🏹 Bob brings down a Black Bear — clean kill, +18000 kcal to the pantry.' }],
      {});
    const t = {};
    HE.observeGame(G, t);
    G.villagerHuntResolve('v2', 1.0);
    assert.strictEqual(t.bbEngagements.length, 1);
    assert.strictEqual(t.bbEngagements[0].aid, 'black_bear');
    assert.strictEqual(t.bbEngagements[0].source, 'engine-tasklead');
  });

  ok('GREEN: bear stalk-miss (no aid) → engagement via miss-name parser', () => {
    const G = observedFake(
      [{ kcal: 0, msg: '🏹 Ruby stalks a Black Bear all morning — it winds them and it\'s gone. Nothing to bring home.' }],
      { v1: { task: 'hunt' } });
    const t = {};
    HE.observeGame(G, t);
    G.villagerHuntResolve('v1', 1.0);
    assert.strictEqual(t.bbEngagements.length, 1);
    assert.strictEqual(t.bbEngagements[0].aid, 'black_bear');
    assert.strictEqual(t.bbEngagements[0].killed, false);
  });

  ok('GREEN: rabbit miss → NO engagement row', () => {
    const G = observedFake(
      [{ kcal: 0, msg: '🏹 Ruby stalks a Eastern Cottontail all morning — it winds them and it\'s gone. Nothing to bring home.' }],
      { v1: { task: 'hunt' } });
    const t = {};
    HE.observeGame(G, t);
    G.villagerHuntResolve('v1', 1.0);
    assert.strictEqual(t.bbEngagements.length, 0);
    assert.strictEqual(t.huntResolves, 1);
    assert.strictEqual(t.huntKcal, 0);
  });

  ok('GREEN: hunted-out resolve → NO engagement row', () => {
    const G = observedFake(
      [{ kcal: 0, msg: '🏹 Ruby works the grounds all day — the wild is hunted out. Nothing to bring home.' }],
      { v1: { task: 'hunt' } });
    const t = {};
    HE.observeGame(G, t);
    G.villagerHuntResolve('v1', 1.0);
    assert.strictEqual(t.bbEngagements.length, 0);
  });

  ok('GREEN: hunting-cause wound recorded; contest-cause wound ignored', () => {
    const G = observedFake([], { v1: { task: 'hunt' } });
    const t = {};
    HE.observeGame(G, t);
    G.hurtVillager('v1', 24, 'hunting');
    G.hurtVillager('v2', 10, 'contest');
    assert.strictEqual(t.huntWounds.length, 1);
    assert.strictEqual(t.huntWounds[0].vid, 'v1');
    assert.strictEqual(t.huntWounds[0].dmg, 24);
  });

  ok('GREEN: instrument draws no RNG and writes no Game state', () => {
    const G = observedFake(
      [{ kcal: 12600, aid: 'wild_boar', msg: 'boar kill' }],
      { v1: { task: 'hunt' } });
    const before = JSON.stringify(G.state);
    const t = {};
    HE.observeGame(G, t);
    let draws = 0;
    const realRandom = Math.random;
    Math.random = function () { draws++; return realRandom(); };
    try { G.villagerHuntResolve('v1', 1.0); G.hurtVillager('v1', 5, 'hunting'); }
    finally { Math.random = realRandom; }
    assert.strictEqual(draws, 0);
    assert.strictEqual(JSON.stringify(G.state), before);
    assert.strictEqual(t.instrumentErrors, 0);
  });

  ok('GREEN: stalkedAid parser units', () => {
    assert.strictEqual(HE.stalkedAid('🏹 X stalks a Wild Boar all morning — gone.'), 'wild_boar');
    assert.strictEqual(HE.stalkedAid('🏹 X stalks a Black Bear all morning — gone.'), 'black_bear');
    assert.strictEqual(HE.stalkedAid('🏹 X stalks a Eastern Cottontail all morning — gone.'), null);
    assert.strictEqual(HE.stalkedAid('🏹 X works the grounds all day — the wild is hunted out.'), null);
    assert.strictEqual(HE.stalkedAid(null), null);
  });

  console.log(`PART A2 green (${n} checks)`);
}

function smoke() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART C — smoke');
  delete process.env.HUNTSTAFF;
  ok('smoke: layerOn() false when unset', () => assert.strictEqual(HS.layerOn(), false));
  process.env.HUNTSTAFF = '1';
  ok('smoke: layerOn() true when HUNTSTAFF=1', () => assert.strictEqual(HS.layerOn(), true));
  ok('smoke: observeGame exported and installs wraps', () => {
    const G = fakeGame();
    G.villagerHuntResolve = function () { return { kcal: 0, msg: 'nothing' }; };
    G.hurtVillager = function () {};
    assert.strictEqual(typeof HE.observeGame, 'function');
    HE.observeGame(G, {});
  });
  ok('smoke: non-lean day → no attempt (lean-day instrument, not always-on)', () => {
    const G = fakeGame({ kcal: 2000, freshDays: 9 });
    assert.strictEqual(HS.staffHunt(G, {}), null);
  });
  console.log('PART C green');
  delete process.env.HUNTSTAFF;
}

// PART B — det-gate. (i) wrapped-off vs base; (ii) armed+observation vs
// armed. Gate: ZERO attributable divergences in both comparisons.
async function detGate() {
  console.log('PART B — det-gate (60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function hashesFor(policy, seed, observe) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    if (observe) HE.observeGame(Game, {});
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [105101, 105102]; // killaudit baseline seeds; substrate-only gate
  let gateOffClean = 0, obsClean = 0, substrateNoise = 0, divergent = 0;
  const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
  for (const seed of seeds) {
    for (const [pid, base] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
      delete process.env.HUNTSTAFF;
      const wrapped = HS.withHuntStaff(base, pid + '+huntstaff', 'det');
      const a = await hashesFor(wrapped, seed, false);
      const b = await hashesFor(base, seed, false);
      const c = await hashesFor(base, seed, false);
      if (eq(a, b)) { gateOffClean++; console.log(`  ok   s${seed} ${pid} gate-off: wrapped-off byte-identical to base`); }
      else if (!eq(b, c)) { substrateNoise++; console.log(`  NOTE s${seed} ${pid} gate-off: base-vs-base diverges too — substrate noise`); }
      else { divergent++; console.log(`  FAIL s${seed} ${pid} gate-off: layer-attributable divergence`); }
      process.env.HUNTSTAFF = '1';
      const armedBase = HS.withHuntStaff(base, pid + '+huntstaff', 'det');
      const d = await hashesFor(armedBase, seed, true);   // armed + observation
      const e = await hashesFor(armedBase, seed, false);  // armed, no observation
      const f = await hashesFor(armedBase, seed, false);  // armed noise control
      if (eq(d, e)) { obsClean++; console.log(`  ok   s${seed} ${pid} armed: +observation byte-identical to armed`); }
      else if (!eq(e, f)) { substrateNoise++; console.log(`  NOTE s${seed} ${pid} armed: armed-vs-armed diverges too — substrate noise`); }
      else { divergent++; console.log(`  FAIL s${seed} ${pid} armed: observation-attributable divergence`); }
      delete process.env.HUNTSTAFF;
    }
  }
  console.log(`PART B: gate-off ${gateOffClean}/4 clean, observation ${obsClean}/4 clean, ${substrateNoise} substrate-noise, ${divergent} divergent`);
  assert.strictEqual(divergent, 0, 'det-gate: attributable divergence');
  console.log('PART B green — no attributable divergence');
}

(async () => {
  run();
  runA2();
  await detGate();
  smoke();
  console.log('TEST-HUNTSTAFF-B5: ALL GREEN');
})().catch(e => { console.error('TEST-HUNTSTAFF-B5 FAILED:', e); process.exit(1); });
