#!/usr/bin/env node
// scripts/test-wave4reach-20261017.js — proof for the vetrel + VETSHAPE
// composition (flesh-out loop arm sim-wave4reach, 2026-10-17, axis
// scale-onramp, lever-2 lens; findings #469 + #427).
//
// THE COMPOSITION (never measured before): vetrel (scripts/policies/vetrel.js,
// VETREL=1 default OFF — companion-veteran reliability driver; 18-0
// companion wave-3 kills at confirm, evidence/2026-10-16/sim-vetrel.md)
// composed over the pre-seat win-side courtship stack (SD.leadseat /
// SD.belongseat — tribfloor -> withWinDefer -> withSeatDrive, SEATDRIVE=0)
// PLUS the VETSHAPE=1 instrument (src/js/standing.js, default OFF — veteran
// bar counts veteran kills living-or-dead, evidence/2026-10-17/sim-vetshape.md,
// PRIMARY GO +3/16). Both pieces landed; this proof guards the COMPOSITION
// contract only. New files only — nothing here edits vetrel.js or standing.js.
//
// Modes: (default) fixtures + det-gate + non-vacuous check.
//   A. composition fixtures: off = pristine behavior (the RED state);
//      on = dead wave-3 killer counted AND vetrel's stand-down reads the
//      shaped bar (the composition contract).
//   B. det-gate (self-contained, current tree): both layers OFF, composed
//      policy vs the unwrapped SD stack — byte-identical. The vetshape
//      pristine baseline predates the sim-pyrrhic game-code landing
//      (94f78198, src/js/game.js), so it cannot serve as this arm's
//      baseline; this check pins gate-off inertness on the current
//      substrate instead.
//   C. non-vacuous: armed trajectory deterministic and genuinely moves vs
//      off on a pinned seed.
//
// Usage: node scripts/test-wave4reach-20261017.js
//
// Substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
// WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 EXPLICIT, ALLOWGATE2 unset.
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
const VR = require('./policies/vetrel');

const COMPOSED = {
  leadfeast: VR.withVetrel(SD.leadseat, 'vetrel-leadseat',
    'win-side leadfeast stack (SEATDRIVE=0) + VETREL veteran-reliability (VETREL=1)'),
  belongfeast: VR.withVetrel(SD.belongseat, 'vetrel-belongseat',
    'win-side belongfeast stack (SEATDRIVE=0) + VETREL veteran-reliability (VETREL=1)'),
};
const POLICY_IDS = ['leadfeast', 'belongfeast'];
const DET_DAYS = 60;
const NV_SEED = 204; // vetrel's own det seed — protocols engage here

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (!cond) { failed++; console.error(`FAIL ${name}: ${detail || ''}`); return; }
  passed++; console.log(`ok ${name}`);
}

function setComp(on) {
  if (on) { process.env.VETREL = '1'; process.env.VETSHAPE = '1'; }
  else { delete process.env.VETREL; delete process.env.VETSHAPE; }
}

// ---- fixture builders ------------------------------------------------
async function buildGame() {
  const { Game } = await loadGame({ seed: 416, mode: 'wave4reach-proof' });
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

// Two roster vids: one living, one dead. waveKillLog: a w3 kill by each.
function vetFixture(Game) {
  const roster = ((Game.state.village || {}).roster || []);
  const vids = [];
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    if (Game.vpOf(vid)) vids.push(vid);
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

// ---- A. composition fixtures ------------------------------------------
async function fixtures() {
  const Game = await buildGame();
  const { liveVid, deadVid } = vetFixture(Game);

  // A1. Composition OFF (both layers unset): pristine behavior. This is the
  // RED state for the composition — the dead killer is NOT counted and the
  // vetrel layer is silent.
  setComp(false);
  ok('off: vetrel layer reports off', VR.vetrelOn() === false);
  let rd = Game.waveCombatReadiness(4);
  ok('off: veterans counts living killers only', rd.veterans === 1, `veterans=${rd.veterans}`);
  ok('off: veterans bar short at demand 2', rd.short.includes('veterans'),
    `short=${JSON.stringify(rd.short)}`);
  ok('off: vetrel reads the same unmet bar (hunt would not stand down)',
    VR.vetBarMet(Game) === false);

  // A2. Composition ON: the bar changes shape AND the vetrel layer is live.
  // RED on pristine (no VETSHAPE read in standing.js -> veterans stays 1;
  // no vetrel.js -> require fails) = GREEN after the landed pieces.
  setComp(true);
  ok('on: vetrel layer reports on', VR.vetrelOn() === true);
  rd = Game.waveCombatReadiness(4);
  ok('on: dead wave-3 killer counted (bar changes shape)', rd.veterans === 2,
    `veterans=${rd.veterans} (RED on pristine)`);
  ok('on: veterans bar clears at demand 2 with the dead killer',
    !rd.short.includes('veterans'), `short=${JSON.stringify(rd.short)}`);
  ok('on: vetrel stand-down reads the SHAPED bar (composition contract)',
    VR.vetBarMet(Game) === true,
    'vetrel\'s hunt must stand down on the same shaped bar VETSHAPE opens');

  // A3. Demand unchanged in both modes.
  ok('off/on: demand still 2', (() => {
    setComp(false); const a = Game.waveCombatReadiness(4).demand.veterans | 0;
    setComp(true); const b = Game.waveCombatReadiness(4).demand.veterans | 0;
    return a === 2 && b === 2;
  })());

  // A4. Lone dead killer: counts 1 under the new shape, still short of 2.
  Game.state.waveKillLog = [
    { d: 55, mid: 'gavel', w: 3, by: deadVid, via: 'agency', trick: null },
  ];
  setComp(false);
  const offV = Game.waveCombatReadiness(4).veterans;
  setComp(true);
  rd = Game.waveCombatReadiness(4);
  ok('on: lone dead killer counts as 1 (not 0, not 2)', rd.veterans === 1 && offV === 0,
    `on=${rd.veterans} off=${offV}`);
  ok('on: lone dead killer still short of demand 2', rd.short.includes('veterans'));
  ok('on: vetrel does not stand down on a lone dead killer', VR.vetBarMet(Game) === false);

  setComp(false);
}

// ---- B. det-gate: both layers off = pristine ----------------------------
// The composed sweep policy (withVetrel over the SD stack) with VETREL and
// VETSHAPE unset must be byte-identical to the UNWRAPPED SD stack on the
// CURRENT tree. Self-contained: the vetshape pristine baseline
// (scripts/vetshape-det-baseline-20261017.json) predates the sim-pyrrhic
// game-code landing 94f78198 (src/js/game.js: tbEnd now writes waveKillLog
// on 'lost' fights), so it cannot serve as this arm's baseline — the
// substrate moved underneath it. This check pins the composition's gate-off
// inertness on the current substrate instead: the sweep's control arm IS the
// current substrate, byte for byte.
async function trajectory(seed, policyId, compOn, useComposed) {
  setComp(compOn);
  const base = useComposed ? COMPOSED[policyId]
    : (policyId === 'leadfeast' ? SD.leadseat : SD.belongseat);
  const { Game } = await loadGame({ seed, mode: 'wave4reach-det', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hashes = [];
  const oDaily = base.daily;
  const wrapped = Object.assign({}, base);
  wrapped.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(Game.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let r;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days: DET_DAYS, sampleEvery: 30 }); });
  return { traj: hashes.join('|'), days: r.days, endReason: r.endReason };
}

async function detGate() {
  const seeds = [3091137, 3101239]; // the vetshape det seeds — reuse, new baseline semantics
  let allSame = true;
  for (const seed of seeds) {
    for (const policyId of POLICY_IDS) {
      setComp(false); // both layers off on both sides
      const rComposed = await trajectory(seed, policyId, false, true);
      const rBare = await trajectory(seed, policyId, false, false);
      const same = rComposed.traj.length > 0 && rComposed.traj === rBare.traj;
      console.log(`  det-gate ${policyId} s${seed}: ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (composed-vs-unwrapped, endReason=${rComposed.endReason}/${rBare.endReason})`);
      if (!same) allSame = false;
    }
  }
  ok('det-gate: both-layers-off composed == unwrapped stack (byte-identical)', allSame);
}

// ---- C. non-vacuous: the composition genuinely moves the sim ------------
async function nonVacuous() {
  const tOff = await trajectory(NV_SEED, 'leadfeast', false, true);
  const tOn1 = await trajectory(NV_SEED, 'leadfeast', true, true);
  const tOn2 = await trajectory(NV_SEED, 'leadfeast', true, true);
  ok('armed trajectories deterministic (same seed, same env)', tOn1.traj === tOn2.traj);
  ok('composition non-vacuous: armed moves the 60d trajectory vs off',
    tOn1.traj.length > 0 && tOn1.traj !== tOff.traj,
    `seed=${NV_SEED} (identical means the layers never engaged)`);
  setComp(false);
}

(async () => {
  console.log('== wave4reach A: composition fixtures ==');
  await fixtures();
  console.log('== wave4reach B: det-gate (both layers off, composed vs unwrapped) ==');
  await detGate();
  console.log('== wave4reach C: non-vacuous ==');
  await nonVacuous();
  try { delete globalThis.Scattering; } catch (e) {}
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
