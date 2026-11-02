#!/usr/bin/env node
// analyze-homeconstruct-b.js — constructed-trip identity + integrity
// ledger (sim-homewardac-b, 2026-11-02). Prereg:
// evidence/2026-11-02/sim-homewardac-b-prereg.md.
// Reads driver .jsonl files (one JSON object per seed, stdout of
// scripts/homeconstruct-b-driver.js). Reporter, never a judge;
// the caller applies the prereg GO thresholds.
// Mode: --identity --shadow <file> --armed <file> --shape A|C
//   Per seed: DAY1-IDENTITY (day-1 record identical between legs),
//   CONSTRUCT-DAY-START identity, INTEGRITY (prereg clauses +
//   failure reason), ESTABLISHED (prereg secondary definition).
// Exit 0 always; the caller applies the prereg verdicts. A
// day-1 identity FAIL is a STOP condition per the prereg — the
// caller must not judge legs that fail it.
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

if (!process.argv.includes('--identity')) {
  console.error('usage: analyze-homeconstruct-b.js --identity --shadow <file> --armed <file> --shape A|C');
  process.exit(2);
}
const shape = arg('shape', 'A');
const shadow = load(arg('shadow', null));
const armed = load(arg('armed', null));
const aBySeed = new Map(armed.map((i) => [i.seed, i]));

let day1Pass = 0, day1Fail = 0, integrityOk = 0, integrityFail = 0, established = 0;
const failures = [];

for (const sInst of shadow) {
  const aInst = aBySeed.get(sInst.seed);
  if (!aInst) continue;
  const sDays = dayMap(sInst), aDays = dayMap(aInst);
  // Day-1 identity (STOP condition per prereg).
  const d1s = sDays.get(1), d1a = aDays.get(1);
  const d1ok = !!(d1s && d1a && normDay(d1s) === normDay(d1a));
  if (d1ok) day1Pass++; else { day1Fail++; console.log('DAY1-IDENTITY seed=' + sInst.seed + ' FAIL'); }
  if (d1ok) console.log('DAY1-IDENTITY seed=' + sInst.seed + ' PASS');
  if (shape === 'A') {
    const s5 = sDays.get(5), a5 = aDays.get(5);
    const startOk = !!(s5 && a5 && JSON.stringify(s5.start) === JSON.stringify(a5.start));
    const haven = (s5 && s5.start && s5.start.haven) || { x: 4, y: 4 };
    const sStartHaven = !!(s5 && samePos(s5.start.pos, haven));
    const aStartHaven = !!(a5 && samePos(a5.start.pos, haven));
    const sWalk = !!(s5 && s5.construct && s5.construct.kind === 'walkout' &&
      samePos(s5.construct.posAfterForced, { x: 7, y: 1 }));
    const aWalk = !!(a5 && a5.construct && a5.construct.kind === 'walkout' &&
      samePos(a5.construct.posAfterForced, { x: 7, y: 1 }));
    let reason = null;
    if (!sStartHaven || !aStartHaven) reason = 'start-not-haven';
    else if (!sWalk) reason = 'shadow-walkout-incomplete';
    else if (!aWalk) reason = 'armed-walkout-incomplete';
    if (!startOk) console.log('CONSTRUCT-START seed=' + sInst.seed + ' day=5 MISMATCH');
    if (!reason) {
      integrityOk++;
      const est = s5.dayEndReturnSim && s5.dayEndReturnSim.ok === false;
      if (est) established++;
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=A OK established=' + est +
        ' shadowDayEndOk=' + (s5.dayEndReturnSim && s5.dayEndReturnSim.ok) +
        ' armedDayEndOk=' + (a5.dayEndReturnSim && a5.dayEndReturnSim.ok) +
        ' armedHomewardVetoes=' + (a5.homewardVetoes || 0));
    } else {
      integrityFail++; failures.push(sInst.seed + ':A:' + reason);
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=A FAIL reason=' + reason +
        ' sStart=' + JSON.stringify(s5 && s5.start.pos) + ' aStart=' + JSON.stringify(a5 && a5.start.pos) +
        ' sAfterForced=' + JSON.stringify(s5 && s5.construct && s5.construct.posAfterForced) +
        ' aAfterForced=' + JSON.stringify(a5 && a5.construct && a5.construct.posAfterForced));
    }
  } else {
    const s6 = sDays.get(6), a6 = aDays.get(6);
    const s5 = sDays.get(5), a5 = aDays.get(5);
    const haven = (s6 && s6.start && s6.start.haven) || { x: 4, y: 4 };
    const sOut = !!(s6 && !samePos(s6.start.pos, haven));
    const aOut = !!(a6 && !samePos(a6.start.pos, haven));
    const startsMatch = !!(s6 && a6 && samePos(s6.start.pos, a6.start.pos));
    const sAtt = !!(s6 && s6.construct && s6.construct.kind === 'attempt' && s6.construct.attempt && s6.construct.attempt.attempted);
    const aAtt = !!(a6 && a6.construct && a6.construct.kind === 'attempt' && a6.construct.attempt && a6.construct.attempt.attempted);
    let reason = null;
    if (!sOut || !aOut) reason = 'start-at-haven';
    else if (!startsMatch) reason = 'start-mismatch';
    else if (!sAtt || !aAtt) reason = 'attempt-not-offered';
    const startOk = !!(s6 && a6 && JSON.stringify(s6.start) === JSON.stringify(a6.start));
    if (!startOk && sOut && aOut) console.log('CONSTRUCT-START seed=' + sInst.seed + ' day=6 MISMATCH');
    if (!reason) {
      integrityOk++;
      const sHop = (s6.hops || []).find((h) => h.from.x === 2 && h.from.y === 8 && h.to.x === 4 && h.to.y === 8);
      const est = !!(sHop && sHop.simOk === false);
      if (est) established++;
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=C OK established=' + est +
        ' day6Start=' + JSON.stringify(s6.start.pos) +
        ' shadowAttemptSimOk=' + (sHop ? sHop.simOk : 'absent') +
        ' shadowDayEndOk=' + (s6.dayEndReturnSim && s6.dayEndReturnSim.ok) +
        ' armedDayEndOk=' + (a6.dayEndReturnSim && a6.dayEndReturnSim.ok) +
        ' armedHomewardVetoes=' + (a6.homewardVetoes || 0));
    } else {
      integrityFail++; failures.push(sInst.seed + ':C:' + reason);
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=C FAIL reason=' + reason +
        ' sStart=' + JSON.stringify(s6 && s6.start.pos) + ' aStart=' + JSON.stringify(a6 && a6.start.pos) +
        ' sDay5After=' + JSON.stringify(s5 && s5.construct && s5.construct.posAfterForced) +
        ' aDay5After=' + JSON.stringify(a5 && a5.construct && a5.construct.posAfterForced) +
        ' sAttempt=' + JSON.stringify(s6 && s6.construct && s6.construct.attempt) +
        ' aAttempt=' + JSON.stringify(a6 && a6.construct && a6.construct.attempt));
    }
  }
}
console.log('SUMMARY shape=' + shape + ' seeds=' + shadow.length +
  ' day1Pass=' + day1Pass + ' day1Fail=' + day1Fail +
  ' integrityOk=' + integrityOk + ' integrityFail=' + integrityFail +
  ' established=' + established + ' failures=' + failures.join(' '));
