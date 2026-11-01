#!/usr/bin/env node
// muster3-split-20261101.js — sim-muster3-a IDLE SPLITTER (no game load).
//
// Reads a stdout file produced by a stdout-runner (screen or sweep or
// replay) and writes the corpus files. This process never loads the
// game, so its file writes are not subject to the frozen-clock write
// problem. Run in a FOREGROUND exec with stdout→file + stderr→file,
// never a backgrounded pipe.
//
// Modes:
//   node scripts/muster3-split-20261101.js screen <stdoutfile>
//     -> evidence/2026-11-01/perseed-muster3/screen-90101-90140.json
//        (rows + mechanical selection via muster3-screen selectBand)
//   node scripts/muster3-split-20261101.js sweep <stdoutfile>
//     -> evidence/2026-11-01/perseed-muster3/leadfeast/s<seed>.json
//        (one file per {"seed","out"} line; refuses on duplicate seed
//        or on a line that is not a sweep record)
//   node scripts/muster3-split-20261101.js replay <stdoutfile> <seed>
//     -> evidence/2026-11-01/perseed-muster3/replay-<seed>-postblock.json
//        (the single {"replay": {...}} line)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-01', 'perseed-muster3');

function readLines(fp) {
  return fs.readFileSync(fp, 'utf8').split('\n').filter(l => l.trim().length);
}

const mode = process.argv[2];
const infile = process.argv[3];
if (!mode || !infile) { console.error('usage: muster3-split-20261101.js <screen|sweep|replay> <stdoutfile> [seed]'); process.exit(2); }

if (mode === 'screen') {
  const { selectBand } = require('./muster3-screen-20261101');
  let anchor = 'unknown';
  try { anchor = require('child_process').execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  const rows = readLines(infile).map(l => JSON.parse(l));
  rows.sort((a, b) => a.seed - b.seed);
  const sel = selectBand(rows);
  const out = { instrument: 'muster3-screen (longevity only, no recorders)', anchorCommit: anchor, rows, selection: sel };
  fs.mkdirSync(DIR, { recursive: true });
  const fp = path.join(DIR, 'screen-90101-90140.json');
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  console.log(`screen rows=${rows.length} tierCounts=${JSON.stringify(sel.tierCounts)}`);
  console.log(`pilot=${sel.pilot.join(',')}`);
  console.log(`confirm=${sel.confirm.join(',')}`);
  console.log(`wrote ${fp}`);
} else if (mode === 'sweep') {
  const dest = path.join(DIR, 'leadfeast');
  fs.mkdirSync(dest, { recursive: true });
  const seen = new Set();
  let n = 0;
  for (const line of readLines(infile)) {
    const rec = JSON.parse(line);
    if (rec.seed == null || !rec.out || rec.out.seed !== rec.seed) {
      console.error('SPLIT STOP: line is not a sweep record: ' + line.slice(0, 200));
      process.exit(2);
    }
    if (seen.has(rec.seed)) { console.error('SPLIT STOP: duplicate seed ' + rec.seed); process.exit(2); }
    seen.add(rec.seed);
    fs.writeFileSync(path.join(dest, `s${rec.seed}.json`), JSON.stringify(rec.out, null, 1) + '\n');
    n++;
  }
  console.log(`sweep split: ${n} per-seed files -> ${dest}`);
} else if (mode === 'replay') {
  const seed = process.argv[4];
  if (!seed) { console.error('replay mode needs a seed arg'); process.exit(2); }
  const lines = readLines(infile).map(l => JSON.parse(l)).filter(r => r.replay);
  if (lines.length !== 1) { console.error(`SPLIT STOP: expected exactly 1 replay record, found ${lines.length}`); process.exit(2); }
  fs.mkdirSync(DIR, { recursive: true });
  const fp = path.join(DIR, `replay-${seed}-postblock.json`);
  fs.writeFileSync(fp, JSON.stringify(lines[0].replay, null, 1) + '\n');
  console.log(`wrote ${fp}`);
} else {
  console.error('unknown mode: ' + mode);
  process.exit(2);
}
