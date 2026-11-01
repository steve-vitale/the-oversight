#!/usr/bin/env node
// analyze-depositkeep-b.js — per-seed summaries for the depositkeep census.
// (sim-depositkeep-b; prereg: evidence/2026-11-01/sim-depositkeep-b-prereg.md.)
//
// Reads a .jsonl file of depositkeep-b-driver records (one JSON object per
// seed) and prints one JSON object to stdout: { band, seeds: [...] }.
// No file writes (stdout only, so the EPERM flap cannot corrupt output).
// Judged count rule = scholaraway rule (Game.over false at entry), for
// apples-to-apples comparison with the cited 0/8 baseline. A sensitivity
// count excluding stack-flagged endDay calls is reported alongside, never
// substituted for the judged count.
//
// Usage: node scripts/analyze-depositkeep-b.js <file.jsonl>
'use strict';
const fs = require('fs');

function sum(xs) { return xs.reduce((a, b) => a + b, 0); }

function sayCount(lines, re) {
  let n = 0;
  for (const s of lines || []) { if (re.test(s.line || '')) n++; }
  return n;
}

function analyzeSeed(rec) {
  const homecomings = rec.homecomings || [];
  const deposits = rec.deposits || [];
  const donates = rec.donates || [];
  const evenings = rec.evenings || [];
  const sayLines = rec.sayLines || [];
  const live = homecomings.filter((h) => !h.overAtEntry);
  const deathPath = homecomings.filter((h) => h.overAtEntry);
  const liveEndDayFlagged = live.filter((h) => /endDay/.test(h.stack || ''));
  const liveClean = live.filter((h) => !/endDay/.test(h.stack || ''));
  const unloadTotal = sum(live.map((h) => h.unloadKcal || 0));
  const unloadTotalClean = sum(liveClean.map((h) => h.unloadKcal || 0));
  const depositUnloadTotal = sum(deposits.filter((d) => d.kind === 'unload').map((d) => d.kcal || 0));
  const donateTotal = sum(donates.map((d) => d.donateKcal || 0));
  const depositDonateTotal = sum(deposits.filter((d) => d.kind === 'donate').map((d) => d.kcal || 0));
  const returnsWithUnload = live.filter((h) => (h.unloadKcal || 0) > 0).length;
  const finishedPacks = live.map((h) => (h.packBefore && h.packBefore.finishedKcal) || 0);
  const totalPacks = live.map((h) => (h.packBefore && h.packBefore.totalKcal) || 0);
  const gateEngagedTrue = live.filter((h) => h.gateEngagedAtEntry === 1 || h.gateEngagedAtExit === 1).length;
  // Pack composition aggregate across live returns (finished kcal seen).
  const comp = {};
  for (const h of live) {
    for (const it of ((h.packBefore || {}).items || [])) {
      const k = it.name || '(unnamed)';
      comp[k] = comp[k] || { name: k, returnsSeen: 0, unitsSeen: 0, finishedKcalSeen: 0, unprocessedSeen: 0 };
      comp[k].returnsSeen++;
      comp[k].unitsSeen += it.units || 0;
      if (it.finished) comp[k].finishedKcalSeen += it.kcal || 0;
      if (it.unprocessed) comp[k].unprocessedSeen += it.units || 0;
    }
  }
  const topItems = Object.values(comp).sort((a, b) => b.finishedKcalSeen - a.finishedKcalSeen).slice(0, 12);
  const havenEvenings = evenings.filter((e) => e.snap && e.snap.onTile).length;
  const atHavenEvenings = evenings.filter((e) => e.snap && e.snap.atHaven).length;
  const completeCapture = evenings.length > 0 && evenings.every((e) => e.snap &&
    e.snap.px != null && e.snap.py != null && e.snap.hx != null && e.snap.hy != null &&
    e.snap.atHaven != null) && live.every((h) => h.packBefore && h.packBefore.finishedKcal != null);
  const returns = live.map((h) => ({
    loopDay: h.loopDay, day: h.day,
    finishedKcal: (h.packBefore && h.packBefore.finishedKcal) || 0,
    totalKcal: (h.packBefore && h.packBefore.totalKcal) || 0,
    unloadKcal: h.unloadKcal || 0,
    gateEngaged: (h.gateEngagedAtEntry === 1 || h.gateEngagedAtExit === 1) ? 1 : 0,
    endDayFlagged: /endDay/.test(h.stack || '') ? 1 : 0,
    packAfterFinishedKcal: (h.packAfter && h.packAfter.finishedKcal) || 0,
  }));
  return {
    seed: rec.seed, arm: rec.arm || 'depositgate-off',
    endReason: rec.endReason, daysAlive: rec.daysAlive,
    maxWaveUnlocked: rec.maxWaveUnlocked, waveKills: rec.waveKills || {},
    deaths: rec.deaths || [],
    homecomingsLive: live.length, homecomingsDeathPath: deathPath.length,
    homecomingsLiveClean: liveClean.length, homecomingsEndDayFlagged: liveEndDayFlagged.length,
    unloadTotal, unloadTotalClean, depositUnloadTotal,
    returnsWithUnload, returnsWithUnloadClean: liveClean.filter((h) => (h.unloadKcal || 0) > 0).length,
    donateTotal, depositDonateTotal, donateCalls: donates.length,
    maxFinishedPack: finishedPacks.length ? Math.max(...finishedPacks) : 0,
    meanFinishedPack: finishedPacks.length ? Math.round(sum(finishedPacks) / finishedPacks.length) : 0,
    maxTotalPack: totalPacks.length ? Math.max(...totalPacks) : 0,
    gateEngagedTrue,
    havenEvenings, atHavenEvenings,
    unloadSayLines: sayCount(sayLines, /unload \d+ kcal into Haven's pantry/),
    keepSayLines: sayCount(sayLines, /nothing extra for the pantry/),
    pantryCapLines: sayCount(sayLines, /pantry is full/),
    completeCapture,
    topItems,
    returns,
  };
}

// Prereg GO rule (pilot): nonzero unload on >= need of n seeds.
// Confirm uses the same proportion (9/12); the caller passes need.
function goVerdict(seeds, need) {
  const nonzero = seeds.filter((s) => s.unloadTotal > 0).length;
  return { n: seeds.length, need, nonzeroSeeds: nonzero,
    verdict: nonzero >= need ? 'GO' : 'NO-GO' };
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('usage: node scripts/analyze-depositkeep-b.js <file.jsonl>'); process.exit(2); }
  const text = fs.readFileSync(file, 'utf8');
  const recs = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const seeds = recs.map(analyzeSeed);
  const out = { band: 'depositkeep-b', seeds, goPilot: goVerdict(seeds, 6) };
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (require.main === module) main();

module.exports = { analyzeSeed, goVerdict };
