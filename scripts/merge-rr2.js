#!/usr/bin/env node
// merge-rr2.js — merge the 8805-8808 sweep rows (/tmp/rr2-*.json) into the
// pilot corpus files (evidence/2026-10-21/perseed-repairrate-b/rr-*.json),
// sorted by seed. The analyzer pairs by index; sorting by seed keeps the
// pairing correct.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-repairrate-b');
// NOTE (2026-10-21): /tmp is wiped by service restarts — the 8805-8808
// inputs live in DIR with the rr2- prefix (worktree-persistent), not /tmp.
const jobs = [
  ['rr-control-leadfeast-repairrate.json', 'rr2-control-leadfeast-repairrate.json'],
  ['rr-armed-leadfeast-repairrate.json', 'rr2-armed-leadfeast-repairrate.json'],
  ['rr-control-belongfeast-repairrate.json', 'rr2-control-belongfeast-repairrate.json'],
  ['rr-armed-belongfeast-repairrate.json', 'rr2-armed-belongfeast-repairrate.json'],
];
for (const [corpusFile, extraFile] of jobs) {
  const cp = path.join(DIR, corpusFile);
  const corpus = JSON.parse(fs.readFileSync(cp, 'utf8'));
  const extra = JSON.parse(fs.readFileSync(path.join(DIR, extraFile), 'utf8'));
  const seen = new Set(corpus.rows.map(r => r.seed));
  for (const r of extra.rows) {
    if (seen.has(r.seed)) { console.error(`FATAL: duplicate seed ${r.seed} in ${corpusFile}`); process.exit(1); }
    corpus.rows.push(r);
    seen.add(r.seed);
  }
  corpus.rows.sort((a, b) => a.seed - b.seed);
  corpus.meta.seeds = corpus.rows.map(r => r.seed);
  // sanity: control and armed must align by seed after sort
  fs.writeFileSync(cp, JSON.stringify(corpus, null, 1));
  console.log(`merged ${corpusFile}: ${corpus.rows.length} rows, seeds ${corpus.meta.seeds.join(',')}`);
}
// cross-check pairing alignment
const cL = JSON.parse(fs.readFileSync(path.join(DIR, 'rr-control-leadfeast-repairrate.json'), 'utf8'));
const aL = JSON.parse(fs.readFileSync(path.join(DIR, 'rr-armed-leadfeast-repairrate.json'), 'utf8'));
const cB = JSON.parse(fs.readFileSync(path.join(DIR, 'rr-control-belongfeast-repairrate.json'), 'utf8'));
const aB = JSON.parse(fs.readFileSync(path.join(DIR, 'rr-armed-belongfeast-repairrate.json'), 'utf8'));
for (const [n, c, a] of [['lead', cL, aL], ['belong', cB, aB]]) {
  const ok = c.rows.length === 8 && a.rows.length === 8 &&
    c.rows.every((r, i) => r.seed === a.rows[i].seed);
  console.log(`pairing ${n}: ${ok ? 'OK (8 pairs, seeds aligned)' : 'MISALIGNED — INVESTIGATE'}`);
  if (!ok) process.exit(1);
}
console.log('MERGE COMPLETE');
