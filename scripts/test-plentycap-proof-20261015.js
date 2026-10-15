#!/usr/bin/env node
// scripts/test-plentycap-proof-20261015.js — sim-plentycap proof test.
// The v3 readiness gate's two teeth are env-selectable (STANDING_VARIANT:
// 'both' (default, v3 as landed), 'faced-only' (cap tooth off), 'cap-only'
// (faced tooth off)). This script proves each tooth BINDS on pristine
// (REAL RED phase: HEAD standing.js, which has no env reader) and LOOSENS
// only under its own variant on the armed tree — never the wrong one.
// Phase 1: swap standing.js to pristine (git show HEAD), run RED asserts,
//   restore armed byte-verified. No stash (repo-global stack).
// Phase 2: on the armed tree, run each variant's asserts (default, both,
//   faced-only, cap-only, unknown -> both).
// Exit 1 on any failure.
'use strict';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const STANDING = path.join(ROOT, 'src', 'js', 'standing.js');
const armedBytes = fs.readFileSync(STANDING);

let n = 0, fails = [];
function check(name, cond, detail) {
  n++;
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

async function loadFresh(envVariant) {
  if (envVariant === undefined) delete process.env.STANDING_VARIANT;
  else process.env.STANDING_VARIANT = envVariant;
  const { Game } = await loadGame({ seed: 42, mode: `plentycap-proof-${envVariant || 'default'}` });
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

// Fixture: war-heavy standing (>=t4), ZERO wave-3 types faced.
function fixtureWarNoFaced(Game) {
  Game.state.scholar.day = 70;
  Game.ledgerState()[1].points = 5; // wave 2/3 bars satisfied so the wave
  Game.ledgerState()[2].points = 5; // number reflects the Standing hold
  Game.ledgerState()[3].points = 5; // war = 125
  Game.ledgerState()[4].points = 0;
  Game.ledgerState()[5].points = 0;
  Game.state.feastLog = [];
  Game.deedState().wavesFaced = {};
}
// Fixture: bread alone to the T5 bar (10 fine feasts), faced tooth FULLY
// RELEASED (3 wave-3 + 2 wave-4 types faced) so the ONLY thing between the
// village and wave 5 is the plenty cap.
function fixtureBreadOnly(Game) {
  Game.state.scholar.day = 70;
  Game.ledgerState()[1].points = 5;
  Game.ledgerState()[2].points = 5;
  Game.ledgerState()[3].points = 0;
  Game.ledgerState()[4].points = 0;
  Game.ledgerState()[5].points = 0;
  Game.state.feastLog = [];
  for (let i = 0; i < 10; i++) Game.state.feastLog.push({ day: 69 - i, quality: 1 });
  Game.deedState().wavesFaced = { a: 3, b: 3, c: 3, d: 4, e: 4 };
}

async function main() {
  // ---------- PHASE 1: RED on pristine ----------
  console.log('== PHASE 1: RED on pristine (HEAD standing.js — no env reader) ==');
  const pristine = cp.execSync('git show HEAD:src/js/standing.js', { cwd: ROOT });
  fs.writeFileSync(STANDING, pristine);
  try {
    const G = await loadFresh(undefined);
    check('pristine: no env reader (_standingVariant absent)', typeof G._standingVariant !== 'function');
    fixtureWarNoFaced(G);
    const st = G.villageStanding();
    check('pristine fixture warNoFaced: raw >= t4', (st.total | 0) >= 100, 'total=' + st.total);
    const rd4 = G.waveUnlockReady(4);
    check('pristine: faced tooth BINDS (ready4 false, 0/3)', rd4.ready === false && rd4.faced === 0 && rd4.need === 3, JSON.stringify(rd4));
    check('pristine: total held at t4-1', G.villageStandingTotal() === 99, 'total=' + G.villageStandingTotal());
    check('pristine: wave held at 3', G.unlockedWave() === 3, 'wave=' + G.unlockedWave());
    const d4 = G.standingDeferral(4);
    check('pristine: standingDeferral(4).deferred true', d4.deferred === true);
    fixtureBreadOnly(G);
    const st2 = G.villageStanding();
    check('pristine fixture breadOnly: raw >= t5', (st2.total | 0) >= 200, 'total=' + st2.total);
    check('pristine: plenty cap BINDS (capped total = 100)', G.standingPlentyCappedTotal() === 100, 'capped=' + G.standingPlentyCappedTotal());
    check('pristine: bread alone held at t5-1 (199) with faced released', G.villageStandingTotal() === 199, 'total=' + G.villageStandingTotal());
    check('pristine: bread alone opens wave 4 only (cap hold)', G.unlockedWave() === 4, 'wave=' + G.unlockedWave());
    check('pristine: STANDING_VARIANT ignored by landed gate (faced-only env still 199)',
      (process.env.STANDING_VARIANT = 'faced-only', G.villageStandingTotal() === 199));
    delete process.env.STANDING_VARIANT;
  } finally {
    fs.writeFileSync(STANDING, armedBytes);
  }
  const back = fs.readFileSync(STANDING);
  check('RESTORE: armed standing.js byte-identical after RED phase', back.equals(armedBytes));
  if (!back.equals(armedBytes)) { console.log('RESTORE FAILED — aborting'); process.exit(1); }

  // ---------- PHASE 2: variants on armed ----------
  console.log('== PHASE 2: teeth on the armed tree ==');
  const G0 = await loadFresh(undefined);
  // Kill-protocol INFO-SKIP: the arm was killed and standing.js reverted
  // byte-clean, so the env reader is absent — Phase 2's variants cannot
  // exist. Skip, don't crash (never MODULE_NOT_FOUND).
  if (typeof G0._standingVariant !== 'function') {
    console.log('INFO-SKIP: plentycap layer deleted per kill protocol (no env reader in standing.js); see evidence/2026-10-15/sim-plentycap.md');
    process.exit(0);
  }
  check('armed default: env reader present', typeof G0._standingVariant === 'function');
  check('armed default: variant reads as both', G0._standingVariant() === 'both');
  fixtureWarNoFaced(G0);
  check('armed default: faced tooth still binds (total 99)', G0.villageStandingTotal() === 99 && G0.unlockedWave() === 3);
  fixtureBreadOnly(G0);
  check('armed default: cap tooth still binds (total 199)', G0.villageStandingTotal() === 199 && G0.standingPlentyCappedTotal() === 100);

  const Gf = await loadFresh('faced-only');
  check('faced-only: variant reads', Gf._standingVariant() === 'faced-only');
  fixtureBreadOnly(Gf);
  check('faced-only: cap LOOSENS (bread counts in full: total 200)', Gf.villageStandingTotal() === 200, 'total=' + Gf.villageStandingTotal());
  check('faced-only: capped total = 200 (no cap)', Gf.standingPlentyCappedTotal() === 200);
  check('faced-only: bread alone BUYS wave 5 (cap tooth off, w4 faced)', Gf.unlockedWave() === 5, 'wave=' + Gf.unlockedWave());
  fixtureWarNoFaced(Gf);
  check('faced-only: no cap hold beat state for bread', (() => { fixtureBreadOnly(Gf); Gf.villageStandingTotal(); return Gf.state._standingPlentyCapBeat == null; })());
  // NOTE: the warNoFaced-on-faced-only check below needs a FRESH game: the
  // monotonic ratchet (landed, live in all variants) already recorded peak=5
  // from the bread fixture above, and a released peak never re-locks.
  const Gf2 = await loadFresh('faced-only');
  fixtureWarNoFaced(Gf2);
  check('faced-only: faced tooth still binds (war 125, 0 faced -> 99)', Gf2.villageStandingTotal() === 99, 'total=' + Gf2.villageStandingTotal());
  check('faced-only: wave still held at 3 (faced tooth)', Gf2.unlockedWave() === 3, 'wave=' + Gf2.unlockedWave());

  const Gc = await loadFresh('cap-only');
  check('cap-only: variant reads', Gc._standingVariant() === 'cap-only');
  fixtureWarNoFaced(Gc);
  check('cap-only: faced LOOSENS (war 125, 0 faced -> wave 4, total 125)',
    Gc.villageStandingTotal() === 125 && Gc.unlockedWave() === 4, 'total=' + Gc.villageStandingTotal() + ' wave=' + Gc.unlockedWave());
  check('cap-only: waveUnlockReady(4).ready true', Gc.waveUnlockReady(4).ready === true);
  fixtureBreadOnly(Gc);
  check('cap-only: cap tooth still binds (bread -> 199)', Gc.villageStandingTotal() === 199 && Gc.standingPlentyCappedTotal() === 100,
    'total=' + Gc.villageStandingTotal() + ' capped=' + Gc.standingPlentyCappedTotal());
  const Gu = await loadFresh('no-such-variant');
  check('unknown variant: fails closed to both', Gu._standingVariant() === 'both');
  fixtureBreadOnly(Gu);
  check('unknown variant: cap binds (199)', Gu.villageStandingTotal() === 199);

  console.log(fails.length ? `\nPROOF STOP: ${fails.length}/${n} failed — ${fails.join('; ')}` : `\nPROOF GREEN: ${n}/${n}`);
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
