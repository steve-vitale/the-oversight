#!/usr/bin/env node
// test-taking-phrase-r32-20261020.js — R32 TAKING-PHRASE fixture proof.
// The driver (scripts/journey-landing-r32-20261020.js) extends TAKING_RE
// with the careful "the taken" noun-phrase (bare noun-phrase with word
// boundaries + an in-clause contest-word guard). Contest-draft lines say
// "has/have been taken", never the bare noun-phrase — the guard is the
// disambiguator (r31 metric review: "the taken" is ambiguous with
// contest-drafted villagers, so it needs a careful pattern).
//
// This test extracts TAKING_RE from the driver source (single source of
// truth) and asserts: all seek_taken "the taken" opener/stale lines from
// convo-wants.js match; all contest-draft lines + known false positives
// (snapping turtle, Bulldozer "gone from the stores") do NOT match.
// Exit 0 = PASS, 1 = FAIL.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-landing-r32-20261020.js'), 'utf8');
const m = src.match(/const TAKING_RE = (\/.*?\/i);/);
if (!m) { console.error('FAIL: TAKING_RE not found in driver'); process.exit(1); }
const re = eval(m[1]);

// Positive fixtures: every "the taken" noun-phrase line in convo-wants.js
// (seek_taken opener + stale reframe), plus the established taking lines.
const POS = [
  '"Have you heard anything? About the taken. The pods. Anything at all."',
  "\"You talk to it -- the System. Have you ever asked? About the taken -- about Edward?\"",
  "\"About the taken — about Edward. I can't stop turning it over. Have you heard anything new?\"",
  'The boring half, they said — my sister, boring.',
  'NAPPING',
  'your relatives were probably NAPPING',
  'the stasis pods are humming',
  'Edward was taken at the Scattering. The boring half.',
  'my taken kin',
  'took them at the start',
];
// Negative fixtures: contest-draft lines (the ambiguity r31 flagged) +
// the two known historical false positives.
const NEG = [
  'Lena and Lena have been taken',
  'The Pit. Marcus Webb has been taken.',
  'The Moot. Priya has been taken.',
  'they were taken for THIS contest',
  '1,400 kcal gone from the stores',
  'The snapping turtle lunges',
  'Did you hear? Rocco just walked away from Haven.',
  'gone from sight, into the treeline',
];
// NOTE (scope): the pre-existing `took them` alternative (R15) matches the
// System's "We took them! Right at the START!" beat (true positive) and, in
// theory, "the moot took them in" (a moot-admission line, not the Taking —
// pre-existing scan behavior, out of r32's scope). This test pins that r32's
// NEW "the taken" alternative adds no NEW false positives on real
// contest-draft lines, which all use "has/have been taken".
let fails = 0;
for (const t of POS) {
  if (!re.test(t)) { console.log('MISS (should match): ' + JSON.stringify(t)); fails++; }
}
for (const t of NEG) {
  if (re.test(t)) { console.log('FALSE POSITIVE (should not match): ' + JSON.stringify(t)); fails++; }
}
console.log(fails === 0
  ? `PASS: ${POS.length + NEG.length}/${POS.length + NEG.length} fixtures`
  : `FAIL: ${fails} fixture failures`);
process.exit(fails === 0 ? 0 : 1);
