#!/usr/bin/env node
// scripts/test-monotonic-20261015.js — proof for the link-break /
// monotonic-unlock diagnostic instrument (sim-monotonic, 2026-10-15).
//
// REAL RED -> GREEN (not fixture theater):
//   - The fixture is a REAL game (loadGame + setupGame + 31 real days of the
//     idle policy), with 3 REAL subordinate links planted through the
//     engine's link-state store (the same objects hierarchyState() reads in
//     production). Seasoning, polity, and Standing are all computed by the
//     pristine engine — nothing is mocked.
//   - (a) RED-side honesty: with the monotonic overlay DISABLED
//     (MONO_RED=1), the break MUST re-lock. If it doesn't, the re-lock the
//     diagnostic measures isn't engine-real and the whole instrument is
//     fiction. Default (overlay on) must HOLD.
//   - (b) The break step is the sweep's own exported breakLinkScenario — the
//     same function the daily wrap calls — plus qualifyingLinks.
//   - No-hallucination: a 15d smoke via the sweep's own oneRun must record
//     zero unlocks and zero breaks.
//   - A/A: the sweep's aaSanity (instrument vs pristine byte-identical).
//
// Exit 0 = GREEN (all checks), 1 = RED/FAIL with the first failing check
// named. MONO_RED=1 inverts the (b)-hold check to prove the RED.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const MONO = require('./monotonic-sweep');

const REDMODE = process.env.MONO_RED === '1';
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
  // The links are 31 days old relative to the fixture's clock (a seasoned
  // relationship by the engine's own 30d rule): the fixture declares a
  // pre-existing seasoned realm, the engine computes everything else.
  const born = ((Game.state.scholar || {}).day || 1) - 31;
  const ovs = (Game.state.otherVillages = Game.state.otherVillages || []);
  ['vA', 'vB', 'vC'].forEach((vid, i) => {
    if (!ovs.find(o => o.id === vid)) ovs.push({ id: vid, name: 'Proofshire-' + vid });
    m.links.push({
      id: 'proof-link-' + vid, kind: 'vassal', primary: 'haven', subordinate: vid,
      status: 'active', day: born, trust: 50, history: [],
    });
  });
}

function readersOf(Game, rawUW) {
  return {
    standingRaw: (G) => { try { return (G.villageStandingTotal ? G.villageStandingTotal() : 0) | 0; } catch (e) { return 0; } },
    waveRaw: (G) => { try { return rawUW.call(G); } catch (e) { return 1; } },
    waveEff: (G) => { try { return G.unlockedWave ? G.unlockedWave() : 1; } catch (e) { return 1; } },
  };
}

// The instrument-side monotonic overlay, re-derived from the killed v2
// spec (sim-readinessgate2.md): "once the gated total releases wave w, the
// effective total never drops below that wave's threshold again."
// Same shape as the sweep's arm='sticky' wrap.
function installOverlay(Game, rawUW) {
  let peak = 0;
  const self = Game;
  Game.unlockedWave = function () {
    let e = 1;
    try { e = rawUW.call(self); } catch (err) {}
    if (e > peak) peak = e;
    return Math.max(e, peak);
  };
  return () => peak;
}

async function fixtureGame() {
  const idle = require('./policies/idle').zero;
  const { Game } = await loadGame({ seed: 33, mode: 'monotonic-proof', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, Object.assign({}, idle), { days: 31, manifest: undefined, sampleEvery: 31 }); });
  plantLinks(Game);
  return Game;
}

async function main() {
  console.log('MONOTONIC PROOF (REDMODE=' + (REDMODE ? '1' : '0') + ')');

  // ---- R1: the fixture unlocks wave 4 on diplomacy, engine-real ----
  const Game = await fixtureGame();
  const rawUW = Game.unlockedWave.bind(Game);
  const R = readersOf(Game, rawUW);
  const st = R.standingRaw(Game);
  const wr = R.waveRaw(Game);
  check('R1a fixture: 3 qualifying links found by the instrument', MONO.qualifyingLinks(Game).length === 3,
    'n=' + MONO.qualifyingLinks(Game).length);
  check('R1b fixture: diplomacy standing >= t4 (102 expected)', st >= 100, 'standing=' + st);
  check('R1c fixture: engine unlocks wave 4 (raw)', wr >= 4, 'waveRaw=' + wr);

  // ---- (a): pristine engine — the break re-locks (the diagnostic's claim) ----
  const linkA = MONO.qualifyingLinks(Game)[0];
  const evA = MONO.breakLinkScenario(Game, linkA, R, []);
  check('R2a break step: engine breakLink path fires', !!evA && evA.brokeOk === true,
    evA ? 'link=' + evA.linkId : 'null event');
  check('R2b break step: Standing collapses on the break', !!evA && evA.standingPost < evA.standingPre,
    evA ? evA.standingPre + '->' + evA.standingPost : '');
  check('R2c PRISTINE: wave re-locks after the link break (engine law)', !!evA && evA.reLocked === true,
    evA ? 'waveRaw ' + evA.waveRawPre + '->' + evA.waveRawPost : '');
  check('R2d instrument: break event carries pre/post standing + re-lock verdict',
    !!evA && typeof evA.standingPre === 'number' && typeof evA.standingPost === 'number' && typeof evA.reLocked === 'boolean');

  // ---- (b): sticky overlay — the hold ----
  const Game2 = await fixtureGame();
  const rawUW2 = Game2.unlockedWave.bind(Game2);
  const R2 = readersOf(Game2, rawUW2);
  if (!REDMODE) installOverlay(Game2, rawUW2); // REDMODE: overlay off -> hold must FAIL
  const linkB = MONO.qualifyingLinks(Game2)[0];
  const evB = MONO.breakLinkScenario(Game2, linkB, R2, []);
  check('R3a sticky: break fires under the overlay', !!evB && evB.brokeOk === true);
  check('R3b sticky: RAW wave still re-locks underneath (overlay hides nothing from raw)',
    !!evB && evB.waveRawPost < evB.waveRawPre,
    evB ? 'waveRaw ' + evB.waveRawPre + '->' + evB.waveRawPost : '');
  const holdOk = !!evB && evB.heldByRatchet === true && evB.waveEffPost >= 4;
  check(REDMODE ? 'R3c REDMODE: hold FAILS without the overlay (proves the hold is the instrument\'s)' : 'R3c sticky: effective wave HOLDS at 4 after the break',
    REDMODE ? !holdOk : holdOk,
    evB ? 'waveEffPost=' + evB.waveEffPost + ' waveRawPost=' + evB.waveRawPost : '');

  // ---- R4: no hallucination on a short smoke (sweep's own oneRun) ----
  const smoke = await MONO.oneRun(11, 'leadcourt', 'break', 15);
  check('R4a smoke: 15d run records no wave-4 unlock', !smoke.unlock4);
  check('R4b smoke: 15d run records no breaks', smoke.breaks.length === 0, 'breaks=' + smoke.breaks.length);
  check('R4c smoke: sampler collected reads', smoke.samples.length > 0 && smoke.hashes.length === smoke.samples.length,
    'n=' + smoke.samples.length);

  // ---- R5: A/A trajectory-neutrality (sweep's own gate) ----
  process.env.AA_SEEDS = '11';
  process.env.AA_DAYS = '30';
  try {
    await MONO.aaSanity();
    check('R5 A/A: instrument vs pristine byte-identical pre-scenario', true);
  } catch (e) {
    check('R5 A/A: instrument vs pristine byte-identical pre-scenario', false, String(e && e.message));
  }

  if (fails.length) {
    console.log(`\nPROOF ${REDMODE ? 'RED (expected)' : 'FAIL'}: ${fails.length} failing check(s): ${fails.join(', ')}`);
    process.exit(1);
  }
  if (REDMODE) {
    console.log('\nPROOF RED (as designed): without the overlay the hold FAILS — the re-lock is engine-real and the hold is the instrument\'s.');
    process.exit(1);
  }
  console.log('\nPROOF GREEN: link break detected, re-lock observed pristine, hold observed sticky, no hallucination, A/A neutral.');
}

if (require.main === module) {
  main().catch(e => { console.error('MONOTONIC PROOF CRASH:', e); process.exit(2); });
}
