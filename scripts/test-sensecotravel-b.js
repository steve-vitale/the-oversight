// test-sensecotravel-b.js — proof test for sim-sensecotravel-b (DIAG).
// Proves, against the REAL 2330Z allyslot3-rerun-b corpora (no new sims):
//   (a) the corrected join (finding #2570): the d117 editor row counts as
//       fielded, the trio-expedition d61 fight never enters the denominator,
//       and the re-judgment reproduces the frozen expectation 4/6 = 0.67;
//   (b) the co-location decomposition (finding #2571): every arm-leg sense
//       miss is classified by cause, none unclassified, none in the
//       in-plan-party-but-unsensed (guard) class — the tile question is
//       moot because the guard never bit.
// Pure analyzer functions on committed JSON; no harness, no RNG.
// Usage: node scripts/test-sensecotravel-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const A = require(path.join(__dirname, 'analyze-allyslot3-b.js'));
const REPO = path.join(__dirname, '..');
const CTL = path.join(REPO, 'evidence', '2026-11-18', 'perseed-allyslot3-rerun-b-ctl');
const ARM = path.join(REPO, 'evidence', '2026-11-18', 'perseed-allyslot3-rerun-b-arm');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) passed++;
  else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function loadSeed(dir, seed) {
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); })) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (d.seed === seed) return d;
  }
  return null;
}

// (a1) The d117 editor row, on the REAL corpus file: fighter
// miguel_santos, ally3 nikos_papadopoulos dealt 17. The corrected join
// must pick the day-115 launch (party petra + hannah + miguel + nikos —
// the sensed trio exactly) and the row must count as fielded.
(function () {
  const d = loadSeed(ARM, 104722);
  check('d117 corpus file loads (seed 104722 arm)', !!d);
  if (!d) return;
  const e = (d.v4encounters || []).find(function (x) { return x.day === 117 && x.vid === 'miguel_santos' && x.mid === 'editor'; });
  check('d117 editor encounter row exists on the real corpus', !!e, JSON.stringify((d.v4encounters || []).map(function (x) { return x.day + ':' + x.vid + ':' + x.mid; })));
  if (!e) return;
  const quads = A.quadLaunches(d);
  const joined = A.correctedJoin(quads, e);
  check('d117 joins a launch (not null)', !!joined, JSON.stringify(joined));
  if (!joined) return;
  check('d117 joins the day-115 launch (most recent best-match, not day-102)',
    joined.launch.day === 115 && joined.launch.vid === 'petra_novak' && joined.score === 3, JSON.stringify(joined));
  check('d117 ally3 nikos is a member of the joined launch party',
    joined.launch.party.indexOf('nikos_papadopoulos') !== -1, JSON.stringify(joined.launch.party));
  check('d117 counts as fielded (ally3 joined, dealt 17)',
    e.ally3Vid === 'nikos_papadopoulos' && (e.ally3Dealt | 0) === 17, JSON.stringify(e));
  check('d117 sense is full under the corrected join', A.senseIsFull(joined.launch, e));
})();

// (a2) The d61 trio-expedition fight never enters the denominator:
// fighter gen_qc8t63a belongs to no quad launch on seed 104721.
(function () {
  const d = loadSeed(ARM, 104721);
  check('d61 corpus file loads (seed 104721 arm)', !!d);
  if (!d) return;
  const e = (d.v4encounters || []).find(function (x) { return x.day === 61 && x.vid === 'gen_qc8t63a'; });
  check('d61 trio-expedition encounter row exists on the real corpus', !!e);
  if (!e) return;
  const joined = A.correctedJoin(A.quadLaunches(d), e);
  check('d61 joins nothing under the corrected join (fighter must belong)', joined === null, JSON.stringify(joined));
})();

// (a3) The re-judgment reproduces the frozen expectation exactly.
(function () {
  const armF4 = A.field4Table(ARM);
  const ctlF4 = A.field4Table(CTL);
  check('re-judgment arm field-4 is 4/6 = 0.67 (frozen expectation)',
    armF4.denom === 6 && armF4.numer === 4 && Math.abs(armF4.rate - 4 / 6) < 1e-9, JSON.stringify(armF4));
  check('re-judgment arm meetings 9 (d61 excluded, was 10 under the old join)',
    armF4.meetings === 9, JSON.stringify(armF4));
  check('re-judgment arm sense is 6/9 (d117 editor flips to full, was 5/10)',
    armF4.senseDen === 9 && armF4.senseN === 6, JSON.stringify(armF4));
  check('re-judgment ctl field-4 is 0/2 (d61 excluded, was 0/3)',
    ctlF4.denom === 2 && ctlF4.numer === 0 && ctlF4.meetings === 5, JSON.stringify(ctlF4));
  check('re-judgment arm raw rate is 4/9', Math.abs(armF4.rawRate - 4 / 9) < 1e-9, JSON.stringify(armF4));
  check('re-judgment stays NO-GO on the pilot bar (4/6 < 0.80 — the pilot verdict stands)',
    armF4.rate < 0.80);
})();

// (b) Co-location decomposition on the real corpora.
(function () {
  const armM = A.senseMisses(ARM, false);
  const ctlM = A.senseMisses(CTL, true);
  check('arm sense misses: 3 meetings, 6 sense-full of 9',
    armM.meetings === 9 && armM.senseFull === 6 && armM.misses.length === 3, JSON.stringify({ meetings: armM.meetings, senseFull: armM.senseFull, misses: armM.misses.length }));
  check('arm classification counts: expedition-ended 3, different-expedition 2, dead 2',
    armM.byCause['expedition-ended'] === 3 && armM.byCause['different-expedition'] === 2 && armM.byCause.dead === 2,
    JSON.stringify(armM.byCause));
  check('arm: zero unclassified misses',
    !Object.keys(armM.byCause).some(function (k) { return k.indexOf('unclassified') === 0; }), JSON.stringify(armM.byCause));
  check('arm: zero in-plan-party-but-unsensed — the same-target guard never bit',
    !Object.keys(armM.byCause).some(function (k) { return k.indexOf('in-plan-party-but-unsensed') === 0; }), JSON.stringify(armM.byCause));
  const d69 = armM.misses.find(function (m) { return m.seed === 104721 && m.day === 69; });
  check('d69 miss classifies both companions expedition-ended',
    !!d69 && d69.classifications.length === 2 && d69.classifications.every(function (c) { return c.cause === 'expedition-ended'; }),
    JSON.stringify(d69 && d69.classifications));
  const d112 = armM.misses.find(function (m) { return m.seed === 104722 && m.day === 112; });
  check('d112 miss classifies petra+miguel different-expedition (live d111 quad) and visjoin expedition-ended',
    !!d112 && d112.classifications.length === 3 &&
    d112.classifications.find(function (c) { return c.detail.companion === 'petra_novak'; }).cause === 'different-expedition' &&
    d112.classifications.find(function (c) { return c.detail.companion === 'miguel_santos'; }).cause === 'different-expedition' &&
    d112.classifications.find(function (c) { return c.detail.companion === 'visjoin_100'; }).cause === 'expedition-ended',
    JSON.stringify(d112 && d112.classifications));
  const d82 = armM.misses.find(function (m) { return m.seed === 104726 && m.day === 82; });
  check('d82 miss classifies both companions dead (victor d81, ingrid d82)',
    !!d82 && d82.classifications.length === 2 && d82.classifications.every(function (c) { return c.cause === 'dead'; }),
    JSON.stringify(d82 && d82.classifications));
  check('ctl misses mirror the arm causes plus the cap-2 cut (deterministic twins)',
    ctlM.byCause['expedition-ended'] === 2 && ctlM.byCause.dead === 2 && ctlM.byCause['cap-2-cut'] === 3,
    JSON.stringify(ctlM.byCause));
})();

console.log('test-sensecotravel-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
