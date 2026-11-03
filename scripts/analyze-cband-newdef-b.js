#!/usr/bin/env node
// analyze-cband-newdef-b.js — decided-definition episode counter
// (sim-cband-newdef-b, Loop B food-economy arm, 2026-11-03).
// Prereg: evidence/2026-11-03/sim-cband-newdef-b-prereg.md (committed
// BEFORE any judged leg).
//
// Decided definition (coordinator decision, run
// fleshout-loop-b-20261103T0856Z, convergence-tracker.md): "fences
// shape C" INCLUDES outward attempt vetoes via the outward-attempt
// form, RETAINING the homeward form for the still-open
// homeward-rescue question. This analyzer reports the OUTWARD form
// per judged pair; the HOMEWARD form is the unchanged shapes
// analyzer's EPISODE-C count on the band files
// (scripts/analyze-homeward-shapes-b.js, reused UNCHANGED), and the
// COMBINED decided total is OUT + HOME, added in the evidence file
// (never re-scored, never substituted).
//
// Mode: --shadow <file> --armed <file> --dest x,y --origin x,y
//   --stage2start x,y
//   Files hold ONE driver instance each (one JSON line, stdout of
//   scripts/homeconstruct-b-driver.js, UNCHANGED).
//   Integrity, established-band and established-strict are computed
//   with the SAME field reads as scripts/analyze-cband-b.js
//   (reused UNCHANGED for the official ledger; this analyzer
//   re-derives them only so its OUT line is self-contained and
//   cross-checkable against the cband analyzer output).
//   NEWDEF-OUT episode (one per judged pair, never per day):
//     integrity-ok AND shadow day-6 attempt hop (first day-6 hop
//     to --dest) simOk === false AND armed day-6 attempt hop
//     vetoed === true AND armed day-6 dayEndReturnSim.ok === true
//     (armed day-6 stay on escapable ground).
//   The armed day-6 stay is dayEndReturnSim.ok, the same field the
//   cband analyzer prints as armedDayEndOk. The shadow day-6 end
//   is reported alongside (shadowDayEndOk) but is NOT a gate:
//   the decided outward-attempt form is vetoed + armed stay only.
// Exit 0 always; the caller applies the prereg verdicts.
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
function load(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }
function dayMap(inst) { return new Map((inst.days || []).map((d) => [d.loopDay, d])); }
function parseXY(s) {
  const m = String(s || '').match(/^(-?\d+),(-?\d+)$/);
  return m ? { x: parseInt(m[1], 10), y: parseInt(m[2], 10) } : null;
}

const dest = parseXY(arg('dest', ''));
const origin = parseXY(arg('origin', ''));
const stage2start = parseXY(arg('stage2start', ''));
const shadowFile = arg('shadow', null);
const armedFile = arg('armed', null);
if (!dest || !origin || !stage2start || !shadowFile || !armedFile) {
  console.error('usage: analyze-cband-newdef-b.js --shadow <f> --armed <f> --dest x,y --origin x,y --stage2start x,y');
  process.exit(2);
}
const shadow = load(shadowFile);
const armed = load(armedFile);
const aBySeed = new Map(armed.map((i) => [i.seed, i]));

let outEpisodes = 0, integrityOk = 0, establishedBand = 0;
for (const sInst of shadow) {
  const aInst = aBySeed.get(sInst.seed);
  if (!aInst) continue;
  const sDays = dayMap(sInst), aDays = dayMap(aInst);
  const s6 = sDays.get(6), a6 = aDays.get(6);
  const haven = (s6 && s6.start && s6.start.haven) || { x: 4, y: 4 };
  const sOut = !!(s6 && !samePos(s6.start.pos, haven));
  const aOut = !!(a6 && !samePos(a6.start.pos, haven));
  const startsMatch = !!(s6 && a6 && samePos(s6.start.pos, a6.start.pos));
  const sAtt = !!(s6 && s6.construct && s6.construct.kind === 'attempt' && s6.construct.attempt && s6.construct.attempt.attempted);
  const aAtt = !!(a6 && a6.construct && a6.construct.kind === 'attempt' && a6.construct.attempt && a6.construct.attempt.attempted);
  let reason = null;
  if (!s6 || !a6) reason = 'missing-day6';
  else if (!sOut || !aOut) reason = 'start-at-haven';
  else if (!startsMatch) reason = 'start-mismatch';
  else if (!sAtt || !aAtt) reason = 'attempt-not-offered';
  const sHop = (s6 && s6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
  const aHop = (a6 && a6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
  const band = !reason && !!(sHop && sHop.simOk === false && aHop && aHop.vetoed === true);
  const armedStay = !!(a6 && a6.dayEndReturnSim && a6.dayEndReturnSim.ok === true);
  const shadowStay = !!(s6 && s6.dayEndReturnSim && s6.dayEndReturnSim.ok === true);
  const out = !!(band && armedStay);
  if (!reason) integrityOk++;
  if (band) establishedBand++;
  if (out) outEpisodes++;
  console.log('NEWDEF-OUT seed=' + sInst.seed + ' dest=' + dest.x + ',' + dest.y +
    ' origin=' + origin.x + ',' + origin.y +
    ' integrity=' + (reason ? 'FAIL:' + reason : 'OK') +
    ' shadowAttemptSimOk=' + (sHop ? sHop.simOk : 'absent') +
    ' armedAttemptVetoed=' + (aHop ? !!aHop.vetoed : 'absent') +
    ' armedAttemptHomeward=' + (aHop ? !!aHop.homeward : 'absent') +
    ' armedDayEndOk=' + (a6 && a6.dayEndReturnSim && a6.dayEndReturnSim.ok) +
    ' shadowDayEndOk=' + (s6 && s6.dayEndReturnSim && s6.dayEndReturnSim.ok) +
    ' armedDay6End=' + JSON.stringify(a6 && a6.end && a6.end.pos) +
    ' establishedBand=' + band + ' newdefOut=' + out);
}
console.log('NEWDEF-SUMMARY dest=' + dest.x + ',' + dest.y + ' origin=' + origin.x + ',' + origin.y +
  ' seeds=' + shadow.length + ' integrityOk=' + integrityOk +
  ' establishedBand=' + establishedBand + ' newdefOut=' + outEpisodes);
