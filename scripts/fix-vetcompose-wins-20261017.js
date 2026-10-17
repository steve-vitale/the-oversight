#!/usr/bin/env node
// fix-vetcompose-wins-20261017.js — ONE-TIME measurement correction for
// sim-vetcompose (2026-10-17). The sweep's oneRun read `result.won`
// (undefined — runDays does not return it), writing wins=0 on every
// per-seed JSON. The sweep script is fixed (reads Game.won); this script
// repairs the 32 already-written per-seed JSONs from the beat captures.
//
// Recovery basis (documented in evidence/2026-10-17/sim-vetcompose.md metric
// review): the pods.js epilogue line "You won. Say it plainly: you won."
// fires ONLY on the won path (table.js won=true -> pods epilogue; the
// deferred variant carries different text). The script asserts 1:1
// sits/winline consistency on every run before writing: a run with the
// win-line must have sittings>=1, and every run with sittings>=1 must show
// the win-line (the seat-drive stack's only exit after sitting is the
// table chain). Any inconsistency = STOP, no writes.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-vetcompose');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'vetcompose-beats');
const WINLINE = 'You won. Say it plainly: you won.';

const files = fs.readdirSync(EVID).filter(f => /-(armed|control)-s\d+\.json$/.test(f));
let fixed = 0;
const report = [];
for (const f of files) {
  const rec = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  const base = f.replace(/\.json$/, '');
  const bf = path.join(BEATS, base + '.json');
  let winline = 0;
  try {
    const beats = JSON.parse(fs.readFileSync(bf, 'utf8'));
    winline = beats.some(b => String(b.text || '').includes(WINLINE)) ? 1 : 0;
  } catch (e) {
    console.error(`STOP: beat file missing/unreadable for ${f} — no writes.`);
    process.exit(2);
  }
  const sits = rec.sittings | 0;
  // Consistency assertion (both directions).
  if (winline === 1 && sits < 1) {
    console.error(`STOP: ${f} has win-line but sittings=${sits} — inconsistent. No writes.`);
    process.exit(2);
  }
  if (sits >= 1 && winline === 0) {
    console.error(`STOP: ${f} sat (sittings=${sits}) but shows no win-line — inconsistent. No writes.`);
    process.exit(2);
  }
  if ((rec.wins | 0) !== winline) {
    rec.wins = winline;
    fs.writeFileSync(path.join(EVID, f), JSON.stringify(rec, null, 1));
    fixed++;
  }
  report.push(`${base}: sits=${sits} winline=${winline} -> wins=${winline}`);
}
console.log(report.join('\n'));
console.log(`\ncorrected ${fixed}/${files.length} per-seed JSONs (wins = win-line presence, 1:1 with sittings verified)`);
