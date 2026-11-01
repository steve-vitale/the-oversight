// scripts/test-wsplit-r66.js — pure proof test for the r66 wsplit classifier.
// No harness: synthetic rows + synthetic item/recipe tables.
// Run: node scripts/test-wsplit-r66.js  (exit nonzero on any failure)
const assert = require('assert');
const { classifyRow } = require('./analyze-journey-scale-r66-20261101');
const weaponSet = new Set(['sharpened_stick', 'hunting_spear', 'bow', 'crude_bow', 'fire_hardened_spear']);
const armorSet = new Set(['bark_armor']);
const recipesById = {
  hunting_spear: { materials: { branch: 1, stone: 1, vine: 1 } },
  fire_hardened_spear: { materials: { branch: 1, wood: 1 } },
  bow: { materials: { wood: 1, vine: 2 } },
  crude_bow: { materials: { branch: 1, vine: 1 } },
};
const pile = { branch: 5, stone: 5, vine: 5, wood: 5 };
let n = 0;
function check(name, row, pileArg, want) {
  const c = classifyRow(row, pileArg === undefined ? pile : pileArg, weaponSet, armorSet, recipesById);
  for (const [k, v] of Object.entries(want)) assert.strictEqual(c ? c[k] : null, v, `${name}: ${k}`);
  n++;
}
// 1. Recorded knower, truly weaponless, mats + cooldown clear => eligible.
check('eligible', { day: 100, vid: 'a', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 1 }, cd: null }, undefined, { knower: true, firstKnown: 'hunting_spear', armedClass: 'none', matsOK: true, cooldownClear: true, eligible: true });
// 2. Seeded knower: carries a hunting spear (armed, real) => not eligible, knower via seeding.
check('seeded-armed', { day: 100, vid: 'b', dead: false, away: false, equipped: [], pack: ['hunting_spear'], stashed: [], wc: {}, cd: null }, undefined, { knower: true, armedClass: 'real', eligible: false });
// 3. Stick-only armed knower => armed stick-only, not eligible.
check('stick-only', { day: 100, vid: 'c', dead: false, away: false, equipped: [], pack: ['sharpened_stick'], stashed: [], wc: { crude_bow: 1 }, cd: null }, undefined, { knower: true, armedClass: 'stick-only', eligible: false });
// 4. Weaponless knower, no materials anywhere => matsOK false.
check('no-mats', { day: 100, vid: 'd', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 2 }, cd: null }, { branch: 0, stone: 0, vine: 0, wood: 0 }, { matsOK: false, eligible: false });
// 5. Weaponless knower, mats OK, but attempted yesterday (Cd within 3d) => cooldown blocks.
check('cooldown', { day: 100, vid: 'e', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 1 }, cd: 99 }, undefined, { cooldownClear: false, eligible: false });
// 6. Cooldown clear exactly at day-3 boundary (Cd <= day-3).
check('cooldown-edge', { day: 100, vid: 'f', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 1 }, cd: 97 }, undefined, { cooldownClear: true, eligible: true });
// 7. Non-knower weaponless => not knower, not eligible.
check('non-knower', { day: 100, vid: 'g', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: {}, cd: null }, undefined, { knower: false, eligible: false });
// 8. Dead / away rows => null (excluded from home set).
assert.strictEqual(classifyRow({ day: 100, vid: 'h', dead: true, away: false, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 1 }, cd: null }, pile, weaponSet, armorSet, recipesById), null);
assert.strictEqual(classifyRow({ day: 100, vid: 'i', dead: false, away: true, equipped: [], pack: [], stashed: [], wc: { hunting_spear: 1 }, cd: null }, pile, weaponSet, armorSet, recipesById), null);
n += 2;
// 9. Ladder order: knows both spear rungs => first known is hunting_spear.
check('ladder-order', { day: 100, vid: 'j', dead: false, away: false, equipped: [], pack: [], stashed: [], wc: { fire_hardened_spear: 1, hunting_spear: 1 }, cd: null }, undefined, { firstKnown: 'hunting_spear' });
// 10. Own pack materials count toward matsOK (branch in pack, rest in pile).
check('pack-mats', { day: 100, vid: 'k', dead: false, away: false, equipped: [], pack: ['branch'], stashed: [], wc: { hunting_spear: 1 }, cd: null }, { branch: 0, stone: 1, vine: 1, wood: 0 }, { matsOK: true, eligible: true });
console.log(`wsplit classifier proof: ${n} checks passed`);
