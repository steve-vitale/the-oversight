// scripts/test-journey-scale-r104-natgate-20261106.js — proof test for the
// r103 nat-gate classifier (analyzer module, no panel run).
// classifyNatGate mirrors hierarchy.js _checkNational + the four polity
// candidates; the gate priority order is the engine's own (nationalLive /
// pending -> refused -> exiled -> rung -> shape candidates -> defer).
// PRE-REGISTER: evidence/2026-11-06/journey-scale-r104-prereg.md (Q1).
// Not on the green list (same precedent as the r102/r105/r106/r107 proof
// tests — do not add it).
'use strict';
const { classifyNatGate, summarizeNatGate } = require('./analyze-journey-scale-r104-20261106.js');

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log(`ok ${name}`); }
  else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
function base(over) {
  return Object.assign({
    day: 100, rank: 'regional', nationalLive: false, globalLive: false,
    networkLive: true, networkLiveDay: 60, rungReady: true,
    exiled: false, scaleRefused: false,
    pendingShape: null, pendingDay: null,
    leadActive: 1, leadSeasoned: 1, covActive: 0, covSeasoned: 0,
    tradeActive: 0, tradeSeasoned: 0, belong: null, foreignMax: 2,
    leadPolity: null, belongPolity: null, covPolity: null, tradePolity: null,
    defer: {}, viewership: 12,
  }, over || {});
}

// Priority order: staged/pending beat refused/exiled/rung.
check('STAGED when nationalLive', classifyNatGate(base({ nationalLive: true })), 'STAGED');
check('STAGED wins over pending', classifyNatGate(base({ nationalLive: true, pendingShape: 'lead' })), 'STAGED');
check('PENDING:lead', classifyNatGate(base({ pendingShape: 'lead', pendingDay: 98 })), 'PENDING:lead');
check('PENDING:covenant', classifyNatGate(base({ pendingShape: 'covenant' })), 'PENDING:covenant');
check('REFUSED beats rung', classifyNatGate(base({ scaleRefused: true, rungReady: false })), 'REFUSED');
check('REFUSED beats pending-absent shape', classifyNatGate(base({ scaleRefused: true, leadPolity: { shape: 'lead', size: 4 } })), 'REFUSED');
check('EXILED beats rung', classifyNatGate(base({ exiled: true, rungReady: false })), 'EXILED');
check('EXILED loses to refused', classifyNatGate(base({ exiled: true, scaleRefused: true })), 'REFUSED');
check('RUNG when rung not ready', classifyNatGate(base({ rungReady: false })), 'RUNG');
check('RUNG when never regional', classifyNatGate(base({ networkLive: false, networkLiveDay: null, rungReady: false })), 'RUNG');
check('NO-SHAPE when rung ready, no candidate', classifyNatGate(base()), 'NO-SHAPE');
check('NO-SHAPE keeps closest counts (2/3 cov)', classifyNatGate(base({ covActive: 3, covSeasoned: 2 })), 'NO-SHAPE');

// Shape candidates + defer.
check('STAGE-EXPECTED:lead', classifyNatGate(base({ leadPolity: { shape: 'lead', size: 4 } })), 'STAGE-EXPECTED:lead');
check('STAGE-EXPECTED:conquest', classifyNatGate(base({ leadPolity: { shape: 'conquest', size: 4 } })), 'STAGE-EXPECTED:conquest');
check('STAGE-EXPECTED:covenant', classifyNatGate(base({ covPolity: { shape: 'covenant', size: 4 } })), 'STAGE-EXPECTED:covenant');
check('STAGE-EXPECTED:belong', classifyNatGate(base({ belongPolity: { shape: 'belong', size: 4 } })), 'STAGE-EXPECTED:belong');
check('DEFERRED:covenant (defer day > today)', classifyNatGate(base({ covPolity: { shape: 'covenant', size: 4 }, defer: { covenant: 114 } })), 'DEFERRED:covenant');
check('DEFERRED expires (defer day <= today)', classifyNatGate(base({ covPolity: { shape: 'covenant', size: 4 }, defer: { covenant: 100 } })), 'STAGE-EXPECTED:covenant');
check('DEFERRED-PARTIAL cov deferred, lead open', classifyNatGate(base({ leadPolity: { shape: 'lead', size: 4 }, covPolity: { shape: 'covenant', size: 4 }, defer: { covenant: 114 } })), 'DEFERRED-PARTIAL:covenant|open:lead');
check('DEFERRED both shapes', classifyNatGate(base({ leadPolity: { shape: 'lead', size: 4 }, covPolity: { shape: 'covenant', size: 4 }, defer: { lead: 110, covenant: 114 } })), 'DEFERRED:lead+covenant');

// Bad rows.
check('BAD-ROW null', classifyNatGate(null), 'BAD-ROW');
check('BAD-ROW {}', classifyNatGate({}), 'BAD-ROW');
check('BAD-ROW no day', classifyNatGate({ rungReady: true }), 'BAD-ROW');

// Summarizer: counts + max consecutive STAGE-EXPECTED run.
const rows = [
  base({ day: 90, rungReady: false }), base({ day: 91, rungReady: false }),
  base({ day: 92 }), base({ day: 93, leadPolity: { shape: 'lead', size: 4 } }),
  base({ day: 94, leadPolity: { shape: 'lead', size: 4 } }),
  base({ day: 95, nationalLive: true }),
];
const sum = summarizeNatGate(rows);
check('summarize rows', sum.rows, 6);
check('summarize RUNG count', sum.counts.RUNG, 2);
check('summarize NO-SHAPE count', sum.counts['NO-SHAPE'], 1);
check('summarize STAGE-EXPECTED count', sum.counts['STAGE-EXPECTED:lead'], 2);
check('summarize STAGED count', sum.counts.STAGED, 1);
check('summarize maxRun', sum.stageExpectedMaxRun, 2);
check('summarize empty rows', summarizeNatGate([]).rows, 0);
check('summarize empty maxRun', summarizeNatGate([]).stageExpectedMaxRun, 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
