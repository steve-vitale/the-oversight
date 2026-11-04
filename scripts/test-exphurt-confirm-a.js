'use strict';
// test-exphurt-confirm-a.js — proof for scripts/exphurt-confirm-a-lib.js
// (sim-exphurt-confirm-a). Must be green BEFORE the judged confirm sims.
// Cases here are fixtures shaped like hurthome-b-lib cases: purpose,
// expedDurationAtOpen, expedDurationAtLastHurt, awayDuration, outcome,
// closingLines (classified line objects as exphurt-a-lib produces).
const assert = require('assert');
const clib = require('./exphurt-confirm-a-lib');

let n = 0;
const eq = (a, b, msg) => { n++; assert.deepStrictEqual(a, b, msg); };

// disconnectOfLastHurt: boundary gap >= 2 disconnects, < 2 does not;
// exped-shorter is gap > 0; missing durations exclude, never invent.
eq(clib.disconnectOfLastHurt(12, 20).disconnected, true, 'gap 8 disconnects');
eq(clib.disconnectOfLastHurt(12, 20).gap, 8, 'gap signed away-minus-exped');
eq(clib.disconnectOfLastHurt(12, 20).expedShorter, true, 'exped shorter when gap > 0');
eq(clib.disconnectOfLastHurt(19, 20).disconnected, false, 'gap 1 does not disconnect');
eq(clib.disconnectOfLastHurt(20, 20).disconnected, false, 'gap 0 does not disconnect');
eq(clib.disconnectOfLastHurt(20, 18).disconnected, true, 'gap -2 disconnects (exped longer)');
eq(clib.disconnectOfLastHurt(20, 18).expedShorter, false, 'exped longer is not exped-shorter');
eq(clib.disconnectOfLastHurt(null, 20).bothPresent, false, 'missing exped excludes');
eq(clib.disconnectOfLastHurt(12, null).bothPresent, false, 'missing away excludes');
eq(clib.disconnectOfLastHurt(null, null).disconnected, false, 'missing both never disconnects');

// summarizeLastHurt: denominator is expedition cases with both present
// at last hurt; non-expedition purposes never counted; median gap.
const cases = [
  { purpose: 'expedition', expedDurationAtLastHurt: 12, awayDuration: 20, outcome: 'returned-hurt', closingLines: [] },
  { purpose: 'expedition', expedDurationAtLastHurt: 20, awayDuration: 20, outcome: 'returned-hurt', closingLines: [] },
  { purpose: 'expedition', expedDurationAtLastHurt: null, awayDuration: 20, outcome: 'returned-hurt', closingLines: [] },
  { purpose: 'visit', expedDurationAtLastHurt: 1, awayDuration: 20, outcome: 'returned-hurt', closingLines: [] },
];
const SL = clib.summarizeLastHurt(cases);
eq(SL.disconnectDenomLastHurt, 2, 'D-last denominator excludes missing + non-expedition');
eq(SL.disconnectedLastHurt, 1, 'D-last disconnected count');
eq(SL.DLast, 0.5, 'D-last share');
eq(SL.expedShorterLastHurt, 1, 'D-last exped-shorter count');
eq(SL.medianGapLastHurt, 8, 'D-last median signed gap (upper median of [0,8])');

// m1All: announced expedition lines mentioning hurt count; silent
// returned-hurt cases count as misses (denominator = ALL returned-hurt).
const rhCases = [
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [{ isExpeditionReturn: true, mentionsHurt: false }] },
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [{ isExpeditionReturn: true, mentionsHurt: true }] },
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [] },
  { purpose: 'expedition', outcome: 'returned-hurt', closingLines: [{ isExpeditionReturn: false, mentionsHurt: true }] },
  { purpose: 'expedition', outcome: 'healed-away', closingLines: [{ isExpeditionReturn: true, mentionsHurt: true }] },
];
const MA = clib.m1All(rhCases);
eq(MA.returnedHurtExpedition, 4, 'M1-all denominator is all returned-hurt expedition cases');
eq(MA.rhExpeditionLineMentionsHurtAll, 1, 'M1-all numerator counts only expedition lines mentioning hurt');
eq(MA.M1All, 0.25, 'M1-all share counts silent + hurthome-only as misses');
eq(clib.m1All([]).M1All, null, 'M1-all null on empty denominator, never 0/0');

console.log(`test-exphurt-confirm-a: ${n}/${n} green`);
