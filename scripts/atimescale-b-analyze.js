#!/usr/bin/env node
// atimescale-b-analyze.js — multi-day A-closing reader for ONE archived
// destfirst stage-2 A leg (sim-atimescale-b, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-atimescale-b-prereg.md.
// Judges days 5-8 of an already-run 30d construct-shadow leg; it runs
// NO sim itself. Day-end position is day.end.pos; day-end E is
// day.dayEndReturnSim.ok (via/directOk/legs reported alongside).
// A day-end E reading counts only when the day-end position is the
// destination (the 69716 lesson, applied across days).
//
// CONFIRMED multi-day A setup iff ALL of:
//   walkout (day-5 construct posAfterForced == dest) AND walkE
//   (every shadow walk-out hop simOk, per destfirst-b-confirm.js)
//   AND day-5 end == dest with E true
//   AND some closing day c in {6,7,8} with end == dest and E false
//   AND every day 5..c-1 ended at dest with E true (contiguous camp).
// A broken camp before c voids the setup even if a later day-end
// fails elsewhere.
// Usage: atimescale-b-analyze.js --file <jsonl> --dest x,y
// Exit 0 always (unless usage error); prints one ATIMESCALE line plus
// one DAY line per day 5-8.
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }
function parseXY(s) {
  const m = String(s || '').match(/^(-?\d+),(-?\d+)$/);
  return m ? { x: parseInt(m[1], 10), y: parseInt(m[2], 10) } : null;
}
const dest = parseXY(arg('dest', ''));
const file = arg('file', null);
if (!dest || !file) { console.error('usage: atimescale-b-analyze.js --file <jsonl> --dest x,y'); process.exit(2); }
const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
if (!lines.length) { console.log('ATIMESCALE seed=? dest=' + dest.x + ',' + dest.y + ' confirmed=false reason=no-instance'); process.exit(0); }
const inst = JSON.parse(lines[0]);
const dayMap = new Map((inst.days || []).map((d) => [d.loopDay, d]));
const d5 = dayMap.get(5);
const haven = (d5 && d5.start && d5.start.haven) || { x: 4, y: 4 };
const walk = !!(d5 && d5.construct && d5.construct.kind === 'walkout' && samePos(d5.construct.posAfterForced, dest));
let walkE = null;
if (d5) {
  const hops = d5.hops || [];
  const prefix = [];
  let cur = haven;
  for (const h of hops) {
    if (!samePos(h.from, cur)) break;
    prefix.push(h); cur = h.to;
    if (samePos(cur, dest)) break;
  }
  if (prefix.length && samePos(cur, dest)) walkE = prefix.every((h) => h.simOk === true);
}
const dayInfo = {};
for (const ld of [5, 6, 7, 8]) {
  const d = dayMap.get(ld);
  const endPos = d && d.end ? d.end.pos : null;
  const e = d && d.dayEndReturnSim ? d.dayEndReturnSim : null;
  dayInfo[ld] = {
    present: !!d,
    endAtDest: samePos(endPos, dest),
    endPos: endPos ? (endPos.x + ',' + endPos.y) : 'absent',
    eOk: e ? e.ok : null,
    via: e ? (e.via || null) : null,
    directOk: e ? (e.directOk ?? null) : null,
    legs: e ? (e.legs ?? null) : null,
  };
  console.log('DAY seed=' + inst.seed + ' loopDay=' + ld + ' endPos=' + dayInfo[ld].endPos +
    ' endAtDest=' + dayInfo[ld].endAtDest + ' dayEndE=' + dayInfo[ld].eOk +
    ' via=' + dayInfo[ld].via + ' directOk=' + dayInfo[ld].directOk + ' legs=' + dayInfo[ld].legs);
}
let confirmed = false, closingDay = null, reason = '';
if (!walk) reason = 'walkout-incomplete';
else if (walkE !== true) reason = 'walkout-E-failed';
else if (!dayInfo[5].endAtDest) reason = 'day5-end-elsewhere';
else if (dayInfo[5].eOk !== true) reason = 'day5-already-closed';
else {
  let campOk = true;
  for (const ld of [6, 7, 8]) {
    const info = dayInfo[ld];
    if (!info.present) { reason = 'leg-ends-before-day' + ld; campOk = false; break; }
    if (!info.endAtDest) { reason = 'camp-broken-day' + ld; campOk = false; break; }
    if (info.eOk === false) { confirmed = true; closingDay = ld; reason = 'closed-day' + ld; break; }
    if (info.eOk !== true) { reason = 'day' + ld + '-E-unknown'; campOk = false; break; }
  }
  if (!confirmed && !reason) reason = 'camped-through-day8-E-passing';
  if (!confirmed && reason === '') reason = 'no-closing';
}
console.log('ATIMESCALE seed=' + inst.seed + ' dest=' + dest.x + ',' + dest.y +
  ' walkout=' + walk + ' walkE=' + walkE +
  ' day5end=' + dayInfo[5].endPos + ' day5E=' + dayInfo[5].eOk +
  ' daysAlive=' + (inst.daysAlive ?? null) +
  ' closingDay=' + closingDay + ' confirmed=' + confirmed + ' reason=' + reason);
