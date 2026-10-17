#!/usr/bin/env node
// scripts/test-vetshape-20261017.js — proof for the veteran-bar shape
// instrument (flesh-out loop arm sim-vetshape, 2026-10-17, scale-onramp axis).
//
// THE INSTRUMENT (named next from sim-wave4census): the readiness gate's
// veteran bar (design call #4, src/js/standing.js waveCombatReadiness)
// demands 2 LIVING veterans — living roster members with a wave-(w-1)+ kill
// in state.waveKillLog. The census found it in the binding set on 29/34
// non-winning runs (85%), failing 100% of 3,131 deferral days, never
// reaching demand 2 on any run: the kill channel is scholar-centric and
// killers die — the bar demands 2 living killers from a channel that
// produces at most one at a time. The instrument changes the bar's SHAPE:
// VETSHAPE=1 counts DISTINCT KILLER VIDS in the same ledger, living-or-dead.
// Demand unchanged (2 for wave 4). DEFAULT OFF; gate-off = pristine behavior,
// byte-identical. This is an instrument for Steve's #427 call — NOT a game
// change: the game default stays 2-living-veterans until Steve rules.
//
// Modes:
//   --capture   (run BEFORE the standing.js edit, on pristine): record
//               day-hash trajectories (two pristine runs per combo) into
//               scripts/vetshape-det-baseline-20261017.json.
//   (default)   fixtures + det-gate:
//     (a) RED-pinned gate-on fixtures: VETSHAPE=1 counts a dead wave-3
//         killer where pristine does not — FAIL on pristine code (the env
//         read doesn't exist there), GREEN after the edit.
//     (b) gate-off fixtures: pristine parity (living-only count, demand 2).
//     (c) det-gate: gate-off 60d trajectories byte-identical to the
//         committed pristine baseline.
//
// Usage:
//   node scripts/test-vetshape-20261017.js --capture   # on pristine, before edit
//   node scripts/test-vetshape-20261017.js            # fixtures + det-gate
//   VETSHAPE=1 node scripts/test-vetshape-20261017.js # (gate-on fixtures run in-process too)
//
// Substrate (wincensus-c control stack, pre-seat): FEASTSCALE_R13=1
// TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
// SEATDRIVE=0 EXPLICIT (seat driver delegates to the wrapped stack),
// ALLOWGATE2 unset.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');

const DET_SEEDS = [3091137, 3101239];
const DET_POLICIES = ['leadfeast', 'belongfeast'];
const DET_DAYS = 60;
const BASELINE_PATH = path.join(__dirname, 'vetshape-det-baseline-20261017.json');

function policyFor(id) { return id === 'leadfeast' ? SD.leadseat : SD.belongseat; }

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}: ${detail || ''}`); return; }
  passed++; console.log(`ok ${name}`);
}

// ---- fixture builders ------------------------------------------------
async function buildGame() {
  const { Game } = await loadGame({ seed: 416, mode: 'vetshape-proof' });
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

// Two roster vids: one living, one dead. waveKillLog: a w3 kill by each.
function vetFixture(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  const vids = [];
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    const vp = Game.vpOf(vid);
    if (vp) vids.push(vid);
    if (vids.length >= 2) break;
  }
  assert(vids.length >= 2, 'need 2 roster vids for fixture');
  const [liveVid, deadVid] = vids;
  Game.vpOf(deadVid).dead = true;
  Game.state.waveKillLog = [
    { d: 50, mid: 'redactor', w: 3, by: liveVid, via: 'player', trick: null },
    { d: 55, mid: 'gavel', w: 3, by: deadVid, via: 'agency', trick: null },
  ];
  Game.state.monsterCounters = {};
  return { liveVid, deadVid };
}

// ---- fixtures --------------------------------------------------------
async function fixtures() {
  const Game = await buildGame();
  const { liveVid, deadVid } = vetFixture(Game);

  // (b) gate-off = pristine parity: dead killer excluded, demand 2.
  delete process.env.VETSHAPE;
  let rd = Game.waveCombatReadiness(4);
  ok('gate-off: veterans counts living killers only', rd.veterans === 1,
    `veterans=${rd.veterans}`);
  ok('gate-off: veterans bar still short (demand 2)', rd.short.includes('veterans'),
    `short=${JSON.stringify(rd.short)}`);
  ok('gate-off: demand unchanged', rd.demand && (rd.demand.veterans | 0) === 2,
    `demand=${JSON.stringify(rd.demand && rd.demand.veterans)}`);

  // (a) RED-pinned: gate-on counts the dead killer. On pristine standing.js
  // this assertion FAILS (no VETSHAPE read exists — living-only count) = RED.
  process.env.VETSHAPE = '1';
  rd = Game.waveCombatReadiness(4);
  ok('gate-on: dead wave-3 killer counted (bar changes shape)', rd.veterans === 2,
    `veterans=${rd.veterans} (RED on pristine)`);
  ok('gate-on: veterans bar clears at demand 2 with dead killer', !rd.short.includes('veterans'),
    `short=${JSON.stringify(rd.short)}`);
  ok('gate-on: demand still 2', rd.demand && (rd.demand.veterans | 0) === 2,
    `demand=${JSON.stringify(rd.demand && rd.demand.veterans)}`);

  // gate-on with ONLY a dead killer: counts 1, still short of 2 (demand at 2).
  Game.state.waveKillLog = [
    { d: 55, mid: 'gavel', w: 3, by: deadVid, via: 'agency', trick: null },
  ];
  rd = Game.waveCombatReadiness(4);
  ok('gate-on: lone dead killer counts as 1', rd.veterans === 1, `veterans=${rd.veterans}`);
  ok('gate-on: lone dead killer still short of demand 2', rd.short.includes('veterans'));

  // scholar killer: counted in both modes (scholar is always "living").
  Game.state.waveKillLog = [
    { d: 60, mid: 'spool', w: 3, by: Game.villagerId, via: 'player', trick: null },
  ];
  delete process.env.VETSHAPE;
  const off = Game.waveCombatReadiness(4).veterans;
  process.env.VETSHAPE = '1';
  const on = Game.waveCombatReadiness(4).veterans;
  ok('scholar killer counted identically both modes', off === 1 && on === 1,
    `off=${off} on=${on}`);

  // wave-5 shape: w4 kill by dead vid.
  Game.state.waveKillLog = [
    { d: 120, mid: 'congregation', w: 4, by: deadVid, via: 'agency', trick: null },
    { d: 121, mid: 'strike', w: 4, by: liveVid, via: 'player', trick: null },
  ];
  delete process.env.VETSHAPE;
  const w5off = Game.waveCombatReadiness(5);
  process.env.VETSHAPE = '1';
  const w5on = Game.waveCombatReadiness(5);
  ok('wave-5 gate-off: dead w4 killer excluded', w5off.veterans === 1,
    `veterans=${w5off.veterans}`);
  ok('wave-5 gate-on: dead w4 killer counted, demand still 3', w5on.veterans === 2 &&
    (w5on.demand.veterans | 0) === 3, `veterans=${w5on.veterans} demand=${w5on.demand.veterans}`);

  // sub-threshold wave kills never count (w2 kill for a wave-4 bar).
  Game.state.waveKillLog = [
    { d: 30, mid: 'moderator', w: 2, by: deadVid, via: 'player', trick: null },
  ];
  process.env.VETSHAPE = '1';
  rd = Game.waveCombatReadiness(4);
  ok('gate-on: sub-threshold (w2) kills still excluded', rd.veterans === 0,
    `veterans=${rd.veterans}`);

  // waves 1-3 never gated, both modes.
  delete process.env.VETSHAPE;
  ok('waves 1-3 never gated (off)', [1, 2, 3].every(w => Game.waveCombatReadiness(w).ready));
  process.env.VETSHAPE = '1';
  ok('waves 1-3 never gated (on)', [1, 2, 3].every(w => Game.waveCombatReadiness(w).ready));
  delete process.env.VETSHAPE;
}

// ---- det-gate ---------------------------------------------------------
async function hashesOnce(seed, policyId) {
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'vetshape-det', fullTelemetry: false });
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
    days: DET_DAYS, env: { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
      WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', VETSHAPE: 'unset' }, combos: {} };
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
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(out));
  console.log(`baseline written to ${BASELINE_PATH}`);
}

async function detGate() {
  const base = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  ok('det baseline loads', !!base.combos, BASELINE_PATH);
  let allSame = true;
  for (const seed of base.seeds) {
    for (const policyId of base.policies) {
      delete process.env.VETSHAPE; // gate-off: must equal pristine
      const r = await hashesOnce(seed, policyId);
      const b = base.combos[`${policyId}-s${seed}`];
      const same = r.hashes.length === b.hashes.length && r.hashes.every((h, i) => h === b.hashes[i]);
      console.log(`  det-gate ${policyId} s${seed}: ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${r.hashes.length} vs ${b.hashes.length} hashes, endReason=${r.endReason}/${b.endReason})`);
      if (!same) allSame = false;
    }
  }
  ok('det-gate: gate-off trajectories byte-identical to pristine baseline', allSame);
}

(async () => {
  if (process.argv.includes('--capture')) { await captureBaseline(); return; }
  console.log('== vetshape fixtures ==');
  await fixtures();
  console.log('== vetshape det-gate (gate-off vs pristine baseline) ==');
  await detGate();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
