// test-journey-social-life-r250-m4-split-20261119.js — M4 SPLIT proof
// (Lane B, leg 5, r250). Pins the r250 classifier in
// scripts/journey-social-r226-helpers.js (classifyM4Flag / splitM4Flags):
//   (1) synthetic pairs: each known family classifies as expected.
//   (2) the 7 real CONVERSATIONAL pairs from the r238 corpus (verbatim
//       cores from evidence/2026-11-19/journey-social-life-r238-*.json)
//       classify CONV — the classifier must not swallow real prose repeats.
//   (3) sampled real INSTRUCTIONAL pairs from the same corpus classify INSTR.
//   (4) corpus regression: splitM4Flags over the r238 panel's 181 flags
//       (replicated M4 scan) == 174 instructional / 7 conversational.
// Usage: node scripts/test-journey-social-life-r250-m4-split-20261119.js
// Exit 0 iff every case passes.
'use strict';
const fs = require('fs'), path = require('path');
const { classifyM4Flag, splitM4Flags } = require('./journey-social-r226-helpers');

let passed = 0, failed = 0;
function check(name, got, want) {
  if (got === want) { passed++; }
  else { failed++; console.log('FAIL ' + name + ': got=' + got + ' want=' + want); }
}
const C = (a, b) => classifyM4Flag(a, b);

// (1) synthetic families
check('synth door', C('Move next to your partner, on the same side of the Haven door.', 'You need to be right next to your partner, same side of the Haven door, to help.'), 'instructional');
check('synth pantry re-ask', C('I still need help with the pantry run.', 'The pantry run isn\'t going away — I need help.'), 'instructional');
check('synth forage meet', C('Accept the forage request first. Meet at Haven at dawn on the following day.', 'Meet at Haven at dawn.'), 'instructional');
check('synth teach', C('You show them Goldenrod — where it grows, how to tell it apart.', 'You show them Cattail — where it grows, how to tell it apart.'), 'instructional');
check('synth care', C('Spend about half an hour providing basic care. No magic or medical ability is required.', 'We\'re going in circles — Spend about half an hour providing basic care.'), 'instructional');
check('synth wound re-ask', C('I still need help with this wound.', 'This wound isn\'t going away — I need help.'), 'instructional');
check('synth continuation', C('What got you through the first week? The very first days.', 'what got you through the first week — that\'s still where we are.'), 'instructional');
check('synth hunger plea', C('I hate to ask, but have you got anything to spare? Anything? I can\'t keep going like this.', 'I\'m past hungry — have you got anything to spare? Anything? I can\'t keep going like this.'), 'conversational');
check('synth belonging', C('I\'ve never really had people. Maybe this is — maybe this is my chance to have people.', 'I\'ve never really fit anywhere. Maybe here. Maybe this is the place.'), 'conversational');
check('synth unrelated prose', C('The sky looks wrong tonight, like it forgot how to be dark.', 'I keep thinking about the river and whether it remembers us.'), 'conversational');

// (2) the 7 real CONVERSATIONAL pairs, r238 corpus verbatim
const REAL_CONV = [
  ['\u00ab\u0418\u043c\u0435\u043d\u043d\u043e \u0442\u0430\u043a. \u0422\u044b \u043f\u0440\u0430\u0432.\u00bb — the man in his 60s translates: "Exactly so. You\'re right." They nod back, slowly.',
   '\u00ab\u042d\u0442\u043e \u043f\u0440\u0430\u0432\u0434\u0430. \u0421\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u043e \u0432\u0435\u0440\u043d\u043e.\u00bb — the man in his 60s translates: "That\'s true. Absolutely true." They nod back, a little quicker this time.'],
  ['I hate to ask, but have you got anything to spare? Anything? I can\'t keep going like this.',
   'I\'m past hungry — have you got anything to spare? Anything? I can\'t keep going like this.'],
  ['I\'m running on empty — have you got anything to spare? Anything? I can\'t keep going like this.',
   'Please — tell me you\'ve got food to spare. I\'m running on empty here. I can\'t keep going like this.'],
  ['Please — have you got anything to spare? Anything? I can\'t keep going like this.',
   'I hate to ask, but have you got anything to spare? Anything? I can\'t keep going like this.'],
  ['I\'ve never really had people. Maybe this is — maybe this is my chance to have people.',
   'I\'ve never really fit anywhere. Maybe here. Maybe this is the place.'],
  ['I\'m not proud. I\'m alive. Those two things stopped overlapping a while ago.',
   'I\'m not proud of how I survive. I\'m just committed to it.'],
  ['I\'m sorry — I\'m achy and wrung out, barely keeping food down. Can you do anything?',
   'Please — I\'m achy and wrung out, barely keeping food down. Can you do anything?'],
];
REAL_CONV.forEach((pair, i) => check('real-conv-' + (i + 1), C(pair[0], pair[1]), 'conversational'));

// (3) sampled real INSTRUCTIONAL pairs, r238 corpus verbatim
const REAL_INSTR = [
  ['Move next to your partner, on the same side of the Haven door.', 'You need to be right next to your partner, same side of the Haven door, to help.'],
  ['About the pantry run — the need hasn\'t gone anywhere. I\'m still asking.', 'About the pantry run — I still haven\'t found anyone. Any chance?'],
  ['I still need help with the pantry run.', 'I still need a hand with the pantry run.'],
  ['Accept the forage request first. Meet at Haven at dawn on the following day.', 'We\'re going in circles — Accept the forage request first. Meet at Haven at dawn on the following day. Ask me something else if you want.'],
  ['You show them Goldenrod — where it grows, how to tell it apart. "Huh." They turn it over in their mind. "I\'ll remember that one.',
   'You show them Cattail — where it grows, how to tell it apart. They nod slowly, committing it to memory. "Good to know. Really good to know.'],
  ['Spend about half an hour providing basic care. No magic or medical ability is required; this is not an instant cure.',
   'We\'re going in circles — Spend about half an hour providing basic care. No magic or medical ability is required; this is not an instant cure. Ask me something else if you want.'],
  ['I still need help with this wound.', 'I still need a hand with this wound.'],
  ['What got you through the first week? The very first days.', 'what got you through the first week — that\'s still where we are.'],
  ['You need to be right next to them, same side of the Haven door, to help.', 'Get to their side of the Haven door and stand next to them — then you can help.'],
  ['About grief — yeah, we never did get back to that.', 'About what\'s been happening — yeah, we never did get back to that.'],
];
REAL_INSTR.forEach((pair, i) => check('real-instr-' + (i + 1), C(pair[0], pair[1]), 'instructional'));

// (4) corpus regression — replicate the analyzer's M4 scan over the r238
// panel JSONs, split the flags, assert the measured baseline.
const stripRepeatPrefix = (t) => {
  let s = String(t || '').replace(/^["“]/, '').replace(/["”]$/, '');
  let prev = '';
  while (prev !== s) { prev = s; s = s.replace(/^(as i said|like i said|still the same thing|i'?ve told you three times now|we'?re going in circles a bit|short version|quick version|the way i read it)\s*[—\-–]\s*/i, ''); }
  return s;
};
const normWords = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let inter = 0; for (const w of A) if (B.has(w)) inter++; return inter / (A.size + B.size - inter || 1); };
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-19');
let allFlags = [];
for (const seed of [45749, 45750, 45751, 45752]) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, 'journey-social-life-r238-' + seed + '.json'), 'utf8'));
  const tss = ((s.social || {}).transcripts || []).filter((t) => (t.transcript || []).length >= 4);
  for (const t of tss) {
    const npc = (t.transcript || []).filter((e) => e.who === 'NPC').map((e) => stripRepeatPrefix(e.text));
    const cores = [...new Set(npc)].filter((c) => !/^still on /i.test(c));
    for (let i = 0; i < cores.length; i++) for (let j = i + 1; j < cores.length; j++) {
      const wa = normWords(cores[i]), wb = normWords(cores[j]);
      if (wa.length <= 3 || wb.length <= 3) continue;
      if (wa.slice(0, 3).join(' ') === wb.slice(0, 3).join(' ')) allFlags.push({ tag: t.tag, vid: t.vid, kind: 'same-opening', a: cores[i], b: cores[j] });
      else if (jaccard(wa, wb) >= 0.5) allFlags.push({ tag: t.tag, vid: t.vid, kind: 'jaccard>=0.5', a: cores[i], b: cores[j] });
    }
  }
}
const split = splitM4Flags(allFlags);
console.log('corpus r238: flags=' + allFlags.length + ' instructional=' + split.instructional + ' conversational=' + split.conversational);
check('corpus flags total', allFlags.length, 181);
check('corpus instructional', split.instructional, 174);
check('corpus conversational', split.conversational, 7);

console.log('M4-SPLIT: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
