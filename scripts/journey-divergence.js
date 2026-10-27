// scripts/journey-divergence.js — JOURNEY-DIVERGENCE report (journey-scale r44).
// Given two run dirs, pair capture files by seed number (filenames differ by
// run label, so pairing is by the -capture-<seed>.txt suffix, not by name)
// and report, per seed: identical-or-not, first differing line (1-based)
// with two lines of context on each side, and total differing positions.
// Usage: node scripts/journey-divergence.js <oldDir> <newDir>
// Exit 0 on a completed report (differences are findings, not errors);
// exit 1 only when a dir is missing or unreadable.
'use strict';
const fs = require('fs');
const path = require('path');
const [oldDir, newDir] = process.argv.slice(2);
if (!oldDir || !newDir) {
  console.log('usage: node scripts/journey-divergence.js <oldDir> <newDir>');
  process.exit(1);
}
function captures(dir) {
  let files;
  try { files = fs.readdirSync(dir); } catch (e) {
    console.log('UNREADABLE DIR: ' + dir + ' (' + (e && e.message) + ')');
    process.exit(1);
  }
  const out = {};
  for (const f of files) {
    const m = f.match(/-capture-(\d+)\.txt$/);
    if (m) out[m[1]] = path.join(dir, f);
  }
  return out;
}
const oldCaps = captures(oldDir);
const newCaps = captures(newDir);
const seeds = [...new Set([...Object.keys(oldCaps), ...Object.keys(newCaps)])].sort((a, b) => +a - +b);
if (!seeds.length) { console.log('no capture files in either dir'); process.exit(1); }
const trunc = (s) => (s === undefined ? '<EOF>' : String(s).slice(0, 200));
for (const seed of seeds) {
  if (!oldCaps[seed]) { console.log(`seed ${seed}: ONLY-IN-NEW (${path.basename(newCaps[seed])})`); continue; }
  if (!newCaps[seed]) { console.log(`seed ${seed}: ONLY-IN-OLD (${path.basename(oldCaps[seed])})`); continue; }
  const a = fs.readFileSync(oldCaps[seed], 'utf8').split('\n');
  const b = fs.readFileSync(newCaps[seed], 'utf8').split('\n');
  const n = Math.max(a.length, b.length);
  let first = null, diffs = 0;
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) { diffs++; if (first === null) first = i; }
  }
  if (first === null) {
    console.log(`seed ${seed}: IDENTICAL (${a.length} lines)`);
    continue;
  }
  console.log(`seed ${seed}: DIVERGES firstDiffLine=${first + 1} diffPositions=${diffs} oldLines=${a.length} newLines=${b.length}`);
  for (let i = Math.max(0, first - 2); i <= Math.min(n - 1, first + 2); i++) {
    const mark = i === first ? '>>' : '  ';
    console.log(`  ${mark} L${i + 1} OLD: ${trunc(a[i])}`);
    console.log(`  ${mark} L${i + 1} NEW: ${trunc(b[i])}`);
  }
}
