#!/usr/bin/env node
// analyze-detourgeo-b.js — aggregate sim-detourgeo-b constructed
// evenings + natural sweep, and judge per-branch bars from the
// prereg (evidence/2026-10-29/sim-detourgeo-b-prereg.md +
// Amendment A). Prints a human table and writes JSON with --out.
// Exit 0 when aggregation is complete (verdicts are data).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const corpusDir = arg('corpus', null);
const outFile = arg('out', null);
if (!corpusDir) { console.error('usage: --corpus <dir> [--out <file>]'); process.exit(2); }

const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
const rows = [];
for (const f of files) {
  try { rows.push(JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'))); }
  catch (e) { console.error('skip unreadable ' + f + ': ' + e.message); }
}
// Constructed batteries carry .tracks; natural-sweep legs are
// eveningdetour corpora (handled by analyze-eveningdetour-b.js
// separately) — here we aggregate only battery files.
const batteries = rows.filter((r) => r && r.tracks);
const summary = { batterySeeds: [], nopath: [], stoppedCombat: [], stoppedStepRefused: [],
  rescued: [], stepRefusedSteps: 0, combatSteps: 0, totalDetourSteps: 0,
  gateOffControls: [], guardProblems: [] };
for (const b of batteries) {
  summary.batterySeeds.push(b.seed);
  const t = b.tracks;
  const nOn = t.N && t.N.gateOn;
  const nOff = t.N && t.N.gateOff;
  if (nOn && nOn.staged) {
    const rec = { seed: b.seed, outcome: nOn.outcome, reason: nOn.stoppedReason,
      path: nOn.detourPath, steps: nOn.detourSteps,
      posBefore: nOn.posBefore, posAfter: nOn.posAfter, guards: nOn.guards,
      sayTail: nOn.sayTail };
    if (nOn.outcome === 'detour-nopath') summary.nopath.push(rec);
    else if (nOn.outcome === 'detour-stopped') {
      if (nOn.stoppedReason === 'combat') summary.stoppedCombat.push(rec);
      else if (nOn.stoppedReason === 'step-refused') summary.stoppedStepRefused.push(rec);
    } else if (nOn.outcome === 'completed' || nOn.outcome === 'already-inside') summary.rescued.push({ seed: b.seed, track: 'N', path: nOn.detourPath });
  }
  if (nOff) summary.gateOffControls.push({ seed: b.seed, outcome: nOff.outcome, attempted: nOff.detourAttempted });
  for (const k of ['C1_monsterOnPath', 'C2_wandererOnPath', 'C3_busyWorld']) {
    const r = t[k];
    if (!r || !r.staged) continue;
    if (r.outcome === 'detour-stopped' && r.stoppedReason === 'combat') summary.stoppedCombat.push({ seed: b.seed, track: k, reason: r.stoppedReason, path: r.detourPath, steps: r.detourSteps, posBefore: r.posBefore, posAfter: r.posAfter, guards: r.guards, sayTail: r.sayTail });
    else if (r.outcome === 'detour-stopped' && r.stoppedReason === 'step-refused') summary.stoppedStepRefused.push({ seed: b.seed, track: k, reason: r.stoppedReason, path: r.detourPath, steps: r.detourSteps, posBefore: r.posBefore, posAfter: r.posAfter, guards: r.guards, sayTail: r.sayTail });
    else if (r.outcome === 'completed' || r.outcome === 'already-inside') summary.rescued.push({ seed: b.seed, track: k, path: r.detourPath });
    if (Array.isArray(r.detourSteps)) {
      for (const s of r.detourSteps) {
        summary.totalDetourSteps++;
        if (s.combatLive) summary.combatSteps++;
        if (!s.moved) summary.stepRefusedSteps++;
      }
    }
  }
  if (Array.isArray(b.guardProblems)) for (const p of b.guardProblems) summary.guardProblems.push({ seed: b.seed, problem: p });
  if (b.batteryOk === false) summary.guardProblems.push({ seed: b.seed, problem: 'batteryOk false' });
}
summary.counts = {
  batterySeeds: summary.batterySeeds.length,
  nopathFirings: summary.nopath.length,
  stoppedCombatFirings: summary.stoppedCombat.length,
  stoppedStepRefusedFirings: summary.stoppedStepRefused.length,
  rescuedEvenings: summary.rescued.length,
  totalDetourSteps: summary.totalDetourSteps,
  combatSteps: summary.combatSteps,
  stepRefusedSteps: summary.stepRefusedSteps,
  gateOffControls: summary.gateOffControls.length,
  gateOffClean: summary.gateOffControls.filter((c) => c.outcome === 'travel-refused' && !c.attempted).length,
  guardProblems: summary.guardProblems.length,
};
console.log('sim-detourgeo-b constructed battery aggregation');
console.log('battery seeds: ' + summary.batterySeeds.join(', '));
console.log('nopath firings: ' + summary.counts.nopathFirings);
console.log('stopped/combat firings: ' + summary.counts.stoppedCombatFirings);
console.log('stopped/step-refused firings: ' + summary.counts.stoppedStepRefusedFirings);
console.log('rescued evenings (C-track + N-track): ' + summary.counts.rescuedEvenings);
console.log('detour steps total/combat/refused: ' + summary.counts.totalDetourSteps + '/' + summary.counts.combatSteps + '/' + summary.counts.stepRefusedSteps);
console.log('gate-OFF controls clean: ' + summary.counts.gateOffClean + '/' + summary.counts.gateOffControls);
console.log('guard problems: ' + summary.counts.guardProblems);
for (const r of summary.nopath) console.log('  NOPATH seed ' + r.seed + ' pos ' + r.posBefore.mapPx + ',' + r.posBefore.mapPy + ' -> ' + r.posAfter.mapPx + ',' + r.posAfter.mapPy + ' guards ' + JSON.stringify(r.guards));
for (const r of summary.stoppedCombat) console.log('  STOPPED/COMBAT seed ' + r.seed + ' ' + (r.track || 'N') + ' path ' + JSON.stringify(r.path));
for (const r of summary.stoppedStepRefused) console.log('  STOPPED/STEP-REFUSED seed ' + r.seed + ' ' + (r.track || 'N') + ' path ' + JSON.stringify(r.path));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
