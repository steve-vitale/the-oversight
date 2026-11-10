#!/usr/bin/env node
// test-journey-crisis-r168-instruments.js — proof test for the r168
// instrument changes (prereg, before any scored seed). Pure unit tests on
// the driver's exported pickConvoChoice + source-level checks for the
// constants that only exist inside driveConvo/main. No sim run, no writes.
// (1) PARTY-NAME PICK VARIES BY SEED (r164 driver gap b): when the
//     party-name sub-menu offers party_namepick:0/1/2, pickConvoChoice
//     takes them first and picks index ctx.partyPickIndex (SEED % 3).
//     RED (old code): the first-non-leave fallback always landed on
//     index 2 (splice reversal in partyConvoChoices), so "The Company"
//     won on three straight panels. GREEN (new code): 0->:0, 1->:1,
//     2->:2, out-of-range falls back to the first pick, missing ctx
//     defaults to 2 (r164 behavior preserved for other callers), and a
//     party pick outranks a gq: choice offered alongside it.
// (2) TURN CAP 12 -> 16 (r164 driver gap c): source check that the
//     driveConvo loop bound and cap-break message say 16, not 12.
// (3) MID-RUN STASH (prereg Q2 refinement): source check that main()
//     samples the stash pharmacy into rec.stashMid at day >= 60.
// Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { pickConvoChoice } = require('./journey-crisis-r168-delayed-20261110.js');

let failures = 0;
function check(cond, label) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label);
  if (!cond) failures++;
}

// Menu order is the REAL one: partyConvoChoices splices the three picks
// in at index 1 one at a time, reversing them — [2, 1, 0] — so the old
// first-non-leave fallback always landed on :2 ("The Company").
const PARTY = [
  { id: 'party_namepick:2', text: '"The Company."' },
  { id: 'party_namepick:1', text: '"The Hollow Chorus."' },
  { id: 'party_namepick:0', text: '"The Star-Struck Few."' },
  { id: 'leave', text: '"...Let me think."' },
];
const BASE = { t: 3, steerLately: false, latelyFired: false, subjectNavs: 0, lastPickId: null };

// (1a) index varies with partyPickIndex
check(pickConvoChoice(PARTY, { ...BASE, partyPickIndex: 0 }).pick.id === 'party_namepick:0',
  'party pick: index 0 -> party_namepick:0 (was always :2)');
check(pickConvoChoice(PARTY, { ...BASE, partyPickIndex: 1 }).pick.id === 'party_namepick:1',
  'party pick: index 1 -> party_namepick:1');
check(pickConvoChoice(PARTY, { ...BASE, partyPickIndex: 2 }).pick.id === 'party_namepick:2',
  'party pick: index 2 -> party_namepick:2');
// (1b) out-of-range falls back to the first OFFERED pick (:2 in real
// menu order), not undefined
check(pickConvoChoice(PARTY, { ...BASE, partyPickIndex: 5 }).pick.id === 'party_namepick:2',
  'party pick: out-of-range index falls back to first offered pick');
// (1c) missing ctx defaults to 2 (r164 behavior preserved)
check(pickConvoChoice(PARTY, BASE).pick.id === 'party_namepick:2',
  'party pick: missing partyPickIndex defaults to :2');
// (1d) party pick outranks a gq: choice offered alongside it
const WITH_GQ = [{ id: 'gq:open:take', text: 'I need a moment to think.' }, ...PARTY];
check(pickConvoChoice(WITH_GQ, { ...BASE, partyPickIndex: 1 }).pick.id === 'party_namepick:1',
  'party pick: outranks a gq: choice when both offered');
// (1e) seed mapping: the five panel seeds cover all three indices
const idxs = [14201, 14202, 14203, 14204, 14205].map(s => s % 3);
check(new Set(idxs).size === 3 && idxs.join(',') === '2,0,1,2,0',
  'party pick: panel seeds 14201-14205 map to indices 2,0,1,2,0 (all three covered)');
// (1f) non-party menus unaffected: gq: still wins over dlg:help
const PLAIN = [
  { id: 'dlg:help', text: 'Help me understand.' },
  { id: 'gq:open:take', text: 'I need a moment to think.' },
  { id: 'leave', text: 'Goodbye.' },
];
check(pickConvoChoice(PLAIN, BASE).pick.id === 'gq:open:take',
  'non-party menu: gq: still wins over dlg:help (regression)');
// (1g) no-repeat rule still works on ordinary menus
check(pickConvoChoice(PLAIN, { ...BASE, lastPickId: 'gq:open:take' }).pick.id === 'dlg:help',
  'non-party menu: repeat of gq: redirects to dlg:help (regression)');

// (2) turn cap — source-level check (the constant lives in driveConvo)
const src = fs.readFileSync(path.join(__dirname, 'journey-crisis-r168-delayed-20261110.js'), 'utf8');
check(/for \(let t = 0; t < 16; t\+\+\)/.test(src), 'turn cap: driveConvo loop bound is 16');
check(!/for \(let t = 0; t < 12; t\+\+\)/.test(src), 'turn cap: no 12-turn loop bound remains');
check(src.includes('(driver cap break: 16 turns reached)'), 'turn cap: cap-break message says 16');

// (3) mid-run stash — source-level check (the hook lives in main())
check(/rec\.stashMid = \{ day: dayOf\(Game\), medicine: byType \}/.test(src),
  'mid-run stash: rec.stashMid sampled from stashState().medicine');
check(/if \(!stashMidTaken && dayOf\(Game\) >= 60\)/.test(src),
  'mid-run stash: sampled once at day >= 60');

console.log(failures === 0 ? 'r168 instruments: ALL PASS' : 'r168 instruments: ' + failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
