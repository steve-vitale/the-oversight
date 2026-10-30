#!/usr/bin/env node
// linkgen-transcript.js — sense transcript re-run (sim-linkgen-a).
// Re-runs one seed+policy with say/sysSay captured, then compares its
// proposal/link/generation event sequences to the silent run's JSON.
// Usage: node scripts/linkgen-transcript.js --seed 76201 --policy leadcourt \
//   --silent evidence/2026-10-30/perseed-linkgen-a-leadcourt/s76201.json \
//   --out evidence/2026-10-30/sim-linkgen-a-transcript-76201.json
// Writes captured link/approach lines + the on-trajectory verdict.
'use strict';
const fs = require('fs');
const path = require('path');
const { runSeed } = require('./linkgen-sweep');

function argVal(name, def) {
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--' + name && i + 1 < argv.length) return argv[i + 1];
    if (argv[i].indexOf('--' + name + '=') === 0) return argv[i].slice(name.length + 3);
  }
  return def;
}

function evSig(row) {
  return {
    proposals: (row.proposals || []).map(function (p) { return p.day + ':' + p.targetId + ':' + p.outcome; }),
    counters: (row.counters || []).map(function (c) { return c.day + ':' + c.targetId + ':' + c.how + ':' + c.retKind; }),
    gens: (row.genEvents || []).map(function (g) { return g.day + ':' + g.villageId + ':' + g.rosterSize; }),
    linksEnd: ((row.final && row.final.links) || []).filter(function (l) { return l.status === 'active'; }).map(function (l) { return l.villageId + ':' + l.trust; }).sort(),
  };
}

async function main() {
  const seed = Number(argVal('seed', '0'));
  const policy = argVal('policy', 'leadcourt');
  const silentPath = argVal('silent', '');
  const out = argVal('out', '');
  if (!seed || !silentPath || !out) { console.error('usage: --seed N --policy P --silent path --out path'); process.exit(2); }
  const silent = JSON.parse(fs.readFileSync(silentPath, 'utf8'));
  const capture = [];
  const row = await runSeed(seed, { days: 200, policy: policy, capture: capture });
  const a = evSig(silent), b = evSig(row);
  const onTrajectory = JSON.stringify(a) === JSON.stringify(b);
  const keep = /link|propos|counter|tribute|smoke|village|trust|bow|decline|knock|door|haven|alliance|covenant/i;
  const lines = capture.filter(function (l) { return keep.test(l); });
  const result = {
    seed: seed, policy: policy, onTrajectory: onTrajectory,
    silentSig: a, transcriptSig: b,
    gameDays: row.gameDays, endReason: row.endReason,
    lineCount: capture.length, keptLines: lines.length, lines: lines,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log('transcript seed ' + seed + ' ' + policy + ': onTrajectory=' + onTrajectory +
    ' lines=' + capture.length + ' kept=' + lines.length);
  if (!onTrajectory) {
    console.log('SILENT: ' + JSON.stringify(a));
    console.log('TRANSCRIPT: ' + JSON.stringify(b));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error('linkgen-transcript FAILED: ' + (e && e.stack || e)); process.exit(1); });
}
