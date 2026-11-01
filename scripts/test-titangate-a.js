#!/usr/bin/env node
// test-titangate-a.js — proof test for the sim-titangate-a instrument +
// analyzer. Synthetic classifier/join cases always run; corpus legs
// run when TITANGATE_EVID points at a per-seed dir (they re-derive
// the verdict gates from the judged corpus). Exit 1 on any failure.
//
// Usage: node scripts/test-titangate-a.js
//        TITANGATE_EVID=evidence/2026-11-01/perseed-titangate-a node scripts/test-titangate-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed, analyzeBand, musterClass, gateLabel, normalizeLine } = require('./titangate-a-analyze');

let pass = 0, fail = 0, skipped = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

function seedBase(over) {
  return Object.assign({
    seed: 1, anchorCommit: 'test', gameDays: 120, endReason: 'over',
    won: 0, national: 0, table: 0, maxWave: 4, endScaleRank: 'village',
    rows: [], tbStarts: [], tbEnds: [], fights: [], removals: [],
    sayNeedle: [], refusalBeats: {}, captureErrs: 0,
    finalTitans: { outcomes: [], musters: {}, slain: {}, cast: null },
    finalWorldTypes: [],
  }, over || {});
}
let eseq = 0;
function ref(over) {
  return Object.assign({
    eseq: ++eseq, day: 100, fightSeq: null, type: 'herald', kind: 'herald',
    wave: 4, refused: true, refusedHow: 'return-null', threw: null,
    sayDuring: [], sayDuringCount: 0,
    muster: { allies: 3, allyVillages: 2, haven: 0, need: 10 },
    outcomeEntry: { titan: 'herald', day: 100, outcome: 'refused', detail: { gate: 'muster', have: 3, need: 10 } },
    worldPresent: [{ tx: 4, ty: 4, hp: 100, maxHp: 100 }],
  }, over || {});
}

// musterClass unit checks.
check('muster incomplete from outcomes detail', musterClass(ref()) === 'incomplete');
check('muster complete-but-refused from outcomes detail', musterClass(ref({ outcomeEntry: { titan: 'herald', day: 100, outcome: 'refused', detail: { gate: 'muster', have: 12, need: 10 } } })) === 'complete-but-refused');
check('campaign gate -> complete-but-refused', musterClass(ref({ outcomeEntry: { titan: 'nielsen', day: 100, outcome: 'refused', detail: { gate: 'campaign', reason: 'march first' } } })) === 'complete-but-refused');
check('no-muster class', musterClass(ref({ outcomeEntry: null, muster: { allies: 0, allyVillages: 0, haven: 0, need: 10, noMuster: true } })) === 'no-muster');
check('entry -> n/a-entry', musterClass(ref({ refusedHow: 'entry', kind: 'herald' })) === 'n/a-entry');
check('other -> n/a-other', musterClass(ref({ kind: 'other', type: 'moderator', refusedHow: 'return-null', outcomeEntry: null, muster: null })) === 'n/a-other');
check('missing sources -> unclassified', musterClass(ref({ outcomeEntry: null, muster: null })) === 'unclassified');

// gateLabel unit checks.
check('gate muster', gateLabel(ref()) === 'muster');
check('gate campaign', gateLabel(ref({ outcomeEntry: { detail: { gate: 'campaign' } } })) === 'campaign');
check('gate entry', gateLabel(ref({ refusedHow: 'entry' })) === 'entry');

// normalizeLine: varying have/need counts collapse to one reason.
check('normalize collapses counts', normalizeLine('⛔ THE HERALD does not notice you. muster 10 allied blades (you have 3). This is not courage. This is arithmetic.') === normalizeLine('⛔ THE HERALD does not notice you. muster 10 allied blades (you have 7). This is not courage. This is arithmetic.'));
check('normalize keeps distinct reasons apart', normalizeLine('line A muster 10 allied blades (you have 3)') !== normalizeLine('line B'));

// Case 1: herald streak, 3 refusals with lines, then a wild fight —
// next=fought, reattempted, coverage 1.0.
{
  eseq = 0;
  const line = [{ day: 161, line: '⛔ THE HERALD does not notice you the way prey notices a hunter. muster 10 allied blades (you have 3). This is not courage. This is arithmetic.' }];
  const o = seedBase({
    tbStarts: [ref({ eseq: 1, day: 161, sayDuring: line, sayDuringCount: 1 }),
      ref({ eseq: 2, day: 162, sayDuring: line, sayDuringCount: 1 }),
      ref({ eseq: 3, day: 163, sayDuring: line, sayDuringCount: 1 })],
    fights: [{ eseq: 4, ch: 'wild', day: 170, seq: 9, type: 'herald', wave: 4, vid: 'v1', outcome: 'vFlee' }],
    finalWorldTypes: [],
  });
  const a = analyzeSeed(o);
  check('c1 gateRefused 3', a.gateRefusedTotal === 3, 'got ' + a.gateRefusedTotal);
  check('c1 coverage 1', a.coverage === 1);
  check('c1 streak next fought', a.streaks.length === 1 && a.streaks[0].next === 'fought', 'got ' + JSON.stringify(a.streaks));
  check('c1 streak reattempted', a.streaks[0].reattempted === true);
  check('c1 unclassified 0', a.unclassifiedCount === 0);
  check('c1 one distinct line text', Object.keys(a.gateLineTexts).length === 1);
}

// Case 2: nielsen streak, refusals with NO lines, monster still on the
// board at end — next=lingering, coverage 0 (instrument gap visible,
// not hidden).
{
  eseq = 0;
  const o = seedBase({
    tbStarts: [ref({ eseq: 1, day: 90, type: 'nielsen', kind: 'nielsen', wave: 5, muster: { allies: 0, allyVillages: 0, haven: 0, need: 12 }, outcomeEntry: { titan: 'nielsen', day: 90, outcome: 'refused', detail: { gate: 'muster', have: 0, need: 12 } } })],
    finalWorldTypes: ['nielsen'],
  });
  const a = analyzeSeed(o);
  check('c2 coverage 0', a.coverage === 0);
  check('c2 streak next lingering', a.streaks[0].next === 'lingering');
  check('c2 muster incomplete', a.streaks[0].musterClasses[0] === 'incomplete');
}

// Case 3: entry-refused + other-kind return-null are classified but
// excluded from the gate coverage denominator.
{
  eseq = 0;
  const o = seedBase({
    tbStarts: [
      ref({ eseq: 1, refusedHow: 'entry', sayDuring: [] }),
      ref({ eseq: 2, kind: 'other', type: 'moderator', wave: 3, refusedHow: 'return-null', outcomeEntry: null, muster: null, sayDuring: [] }),
      ref({ eseq: 3, sayDuring: [{ day: 100, line: '⛔ THE HERALD does not notice you. muster 10 allied blades (you have 1). This is not courage. This is arithmetic.' }], sayDuringCount: 1 }),
    ],
    removals: [{ eseq: 4, day: 110, type: 'herald', wave: 4 }],
    finalWorldTypes: ['moderator'],
  });
  const a = analyzeSeed(o);
  check('c3 refusedTotal 3', a.refusedTotal === 3);
  check('c3 gateRefused 1 (entry+other excluded)', a.gateRefusedTotal === 1, 'got ' + a.gateRefusedTotal);
  check('c3 coverage 1 over gate only', a.coverage === 1);
  check('c3 herald streak next removed', a.streaks.find(s => s.mid === 'herald').next === 'removed');
  check('c3 moderator streak next lingering', a.streaks.find(s => s.mid === 'moderator').next === 'lingering');
  check('c3 unclassified 0', a.unclassifiedCount === 0);
}

// Case 5 (Amendment 1): a return-null start joined to a same-day tbEnd
// is a dissolved audience, NOT a later fight: dissolvedSelf counts it
// and foughtAfter excludes it, so the streak falls through to the
// later genuine events (here: none + absent at end -> run-ended).
{
  eseq = 0;
  const o = seedBase({
    tbStarts: [ref({ eseq: 1, kind: 'other', type: 'moderator', wave: 3, refusedHow: 'return-null', outcomeEntry: null, muster: null, sayDuring: [] })],
    tbEnds: [{ eseq: 2, day: 100, fightSeq: null, result: 'routed' }],
    finalWorldTypes: [],
  });
  // The tbEnd above has fightSeq null, so it joins to nothing; give the
  // refused start a fightSeq and re-join properly.
  o.tbStarts[0].fightSeq = 7;
  o.tbEnds[0].fightSeq = 7;
  const a = analyzeSeed(o);
  check('c5 dissolvedSelf 1', a.streaks[0].dissolvedSelf === 1, 'got ' + a.streaks[0].dissolvedSelf);
  check('c5 dissolved not counted as foughtAfter', a.streaks[0].foughtAfter === 0);
  check('c5 streak next run-ended', a.streaks[0].next === 'run-ended', 'got ' + a.streaks[0].next);
}

// Case 4: a titan-gate refusal with neither outcomes detail nor muster
// snapshot is unclassified (fails the 100% bar loudly, not silently).
{
  eseq = 0;
  const o = seedBase({ tbStarts: [ref({ eseq: 1, outcomeEntry: null, muster: null, sayDuring: [] })] });
  const a = analyzeSeed(o);
  check('c4 unclassified 1', a.unclassifiedCount === 1);
}

// Corpus legs.
const evid = process.env.TITANGATE_EVID;
if (!evid) {
  skipped++;
  console.log('SKIP: corpus legs (TITANGATE_EVID unset)');
} else {
  const { pooled, seeds } = analyzeBand(evid);
  check('corpus 16 seeds', seeds.length === 16, 'got ' + seeds.length);
  check('corpus captureErrs 0', pooled.captureErrsTotal === 0, 'got ' + pooled.captureErrsTotal);
  check('corpus unclassified 0', pooled.unclassifiedCount === 0, 'got ' + pooled.unclassifiedCount);
  check('corpus coverage >= 0.90', pooled.coverage !== null && pooled.coverage >= 0.90, 'got ' + pooled.coverage);
  const heraldTotal = seeds.reduce((s, x) => s + (x.refusedByKind.herald || 0), 0);
  check('corpus herald refused == 36 (vet2mfg reproduction)', heraldTotal === 36, 'got ' + heraldTotal);
  const s95312 = seeds.find(s => s.seed === 95312);
  check('corpus 95312 nielsen refused == 147 (vet2mfg reproduction)', s95312 && (s95312.refusedByKind.nielsen || 0) === 147, 'got ' + (s95312 && s95312.refusedByKind.nielsen));
  check('corpus every seed complete', seeds.every(s => s.complete));
}

console.log(`test-titangate-a: ${pass} passed, ${fail} failed, ${skipped} skipped`);
process.exit(fail ? 1 : 0);
