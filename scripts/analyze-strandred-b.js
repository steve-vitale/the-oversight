#!/usr/bin/env node
// analyze-strandred-b.js — creek-evening re-derivation analyzer (DIAG ONLY).
// (sim-strandred-b; prereg: evidence/2026-10-31/sim-strandred-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Reads one absencehunt corpus dir of per-seed JSON files (as written by
// scripts/split-absencehunt-jsonl-b.js) and adds creek-evening counts on
// top of the absencehunt analyzer's classes, WITHOUT redefining any of
// them. The absencehunt analyzer is required verbatim.
//
// Definitions (prereg, exact):
// - creek-tile evening: evening tile 'creek' AND NOT atHaven (endsHaven
//   false) AND NOT onRoad.
// - genuine creek-tile evening: creek-tile evening whose absencehunt
//   class is 'genuine' or 'genuine-end-of-run'.
// - sleep-return creek evening: creek-tile evening with class
//   'sleep-return' (evening at creek, following morning at haven).
// - creek camp: maximal run of >= 2 consecutive loop-days whose evening
//   snaps are creek-tile evenings. A camp is genuine if its FIRST day
//   is genuine-class (the camp-opening night survived to an away
//   morning); continuation evenings inside a camp are
//   'away-continuation' by the absencehunt definition, not genuine.
// - bucket counts (P1 only) are taken straight from the absencehunt
//   census (rawCreekEvenings, havenCheckedCreekEvenings); this script
//   never cites a tile count as a bucket count.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifySeed } = require('./analyze-absencehunt-b');

function isCreekTileEvening(d) {
  return d.eveningTile === 'creek' && !d.endsHaven && !d.onRoad;
}
function isGenuineClass(d) {
  return d.class === 'genuine' || d.class === 'genuine-end-of-run';
}

function classifyCreek(days) {
  const creekTile = days.filter(isCreekTileEvening);
  const genuineCreek = creekTile.filter(isGenuineClass);
  const sleepReturnCreek = creekTile.filter((d) => d.class === 'sleep-return');
  const continuationCreek = creekTile.filter((d) => d.class === 'away-continuation');
  // Camps: maximal runs of consecutive loopDays among creek-tile evenings.
  const camps = [];
  let run = [];
  const flush = () => {
    if (run.length >= 2) {
      camps.push({
        startDay: run[0].loopDay, endDay: run[run.length - 1].loopDay,
        length: run.length, days: run.map((d) => d.loopDay),
        genuine: isGenuineClass(run[0]),
      });
    }
    run = [];
  };
  const sorted = [...creekTile].sort((a, b) => a.loopDay - b.loopDay);
  for (const d of sorted) {
    if (run.length && d.loopDay !== run[run.length - 1].loopDay + 1) flush();
    run.push(d);
  }
  flush();
  return {
    creekTileEvenings: creekTile.length,
    creekTileDays: creekTile.map((d) => d.loopDay),
    genuineCreekTileEvenings: genuineCreek.length,
    genuineCreekTileDays: genuineCreek.map((d) => d.loopDay),
    sleepReturnCreekEvenings: sleepReturnCreek.length,
    sleepReturnCreekDays: sleepReturnCreek.map((d) => d.loopDay),
    continuationCreekEvenings: continuationCreek.length,
    camps,
    genuineCamps: camps.filter((c) => c.genuine),
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    const base = classifySeed(inst);
    const creek = classifyCreek(base.days);
    perSeed.push({
      seed: inst.seed, policy: inst.policy, horizonDays: base.horizonDays,
      daysAlive: base.daysAlive, endReason: base.endReason, errCount: base.errCount,
      genuine: base.genuine, genuineDays: base.genuineDays,
      rawCreekEvenings: base.rawCreekEvenings, rawCreekDays: base.rawCreekDays,
      havenCheckedCreekEvenings: base.havenCheckedCreekEvenings,
      unexplainedAwayMornings: base.unexplainedAwayMornings,
      ...creek,
    });
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    totalCreekTileEvenings: sum('creekTileEvenings'),
    totalGenuineCreekTileEvenings: sum('genuineCreekTileEvenings'),
    seedsWithGenuineCreekTile: perSeed.filter((s) => s.genuineCreekTileEvenings > 0).map((s) => s.seed),
    totalSleepReturnCreekEvenings: sum('sleepReturnCreekEvenings'),
    totalCamps: perSeed.reduce((t, s) => t + s.camps.length, 0),
    totalGenuineCamps: perSeed.reduce((t, s) => t + s.genuineCamps.length, 0),
    totalGenuine: sum('genuine'),
    totalRawCreekEvenings: sum('rawCreekEvenings'),
    totalHavenCheckedCreekEvenings: sum('havenCheckedCreekEvenings'),
    totalErrs: sum('errCount'),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-strandred-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('strandred census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' creekTile=' + census.totalCreekTileEvenings + ' genuineCreekTile=' + census.totalGenuineCreekTileEvenings +
    ' seedsWithGenuineCreekTile=' + JSON.stringify(census.seedsWithGenuineCreekTile) +
    ' sleepReturnCreek=' + census.totalSleepReturnCreekEvenings + ' camps=' + census.totalCamps +
    ' genuineCamps=' + census.totalGenuineCamps + ' rawBucketCreek=' + census.totalRawCreekEvenings +
    ' checkedBucketCreek=' + census.totalHavenCheckedCreekEvenings + ' genuine=' + census.totalGenuine);
}

module.exports = { isCreekTileEvening, isGenuineClass, classifyCreek, analyzeDir };
