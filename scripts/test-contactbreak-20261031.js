#!/usr/bin/env node
// test-contactbreak-20261031.js — sim-contactbreak-a proof test.
// Plain node, single process. Synthetic classifier cases (including
// boundary + log-disagreement cases) + corpus reconciliation proving
// classified + unclassified = corpus wave-3 totals on both legs.
// Usage: node scripts/test-contactbreak-20261031.js
'use strict';
const path = require('path');
const { classifyRow, checkLog, resolveLog, median, quartile, analyzeLeg } = require('./contactbreak-analyze-20261031.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed += 1; }
  else { failed += 1; console.log('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function row(o) { return Object.assign({ mHpStart: 30, mMaxHp: 300, rounds: 0, mDealt: 0, outcome: 'mFlee' }, o); }

// --- synthetic classifier cases ---
check('contact: 10% hp, rounds 0, mDealt 0, mFlee', classifyRow(row({})).cls === 'CONTACT');
check('contact: evade outcome', classifyRow(row({ outcome: 'evade' })).cls === 'CONTACT');
check('contact: rounds 1 still contact', classifyRow(row({ rounds: 1 })).cls === 'CONTACT');
check('fought: exactly at break line (45/300) is NOT contact', classifyRow(row({ mHpStart: 45 })).cls === 'FOUGHT');
check('fought: above break line', classifyRow(row({ mHpStart: 46 })).cls === 'FOUGHT');
check('fought: rounds 2', classifyRow(row({ rounds: 2 })).cls === 'FOUGHT');
check('fought: mDealt 1', classifyRow(row({ mDealt: 1 })).cls === 'FOUGHT');
check('fought: vKill outcome even at 1-3 conditions', classifyRow(row({ outcome: 'vKill' })).cls === 'FOUGHT');
check('fought: vDie outcome even at 1-3 conditions', classifyRow(row({ outcome: 'vDie' })).cls === 'FOUGHT');
check('fought: vFlee outcome even at 1-3 conditions', classifyRow(row({ outcome: 'vFlee' })).cls === 'FOUGHT');
check('unclassified: missing mHpStart', classifyRow(row({ mHpStart: null })).cls === 'UNCLASSIFIED');
check('unclassified: missing mMaxHp', classifyRow(row({ mMaxHp: null })).cls === 'UNCLASSIFIED');
check('unclassified: missing rounds', classifyRow(row({ rounds: null })).cls === 'UNCLASSIFIED');
check('unclassified: missing mDealt', classifyRow(row({ mDealt: null })).cls === 'UNCLASSIFIED');
check('unclassified: missing outcome', classifyRow(row({ outcome: null })).cls === 'UNCLASSIFIED');
check('unclassified: non-numeric mHpStart', classifyRow(row({ mHpStart: '30' })).cls === 'UNCLASSIFIED');
check('unclassified: reason names missing fields', classifyRow(row({ mHpStart: null, mMaxHp: null })).reason === 'missing:mHpStart,mMaxHp');
check('unclassified: contact-shaped evade row still unclassified without HP fields',
  classifyRow(row({ mHpStart: null, mMaxHp: null, outcome: 'evade' })).cls === 'UNCLASSIFIED');

// --- log-disagreement cases ---
const breakLog = ['Weronika drove The Callback off with the bow — it broke before it ever closed.'];
check('log: break line, no strike -> no disagreement', checkLog(breakLog).hasStrike === false && checkLog(breakLog).hasBreak === true);
check('log: contact row with break log stays CONTACT', resolveLog({ log: breakLog }, 'CONTACT').finalCls === 'CONTACT' && resolveLog({ log: breakLog }, 'CONTACT').disagreement === false);
const strikeLog = ['R1: Elif strikes for 12 (183 left)'];
check('log: strike line detected', checkLog(strikeLog).hasStrike === true);
check('log: strike in log with mDealt 0 moves CONTACT->FOUGHT',
  (() => { const r = resolveLog({ log: strikeLog }, 'CONTACT'); return r.finalCls === 'FOUGHT' && r.disagreement === true && /mDealt/.test(r.note); })());
check('log: empty log is wording gap only, stays CONTACT',
  (() => { const r = resolveLog({ log: [] }, 'CONTACT'); return r.finalCls === 'CONTACT' && r.disagreement === false; })());
check('log: no-arrows line + break line is not a strike',
  checkLog(['Dmitri has Crude bow but no arrows — the string stays drawn, useless.', 'Dmitri drove The Callback off with the bow — it broke before it ever closed.']).hasStrike === false);
check('log: fought control with pure break line is a reported disagreement, class stands',
  (() => { const r = resolveLog({ log: breakLog }, 'FOUGHT'); return r.finalCls === 'FOUGHT' && r.disagreement === true; })());
check('log: fought control with round lines is not a disagreement',
  resolveLog({ log: strikeLog }, 'FOUGHT').disagreement === false);

// --- distribution helpers ---
check('median even', median([1, 2, 3, 4]) === 2.5);
check('median odd', median([1, 4, 9]) === 4);
check('quartile interpolation', quartile([1, 1, 1, 1], 0.25) === 1);

// --- corpus reconciliation (landed fieldfinish2 corpus, both legs) ---
const root = path.join(__dirname, '..');
const baseline = analyzeLeg(path.join(root, 'evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast'));
const lever = analyzeLeg(path.join(root, 'evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast'));
check('corpus baseline total 104', baseline.total === 104, baseline.total);
check('corpus lever total 71', lever.total === 71, lever.total);
check('corpus baseline reconciles', baseline.reconciles === true, baseline);
check('corpus lever reconciles', lever.reconciles === true, lever);
check('corpus baseline counts 27/62/15', baseline.contact === 27 && baseline.fought === 62 && baseline.unclassified === 15,
  { contact: baseline.contact, fought: baseline.fought, unclassified: baseline.unclassified });
check('corpus lever counts 0/64/7', lever.contact === 0 && lever.fought === 64 && lever.unclassified === 7,
  { contact: lever.contact, fought: lever.fought, unclassified: lever.unclassified });
check('corpus baseline contact distribution', baseline.contactMHpStart.median === 4 && baseline.contactMHpStart.q1 === 1 &&
  baseline.contactMHpStart.q3 === 28.5 && baseline.contactMHpStart.min === 1 && baseline.contactMHpStart.max === 36,
  baseline.contactMHpStart);
check('corpus baseline thresholds 14/24/27', baseline.contactMHpStart.le15 === 14 && baseline.contactMHpStart.le30 === 24 && baseline.contactMHpStart.le45 === 27,
  baseline.contactMHpStart);
check('corpus baseline contact logs: 27 checked, 0 disagreements',
  baseline.logValidation.contactChecked === 27 && baseline.logValidation.contactDisagreements.length === 0, baseline.logValidation);
check('corpus lever contact logs: 0 checked (empty class), 0 disagreements',
  lever.logValidation.contactChecked === 0 && lever.logValidation.contactDisagreements.length === 0, lever.logValidation);
check('corpus controls: 3 per leg, 0 disagreements',
  baseline.logValidation.controlChecked === 3 && lever.logValidation.controlChecked === 3 &&
  baseline.logValidation.controlDisagreements.length === 0 && lever.logValidation.controlDisagreements.length === 0,
  { b: baseline.logValidation, l: lever.logValidation });

console.log('contactbreak proof: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
