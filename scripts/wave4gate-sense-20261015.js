#!/usr/bin/env node
'use strict';
// scripts/wave4gate-sense-20261015.js — SENSE-TESTING reader for the wave-4/5
// gate audit. Reads evidence/2026-10-15/wave4gate-rows.json and prints the
// wave-3→4 window narrative for one unlock run and one non-unlock run:
// standing breakdown rows across the window, the standingLine notes, and
// the filtered System beats (unlock/hold/release). A human reads the result
// for meaning — did the unlock read as earned, does a non-unlock read as a
// village that never got there (not a silent gate)?
//
// Usage:
//   node scripts/wave4gate-sense-20261015.js [rows.json]
const fs = require('fs');
const IN = process.argv[2] || 'evidence/2026-10-15/wave4gate-rows.json';
const data = JSON.parse(fs.readFileSync(IN, 'utf8'));
const runs = data.runs;

function rowStr(r) {
  const s = r.sample || r;
  return `d${s.day} uw=${s.uw} pts2=${s.pts2} raw=${s.raw}(war${s.war}/dip${s.diplomacy}/pln${s.plenty} links=${s.links} feasts=${s.feasts} wpts=${s.warPts}) ` +
    `gated=${s.gated} e3=${s.engaged3} e4=${s.engaged4} peak=${s.peak}` +
    (s.line ? `  line: ${s.line.slice(0, 140)}` : '');
}

function show(run, label) {
  const u3 = run.unlockDay[3], u4 = run.unlockDay[4], u5 = run.unlockDay[5];
  console.log(`\n===== ${label}: ${run.policyId} s${run.seed} (days=${run.gameDays} end=${run.endReason}) =====`);
  console.log(`unlock days: w2=${u3 != null ? u3 : '-'} w3=${u3 != null ? u3 : '-'} w4=${u4 != null ? u4 : '-'} w5=${u5 != null ? u5 : '-'}`);
  console.log('w4 classification: ' + JSON.stringify(run.classification.w4));
  console.log('w5 classification: ' + JSON.stringify(run.classification.w5));
  // narrative window: for an unlock, [w3 unlock, w4 unlock + 5]; for a
  // non-unlock, [day 25, min(w3 unlock + 20, end)] or the last 40 days.
  let wStart, wEnd;
  if (u4 != null) { wStart = (u3 != null ? u3 : u4) - 5; wEnd = u4 + 7; }
  else if (u3 != null) { wStart = 20; wEnd = Math.min(u3 + 20, run.gameDays); }
  else { wStart = Math.max(0, run.gameDays - 40); wEnd = run.gameDays; }
  console.log(`\n--- gate-state window d${Math.max(0, wStart)}..d${wEnd} ---`);
  for (const row of (run.rows || [])) {
    if (row.gameDay >= Math.max(0, wStart) && row.gameDay <= wEnd) console.log('  ' + rowStr(row));
  }
  console.log('\n--- System beats in window (wave/standing) ---');
  let n = 0;
  for (const l of (run.sayLines || [])) {
    if (l.day >= Math.max(0, wStart) && l.day <= wEnd) { console.log(`  d${l.day}: ${l.text}`); n++; }
  }
  if (!n) console.log('  (no wave/standing beats in window)');
  console.log(`\nfinal: rank=${run.scaleRank} tableEver=${run.tableEver} playerDeaths=${run.playerDeaths} villagerDeaths=${run.villagerDeaths}`);
}

// pick: first unlock run, first non-unlock run (prefer long-lived)
const unlock = runs.find(r => r.classification && r.classification.w4 && r.classification.w4.unlocked);
const nonUnlock = runs.filter(r => r.classification && r.classification.w4 && !r.classification.w4.unlocked)
  .sort((a, b) => b.gameDays - a.gameDays)[0];
if (unlock) show(unlock, 'UNLOCK RUN');
else console.log('(no unlock run to show)');
if (nonUnlock) show(nonUnlock, 'NON-UNLOCK RUN');
else console.log('(no non-unlock run to show)');
console.log('\nread the two windows above and write the sense verdict in the evidence file.');
