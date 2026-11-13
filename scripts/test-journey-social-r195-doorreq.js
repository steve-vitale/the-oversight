#!/usr/bin/env node
// test-journey-social-r195-doorreq.js — r195 M12 door-requirement tally (Lane B).
// The r189 panel's M4 near-dup scan showed 143 flags, and 86 of them (60%)
// carry a Haven-door requirement core: the favor-block pool ("Move next to
// them, on the same side of the Haven door, to help." + 3 siblings, them and
// partner wordings) and the partner-inside line ("Your partner is inside
// the Haven hall. Go through the door to meet them."). The recap-empty line
// that M11 watched collapsed (19 on r181 -> 1 on r189); the door cluster
// is the new densest repeat cluster. tallyDoorReq is the instrument for
// that watch; maxDoorServes is the B1 fix-bar instrument (worst sitting's
// door-serve count — r189 anchor: 7 in one 10-turn sitting, 43801
// D-talk-request grace_obi, where the r35 spend-out never fires because
// the r130 4-variant cycle rotates the raw line every ask and the
// escalation counter keys on the raw line).
// Proof: synthetic flags/transcripts + the r189 analysis text and
// per-seed JSONs as corpus anchors (86 flags of 143; per-seed max
// serves 7/6/6/6, totals 66/102/84/80).
'use strict';
const fs = require('fs'), path = require('path');
const { tallyDoorReq, maxDoorServes } = require('./journey-social-r195-helpers');

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log('PASS ' + name + ' (' + JSON.stringify(got) + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}

// 1. Empty input.
check('empty flags: count', tallyDoorReq([]), 0);
check('empty flags: undefined', tallyDoorReq(undefined), 0);
check('empty transcripts: max', maxDoorServes([]), { max: 0, tag: null, vid: null, turns: null, total: 0 });

// 2. Synthetic: all four block variants + both partner variants count.
check('block variants: count', tallyDoorReq([
  { a: 'Move next to them, on the same side of the Haven door, to help.', b: 'Something else entirely.' },
  { a: 'Stand beside them first — same side of the Haven door — then help.', b: 'Get to their side of the Haven door and stand next to them — then you can help.' },
  { a: 'You need to be right next to your partner, same side of the Haven door, to help.', b: 'Move next to your partner, on the same side of the Haven door.' },
]), 3);

// 3. Synthetic: partner-inside line + its "going in circles" re-serve count.
check('partner-inside: count', tallyDoorReq([
  { a: 'Your partner is inside the Haven hall. Go through the door to meet them.', b: 'Unrelated line about the harvest.' },
  { a: "We're going in circles — Your partner is inside the Haven hall. Go through the door to meet them. Ask me something else if you want.", b: 'Your partner is inside the Haven hall. Go through the door to meet them.' },
]), 2);

// 4. Synthetic: both sides door (one flag, counted once).
check('both-sides: count', tallyDoorReq([
  { a: 'Move next to them, on the same side of the Haven door, to help.', b: 'You need to be right next to them, same side of the Haven door, to help.' },
]), 1);

// 5. Synthetic: neither side door (recap-empty + unrelated jaccard flag).
check('neither-side: count', tallyDoorReq([
  { a: 'We were just talking. Nothing important.', b: 'We were just talking. Nothing important. Ask me something else if you want.' },
  { a: 'Arguments cost calories.', b: 'Arguments cost time and temper.' },
]), 0);

// 6. Synthetic: near-miss must NOT count (door mentioned without the
// requirement phrasing; "same side of the hall" without 'door').
check('near-miss: count', tallyDoorReq([
  { a: 'Meet me by the Haven door at dawn.', b: 'Meet me by the Haven door at dusk.' },
  { a: 'Stand on the same side of the hall as me.', b: 'Stand on the same side of the hall as me, please.' },
]), 0);

// 7. Synthetic: case/punctuation robustness — the tally normalizes.
check('case-variant: count', tallyDoorReq([
  { a: 'MOVE NEXT TO THEM, ON THE SAME SIDE OF THE HAVEN DOOR, TO HELP!', b: 'Something else.' },
]), 1);

// 8. Synthetic maxDoorServes: worst sitting + total.
check('serves: worst sitting', maxDoorServes([
  { tag: 'C-friendship', vid: 'ada_x', turns: 5, transcript: [
    { who: 'NPC', text: 'Move next to them, on the same side of the Haven door, to help.' },
    { who: 'YOU', text: 'Why can’t I do this now?' },
    { who: 'NPC', text: 'Get to their side of the Haven door and stand next to them — then you can help.' },
  ] },
  { tag: 'D-talk-request', vid: 'grace_obi', turns: 10, transcript: [
    { who: 'NPC', text: 'About the food I needed.' },
    { who: 'NPC', text: 'As I said — Move next to them, on the same side of the Haven door, to help.' },
    { who: 'NPC', text: 'Like I said — Get to their side of the Haven door and stand next to them — then you can help.' },
    { who: 'NPC', text: 'Still the same thing — You need to be right next to them, same side of the Haven door, to help.' },
    { who: 'NPC', text: "I've told you three times now — Stand beside them first — same side of the Haven door — then help." },
  ] },
  { tag: 'A-day1-nudge', vid: 'bob_y', turns: 3, transcript: [
    { who: 'NPC', text: 'Your partner is inside the Haven hall. Go through the door to meet them.' },
  ] },
]), { max: 4, tag: 'D-talk-request', vid: 'grace_obi', turns: 10, total: 7 });

// 9. Corpus anchor: parse the r189 analysis text's printed M4 flags.
const analysis = fs.readFileSync(
  path.join(__dirname, '..', 'evidence', '2026-11-12', 'journey-social-life-r189-analysis.txt'), 'utf8');
const flagLines = analysis.split('\n').filter(l => l.indexOf('M4 FLAG') !== -1);
const flags = flagLines.map(l => {
  const after = l.split(' :: ')[1] || '';
  const parts = after.split(' || ');
  return { a: parts[0] || '', b: parts[1] || '' };
});
check('r189 corpus: total M4 flags', flags.length, 143);
check('r189 corpus: door-req flags', tallyDoorReq(flags), 86);

// 10. Corpus anchor: max door serves per sitting from the r189 per-seed JSONs.
const wantMax = { 43801: 7, 43802: 6, 43803: 6, 43804: 6 };
const wantTotal = { 43801: 66, 43802: 102, 43803: 84, 43804: 80 };
for (const seed of [43801, 43802, 43803, 43804]) {
  const s = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'evidence', '2026-11-12', 'journey-social-life-r189-' + seed + '.json'), 'utf8'));
  const d = maxDoorServes((s.social || {}).transcripts || []);
  check('r189 corpus seed ' + seed + ': max serves', d.max, wantMax[seed]);
  check('r189 corpus seed ' + seed + ': total serves', d.total, wantTotal[seed]);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
