#!/usr/bin/env node
// analyze-thiefhall-b.js — hall-gate access-state analysis
// (sim-thiefhall-b; prereg:
// evidence/2026-10-28/sim-thiefhall-b-prereg.md).
//
// Reads evidence/2026-10-28/sim-thiefhall-b-corpus/ (8 instances,
// seeds 10040-10047, thief.steal_pantry only) and publishes the
// access-state table the prereg's primary metric requires: for
// EVERY played tap day, the havenStoresAccess() value with its
// position / tile / flag / exile / stage components and the tap
// outcome. No game code, no re-scoring: counts only.
// Usage: node scripts/analyze-thiefhall-b.js [corpusDir]
// Output: JSON on stdout (also the human table on stderr? no —
// the table prints to stdout first, then the JSON block).
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefhall-b-corpus');

function gateOf(row) {
  // havenStoresAccess() as read in src/js/game.js:11542-11562:
  // exiled -> 'none'; insideHaven && tile haven -> 'inside';
  // integrationStage >= 3 -> 'remote'; else 'none'.
  // Absent fields (undefined in the trace) are falsy in the gate.
  if (row.exiledBefore) return 'none';
  if (row.insideHavenBefore && row.tileTypeBefore === 'haven') return 'inside';
  if ((row.integrationStageBefore || 0) >= 3) return 'remote';
  return 'none';
}

function main() {
  const files = fs.readdirSync(CORPUS).filter((f) => f.endsWith('.json')).sort();
  const instances = files.map((f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
  const taps = [];
  for (const inst of instances) {
    for (const t of (inst.taps || [])) taps.push({ seed: inst.seed, endReason: inst.endReason, grantOk: inst.grantOk, ...t });
  }
  const count = (fn) => taps.filter(fn).length;
  const byOutcome = {};
  for (const t of taps) byOutcome[t.outcome] = (byOutcome[t.outcome] || 0) + 1;
  const byAccess = {};
  for (const t of taps) byAccess[String(t.accessBefore)] = (byAccess[String(t.accessBefore)] || 0) + 1;
  const byTile = {};
  for (const t of taps) byTile[String(t.tileTypeBefore)] = (byTile[String(t.tileTypeBefore)] || 0) + 1;
  const byInside = {};
  for (const t of taps) byInside[String(t.insideHavenBefore)] = (byInside[String(t.insideHavenBefore)] || 0) + 1;
  const byStage = {};
  for (const t of taps) byStage[String(t.integrationStageBefore)] = (byStage[String(t.integrationStageBefore)] || 0) + 1;
  const cross = {
    havenTileOutside: count((t) => t.tileTypeBefore === 'haven' && t.insideHavenBefore === false),
    havenTileInside: count((t) => t.tileTypeBefore === 'haven' && t.insideHavenBefore === true),
    offTileOutside: count((t) => t.tileTypeBefore !== 'haven' && t.insideHavenBefore === false),
    offTileInside: count((t) => t.tileTypeBefore !== 'haven' && t.insideHavenBefore === true),
    atHavenTrue: count((t) => t.atHavenBefore === true),
    atHavenFalse: count((t) => t.atHavenBefore === false),
  };
  const attempted = taps.filter((t) => t.outcome === 'attempted');
  const hallLine = (t) => (t.sayWindow || []).some((l) => /The pantry is in the hall\. Your hands are not\./.test(l));
  const hallRefused = attempted.filter((t) => t.tapResult === false && hallLine(t));
  const succeeded = attempted.filter((t) => t.tapResult === true);
  const tickDeltas = attempted.map((t) => (t.dayTicksAfter - t.dayTicksBefore));
  const kcalDeltas = attempted.map((t) => (t.kcalAfter - t.kcalBefore));
  const avg = (a) => a.length ? (a.reduce((s, x) => s + x, 0) / a.length) : null;
  const buttonReasons = {};
  for (const t of taps.filter((t) => t.outcome === 'button-refused')) {
    buttonReasons[String(t.buttonWhy)] = (buttonReasons[String(t.buttonWhy)] || 0) + 1;
  }
  const mxmy = {};
  for (const t of taps) {
    const k = t.mxBefore + ',' + t.myBefore;
    mxmy[k] = (mxmy[k] || 0) + 1;
  }
  const gateMismatch = taps.filter((t) => gateOf(t) !== t.accessBefore);
  const pantry = {
    minStacks: Math.min(...taps.map((t) => t.pantryStacksBefore)),
    maxStacks: Math.max(...taps.map((t) => t.pantryStacksBefore)),
    minKcal: Math.min(...taps.map((t) => t.pantryKcalBefore)),
    maxKcal: Math.max(...taps.map((t) => t.pantryKcalBefore)),
    emptyDays: count((t) => (t.pantryStacksBefore || 0) === 0 || (t.pantryKcalBefore || 0) <= 0),
  };
  const perSeed = {};
  for (const inst of instances) {
    perSeed[inst.seed] = {
      endReason: inst.endReason, grantOk: inst.grantOk,
      taps: (inst.taps || []).length,
      attempted: (inst.taps || []).filter((t) => t.outcome === 'attempted').length,
      buttonRefused: (inst.taps || []).filter((t) => t.outcome === 'button-refused').length,
      accessValues: [...new Set((inst.taps || []).map((t) => t.accessBefore))],
      tiles: [...new Set((inst.taps || []).map((t) => t.tileTypeBefore))],
      maps: [...new Set((inst.taps || []).map((t) => t.mapPxBefore + ',' + t.mapPyBefore))],
    };
  }
  const out = {
    corpusFiles: files.length, instances: instances.length, tapDays: taps.length,
    byOutcome, byAccess, byTile, byInside, byStage, cross,
    exiledTrue: count((t) => t.exiledBefore === true),
    exiledAbsent: count((t) => t.exiledBefore === null || t.exiledBefore === undefined),
    systemArrivedAbsent: count((t) => t.systemArrivedBefore === null || t.systemArrivedBefore === undefined),
    ownsThiefTrue: count((t) => t.ownsThiefBefore === true),
    attempted: attempted.length, hallRefused: hallRefused.length, succeeded: succeeded.length,
    attemptedTickDeltaMean: avg(tickDeltas), attemptedTickDeltaMin: Math.min(...tickDeltas), attemptedTickDeltaMax: Math.max(...tickDeltas),
    attemptedKcalDeltaMean: avg(kcalDeltas), attemptedKcalDeltaMin: Math.min(...kcalDeltas), attemptedKcalDeltaMax: Math.max(...kcalDeltas),
    buttonReasons, mxmy, pantry,
    gateMismatch: gateMismatch.length,
    gateMismatchRows: gateMismatch.map((t) => ({ seed: t.seed, tapDay: t.tapDay, accessBefore: t.accessBefore, predicted: gateOf(t) })),
    accessAfterValues: [...new Set(taps.map((t) => t.accessAfter))],
    perSeed,
    exhaustiveNegative: taps.length > 0 && taps.every((t) => t.accessBefore === 'none') && succeeded.length === 0,
  };
  console.log('THIEFHALL ACCESS TABLE');
  console.log('instances ' + out.instances + ' tapDays ' + out.tapDays + ' byOutcome ' + JSON.stringify(byOutcome));
  console.log('accessBefore ' + JSON.stringify(byAccess) + ' tile ' + JSON.stringify(byTile) + ' inside ' + JSON.stringify(byInside) + ' stage ' + JSON.stringify(byStage));
  console.log('cross ' + JSON.stringify(cross));
  console.log('attempted ' + attempted.length + ' hallRefused ' + hallRefused.length + ' succeeded ' + succeeded.length);
  console.log('tickDelta attempted mean/min/max ' + out.attemptedTickDeltaMean + '/' + out.attemptedTickDeltaMin + '/' + out.attemptedTickDeltaMax);
  console.log('kcalDelta attempted mean/min/max ' + out.attemptedKcalDeltaMean + '/' + out.attemptedKcalDeltaMin + '/' + out.attemptedKcalDeltaMax);
  console.log('pantry ' + JSON.stringify(pantry) + ' ownsThief ' + out.ownsThiefTrue + '/' + taps.length);
  console.log('gateMismatch ' + out.gateMismatch + ' exhaustiveNegative ' + out.exhaustiveNegative);
  console.log('JSON-BEGIN');
  console.log(JSON.stringify(out, null, 1));
  return out;
}

if (require.main === module) main();
module.exports = { main, gateOf };
