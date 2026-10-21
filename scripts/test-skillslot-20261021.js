// scripts/test-skillslot-20261021.js — proof test for the journey-scale r18
// blank-fill: fillTalkLine's {skill} slot rendered the hardcoded stub
// "making do" ("I can making do" — ungrammatical), ignoring the villager's
// actual lifeseed human skills. The fix wires {skill} to the villager's
// first lifeseed skillOrigins key as an activity noun ("trapping",
// "field medicine"), which fits every template frame ("I can do {skill}",
// "The trick to {skill} is confidence", "This week it's {skill}").
// Companion fixes: the q_skill deeper template now reads "I can do {skill}",
// and the small-talk line "The System gave me {skill}" (which contradicted
// the HUMAN SKILLS vs ALIEN ABILITIES canon once the slot became real) now
// reads "I taught myself {skill}. The System was no help".
//
// RED: on the pre-fix code every villager renders "making do".
// GREEN: each villager renders their own skill noun in every frame, the two
//   template fixes are present, and "making do" never appears.
// Usage: node scripts/test-skillslot-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { mulberry32, loadGame, setupGame } = require('./sim-harness');

const NOUNS = {
  food: 'foraging', medicinal: 'field medicine', mending: 'mending',
  navigation: 'navigation', tracking: 'tracking', trapping: 'trapping',
  forecast: 'weather-reading', fishing: 'fishing', butchery: 'butchery',
  canning: 'canning', sewing: 'sewing', carpentry: 'carpentry',
};

async function main() {
  const fails = [];
  // 1. the data fixes are present
  const cg = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8');
  if (!cg.includes('I can do {skill}. Not well')) fails.push('characterGen.json: q_skill deeper template not fixed to "I can do {skill}"');
  if (!cg.includes('I taught myself {skill}. The System was no help')) fails.push('characterGen.json: small-talk line still has the System granting an earthly skill');
  if (cg.includes('The System gave me {skill}')) fails.push('characterGen.json: canon-violating line still present');

  // 2. the slot renders the villager's own skill in every frame
  const { Game } = await loadGame({ seed: 424242, mode: 'skillslot-proof' });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (!roster.length) throw new Error('no villagers on roster');
  const frames = [
    '"I can do {skill}. Not well — well enough that nobody\'s died from it yet."',
    '"The trick to {skill} is confidence. The trick to confidence is {skill}."',
    '"This week it\'s {skill}."',
    '"I taught myself {skill}. The System was no help."',
  ];
  let checked = 0;
  for (const vid of roster) {
    const vp = Game.vpOf(vid);
    const dna = Game.convoSpeechDNA(vid);
    const keys = Object.keys((dna && dna.skillOrigins) || {});
    if (!keys.length) continue; // lifeseed always deals 2; fallback covered below
    const noun = NOUNS[keys[0]] || keys[0];
    for (const f of frames) {
      const line = Game.fillTalkLine(f, vp);
      checked++;
      if (/making do/.test(line)) { fails.push(`${vid}: stub leaked in frame: ${line}`); continue; }
      if (!line.includes(noun)) fails.push(`${vid}: expected "${noun}" for skill ${keys[0]} in frame, got: ${line}`);
    }
  }
  // 3. fallback path (no id / no DNA) stays grammatical
  const fb = Game.fillTalkLine('"I can do {skill}."', {});
  if (!/I can do making do\./.test(fb)) fails.push(`fallback broken: ${fb}`);

  console.log(`frame checks: ${checked}`);
  if (fails.length) {
    console.log('FAILURES:');
    for (const f of fails) console.log('  ' + f);
    process.exit(1);
  }
  console.log('GREEN: {skill} renders each villager\'s own human skill noun in every frame; templates fixed; canon line fixed.');
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
