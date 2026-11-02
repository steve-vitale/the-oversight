#!/usr/bin/env node
// analyze-destfirst-b.js — destination-first constructed-trip
// integrity + established ledger (sim-destfirst-b, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-destfirst-b-prereg.md.
// Generalizes scripts/analyze-homeconstruct-b.js (UNUSED here
// only because that analyzer hardcodes destinations (7,1) and
// the (2,8)->(4,8) hop; the definitions below are the same
// prereg definitions with the destination as a parameter).
// Reads driver .jsonl files (one JSON object per seed, stdout
// of scripts/homeconstruct-b-driver.js). Reporter, never a judge;
// the caller applies the prereg GO thresholds.
// Mode: --shadow <file> --armed <file> --shape A|C --dest x,y
//   Per seed: DAY1-IDENTITY (day-1 record identical between
//   legs; STOP condition per the prereg), INTEGRITY, ESTABLISHED.
//   A integrity-ok iff ALL hold: (a) day-5 start == haven on
//   BOTH legs; (b) shadow forced walk-out completes to --dest;
//   (c) armed forced walk-out completes to --dest. Failure
//   reasons: start-not-haven, shadow-walkout-incomplete,
//   armed-walkout-incomplete (armed walk-out vetoed = guard
//   prevention on the way OUT, not a rescue verdict).
//   A established: integrity-ok AND shadow day-5 dayEndReturnSim
//   .ok === false (the pocket actually formed under shadow).
//   A walk-out hop-time E: every shadow walk-out hop simOk
//   (from the guard hop log on the construction day) is also
//   reported; the prereg's walk-out clause requires all true.
//   C integrity-ok iff ALL hold: (a) day-6 start != haven on
//   BOTH legs; (b) day-6 starts MATCH; (c) the attempt hop to
//   --dest is attempted on BOTH legs. Failure reasons:
//   start-at-haven, start-mismatch, attempt-not-offered.
//   C established: integrity-ok AND the shadow day-6 attempt hop
//   (to --dest) has simOk === false (the fence has a failing hop
//   to veto). The armed veto's originSimOk (escapable origin)
//   is reported alongside; a C trip whose armed origin fails is
//   NOT established-as-fenced, it is reported as such.
// Exit 0 always; the caller applies the prereg verdicts. A day-1
// identity FAIL is a STOP condition — the caller must not judge
// legs that fail it.
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

const shape = arg('shape', 'A');
const dest = parseXY(arg('dest', ''));
if (!dest) { console.error('usage: analyze-destfirst-b.js --shadow <f> --armed <f> --shape A|C --dest x,y'); process.exit(2); }
const shadow = load(arg('shadow', null));
const armed = load(arg('armed', null));
const aBySeed = new Map(armed.map((i) => [i.seed, i]));

let day1Pass = 0, day1Fail = 0, integrityOk = 0, integrityFail = 0, established = 0;
const failures = [];

for (const sInst of shadow) {
  const aInst = aBySeed.get(sInst.seed);
  if (!aInst) continue;
  const sDays = dayMap(sInst), aDays = dayMap(aInst);
  const d1s = sDays.get(1), d1a = aDays.get(1);
  const d1ok = !!(d1s && d1a && normDay(d1s) === normDay(d1a));
  if (d1ok) { day1Pass++; console.log('DAY1-IDENTITY seed=' + sInst.seed + ' PASS'); }
  else { day1Fail++; console.log('DAY1-IDENTITY seed=' + sInst.seed + ' FAIL'); }
  if (shape === 'A') {
    const s5 = sDays.get(5), a5 = aDays.get(5);
    const haven = (s5 && s5.start && s5.start.haven) || { x: 4, y: 4 };
    const sStartHaven = !!(s5 && samePos(s5.start.pos, haven));
    const aStartHaven = !!(a5 && samePos(a5.start.pos, haven));
    const sWalk = !!(s5 && s5.construct && s5.construct.kind === 'walkout' && samePos(s5.construct.posAfterForced, dest));
    const aWalk = !!(a5 && a5.construct && a5.construct.kind === 'walkout' && samePos(a5.construct.posAfterForced, dest));
    // Walk-out hop-time E on the shadow leg: hops on day 5 from
    // haven to dest, in order, all simOk (guard hop log).
    let walkE = null;
    if (s5 && s5.construct && Array.isArray(s5.construct.steps)) {
      const hops = s5.hops || [];
      const prefix = [];
      let cur = haven;
      for (const h of hops) {
        if (!samePos(h.from, cur)) break;
        prefix.push(h); cur = h.to;
        if (samePos(cur, dest)) break;
      }
      if (prefix.length && samePos(cur, dest)) walkE = prefix.every((h) => h.simOk === true);
    }
    let reason = null;
    if (!sStartHaven || !aStartHaven) reason = 'start-not-haven';
    else if (!sWalk) reason = 'shadow-walkout-incomplete';
    else if (!aWalk) reason = 'armed-walkout-incomplete';
    if (!reason) {
      integrityOk++;
      const est = s5.dayEndReturnSim && s5.dayEndReturnSim.ok === false;
      if (est) established++;
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=A dest=' + dest.x + ',' + dest.y + ' OK established=' + est +
        ' walkOutEallPass=' + walkE +
        ' shadowDayEndOk=' + (s5.dayEndReturnSim && s5.dayEndReturnSim.ok) +
        ' armedDayEndOk=' + (a5.dayEndReturnSim && a5.dayEndReturnSim.ok) +
        ' armedHomewardVetoes=' + (a5.homewardVetoes || 0));
    } else {
      integrityFail++; failures.push(sInst.seed + ':A:' + reason);
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=A dest=' + dest.x + ',' + dest.y + ' FAIL reason=' + reason +
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
    const sHop = (s6 && s6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
    const aHop = (a6 && a6.hops || []).find((h) => h.to.x === dest.x && h.to.y === dest.y);
    const sAtt = !!(s6 && s6.construct && s6.construct.kind === 'attempt' && s6.construct.attempt && s6.construct.attempt.attempted);
    const aAtt = !!(a6 && a6.construct && a6.construct.kind === 'attempt' && a6.construct.attempt && a6.construct.attempt.attempted);
    let reason = null;
    if (!sOut || !aOut) reason = 'start-at-haven';
    else if (!startsMatch) reason = 'start-mismatch';
    else if (!sAtt || !aAtt) reason = 'attempt-not-offered';
    if (!reason) {
      integrityOk++;
      const est = !!(sHop && sHop.simOk === false);
      if (est) established++;
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=C dest=' + dest.x + ',' + dest.y + ' OK established=' + est +
        ' day6Start=' + JSON.stringify(s6.start.pos) +
        ' shadowAttemptSimOk=' + (sHop ? sHop.simOk : 'absent') +
        ' armedVetoOriginSimOk=' + (aHop ? aHop.originSimOk : 'absent') +
        ' armedVetoed=' + (aHop ? !!aHop.vetoed : 'absent') +
        ' shadowDayEndOk=' + (s6.dayEndReturnSim && s6.dayEndReturnSim.ok) +
        ' armedDayEndOk=' + (a6.dayEndReturnSim && a6.dayEndReturnSim.ok) +
        ' armedHomewardVetoes=' + (a6.homewardVetoes || 0));
    } else {
      integrityFail++; failures.push(sInst.seed + ':C:' + reason);
      console.log('INTEGRITY seed=' + sInst.seed + ' shape=C dest=' + dest.x + ',' + dest.y + ' FAIL reason=' + reason +
        ' sStart=' + JSON.stringify(s6 && s6.start.pos) + ' aStart=' + JSON.stringify(a6 && a6.start.pos) +
        ' sDay5After=' + JSON.stringify(s5 && s5.construct && s5.construct.posAfterForced) +
        ' aDay5After=' + JSON.stringify(a5 && a5.construct && a5.construct.posAfterForced) +
        ' sAttempt=' + JSON.stringify(s6 && s6.construct && s6.construct.attempt) +
        ' aAttempt=' + JSON.stringify(a6 && a6.construct && a6.construct.attempt));
    }
  }
}
console.log('SUMMARY shape=' + shape + ' dest=' + dest.x + ',' + dest.y + ' seeds=' + shadow.length +
  ' day1Pass=' + day1Pass + ' day1Fail=' + day1Fail +
  ' integrityOk=' + integrityOk + ' integrityFail=' + integrityFail +
  ' established=' + established + ' failures=' + failures.join(' '));
