#!/usr/bin/env node
// test-forage-favor-directions-20261012.js — PROOF TEST (journey deepening r6).
//
// BUG (documented journey deepening R4/R5, 2026-10-12): the pantry-run
// favor's commit line was the fixed string
//   "Good. East treeline, first light. Bring a pack."
// verbatim across every NPC — every villager's pantry run met at the same
// spot at the same hour. The whyLine was equally fixed
// ("...I know the east treeline — come with me and we'll fill packs before
// dark."). Robotic villagers: directions should come from THIS villager's
// foraging knowledge, not a shared script.
//
// FIX (src/js/convo-wants.js): Game.convoForageSpot(vid, hh) picks a meeting
// spot grounded in the ASKING villager's own known edible plants (via
// plantsKnownBy + plants.json caloriesPerUnit>0), falling back to
// treeline-relative spots; forage_help's commit/why lines are per-instance
// compositions (spot x when x gear, instance-hashed) instead of fixed strings.
//
// BEFORE: all NPCs emit the identical commitLine; RED.
// AFTER:  distinct commitLines per NPC, never the old verbatim string, and a
//         villager who knows dandelion names the dandelion patch somewhere.
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

const OLD_VERBATIM = '"Good. East treeline, first light. Bring a pack."';

(async () => {
await Game.init(); // loads data (fetch stub above)

Game.genRoster('Columbus, Ohio');
Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
Game.depart();
const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
ok('roster has villagers', roster.length >= 4, 'roster=' + roster.length);

function buildFavor(vid) {
  return Game.convoBuildFavor(vid, { kind: 'forage_help', urgency: 1 });
}

// 1. Different NPCs => different commit lines (the core regression).
// Vary the day (as real play does — favors happen across days).
const vids = roster.slice(0, 6);
const commits = [];
for (let d = 40; d <= 42; d++) {
  Game.state.scholar.day = d;
  for (const vid of vids) commits.push(buildFavor(vid).commitLine);
}
const uniqCommits = new Set(commits);
ok('18 NPC-day instances => near-total variety (collisions rare, never systematic)',
  uniqCommits.size >= 16, 'unique=' + uniqCommits.size);

// 1b. Same-day: no systematic verbatim either (pre-fix all 6 identical)
Game.state.scholar.day = 50;
const sameDay = vids.map(vid => buildFavor(vid).commitLine);
ok('6 same-day NPCs => near-total variety', new Set(sameDay).size >= 5,
  'unique=' + new Set(sameDay).size);

// 2. The old verbatim line never appears
const OLD_SUB = 'East treeline, first light';
ok('old verbatim commit line gone', !commits.includes(OLD_VERBATIM));
ok('no "East treeline, first light" substring anywhere',
  !commits.concat(sameDay).some(c => c.indexOf(OLD_SUB) !== -1));

// 3. whyLines vary too
Game.state.scholar.day = 60;
const whys = vids.map(vid => buildFavor(vid).whyLine);
ok('whyLines vary across NPCs', new Set(whys).size >= 4,
  'unique=' + new Set(whys).size);

// 4. Format: "LEAD <Spot>, <when>. <gear>."
const fmt = /^"(Good\.|Good —|Then it’s set\.|Done\.) [A-Z][^"]*, [a-z][^"]*\. [A-Z][^"]*\."$/;
ok('commit lines match lead/spot/when/gear format',
  commits.every(c => fmt.test(c)), JSON.stringify(commits[0]));

// 4b. Birthday scale: 42 instances across a week => near-zero collisions
// (r6 wild catch: 128 combos produced a byte-identical pair in 45 samples)
Game.state.scholar.day = 80;
const many = [];
for (let d = 80; d <= 86; d++) {
  Game.state.scholar.day = d;
  for (const vid of vids) many.push(buildFavor(vid).commitLine);
}
ok('42 instances => >= 40 unique commit lines', new Set(many).size >= 40,
  'unique=' + new Set(many).size);

// 5. Plant-grounding: a villager who knows edible plants names one of THEIR
//    patches somewhere in the sampled instances (the grounding channel fires)
const plantVid = vids[0];
try { Game.villagerLearnsPlant(plantVid, 'dandelion', 'test'); } catch (e) {}
const knownFoodNames = (Game.plantsKnownBy(plantVid) || [])
  .map(pid => (Game.data.plants || []).find(p => p.id === pid))
  .filter(p => p && (p.caloriesPerUnit || 0) > 0 && p.name)
  .map(p => String(p.name).toLowerCase());
ok('villager knows edible plants', knownFoodNames.length > 0,
  'count=' + knownFoodNames.length);
Game.state.scholar.day = 70;
const samples = [];
for (let i = 0; i < 16; i++) {
  const f = buildFavor(plantVid);
  samples.push(f.commitLine + ' ' + f.whyLine);
}
const named = knownFoodNames.filter(nm => samples.some(s => s.toLowerCase().indexOf(nm) !== -1));
ok('a known plant is named in some instance (grounding fires)',
  named.length > 0, 'named: ' + (named[0] || 'none of 16'));

// 6. Deterministic: same (vid, day, seq) replays the same line
Game.state.village.favorSeq = 9000;
const f1 = buildFavor(vids[1]).commitLine;
Game.state.village.favorSeq = 9000;
const f2 = buildFavor(vids[1]).commitLine;
ok('instance lines are deterministic (replay-stable)', f1 === f2, f1 + ' vs ' + f2);

// 7. The render path (ask_favor commitBeat) returns favor.commitLine when no
//    pool is attached — so this per-instance line is exactly what shows.
const probeFavor = buildFavor(vids[2]);
ok('no commitLines pool attached (single per-instance line renders)',
  !probeFavor.commitLines && !!probeFavor.commitLine,
  'commitLine=' + probeFavor.commitLine);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
})();
