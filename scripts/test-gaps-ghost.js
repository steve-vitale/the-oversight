#!/usr/bin/env node
// scripts/test-gaps-ghost.js — THIRD-FIGHTER GHOST narration proof.
//
// Proves the rear-guard log line in src/js/fieldFights.js through the
// shared sim harness (loadGame/setupGame), on direct fieldFight calls
// with a real 3-muster (leader + 2 roster allies, cornered like a
// lingererSortie fight):
//   A: 1-HP cornered kill, nobody joins (the d89 1-HP shape: a round-1
//      kill fires no hopeless shout) -> rearGuard = BOTH allies, and
//      the log names both standing the rear.
//   B: cornered fight with one ally joined from the start (the
//      deterministic stand-in for the hopeless-shout path, which the
//      d89 redactor replay covers live) -> rearGuard = the OTHER ally
//      only; the rear line names the other, never the joined ally.
//   C: cornered fight where the single ally joins -> no rear line,
//      no rearGuard (no ghost, no line).
//   D: NON-cornered fight with leftover allies -> no rear line, no
//      rearGuard (scope gate: aid/wild/arena narration untouched).
//   E: partyfinish summary wording unchanged (this arm does not touch
//      the summary; guards against accidental edits).
//
// Narration only: no case asserts a changed outcome, damage, or join
// — the rear line is pushed after all rounds and all RNG draws, and
// nothing in the engine reads rec.log to decide anything. The
// behavior-inertness proof is the before/after seed-75105 sense
// replay diff (evidence/2026-10-29/gaps-ghost/): numbers identical,
// log lines only.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function rearLines(rec) {
  return (rec.log || []).filter(l => /stood the rear/.test(l));
}
function firstName(Game, vid) {
  try { return Game.firstRef ? Game.firstRef(vid) : Game.displayName(vid).split(' ')[0]; }
  catch (e) { return 'Someone'; }
}

async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'gaps-ghost-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const me = Game.villagerId;
  const fighters = roster.filter(id => id !== me).slice(0, 3);
  if (fighters.length < 3) { console.log('FAIL need 3 non-scholar roster villagers'); process.exit(1); }
  const [leader, ally2, ally3] = fighters;
  const data = Game.data || {};
  const vp = ((data.villagers || []).find(x => x && x.id === leader) ||
    (data.background_survivors || []).find(x => x && x.id === leader)) || null;
  console.log('  leader=' + leader + ' allies=' + ally2 + ',' + ally3);
  console.log('  names=' + firstName(Game, leader) + ',' + firstName(Game, ally2) + ',' + firstName(Game, ally3));
  // Honest arming (same rule as test-partyfinish-proof.js): a real
  // weapon def with a melee slot, in the leader's pack, geared up by
  // villagerGearUp (re-equip only) — the same call fieldFight makes.
  const _eqPre = ((typeof globalThis !== 'undefined' && globalThis.S && globalThis.S.equipment) ||
    (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment)) || null;
  const weaponDef = (data.items || []).find(d => d && d.weapon && (d.weapon.bonus || 0) > 0 &&
    _eqPre && _eqPre.slotForItem && _eqPre.slotForItem(d) === 'melee') || null;
  if (!weaponDef) { console.log('FAIL no weapon def in items data'); process.exit(1); }
  function arm() {
    if (vp) {
      vp.items = vp.items || [];
      if (vp.items.indexOf(weaponDef.id) < 0) vp.items.push(weaponDef.id);
      try { Game.villagerGearUp(leader, false); } catch (e) { /* best-effort */ }
    }
  }
  function freshHealth() {
    try {
      const h = (Game.state.village || {}).health || {};
      h[leader] = 100; h[ally2] = 100; h[ally3] = 100;
    } catch (e) { /* best-effort */ }
  }
  function freshMonster(hp, maxHp) {
    return { id: mdef.id, hp: hp, maxHp: maxHp, tx: 4, ty: 4, lingering: true };
  }
  const mdef = (data.monsters || []).find(d => d && d.id === 'hushwolf') ||
    (data.monsters || []).find(d => d && (d.wave | 0) === 1);
  if (!mdef) { console.log('FAIL no monster def'); process.exit(1); }

  // A: 1-HP cornered kill, no join — both allies are ghosts without the fix.
  arm(); freshHealth();
  const recA = Game.fieldFight(leader, mdef, freshMonster(1, 50),
    { cornered: true, allies: 2, allyVids: [ally2, ally3] });
  const n2 = firstName(Game, ally2), n3 = firstName(Game, ally3);
  check('A 1-HP cornered party kill (round 1, vKill)',
    recA.outcome === 'vKill' && recA.rounds === 1,
    'outcome=' + recA.outcome + ' rounds=' + recA.rounds);
  check('A rearGuard holds BOTH non-joined allies',
    Array.isArray(recA.rearGuard) && recA.rearGuard.length === 2 &&
    recA.rearGuard[0] === ally2 && recA.rearGuard[1] === ally3,
    'rearGuard=' + JSON.stringify(recA.rearGuard));
  check('A log names BOTH allies standing the rear',
    rearLines(recA).length === 1 && rearLines(recA)[0].indexOf(n2) >= 0 &&
    rearLines(recA)[0].indexOf(n3) >= 0,
    'rearLines=' + JSON.stringify(rearLines(recA)));

  // B: one ally joined from the start — the other is the only ghost.
  arm(); freshHealth();
  const recB = Game.fieldFight(leader, mdef, freshMonster(50, 50),
    { cornered: true, allies: 2, allyVids: [ally2, ally3], allyFromStart: true });
  check('B joined ally is ally2 (shifted in, not a leftover)',
    recB.allyVid === ally2, 'allyVid=' + recB.allyVid);
  check('B rearGuard holds ONLY the non-joined ally',
    Array.isArray(recB.rearGuard) && recB.rearGuard.length === 1 && recB.rearGuard[0] === ally3,
    'rearGuard=' + JSON.stringify(recB.rearGuard));
  check('B rear line names the leftover, never the joined ally',
    rearLines(recB).length === 1 && rearLines(recB)[0].indexOf(n3) >= 0 &&
    rearLines(recB)[0].indexOf(n2) < 0,
    'rearLines=' + JSON.stringify(rearLines(recB)));

  // C: single ally joins — nobody ghosted, so no line at all.
  arm(); freshHealth();
  const recC = Game.fieldFight(leader, mdef, freshMonster(50, 50),
    { cornered: true, allies: 1, allyVids: [ally2], allyFromStart: true });
  check('C no rear line when the only ally joined',
    !recC.rearGuard && rearLines(recC).length === 0,
    'rearGuard=' + JSON.stringify(recC.rearGuard) + ' rearLines=' + rearLines(recC).length);

  // D: scope gate — same leftover shape, but NOT cornered: untouched.
  arm(); freshHealth();
  const recD = Game.fieldFight(leader, mdef, freshMonster(1, 50),
    { allies: 2, allyVids: [ally2, ally3] });
  check('D non-cornered fight has no rear line and no rearGuard',
    !recD.rearGuard && rearLines(recD).length === 0,
    'outcome=' + recD.outcome + ' rearGuard=' + JSON.stringify(recD.rearGuard));

  // E: summary wording untouched by this arm.
  const S = Game.fieldFightSummary.bind(Game);
  check('E summary party rec still says with their party',
    S({ outcome: 'vKill', rounds: 1, vTaken: 0, partySize: 3 }, 'Thao', 'the Ugly-Eyes') ===
    'Thao killed the Ugly-Eyes with their party — 1 round, 0 taken. Word travels fast.');

  console.log(`PROOF: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}
main().catch(e => { console.error('GAPS-GHOST PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
