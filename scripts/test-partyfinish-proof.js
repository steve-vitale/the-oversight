#!/usr/bin/env node
// scripts/test-partyfinish-proof.js — sim-partyfinish-a mechanism proof.
//
// Proves the cornered-party hold in src/js/fieldFights.js through the
// shared sim harness (loadGame/setupGame), on direct fieldFight calls
// with a 1-HP world monster (below every break line):
//   A: wild meeting (cornered unset, solo) -> mFlee, rounds 0 (unchanged).
//   B: cornered party, armed leader -> rounds >= 1, corneredHold true,
//      and the 1-HP beast dies to the first strike (vKill).
//   C: cornered party, armed leader, beast ABOVE the break line ->
//      normal fight, corneredHold falsy (the hold does not leak).
//   D: cornered but SOLO (allies 0) -> mFlee, rounds 0 (party gate).
//   E: cornered party, armed leader, arena (noFlee) -> mFlee, rounds 0
//      (arena sealed fights are untouched).
//   F: cornered party, UNARMED leader (wb 0) -> mFlee, rounds 0.
// Gear setup (test-process only, never game code): the villager's data
// entry is equipped with a real weapon def from monsters/items data
// for the armed cases, and stripped for the unarmed case; the wb the
// proof asserts is recomputed with the same formula fieldFight uses.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 75101, mode: 'partyfinish-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const me = Game.villagerId;
  const vid = roster.find(id => id !== me);
  if (!vid) { console.log('FAIL no non-scholar roster villager'); process.exit(1); }
  const data = Game.data || {};
  const vp = ((data.villagers || []).find(x => x && x.id === vid) ||
    (data.background_survivors || []).find(x => x && x.id === vid)) || null;
  console.log('  villager=' + vid + ' dataEntry=' + !!vp);
  // A real equippable melee weapon def: weapon bonus > 0 AND an
  // assigned melee slot (a chef's knife has a weapon bonus but no
  // equip slot — it is a cooking tool, and gear-up rightly ignores it).
  const _eqPre = ((typeof globalThis !== 'undefined' && globalThis.S && globalThis.S.equipment) ||
    (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment)) || null;
  const weaponDef = (data.items || []).find(d => d && d.weapon && (d.weapon.bonus || 0) > 0 &&
    _eqPre && _eqPre.slotForItem && _eqPre.slotForItem(d) === 'melee') || null;
  if (!weaponDef) { console.log('FAIL no weapon def in items data'); process.exit(1); }
  console.log('  weaponDef=' + weaponDef.id + ' bonus=' + weaponDef.weapon.bonus);
  // Equipment resolution, mirroring fieldFight's _g.S.equipment read:
  // global S namespace first (window.S in the browser, global.S in the
  // node harness), then the Scattering.equipment bridge.
  function resolveEquipment() {
    try {
      const gt = (typeof globalThis !== 'undefined') ? globalThis : {};
      if (gt.S && gt.S.equipment && gt.S.equipment.weaponBonusOf) return gt.S.equipment;
      if (gt.Scattering && gt.Scattering.equipment && gt.Scattering.equipment.weaponBonusOf) return gt.Scattering.equipment;
    } catch (e) { /* fall through */ }
    return null;
  }
  const eq = resolveEquipment();
  console.log('  equipmentResolved=' + !!eq);
  function wbOf(entry) {
    try {
      if (!eq) return null;
      return Math.round(((eq.weaponBonusOf(entry, data.items, 'melee') || 0) +
        (eq.weaponBonusOf(entry, data.items, 'ranged') || 0)) / 2);
    } catch (e) { return null; }
  }
  // The monster def: a wave-1 type (break 0.25) keeps the unit cases
  // wave-agnostic — the hold code reads mBreak, never the wave.
  const mdef = (data.monsters || []).find(d => d && d.id === 'hushwolf') ||
    (data.monsters || []).find(d => d && (d.wave | 0) === 1);
  if (!mdef) { console.log('FAIL no monster def'); process.exit(1); }
  try { ((Game.state.village || {}).health || {})[vid] = 100; } catch (e) { /* best-effort */ }
  function freshMonster(hp, maxHp) {
    return { id: mdef.id, hp: hp, maxHp: maxHp, tx: 4, ty: 4, lingering: true };
  }
  // Honest arming (equipment rule: gear comes from the person's own
  // items, never conjured): put the weapon in the villager's pack,
  // then let villagerGearUp (re-equip only) arm them from it — the
  // same call fieldFight makes at fight entry, so the armed wb below
  // survives fieldFight's own gear-up. Disarm removes it from the pack.
  function arm() {
    if (vp) {
      vp.items = vp.items || [];
      if (vp.items.indexOf(weaponDef.id) < 0) vp.items.push(weaponDef.id);
      try { Game.villagerGearUp(vid, false); } catch (e) { /* best-effort */ }
    }
  }
  function disarm() {
    if (vp) {
      vp.items = (vp.items || []).filter(id => id !== weaponDef.id);
      try { Game.villagerGearUp(vid, false); } catch (e) { /* best-effort */ }
    }
  }
  arm();
  const wbArmed = wbOf(vp);
  console.log('  wbArmed=' + wbArmed);
  check('armed setup wb > 0', wbArmed !== null && wbArmed > 0, 'wb=' + wbArmed);

  const recA = Game.fieldFight(vid, mdef, freshMonster(1, 50), {});
  check('A wild solo 1-HP flees round 0', recA.outcome === 'mFlee' && recA.rounds === 0,
    'outcome=' + recA.outcome + ' rounds=' + recA.rounds);

  arm();
  const wbB = wbOf(vp);
  const recB = Game.fieldFight(vid, mdef, freshMonster(1, 50), { cornered: true, allies: 1, allyVids: ['ally-x'] });
  check('B cornered armed party holds (rounds >= 1, corneredHold)',
    recB.rounds >= 1 && recB.corneredHold === true,
    'outcome=' + recB.outcome + ' rounds=' + recB.rounds + ' hold=' + recB.corneredHold + ' wb=' + wbB);
  check('B cornered armed party finishes the 1-HP beast', recB.outcome === 'vKill',
    'outcome=' + recB.outcome);

  arm();
  const recC = Game.fieldFight(vid, mdef, freshMonster(50, 50), { cornered: true, allies: 1, allyVids: ['ally-x'] });
  check('C above-break cornered fight has no hold', !recC.corneredHold,
    'outcome=' + recC.outcome + ' hold=' + recC.corneredHold);

  arm();
  const recD = Game.fieldFight(vid, mdef, freshMonster(1, 50), { cornered: true, allies: 0, allyVids: [] });
  check('D cornered solo still flees round 0', recD.outcome === 'mFlee' && recD.rounds === 0,
    'outcome=' + recD.outcome + ' rounds=' + recD.rounds);

  arm();
  const recE = Game.fieldFight(vid, mdef, freshMonster(1, 50), { cornered: true, allies: 1, allyVids: ['ally-x'], noFlee: true });
  check('E arena cornered party still flees round 0', recE.outcome === 'mFlee' && recE.rounds === 0,
    'outcome=' + recE.outcome + ' rounds=' + recE.rounds);

  disarm();
  const wbF = wbOf(vp);
  const recF = Game.fieldFight(vid, mdef, freshMonster(1, 50), { cornered: true, allies: 1, allyVids: ['ally-x'] });
  check('F cornered unarmed party still flees round 0', recF.outcome === 'mFlee' && recF.rounds === 0,
    'outcome=' + recF.outcome + ' rounds=' + recF.rounds + ' wb=' + wbF);

  // SUMMARY HONESTY (party kills must not read as solo kills).
  const S = Game.fieldFightSummary.bind(Game);
  check('summary solo rec unchanged',
    S({ outcome: 'vKill', rounds: 2, vTaken: 26 }, 'Marcus', 'Hushpuppy') ===
    'Marcus killed the Hushpuppy alone — 2 rounds, 26 taken. Word travels fast.');
  check('summary party rec says with their party',
    S({ outcome: 'vKill', rounds: 1, vTaken: 0, partySize: 3 }, 'Thao', 'the Ugly-Eyes') ===
    'Thao killed the Ugly-Eyes with their party — 1 round, 0 taken. Word travels fast.');
  check('summary cornered party rec carries the cornered clause',
    S({ outcome: 'vKill', rounds: 1, vTaken: 0, partySize: 3, corneredHold: true }, 'Thao', 'the Ugly-Eyes') ===
    'Thao killed the Ugly-Eyes with their party — 1 round, 0 taken. Word travels fast. Cornered at the treeline, it could not slip away before a blow.');
  check('summary live sortie rec carries partySize 3',
    (() => { const r = Game.fieldFight(vid, mdef, freshMonster(50, 50), { allies: 2, allyVids: ['a', 'b'] }); return (r.partySize | 0) === 3; })(),
    'partySize on live rec');

  console.log(`PROOF: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}
main().catch(e => { console.error('PARTYFINISH PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
