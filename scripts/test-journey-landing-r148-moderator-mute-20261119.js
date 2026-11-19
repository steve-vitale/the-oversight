#!/usr/bin/env node
// test-journey-landing-r148-moderator-mute-20261119.js — proof test for the
// r148 MODERATOR-MUTE fix (journey-landing r148 2026-11-19, scripts/policies/
// competent.js).
//
// The defect (panel r148, seed 1271 d25, Elder The Moderator, 245 HP): the
// scholar closed on round 1, then spent rounds 2–3 re-trying a MOVE the
// Moderator had muted — two violations (+3/+6 to its Notices), 0 strikes,
// while allies Naran + Caleb killed it (279 dmg in 3 rounds). The fight
// was the panel's only B-shape zero-DMG fight (B-shape 1 — the zero-DMG
// bar's miss) and the only 2-ally fight ending zero-DMG (FIGHTALLY2).
// The game coaches the answer in plain words on the first violation:
// "You cannot walk out while MOVE is muted — STRIKE or WAIT to flip the
// mute, then move." The competent policy ignored the live mute: its
// 'wait' trick (beastTrickPlay) fires only when the counter is KNOWN, and
// the close/strike path re-issued the muted verb every round.
//
// The fix (competent.js fight(), before the generic close/strike path): a
// moderator-mute guard that reads only live engine state the player can
// see (Game.modLive() / modMuted / modPlayerInField(), all announced +
// grid-visible). MOVE muted + out of strike range -> WAIT (silence flips
// the mute); STRIKE muted + in range -> step to an adjacent tile outside
// the field if one exists, else WAIT. Never fires outside the field or
// when the turn would not use the muted verb anyway.
//
// Staging: the mute itself is staged directly (m.modMuted + a projected
// field) — the engine's mute computation is already proven by
// test-apex-moderator.js; this test proves the POLICY's response to a
// live mute. Flat grid (apex-test precedent) so every step is pathable.
//
// Cases (each in its own process — never two harnesses in one process):
//   move-muted: MOVE muted, scholar at distance 2 (in the radius-2 field,
//     out of melee range 1) — the exact panel shape. Fixed: WAIT, 0
//     violations, scholar unmoved, guard fired (modMuteWaits>=1).
//     Unfixed: the close re-issues the muted move -> 1 violation -> FAIL.
//   strike-muted: STRIKE muted, scholar ADJACENT (in range, in field).
//     Fixed: step out of the field (or WAIT), 0 violations, 0 strikes.
//     Unfixed: strikes into the mute -> 1 violation -> FAIL. With a
//     melee weapon no adjacent tile leaves a radius-2 field, so this
//     case exercises the WAIT fallback; see strike-muted-ranged for
//     the step-out.
//   strike-muted-ranged: STRIKE muted, scholar at distance 2 (in the
//     field, in bow range 5). Fixed: STEP OUT to a tile outside the
//     field (stepsOut>=1), 0 violations, 0 strikes. Unfixed: the
//     ranged strike fires into the mute -> 1 violation -> FAIL.
//   control: MOVE muted, scholar ADJACENT (in range) — the turn would not
//     use the muted verb, so the guard must not fire: the policy strikes
//     (damage dealt), 0 violations. Passes on fixed AND unfixed code.
//   A case also asserts the mute is actually live before the tested turn
//   (modPlayerInField true) so a broken staging cannot pass vacuously.
//
// Usage: node scripts/test-journey-landing-r148-moderator-mute-20261119.js [move-muted|strike-muted|strike-muted-ranged|control]
//   Default (no arg): runs all three cases, spawning children for the
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

function flatGrid() { return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'grass')); }
const M = (Game) => Game.tbfight && Game.tbfight.fighters.find(x => Game.modIs && Game.modIs(x));
const P = (Game) => Game.tbFighter('p');

async function stageGame(seed, weapon) {
  const { Game } = await loadGame({ seed, mode: 'landing-r148-moderator-mute-proof', fullTelemetry: true });
  await setupGame(Game);
  Game.canSee = () => true;
  Game.genDetail = () => flatGrid();
  const s = Game.state.scholar;
  s.health = 500;
  // Melee weapon, range 1 — the panel shape (Crowbar) — unless the case
  // passes a ranged weapon. A ranged weapon would strike from distance
  // and never exercise the close path.
  s.equipped = { weapon: weapon || { itemId: 'crowbar', name: 'Crowbar' } };
  Game.startCombat('moderator');
  const m = M(Game);
  const p = P(Game);
  p.hp = p.maxHp = 500;
  return { Game, m, p };
}

async function runCase(mode) {
  const seed = { 'move-muted': 20261119, 'strike-muted': 20261120, 'strike-muted-ranged': 20261122, control: 20261121 }[mode] || 20261119;
  const weapon = mode === 'strike-muted-ranged' ? { itemId: 'bow', name: 'Bow' } : null;
  const { Game, m, p } = await stageGame(seed, weapon);
  check(`${mode}: moderator spawned`, !!m, m ? `HP=${m.hp}/${m.maxHp}` : 'NO FIGHTER');
  if (!m) return;
  const w = (Game.equippedWeapon && Game.equippedWeapon()) || {};
  const wantRange = mode === 'strike-muted-ranged' ? 5 : 1;
  check(`${mode}: weapon range ${wantRange}`, (w.range || 1) === wantRange, `weapon=${w.name || '?'} range=${w.range}`);
  const s = Game.state.scholar;
  const ctx = {};
  if (mode === 'move-muted') {
    // Distance 2: inside the radius-2 field, outside melee range 1.
    p.mx = 4; p.my = 4; s.mx = 4; s.my = 4; m.mx = 2; m.my = 2;
    m.beamPhase = 'muting';
    m.modMuted = ['move'];
    Game.modProjectField(m, 2, 'suppressed');
    check('move-muted: scholar in field (mute is live)', Game.modPlayerInField(m), `p=(4,4) m=(2,2)`);
    const violBefore = m.modViolations || 0;
    let handled = false;
    try { handled = competent.fight(Game, ctx); } catch (e) { console.log('  policy.fight threw: ' + (e && e.message)); }
    check('move-muted: policy acted', !!handled);
    check('move-muted: 0 violations (panel shape was 2)', (m.modViolations || 0) === violBefore, `violations=${m.modViolations || 0}`);
    check('move-muted: guard fired (waited instead of closing)', (ctx.modMuteWaits || 0) >= 1, `modMuteWaits=${ctx.modMuteWaits || 0}`);
    check('move-muted: scholar did not move', p.mx === 4 && p.my === 4, `p=(${p.mx},${p.my})`);
    check('move-muted: scholar did not strike (out of range)', (ctx.struck || 0) === 0, `struck=${ctx.struck || 0}`);
    return;
  }
  if (mode === 'strike-muted') {
    // Adjacent: in range AND in the field; STRIKE is the muted verb.
    p.mx = 3; p.my = 3; s.mx = 3; s.my = 3; m.mx = 2; m.my = 2;
    m.beamPhase = 'muting';
    m.modMuted = ['strike'];
    Game.modProjectField(m, 2, 'suppressed');
    check('strike-muted: scholar in field (mute is live)', Game.modPlayerInField(m), `p=(3,3) m=(2,2)`);
    const violBefore = m.modViolations || 0;
    const hpBefore = m.hp;
    let handled = false;
    try { handled = competent.fight(Game, ctx); } catch (e) { console.log('  policy.fight threw: ' + (e && e.message)); }
    check('strike-muted: policy acted', !!handled);
    check('strike-muted: 0 violations', (m.modViolations || 0) === violBefore, `violations=${m.modViolations || 0}`);
    check('strike-muted: guard fired (stepped out or waited)',
      ((ctx.modMuteStepsOut || 0) + (ctx.modMuteWaits || 0)) >= 1,
      `stepsOut=${ctx.modMuteStepsOut || 0} waits=${ctx.modMuteWaits || 0}`);
    check('strike-muted: scholar did not strike into the mute', (ctx.struck || 0) === 0, `struck=${ctx.struck || 0}`);
    return;
  }
  if (mode === 'strike-muted-ranged') {
    // Distance 2, bow range 5: in range AND in the field, with adjacent
    // tiles outside the field — the step-out branch.
    p.mx = 4; p.my = 4; s.mx = 4; s.my = 4; m.mx = 2; m.my = 2;
    m.beamPhase = 'muting';
    m.modMuted = ['strike'];
    Game.modProjectField(m, 2, 'suppressed');
    check('strike-muted-ranged: scholar in field (mute is live)', Game.modPlayerInField(m), `p=(4,4) m=(2,2)`);
    const violBefore = m.modViolations || 0;
    let handled = false;
    try { handled = competent.fight(Game, ctx); } catch (e) { console.log('  policy.fight threw: ' + (e && e.message)); }
    check('strike-muted-ranged: policy acted', !!handled);
    check('strike-muted-ranged: 0 violations', (m.modViolations || 0) === violBefore, `violations=${m.modViolations || 0}`);
    check('strike-muted-ranged: guard stepped out of the field',
      (ctx.modMuteStepsOut || 0) >= 1, `stepsOut=${ctx.modMuteStepsOut || 0} waits=${ctx.modMuteWaits || 0}`);
    check('strike-muted-ranged: scholar moved out', p.mx !== 4 || p.my !== 4, `p=(${p.mx},${p.my})`);
    check('strike-muted-ranged: scholar did not strike into the mute', (ctx.struck || 0) === 0, `struck=${ctx.struck || 0}`);
    return;
  }
  // control: MOVE muted, scholar ADJACENT — the turn strikes, it does not
  // move, so the guard must stay out of the way.
  p.mx = 3; p.my = 3; s.mx = 3; s.my = 3; m.mx = 2; m.my = 2;
  m.beamPhase = 'muting';
  m.modMuted = ['move'];
  Game.modProjectField(m, 2, 'suppressed');
  check('control: scholar in field (mute is live)', Game.modPlayerInField(m), `p=(3,3) m=(2,2)`);
  const violBefore = m.modViolations || 0;
  let handled = false;
  try { handled = competent.fight(Game, ctx); } catch (e) { console.log('  policy.fight threw: ' + (e && e.message)); }
  check('control: policy acted', !!handled);
  check('control: policy struck (guard must not interfere in range)',
    (ctx.struck || 0) >= 1, `struck=${ctx.struck || 0}`);
  check('control: 0 violations', (m.modViolations || 0) === violBefore, `violations=${m.modViolations || 0}`);
  check('control: guard did not fire', ((ctx.modMuteStepsOut || 0) + (ctx.modMuteWaits || 0)) === 0,
    `stepsOut=${ctx.modMuteStepsOut || 0} waits=${ctx.modMuteWaits || 0}`);
}

async function main() {
  const mode = process.argv[2];
  if (!mode) {
    for (const m of ['move-muted', 'strike-muted', 'strike-muted-ranged', 'control']) {
      console.log(`\n### case ${m} ###`);
      try {
        execFileSync(process.execPath, [__filename, m], { stdio: 'inherit' });
      } catch (e) {
        console.log(`FAIL case ${m} exited ${e.status}`);
        fails++;
      }
    }
    console.log(fails === 0 ? '\nALL CHECKS PASS' : `\n${fails} CHECK(S) FAILING`);
    process.exit(fails ? 1 : 0);
  }
  await runCase(mode);
  console.log(fails === 0 ? '\nALL CHECKS PASS' : `\n${fails} CHECK(S) FAILING`);
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
