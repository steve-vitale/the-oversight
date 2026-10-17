#!/usr/bin/env node
// scripts/test-cookwin-b.js — proof for the cook-window lever (loop B
// sim-cookwin-b, 2026-10-17, food-economy axis).
//
// WHY: the duty-time cook drive only sees the about-to-rot surplus
// (spoilDay-day<=2). Findings #71/#99 show the eligible-surplus definition
// (not the budget, not the reserve) is the binding constraint on smoking.
// The lever widens the window to <=4 under env gate COOKWIN_B=1 (default
// OFF), smoking days-3..4-out fresh at the blind 0.80x canon yield.
//
// Modes:
//   --capture   (run BEFORE the game edit, on pristine): record day-hash
//               trajectories (two pristine runs per combo) into
//               scripts/cookwin-det-baseline-20261017.json.
//   (default)   fixtures + det-gate:
//     (a) window widens ONLY under COOKWIN_B=1 — RED on pristine when the
//         gate code is absent (gate-on fixture fails), GREEN after the edit.
//     (b) spoiled stacks still excluded gate-on (no laundering, convert-time).
//     (c) det-gate: gate-off trajectories byte-identical to the committed
//         pristine baseline (entropy-broken combos, where pristine itself
//         diverged pre-edit, are excluded with evidence).
//
// Usage:
//   node scripts/test-cookwin-b.js                      # fixtures + det-gate
//   COOKWIN_B=1 node scripts/test-cookwin-b.js          # gate-on fixtures
//   node scripts/test-cookwin-b.js --capture            # pristine baseline
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const GATE = process.env.COOKWIN_B === '1';
const DET_SEEDS = [4701, 4702, 4703, 4704];
const DET_POLICIES = ['leadfeast', 'belongfeast'];
const DET_DAYS = 40;
const BASELINE_PATH = path.join(__dirname, 'cookwin-det-baseline-20261017.json');

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}: ${detail || ''}`); return; }
  passed++; console.log(`ok ${name}`);
}

async function hashesOnce(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'cookwin-det', fullTelemetry: false });
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
    days: DET_DAYS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', COOKWIN_B: 'unset' }, combos: {} };
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

async function fixtures() {
  // (a) window fixture: eligible stack at sd-day=3 (beyond the base window)
  // plus a control stack at sd-day=1 (inside the base window).
  for (const seed of [11, 22]) {
    const { Game, day, newPres, convUnits } = await (async () => {
      if (GATE) process.env.COOKWIN_B = '1'; else delete process.env.COOKWIN_B;
      const { Game } = await loadGame({ seed, mode: 'cookwin-fixture', fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const v = Game.state.village;
      const day = (Game.state.scholar || {}).day || 1;
      const n = (v.roster || []).length || 10;
      // NOTE: stacks are tagged so we can tell which were converted.
      // Dinner reserve is 250/person = 2500 for 10 — keep total fresh ABOVE
      // the reserve so the drive actually smokes (excess beyond reserve).
      v.pantry = [
        { name: 'Fresh-near', kcalEach: 500, units: 10, foodState: 'fresh', foodKind: 'meat', spoilDay: day + 1, safe: true, _tag: 'near' },   // sd-day=1: always eligible
        { name: 'Fresh-mid', kcalEach: 500, units: 10, foodState: 'fresh', foodKind: 'meat', spoilDay: day + 3, safe: true, _tag: 'mid' },     // sd-day=3: eligible only gate-on
        { name: 'Fresh-far', kcalEach: 500, units: 10, foodState: 'fresh', foodKind: 'meat', spoilDay: day + 6, safe: true, _tag: 'far' },     // sd-day=6: never eligible
        { name: 'Spoiled', kcalEach: 500, units: 4, foodState: 'fresh', foodKind: 'meat', spoilDay: day - 1, safe: true, _tag: 'spoiled' },      // spoiled: never smoked (laundering guard)
      ];
      const vid = (v.roster || []).find(id => id !== Game.villagerId && !(Game.getPerson(id) || {}).dead);
      assert(vid, 'no live villager');
      // pre-convert unit counts per tag (the reserve split may convert only
      // part of a stack — input = pre units minus units still fresh after).
      const preUnits = {};
      for (const it of v.pantry) preUnits[it._tag] = (preUnits[it._tag] || 0) + (it.units || 0);
      await quietLog(async () => { Game.resolveOneAssignment(vid, { task: 'cook' }); });
      const postFreshUnits = {};
      for (const it of v.pantry) {
        if (it.foodState !== 'preserved') postFreshUnits[it._tag] = (postFreshUnits[it._tag] || 0) + (it.units || 0);
      }
      const newPres = v.pantry.filter(it => it.foodState === 'preserved' && (it._tag === 'near' || it._tag === 'mid' || it._tag === 'far' || it._tag === 'spoiled'));
      const convUnits = {}; // pre-convert input units per tag
      for (const it of newPres) {
        convUnits[it._tag] = (convUnits[it._tag] || 0) + (it.units || 0);
      }
      return { Game, day, newPres, convUnits };
    })();
    const tags = newPres.map(it => it._tag);
    const nearSmoked = tags.includes('near');
    const midSmoked = tags.includes('mid');
    const farSmoked = tags.includes('far');
    const spoiledSmoked = tags.includes('spoiled');
    ok(`seed${seed} (a) near-window (sd-day=1) smoked both gates`, nearSmoked,
      `tags=[${tags}] GATE=${GATE}`);
    if (!GATE) {
      ok(`seed${seed} (a) gate-off: mid-window (sd-day=3) NOT smoked`, !midSmoked,
        `tags=[${tags}]`);
    } else {
      ok(`seed${seed} (a) gate-on: mid-window (sd-day=3) smoked`, midSmoked,
        `tags=[${tags}]`);
    }
    ok(`seed${seed} (a) far-window (sd-day=6) never smoked`, !farSmoked,
      `tags=[${tags}] GATE=${GATE}`);
    // (b) no laundering gate-on: spoiled stack must never be converted
    ok(`seed${seed} (b) spoiled stack never smoked (no laundering)`, !spoiledSmoked,
      `tags=[${tags}] GATE=${GATE}`);
    // (b2) honesty: converted stacks keep the blind 0.80x yield — output
    // must be <= input and >= 0.79x (rounding). Input units = pre-convert
    // units minus units still fresh (the reserve split only smokes excess).
    const gotByTag = {};
    for (const it of newPres) gotByTag[it._tag] = (gotByTag[it._tag] || 0) + (it.kcalEach || 0) * (it.units || 0);
    for (const tag of Object.keys(convUnits)) {
      const input = convUnits[tag] * 500; // rigged stacks are 500 kcalEach
      const got = gotByTag[tag] || 0;
      ok(`seed${seed} (b2) ${tag} honest yield 0.79..1.0x`, got <= input && got >= input * 0.79,
        `got=${got} input=${input}`);
    }
  }
}

async function detGate() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error('DET-GATE SKIPPED: baseline file missing (run --capture on pristine first).');
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
        console.log(`skip det-gate ${key}: pristine itself nondeterministic pre-edit (known entropy issue)`);
        continue;
      }
      delete process.env.COOKWIN_B;
      const r = await hashesOnce(seed, policyId);
      const same = r.hashes.length === b.hashes.length && r.hashes.every((h, i) => h === b.hashes[i]);
      checked++;
      ok(`det-gate gate-off byte-identical to pristine (${key})`, same,
        `n=${r.hashes.length}/${b.hashes.length}`);
    }
  }
  console.log(`det-gate: ${checked} checked, ${excluded} entropy-excluded`);
}

(async () => {
  if (process.argv.includes('--capture')) { await captureBaseline(); return; }
  await fixtures();
  await detGate();
  console.log(`\n${passed} passed, ${failed} failed (GATE=${GATE})`);
  if (failed) process.exitCode = 1;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
