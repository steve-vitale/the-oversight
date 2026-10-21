#!/usr/bin/env node
// PROOF TEST: TAKING_RE matches the KIN collective noun "the taken"
// (journey landing r32 2026-10-21).
//
// R31's metric review carried this gap: the scan never matched the KIN
// collective noun phrase "the taken" — Teodor's seed-203 d12 seek_taken
// opener "About the taken — about Edward?" went uncounted, so TAKING-KIN
// under-measured villager-side Taking talk. The r31 worry was ambiguity
// with contest-drafted villagers, but the corpus check says the noun
// phrase is unambiguous: convo-wants.js:1212 seek_taken opener
//   "Have you heard anything? About the taken. The pods. Anything at all."
//   "You talk to it -- the System. Have you ever asked? About the taken -- about ${first}?"
// table.js endgame canon: "The Taken walk in: the half of the adults gone
//   since day zero" / "Bring the Taken home."
// takenKinCensus fates: "the taken ones were bad. I said no."
// Contest grabs use VERB forms only — contests.js _cxTakenLine:
//   "The System has taken X." / "X has been chosen." — never the noun
//   phrase. And contests don't fire days 1-14 anyway.
// FIX (instrument-only, scripts/journey-landing-r32-20261021.js): TAKING_RE
// gains /\bthe taken\b/. No src/js change, no [needs-eyes].
//
// RED (pre-fix — the committed r31 driver's pattern, extracted from the
//   file, not a copy-paste): matches NONE of the 4 noun-phrase fixtures.
//   If OLD matches any of them, the gap premise is wrong and this test
//   must FAIL instead of claiming a fix.
// GREEN (fixed): the r32 driver's ACTUAL TAKING_RE (require()d from the
//   driver — the require.main guard means no sim starts on import)
//   matches all 4 KIN fixtures, matches all pre-existing positives
//   (no coverage lost), and matches NONE of the contest verb-form lines
//   (no false positives).
//
// Usage: node scripts/test-landing-r32-taken-noun-20261021.js
// (no sim-harness needed — pure regex fixtures; exits 0 on GREEN, 1 otherwise)

const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

function extractTakingRE(driverPath) {
  const src = fs.readFileSync(driverPath, 'utf8');
  const m = src.match(/const TAKING_RE = (\/.*?\/i);/);
  if (!m) throw new Error('TAKING_RE not found in ' + driverPath);
  return eval(m[1]); // the file's own literal — our repo code, not input
}

// ---- fixtures: real lines, not invented ones ----
const KIN_FIXTURES = [
  '"You talk to it -- the System. Have you ever asked? About the taken -- about Kairat?"', // r31 evidence, 204 d9
  '"Have you heard anything? About the taken. The pods. Anything at all."',               // convo-wants.js:1212
  'asked if the taken ones were bad. I said no. He asked if they were boring. I did not answer', // takenKinCensus fate, r31 evidence
  'Then the doors at the edge of the light open. The Taken walk in: the half of the adults gone since day zero, and the children out of the pods, blinking.', // table.js canon
];
const CONTEST_NEGATIVES = [
  'The System has taken Nia.',                    // contests.js _cxTakenLine, single
  'Nia has been chosen.',                         // contests.js _cxTakenLine, player-form variant
  'The System has taken Nia, Rocco and Jesse.',   // contests.js _cxTakenLine, multi
];
const OLD_POSITIVES = [ // pre-existing coverage that must not regress
  "They're somewhere SAFE! The boring half — the sitters, the yawn-ers!",
  'The little ones are NAPPING. Very cozy. Very still!',
  'Your relatives were probably in it! Statistics! Don\'t think about it!',
  'I asked Nia about what happened to my taken kin',
  'stasis pods hum in the dark',
];
const OLD_NEGATIVES = [ // things the old pattern already (correctly) missed
  'a snapping turtle by the creek', // r30: /NAPPING/i matched 'snapping' — the \b fix
  'the garden needs taken-care-of rows', // verb-ish 'taken' without the noun phrase
];

const R31 = path.join(__dirname, 'journey-landing-r31-20261020.js');
const OLD = extractTakingRE(R31);
const NEW = require('./journey-landing-r32-20261021.js').TAKING_RE;
console.log('OLD = r31 committed driver pattern; NEW = r32 driver pattern (require()d)');

console.log('-- RED: the pre-fix gap is real --');
for (const s of KIN_FIXTURES) {
  ok(!OLD.test(s), 'RED gap: old pattern misses ' + JSON.stringify(s.slice(0, 60)));
}

console.log('-- GREEN: the fix catches the noun phrase --');
for (const s of KIN_FIXTURES) {
  ok(NEW.test(s), 'GREEN kin: matches ' + JSON.stringify(s.slice(0, 60)));
}
console.log('-- GREEN: no contest false positives --');
for (const s of CONTEST_NEGATIVES) {
  ok(!NEW.test(s), 'GREEN contest: still misses ' + JSON.stringify(s.slice(0, 50)));
}
console.log('-- GREEN: pre-existing coverage intact --');
for (const s of OLD_POSITIVES) {
  ok(NEW.test(s), 'GREEN keep: matches ' + JSON.stringify(s.slice(0, 50)));
}
for (const s of OLD_NEGATIVES) {
  ok(!NEW.test(s), 'GREEN keep: misses ' + JSON.stringify(s.slice(0, 50)));
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
