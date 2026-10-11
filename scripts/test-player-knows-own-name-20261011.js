#!/usr/bin/env node
// PLAYER KNOWS THEIR OWN NAME — PROOF (playtest loop 2026-10-11, landing leg).
//
// The arrival text announces the player's full name + occupation, but
// displayName(playerId) returned the stranger descriptor ("A person, maybe
// 50s") until the name was "learned through talk" — incoherent: you know your
// own name. Knowledge gating is for OTHER people.
// FIX: displayName short-circuits for the player's own villager id.
//
// Guards: strangers still gated (descriptor pre-System), and names still
// resolve normally once known / post-System.
//
// Usage: node scripts/test-player-knows-own-name-20261011.js [SEED=...]

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

let _s = SEED >>> 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.window = global;
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js',
  'src/js/villager-agency.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}` + (extra ? ` — ${extra}` : '')); }
}

async function main() {
  console.log(`=== player knows own name (seed ${SEED}) ===`);
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const pid = Game.villagerId;
  const selfName = Game.displayName(pid);
  const trueName = Game.npcName(pid);
  ok('player displayName is their true name at spawn',
    selfName === trueName && !/^A (person|man|woman)/i.test(selfName),
    `displayName="${selfName}" npcName="${trueName}"`);

  // Guard: strangers are still gated pre-System.
  const other = Game.state.village.roster.find(id => id !== pid);
  const otherName = Game.displayName(other);
  ok('stranger still shows a descriptor pre-System (gating intact)',
    /^A (person|man|woman)/i.test(otherName),
    `displayName="${otherName}"`);

  // Guard: known names still resolve.
  Game.state.village.knownNames = Game.state.village.knownNames || {};
  Game.state.village.knownNames[other] = true;
  ok('known stranger name resolves after reveal',
    Game.displayName(other) === Game.npcName(other),
    `displayName="${Game.displayName(other)}"`);

  console.log(`\n=== RESULT: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
