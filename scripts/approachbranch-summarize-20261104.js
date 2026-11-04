// approachbranch-summarize-20261104.js — aggregate approachbranch pilot
// per-seed JSONs (approachbranch-s<seed>-<run>.json) into the prereg
// guardrail + split table. Pure read of JSONs; never writes.
// Branch split via approachbranch-analyze (gated = policy !==
// 'competent'). Starvation counting matches the confirm summarizer
// (cause string containing 'starv'; player-flagged = player === true).
// Wall numbers are MEASURED from per-seed scale fields, never
// hard-coded. Wave-5 UNLOCKED = seeds with maxWave >= 5 (not faced).
// Usage: node scripts/approachbranch-summarize-20261104.js <per-seed-dir> [run-filter]
// Prints a JSON summary to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const B = require('./approachbranch-analyze-20261104');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const dir = process.argv[2];
  const filter = process.argv[3] || '';
  if (!dir) { console.error('SUMMARIZE STOP: per-seed dir required'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) {
    return f.indexOf('approachbranch-s') === 0 && f.endsWith('.json') && (!filter || f.slice(0, -5).endsWith(filter));
  }).sort();
  const perSeed = [];
  const survDays = [];
  let starvationDeaths = 0, starvationPlayerDeaths = 0;
  let oldLoops = 0, trueLoops = 0, oldSteps = 0, fleeSteps = 0, apprSteps = 0, otherSteps = 0;
  const wall = { wins: 0, national: 0, table: 0, tableWaiting: 0, wave5unlocked: 0,
    wave4kills: 0, scaleMeasured: 0 };
  const standingFinals = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const gated = j.policy !== 'competent';
    let sOld = 0, sFlee = 0, sAppr = 0, sOther = 0, sOldLoops = 0, sTrueLoops = 0, sExp = 0;
    for (const ex of (j.exposures || [])) {
      let r;
      try { r = B.analyzeBranch(ex, { gated: gated }); } catch (e) { continue; }
      sOld += r.oldApproachTurns; sFlee += r.fleeTurns; sAppr += r.approachTurns; sOther += r.otherTurns;
      if (r.oldIsLoop) sOldLoops++;
      if (r.isTrueApproachLoop) sTrueLoops++;
      sExp++;
    }
    let sStarv = 0, sStarvPlayer = 0;
    for (const d of (j.deaths || [])) {
      const c = (d && (d.cause || d.reason || d.kind)) || 'unknown';
      if (String(c).toLowerCase().indexOf('starv') >= 0) {
        sStarv++;
        if (d && d.player === true) sStarvPlayer++;
      }
    }
    starvationDeaths += sStarv; starvationPlayerDeaths += sStarvPlayer;
    oldLoops += sOldLoops; trueLoops += sTrueLoops;
    oldSteps += sOld; fleeSteps += sFlee; apprSteps += sAppr; otherSteps += sOther;
    survDays.push(j.days);
    if (j.won) wall.wins++;
    if (j.nationalReached) wall.national++;
    if (j.tableEntered) wall.table++;
    if (j.tableWaiting) wall.tableWaiting++;
    if ((j.maxWave || 1) >= 5) wall.wave5unlocked++;
    wall.wave4kills += (j.killRows || []).filter(function (r) { return r.linkSeq != null; }).length;
    if (j.scaleReadError == null) wall.scaleMeasured++;
    if (j.standingFinal != null) standingFinals.push(j.standingFinal);
    perSeed.push({ seed: j.seed, run: j.run, policy: j.policy, days: j.days,
      end: j.endReason, exposures: sExp, oldSteps: sOld, fleeSteps: sFlee,
      approachSteps: sAppr, otherSteps: sOther, oldLoops: sOldLoops,
      trueLoops: sTrueLoops, starvationDeaths: sStarv,
      starvationPlayerDeaths: sStarvPlayer, killsLinked: (j.killRows || []).filter(function (r) { return r.linkSeq != null; }).length,
      maxWave: j.maxWave, standingFinal: j.standingFinal, rankFinal: j.scaleRankFinal,
      arcFinal: j.arcFinal, won: !!j.won, nationalReached: !!j.nationalReached,
      tableEntered: !!j.tableEntered });
  }
  const out = { files: files.length, perSeed: perSeed,
    totals: { oldSteps: oldSteps, fleeSteps: fleeSteps, approachSteps: apprSteps,
      otherSteps: otherSteps, oldLoops: oldLoops, trueLoops: trueLoops,
      starvationDeaths: starvationDeaths, starvationPlayerDeaths: starvationPlayerDeaths,
      medianSurvivalDays: median(survDays), survDaysSorted: survDays.slice().sort(function (a, b) { return a - b; }) },
    wall: wall, medianStandingFinal: median(standingFinals) };
  console.log(JSON.stringify(out, null, 2));
}
main();
