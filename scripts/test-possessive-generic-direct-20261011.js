#!/usr/bin/env node
// PROOF: endgame-leg fix 2026-10-11 — possessive-generic in the DIRECT strike
// path (game.js ~31682). The scale-leg fix covered encDamageSource, but the
// generic direct-strike path composed its own "<name>'s " + hitName, and
// hitName is 'the attack' while the pattern is knowledge-gated. Live
// evidence from a played wave-3 fight (seed 99, day 55):
//   "Redactor's the attack hits you for 34." / "Callback's the attack hits you for 20."
// AFTER: the path routes through encDamageSource —
//   named+generic -> "Redactor's attack", unnamed -> "The attack".
//
// Usage: node scripts/test-possessive-generic-direct-20261011.js

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 20261011;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.window = global; // eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

// minimal state so encShortLabel's codex gate doesn't throw
Game.state = Game.state || {};
Game.state.codex = { monsters: {} };
Game.state.systemArrived = true;

let pass = 0, fail = 0;
function check(name, actual, expected) {
  if (actual === expected) { pass++; console.log(`ok   ${name}: "${actual}"`); }
  else { fail++; console.log(`FAIL ${name}: got "${actual}", want "${expected}"`); }
}

function mockMonster(name, mid, attackName, unknown) {
  return {
    name,
    mdef: { id: mid, attack: attackName ? { name: attackName } : {}, unknown: unknown || 'something moving', encounter: {} },
    kind: 'monster',
  };
}

// 1. named monster, pattern NOT learned -> generic attack. The scale-leg
//    transcript bug: "Redactor's the attack". Must now be "Redactor's attack".
const redactor = mockMonster('Redactor', 'redactor', 'Redact', 'something moving');
// pattern unknown: encAttackName needs tbPatternKnown — force unknown by
// checking encDamageSource with a null tg attack name (no name -> 'the attack')
check('named + generic attack (Redactor)', Game.encDamageSource(redactor, null), "Redactor's attack");
const callback = mockMonster('Callback', 'callback', 'Encore', 'something moving');
check('named + generic attack (Callback)', Game.encDamageSource(callback, null), "Callback's attack");

// 2. named monster, pattern KNOWN -> keeps the true name, possessive.
//    (Simulate learned pattern: codex entry with the name recorded.)
Game.state.codex.monsters.redactor = { patternNames: ['Redact'] };
const knownName = (function () {
  try { return Game.encAttackName(redactor, null); } catch (e) { return 'ERR'; }
})();
console.log('info: encAttackName pre-pattern state ->', JSON.stringify(knownName));

// 3. unnamed monster -> dread noun, no possessive
const unknown = mockMonster('something huge, rooting in the underbrush', 'bulldozer', 'Charge', 'something huge, rooting in the underbrush');
check('unnamed + generic attack', Game.encDamageSource(unknown, null), 'The attack');

// 4. the direct-strike code path must route through encDamageSource now —
//    the old inline "'s " + hitName composition is gone from that block.
const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
const blockStart = src.indexOf('POSSESSIVE-GENERIC (endgame-leg fix 2026-10-11)');
const block = blockStart >= 0 ? src.slice(blockStart, blockStart + 2600) : '';
const usesRoute = block.indexOf('encDamageSource(m, tg.attackName)') >= 0;
const oldPattern = /\(this\.encShortLabel\(m\) \|\| m\.name\) \+ "'s " \+ hitName/.test(block);
check('direct path routes through encDamageSource', usesRoute, true);
check('old inline possessive composition removed', oldPattern, false);
// and the block's three narrations all use the routed label
const blockFlat = block.replace(/\s+/g, ' ');
check('miss line uses routed label', blockFlat.indexOf('${dmgSrc} swipes at sand-ghosts') >= 0, true);
check('hit announce uses routed label', blockFlat.indexOf('💥 ${dmgSrc} finds') >= 0, true);
check('tbDamage uses routed label', blockFlat.indexOf('this.tbDamage(t.key, dmg, dmgSrc,') >= 0, true);

// 5. BEFORE/AFTER demonstration: the old composition vs the new label for
//    the exact transcript line from seed 99 day 55.
const before = 'Redactor' + "'s " + 'the attack' + ' hits you for 34.';
const after = Game.encDamageSource(redactor, null) + ' hits you for 34.';
check('before/after (Redactor)', before !== after && after === "Redactor's attack hits you for 34.", true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
