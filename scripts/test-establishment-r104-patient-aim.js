#!/usr/bin/env node
// scripts/test-establishment-r104-patient-aim.js — journey-establishment r104
// PROOF for the patient_aim round-start-HP fix (src/js/fieldFights.js):
// the aim's "full health" was judged at the villager's action, which comes
// AFTER the monster's same-round hit whenever the monster wins initiative —
// and fast monsters (hummice speed 6 vs villager 2-4) always do. Result:
// a full-HP villager facing a fresh monster could never take the aim
// (0/12 probe fights, 0 fires in 101 r103 skill_used rows). The fix judges
// full health at the START of the round, before anyone acts.
//  (1) FIRE: full-HP leader holding patient_aim vs a fresh hummice aims on
//      round 1 (ffFired includes 'patient_aim') and the next strike lands
//      the 2.5x payoff (log shows 'aimed 2.5x').
//  (2) CONTROL hurt: leader at 50 HP does NOT aim.
//  (3) CONTROL spent monster: monster below half HP at fight start does NOT
//      draw an aim (the "fresh monster" half of the card still holds).
//  (4) CONTROL no ability: a leader holding nothing never aims.
// Cases run on load seeds 7, 42, 99 (+1, 2, 3 for the fire case,
// MEASUREMENT §5: ≥3 seeds). Each case loads a fresh game; fights use a
// fixed mulberry32 stream. Monster: hummice (wave 1, hp 10-14) — fast
// enough to always win initiative, which is exactly the case the fix
// addresses.
// Usage: node scripts/test-establishment-r104-patient-aim.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const LOAD_SEEDS = [7, 42, 99];

async function fightCase(loadSeed, abils, hp, fightSeed, monsterHp) {
  const { Game: G, loadFails } = await loadGame({ seed: loadSeed, mode: 'establishment-r104-patient-aim' });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no roster villagers on seed ' + loadSeed);
  const leader = roster[0];
  const v = G.state.village || (G.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[leader] = abils.slice();
  v.health = v.health || {};
  v.health[leader] = hp;
  const def = (G.data.monsters || []).find(m => m && m.id === 'hummice');
  if (!def) throw new Error('monster def not found: hummice');
  const mhp = (monsterHp == null ? 12 : monsterHp);
  const entity = { id: def.id, hp: mhp, maxHp: 12, tx: 2, ty: 2 };
  const rec = G.fieldFight(leader, def, entity, { rng: mulberry32(fightSeed) });
  return { leader, rec };
}

async function main() {
  let failures = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) failures++;
  };
  for (const seed of LOAD_SEEDS.concat([1, 2, 3])) {
    // (1) FIRE: full HP, fresh monster — aims round 1 even though the
    // fast monster hits first.
    const r = await fightCase(seed, ['patient_aim'], 100, 9000 + seed, 12);
    const fired = (r.rec.ffFired || []).includes('patient_aim');
    check(`seed${seed} patient_aim fires at full HP vs fresh monster`, fired,
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome} rounds=${r.rec.rounds}`);
    const aimed = (r.rec.log || []).some(l => String(l).indexOf('aimed 2.5x') >= 0);
    check(`seed${seed} aimed strike pays 2.5x`, aimed,
      `log=${JSON.stringify((r.rec.log || []).filter(l => /aim|Take Aim/.test(String(l))))}`);
  }
  for (const seed of LOAD_SEEDS) {
    // (2) CONTROL hurt: 50 HP — no aim.
    let r = await fightCase(seed, ['patient_aim'], 50, 9100 + seed, 12);
    check(`seed${seed} control hurt: no aim`, !(r.rec.ffFired || []).includes('patient_aim'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome}`);
    // (3) CONTROL spent monster: 5/12 HP at fight start — no aim.
    r = await fightCase(seed, ['patient_aim'], 100, 9200 + seed, 5);
    check(`seed${seed} control spent monster: no aim`, !(r.rec.ffFired || []).includes('patient_aim'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome}`);
    // (4) CONTROL no ability: nothing held — no aim.
    r = await fightCase(seed, [], 100, 9300 + seed, 12);
    check(`seed${seed} control no ability: no aim`, !(r.rec.ffFired || []).includes('patient_aim'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome}`);
  }
  console.log(failures === 0 ? 'ALL-PASS' : `FAILURES=${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('PROOF-FAIL', e && e.stack || e); process.exit(1); });
