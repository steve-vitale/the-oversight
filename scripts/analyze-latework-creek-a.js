#!/usr/bin/env node
// analyze-latework-creek-a.js — sweep audit for sim-latework-creek-a
// (2026-11-04, flesh-out loop, axis food-economy). Reads a
// bankfood-trace-b corpus dir (bankfood-b-nighttravel-s<seed>.json
// files) and checks every emitted late-work line: it must name the
// place recorded in its evening record's sayPlace, and must say
// "at the creek" exactly when sayPlace is 'creek'. Exits nonzero
// on any wrong-place line. Pure reads; no repo writes.
// Usage: node scripts/analyze-latework-creek-a.js <corpus-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-latework-creek-a.js <corpus-dir>'); process.exit(2); }
let total = 0, wrong = 0, creek = 0, nonCreek = 0;
const byPlace = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const d of (j.evenings || [])) {
    const bf = d.bankfoodEvening;
    if (!bf || bf.sayLine !== 'late-work-line') continue;
    total++;
    const m = JSON.stringify(d).match(/You work late[^"\\]*/);
    const line = m ? m[0] : '';
    const saysCreek = line.includes('at the creek');
    if (bf.sayPlace === 'creek') creek++; else nonCreek++;
    byPlace[bf.sayPlace || 'null'] = (byPlace[bf.sayPlace || 'null'] || 0) + 1;
    if (saysCreek !== (bf.sayPlace === 'creek')) { wrong++; console.log(`WRONG ${f} day=${d.loopDay} sayPlace=${bf.sayPlace} line=${line}`); }
    if (d.tile !== bf.sayPlace) console.log(`NOTE tile-disagree ${f} day=${d.loopDay} rowTile=${d.tile} sayPlace=${bf.sayPlace}`);
    if (!line) { wrong++; console.log(`MISSING-LINE ${f} day=${d.loopDay}`); }
  }
}
console.log(`late-work lines: total=${total} creek=${creek} nonCreek=${nonCreek} wrongPlace=${wrong}`);
console.log('by place: ' + JSON.stringify(byPlace));
process.exit(wrong ? 1 : 0);
