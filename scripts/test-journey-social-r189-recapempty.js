// test-journey-social-r189-recapempty.js — r189 M11 recap-empty tally (Lane B).
// The r181 panel's M4 near-dup scan showed 126 flags, and 19 of them (15%)
// carry ONE core line: the empty-thread recap "We were just talking.
// Nothing important." (convoRecapLine, empty thread log — a ONE-line pool).
// Pressing recap twice in one sitting re-serves the same core with a
// reframe prefix, and the M4 scan flags the pair. tallyRecapEmpty is the
// instrument for that watch: how many M4 flags carry the recap-empty core
// (either side, after the analyzer's prefix-strip).
// Proof: synthetic flags + the r181 analysis text as a corpus anchor
// (19 flag lines carry the phrase; total M4 flags 126).
'use strict';
const fs = require('fs'), path = require('path');
const { tallyRecapEmpty } = require('./journey-social-r195-helpers');

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log('PASS ' + name + ' (' + got + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}

// 1. Empty input.
check('empty: count', tallyRecapEmpty([]), 0);
check('empty: undefined', tallyRecapEmpty(undefined), 0);

// 2. Synthetic: both sides recap-empty (one flag, counted once).
check('both-sides: count', tallyRecapEmpty([
  { a: 'We were just talking. Nothing important.', b: 'We were just talking. Nothing important. Ask me something else if you want.' },
]), 1);

// 3. Synthetic: one side recap-empty, other side a different line.
check('one-side: count', tallyRecapEmpty([
  { a: 'We were just talking. Nothing important.', b: 'Still on that sickness help.' },
]), 1);

// 4. Synthetic: neither side recap-empty (jaccard flag, other same-opening).
check('neither-side: count', tallyRecapEmpty([
  { a: 'I should get back to it — but this was nice.', b: 'I should get back to it. The work does not wait.' },
  { a: 'Arguments cost calories.', b: 'Arguments cost time and temper.' },
]), 0);

// 5. Synthetic: reframe-prefix variant already stripped by the analyzer —
// the clearer-exit serve keeps the recap core plus its exit suffix.
check('clearer-exit: count', tallyRecapEmpty([
  { a: 'We were just talking. Nothing important. Ask me something else if you want.', b: 'We were just talking. Nothing important.' },
]), 1);

// 6. Synthetic: case/punctuation robustness — the tally normalizes.
check('case-variant: count', tallyRecapEmpty([
  { a: 'WE WERE JUST TALKING. NOTHING IMPORTANT!', b: 'Something else entirely.' },
]), 1);

// 7. Synthetic: a near-miss must NOT count (different sentence, same start).
check('near-miss: count', tallyRecapEmpty([
  { a: 'We were just talking about the harvest.', b: 'We were just talking about the harvest yesterday.' },
]), 0);

// 8. Corpus anchor: parse the r181 analysis text's printed M4 flags.
const analysis = fs.readFileSync(
  path.join(__dirname, '..', 'evidence', '2026-11-12', 'journey-social-life-r181-analysis.txt'), 'utf8');
const flagLines = analysis.split('\n').filter(l => l.indexOf('M4 FLAG') !== -1);
const flags = flagLines.map(l => {
  const after = l.split(' :: ')[1] || '';
  const parts = after.split(' || ');
  return { a: parts[0] || '', b: parts[1] || '' };
});
check('r181 corpus: total M4 flags', flags.length, 126);
check('r181 corpus: recap-empty flags', tallyRecapEmpty(flags), 19);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
