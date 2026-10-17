#!/usr/bin/env node
// trickroute-20261017.js — sim-trickroute: routed-via-trick as a distinct
// outcome class (flesh-out loop DIAGNOSTIC, run fleshout-20261017-061313).
// TELEMETRY-ONLY. ZERO src/js changes, ZERO scripts/policies changes, ZERO
// new sims. Post-hoc classifier over the committed sim-trickshape 16-seed
// census (evidence/2026-10-17/perseed-trickshape/*.json).
//
// The trickshape verdict: tricks convert losses into flights; the
// perf->attr gap is kill-attribution blindness to trick-driven
// disengagement. This arm's named next: record trick-driven disengagements
// as a distinct outcome class (routed-via-trick) alongside kill-attribution.
//
// Resolution-window definition (honest — see evidence header):
// trickLogByMid entries are bare kind strings (game.js:30608), so the
// window = the whole fight. Per (fight,mid) row with perfs non-empty:
//   1. killed          species_killed=1
//   2. routed-via-trick species_killed=0 && kill_attributed=0 && result='routed'
//   3. fled            result='fled' (player flight)
//   4. other           everything else
// Precedence in that order. result='routed' is engine-native:
// tbEnd(monstersAlive ? 'routed' : 'won') (game.js:40202) — no monster
// still fighting, at least one alive (fled/driven off).
//
// Read-only by construction: inputs are JSON files already on disk; the
// classifier never writes back. The det-gate (in test-trickroute) verifies
// deep-equal inputs before/after and byte-identical double runs.
'use strict';

const fs = require('fs');
const path = require('path');

const CLASSES = ['killed', 'routed-via-trick', 'fled', 'other'];

// classifyRow(row): one of CLASSES, or null when the row is not a
// trick-resolution row (perfs empty) — null is never "other": callers must
// filter to performed rows first; an unclassifiable PERFORMED row is an
// instrument miss (NO-GO).
function classifyRow(row) {
  if (!row || !row.performed) return null;
  if (row.species_killed === 1) return 'killed';
  if (row.result === 'routed' && row.species_killed === 0 && row.kill_attributed === 0) return 'routed-via-trick';
  if (row.result === 'fled') return 'fled';
  return 'other';
}

// classifyRun(rows): classify every performed row; collect census.
function classifyRun(rows) {
  const out = { rows: [], tally: {}, unclassified: 0, nPerformed: 0 };
  for (const c of CLASSES) out.tally[c] = 0;
  for (const row of rows) {
    if (!row.performed) continue;
    out.nPerformed++;
    const cls = classifyRow(row);
    if (!cls) { out.unclassified++; continue; }
    out.tally[cls]++;
    out.rows.push({
      file: row._file || null, fightSeq: row.fightSeq || null, day: row.day || null,
      seed: row.seed || null, policyId: row.policyId || null,
      mid: row.mid || null, kind: row.kind || null, wave: row.wave || null,
      class: cls, result: row.result || null, species_killed: row.species_killed,
      kill_attributed: row.kill_attributed, n_perfs: row.n_perfs || null,
      rounds: row.rounds, hp_cost: row.hp_cost, p_survived: row.p_survived,
    });
  }
  return out;
}

// rollup(censuses): aggregate across per-seed JSONs.
function rollup(perSeed) {
  const total = { tally: {}, unclassified: 0, nPerformed: 0, rows: [] };
  for (const c of CLASSES) total.tally[c] = 0;
  for (const [file, c] of perSeed) {
    total.nPerformed += c.nPerformed;
    total.unclassified += c.unclassified;
    for (const k of CLASSES) total.tally[k] += c.tally[k];
    total.rows.push(...c.rows.map(r => Object.assign({ seedFile: file }, r)));
  }
  return total;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-trickshape');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const r of (d.rows || [])) r._file = f;
    perSeed.push([f, classifyRun(d.rows || [])]);
  }
  const total = rollup(perSeed);
  const routed = total.rows.filter(r => r.class === 'routed-via-trick');
  const byWave = {}, byKind = {};
  for (const r of routed) {
    byWave[r.wave] = (byWave[r.wave] || 0) + 1;
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
  }
  // Perf->attr gap accounting (trickshape terms): performed rows that were
  // not kill-attributed = routed + other(lost). The new class closes the
  // routed fraction of that gap.
  const notAttr = total.tally['routed-via-trick'] + total.tally['other'] + total.tally['fled'];
  console.log(JSON.stringify({
    files: files.length,
    nPerformed: total.nPerformed,
    unclassified: total.unclassified,
    coverage: total.nPerformed ? (total.nPerformed - total.unclassified) / total.nPerformed : null,
    tally: total.tally,
    routedShare: total.nPerformed ? total.tally['routed-via-trick'] / total.nPerformed : null,
    gapClosure: notAttr ? total.tally['routed-via-trick'] / notAttr : null,
    routedByWave: byWave,
    routedByKind: byKind,
  }, null, 1));
}

if (require.main === module) main();

module.exports = { classifyRow, classifyRun, rollup, CLASSES };
