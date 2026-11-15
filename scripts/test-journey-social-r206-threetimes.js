#!/usr/bin/env node
// test-journey-social-r206-threetimes.js — r206 M12-native tally + M2 rate watch (Lane B).
// The r200 metric review asked the analyzer to print the M12 confirmation
// counts natively instead of via a hand script: "I've told you three times
// now" serves per sitting (max <= 1, 0 sittings with 2+) and "We're going
// in circles" exit lines served (>= 1). tallyThreeTimes is that instrument.
// The r200 hand count is the corpus anchor: 23 serves panel-wide, worst
// 1/sitting, 0 sittings with 2+, 91 exits. proposalsPerVillageDay is the
// M2 rate watch (r195 160/488d = 0.328, r200 66/373d = 0.177; watch only).
// Proof: synthetic transcripts + the r200 per-seed JSONs as corpus anchors.
'use strict';
const fs = require('fs'), path = require('path');
const { tallyThreeTimes, proposalsPerVillageDay } = require('./journey-social-r206-helpers');

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log('PASS ' + name + ' (' + JSON.stringify(got) + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}

// 1. Empty input.
check('empty transcripts', tallyThreeTimes([]), { total: 0, max: 0, sittings2plus: 0, exits: 0, worstTag: null, worstVid: null, worstTurns: null });
check('undefined transcripts', tallyThreeTimes(undefined), { total: 0, max: 0, sittings2plus: 0, exits: 0, worstTag: null, worstVid: null, worstTurns: null });

// 2. Synthetic: a sitting serving the escalation twice is flagged, exits counted.
const synth = [
  { tag: 'D-talk-request', vid: 'alice', turns: 8, transcript: [
    { who: 'NPC', text: "I've told you three times now — move next to them." },
    { who: 'PLAYER', text: "I've told you three times now — why can't I?" },
    { who: 'NPC', text: "I've told you three times now — same side of the door." },
    { who: 'NPC', text: "We're going in circles — move next to them. Ask me something else if you want." },
  ] },
  { tag: 'C-friendship', vid: 'bob', turns: 4, transcript: [
    { who: 'NPC', text: "I've told you three times now — stand beside them first." },
    { who: 'NPC', text: 'Nothing about doors here.' },
  ] },
];
check('synthetic counts', tallyThreeTimes(synth), { total: 3, max: 2, sittings2plus: 1, exits: 1, worstTag: 'D-talk-request', worstVid: 'alice', worstTurns: 8 });

// 3. Player lines never count as serves; NPC lines without the phrases don't count.
check('player lines ignored', tallyThreeTimes([
  { tag: 'T', vid: 'v', turns: 2, transcript: [
    { who: 'PLAYER', text: "I've told you three times now — really." },
    { who: 'NPC', text: 'Three times is a lot, but not the line.' },
  ] },
]), { total: 0, max: 0, sittings2plus: 0, exits: 0, worstTag: null, worstVid: null, worstTurns: null });

// 4. Corpus anchor: the r200 panel JSONs (the hand-counted confirmation).
const dir = path.join(__dirname, '..', 'evidence', '2026-11-14');
let corpus = { total: 0, max: 0, sittings2plus: 0, exits: 0 };
for (const seed of [44301, 44302, 44303, 44304]) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, 'journey-social-life-r200-' + seed + '.json'), 'utf8'));
  const t = tallyThreeTimes((d.social || {}).transcripts || []);
  corpus.total += t.total; corpus.max = Math.max(corpus.max, t.max);
  corpus.sittings2plus += t.sittings2plus; corpus.exits += t.exits;
}
check('r200 corpus threeTimes total', corpus.total, 23);
check('r200 corpus threeTimes max', corpus.max, 1);
check('r200 corpus threeTimes sittings2plus', corpus.sittings2plus, 0);
check('r200 corpus threeTimes exits', corpus.exits, 91);

// 5. M2 rate watch anchors.
check('rate r200 66/373d', proposalsPerVillageDay(66, 373), 0.177);
check('rate r195 160/488d', proposalsPerVillageDay(160, 488), 0.328);
check('rate zero days', proposalsPerVillageDay(10, 0), null);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
