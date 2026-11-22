// test-endgame-r264-tribute-first.js — journey-endgame r264 (lane B).
// Proof test for the r264 TRIBUTE_FIRST probe policy (prereg Q2): the
// delivery-order reorder in scripts/probe-endgame-r264-20261121.js.
// The pilot never reached a deedGate-ok day, so the wild experiment is
// VOID — this test proves the mechanism itself engages, on REAL attempt
// data: the r263 Pass C 89702 attempt (the converting seed), where
// feast_embassy AND military_tribute were both ready and payable 2/2
// and the embassy won the order. With TRIBUTE_FIRST=1 the same attempt
// must select military_tribute; without it, the embassy. The reorder
// block below is copied VERBATIM from the probe (lines cited) so the
// test executes the same splice/unshift, not a paraphrase.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// The r263 converting attempt, read from the committed corpus.
const attemptPath = path.join(__dirname, '..', 'evidence', '2026-11-21', 'perseed-endgame-r263-c', 'endgame-r263-89702.json');
const rec = JSON.parse(fs.readFileSync(attemptPath, 'utf8'));
const attempt = (rec.capstone.attempts || [])[0];
assert(attempt, 'r263 C 89702 must carry a capstone attempt');
assert.strictEqual(attempt.result.kind, 'feast_embassy', 'r263 delivered the embassy');
const trib = attempt.readiness.find(x => x.kind === 'military_tribute');
assert(trib && trib.ready && (trib.payable | 0) >= (trib.need | 0), 'tribute must be ready+payable on the r263 attempt');

// The reorder, verbatim from probe-endgame-r264-20261121.js (Q2 block).
// TRIBUTE_FIRST_ON is the probe's env flag; readyKinds is the probe's
// readyDetail.filter(x => x.ready), built in embassy/charter/tribute order.
function reorder(TRIBUTE_FIRST_ON, readyDetail) {
  const readyKinds = readyDetail.filter(x => x.ready);
  let tributeFirstApplied = false;
  if (TRIBUTE_FIRST_ON) {
    const ti = readyKinds.findIndex(x => x.kind === 'military_tribute');
    if (ti > 0 && (readyKinds[ti].payable | 0) >= (readyKinds[ti].need | 0)) {
      const t = readyKinds.splice(ti, 1)[0];
      readyKinds.unshift(t);
      tributeFirstApplied = true;
    }
  }
  return { first: readyKinds.length ? readyKinds[0].kind : null, tributeFirstApplied };
}

// 1. The r263 conversion flips to tribute under TRIBUTE_FIRST=1.
let r = reorder(true, attempt.readiness);
assert.strictEqual(r.first, 'military_tribute', 'tribute-first must select the tribute on the r263 attempt');
assert.strictEqual(r.tributeFirstApplied, true, 'tributeFirstApplied must be recorded');

// 2. Without the flag, the embassy still wins (r263 behavior preserved).
r = reorder(false, attempt.readiness);
assert.strictEqual(r.first, 'feast_embassy', 'flag off must keep the embassy first');
assert.strictEqual(r.tributeFirstApplied, false, 'no reorder recorded when the flag is off');

// 3. Ready-but-unpayable tribute must NOT block the embassy (the
// delivery would refuse 'veterans-short' every day and the embassy
// would never go). Scholar+1 shape: veterans 2, need 2, payable 1.
const scholarPlusOne = attempt.readiness.map(x => x.kind === 'military_tribute'
  ? Object.assign({}, x, { veterans: 2, payable: 1 }) : x);
r = reorder(true, scholarPlusOne);
assert.strictEqual(r.first, 'feast_embassy', 'unpayable tribute must not jump the queue');
assert.strictEqual(r.tributeFirstApplied, false, 'no reorder recorded for unpayable tribute');

// 4. Tribute not ready: order unchanged, no reorder.
const noTrib = attempt.readiness.map(x => x.kind === 'military_tribute'
  ? Object.assign({}, x, { ready: false, reason: 'veterans-short', veterans: 1, payable: 1 }) : x);
r = reorder(true, noTrib);
assert.strictEqual(r.first, 'feast_embassy', 'tribute not ready must leave the order alone');
assert.strictEqual(r.tributeFirstApplied, false, 'no reorder recorded when tribute is not ready');

// 5. Tribute alone ready (embassy not ready): it is first either way.
const tribOnly = attempt.readiness.map(x => x.kind === 'feast_embassy'
  ? Object.assign({}, x, { ready: false, reason: 'no-bundle-feast' }) : x);
r = reorder(true, tribOnly);
assert.strictEqual(r.first, 'military_tribute', 'tribute alone ready must be selected');
// (ti === 0, so no splice is needed — it is already first.)
assert.strictEqual(r.tributeFirstApplied, false, 'no reorder needed when tribute is already first');

console.log('test-endgame-r264-tribute-first: 5/5 PASS (r263 C 89702 attempt flips to tribute; unpayable/not-ready cases safe)');
