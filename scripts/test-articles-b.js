#!/usr/bin/env node
// scripts/test-articles-b.js — RED→GREEN + DET-GATE proof for the hunt-beat
// indefinite-article fix (loop-B arm sim-articles-b, 2026-10-22; findings
// backlog item #764).
//
// Blank: villagerHuntResolve's stalk-fail pool hardcodes `a ${an}` and the
// kill case hardcodes `a ${aname}`, so vowel-initial animal names read
// "a Eastern Chipmunk" / "a American Mink" / "a American Crow". Same pattern
// in _trapCatchLine ("caught a ${animalName}"). Pre-existing, fiction-only.
// Fix: a phonetic a/an helper (Game.indefArt) at the template sites.
//
// Phases (each in its own process; seeds are ~3-4s each):
//   node scripts/test-articles-b.js red
//     Run against UNFIXED game.js. Asserts the blank: for every vowel-initial
//     fixture animal, the stalk-fail beat reads `stalks a <name>` and the
//     kill beat reads `brings down a <name>`. Writes the outcome digest to
//     evidence/2026-10-22/articles-b/digests-red.json.
//   node scripts/test-articles-b.js green
//     Run against FIXED game.js. Asserts the correct article for EVERY
//     vowel-initial animal in the fixture set across BOTH templates
//     (stalk-fail and kill-case): "an Eastern Chipmunk", "an American Mink",
//     ..., with the phonetic Eu- exception ("a European Hare",
//     "a Eurasian Badger"). Asserts DET-GATE: the outcome digest is
//     byte-identical to the RED run — only beat text changed, zero stream
//     effect. Also unit-tests Game.indefArt over all 22 vowel-initial roster
//     names + consonant controls (covers the trap template's helper use).
//   SEED=8903 node scripts/test-articles-b.js corpus
//     Dumps beats per fixture animal for the evidence sense read.
'use strict';
const fs = require('fs');
const path = require('path');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'articles-b');
const DIGEST_PATH = path.join(OUTDIR, 'digests-red.json');
const SEEDS = [8903, 8904, 8905, 8906];
const DAYS = 60;

// vowel-initial fixture animals: the 3 from finding #764 + 5 more roster names.
// expected: the CORRECT English article (Eu- reads "yoo" -> "a").
const FIXTURE = [
  { id: 'eastern_chipmunk', name: 'Eastern Chipmunk', art: 'an' },
  { id: 'american_mink', name: 'American Mink', art: 'an' },
  { id: 'american_crow', name: 'American Crow', art: 'an' },
  { id: 'american_alligator', name: 'American Alligator', art: 'an' },
  { id: 'european_hare', name: 'European Hare', art: 'a' },
  { id: 'eurasian_badger', name: 'Eurasian Badger', art: 'a' },
  { id: 'indian_peafowl', name: 'Indian Peafowl', art: 'an' },
  { id: 'amur_tiger', name: 'Amur Tiger', art: 'an' },
];

const { loadGame, setupGame, quietLog } = require('./sim-harness');

async function loadFresh(seed) {
  const { Game, loadFails } = await loadGame({ seed });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join(','));
  await setupGame(Game, 'Columbus, Ohio');
  return Game;
}

function forceWildlife(Game, aid) {
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    let t = null;
    try { t = Game.tileAt(x, y); } catch (e) {}
    if (t && t.type !== 'haven') t.wildlife = { [aid]: 500 };
  }
}

// Collect one fail-arm beat and one kill-arm beat for the given animal id.
// Loops bounded; the chance roll is real so fail/kill probabilities apply.
function collectBeats(Game, vid, aid, name) {
  forceWildlife(Game, aid);
  let failBeat = null, killBeat = null, tries = 0;
  while ((!failBeat || !killBeat) && tries < 400) {
    tries++;
    let r = null;
    try { r = Game.villagerHuntResolve(vid, 0); } catch (e) {}
    if (r && r.msg && /stalks /.test(r.msg) && !failBeat) failBeat = r.msg;
    try { r = Game.villagerHuntResolve(vid, 1); } catch (e) {}
    if (r && r.msg && (r.kcal || 0) > 0 && !killBeat) killBeat = r.msg;
  }
  return { failBeat, killBeat, tries };
}

async function digestFixture(seed) {
  const Game = await loadFresh(seed);
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vids = roster.slice(0, 12);
  if (vids.length < 4) throw new Error('fixture roster too small: ' + vids.length);
  const out = { seed, digest: { seed, fail: null, real: null } };
  for (const arm of ['fail', 'real']) {
    const eff = arm === 'fail' ? 0 : 1;
    let kcal = 0, kills = 0, fails = 0, other = 0;
    const aids = [];
    for (let d = 0; d < DAYS; d++) {
      for (const vid of vids) {
        let r = null;
        try { r = Game.villagerHuntResolve(vid, eff); } catch (e) { continue; }
        if (!r || !r.msg) continue;
        kcal += (r.kcal || 0);
        if ((r.kcal || 0) > 0) { kills++; if (r.aid) aids.push(r.aid); }
        else if (/stalks /.test(r.msg)) fails++;
        else other++;
      }
    }
    aids.sort();
    out.digest[arm] = { kcal, kills, aids: aids.join(','), fails, other };
  }
  return out;
}

async function phaseRed() {
  let failures = 0;
  for (const seed of SEEDS) {
    const Game = await loadFresh(seed);
    const vid = ((Game.state.village || {}).roster || [])[0];
    for (const f of FIXTURE) {
      const { failBeat, killBeat, tries } = collectBeats(Game, vid, f.id, f.name);
      if (!failBeat || !killBeat) {
        console.log(`RED-FAILED [s${seed}] ${f.name}: no fail/kill beat in ${tries} tries`);
        failures++; continue;
      }
      // The blank: hardcoded "a" before a vowel-initial name.
      const bugFail = new RegExp(`stalks a ${f.name} all morning`).test(failBeat);
      const bugKill = new RegExp(`brings down a ${f.name} `).test(killBeat);
      // Eu- names are already correct with a hardcoded "a" — the blank does
      // not manifest there; assert the (correct) text is stable.
      if (f.art === 'an') {
        if (!bugFail || !bugKill) {
          console.log(`RED-FAILED [s${seed}] ${f.name}: blank NOT reproduced (fail=${bugFail} kill=${bugKill})`);
          failures++;
        } else console.log(`red [s${seed}] ${f.name}: blank reproduced — "a ${f.name}" in both templates`);
      } else {
        const okFail = new RegExp(`stalks a ${f.name} all morning`).test(failBeat);
        const okKill = new RegExp(`brings down a ${f.name} `).test(killBeat);
        if (!okFail || !okKill) { console.log(`RED-FAILED [s${seed}] ${f.name}: Eu- text unstable`); failures++; }
        else console.log(`red [s${seed}] ${f.name}: "a ${f.name}" correct (Eu- exception), stable`);
      }
    }
  }
  // RED digest write (the DET-GATE baseline).
  const digests = {};
  for (const seed of SEEDS) digests[seed] = (await digestFixture(seed)).digest;
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(DIGEST_PATH, JSON.stringify(digests, null, 1) + '\n');
  console.log('red: digests written to ' + DIGEST_PATH);
  if (failures) { console.log('RED-FAILED: ' + failures + ' failures'); process.exit(1); }
  console.log('RED PASS: article blank reproduced on every vowel-initial fixture animal, both templates.');
}

async function phaseGreen() {
  let failures = 0;
  const check = (ok, label) => { console.log((ok ? 'green ' : 'GREEN-FAILED ') + label); if (!ok) failures++; };
  for (const seed of SEEDS) {
    const Game = await loadFresh(seed);
    const vid = ((Game.state.village || {}).roster || [])[0];
    for (const f of FIXTURE) {
      const { failBeat, killBeat, tries } = collectBeats(Game, vid, f.id, f.name);
      if (!failBeat || !killBeat) { check(false, `[s${seed}] ${f.name}: no beats in ${tries} tries`); continue; }
      const want = `${f.art} ${f.name}`;
      check(new RegExp(`stalks ${want} all morning`).test(failBeat),
        `[s${seed}] stalk-fail reads "${want}" — ${failBeat.slice(0, 90)}...`);
      check(new RegExp(`brings down ${want} `).test(killBeat),
        `[s${seed}] kill-case reads "${want}" — ${killBeat.slice(0, 90)}...`);
    }
  }
  // Helper unit test: all 22 vowel-initial roster names + consonant controls.
  const Game2 = await loadFresh(8903);
  const unitCases = [
    ['Eastern Chipmunk', 'an'], ['American Mink', 'an'], ['American Crow', 'an'],
    ['American Bullfrog', 'an'], ['Eastern Box Turtle', 'an'], ['American Woodcock', 'an'],
    ['American Alligator', 'an'], ['American Bison', 'an'], ['Eastern Coyote', 'an'],
    ['European Hare', 'a'], ['European Hedgehog', 'a'], ['Eurasian Badger', 'a'],
    ['Edible Dormouse', 'an'], ['European Perch', 'a'], ['Abyssinian Ground Hornbill', 'an'],
    ['African Buffalo', 'an'], ['African Sharptooth Catfish', 'an'],
    ['Indian Peafowl', 'an'], ['Indian Gray Mongoose', 'an'],
    ['Indian Crested Porcupine', 'an'], ['Indian Palm Squirrel', 'an'], ['Amur Tiger', 'an'],
    ['Cottontail Rabbit', 'a'], ['White-tailed Deer', 'a'], ['Gray Squirrel', 'a'],
    ['Moose', 'a'], ['Raccoon', 'a'], ['Black Bear', 'a'], ['', 'a'], ['  ', 'a'],
  ];
  for (const [w, want] of unitCases) {
    const got = Game2.indefArt(w);
    check(got === want, `indefArt("${w}") = "${got}" (want "${want}")`);
  }
  // DET-GATE: outcome digest byte-identical to RED.
  const red = JSON.parse(fs.readFileSync(DIGEST_PATH, 'utf8'));
  const green = {};
  for (const seed of SEEDS) green[seed] = (await digestFixture(seed)).digest;
  const same = JSON.stringify(red) === JSON.stringify(green);
  check(same, 'det-gate: outcome digests byte-identical red vs green (kills/kcal/aid/fails)');
  if (!same) {
    console.log('RED : ' + JSON.stringify(red).slice(0, 400));
    console.log('GREEN: ' + JSON.stringify(green).slice(0, 400));
  }
  if (failures) { console.log('GREEN-FAILED: ' + failures + ' failures'); process.exit(1); }
  console.log('GREEN PASS: every vowel-initial animal correct in both templates; stream-neutral.');
}

async function phaseCorpus() {
  const seed = parseInt(process.env.SEED || '8903', 10);
  const Game = await loadFresh(seed);
  const vid = ((Game.state.village || {}).roster || [])[0];
  for (const f of FIXTURE) {
    const { failBeat, killBeat } = collectBeats(Game, vid, f.id, f.name);
    console.log('--- ' + f.name + ' ---');
    console.log('FAIL: ' + failBeat);
    console.log('KILL: ' + killBeat);
  }
}

async function main() {
  const phase = process.argv[2];
  if (phase === 'red') await phaseRed();
  else if (phase === 'green') await phaseGreen();
  else if (phase === 'corpus') await phaseCorpus();
  else { console.log('usage: node scripts/test-articles-b.js red|green|corpus'); process.exit(1); }
}
main().catch(e => { console.error(e); process.exit(1); });
