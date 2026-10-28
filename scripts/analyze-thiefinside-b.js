#!/usr/bin/env node
// analyze-thiefinside-b.js — go-inside-then-tap evening analysis
// (sim-thiefinside-b; prereg:
// evidence/2026-10-28/sim-thiefinside-b-prereg.md).
//
// Reads evidence/2026-10-28/sim-thiefinside-b-corpus/ (8 instances,
// seeds 10040-10047, thief.steal_pantry only) and publishes the
// evening/outcome table the prereg's primary metric requires: per
// seed, whether at least one tap day completed the evening AND
// issued a genuine thief tap from the inside position (access
// 'inside' at tap time), with that tap's outcome recorded; plus
// the blocking-step enumeration for every non-inside tap day.
// Entry rows are labelled button-handler-equivalent in the
// corpus (see prereg played-vs-instrumented disclosure); this
// analyzer counts only, never re-labels them as DOM-played.
// Usage: node scripts/analyze-thiefinside-b.js [corpusDir]
// Output: human table on stdout, then a JSON block after JSON-BEGIN.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefinside-b-corpus');
const HALL_CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefhall-b-corpus');

function gateOfPre(row) {
  if (row.exiledBefore) return 'none';
  if (row.insideHavenBefore && row.tileTypeBefore === 'haven') return 'inside';
  if ((row.integrationStageBefore || 0) >= 3) return 'remote';
  return 'none';
}
function gateOfAtTap(row) {
  if (row.exiledAtTap) return 'none';
  if (row.insideHavenAtTap && row.tileTypeAtTap === 'haven') return 'inside';
  if ((row.integrationStageAtTap || 0) >= 3) return 'remote';
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
  const byEvening = {};
  for (const t of taps) byEvening[String(t.eveningOutcome)] = (byEvening[String(t.eveningOutcome)] || 0) + 1;
  const byEntryMethod = {};
  for (const t of taps) if (t.entryMethod) byEntryMethod[t.entryMethod] = (byEntryMethod[t.entryMethod] || 0) + 1;
  const attempted = taps.filter((t) => t.outcome === 'attempted');
  const insideTaps = attempted.filter((t) => t.accessAtTap === 'inside');
  const insideByClass = {};
  for (const t of insideTaps) insideByClass[String(t.tapOutcomeClass)] = (insideByClass[String(t.tapOutcomeClass)] || 0) + 1;
  const nonInsideAttempted = attempted.filter((t) => t.accessAtTap !== 'inside');
  const walkSteps = taps.filter((t) => t.walkTarget).map((t) => t.walkTarget.steps);
  const walkKcal = taps.filter((t) => typeof t.walkKcalBefore === 'number' && typeof t.walkKcalAfter === 'number')
    .map((t) => t.walkKcalAfter - t.walkKcalBefore);
  const avg = (a) => a.length ? (a.reduce((s, x) => s + x, 0) / a.length) : null;
  const insideTick = insideTaps.map((t) => (t.dayTicksAfter - t.dayTicksBefore));
  const insideKcal = insideTaps.map((t) => (t.kcalAfter - t.kcalBefore));
  const gateMismatchPre = taps.filter((t) => typeof t.accessBefore === 'string' && gateOfPre(t) !== t.accessBefore);
  const gateMismatchAtTap = attempted.filter((t) => gateOfAtTap(t) !== t.accessAtTap);
  const perSeed = {};
  for (const inst of instances) {
    const itaps = (inst.taps || []);
    const inside = itaps.filter((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
    perSeed[inst.seed] = {
      endReason: inst.endReason, grantOk: inst.grantOk,
      taps: itaps.length,
      eveningOutcomes: itaps.map((t) => t.eveningOutcome),
      entryMethods: itaps.map((t) => t.entryMethod || null),
      insideTaps: inside.length,
      insideClasses: inside.map((t) => t.tapOutcomeClass),
      seedSuccess: inside.length >= 1,
      awayDays: itaps.filter((t) => t.eveningOutcome === 'not-attempted-away').length,
      maps: [...new Set(itaps.map((t) => t.mapPxBefore + ',' + t.mapPyBefore))],
    };
  }
  const seedSuccessCount = Object.values(perSeed).filter((s) => s.seedSuccess).length;
  // Determinism check vs thiefhall corpus: the FIRST tap day's
  // pre-evening state must be identical (same substrate, same
  // seeds, evening not yet run on that day).
  let determinism = null;
  try {
    const hallFiles = fs.readdirSync(HALL_CORPUS).filter((f) => f.endsWith('.json')).sort();
    const hallBySeed = {};
    for (const f of hallFiles) {
      const j = JSON.parse(fs.readFileSync(path.join(HALL_CORPUS, f), 'utf8'));
      hallBySeed[j.seed] = (j.taps || [])[0];
    }
    const rows = [];
    for (const inst of instances) {
      const first = (inst.taps || [])[0];
      const h = hallBySeed[inst.seed];
      const fields = ['mapPxBefore', 'mapPyBefore', 'mxBefore', 'myBefore', 'kcalBefore', 'dayTicksBefore', 'accessBefore', 'tileTypeBefore'];
      const mism = h ? fields.filter((k) => first[k] !== h[k]) : ['no-hall-corpus-row'];
      rows.push({ seed: inst.seed, mismatches: mism });
    }
    determinism = { rows, allMatch: rows.every((r) => r.mismatches.length === 0) };
  } catch (e) { determinism = { error: String(e && e.message) }; }
  const out = {
    corpusFiles: files.length, instances: instances.length, tapDays: taps.length,
    byOutcome, byEvening, byEntryMethod,
    attempted: attempted.length,
    insideTaps: insideTaps.length, insideByClass,
    nonInsideAttempted: nonInsideAttempted.length,
    seedSuccessCount, seedsTotal: instances.length,
    perSeed,
    walk: { n: walkSteps.length, stepsMin: walkSteps.length ? Math.min(...walkSteps) : null,
      stepsMax: walkSteps.length ? Math.max(...walkSteps) : null, stepsMean: avg(walkSteps),
      kcalDeltaMean: avg(walkKcal), kcalDeltaMin: walkKcal.length ? Math.min(...walkKcal) : null,
      kcalDeltaMax: walkKcal.length ? Math.max(...walkKcal) : null },
    insideTapDeltas: { tickMean: avg(insideTick), tickValues: [...new Set(insideTick)],
      kcalMean: avg(insideKcal), kcalValues: [...new Set(insideKcal)] },
    gateMismatchPre: gateMismatchPre.length,
    gateMismatchPreRows: gateMismatchPre.map((t) => ({ seed: t.seed, tapDay: t.tapDay })),
    gateMismatchAtTap: gateMismatchAtTap.length,
    gateMismatchAtTapRows: gateMismatchAtTap.map((t) => ({ seed: t.seed, tapDay: t.tapDay })),
    accessBeforeValues: [...new Set(taps.map((t) => t.accessBefore))],
    accessAtTapValues: [...new Set(attempted.map((t) => t.accessAtTap))],
    determinism,
    verdictGO: seedSuccessCount >= 6 && insideTaps.length > 0 &&
      insideTaps.every((t) => t.accessAtTap === 'inside' && typeof t.tapOutcomeClass === 'string'),
  };
  console.log('THIEFINSIDE EVENING TABLE');
  console.log('instances ' + out.instances + ' tapDays ' + out.tapDays + ' byOutcome ' + JSON.stringify(byOutcome));
  console.log('byEvening ' + JSON.stringify(byEvening) + ' byEntry ' + JSON.stringify(byEntryMethod));
  console.log('attempted ' + attempted.length + ' insideTaps ' + insideTaps.length + ' insideByClass ' + JSON.stringify(insideByClass));
  console.log('seedSuccess ' + seedSuccessCount + '/' + instances.length + ' verdictGO ' + out.verdictGO);
  console.log('walk n=' + out.walk.n + ' steps ' + out.walk.stepsMin + '-' + out.walk.stepsMax + ' kcalDeltaMean ' + out.walk.kcalDeltaMean);
  console.log('gateMismatchPre ' + out.gateMismatchPre + ' gateMismatchAtTap ' + out.gateMismatchAtTap);
  console.log('determinism allMatch ' + (determinism && determinism.allMatch));
  console.log('JSON-BEGIN');
  console.log(JSON.stringify(out, null, 1));
  return out;
}

if (require.main === module) main();
module.exports = { main, gateOfPre, gateOfAtTap };
