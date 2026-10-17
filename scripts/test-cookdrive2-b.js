#!/usr/bin/env node
// scripts/test-cookdrive2-b.js — proof for the cook-drive duty-cadence lever
// (loop B sim-cookdrive2-b, 2026-10-17, food-economy axis).
//
// WHY: finding #462 — the cook smoke drive is eligibility/duty-bound, not
// budget-bound (smokes 0.5–2k kcal/day vs a 4000 kcal/resolution x ~3/day =
// 12k/day budget). The named next is to tune the drive itself: duty cadence
// or the 250/person dinner-reserve size. The reserve was killed twice
// (dinreserve 2026-10-13, dinreserve2 2026-10-14: 250→125 raised throughput
// +28% but fresh-rot share flat — extra preserved kcal went to stomachs).
// This arm tests DUTY CADENCE: consolidate the smoke pass to once per day
// (first cook-duty resolution), instead of every cook resolution (~3x/day).
// Under env gate COOKDRIVE2_B=1 (default OFF).
//
// Modes:
//   --capture   (run on pristine OR gate-off == pristine): record day-hash
//               trajectories into scripts/cookdrive2-det-baseline-20261017.json.
//   (default)   fixtures + det-gate:
//     (a) consolidation ONLY under COOKDRIVE2_B=1 — RED on pristine when the
//         gate code is absent (gate-on fixture fails), GREEN after the edit.
//     (b) no laundering gate-on: spoiled stacks still excluded.
//     (c) the once-per-day flag resets on a new day.
//     (d) det-gate: gate-off trajectories byte-identical to the baseline.
//
// Usage:
//   node scripts/test-cookdrive2-b.js                      # fixtures + det-gate
//   COOKDRIVE2_B=1 node scripts/test-cookdrive2-b.js       # gate-on fixtures
//   node scripts/test-cookdrive2-b.js --capture            # baseline
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const GATE = process.env.COOKDRIVE2_B === '1';
const DET_SEEDS = [4801, 4802, 4803, 4804];
const DET_POLICIES = ['leadfeast', 'belongfeast'];
const DET_DAYS = 40;
const BASELINE_PATH = path.join(__dirname, 'cookdrive2-det-baseline-20261017.json');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}: ${detail || ''}`); return; }
  passed++; console.log(`ok ${name}`);
}

async function hashesOnce(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'cookdrive2-det', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hashes = [];
  const wrapped = Object.assign({}, base);
  const oDaily = base.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days: DET_DAYS, sampleEvery: 1 }); });
  return { hashes, days: r.days, endReason: r.endReason };
}

async function captureBaseline() {
  const out = { captured: new Date().toISOString(), seeds: DET_SEEDS, policies: DET_POLICIES,
    days: DET_DAYS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', COOKDRIVE2_B: 'unset' }, combos: {} };
  for (const seed of DET_SEEDS) {
    for (const policyId of DET_POLICIES) {
      const r1 = await hashesOnce(seed, policyId);
      const r2 = await hashesOnce(seed, policyId);
      const same = r1.hashes.length === r2.hashes.length && r1.hashes.every((h, i) => h === r2.hashes[i]);
      out.combos[`${policyId}-s${seed}`] = { hashes: r1.hashes, selfDeterministic: same,
        days: r1.days, endReason: r1.endReason };
      console.log(`  captured ${policyId} s${seed}: ${r1.hashes.length} day-hashes, self-deterministic=${same}`);
    }
  }
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 1));
  console.log(`baseline written to ${BASELINE_PATH}`);
}

// Build a rigged pantry: `near` stacks are eligible (sd-day=1), total fresh
// above the 250/person dinner reserve so the drive actually smokes.
function rigPantry(Game, day, tag) {
  const v = Game.state.village;
  const n = (v.roster || []).length || 10;
  v.pantry = [
    { name: 'Fresh-near', kcalEach: 500, units: 10, foodState: 'fresh', foodKind: 'meat', spoilDay: day + 1, safe: true, _tag: tag },
    { name: 'Fresh-near2', kcalEach: 500, units: 10, foodState: 'fresh', foodKind: 'meat', spoilDay: day + 1, safe: true, _tag: tag },
    { name: 'Spoiled', kcalEach: 500, units: 4, foodState: 'fresh', foodKind: 'meat', spoilDay: day - 1, safe: true, _tag: 'spoiled' },
  ];
  return n;
}

function liveVids(Game, count) {
  const v = Game.state.village;
  return (v.roster || []).filter(id => id !== Game.villagerId && !(Game.getPerson(id) || {}).dead).slice(0, count);
}

function smokedTags(Game) {
  return Game.state.village.pantry.filter(it => it.foodState === 'preserved').map(it => it._tag);
}

function freshUnitsByTag(Game, tag) {
  return Game.state.village.pantry
    .filter(it => it.foodState !== 'preserved' && it._tag === tag)
    .reduce((t, it) => t + (it.units || 0), 0);
}

async function fixtures() {
  for (const seed of [11, 22]) {
    if (GATE) process.env.COOKDRIVE2_B = '1'; else delete process.env.COOKDRIVE2_B;
    const { Game } = await loadGame({ seed, mode: 'cookdrive2-fixture', fullTelemetry: false });
    await quietLog(async () => { await setupGame(Game); });
    const day = (Game.state.scholar || {}).day || 1;
    const [vid1, vid2] = liveVids(Game, 2);
    assert(vid1 && vid2, 'need two live villagers');

    // Resolution 1 (day D): rig, resolve — smoke pass must run both gates.
    rigPantry(Game, day, 'r1');
    await quietLog(async () => { Game.resolveOneAssignment(vid1, { task: 'cook' }); });
    const r1smoked = smokedTags(Game).includes('r1');
    ok(`seed${seed} (a) first cook resolution smokes (both gates)`, r1smoked, `GATE=${GATE}`);

    // Resolution 2 (same day D): replenish, resolve.
    rigPantry(Game, day, 'r2');
    await quietLog(async () => { Game.resolveOneAssignment(vid2, { task: 'cook' }); });
    const r2smoked = smokedTags(Game).includes('r2');
    if (!GATE) {
      ok(`seed${seed} (a) gate-off: second same-day cook resolution smokes`, r2smoked, '');
    } else {
      ok(`seed${seed} (a) gate-on: second same-day cook resolution SKIPS smoke`, !r2smoked,
        `r2 fresh units still=${freshUnitsByTag(Game, 'r2')}`);
    }

    // (b) no laundering: spoiled stack never converted (either gate, either resolution).
    const spoiledSmoked = smokedTags(Game).includes('spoiled');
    ok(`seed${seed} (b) spoiled stack never smoked (no laundering)`, !spoiledSmoked, `GATE=${GATE}`);

    // (c) new day: the once-per-day flag resets — first cook of day D+1 smokes again.
    if (GATE) {
      Game.state.scholar.day = day + 1;
      rigPantry(Game, day + 1, 'r3');
      await quietLog(async () => { Game.resolveOneAssignment(vid1, { task: 'cook' }); });
      const r3smoked = smokedTags(Game).includes('r3');
      ok(`seed${seed} (c) gate-on: new day's first cook smokes again`, r3smoked, '');
    }
  }
}

async function detGate() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error('DET-GATE SKIPPED: baseline file missing (run --capture first).');
    process.exit(4);
  }
  const base = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  let checked = 0, excluded = 0;
  for (const policyId of DET_POLICIES) {
    for (const seed of DET_SEEDS) {
      const key = `${policyId}-s${seed}`;
      const b = base.combos[key];
      if (!b) { console.error(`FAIL det-gate ${key}: missing from baseline`); failed++; continue; }
      if (!b.selfDeterministic) {
        excluded++;
        console.log(`skip det-gate ${key}: pristine itself nondeterministic (known entropy issue)`);
        continue;
      }
      delete process.env.COOKDRIVE2_B;
      const r = await hashesOnce(seed, policyId);
      const same = r.hashes.length === b.hashes.length && r.hashes.every((h, i) => h === b.hashes[i]);
      checked++;
      ok(`det-gate gate-off byte-identical to pristine (${key})`, same,
        `n=${r.hashes.length}/${b.hashes.length}`);
    }
  }
  console.log(`det-gate: ${checked} checked, ${excluded} entropy-excluded`);
}

async function main() {
  if (process.argv.includes('--capture')) { await captureBaseline(); return; }
  await fixtures();
  await detGate();
  console.log(`\n${passed} passed, ${failed} failed (GATE=${GATE})`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
