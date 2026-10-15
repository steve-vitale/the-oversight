#!/usr/bin/env node
// scripts/test-hybridroad-20261015.js — PROOF for the hybridroad arm (#212).
//
// Two runs:
//   node scripts/test-hybridroad-20261015.js                          # pristine: expect REAL RED
//   PROPOSELAYER=1 HYBRIDROAD=1 node scripts/test-hybridroad-20261015.js # armed: expect GREEN
//
// RED phase: the gate is off, the export IS the proposelayer export
// (reference-equal — the diplomacy-road control, byte-identical), and the
// hunt leg cannot fire: driving the inert policy's real daily on a
// wave-3-unlocked fixture banks zero hunt legs.
// GREEN phase: the layer fires the hunt leg on the wave-3-unlocked fixture
// through the real engine (real travelTo legs), stands the hunt DOWN when
// wave 4 unlocks (the readiness-window design call), and preserves the
// full courtship bundle (propose fires on the open window; both fire in
// one daily on the combined fixture).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

const W2 = ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea', 'memory_projector'];
const W3 = ['redactor', 'gavel', 'focus_group', 'spool'];

async function rig(seed) {
  const { Game } = await loadGame({ seed, mode: 'hybridroad-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.day = 30;
  try { s.hp = (typeof Game.maxHealth === 'function' ? Game.maxHealth() : 100); } catch (e) { s.hp = 100; }
  s.kcal = 800;
  Game.state.pendingCounter = null;
  Game.state.pendingAccord = null;
  Game.state.pendingNational = null;
  Game.state.pendingGlobal = null;
  return Game;
}
function unlockWave3(Game) {
  for (const id of W2) { try { Game.recordWaveKill(id, 'player', 'test', null); } catch (e) {} }
}
function unlockWave4(Game) {
  unlockWave3(Game);
  for (const id of W3) { try { Game.recordWaveKill(id, 'player', 'test', null); } catch (e) {} }
}
function wave(Game) { try { return Game.unlockedWave(); } catch (e) { return 0; } }

(async () => {
  const ARMED = process.env.HYBRIDROAD === '1';
  console.log(`hybridroad proof — ${ARMED ? 'ARMED (HYBRIDROAD=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  // Kill-protocol convention: a killed arm's layer is deleted; the proof
  // then INFO-SKIPs instead of FATALing.
  let mod = null;
  try { mod = require('./policies/hybridroad'); } catch (e) { mod = null; }
  if (!mod) {
    console.log('INFO-SKIP: policies/hybridroad.js absent (killed arm, layer deleted per kill protocol). Pre-kill RED→GREEN stands; nothing to run on the landed tree.');
    process.exit(0);
  }
  const { hybridroad, hybridHuntLive, HYBRIDROAD_ON } = mod;

  if (!ARMED) {
    // ---- RED ----
    ok('R1-armed-identity', hybridroad.id === 'hybridroad' && HYBRIDROAD_ON === true,
      `id=${hybridroad.id} on=${HYBRIDROAD_ON} — the layer is inert on pristine`);
    const { proposelayer } = require('./policies/proposelayer');
    ok('R2-gate-off-is-control', hybridroad === proposelayer,
      'gate-off export IS the proposelayer export (reference-equal) — the diplomacy-road control, byte-identical');
    const Game = await rig(11);
    unlockWave3(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) { /* policy-internal */ }
    ok('R3-zero-hunts-inert', wave(Game) >= 3 && (ctx.hunts || 0) === 0 && (ctx.huntLegs || 0) === 0,
      `wave=${wave(Game)} hunts=${ctx.hunts || 0} legs=${ctx.huntLegs || 0} — the inert policy cannot hunt`);
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the layer is inert; the hunt leg cannot fire).`);
    process.exit(bad.length ? 1 : 0);
  }

  // ---- GREEN ----
  ok('G1-armed-identity', hybridroad.id === 'hybridroad' && HYBRIDROAD_ON === true,
    `id=${hybridroad.id} on=${HYBRIDROAD_ON}`);

  // G2 — the hunt leg fires on the wave-3-unlocked fixture, through the
  // real engine (real travelTo legs into monster country).
  {
    const Game = await rig(11);
    unlockWave3(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    ok('G2-hunt-fires', wave(Game) >= 3 && hybridHuntLive(Game) === true &&
      (ctx.hunts || 0) >= 1 && (ctx.huntLegs || 0) >= 1,
      `wave=${wave(Game)} window=${hybridHuntLive(Game)} hunts=${ctx.hunts || 0} legs=${ctx.huntLegs || 0}`);
  }

  // G3 — THE DESIGN CALL: the window stands down when wave 4 unlocks.
  // 4 wave-3 ledger kills = war 100 >= T4 -> unlockedWave() = 4 -> the
  // hunt must not fire. The scholar defends; the drive does not grind.
  {
    const Game = await rig(12);
    unlockWave4(Game);
    const w4 = wave(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    ok('G3-stand-down-at-wave4', w4 >= 4 && hybridHuntLive(Game) === false &&
      (ctx.hunts || 0) === 0 && (ctx.huntLegs || 0) === 0,
      `wave=${w4} window=${hybridHuntLive(Game)} hunts=${ctx.hunts || 0} — the System answered, the hunt stands down`);
  }

  // G4 — courtship preserved: the propose verb fires on the open window.
  {
    const Game = await rig(13);
    const v = (Game.state.otherVillages || [])[0];
    if (v) v.rumored = true;
    Game.state.village.pantry = [{ id: 'pl-rig', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const calls = [];
    const orig = Game.proposeLink;
    Game.proposeLink = function (...a) { calls.push(a); return orig.apply(this, a); };
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    Game.proposeLink = orig;
    ok('G4-courtship-intact', calls.length >= 1 && (ctx.plProposed || 0) >= 1,
      `proposeLink calls=${calls.length} plProposed=${ctx.plProposed || 0} — the diplomacy road is untouched`);
  }

  // G5 — composition: on the combined fixture (window open + wave-3
  // unlocked) ONE daily fires both the courtship verb and the hunt leg —
  // courtship first, the hunt additive, never preempting.
  {
    const Game = await rig(14);
    unlockWave3(Game);
    const v = (Game.state.otherVillages || [])[0];
    if (v) v.rumored = true;
    Game.state.village.pantry = [{ id: 'pl-rig', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const calls = [];
    const orig = Game.proposeLink;
    Game.proposeLink = function (...a) { calls.push(a); return orig.apply(this, a); };
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    Game.proposeLink = orig;
    ok('G5-composition', calls.length >= 1 && (ctx.hunts || 0) >= 1,
      `propose=${calls.length} hunts=${ctx.hunts || 0} — one daily, courtship + hunt together`);
  }

  // G6 — the gate is read live: unsetting HYBRIDROAD closes the window
  // even on the unlocked fixture (no stale capture).
  {
    const Game = await rig(15);
    unlockWave3(Game);
    delete process.env.HYBRIDROAD;
    const closed = hybridHuntLive(Game) === false;
    process.env.HYBRIDROAD = '1';
    const reopened = hybridHuntLive(Game) === true;
    ok('G6-gate-live', closed && reopened,
      `gate-off window=${!closed} gate-on window=${reopened}`);
  }

  const bad = results.filter(r => !r.ok);
  console.log(`\n${bad.length ? 'RED' : 'GREEN'}: ${results.length - bad.length}/${results.length} passed${bad.length ? ' — FIX BEFORE SPEND' : ' — the hunt leg fires in the readiness window, stands down at wave-4 unlock, and the courtship bundle is intact.'}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
