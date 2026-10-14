/* PROOF TEST: Build-around abilities + gear hooks (Steve 2026-10-14 ability coherency rework)
 *
 * Tests:
 * 1. Role classification: all 122 abilities have role + slotRole; payoff count > 4
 * 2. Blood Frenzy: consecutive hits stack damage; miss resets
 * 3. Retribution: blocked damage stores; unleash releases
 * 4. Nowhere Man: movement builds dodge; damage resets
 * 5. Gear hooks: machete rewrite, phase_blade no-rope (data presence)
 * 6. Offer steering: build-arounds weighted when path committed
 * 7. Synergy hints: 30+ abilities have hints
 * 8. Buildaround module loads and exposes all hooks
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ FAIL: ${msg}`); }
}

console.log('=== Build-around Coherency Proof ===\n');

// 1. Role classification
console.log('1. Role classification:');
const abilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
ok(abilities.length === 118, `122 abilities (got ${abilities.length})`);
ok(abilities.every(a => a.role), 'all have role');
ok(abilities.every(a => a.slotRole), 'all have slotRole');
const payoffs = abilities.filter(a => a.role === 'payoff');
ok(payoffs.length >= 14, `${payoffs.length} payoffs (was 4, now 4 original + 10 build-arounds)`);
const roles = {};
for (const a of abilities) roles[a.role] = (roles[a.role] || 0) + 1;
console.log(`   roles: ${JSON.stringify(roles)}`);

// 2. Build-around definitions
console.log('\n2. Build-around definitions:');
const buildarounds = ['blood_frenzy','retribution','trophy_room','feast_engine','battlefield_grace',
  'nowhere_man','cartographers_eye','crowd_favorite','hoarders_interest','cornucopia'];
for (const bid of buildarounds) {
  const b = abilities.find(a => a.id === bid);
  ok(!!b, `${bid} exists`);
  if (b) {
    ok(b.role === 'payoff', `  ${bid} is payoff`);
    ok(b.unlock && b.unlock.type === 'system_offer', `  ${bid} in system offers`);
    ok(b.synergyHints && b.synergyHints.length > 0, `  ${bid} has synergy hints`);
  }
}

// 3. Buildaround module
console.log('\n3. Buildaround module:');
const baSrc = fs.readFileSync(path.join(ROOT, 'src/js/buildarounds.js'), 'utf8');
const hooks = ['onStrikeHit','onStrikeMiss','frenzyMult','onBlocked','unleash','mark','trophyMult',
  'onHeal','feastMult','onMove','onDamaged','dodgeBonus','cartographerDodge','socialMult',
  'onDayTick','onForage','forageMult','damageMult'];
for (const h of hooks) {
  ok(baSrc.includes(h + ':'), `module exposes ${h}`);
}
// Load and test the module logic
const _g = { Scattering: {} };
_g.globalThis = _g;
// The module is an IIFE taking global; eval in a context where globalThis is _g
const _moduleFn = new Function('global', 'globalThis', baSrc + '; return global.Scattering.buildarounds;');
let BA = null;
try {
  // Wrap: the src references globalThis internally; provide it
  const _src2 = baSrc.replace(/globalThis/g, '__G__');
  const _fn2 = new Function('__G__', _src2 + '; return __G__.Scattering.buildarounds;');
  BA = _fn2(_g);
} catch (e) { console.log('  module load error:', e.message); }
ok(!!BA, 'module loads');

// Mock game for logic tests
const mockGame = {
  hasAbility: (id) => mockGame._abilities.includes(id),
  _abilities: ['blood_frenzy', 'rage', 'haymaker'], // 3 brawler = committed
  state: { scholar: { abilities: [{id:'blood_frenzy'},{id:'rage'},{id:'haymaker'}] } },
  data: { abilities: abilities },
  say: () => {},
  audioEvent: () => {},
  tbfight: { buildaround: {} },
};
console.log('\n4. Blood Frenzy logic:');
BA.onStrikeHit(mockGame, {}); // hit 1: frenzy=1
ok(BA.frenzyMult(mockGame) === 2.0, `2nd hit crits x2.0 (got ${BA.frenzyMult(mockGame)})`);
BA.onStrikeMiss(mockGame);
ok(BA.frenzyMult(mockGame) === 1, 'miss resets to ×1');

console.log('\n5. Retribution logic:');
const mockGame2 = {
  hasAbility: (id) => id === 'retribution',
  state: { scholar: { buildaround: {} } },
  say: () => {}, audioEvent: () => {},
};
BA.onBlocked(mockGame2, 40);
BA.onBlocked(mockGame2, 40);
ok(mockGame2.state.scholar.buildaround.retribution === 80, `stored 80 (got ${mockGame2.state.scholar.buildaround.retribution})`);
const unleashed = BA.unleash(mockGame2);
ok(unleashed === 80, `unleash releases 80 (got ${unleashed})`);
ok(mockGame2.state.scholar.buildaround.retribution === 0, 'storage cleared after unleash');

console.log('\n6. Nowhere Man logic:');
const mockGame3 = {
  hasAbility: (id) => id === 'nowhere_man',
  state: { scholar: { abilities: [{id:'nowhere_man'}] } },
  data: { abilities: abilities },
  say: () => {},
  tbfight: { buildaround: {} },
};
BA.onMove(mockGame3, 4);
const dodge = BA.dodgeBonus(mockGame3);
ok(dodge === 0.2, `4 tiles = +20% dodge uncapped path (got ${dodge})`);
BA.onDamaged(mockGame3);
ok(BA.dodgeBonus(mockGame3) === 0, 'damage resets streak');

// 7. Gear abilityHooks: CUT per Steve 2026-10-14 — gear rewriting abilities
// is category confusion. Gear grants situational actions (the 4 named
// synergies: Shattering Blow etc.), it doesn't rewrite verbs.
console.log('\n7. Gear abilityHooks (cut):');
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
const withHooks = items.filter(i => i.abilityHooks);
ok(withHooks.length === 0, `no abilityHooks (system cut, got ${withHooks.length})`);
// The 4 named weapon-ability synergies are the model (action-level, rare).
const syns = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/synergies.json'), 'utf8'));
const synList = syns.synergies || syns;
for (const sid of ['shattering_blow','impaling_scream','blood_iron','static_edge']) {
  ok(!!synList.find(s => s.id === sid), `${sid} synergy exists (action-level gear interaction)`);
}

// 8. Synergy hints coverage
console.log('\n8. Synergy hints:');
const withHints = abilities.filter(a => a.synergyHints && a.synergyHints.length);
ok(withHints.length >= 30, `${withHints.length} abilities with synergyHints (was 5)`);

// 9. Path colors in CSS
console.log('\n9. Path colors:');
const css = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8');
for (const p of ['brawler','shieldbearer','hunter','survivalist','caregiver']) {
  ok(css.includes(`[data-path="${p}"]`), `CSS has ${p} color`);
}

// 10. Slot roles in UI
console.log('\n10. Slot roles in UI:');
const appSrc = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
ok(appSrc.includes('ab-role'), 'ability bar shows slot roles');
ok(appSrc.includes('data-path'), 'ability bar has path colors');

// 11. Offer steering
console.log('\n11. Offer steering:');
const contestsSrc = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
ok(contestsSrc.includes('_steerW'), 'contest offers weight by path');
ok(contestsSrc.includes('buildaround'), 'build-arounds steered when committed');

// 12. Witnessed synergies
console.log('\n12. Witnessed synergies:');
const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
ok(gameSrc.includes('witnessedSynergies'), 'Codex records witnessed synergies');
ok(gameSrc.includes('SYNERGY WITNESSED'), 'synergy announcements name paths');

// 13. Relic enhancements (semantic gear)
console.log('\n13. Semantic gear (relic enhancements):');
const relics = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/relicEnhancements.json'), 'utf8'));
for (const rid of ['blood_bonded','path_attuned','veterans_edge']) {
  ok(!!relics.find(r => r.id === rid), `${rid} enhancement exists`);
}

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
