#!/usr/bin/env node
// analyze-packcomp-b.js — pack-composition census analyzer (DIAG ONLY).
// sim-packcomp-b; prereg evidence/2026-11-01/sim-packcomp-b-prereg.md.
// Reads packcomp-b-driver JSONL (file arg or stdin), judges NOTHING on
// its own: it computes the prereg's per-return counterfactuals via
// packcomp-b-count.js and prints a per-seed summary + the verdict inputs
// (would-unload per channel, zero-seed flips). The GO/NO-GO verdict is
// stated in the evidence file against the prereg bar, not here.
'use strict';
const fs = require('fs');
const { countReturn } = require('./packcomp-b-count');

function isLiveReturn(r) { return r && r.overAtEntry === false; }
function isEndDayFlagged(r) {
  return !!(r && r.stack && /endDay/.test(r.stack));
}
function pantryCapLine(lines) {
  return (lines || []).some((l) => /pantry is full|cap/i.test(l));
}

function analyzeSeed(inst) {
  const live = (inst.homecomings || []).filter(isLiveReturn);
  const flagged = live.filter(isEndDayFlagged).length;
  let unloadTotal = 0, donateTotal = 0;
  for (const d of (inst.deposits || [])) {
    if (d.kind === 'unload') unloadTotal += d.kcal;
    if (d.kind === 'donate') donateTotal += d.kcal;
  }
  let gateTrue = 0, completeCapture = true;
  const returns = [];
  for (const r of live) {
    if (r.gateEngagedAtEntry) gateTrue++;
    if (r.gateEngagedAtExit) gateTrue++;
    const pack = r.packBefore;
    if (!pack || !Array.isArray(pack.items)) { completeCapture = false; continue; }
    const cf = countReturn(pack.items);
    if (cf.incomplete) completeCapture = false;
    for (const it of pack.items) if (it.unprocessed === null) completeCapture = false;
    returns.push({
      loopDay: r.loopDay, day: r.day, unloadKcal: r.unloadKcal || 0,
      finished: cf.finished, unknownValue: cf.unknownValue,
      shelledValue: cf.shelledValue, a: cf.a, b: cf.b, c: cf.c,
      aNoNut: cf.aNoNut, aNoMustCook: cf.aNoMustCook,
      nutUnknownValue: cf.nutUnknownValue,
      mustCookUnknownValue: cf.mustCookUnknownValue,
      residualUnprocKcal: cf.residualUnprocKcal,
      wouldA: cf.wouldA, wouldB: cf.wouldB, wouldC: cf.wouldC,
      incomplete: cf.incomplete, incompleteReasons: cf.incompleteReasons,
      gateEngagedAtEntry: r.gateEngagedAtEntry,
      sayBefore: r.sayBefore, sayAfter: r.sayAfter,
      items: pack.items,
    });
  }
  const maxOf = (f) => returns.reduce((m, r) => Math.max(m, f(r)), 0);
  const countOver = (f) => returns.filter(f).length;
  const s = {
    seed: inst.seed, arm: inst.arm,
    endReason: inst.endReason, daysAlive: inst.daysAlive,
    maxWaveUnlocked: inst.maxWaveUnlocked,
    homecomingsLive: live.length,
    homecomingsEndDayFlagged: flagged,
    unloadTotal, donateTotal,
    returnsWithUnload: returns.filter((r) => r.unloadKcal > 0).length,
    maxFinishedPack: maxOf((r) => r.finished),
    maxUnknownValue: maxOf((r) => r.unknownValue),
    maxShelledValue: maxOf((r) => r.shelledValue),
    maxA: maxOf((r) => r.a), maxB: maxOf((r) => r.b), maxC: maxOf((r) => r.c),
    returnsOver2000A: countOver((r) => r.wouldA),
    returnsOver2000B: countOver((r) => r.wouldB),
    returnsOver2000C: countOver((r) => r.wouldC),
    wouldUnloadA: returns.some((r) => r.wouldA),
    wouldUnloadB: returns.some((r) => r.wouldB),
    wouldUnloadC: returns.some((r) => r.wouldC),
    maxResidualUnproc: maxOf((r) => r.residualUnprocKcal),
    gateEngagedTrue: gateTrue,
    completeCapture,
    incompleteReturns: returns.filter((r) => r.incomplete).length,
    returns,
  };
  return s;
}

function main() {
  const arg = process.argv[2];
  const text = arg ? fs.readFileSync(arg, 'utf8') : fs.readFileSync(0, 'utf8');
  const lines = text.split('\n').filter((l) => l.trim());
  const seeds = [];
  for (const line of lines) {
    const inst = JSON.parse(line);
    seeds.push(analyzeSeed(inst));
  }
  const zeroSeeds = [51103, 51104, 51107, 51108];
  const verdict = {
    band: 'packcomp-b',
    seeds: seeds.map((s) => {
      const { returns, ...rest } = s;
      return rest;
    }),
    wouldUnloadCCount: seeds.filter((s) => s.wouldUnloadC).length,
    zeroSeedFlipsC: zeroSeeds.filter((z) => {
      const s = seeds.find((x) => x.seed === z);
      return s && s.wouldUnloadC;
    }),
    zeroSeedFlipsA: zeroSeeds.filter((z) => {
      const s = seeds.find((x) => x.seed === z);
      return s && s.wouldUnloadA;
    }),
    zeroSeedFlipsB: zeroSeeds.filter((z) => {
      const s = seeds.find((x) => x.seed === z);
      return s && s.wouldUnloadB;
    }),
  };
  // Full per-return data (with items) lands in the census file via --full.
  if (process.argv.includes('--full')) {
    console.log(JSON.stringify({ verdict, seeds }, null, 1));
  } else {
    console.log(JSON.stringify(verdict, null, 1));
  }
  for (const s of seeds) {
    console.error(
      'seed=' + s.seed + ' end=' + s.endReason + ' days=' + s.daysAlive +
      ' wave=' + s.maxWaveUnlocked + ' live=' + s.homecomingsLive +
      ' unload=' + s.unloadTotal + ' maxFin=' + s.maxFinishedPack +
      ' maxUnk=' + s.maxUnknownValue + ' maxShell=' + s.maxShelledValue +
      ' maxA=' + s.maxA + ' maxB=' + s.maxB + ' maxC=' + s.maxC +
      ' overA=' + s.returnsOver2000A + ' overB=' + s.returnsOver2000B +
      ' overC=' + s.returnsOver2000C + ' gateTrue=' + s.gateEngagedTrue +
      ' complete=' + s.completeCapture);
  }
  console.error('wouldUnloadC seeds: ' + verdict.wouldUnloadCCount + '/8; zero-seed flips (c): ' +
    verdict.zeroSeedFlipsC.join(',') + '; (a): ' + verdict.zeroSeedFlipsA.join(',') +
    '; (b): ' + verdict.zeroSeedFlipsB.join(','));
}

if (require.main === module) main();
module.exports = { analyzeSeed, countReturn };
