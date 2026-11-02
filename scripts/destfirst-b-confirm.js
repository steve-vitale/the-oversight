#!/usr/bin/env node
// destfirst-b-confirm.js — stage-2 confirmation read for ONE
// shadow-only homeconstruct leg (sim-destfirst-b, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-destfirst-b-prereg.md.
// A screen hit is a candidate, never a setup. This checker
// confirms it on the real trip (shadow leg only; the armed
// leg's veto behaviour is judged-stage information, never
// inferred here):
//   A confirmed iff: day-5 forced walk-out completes to --dest
//     AND every shadow walk-out hop simOk (the walk-out clause)
//     AND shadow day-5 dayEndReturnSim.ok === false.
//   C confirmed iff: day-6 start != haven AND the attempt hop
//     to --dest was attempted AND the shadow day-6 hop to
//     --dest has simOk === false. (Origin escapability is
//     verified at the judged stage via the armed veto's
//     originSimOk; a C confirmation without it is reported
//     as confirmed-destination-only, never as fenced.)
// Usage: destfirst-b-confirm.js --file <jsonl> --shape A|C
//   --dest x,y. Exit 0 always; the caller applies the prereg
//   selection rule (first confirmations in seed order).
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
const shape = arg('shape', 'A');
const dest = parseXY(arg('dest', ''));
const file = arg('file', null);
if (!dest || !file) { console.error('usage: destfirst-b-confirm.js --file <jsonl> --shape A|C --dest x,y'); process.exit(2); }
const inst = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l))[0];
if (!inst) { console.log('CONFIRM seed=? shape=' + shape + ' confirmed=false reason=no-instance'); process.exit(0); }
const dayMap = new Map((inst.days || []).map((d) => [d.loopDay, d]));
if (shape === 'A') {
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
  const dayEndOk = d5 && d5.dayEndReturnSim ? d5.dayEndReturnSim.ok : null;
  const confirmed = walk && walkE === true && dayEndOk === false;
  console.log('CONFIRM seed=' + inst.seed + ' shape=A dest=' + dest.x + ',' + dest.y +
    ' walkout=' + walk + ' walkOutEallPass=' + walkE + ' dayEndOk=' + dayEndOk + ' confirmed=' + confirmed);
} else {
  const d6 = dayMap.get(6), d5 = dayMap.get(5);
  const haven = (d6 && d6.start && d6.start.haven) || { x: 4, y: 4 };
  const offHaven = !!(d6 && !samePos(d6.start.pos, haven));
  const att = !!(d6 && d6.construct && d6.construct.kind === 'attempt' && d6.construct.attempt && d6.construct.attempt.attempted);
  const hop = (d6 && d6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
  const hopSimOk = hop ? hop.simOk : 'absent';
  const confirmed = offHaven && att && hopSimOk === false;
  console.log('CONFIRM seed=' + inst.seed + ' shape=C dest=' + dest.x + ',' + dest.y +
    ' day6Start=' + JSON.stringify(d6 && d6.start.pos) + ' offHaven=' + offHaven +
    ' attempted=' + att + ' hopSimOk=' + hopSimOk +
    ' day5AfterForced=' + JSON.stringify(d5 && d5.construct && d5.construct.posAfterForced) +
    ' confirmed=' + confirmed);
}
