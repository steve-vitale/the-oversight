#!/usr/bin/env node
// PROOF: encDamageSource possessive-generic fix (scale leg 2026-10-11).
// Before: a NAMED monster whose attack name is still knowledge-gated rendered
// "Redactor's the attack hits you for 22." — not a sentence.
// After: "Redactor's attack hits you for 22."
// Unknown attackers still get the dread noun ("The attack hits you").
//
// Usage: node scripts/test-enc-damage-source-20261011.js

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
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + JSON.stringify(want)); }
}

async function main() {
  await Game.init();
  if (!Game.state) Game.state = {};
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = { redactor: { villageName: 'Redactor' } };
  Game.state.systemArrived = true;
  Game.tbPatternKnown = function () { return false; };

  // named monster, generic (knowledge-gated) attack -> possessive on "attack"
  const named = { name: 'The Redactor', mdef: { id: 'redactor', unknown: 'something moving', encounter: { shortName: 'Redactor' } } };
  check('named + generic attack', Game.encDamageSource(named, null), "Redactor's attack");

  // named monster, known attack name -> unchanged
  Game.tbPatternKnown = function () { return true; };
  check('named + known attack', Game.encDamageSource(named, 'Redact'), "Redactor's Redact");

  // unnamed attacker -> dread noun
  Game.tbPatternKnown = function () { return false; };
  const unnamed = { name: 'something huge, rooting in the underbrush', mdef: { id: 'bulldozer', unknown: 'something huge, rooting in the underbrush' } };
  check('unnamed + generic attack', Game.encDamageSource(unnamed, null), 'The attack');

  // unnamed attacker, known attack name -> dread noun + name
  Game.tbPatternKnown = function () { return true; };
  check('unnamed + known attack', Game.encDamageSource(unnamed, 'China-Shop Charge'), 'The China-Shop Charge');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
