#!/usr/bin/env node
// analyze-refusedband-b.js — travel-refused band hunt analyzer (DIAG ONLY).
// Implements the prereg definitions EXACTLY (evidence/2026-10-31/
// sim-refusedband-b-prereg.md). Reads one corpus dir of per-seed JSON
// files (as written by scripts/split-absencehunt-jsonl-b.js) and writes
// a census JSON to <outFile>.
// Usage: node scripts/analyze-refusedband-b.js <corpusDir> <outFile>
//
// Definitions (prereg, in one place):
// - TRAVEL-REFUSED evening: evening row with eveningOutcome ===
//   'travel-refused' (ctx._ntLast.outcome from nightStep or a
//   trigger-day wrapper replicating its bookkeeping). 'out-of-reach'
//   is NO attempt and never counts.
// - hopReturnKind: from the evening row's ntTravel, else the
//   woodcarry record, else the creekremedy record (first non-null).
// - Classification source per refused evening: woodcarry (_wcLast)
//   first, else creekremedy (_creekremedyLast) via bucketOf. The
//   source is recorded; the two are never mixed on one evening.
// - Gate-2 agreement: D = refusals with hopReturnKind ===
//   'block:creek'; N = those with bucket 'creek'; agreement = N/D
//   (null when D === 0). Non-creek refusals never enter D.
// - Band bar: >= 5 travel-refused evenings on >= 2 seeds inside
//   this single cell. Cross-cell pooling is reported but never a band.
// - Narration: a refused evening is narrated iff its dayLines
//   contain the engine's block line for its blockType (substring
//   match on the travelTo say text).
'use strict';
const fs = require('fs');
const path = require('path');
const { bucketOf } = require('./policies/creekremedy-diag');

const BLOCK_LINES = {
  creek: 'The creek runs fast here',
  fallen_tree: 'A fallen tree blocks the path',
  rubble: 'Rubble chokes the path',
  washed_out: 'The path is washed out',
};

function hopTypeOf(hopReturnKind) {
  if (typeof hopReturnKind !== 'string') return null;
  const m = /^block:(.+)$/.exec(hopReturnKind);
  return m ? m[1] : null;
}

function blockLineFor(hopReturnKind) {
  const t = hopTypeOf(hopReturnKind);
  return (t && BLOCK_LINES[t]) || 'Something blocks the path';
}

// Pure refusal judge over one evening row. Returns null when the
// evening is not a travel refusal; otherwise the refusal record.
function classifyRefusal(eve) {
  if (!eve || eve.eveningOutcome !== 'travel-refused') return null;
  const wc = eve.woodcarry || null;
  const cr = eve.creekremedy || null;
  const hopReturnKind = (eve.ntTravel && eve.ntTravel.hopReturnKind)
    || (wc && wc.hopReturnKind) || (cr && cr.hopReturnKind) || null;
  let source = 'none', bucket = null, cls = null;
  if (wc) {
    source = 'woodcarry';
    bucket = (wc.bucket === undefined ? null : wc.bucket);
    cls = wc.classification || null;
  } else if (cr) {
    source = 'creekremedy';
    bucket = bucketOf(cr);
    cls = cr;
  }
  const line = blockLineFor(hopReturnKind);
  const narrated = Array.isArray(eve.dayLines) && eve.dayLines.some((l) => typeof l === 'string' && l.includes(line));
  let havenDistance = (eve.ntHavenDistance === undefined ? null : eve.ntHavenDistance);
  if (havenDistance === null && eve.ntBefore && eve.ntBefore.mapPx !== null && eve.ntBefore.mapPx !== undefined
      && eve.havenPx !== null && eve.havenPx !== undefined) {
    havenDistance = Math.abs(eve.ntBefore.mapPx - eve.havenPx) + Math.abs(eve.ntBefore.mapPy - eve.havenPy);
  }
  return {
    loopDay: eve.loopDay,
    eveningMap: (eve.mapPx === undefined || eve.mapPy === undefined) ? null : [eve.mapPx, eve.mapPy],
    tile: eve.tile || null,
    havenDistance,
    hopReturnKind,
    hopType: hopTypeOf(hopReturnKind),
    source, bucket,
    blockType: cls ? (cls.blockType || null) : null,
    probeAgrees: cls ? (cls.probeAgrees ?? null) : null,
    probeError: cls ? (cls.probeError || null) : null,
    isCreek: cls ? (cls.isCreek ?? null) : null,
    blockedTile: cls ? (cls.blockedTile || null) : null,
    narrated,
  };
}

// Instrument gate for one leg (prereg §9): errs 0, decisions ==
// evenings in count, loop-days complete or a game-over with its
// day recorded.
function gateOf(inst) {
  const decisions = Array.isArray(inst.decisions) ? inst.decisions.length : -1;
  const evenings = Array.isArray(inst.evenings) ? inst.evenings.length : -1;
  const complete = (inst.daysAlive === inst.days)
    || (Array.isArray(inst.evenings) && inst.evenings.some((e) => e.gameOver === true));
  const errsOk = (inst.errCount === 0 || inst.errCount === null || inst.errCount === undefined);
  return {
    errsOk, decisions, evenings, countsMatch: decisions === evenings,
    complete, pass: errsOk && decisions === evenings && complete,
  };
}

function classifySeedRefused(inst) {
  const evenings = inst.evenings || [];
  const outcomes = {};
  for (const e of evenings) outcomes[e.eveningOutcome || 'unknown'] = (outcomes[e.eveningOutcome || 'unknown'] || 0) + 1;
  const refusals = [];
  for (const e of evenings) {
    const r = classifyRefusal(e);
    if (r) refusals.push(r);
  }
  const gate = gateOf(inst);
  const wcStore = inst.woodcarryStore || null;
  const crStore = inst.creekremedyStore || null;
  return {
    seed: inst.seed,
    policy: inst.policy,
    horizonDays: inst.days || null,
    daysAlive: inst.daysAlive ?? null,
    endReason: inst.endReason || null,
    errCount: inst.errCount ?? null,
    loopDays: evenings.length,
    gate,
    outcomes,
    eveningsJudged: evenings.length,
    refusals: refusals.length,
    refusalSeeds: refusals.length > 0 ? 1 : 0,
    refusalDays: refusals.map((r) => r.loopDay),
    refusalList: refusals,
    storeRecords: wcStore ? (wcStore.records ?? null) : (crStore ? (crStore.records ?? null) : null),
    storeClassified: wcStore ? (wcStore.classified ?? null) : (crStore ? (crStore.classified ?? null) : null),
    storeUnclassified: wcStore ? (wcStore.unclassified ?? null) : (crStore ? (crStore.unclassified ?? null) : null),
    storeOtherRefused: wcStore ? (wcStore.otherRefused ?? null) : (crStore ? (crStore.otherRefused ?? null) : null),
    storeErrs: wcStore ? (wcStore.errs ?? null) : (crStore ? (crStore.errs ?? null) : null),
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(classifySeedRefused(inst));
  }
  const allRefusals = [];
  for (const s of perSeed) for (const r of (s.refusalList || [])) allRefusals.push({ seed: s.seed, ...r });
  const hopSplit = {};
  for (const r of allRefusals) hopSplit[r.hopReturnKind || 'null'] = (hopSplit[r.hopReturnKind || 'null'] || 0) + 1;
  const bucketSplit = {};
  for (const r of allRefusals) bucketSplit[r.bucket || 'none'] = (bucketSplit[r.bucket || 'none'] || 0) + 1;
  const creekRefusals = allRefusals.filter((r) => r.hopReturnKind === 'block:creek');
  const creekBucketCreek = creekRefusals.filter((r) => r.bucket === 'creek');
  const seedsWithRefusals = perSeed.filter((s) => s.refusals > 0).map((s) => s.seed);
  const totalRefusals = allRefusals.length;
  const bandBar = totalRefusals >= 5 && seedsWithRefusals.length >= 2;
  const outcomeTotals = {};
  for (const s of perSeed) for (const [k, v] of Object.entries(s.outcomes)) outcomeTotals[k] = (outcomeTotals[k] || 0) + v;
  const gateFailures = perSeed.filter((s) => !s.gate.pass).map((s) => s.seed);
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    eveningsJudged: perSeed.reduce((t, s) => t + s.eveningsJudged, 0),
    outcomeTotals,
    totalRefusals,
    seedsWithRefusals,
    bandBar,
    hopSplit,
    bucketSplit,
    blockCreekDenominator: creekRefusals.length,
    blockCreekBucketCreek: creekBucketCreek.length,
    gate2Agreement: creekRefusals.length > 0
      ? (creekBucketCreek.length + '/' + creekRefusals.length) : null,
    gate2AgreementValue: creekRefusals.length > 0
      ? creekBucketCreek.length / creekRefusals.length : null,
    creekRefusals,
    narratedRefusals: allRefusals.filter((r) => r.narrated).length,
    gateFailures,
    gatePass: gateFailures.length === 0,
    allRefusals,
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-refusedband-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' evenings=' + census.eveningsJudged + ' refusals=' + census.totalRefusals +
    ' refusalSeeds=' + census.seedsWithRefusals.length + ' bandBar=' + census.bandBar +
    ' blockCreekD=' + census.blockCreekDenominator + ' gate2=' + census.gate2Agreement +
    ' gatePass=' + census.gatePass);
}

module.exports = { classifyRefusal, gateOf, classifySeedRefused, analyzeDir, hopTypeOf, blockLineFor };
