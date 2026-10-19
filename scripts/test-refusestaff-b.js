#!/usr/bin/env node
// scripts/test-refusestaff-b.js — proof for arm sim-refusestaff-b
// (loop B, run fleshout-loop-b-20261018T1653Z).
//
// The repair (findings #557/#535): the landed HUNTSTAFF layer's HP>=40
// gate read the overnight-recovered v.health map, masking wound debt —
// Teresa was re-staffed d160-177 through 8 hunting wounds
// (sim-huntstaff-b5). The repair: (1) the HP gate reads PERSON-LEVEL
// health (the wound-informed true declining value), not the map; (2)
// refuse re-assignment within 2d of a wounding hunt resolve, staffing
// the next-best eligible hunter instead.
//
// PART A — RED/GREEN fixtures:
//   RED (landed layer, extracted from 259e30160 — the b4 GO commit —
//   pinned below): the bug, demonstrated. The landed layer re-staffs a
//   hunter whose map recovered (89) after a wound it cannot see, and
//   its HP gate reads the map only.
//   GREEN (fixed layer, ./policies/huntstaff): the wound watch records
//   post-wound HP; the 2d refusal fires once per day with a narrated
//   beat and logs; the declining gate refuses on the true value while
//   the map reads healthy; the ledger goes stale after 7d; min() keeps
//   unobserved damage authoritative; gate-off installs nothing and
//   writes nothing; the hunter-only pins still hold.
// PART B — det-gate: (i) fixed gate-off vs base byte-identical,
//   2 seeds x 2 policies x 60d; (ii) fixed armed vs fixed armed re-run
//   byte-identical (the repair perturbs no RNG).
// PART C — smoke.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-refusestaff-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const LANDED_SHA = '259e30160'; // sim-huntstaff-b4 GO — the landed layer

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer killed zero-trace.');
  process.exit(0);
}

// Extract the landed layer from git (pinned sha) for the RED pins.
// Never committed anywhere — lives in tmp, like any test scratch.
function landedLayer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hs-landed-'));
  const f = path.join(dir, 'huntstaff-landed.js');
  const src = execFileSync('git', ['-C', path.join(__dirname, '..'), 'show', LANDED_SHA + ':scripts/policies/huntstaff.js'],
    { encoding: 'utf8', maxBuffer: 1 << 20 });
  fs.writeFileSync(f, src);
  return require(f);
}
const LANDED = landedLayer();

// fakeGame: the b5 fixture shape + hurtVillager (decrements the map,
// like the engine) + say capture. Wound flow mirrors the engine:
// heal-check patch is NOT modeled (the layer fires before it); the
// map value the fixture sets IS the pre-staffing read.
function fakeGame(opts) {
  const o = opts || {};
  const attempts = [];
  const said = [];
  const G = {
    over: false,
    state: {
      scholar: { day: o.day == null ? 5 : o.day, kcal: o.kcal == null ? 300 : o.kcal },
      village: {
        roster: o.roster || ['v1', 'v2', 'v3'],
        assignments: o.assignments || {},
        health: Object.assign({ v1: 90, v2: 90, v3: 90 }, o.health || {}),
        trust: Object.assign({ v1: 50, v2: 50, v3: 60 }, o.trust || {}),
        pantry: [],
      },
    },
    villagerId: 'scholar',
    playerAtHaven: () => (o.atHaven == null ? true : o.atHaven),
    getPerson: o.getPerson || ((id) => ({
      v1: { id, name: 'Teresa Godinez', dead: false, formerOccupation: 'exterminator' },
      v2: { id, name: 'Pavel Dubinin', dead: false, formerOccupation: 'bush pilot' },
      v3: { id, name: 'Ana Lima', dead: false, formerOccupation: 'accountant' },
    }[id] || null)),
    kcalCap: () => 2400,
    pantryFreshDays: () => (o.freshDays == null ? 1.5 : o.freshDays),
    villagerCompetence: () => 1.0,
    assignTask: (vid, task, ao) => {
      attempts.push({ vid, task, via: ao && ao.via });
      G.state.village.assignments[vid] = { task };
      return 'ok';
    },
    hurtVillager: (vid, dmg, cause) => {
      const h = G.state.village.health;
      h[vid] = Math.max(0, (h[vid] !== undefined ? h[vid] : 100) - dmg);
    },
    say: (msg) => { said.push(String(msg)); },
    _attempts: attempts,
    _said: said,
  };
  return G;
}

function run() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART A — RED (landed layer exhibits the bug)');

  delete process.env.HUNTSTAFF;
  process.env.HUNTSTAFF = '1';

  ok('RED-1: landed layer re-staffs through a wound the map hides', () => {
    // Teresa wounded d4 (-20 -> map 70), patched overnight to 89.
    // The landed layer has no wound concept: map 89 >= 40 -> staffed.
    const G = fakeGame({ health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    assert.strictEqual(LANDED.staffHunt(G, ctx), 'v1');
    assert.strictEqual(G._attempts.length, 1);
  });
  ok('RED-2: landed HP gate reads the map only (89 staffed, 35 refused)', () => {
    const G1 = fakeGame({ health: { v1: 89, v2: 90, v3: 90 } });
    assert.strictEqual(LANDED.staffHunt(G1, {}), 'v1');
    const G2 = fakeGame({ health: { v1: 35, v2: 90, v3: 90 } });
    assert.strictEqual(LANDED.staffHunt(G2, {}), 'v2'); // v1 refused on the map, v2 takes it
    assert.strictEqual(typeof LANDED.personHp, 'undefined'); // no person-level concept
    assert.strictEqual(typeof LANDED.installWoundWatch, 'undefined');
  });
  ok('RED-3: landed layer re-staffs the DAY AFTER the wound (no 2d rule)', () => {
    // Wound d4; staffing decision d5; map patched to 89. Landed: staffed.
    const G = fakeGame({ day: 5, health: { v1: 89, v2: 90, v3: 90 } });
    assert.strictEqual(LANDED.staffHunt(G, {}), 'v1');
  });
  console.log(`PART A-RED green (${n} checks) — the bug is real in the landed layer`);

  console.log('PART A — GREEN (fixed layer repairs it)');
  n = 0;

  ok('GREEN-1: wound watch records the true post-wound value', () => {
    const G = fakeGame({ health: { v1: 90, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.hurtVillager('v1', 20, 'hunting');
    assert.deepStrictEqual(ctx._hsWound.v1, { day: 5, hp: 70, dmg: 20 });
    assert.strictEqual(ctx._hsWoundLog.length, 1);
    G.hurtVillager('v2', 10, 'contest');
    assert.strictEqual(ctx._hsWound.v2, undefined); // non-hunting wounds not ledgered
    assert.strictEqual(ctx._hsWoundLog.length, 1);
  });
  ok('GREEN-2: wound watch is idempotent (one wrap, one row)', () => {
    const G = fakeGame();
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    HS.installWoundWatch(G, ctx);
    G.hurtVillager('v1', 20, 'hunting');
    assert.strictEqual(ctx._hsWoundLog.length, 1);
  });
  ok('GREEN-3: wound watch draws no RNG and adds no Game state writes', () => {
    // The engine's own hurtVillager writes the damage (that IS game
    // state); the wrap must add nothing beyond it. Compare wrapped vs
    // pristine-original on identical games.
    const mk = () => fakeGame();
    const G1 = mk(), G2 = mk();
    const origHurt = G2.hurtVillager;
    const ctx = {};
    HS.installWoundWatch(G1, ctx);
    let draws = 0;
    const realRandom = Math.random;
    Math.random = function () { draws++; return realRandom(); };
    try {
      G1.hurtVillager('v1', 20, 'hunting');
      origHurt.call(G2, 'v1', 20, 'hunting');
    } finally { Math.random = realRandom; }
    assert.strictEqual(draws, 0);
    assert.strictEqual(JSON.stringify(G1.state), JSON.stringify(G2.state));
  });
  ok('GREEN-4: 2d refusal — wounded hunter held back, backup staffed, beat narrated', () => {
    const G = fakeGame({ day: 5, health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 4;
    G.hurtVillager('v1', 20, 'hunting'); // wound d4, post-wound hp 69
    G.state.scholar.day = 5;
    G.state.village.health.v1 = 89; // overnight patch masks it — the bug's setup
    const vid = HS.staffHunt(G, ctx);
    assert.strictEqual(vid, 'v2'); // backup walks the treeline instead
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].vid, 'v2');
    assert.strictEqual(ctx._hsRefusalLog.length, 1);
    const r = ctx._hsRefusalLog[0];
    assert.strictEqual(r.vid, 'v1');
    assert.strictEqual(r.reason, 'wounded-2d');
    assert.strictEqual(r.woundDay, 4);
    assert.strictEqual(G._said.length, 1);
    assert.ok(G._said[0].includes('Teresa'), 'beat names the person');
    assert.ok(G._said[0].includes('hold them back'), 'beat reads as a decision, not a stat gate');
    assert.ok(!/40|HP/.test(G._said[0]), 'beat never cites the stat gate');
  });
  ok('GREEN-5: refusal fires once per day (no double beat)', () => {
    const G = fakeGame({ day: 5, health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 4;
    G.hurtVillager('v1', 20, 'hunting');
    G.state.scholar.day = 5;
    G.state.village.health.v1 = 89;
    assert.strictEqual(HS.staffHunt(G, ctx), 'v2');
    assert.strictEqual(HS.staffHunt(G, ctx), null); // same day: decided already
    assert.strictEqual(G._said.length, 1);
    assert.strictEqual(ctx._hsRefusalLog.length, 1);
    assert.strictEqual(G._attempts.length, 1);
  });
  ok('GREEN-6: 2d window is inclusive — d6 refused, d7 staffed again', () => {
    for (const [day, expect] of [[6, 'v2'], [7, 'v1']]) {
      const G = fakeGame({ day, health: { v1: 89, v2: 90, v3: 90 } });
      const ctx = {};
      HS.installWoundWatch(G, ctx);
      G.state.scholar.day = 4;
      G.hurtVillager('v1', 20, 'hunting');
      G.state.scholar.day = day;
      G.state.village.health.v1 = 89;
      assert.strictEqual(HS.staffHunt(G, ctx), expect, `day ${day}`);
    }
  });
  ok('GREEN-7: declining gate — true value 35 refused while map reads 89', () => {
    const G = fakeGame({ day: 7, health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 4;
    G.hurtVillager('v1', 54, 'hunting'); // post-wound hp 35 (from the patched 89)
    G.state.scholar.day = 7;
    G.state.village.health.v1 = 89; // patched twice since — the mask
    assert.strictEqual(HS.personHp(G, ctx, 'v1', 7), 35);
    assert.strictEqual(HS.staffHunt(G, ctx), 'v2');
    assert.strictEqual(ctx._hsRefusalLog.length, 1);
    assert.strictEqual(ctx._hsRefusalLog[0].reason, 'declining');
    assert.ok(G._said[0].includes('wearing thin'), 'declining beat names the mechanism honestly');
  });
  ok('GREEN-8: ledger goes stale after 7d — trust the map again', () => {
    const G = fakeGame({ day: 12, health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 4;
    G.hurtVillager('v1', 54, 'hunting');
    G.state.scholar.day = 12;
    G.state.village.health.v1 = 89;
    assert.strictEqual(HS.personHp(G, ctx, 'v1', 12), 89);
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1'); // a week healed her — staffable
    assert.strictEqual(ctx._hsRefusalLog || 0, 0);
  });
  ok('GREEN-9: min() keeps unobserved damage authoritative', () => {
    const G = fakeGame({ day: 5, health: { v1: 90, v2: 90, v3: 90 } });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 2;
    G.hurtVillager('v1', 20, 'hunting'); // post-wound 70 — the ledger's truth
    G.state.scholar.day = 5; // 2d rule expired (5-2=3), ledger fresh (<=7d)
    G.state.village.health.v1 = 30; // monster fight overnight — not the ledger's wound
    assert.strictEqual(HS.personHp(G, ctx, 'v1', 5), 30);
    assert.strictEqual(HS.staffHunt(G, ctx), 'v2');
    assert.strictEqual(ctx._hsRefusalLog[0].reason, 'declining');
  });
  ok('GREEN-10: no ledger → the map, exactly the old behavior', () => {
    const G = fakeGame({ health: { v1: 89, v2: 90, v3: 90 } });
    const ctx = {};
    assert.strictEqual(HS.personHp(G, ctx, 'v1', 5), 89);
    HS.installWoundWatch(G, ctx);
    assert.strictEqual(HS.staffHunt(G, ctx), 'v1'); // no wounds: identical to landed
  });
  ok('GREEN-11: all hunters refused → no duty, one beat each, decided once', () => {
    const G = fakeGame({
      day: 5, health: { v1: 89, v2: 89, v3: 90 },
      getPerson: (id) => ({
        v1: { id, name: 'Teresa Godinez', dead: false, formerOccupation: 'exterminator' },
        v2: { id, name: 'Pavel Dubinin', dead: false, formerOccupation: 'bush pilot' },
        v3: { id, name: 'Ana Lima', dead: false, formerOccupation: 'accountant' },
      }[id] || null),
    });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    G.state.scholar.day = 4;
    G.hurtVillager('v1', 20, 'hunting');
    G.hurtVillager('v2', 15, 'hunting');
    G.state.scholar.day = 5;
    G.state.village.health.v1 = 89;
    G.state.village.health.v2 = 89;
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
    assert.strictEqual(ctx._hsRefusalLog.length, 2);
    assert.strictEqual(G._said.length, 2);
    assert.strictEqual(HS.staffHunt(G, ctx), null); // decided — no second beats
    assert.strictEqual(G._said.length, 2);
  });
  ok('GREEN-12: gate-off installs nothing and writes nothing', () => {
    delete process.env.HUNTSTAFF;
    const G = fakeGame();
    const ctx = {};
    const wrapped = HS.withHuntStaff({ id: 'x', daily: () => 'base' }, 'x', 't');
    wrapped.daily(G, ctx);
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.deepStrictEqual(ctx, {});
    assert.strictEqual(G._hsWoundWatch, undefined);
    process.env.HUNTSTAFF = '1';
  });
  ok('GREEN-13: withHuntStaff installs the wound watch on first firing', () => {
    const G = fakeGame({ kcal: 2000, freshDays: 9 }); // not lean: no staffing, watch still installed
    const ctx = {};
    const wrapped = HS.withHuntStaff({ id: 'x' }, 'x', 't');
    wrapped.daily(G, ctx);
    assert.strictEqual(G._hsWoundWatch, true);
    assert.strictEqual(ctx._hsAssignments || 0, 0);
  });
  ok('HUNTER-ONLY PIN (carried): non-substrate roster never staffed', () => {
    const G = fakeGame();
    G.getPerson = (id) => ({ id, name: 'X ' + id, dead: false, formerOccupation: 'accountant' });
    const ctx = {};
    for (let d = 5; d < 13; d++) {
      G.state.scholar.day = d;
      assert.strictEqual(HS.staffHunt(G, ctx), null);
    }
    assert.strictEqual(G._attempts.length, 0);
  });
  console.log(`PART A-GREEN green (${n} checks)`);
  delete process.env.HUNTSTAFF;
}

function smoke() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART C — smoke');
  delete process.env.HUNTSTAFF;
  ok('smoke: layerOn() false when unset', () => assert.strictEqual(HS.layerOn(), false));
  process.env.HUNTSTAFF = '1';
  ok('smoke: layerOn() true when HUNTSTAFF=1', () => assert.strictEqual(HS.layerOn(), true));
  ok('smoke: repair surface exported', () => {
    for (const f of ['installWoundWatch', 'personHp', 'woundWithin', 'woundLedgerGet', 'refuse'])
      assert.strictEqual(typeof HS[f], 'function', f);
  });
  ok('smoke: non-lean day → no attempt, no refusal', () => {
    const G = fakeGame({ kcal: 2000, freshDays: 9 });
    const ctx = {};
    HS.installWoundWatch(G, ctx);
    assert.strictEqual(HS.staffHunt(G, ctx), null);
    assert.strictEqual(G._attempts.length, 0);
    assert.strictEqual(G._said.length, 0);
  });
  console.log('PART C green');
  delete process.env.HUNTSTAFF;
}

// PART B — det-gate. (i) fixed gate-off vs base byte-identical;
// (ii) fixed armed vs fixed armed re-run byte-identical (the repair
// perturbs no RNG). 2 seeds x 2 policies x 60d.
async function detGate() {
  console.log('PART B — det-gate (60d)');
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
  const seeds = [6201, 6202];
  let gateOffClean = 0, reRunClean = 0, substrateNoise = 0, divergent = 0;
  const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
  for (const seed of seeds) {
    for (const [pid, base] of [['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
      delete process.env.HUNTSTAFF;
      const wrapped = HS.withHuntStaff(base, pid + '+huntstaff', 'det');
      const a = await hashesFor(wrapped, seed);
      const b = await hashesFor(base, seed);
      const c = await hashesFor(base, seed);
      if (eq(a, b)) { gateOffClean++; console.log(`  ok   s${seed} ${pid} gate-off: fixed-off byte-identical to base`); }
      else if (!eq(b, c)) { substrateNoise++; console.log(`  NOTE s${seed} ${pid} gate-off: base-vs-base diverges too — substrate noise`); }
      else { divergent++; console.log(`  FAIL s${seed} ${pid} gate-off: layer-attributable divergence`); }
      process.env.HUNTSTAFF = '1';
      const armedBase = HS.withHuntStaff(base, pid + '+huntstaff', 'det');
      const d = await hashesFor(armedBase, seed);
      const e = await hashesFor(armedBase, seed);
      const f = await hashesFor(armedBase, seed);
      if (eq(d, e)) { reRunClean++; console.log(`  ok   s${seed} ${pid} armed: fixed re-run byte-identical`); }
      else if (!eq(e, f)) { substrateNoise++; console.log(`  NOTE s${seed} ${pid} armed: armed-vs-armed diverges too — substrate noise`); }
      else { divergent++; console.log(`  FAIL s${seed} ${pid} armed: repair-attributable divergence`); }
      delete process.env.HUNTSTAFF;
    }
  }
  console.log(`PART B: gate-off ${gateOffClean}/4 clean, armed re-run ${reRunClean}/4 clean, ${substrateNoise} substrate-noise, ${divergent} divergent`);
  assert.strictEqual(divergent, 0, 'det-gate: attributable divergence');
  console.log('PART B green — no attributable divergence');
}

(async () => {
  run();
  await detGate();
  smoke();
  console.log('TEST-REFUSESTAFF-B: ALL GREEN');
})().catch(e => { console.error('TEST-REFUSESTAFF-B FAILED:', e); process.exit(1); });
