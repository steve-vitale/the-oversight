#!/usr/bin/env node
// test-contactrec-20261031.js — proof test for sim-contactrec-a.
//
// Plain node, single process, no game load, no sims. Legs:
//  (1) captureHp synthetic cases (the real function from
//      scripts/policies/contactrec-diag.js): pre-call wins,
//      emission fills, evade-only fill, fought rows never
//      invented, m=null band-top max, non-pair band safe.
//  (2) contactbreak classifier on synthetic rows incl. a
//      backfilled evade row (healthy beast -> FOUGHT) and a
//      wounded evade row (below break line -> CONTACT).
//  (3) Corpus reproduction: old baseline/lever legs reconcile
//      to contactbreak's judged counts (27/62/15 over 104;
//      0/64/7 over 71), evade capture 0/9 and 0/4 (the gap),
//      and the evade-backfill cross-check (backfilled counts
//      reported, asserted only for reconciliation + filled n).
// Exit nonzero on any failure.
'use strict';
const path = require('path');
const CR = require(path.join(__dirname, 'policies', 'contactrec-diag'));
const CB = require(path.join(__dirname, 'contactbreak-analyze-20261031.js'));
const AN = require(path.join(__dirname, 'contactrec-analyze-20261031.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed += 1; }
  else { failed += 1; console.log('FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Leg 1: captureHp ----
const MDEF = { id: 'callback', hp: [260, 320] };
let c = CR.captureHp(200, 320, { outcome: 'mFlee', mHpLeft: 150 }, { hp: 200, maxHp: 320 }, MDEF);
check('pre-call wins over emission', eq([c.mHpStart, c.mMaxHp], [200, 320]), c);
c = CR.captureHp(null, null, { outcome: 'mFlee', mHpLeft: 150, mHpStart: 180, mMaxHp: 320 }, null, MDEF);
check('emission fills ephemeral fought row', eq([c.mHpStart, c.mMaxHp], [180, 320]), c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: 301 }, null, MDEF);
check('evade fill: start=mHpLeft, max=band top', eq([c.mHpStart, c.mMaxHp], [301, 320]), c);
c = CR.captureHp(301, 320, { outcome: 'evade', mHpLeft: 301 }, { hp: 301, maxHp: 320 }, MDEF);
check('evade with world entity: pre-call values stand', eq([c.mHpStart, c.mMaxHp], [301, 320]), c);
c = CR.captureHp(null, null, { outcome: 'mFlee', mHpLeft: 22, mDealt: 293 }, null, MDEF);
check('fought ephemeral: start stays null, max=band top', eq([c.mHpStart, c.mMaxHp], [null, 320]), c);
c = CR.captureHp(null, null, { outcome: 'vDie', mHpLeft: 100 }, null, MDEF);
check('vDie ephemeral: start stays null', c.mHpStart === null && c.mMaxHp === 320, c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: null }, null, MDEF);
check('evade with null mHpLeft: start null, max still band top', c.mHpStart === null && c.mMaxHp === 320, c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: 301 }, null, { id: 'x', hp: [20, 20] });
check('degenerate pair band [20,20]: max is the pair top', c.mMaxHp === 20, c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: 301 }, null, { id: 'x', hp: 20 });
check('non-array hp band: max stays null', c.mMaxHp === null, c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: 301 }, null, { id: 'x' });
check('no hp band: max stays null', c.mMaxHp === null, c);
c = CR.captureHp(null, null, { outcome: 'evade', mHpLeft: 301, mHpStart: 280, mMaxHp: 320 }, null, MDEF);
check('emission beats evade fill', eq([c.mHpStart, c.mMaxHp], [280, 320]), c);
c = CR.captureHp(50, 320, { outcome: 'evade', mHpLeft: 50 }, { hp: 50, maxHp: 320 }, MDEF);
check('mHpAtContact mirrors mHpLeft', c.mHpAtContact === 50, c);

// ---- Leg 2: classifier on synthetic rows ----
check('backfilled healthy evade -> FOUGHT',
  CB.classifyRow({ mHpStart: 301, mMaxHp: 320, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'FOUGHT');
check('wounded evade -> CONTACT',
  CB.classifyRow({ mHpStart: 36, mMaxHp: 320, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'CONTACT');
check('wounded evade at 1 HP -> CONTACT',
  CB.classifyRow({ mHpStart: 1, mMaxHp: 260, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'CONTACT');
check('evade at exactly break line -> FOUGHT (strict <)',
  CB.classifyRow({ mHpStart: 48, mMaxHp: 320, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'FOUGHT');
check('missing HP -> UNCLASSIFIED',
  CB.classifyRow({ mHpStart: null, mMaxHp: null, rounds: 0, mDealt: 0, outcome: 'evade' }).cls === 'UNCLASSIFIED');

// ---- Leg 3: corpus reproduction + gap + backfill ----
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-fieldfinish2-baseline-pilot', 'leadfeast');
const LEVER = path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-fieldfinish2-pilot', 'leadfeast');
const b = AN.analyzeDir(BASE, true);
const l = AN.analyzeDir(LEVER, true);
check('baseline measured reproduces 27/62/15 over 104',
  b.measured.contact === 27 && b.measured.fought === 62 && b.measured.unclassified === 15 && b.measured.total === 104 && b.measured.reconciles, b.measured);
check('lever measured reproduces 0/64/7 over 71',
  l.measured.contact === 0 && l.measured.fought === 64 && l.measured.unclassified === 7 && l.measured.total === 71 && l.measured.reconciles, l.measured);
check('baseline evade capture 0/9 (the gap)', b.capture.evadeRows === 9 && b.capture.evadeCaptured === 0, b.capture);
check('lever evade capture 0/4 (the gap)', l.capture.evadeRows === 4 && l.capture.evadeCaptured === 0, l.capture);
check('baseline missing rows all expedition', JSON.stringify(b.capture.missingByCaller) === JSON.stringify({ expedition: 15 }), b.capture.missingByCaller);
check('lever missing rows all expedition', JSON.stringify(l.capture.missingByCaller) === JSON.stringify({ expedition: 7 }), l.capture.missingByCaller);
check('baseline backfill fills 9 evade rows', b.backfill.filledRows === 9, b.backfill.filledRows);
check('lever backfill fills 4 evade rows', l.backfill.filledRows === 4, l.backfill.filledRows);
check('backfill reconciles baseline', b.backfill.reconciles && b.backfill.total === 104, b.backfill);
check('backfill reconciles lever', l.backfill.reconciles && l.backfill.total === 71, l.backfill);
check('baseline backfill: contact unchanged (evades are healthy beasts)',
  b.backfill.contact === 27, { contact: b.backfill.contact, fought: b.backfill.fought, unclassified: b.backfill.unclassified });
check('lever backfill: contact still 0',
  l.backfill.contact === 0, { contact: l.backfill.contact, fought: l.backfill.fought, unclassified: l.backfill.unclassified });
check('baseline backfill: fought absorbs the 9 evades (62->71), 6 fought-shaped stay unclassified',
  b.backfill.fought === 71 && b.backfill.unclassified === 6, { fought: b.backfill.fought, unclassified: b.backfill.unclassified });
check('lever backfill: fought absorbs the 4 evades (64->68), 3 stay unclassified',
  l.backfill.fought === 68 && l.backfill.unclassified === 3, { fought: l.backfill.fought, unclassified: l.backfill.unclassified });
check('baseline contact-shaped unclassified = 9 evades', b.capture.contactShapedUnclassified === 9, b.capture.contactShapedUnclassified);
check('lever contact-shaped unclassified = 4 evades', l.capture.contactShapedUnclassified === 4, l.capture.contactShapedUnclassified);

console.log(`test-contactrec-20261031: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
