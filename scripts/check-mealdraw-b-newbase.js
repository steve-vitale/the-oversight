#!/usr/bin/env node
// check-mealdraw-b-newbase.js — POST-HOC new-base reconciliation.
//
// sim-mealdraw-b, 2026-10-26, oversight-flesh-out-loop-b.
// POST-HOC ONLY: this script is NOT a verdict input. The prereg
// verdict (scripts/test-mealdraw-b.js) stands as written
// against the stockdoor corpus's trajectory, which the base
// change at 1377d03c3 (conversation.js + villageAgency.js)
// moved. This script answers the follow-up question the
// coordinator's next prereg needs: on the CURRENT base, does
// the meal-draw record reconcile gross write vs surviving pile
// for seed 9750's nights 81–83, using the NEW corpus's own
// dayPantry endpoints (not the stale stockdoor endpoints)?
//
// Method: for each window D (first-cook day D to first-cook
// day D+1) and each pantry stack class, residual =
// after − (before + stockdoorWrites(D) − windowDraws(D)).
// The surplus classes (the night's own stockSurplus writes)
// have fully-recorded writers, so their residuals must be 0.
// Other classes may show nonzero residuals equal to
// three-door writes (inflow records carry no spoilDay, so
// those writes cannot be attributed to a class — a known
// inflow-arm limitation, not a meal-draw gap).
// Exit 0 iff every surplus-class residual is 0.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-mealdraw-b-corpus');
const d = JSON.parse(fs.readFileSync(
  path.join(CORPUS, 'mealdraw-b-cap1-pd0-dg1-competent-nofeast-s9750.json'), 'utf8'));

function classKey(s) {
  return [s.name, s.kcalEach, (s.spoilDay == null ? null : s.spoilDay),
    (s.granaryDays == null ? null : s.granaryDays),
    (s.foodState == null ? null : s.foodState)].join('|');
}
function pantryByClass(day) {
  const map = new Map();
  const entry = (d.dayPantry || []).find(e => e.day === day);
  for (const s of (entry ? entry.stacks : [])) {
    const k = classKey(s);
    map.set(k, (map.get(k) || 0) + (s.kcalEach || 0) * (s.units || 0));
  }
  return map;
}
function inWindow(rec, D) {
  return (rec.day === D && (rec.cookLinesSeenToday || 0) >= 1) ||
    (rec.day === D + 1 && (rec.cookLinesSeenToday || 0) === 0);
}
const sdByDay = new Map();
for (const r of (d.stockdoorRecords || [])) {
  if (Math.round(r.kcal || 0) <= 0) continue;
  sdByDay.set(r.day, (sdByDay.get(r.day) || 0) + Math.round(r.kcal || 0));
}
let failures = 0;
for (const D of [81, 82, 83]) {
  const before = pantryByClass(D);
  const after = pantryByClass(D + 1);
  const draws = new Map();
  for (const r of (d.mealDrawRecords || [])) {
    if ((r.kind !== 'pantryDraw' && r.kind !== 'drawSpoiled') || !inWindow(r, D)) continue;
    for (const it of (r.items || [])) {
      const k = classKey(it);
      draws.set(k, (draws.get(k) || 0) + (it.units || 0) * (it.kcalEach || 0));
    }
  }
  // Surplus class for night D: fresh 'Foraged food' 200 @ D+3.
  const surplusKey = ['Foraged food', 200, D + 3, null, null].join('|');
  const b = before.get(surplusKey) || 0;
  const w = sdByDay.get(D) || 0;
  const dr = draws.get(surplusKey) || 0;
  const a = after.get(surplusKey) || 0;
  const resid = a - (b + w - dr);
  const pass = resid === 0;
  if (!pass) failures++;
  console.log(`window ${D}: surplus class 200@${D + 3} before=${b} writes=${w} draws=${dr} after=${a} residual=${resid} ${pass ? 'CLOSED' : 'OPEN'}`);
  // Full-class residuals (informational: nonzero = three-door writes, unrecorded by spoilDay).
  const keys = new Set([...before.keys(), ...after.keys(), ...draws.keys()]);
  const open = [];
  for (const k of keys) {
    if (k === surplusKey) continue;
    const r = (after.get(k) || 0) - (before.get(k) || 0) + (draws.get(k) || 0);
    // Note: three-door writes are not in this equation (no spoilDay
    // on inflow records), so `r` here equals (three-door writes to
    // the class) and is expected nonzero for written classes.
    if (r !== 0) open.push({ key: k, before: before.get(k) || 0, draws: draws.get(k) || 0, after: after.get(k) || 0, impliedWrites: r });
  }
  for (const o of open) {
    console.log(`  other class ${o.key}: before=${o.before} draws=${o.draws} after=${o.after} impliedThreeDoorWrites=${o.impliedWrites}`);
  }
}
console.log(failures === 0 ? 'NEW-BASE SURPLUS RECONCILIATION: CLOSED on all 3 windows' : 'NEW-BASE: OPEN residuals remain');
process.exit(failures ? 1 : 0);
