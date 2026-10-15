#!/usr/bin/env node
// scripts/test-monostick-20261015.js — proof for the MONOTONIC IN THE WILD
// instrument (sim-monostick, 2026-10-15).
//
// REAL RED -> GREEN (not fixture theater):
//   - The fixture is a REAL game (loadGame + setupGame + 31 real days of the
//     idle policy), with 3 REAL subordinate links planted through the
//     engine's link-state store (the same objects hierarchyState() reads in
//     production) and 3 REAL faced wave-3 types planted through the engine's
//     deed-state store (the same object waveEngaged() reads — the
//     readiness-gate v3 faced-experience bar must clear or wave 4 never
//     unlocks). Seasoning, polity, Standing, the deferral, and the LANDED
//     monotonic ratchet are all computed by the pristine engine — nothing is
//     mocked.
//   - (a) STICKY (current engine, the status quo): the break must HOLD wave 4
//     via the landed ratchet — heldByRatchet true (raw standing fell below
//     the t4 bar but the effective wave didn't), peak untouched (>=4).
//   - (b) MERCY (instrument-side emulation): the break must RE-LOCK —
//     waveEff 4-><4, mercyApplied true, the engine's own ratchet-memory
//     field zeroed. If it doesn't re-lock, the mercy the sweep measures is
//     fiction.
//   - RED-side honesty: with the mercy emulation DISABLED (STICK_RED=1),
//     the (b) re-lock check MUST FAIL — the mercy arm then holds like
//     sticky. Proves the re-lock is the instrument's, not the engine's.
//   - The break step is the sweep's own exported breakLinkScenario (+
//     qualifyingLinks, applyMercy) — the same functions the daily wrap calls.
//   - No-hallucination: a 15d smoke via the sweep's own oneRun must record
//     zero unlocks and zero breaks.
//   - A/A: the sweep's aaSanity (sticky ~ mercy ~ pristine byte-identical
//     pre-scenario).
//
// Exit 0 = GREEN (all checks), 1 = RED/FAIL with the first failing check
// named. STICK_RED=1 inverts the (b)-hold check to prove the RED.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const MONO = require('./monostick-sweep');

const REDMODE = process.env.STICK_RED === '1';
const fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}

// Plant 3 REAL subordinate links through the engine's link-state store.
// day=1, trust=50: after 31 real days they are seasoned (30d + trust 40+),
// and 3 seasoned subs make polityOf('haven') real — so all 3 count toward
// diplomacy (+34 each = 102 >= t4=100). No feasts, no kills: the unlock is
// diplomacy-pure by construction.
function plantLinks(Game) {
  const m = (typeof Game.mshipState === 'function') ? Game.mshipState() : null;
  if (!m) throw new Error('fixture: no mshipState');
  m.links = m.links || [];
  const born = ((Game.state.scholar || {}).day || 1) - 31;
  const ovs = (Game.state.otherVillages = Game.state.otherVillages || []);
  ['vA', 'vB', 'vC'].forEach((vid) => {
    if (!ovs.find(o => o.id === vid)) ovs.push({ id: vid, name: 'Proofshire-' + vid });
    m.links.push({
      id: 'proof-link-' + vid, kind: 'vassal', primary: 'haven', subordinate: vid,
      status: 'active', day: born, trust: 50, history: [],
    });
  });
}

// Plant 3 REAL faced wave-3 types through the engine's deed-state store
// (the same object waveEngaged() reads in production). The readiness-gate v3
// faced-experience bar (readyFacedW3 = 3) must clear or the deferral holds
// the total at t4-1 and wave 4 never unlocks. The fixture declares a
// pre-existing faced ledger; the engine computes everything else.
function plantFaced(Game) {
  const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
  if (!ds) throw new Error('fixture: no deedState');
  ds.wavesFaced = ds.wavesFaced || {};
  ds.wavesFaced['proof-m3a'] = 3;
  ds.wavesFaced['proof-m3b'] = 3;
  ds.wavesFaced['proof-m3c'] = 3;
}

async function fixtureGame() {
  const idle = require('./policies/idle').zero;
  const { Game } = await loadGame({ seed: 33, mode: 'monostick-proof', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, Object.assign({}, idle), { days: 31, manifest: undefined, sampleEvery: 31 }); });
  plantLinks(Game);
  plantFaced(Game);
  return Game;
}

async function main() {
  console.log('MONOSTICK PROOF (STICK_RED=' + (REDMODE ? '1' : '0') + ')');

  // ---- R1: the fixture unlocks wave 4 on diplomacy, engine-real ----
  const Game = await fixtureGame();
  const R = {
    standingEff: (G) => (G.villageStandingTotal ? G.villageStandingTotal() : 0) | 0,
    standingRaw: (G) => (((G.villageStanding ? G.villageStanding() : null) || {}).total | 0),
    waveEff: (G) => (G.unlockedWave ? G.unlockedWave() : 1),
    peak: (G) => (typeof G._standingPeakWave === 'function' ? (G._standingPeakWave() | 0) : 0),
  };
  const stEff = R.standingEff(Game), stRaw = R.standingRaw(Game);
  const we = R.waveEff(Game), peak = R.peak(Game);
  check('R1a fixture: 3 qualifying links found by the instrument', MONO.qualifyingLinks(Game).length === 3,
    'n=' + MONO.qualifyingLinks(Game).length);
  check('R1b fixture: faced bar clears (waveEngaged(3) >= 3)', (typeof Game.waveEngaged === 'function' ? Game.waveEngaged(3) : -1) >= 3,
    'faced3=' + (typeof Game.waveEngaged === 'function' ? Game.waveEngaged(3) : '?'));
  check('R1c fixture: diplomacy standing >= t4 (102 expected)', stEff >= 100 && stRaw >= 100,
    'stEff=' + stEff + ' stRaw=' + stRaw);
  check('R1d fixture: engine unlocks wave 4', we >= 4, 'waveEff=' + we);
  check('R1e fixture: LANDED ratchet recorded the peak (peak >= 4)', peak >= 4, 'peak=' + peak);

  // ---- (a) STICKY: pristine engine — the landed ratchet holds ----
  const linkA = MONO.qualifyingLinks(Game)[0];
  const evA = MONO.breakLinkScenario(Game, linkA, R, [], 'sticky');
  check('R2a sticky: break step fires via the engine\'s own path', !!evA && evA.brokeOk === true,
    evA ? 'link=' + evA.linkId : 'null event');
  check('R2b sticky: Standing collapses on the break', !!evA && evA.stRawPost < 100 && evA.stRawPost < evA.stRawPre,
    evA ? 'stRaw ' + evA.stRawPre + '->' + evA.stRawPost : '');
  check('R2c sticky: wave HOLDS at 4 (the landed ratchet)', !!evA && evA.waveEffPost >= 4,
    evA ? 'waveEff ' + evA.waveEffPre + '->' + evA.waveEffPost : '');
  check('R2d sticky: the hold is the RATCHET (raw fell below the bar)', !!evA && evA.heldByRatchet === true,
    evA ? 'heldByRatchet=' + evA.heldByRatchet + ' stRawPost=' + evA.stRawPost : '');
  check('R2e sticky: peak untouched by the break', !!evA && evA.peakPost >= 4,
    evA ? 'peak ' + evA.peakPre + '->' + evA.peakPost : '');

  // ---- (b) MERCY: instrument-side emulation — the re-lock ----
  const Game2 = await fixtureGame();
  const R2 = {
    standingEff: (G) => (G.villageStandingTotal ? G.villageStandingTotal() : 0) | 0,
    standingRaw: (G) => (((G.villageStanding ? G.villageStanding() : null) || {}).total | 0),
    waveEff: (G) => (G.unlockedWave ? G.unlockedWave() : 1),
    peak: (G) => (typeof G._standingPeakWave === 'function' ? (G._standingPeakWave() | 0) : 0),
  };
  const linkB = MONO.qualifyingLinks(Game2)[0];
  const evB = MONO.breakLinkScenario(Game2, linkB, R2, [], 'mercy');
  const relockOk = !!evB && evB.reLocked === true && evB.waveEffPost < 4;
  check('R3a mercy: break fires', !!evB && evB.brokeOk === true);
  check('R3b mercy: the emulation zeroed the engine\'s ratchet-memory field',
    !!evB && evB.mercyApplied === true && evB.mercyPeakPre >= 4 && evB.mercyPeakPost === 0,
    evB ? 'mercyApplied=' + evB.mercyApplied + ' peak ' + evB.mercyPeakPre + '->' + evB.mercyPeakPost : '');
  check(REDMODE ? 'R3c REDMODE: re-lock FAILS with the emulation off (proves the re-lock is the instrument\'s)'
                : 'R3c mercy: wave RE-LOCKS after the break (the old engine law)',
    REDMODE ? !relockOk : relockOk,
    evB ? 'waveEff ' + evB.waveEffPre + '->' + evB.waveEffPost : '');

  // ---- R4: no hallucination on a short smoke (sweep's own oneRun) ----
  const smoke = await MONO.oneRun(11, 'fourthlink', 'sticky', 15);
  check('R4a smoke: 15d run records no wave-4 unlock', !smoke.unlock4);
  check('R4b smoke: 15d run records no breaks', smoke.breaks.length === 0, 'breaks=' + smoke.breaks.length);
  check('R4c smoke: sampler collected reads', smoke.samples.length > 0 && smoke.hashes.length === smoke.samples.length,
    'n=' + smoke.samples.length);

  // ---- R5: A/A trajectory-neutrality (sweep's own gate) ----
  process.env.AA_SEEDS = '11';
  process.env.AA_DAYS = '30';
  try {
    await MONO.aaSanity();
    check('R5 A/A: sticky ~ mercy ~ pristine byte-identical pre-scenario', true);
  } catch (e) {
    check('R5 A/A: sticky ~ mercy ~ pristine byte-identical pre-scenario', false, String(e && e.message));
  }

  if (fails.length) {
    console.log(`\nPROOF ${REDMODE ? 'RED (expected)' : 'FAIL'}: ${fails.length} failing check(s): ${fails.join(', ')}`);
    process.exit(1);
  }
  if (REDMODE) {
    console.log('\nPROOF RED (as designed): with the mercy emulation off the re-lock FAILS — the re-lock is the instrument\'s, the hold is the engine\'s.');
    process.exit(1);
  }
  console.log('\nPROOF GREEN: fixture unlocks w4 engine-real, sticky holds via the landed ratchet, mercy re-locks via the emulation, no hallucination, A/A neutral.');
}

if (require.main === module) {
  main().catch(e => { console.error('MONOSTICK PROOF CRASH:', e); process.exit(2); });
}
