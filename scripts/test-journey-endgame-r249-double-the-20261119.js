#!/usr/bin/env node
'use strict';
// Proof: doubled "The" in two narration sites (journey-endgame r249,
// found on the r249 panel — the timed-out run flagged it, verified here
// from the transcripts):
//   (1) villager scream_cheese: "Quinn SCREAMS ... The The Big Loud
//       freezes. (stunned)" — game.js tbVillagerAbility composes
//       'The ' + mname(target), but mname() is encSubject(), which
//       ALREADY returns 'The X' (or a capitalized pronoun) for every
//       monster. The hardcoded 'The ' doubles the article on EVERY
//       single-target villager scream.
//   (2) waiting-outing dawn note: "Nikos and the the pantry run wait:
//       the day's event came first." — favor-outing.js composes
//       'and the ${short}' but the favor shorts already carry 'the'
//       ('the pantry run', 'the creek water run' — convo-wants.js).
// RED (pre-fix): the scream line contains "The The Big Loud"; the
// dawn note contains "the the pantry run".
// GREEN (post-fix): "The Big Loud freezes." and "and the pantry run
// wait:" — no doubled article anywhere. Both fixes are string-only
// (no Math.random calls added or removed), so the panel reproduces
// bit-identically except the fixed lines — verified by re-running the
// affected seeds and diffing transcripts.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);

  // --- Root cause pin: encSubject already composes the article. ---
  const subj = Game.encSubject({ name: 'The Big Loud', mdef: { unknown: 'something big and loud' } });
  console.log(`encSubject('The Big Loud') = ${JSON.stringify(subj)}`);
  check('encSubject returns the article for a The-named monster', subj === 'The Big Loud', 'got ' + JSON.stringify(subj));

  // --- Site 1: villager scream_cheese, single target. ---
  const roster = (Game.state.village || {}).roster || [];
  const vid = roster[0];
  assert(vid, 'new run has a villager');
  const person = Game.getPerson ? Game.getPerson(vid) : null;
  const vname = (person && (person.name || person.displayName)) || 'Quinn';
  Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
  Game.state.village.npcAbilities[vid] = ['scream_cheese'];
  const monster = {
    kind: 'monster', alive: true, fled: false,
    name: 'The Big Loud', mx: 0, my: 0,
    mdef: { unknown: 'something big and loud' },
  };
  Game.tbfight = { fighters: [monster] };
  const lines = [];
  const origSay = Game.say;
  Game.say = (t) => { lines.push(String(t)); };
  let used = false;
  try {
    used = Game.tbVillagerAbility({ villagerId: vid, name: vname });
  } finally {
    Game.say = origSay;
    Game.tbfight = null;
  }
  check('villager scream fires', used === true);
  const scream = lines.find((l) => l.includes('SCREAMS'));
  console.log('scream line: ' + JSON.stringify(scream));
  check('scream line exists', !!scream);
  check('scream line has no doubled The', !/The The/.test(scream), 'got ' + JSON.stringify(scream));
  check('scream line names the monster once', scream.includes('The Big Loud freezes.'), 'got ' + JSON.stringify(scream));

  // --- Site 2: waiting-outing dawn note, pantry + creek shorts. ---
  Game.state.activeContest = { id: 'test-contest' };
  const scholar = Game.state.scholar || {};
  scholar.day = 1;
  for (const [short, want] of [
    ['the pantry run', 'and the pantry run wait:'],
    ['the creek water run', 'and the creek water run wait:'],
    ['staying close tonight', 'and the staying close tonight wait:'],
  ]) {
    const favor = {
      id: 'fav-test-' + short.replace(/\W+/g, '-'),
      kind: 'water_haul', state: 'promised',
      short, promisedDay: 0, askedDay: 0,
    };
    Game.state.village.promises = Game.state.village.promises || {};
    Game.state.village.promises[vid] = { favorId: favor.id, kept: false };
    const noteLines = [];
    Game.say = (t) => { noteLines.push(String(t)); };
    let out = null;
    try {
      out = Game.attemptWaitingOuting(vid, favor);
    } finally {
      Game.say = origSay;
    }
    const note = noteLines.find((l) => l.includes('wait:'));
    console.log(`dawn note (${short}): ` + JSON.stringify(note));
    check(`dawn note fires for ${short}`, out && out.outcome === 'noted' && !!note, 'out=' + JSON.stringify(out));
    check(`dawn note has no doubled the (${short})`, !/the the/i.test(note), 'got ' + JSON.stringify(note));
    check(`dawn note names the run once (${short})`, note.includes(want), 'got ' + JSON.stringify(note));
  }

  console.log(`\nPASS ${pass}/${pass} — double-The fix proven`);
}

main().catch((e) => { console.error('FAIL:', e && e.message); process.exit(1); });
