#!/usr/bin/env node
// test-locatedengage-classify.js — unit proof for
// scripts/locatedengage-classify.js (sim-locatedengage-a). Stub traces
// cover every daily label, every attempt step sub-label, and the
// decision order. Exit 0 only if all cases pass.
'use strict';
const path = require('path');
const C = require(path.join(__dirname, 'locatedengage-classify.js'));

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; }
  else { fail++; console.log('FAIL ' + name + ': got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)); }
}
function row(day, phase, opts) {
  return Object.assign({ day: day, phase: phase, sx: 4, sy: 4, hx: 4, hy: 4,
    htx: 7, hty: 4, hmx: 1, hmy: 1, smx: 2, smy: 2, dist: 3, same: false,
    wave: 4, rank: 'national', omenStage: 2, present: true, pend: false, pendMid: null }, opts || {});
}

// ATTEMPT, scholar-stepped: pre unshared, moved event onto hBefore.
check('attempt scholar-stepped', C.classifyDay(
  { traces: [row(10, 'pre'), row(10, 'post', { same: true, dist: 0, htx: 4, hty: 4 })],
    travelEvents: [{ day: 10, from: { x: 4, y: 4 }, to: { x: 7, y: 4 }, after: { x: 7, y: 4 }, kind: 'moved', hBefore: { tx: 7, ty: 4 }, hAfter: { tx: 7, ty: 4 } }],
    attempts: [{ day: 10, cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'wild-contact' }] }, 10).sub, 'SCHOLAR-STEPPED');
// ATTEMPT, herald-stepped: pre unshared, post shared, no scholar step.
check('attempt herald-stepped', C.classifyDay(
  { traces: [row(11, 'pre'), row(11, 'post', { same: true, dist: 0, htx: 4, hty: 4 })],
    travelEvents: [{ day: 11, from: { x: 4, y: 4 }, to: { x: 5, y: 4 }, after: { x: 5, y: 4 }, kind: 'moved', hBefore: { tx: 5, ty: 5 }, hAfter: { tx: 5, ty: 4 } }],
    attempts: [{ day: 11, cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'wild-contact' }] }, 11).sub, 'HERALD-STEPPED');
// ATTEMPT, shared-idle: already shared at pre.
check('attempt shared-idle', C.classifyDay(
  { traces: [row(12, 'pre', { same: true, dist: 0, htx: 4, hty: 4 }), row(12, 'post', { same: true, dist: 0, htx: 4, hty: 4 })],
    travelEvents: [], attempts: [{ day: 12, cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'wild-contact' }] }, 12).sub, 'SHARED-IDLE');
// ATTEMPT, unresolved: attempt with no sharing anywhere.
check('attempt unresolved', C.classifyDay(
  { traces: [row(13, 'pre'), row(13, 'post')],
    travelEvents: [], attempts: [{ day: 13, cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'wild-contact' }] }, 13).sub, 'ATTEMPT-UNRESOLVED');
// SHARED_NO_ESCALATION beats SCHOLAR_NEAR.
check('shared no escalation', C.classifyDay(
  { traces: [row(14, 'pre'), row(14, 'post', { same: true, dist: 0, htx: 4, hty: 4 })],
    travelEvents: [], attempts: [] }, 14).label, 'SHARED_NO_ESCALATION');
// SCHOLAR_NEAR at distance exactly 3.
check('near at 3', C.classifyDay(
  { traces: [row(15, 'pre', { dist: 3 }), row(15, 'post', { dist: 5 })],
    travelEvents: [], attempts: [] }, 15).label, 'SCHOLAR_NEAR');
// APART at distance 4.
check('apart at 4', C.classifyDay(
  { traces: [row(16, 'pre', { dist: 4 }), row(16, 'post', { dist: 6 })],
    travelEvents: [], attempts: [] }, 16).label, 'APART');
// APART when herald absent all day (dist null, present false).
check('apart herald absent', C.classifyDay(
  { traces: [row(17, 'pre', { dist: null, present: false, htx: null, hty: null }), row(17, 'post', { dist: null, present: false, htx: null, hty: null })],
    travelEvents: [], attempts: [] }, 17).label, 'APART');
// UNCLASSIFIED only when no rows.
check('unclassified no rows', C.classifyDay({ traces: [], travelEvents: [], attempts: [] }, 18).label, 'UNCLASSIFIED');
// ATTEMPT beats SHARED (order): attempt day with sharing labels ATTEMPT.
check('attempt beats shared', C.classifyDay(
  { traces: [row(19, 'pre', { same: true, dist: 0, htx: 4, hty: 4 })],
    travelEvents: [], attempts: [{ day: 19, cls: 'REFUSED', reason: 'MUSTER-GATE', caller: 'wild-contact' }] }, 19).label, 'ATTEMPT');
// Window roll-up: counts + unclassified + unresolved lists.
(function () {
  const rec = { traces: [row(20, 'pre', { dist: 5 }), row(21, 'pre', { dist: 2 })],
    travelEvents: [], attempts: [] };
  const w = C.classifyWindow(rec, 20, 22);
  check('window counts', w.counts, { APART: 1, SCHOLAR_NEAR: 1, UNCLASSIFIED: 1 });
  check('window unclassified', w.unclassified, [22]);
  check('window unresolved', w.unresolved, []);
})();

console.log('locatedengage-classify unit: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
