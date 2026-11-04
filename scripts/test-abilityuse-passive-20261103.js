// PROOF: passive audit resolved values (ability-use game-code, 2026-11-03).
// Fixture scholar holding adrenaline_control + chitin_skin: the modifier
// pipeline must resolve strike_damage x1.3^level and armor.flat +30, and
// armorBonus() must include the +30 (the audit's claim that chitin_skin
// WOULD be load-bearing if held rests on this arithmetic, not on panel
// holdings — the panel held it 0/26 times).
// Usage: node scripts/test-abilityuse-passive-20261103.js
'use strict';
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}

async function main() {
  const Game = await L.load({ seed: 99101 });
  L.newRun(Game, 'Columbus, Ohio');
  L.openSlots(Game, 6);
  // Baseline first: no combat passives held.
  const baseSd = Game.modTarget('combat.strike_damage', 1, {});
  const baseFlat = Game.modTarget('armor.flat', 0);
  console.log('  (baseline strike_damage=' + baseSd + ' armor.flat=' + baseFlat + ')');
  // Grant the two audit passives (magic lane, slotted).
  L.giveAbility(Game, 'adrenaline_control', { force: true });
  L.giveAbility(Game, 'chitin_skin', { force: true });
  const lvl = (typeof Game.abilityLevel === 'function') ? Game.abilityLevel('adrenaline_control') : 1;
  const sd = Game.modTarget('combat.strike_damage', 1, {});
  const expectSd = Math.pow(1.3, lvl || 1) * (baseSd || 1);
  check('adrenaline_control resolves x1.3^level (level ' + lvl + ')',
    Math.abs(sd - expectSd) < 0.001, 'got ' + sd + ' want ' + expectSd);
  const flat = Game.modTarget('armor.flat', 0);
  check('chitin_skin resolves armor.flat +30', flat === (baseFlat || 0) + 30, 'got ' + flat);
  const bonus = Game.armorBonus();
  check('armorBonus includes the +30', bonus >= 30, 'got ' + bonus);
  // And the audit's round-1 passive, for contrast: patient_aim x2 round:1 only.
  L.giveAbility(Game, 'patient_aim', {});
  const r1 = Game.modTarget('combat.strike_damage', 1, { round: 1 });
  const later = Game.modTarget('combat.strike_damage', 1, {});
  check('patient_aim doubles round 1 only', r1 >= 2 * later * 0.99 && later < r1, 'r1=' + r1 + ' later=' + later);
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
