// test-draftmiss-a.js — proof test for arm sim-draftmiss-a.
// Proves the draft-miss classification: the analyzer's selftest is green,
// the reproduction gate holds on the committed corpus (64 poolDraftMiss
// rows -> 21 distinct pairs, exactly as the presence counter records),
// the full classification runs, and the reported counts match the pinned
// values in the evidence file (evidence/2026-11-20/sim-draftmiss-a.md).
// Pure corpus reads — no game code, no new sims, no harness load.
//
// Usage: node scripts/test-draftmiss-a.js
'use strict';
const path = require('path');
const analyze = require('./analyze-draftmiss-a.js');

const ARM = path.join(__dirname, '..', 'evidence', '2026-11-20', 'perseed-presence-a-arm');
const CTL = path.join(__dirname, '..', 'evidence', '2026-11-20', 'perseed-presence-a-ctl');

// Pinned from the classifying run (evidence/2026-11-20/sim-draftmiss-a.md).
// Filled in by the evidence commit; the test fails loudly if the instrument
// ever reproduces different numbers.
const PINNED = {
  rows: 64, pairs: 21, fights: 0, // fights filled below (0 = not yet pinned)
  counts: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 }, // filled below
  verdict: '' // filled below
};

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('ok: ' + name);
  else { failures++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

(function main() {
  // 1. The analyzer's own selftest (every class fires on a fixture).
  const st = analyze.selftest();
  check('analyzer --selftest green', st === true, 'selftest returned false');

  // 2. Reproduction gate on the committed corpus.
  const docs = analyze.loadDir(ARM);
  check('arm corpus loads 8 seeds', docs.length === 8, 'got ' + docs.length);
  const rep = analyze.reproduceMiss(docs);
  check('reproduction: 64 poolDraftMiss rows', rep.missRows.length === 64, 'got ' + rep.missRows.length);
  check('reproduction: 21 distinct pairs', rep.pairs.length === 21, 'got ' + rep.pairs.length);

  // 3. Full classification runs and is structurally sound.
  const result = analyze.analyze(ARM, CTL);
  check('analysis verdict present', result.verdict === 'GO' || result.verdict === 'NO-GO', 'got ' + result.verdict);
  const total = Object.keys(result.counts).reduce(function (s, k) { return s + result.counts[k]; }, 0);
  check('counts sum to 21 pairs', total === 21, 'got ' + total);
  check('every pair has a class a-f', result.pairs.every(function (p) { return 'abcdef'.indexOf(p.cls) !== -1; }), '');
  check('every pair has a reason', result.pairs.every(function (p) { return typeof p.reason === 'string' && p.reason.length > 0; }), '');
  check('overcount rows = 64', result.overcount.rows === 64, 'got ' + result.overcount.rows);
  check('overcount pairs = 21', result.overcount.pairs === 21, 'got ' + result.overcount.pairs);
  check('overcount fights > 0', result.overcount.fights > 0, 'got ' + result.overcount.fights);
  check('no real miss is hidden (realMiss list matches f-with-realMiss)',
    result.realMiss.length === result.pairs.filter(function (p) { return p.realMiss; }).length, '');

  // 4. Pinned values (filled by the evidence commit once the classifying
  // run has produced them). Skipped while unpinned (fights === 0).
  if (PINNED.fights > 0) {
    check('pinned: fights', result.overcount.fights === PINNED.fights, 'got ' + result.overcount.fights + ', pinned ' + PINNED.fights);
    check('pinned: counts', JSON.stringify(result.counts) === JSON.stringify(PINNED.counts),
      'got ' + JSON.stringify(result.counts) + ', pinned ' + JSON.stringify(PINNED.counts));
    check('pinned: verdict', result.verdict === PINNED.verdict, 'got ' + result.verdict + ', pinned ' + PINNED.verdict);
    check('pinned: 0 UNCLASSIFIED when GO', PINNED.verdict !== 'GO' || result.counts.f === 0, 'f=' + result.counts.f);
  } else {
    console.log('note: pinned counts not yet filled (fights === 0) — fill from the classifying run before the evidence commit');
  }

  console.log(failures === 0 ? 'test-draftmiss-a: ALL GREEN' : 'test-draftmiss-a: ' + failures + ' FAILURE(S)');
  process.exit(failures === 0 ? 0 : 1);
})();
