#!/usr/bin/env node
// test-fieldkill-20261031.js — sim-fieldkill-a proof test.
//
// Synthetic legs: flee-trigger classification priority (prereg classes
// 1-8) + kill-join (won/routed/field-vKill/pyrrhic/orphan) on fabricated
// rows. Corpus legs (when the judged corpus exists): per-seed arithmetic
// — outcome sums, trigger sums, join sums, daily sortedness, recorder
// errors. The corpus legs prove the analyzer, not the verdict: orphan /
// unmatched counts are REPORTED, not asserted, so the test stays green
// while the evidence judges them.
//
// Usage: node scripts/test-fieldkill-20261031.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed, classifyTrigger } = require('./fieldkill-analyze-20261031');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function baseFight(over) {
  return Object.assign({ day: 50, vid: 'v1', mid: 'gavel', wave: 3, outcome: 'vFlee', rounds: 5,
    vHpLeft: 50, mHpLeft: 200, mMaxHp: 300, mHpStart: 300, vTaken: 40, mDealt: 30, allyDealt: 0,
    allyVid: null, calledHelp: false, partySize: 1, intent: 'engage', intentWhy: null,
    fleeHopeless: null, fleeLearn: false, fleeHpFrac: null, everWinning: false, everHopeless: false,
    minHpFrac: 0.5, volley: null, roundTotals: null, trickLog: null, shoutRound: null,
    corneredHold: false, staredDown: false, peaceful: false, redactorQuiet: 0, judges: false,
    log: null, hasRng: false, caller: 'wild', stack: 'resolveWildMonsterEncounter',
    optsAllies: 0, optsAllyVids: 0, allyFromStart: false, noFlee: false, cornered: false }, over);
}

// --- synthetic trigger legs ---
check('volley-driveoff', classifyTrigger(baseFight({ outcome: 'mFlee', rounds: 0, volley: { shots: 2, hits: 1, dmg: 8 } })) === 'volley-driveoff');
check('volley beats trick (priority 1)', classifyTrigger(baseFight({ outcome: 'mFlee', rounds: 0, volley: { shots: 1, hits: 1, dmg: 5 }, peaceful: true })) === 'volley-driveoff');
check('trick-exit peaceful', classifyTrigger(baseFight({ outcome: 'mFlee', peaceful: true })) === 'trick-exit');
check('trick-exit staredDown', classifyTrigger(baseFight({ outcome: 'mFlee', staredDown: true })) === 'trick-exit');
check('trick-exit redactorQuiet>=3', classifyTrigger(baseFight({ outcome: 'mFlee', redactorQuiet: 3 })) === 'trick-exit');
check('trick-exit offer_food', classifyTrigger(baseFight({ outcome: 'mFlee', trickLog: ['offer_food: shared meal'] })) === 'trick-exit');
check('learn beats hopeless (priority 3)', classifyTrigger(baseFight({ fleeLearn: true, fleeHopeless: true, fleeHpFrac: 0.4 })) === 'learn');
check('hopeless', classifyTrigger(baseFight({ fleeHopeless: true, fleeLearn: false, fleeHpFrac: 0.4 })) === 'hopeless');
check('floor', classifyTrigger(baseFight({ fleeHopeless: false, fleeLearn: false, fleeHpFrac: 0.3 })) === 'floor');
check('mBreak-driveoff', classifyTrigger(baseFight({ outcome: 'mFlee', mHpLeft: 20, mMaxHp: 200 })) === 'mBreak-driveoff');
check('round-cap', classifyTrigger(baseFight({ outcome: 'vFlee', rounds: 15, fleeHopeless: null, fleeHpFrac: null })) === 'round-cap');
check('unclassified', classifyTrigger(baseFight({ outcome: 'mFlee' })) === 'unclassified');
check('volley 0 dmg is not driveoff', classifyTrigger(baseFight({ outcome: 'mFlee', rounds: 0, volley: { shots: 1, hits: 0, dmg: 0 } })) === 'unclassified');

// --- synthetic kill-join leg ---
const synth = {
  seed: 1, anchorCommit: 'test', instrument: 'test', days: 90, gameDays: 90, endReason: 'won',
  endScaleRank: 'national', national: 1, table: 1, won: 1, maxWave: 4, wave4: 1, wave5: 0,
  recorderErrs: 0, recorderErrors: [], recorderOverflow: {},
  fieldFights: [
    baseFight({ outcome: 'vKill', day: 60, mid: 'gavel' }),
    baseFight({ outcome: 'vFlee', day: 61, mid: 'spool', fleeHopeless: true }),
    baseFight({ outcome: 'mFlee', day: 62, mid: 'redactor', mHpLeft: 20, mMaxHp: 300 }),
  ],
  tbFights: [
    { day: 60, result: 'won', monsterIds: ['gavel'], villagerIds: [], scholarIn: true, arena: false },
    { day: 61, result: 'routed', monsterIds: ['spool'], villagerIds: [], scholarIn: true, arena: false },
    { day: 62, result: 'lost', monsterIds: ['redactor'], villagerIds: [], scholarIn: true, arena: false },
  ],
  killEvents: [
    { day: 60, mid: 'gavel', wave: 3, by: 'v1', via: 'wild', delta: 1 },
    { day: 61, mid: 'spool', wave: 3, by: 'player', via: 'player', delta: 1 },
    { day: 63, mid: 'callback', wave: 3, by: 'player', via: 'player', delta: 1 },
  ],
  pyrrhicEvents: [{ day: 62, mid: 'redactor', wave: 3, by: 'player', via: 'player', pyrrhic: true, delta: null }],
  spawns: [], sayLines: [],
  killLog: [
    { d: 60, mid: 'gavel', w: 3, by: 'v1', via: 'wild' },
    { d: 61, mid: 'spool', w: 3, by: 'player', via: 'player' },
    { d: 62, mid: 'redactor', w: 3, by: 'player', via: 'player' },
  ],
  daily: [{ day: 60, rank: 'village', bar2: 4, dN: 25, p1: 0, p2: 4, p3: 1, p4: 0, p5: 0, w3rung: true, warPts: 1, faced: {}, logLen: 3, newEntries: [], won: false, errs: [] }],
};
const sa = analyzeSeed(synth);
check('synth field outcomes sum', sa.fieldMeetings === 3 && sa.fieldOutcomes.vKill === 1 && sa.fieldOutcomes.vFlee === 1 && sa.fieldOutcomes.mFlee === 1);
check('synth triggers', sa.triggerCounts.hopeless === 1 && sa.triggerCounts['mBreak-driveoff'] === 1);
check('synth ledger join fieldVKill', sa.joinLedger.fieldVKill === 1);
check('synth ledger join routed', sa.joinLedger.tbRouted === 1);
check('synth ledger orphan', sa.joinLedger.orphan.length === 1 && sa.joinLedger.orphan[0].mid === 'callback');
check('synth pyrrhic join lost', sa.joinPyrrhic.tbLost === 1 && sa.joinPyrrhic.orphan.length === 0);
check('synth log coverage', sa.unmatchedLog.length === 0 && sa.eventsNoLog.length === 1);
check('synth killable: spool flee rtk', sa.closestToKill && sa.closestToKill.mid === 'redactor');

// --- corpus legs ---
const REPO = path.join(__dirname, '..');
const corpusDir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-fieldkill');
const PILOT = [87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127];
const CONFIRM = [87103, 87107, 87120, 87121, 87126, 87128, 87132, 87134, 87135, 87137, 87138];
const seeds = PILOT.concat(CONFIRM);
let corpusSeeds = 0;
for (const seed of seeds) {
  const fp = path.join(corpusDir, 'leadfeast', `s${seed}.json`);
  if (!fs.existsSync(fp)) { console.log(`CORPUS MISSING: s${seed} (skipped)`); continue; }
  corpusSeeds++;
  const obj = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = analyzeSeed(obj);
  const fieldSum = Object.values(a.fieldOutcomes).reduce((x, y) => x + y, 0);
  const tbSum = Object.values(a.tbOutcomes).reduce((x, y) => x + y, 0);
  const trigSum = Object.values(a.triggerCounts).reduce((x, y) => x + y, 0);
  check(`s${seed} field outcomes sum`, fieldSum === a.fieldMeetings, { fieldSum, fieldMeetings: a.fieldMeetings });
  check(`s${seed} tb outcomes sum`, tbSum === a.tbMeetings, { tbSum, tbMeetings: a.tbMeetings });
  check(`s${seed} trigger sum == fleeN`, trigSum === a.fleeN, { trigSum, fleeN: a.fleeN });
  check(`s${seed} ledger join sums`, a.joinLedger.fieldVKill + a.joinLedger.tbWon + a.joinLedger.tbRouted + a.joinLedger.orphan.length === a.killEventsN);
  check(`s${seed} pyrrhic join sums`, a.joinPyrrhic.tbLost + a.joinPyrrhic.orphan.length === a.pyrrhicEventsN);
  check(`s${seed} daily sorted`, a.dailySorted === true);
  check(`s${seed} recorder errors 0`, a.recorderErrs === 0, a.recorderErrors);
  check(`s${seed} anchor pinned`, typeof a.anchorCommit === 'string' && a.anchorCommit.length === 12, a.anchorCommit);
}
console.log(`fieldkill proof: ${pass} passed, ${fail} failed (synthetic + ${corpusSeeds} corpus seeds)`);
process.exit(fail ? 1 : 0);
