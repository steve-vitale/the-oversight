#!/usr/bin/env node
// analyze-cband-b.js — C-only judged-band integrity + established ledger
// (sim-cband-b, Loop B food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-cband-b-prereg.md (committed
// BEFORE any judged leg).
//
// Why a new analyzer instead of reusing analyze-homeconstruct-b.js:
// that analyzer hardcodes the 1636Z C hop (2,8)->(4,8); this band's
// destinations differ per seed. Definitions are the homewardac
// (1636Z) C definitions with the destination as a parameter, as in
// analyze-destfirst-b.js, PLUS the two established readings fixed
// in this run's prereg (see below). Reporter, never a judge; the
// caller applies the prereg GO thresholds.
//
// Mode: --shadow <file> --armed <file> --dest x,y --origin x,y
//   --stage2start x,y
//   Files hold ONE driver instance each (one JSON line, stdout of
//   scripts/homeconstruct-b-driver.js, UNCHANGED).
//   Per pair:
//   DAY1-IDENTITY: day-1 record identical between legs (STOP
//     condition per the homewardac prereg — a FAIL pair is not
//     judged).
//   REPRO: shadow day-6 start equals the stage-2 actual day-6
//     start (the judged legs reproduce the stage-2 trip exactly;
//     same route env). A REPRO FAIL is DIAG-INSTRUMENT, never
//     silently pooled.
//   INTEGRITY (homewardac C, verbatim): day-6 start != haven on
//     BOTH legs AND day-6 starts MATCH AND the attempt hop to
//     --dest is attempted on BOTH legs. Failure reasons:
//     start-at-haven, start-mismatch, attempt-not-offered,
//     missing-day6 (a leg with no day-6 record).
//   ESTABLISHED-BAND (this run's prereg operationalization):
//     integrity-ok AND shadow day-6 attempt hop (first day-6 hop
//     to --dest) simOk === false AND armed day-6 attempt hop
//     vetoed === true (the fence actually fired on the attempt).
//   ESTABLISHED-STRICT (homewardac literal): established-band
//     AND armed attempt hop originSimOk === true.
//     STRUCTURAL NOTE (prereg §"definition applicability"): all 8
//     band attempt hops are OUTWARD (destination farther from
//     haven than the actual day-6 start), and the guard code
//     (scripts/policies/competent-homewardstep-b.js, installGuard)
//     records originSimOk ONLY on homeward vetoes — outward
//     vetoes keep originSimOk null. Established-strict is
//     therefore structurally expected 0 on this band; it is
//     reported alongside, never substituted for the band reading
//     mid-run.
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
function normDay(d) {
  if (!d) return null;
  return JSON.stringify({ start: d.start, end: d.end, forages: d.forages, dayEndReturnSim: d.dayEndReturnSim });
}
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
  console.error('usage: analyze-cband-b.js --shadow <f> --armed <f> --dest x,y --origin x,y --stage2start x,y');
  process.exit(2);
}
const shadow = load(shadowFile);
const armed = load(armedFile);
const aBySeed = new Map(armed.map((i) => [i.seed, i]));

let day1Pass = 0, day1Fail = 0, reproPass = 0, reproFail = 0;
let integrityOk = 0, integrityFail = 0, establishedBand = 0, establishedStrict = 0;
const failures = [];

for (const sInst of shadow) {
  const aInst = aBySeed.get(sInst.seed);
  if (!aInst) continue;
  const sDays = dayMap(sInst), aDays = dayMap(aInst);
  const d1s = sDays.get(1), d1a = aDays.get(1);
  const d1ok = !!(d1s && d1a && normDay(d1s) === normDay(d1a));
  if (d1ok) { day1Pass++; console.log('DAY1-IDENTITY seed=' + sInst.seed + ' PASS'); }
  else { day1Fail++; console.log('DAY1-IDENTITY seed=' + sInst.seed + ' FAIL'); }
  const s6 = sDays.get(6), a6 = aDays.get(6);
  const s5 = sDays.get(5), a5 = aDays.get(5);
  const haven = (s6 && s6.start && s6.start.haven) || { x: 4, y: 4 };
  const repro = !!(s6 && samePos(s6.start.pos, stage2start));
  if (repro) { reproPass++; } else { reproFail++; }
  console.log('REPRO seed=' + sInst.seed + ' dest=' + dest.x + ',' + dest.y +
    ' stage2Start=' + stage2start.x + ',' + stage2start.y +
    ' shadowDay6Start=' + JSON.stringify(s6 && s6.start.pos) +
    ' shadowDay5AfterForced=' + JSON.stringify(s5 && s5.construct && s5.construct.posAfterForced) +
    ' armedDay5AfterForced=' + JSON.stringify(a5 && a5.construct && a5.construct.posAfterForced) +
    ' ' + (repro ? 'PASS' : 'FAIL'));
  const sOut = !!(s6 && !samePos(s6.start.pos, haven));
  const aOut = !!(a6 && !samePos(a6.start.pos, haven));
  const startsMatch = !!(s6 && a6 && samePos(s6.start.pos, a6.start.pos));
  const sAtt = !!(s6 && s6.construct && s6.construct.kind === 'attempt' && s6.construct.attempt && s6.construct.attempt.attempted);
  const aAtt = !!(a6 && a6.construct && a6.construct.kind === 'attempt' && a6.construct.attempt && a6.construct.attempt.attempted);
  const sHop = (s6 && s6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
  const aHop = (a6 && a6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
  let reason = null;
  if (!s6 || !a6) reason = 'missing-day6';
  else if (!sOut || !aOut) reason = 'start-at-haven';
  else if (!startsMatch) reason = 'start-mismatch';
  else if (!sAtt || !aAtt) reason = 'attempt-not-offered';
  if (!reason) {
    integrityOk++;
    const band = !!(sHop && sHop.simOk === false && aHop && aHop.vetoed === true);
    const strict = !!(band && aHop.originSimOk === true);
    if (band) establishedBand++;
    if (strict) establishedStrict++;
    console.log('INTEGRITY seed=' + sInst.seed + ' shape=C dest=' + dest.x + ',' + dest.y +
      ' origin=' + origin.x + ',' + origin.y + ' OK' +
      ' day6Start=' + JSON.stringify(s6.start.pos) +
      ' shadowAttemptSimOk=' + (sHop ? sHop.simOk : 'absent') +
      ' armedAttemptVetoed=' + (aHop ? !!aHop.vetoed : 'absent') +
      ' armedAttemptOriginSimOk=' + (aHop ? aHop.originSimOk : 'absent') +
      ' armedAttemptHomeward=' + (aHop ? !!aHop.homeward : 'absent') +
      ' establishedBand=' + band + ' establishedStrict=' + strict +
      ' shadowDayEndOk=' + (s6.dayEndReturnSim && s6.dayEndReturnSim.ok) +
      ' armedDayEndOk=' + (a6.dayEndReturnSim && a6.dayEndReturnSim.ok) +
      ' armedDay6End=' + JSON.stringify(a6.end && a6.end.pos) +
      ' armedHomewardVetoes=' + (a6.homewardVetoes || 0) +
      ' armedVetoOriginPass=' + (a6.vetoOriginPass || 0) +
      ' armedVetoOriginFail=' + (a6.vetoOriginFail || 0));
  } else {
    integrityFail++; failures.push(sInst.seed + ':C:' + reason);
    console.log('INTEGRITY seed=' + sInst.seed + ' shape=C dest=' + dest.x + ',' + dest.y +
      ' origin=' + origin.x + ',' + origin.y + ' FAIL reason=' + reason +
      ' sStart=' + JSON.stringify(s6 && s6.start.pos) + ' aStart=' + JSON.stringify(a6 && a6.start.pos) +
      ' sDay5After=' + JSON.stringify(s5 && s5.construct && s5.construct.posAfterForced) +
      ' aDay5After=' + JSON.stringify(a5 && a5.construct && a5.construct.posAfterForced) +
      ' sAttempt=' + JSON.stringify(s6 && s6.construct && s6.construct.attempt) +
      ' aAttempt=' + JSON.stringify(a6 && a6.construct && a6.construct.attempt) +
      ' shadowAttemptSimOk=' + (sHop ? sHop.simOk : 'absent') +
      ' armedAttemptVetoed=' + (aHop ? !!aHop.vetoed : 'absent') +
      ' armedAttemptOriginSimOk=' + (aHop ? aHop.originSimOk : 'absent'));
  }
}
console.log('SUMMARY shape=C dest=' + dest.x + ',' + dest.y + ' origin=' + origin.x + ',' + origin.y +
  ' seeds=' + shadow.length +
  ' day1Pass=' + day1Pass + ' day1Fail=' + day1Fail +
  ' reproPass=' + reproPass + ' reproFail=' + reproFail +
  ' integrityOk=' + integrityOk + ' integrityFail=' + integrityFail +
  ' establishedBand=' + establishedBand + ' establishedStrict=' + establishedStrict +
  ' failures=' + failures.join(' '));
