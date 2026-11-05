#!/usr/bin/env node
// test-bankadded-a.js — pure tests for the bank-added filter
// (sim-bankadded-a prereg). Hand-built event records in the
// shape scripts/analyze-bankretain-rerun.js's retainedEvents
// returns; no sims, no repo reads. Run: node scripts/test-bankadded-a.js
'use strict';
const { isBankAdded, isFlipAdded, filterBankAdded, normalizeStrandnarr } = require('./analyze-bankadded');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name); }
}
function ev(o) {
  return Object.assign({ seed: 17001, loopDay: 10, gameDay: 10, mode: 'bank',
    bankedEdibleDelta: 0, packBeforeEdible: 0, postBankEdible: 0,
    source: 'carried', judged: true, verdict: 'RETAINED',
    retainedAtTrueMorning: true, censoredReason: null }, o);
}

// isBankAdded: mode + delta gate.
check('bank delta>0 qualifies', isBankAdded(ev({ bankedEdibleDelta: 270 })));
check('bank delta 0 does not qualify', !isBankAdded(ev({ bankedEdibleDelta: 0 })));
check('bank delta<0 does not qualify', !isBankAdded(ev({ bankedEdibleDelta: -90 })));
check('bank delta null does not qualify', !isBankAdded(ev({ bankedEdibleDelta: null })));
check('flip delta>0 is not bank-added', !isBankAdded(ev({ mode: 'flip', bankedEdibleDelta: 270 })));
check('skip delta>0 is not bank-added', !isBankAdded(ev({ mode: 'skip', bankedEdibleDelta: 270 })));
check('flip delta>0 is flip-added', isFlipAdded(ev({ mode: 'flip', bankedEdibleDelta: 270 })));
check('bank delta>0 is not flip-added', !isFlipAdded(ev({ bankedEdibleDelta: 270 })));

// filterBankAdded: counts + judged/censored split + context separation.
const events = [
  ev({ loopDay: 10, mode: 'bank', bankedEdibleDelta: 270, packBeforeEdible: 0, postBankEdible: 270, source: 'banked', judged: true }),
  ev({ loopDay: 20, mode: 'bank', bankedEdibleDelta: 180, packBeforeEdible: 90, postBankEdible: 270, source: 'mixed', judged: true }),
  ev({ loopDay: 30, mode: 'bank', bankedEdibleDelta: 90, packBeforeEdible: 0, postBankEdible: 90, source: 'banked', judged: false, censoredReason: 'no-next-loop-day', verdict: null, retainedAtTrueMorning: null }),
  ev({ loopDay: 40, mode: 'bank', bankedEdibleDelta: 0, packBeforeEdible: 270, postBankEdible: 270, source: 'carried', judged: true }),
  ev({ loopDay: 50, mode: 'flip', bankedEdibleDelta: 270, packBeforeEdible: 0, postBankEdible: 270, source: 'banked', judged: true }),
  ev({ loopDay: 60, mode: 'flip', bankedEdibleDelta: 0, packBeforeEdible: 270, postBankEdible: 270, source: 'carried', judged: true }),
];
const f = filterBankAdded(events);
check('bankModeEvenings counts bank only', f.bankModeEvenings === 4);
check('bankModeWithEdible counts post>0 bank', f.bankModeWithEdible === 4);
check('bankAddedTotal is 3', f.bankAddedTotal === 3);
check('bankAddedJudged is 2', f.bankAddedJudged.length === 2);
check('bankAddedCensored is 1', f.bankAddedCensored.length === 1);
check('censored keeps reason', f.bankAddedCensored[0].censoredReason === 'no-next-loop-day');
check('flip-added kept as context only', f.flipAddedTotal === 1 && f.flipAddedJudged.length === 1);
check('flip-added never leaks into bankAdded', f.bankAddedJudged.every((e) => e.mode === 'bank'));
check('allJudged counts every judged event', f.allJudged === 5);
check('allCensored counts 1', f.allCensored === 1);
check('empty input is all zeros', (() => { const z = filterBankAdded([]); return z.bankAddedTotal === 0 && z.bankAddedJudged.length === 0 && z.flipAddedTotal === 0; })());

// normalizeStrandnarr: lifts firstUpkeeps, passes bankfood through.
const sn = { seed: 17021, evenings: [], bankfoodStore: { firstUpkeeps: [{ scholarDay: 52 }], errs: 0 } };
const norm = normalizeStrandnarr(sn);
check('strandnarr normalization lifts firstUpkeeps', Array.isArray(norm.firstUpkeeps) && norm.firstUpkeeps[0].scholarDay === 52);
check('strandnarr normalization keeps bankfoodStore', norm.bankfoodStore.errs === 0);
const bf = { seed: 17021, firstUpkeeps: [{ scholarDay: 52 }] };
check('bankfood corpus passes through identical', normalizeStrandnarr(bf) === bf);
check('null-safe normalization', normalizeStrandnarr(null) === null);
const snNoFu = { seed: 17021, bankfoodStore: { errs: 0 } };
check('strandnarr without firstUpkeeps passes through', normalizeStrandnarr(snNoFu) === snNoFu);

console.log('test-bankadded-a: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
