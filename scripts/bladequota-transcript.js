#!/usr/bin/env node
// bladequota-transcript.js — sense-testing transcript for sim-bladequota-a.
// Re-runs ONE seed (default 76101) with Game.say/sysSay captured into an
// external array (no game-state writes), then checks the captured run's
// peak/final yields against the silent sweep's per-seed JSON for the same
// seed: if they differ, the transcript is off-trajectory and must not be
// quoted. Prints titan/muster/call/council/link/trust lines for reading.
// Usage: node scripts/bladequota-transcript.js [seed] [perSeedJson] [outJson]
'use strict';
const fs = require('fs');
const path = require('path');
const { runSeed } = require('./bladequota-sweep');

async function main() {
  const seed = Number(process.argv[2] || 76101);
  const policy = process.argv[5] || 'competent';
  const refDir = policy === 'leadcourt' ? 'perseed-bladequota-a-leadcourt' : 'perseed-bladequota-a';
  const refPath = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-30', refDir, 's' + seed + '.json');
  const outPath = process.argv[4] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-bladequota-a-transcript-' + policy + '-' + seed + '.json');
  const capture = [];
  const row = await runSeed(seed, { days: 200, capture: capture, policy: policy });
  const ref = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  const onTrajectory = row.peak && ref.peak &&
    row.peak.alliedYield === ref.peak.alliedYield && row.peak.day === ref.peak.day &&
    row.final.alliedYield === ref.final.alliedYield;
  // Wide pattern: titan omen lines must match too — omen0 ("Scouts come
  // back pale...") contains none of titan/muster/herald/call, so scout/
  // sky/lair/omen words are included. No cap: a cap would silently drop
  // late-run (post-day-100) omen lines and fake an absence.
  const pat = /titan|muster|herald|call|committee|council|link|trust|blade|alliance|village.*answer|speaker|scout|sky|lair|\bomen\b/i;
  const lines = capture.filter(function (l) { return pat.test(l); });
  const out = {
    seed: seed, policy: policy, onTrajectory: onTrajectory,
    capturedLines: capture.length, matchedLines: lines.length,
    sweepPeak: ref.peak, transcriptPeak: row.peak,
    sweepFinal: ref.final, transcriptFinal: row.final,
    lines: lines,
  };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('seed ' + seed + ' onTrajectory=' + onTrajectory +
    ' captured=' + capture.length + ' matched=' + lines.length);
  lines.slice(0, 120).forEach(function (l) { console.log('  ' + l.slice(0, 300)); });
  if (!onTrajectory) console.log('WARNING: transcript run is OFF-TRAJECTORY vs the silent sweep; do not quote it as the same run.');
}

main().catch(function (e) { console.error('bladequota-transcript FAILED: ' + (e && e.stack || e)); process.exit(1); });
