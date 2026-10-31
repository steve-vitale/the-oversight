#!/usr/bin/env node
// analyze-buckettile-b.js — bucket-vs-tile census analyzer (DIAG ONLY).
// Implements the prereg definitions EXACTLY (evidence/2026-10-31/
// sim-buckettile-b-prereg.md). Reads one corpus dir of per-seed JSON
// files (as written by scripts/split-absencehunt-jsonl-b.js) and writes
// a census JSON to <outFile>.
// Usage: node scripts/analyze-buckettile-b.js <corpusDir> <outFile>
//
// Definitions (prereg, in one place):
// - CREEK-TILE evening: evening snap tile 'creek' AND NOT atHaven
//   (absencehunt haven-checked definition) AND NOT onRoad.
// - BUCKET RECORD for that evening: the evening row's `woodcarry`
//   field (ctx._wcLast). bucket null = classification never ran.
// - Gate 1 (definitional): bucket null AND eveningOutcome
//   'out-of-reach' — nighttravel returned before any hop, so
//   woodcarry's travel-refused gate never fired.
// - Gate 2: a classification exists. bucket 'creek' = gate 2-creek;
//   'other-refused' / 'unclassified' = gate 2 with its inputs.
// - UNEXPLAINED: a creek-tile evening in none of the above — e.g.
//   null bucket with an outcome other than 'out-of-reach'. Reported
//   separately, never folded into gate 1.
// Absencehunt class labels are reused unchanged via classifySeed;
// this analyzer adds no class and redefines none.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifySeed } = require('./analyze-absencehunt-b');

function isCreekTileEvening(day) {
  return day.eveningTile === 'creek' && day.eveningAway && !day.onRoad;
}

// Pure gate judge over one creek-tile evening's recorded fields.
// `day` is a classifySeed day row; `eve` is the raw evening row
// (carries woodcarry + eveningOutcome). Returns { gate, detail }.
function classifyBucketEvening(day, eve) {
  const wc = (eve && eve.woodcarry) || null;
  const bucket = wc ? (wc.bucket === undefined ? null : wc.bucket) : null;
  const outcome = (eve && eve.eveningOutcome) || day.eveningOutcome || null;
  const cls = (wc && wc.classification) || null;
  const detail = {
    loopDay: day.loopDay,
    class: day.class,
    eveningOutcome: outcome,
    bucket,
    hopReturnKind: wc ? (wc.hopReturnKind || null) : null,
    blockType: cls ? (cls.blockType || null) : null,
    probeAgrees: cls ? (cls.probeAgrees ?? null) : null,
    probeError: cls ? (cls.probeError || null) : null,
    isCreek: cls ? (cls.isCreek ?? null) : null,
    blockedTile: cls ? (cls.blockedTile || null) : null,
    bridgeAttempted: wc && wc.bridge ? !!wc.bridge.attempted : null,
    bridgeSkip: wc && wc.bridge ? (wc.bridge.skip || null) : null,
    rescued: wc ? !!wc.rescued : null,
    eveningMap: day.eveningMap || null,
  };
  if (bucket === 'creek') return { gate: 'gate2-creek', detail };
  if (bucket === 'other-refused') return { gate: 'gate2-other', detail };
  if (bucket === 'unclassified') return { gate: 'gate2-unclassified', detail };
  if (bucket === null && outcome === 'out-of-reach') return { gate: 'gate1', detail };
  return { gate: 'unexplained', detail };
}

function classifySeedBucket(inst) {
  const base = classifySeed(inst);
  const evenings = inst.evenings || [];
  const byLoopDay = new Map();
  for (const e of evenings) byLoopDay.set(e.loopDay, e);
  const creekEvenings = [];
  for (const day of base.days) {
    if (!isCreekTileEvening(day)) continue;
    const eve = byLoopDay.get(day.loopDay) || {};
    const { gate, detail } = classifyBucketEvening(day, eve);
    creekEvenings.push({ gate, ...detail });
  }
  const count = (g) => creekEvenings.filter((e) => e.gate === g).length;
  const store = inst.woodcarryStore || null;
  return {
    seed: inst.seed,
    policy: inst.policy,
    horizonDays: inst.horizonDays || inst.days || null,
    daysAlive: inst.daysAlive ?? null,
    endReason: inst.endReason || null,
    errCount: inst.errCount ?? null,
    loopDays: base.loopDays,
    genuine: base.genuine,
    genuineDays: base.genuineDays,
    rawCreekEvenings: base.rawCreekEvenings,
    rawCreekDays: base.rawCreekDays,
    havenCheckedCreekEvenings: base.havenCheckedCreekEvenings,
    unexplainedAwayMornings: base.unexplainedAwayMornings,
    creekTileEvenings: creekEvenings.length,
    creekTileDays: creekEvenings.map((e) => e.loopDay),
    gate1: count('gate1'),
    gate1Days: creekEvenings.filter((e) => e.gate === 'gate1').map((e) => e.loopDay),
    gate2Creek: count('gate2-creek'),
    gate2Other: count('gate2-other'),
    gate2Unclassified: count('gate2-unclassified'),
    unexplained: count('unexplained'),
    unexplainedDays: creekEvenings.filter((e) => e.gate === 'unexplained').map((e) => e.loopDay),
    bucketExplained: creekEvenings.length - count('unexplained'),
    storeRecords: store ? (store.records ?? null) : null,
    storeClassified: store ? (store.classified ?? null) : null,
    storeUnclassified: store ? (store.unclassified ?? null) : null,
    storeOtherRefused: store ? (store.otherRefused ?? null) : null,
    storeErrs: store ? (store.errs ?? null) : null,
    creekEvenings,
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(classifySeedBucket(inst));
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    totalCreekTileEvenings: sum('creekTileEvenings'),
    totalGate1: sum('gate1'),
    totalGate2Creek: sum('gate2Creek'),
    totalGate2Other: sum('gate2Other'),
    totalGate2Unclassified: sum('gate2Unclassified'),
    totalUnexplained: sum('unexplained'),
    totalBucketExplained: sum('bucketExplained'),
    totalRawCreekEvenings: sum('rawCreekEvenings'),
    totalHavenCheckedCreekEvenings: sum('havenCheckedCreekEvenings'),
    totalGenuine: sum('genuine'),
    totalErrs: sum('errCount'),
    seedsWithCreekTile: perSeed.filter((s) => s.creekTileEvenings > 0).map((s) => s.seed),
    seedsWithUnexplained: perSeed.filter((s) => s.unexplained > 0).map((s) => s.seed),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-buckettile-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' creekTile=' + census.totalCreekTileEvenings + ' gate1=' + census.totalGate1 +
    ' gate2creek=' + census.totalGate2Creek + ' gate2other=' + census.totalGate2Other +
    ' gate2unclass=' + census.totalGate2Unclassified + ' unexplained=' + census.totalUnexplained +
    ' rawCreek=' + census.totalRawCreekEvenings + ' checkedCreek=' + census.totalHavenCheckedCreekEvenings +
    ' genuine=' + census.totalGenuine + ' errs=' + census.totalErrs);
}

module.exports = { isCreekTileEvening, classifyBucketEvening, classifySeedBucket, analyzeDir };
