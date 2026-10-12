#!/usr/bin/env node
// test-self-gossip-first-person-20261012.js — PROOF TEST (journey deepening r5).
//
// BUG (from live transcripts, journey deepening R4, seed 50505): James speaks
// TO the player and says, in third person, about HIMSELF:
//   "Did you hear? James just walked away from Haven. Didn't look back."
// The gossip branch in Game.askAbout(topic 'gossip', src/js/game.js) filtered
// heard gossip to items about OTHER people — excluding only the player
// (dims.who !== this.villagerId). A rumor about the TELLER's own departure
// (dims.who === vid) sailed through and rendered as if about a third party.
// A person talks about themselves in first person. Never misattribute the
// rumor to the teller.
//
// FIX: in the aboutOther branch, detect dims.who === vid (self) and render
// first-person lines for every action (stingy/generous/departure/return/
// default). Non-self rendering is byte-identical to before.
//
// BEFORE: test fails (self departure renders "Did you hear? <name> just
//         walked away from Haven. Didn't look back." — third person about self).
// AFTER:  test passes.
//
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// seed Math.random BEFORE eval (modules capture it at load)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(20261012);
['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
 'src/js/game.js', 'src/js/encounters.js', 'src/js/food.js', 'src/js/conversation.js',
 'src/js/convo-beats.js', 'src/js/convo-dialogue.js', 'src/js/convo-wants.js',
 'src/js/convo-mood.js', 'src/js/journal.js', 'src/js/party.js',
 'src/js/truth.js', 'src/js/storage.js', 'src/js/perceive.js', 'src/js/carexplore.js',
 'src/js/justice.js', 'src/js/debug-scenarios.js'
].forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  return roster;
}

// Force deterministic isolation of the aboutOther branch: the 50% npcGossipAbout
// path and the dark-gossip path are stubbed out so askAbout('gossip') always
// reaches the heard-gossip rendering we are testing.
function isolateAboutOther() {
  Game.npcGossipAbout = () => null;
  Game.npcDark = () => false;
}

// Seed one gossip entry about `who` that `vid` has heard, then ask vid about
// gossip and return the rendered say-lines.
function gossipLine(vid, who, action) {
  Game.state.village.gossip = [];
  Game.seedGossip(action, { who }, [vid]);
  const lines = [];
  const origSay = Game.say;
  Game.say = (m) => { lines.push(String(m)); };
  try { Game.askAbout(vid, 'gossip'); } finally { Game.say = origSay; }
  return lines;
}

(async () => {
await Game.init(); // loads data (fetch stub above)

const roster = freshGame();
isolateAboutOther();
const teller = roster[0];
const other = roster[1];
const tellerName = Game.displayName(teller);
const otherName = Game.displayName(other);

const CASES = [
  // [action, self-line marker, old third-person fragment (must NOT appear when self)]
  ['departure', 'that was me. I walked away', 'just walked away from Haven'],
  ['return', 'I left. Walked back in', "they'd never left"],
  ['stingy', "I've been holding back", 'has been holding back'],
  ['generous', "I've been generous", 'has been generous'],
  ['challenged', 'People are talking about me', 'People are talking about'],
];

// 1. SELF gossip: teller is the subject — first person, never third person.
for (const [action, firstPerson, thirdFrag] of CASES) {
  const lines = gossipLine(teller, teller, action);
  const joined = lines.join('\n');
  ok(`self ${action}: first-person line`, joined.includes(firstPerson), `got: ${joined.slice(0, 160)}`);
  if (action !== 'challenged') {
    ok(`self ${action}: no third-person self-reference`,
      !(joined.includes('Did you hear? ' + tellerName) || (joined.includes(tellerName) && joined.includes(thirdFrag))),
      `got: ${joined.slice(0, 160)}`);
  }
}

// 2. OTHER gossip: rendering unchanged — third person, named subject.
const otherLines = gossipLine(teller, other, 'departure').join('\n');
ok('other departure: third-person preserved',
  otherLines.includes(`Did you hear? ${otherName} just walked away from Haven. Didn't look back.`),
  `got: ${otherLines.slice(0, 160)}`);
const otherStingy = gossipLine(teller, other, 'stingy').join('\n');
ok('other stingy: third-person preserved',
  otherStingy.includes(`Word is ${otherName} has been holding back`),
  `got: ${otherStingy.slice(0, 160)}`);
const otherReturn = gossipLine(teller, other, 'return').join('\n');
ok('other return: third-person preserved',
  otherReturn.includes(`${otherName} is back`),
  `got: ${otherReturn.slice(0, 160)}`);

// 3. The R4 transcript case, end to end: teller must never emit their own name
// in the "Did you hear?" frame.
const selfDep = gossipLine(teller, teller, 'departure').join('\n');
ok('R4 regression: self departure never "Did you hear? <self-name>"',
  !selfDep.includes(`Did you hear? ${tellerName}`), `got: ${selfDep.slice(0, 160)}`);

console.log(`\nself-gossip-first-person: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
