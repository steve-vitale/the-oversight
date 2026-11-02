#!/usr/bin/env node
// analyze-homeward-shapes-b.js — extended (A/C-inclusive) episode
// screener + veto E table (sim-homeward-shapes-b, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-homeward-shapes-b-prereg.md.
// Reads driver .jsonl files (one JSON object per seed, stdout of
// scripts/homext-abl-b-driver.js). Definitions implemented
// literally from the prereg, from exact driver fields:
//   day.start.pos, day.start.haven, day.end.pos, day.end.kcal,
//   day.dayEndReturnSim.ok, day.hops[].from/to, .simOk, .vetoed,
//   .homeward, .originSimOk, .silent, day.homewardVetoes,
//   day.vetoOriginPass, day.vetoOriginFail.
// Mode: --episodes --shadow <file> --armed <file>
//   Per seed/day: A-qualifying days (shadow dayEnd false + armed
//   hv>=1 + armed dayEnd true; first day of each run needs a
//   haven-prefix walk-out, all simOk, ending at the shadow end
//   tile) and C-qualifying days (armed start != haven, vetoed
//   homeward hop simOk=false + originSimOk=true, both dayEnds
//   true, shadow same hop simOk=false; A takes precedence per
//   day). Maximal consecutive-day runs per seed+shape = episodes.
//   Also prints one VETO line per armed homeward veto with
//   hop-time E (vetoed hop simOk), origin E (originSimOk) and
//   day-end E (armed dayEndReturnSim.ok), plus VETO-TOTALS and
//   an EPISODES line. C-LOOSE days (clause 4 missing) are
//   reported but never counted as candidates.
// Exit 0 always (reporter, never a judge); the caller applies
// the prereg GO threshold.
'use strict';
const fs = require('fs');
const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
function load(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function hopKey(h) { return h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y; }
function sameHop(a, b) { return a.from.x === b.from.x && a.from.y === b.from.y && a.to.x === b.to.x && a.to.y === b.to.y; }
function samePos(a, b) { return a && b && a.x === b.x && a.y === b.y; }

if (!process.argv.includes('--episodes')) {
  console.error('usage: analyze-homeward-shapes-b.js --episodes --shadow <file> --armed <file>');
  process.exit(2);
}
const shadow = load(arg('shadow', null));
const armed = load(arg('armed', null));
const aBySeed = new Map(armed.map((i) => [i.seed, i]));
const sBySeed = new Map(shadow.map((i) => [i.seed, i]));

let vetoTotal = 0, vetoDisagree = 0, vetoHopExplains = 0, vetoAgreeFail = 0, vetoAgreePass = 0;
const episodes = []; // {seed, shape, days, ...}
let cLooseDays = 0;

for (const sInst of shadow) {
  const aInst = aBySeed.get(sInst.seed);
  if (!aInst) continue;
  const aDays = new Map((aInst.days || []).map((d) => [d.loopDay, d]));
  const aQual = []; // loopDays, with detail
  const cQual = [];
  for (const sDay of (sInst.days || [])) {
    const aDay = aDays.get(sDay.loopDay);
    if (!aDay) continue;
    const sEndOk = (sDay.dayEndReturnSim || {}).ok;
    const aEndOk = (aDay.dayEndReturnSim || {}).ok;
    const aHv = aDay.homewardVetoes || 0;
    // VETO table: every armed homeward veto on this day.
    for (const h of (aDay.hops || [])) {
      if (!(h.vetoed === true && h.homeward === true)) continue;
      vetoTotal++;
      const hopE = h.simOk, dayE = aEndOk;
      const disagree = hopE !== dayE;
      if (disagree) vetoDisagree++;
      if (hopE === false && dayE === true) vetoHopExplains++;
      if (hopE === false && dayE === false) vetoAgreeFail++;
      if (hopE === true && dayE === true) vetoAgreePass++;
      console.log('VETO seed=' + sInst.seed + ' day=' + sDay.loopDay + ' hop=' + hopKey(h) +
        ' hopTimeE=' + hopE + ' originE=' + h.originSimOk + ' dayEndE=' + dayE +
        ' silent=' + h.silent + ' disagree=' + disagree);
    }
    // Shape A day: shadow day-end fails, armed vetoes + day-end passes.
    if (sEndOk === false && aHv >= 1 && aEndOk === true) {
      aQual.push({ day: sDay.loopDay, sDay, aDay });
      continue; // A takes precedence per day.
    }
    // Shape C day: mid-trip start, origin-passing veto, both day-ends pass.
    const aStart = (aDay.start || {}).pos, aHaven = (aDay.start || {}).haven;
    const cVeto = (aDay.hops || []).find((h) => h.vetoed === true && h.homeward === true && h.simOk === false && h.originSimOk === true);
    if (aStart && aHaven && !samePos(aStart, aHaven) && aHv >= 1 && cVeto && aEndOk === true && sEndOk === true) {
      const sHop = (sDay.hops || []).find((h) => h.homeward === true && sameHop(h, cVeto));
      if (sHop && sHop.simOk === false) {
        cQual.push({ day: sDay.loopDay, sDay, aDay, veto: cVeto });
      } else {
        cLooseDays++;
        console.log('C-LOOSE seed=' + sInst.seed + ' day=' + sDay.loopDay + ' hop=' + hopKey(cVeto) +
          ' shadowHopSimOk=' + (sHop ? sHop.simOk : 'absent'));
      }
    }
  }
  // Group A days into episodes; first day of each run needs the walk-out prefix.
  function groupRuns(qual, shape) {
    let run = [];
    const flush = () => {
      if (run.length === 0) return;
      if (shape === 'A') {
        const first = run[0];
        const hops = first.sDay.hops || [];
        const haven = (first.sDay.start || {}).haven;
        const endPos = (first.sDay.end || {}).pos;
        const startPos = (first.sDay.start || {}).pos;
        // Contiguous prefix from haven to end tile, all simOk.
        let cur = startPos, prefix = [], ok = false;
        if (samePos(startPos, haven)) {
          for (const h of hops) {
            if (!samePos(h.from, cur)) break;
            prefix.push(h); cur = h.to;
            if (samePos(cur, endPos)) { ok = true; break; }
          }
          ok = ok && prefix.length > 0 && prefix.every((h) => h.simOk === true);
        }
        if (ok) {
          episodes.push({ seed: sInst.seed, shape: 'A', days: run.map((r) => r.day),
            walkOut: prefix.map(hopKey).join(' '), endTile: endPos.x + ',' + endPos.y,
            shadowEndKcal: (first.sDay.end || {}).kcal });
          console.log('EPISODE-A seed=' + sInst.seed + ' days=' + run.map((r) => r.day).join(',') +
            ' walkOut=' + prefix.map(hopKey).join(' ') + ' endTile=' + endPos.x + ',' + endPos.y +
            ' entryHopTimeE=true shadowDayEndE=false');
        } else {
          console.log('A-RUN-REJECTED seed=' + sInst.seed + ' days=' + run.map((r) => r.day).join(',') +
            ' reason=no-haven-prefix-walk-out-all-pass');
        }
      } else {
        const first = run[0];
        episodes.push({ seed: sInst.seed, shape: 'C', days: run.map((r) => r.day),
          veto: hopKey(first.veto), shadowEndKcal: (first.sDay.end || {}).kcal });
        console.log('EPISODE-C seed=' + sInst.seed + ' days=' + run.map((r) => r.day).join(',') +
          ' veto=' + hopKey(first.veto) + ' originE=true');
      }
      run = [];
    };
    for (const q of qual) {
      if (run.length && q.day !== run[run.length - 1].day + 1) flush();
      run.push(q);
    }
    flush();
  }
  groupRuns(aQual, 'A');
  groupRuns(cQual, 'C');
}
const aEps = episodes.filter((e) => e.shape === 'A').length;
const cEps = episodes.filter((e) => e.shape === 'C').length;
console.log('EPISODES total=' + episodes.length + ' A=' + aEps + ' C=' + cEps + ' cLooseDays=' + cLooseDays);
console.log('VETO-TOTALS total=' + vetoTotal + ' disagree=' + vetoDisagree +
  ' hopExplains=' + vetoHopExplains + ' agreeFail=' + vetoAgreeFail + ' agreePass=' + vetoAgreePass);
