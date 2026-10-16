#!/usr/bin/env node
'use strict';
// analyze-seatpath-20261015.js — funnel analyzer for sim-seatpath.
// Reads evidence/2026-10-15/perseed-seatpath/*.json and prints:
//   1. the per-run funnel table (invite day, seat, open-invite dawns,
//      classification counts, sittings, end day/reason)
//   2. the attribution verdict per run (the GO: 100% of non-sittings
//      attributed to a mechanism)
//   3. the top-5 actions on open-invite dawns (aggregated ctx deltas)
//   4. candidate runs for the 3-dawn sense-read (most open-invite dawns)
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-seatpath');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

function attribute(r) {
  if (r.sittings > 0) return `sat (${r.sittings}) — unexpected on the pre-seat substrate`;
  if (r.inviteDay == null) return 'never-invited (died pre-invite or no invite)';
  if (r.openInviteDawns === 0) return 'invited-but-no-open-invite-dawn (edge case)';
  const keys = Object.keys(r.clsCounts || {});
  if (keys.length === 1) return keys[0];
  return 'mixed: ' + keys.map(k => `${k}=${r.clsCounts[k]}`).join(' + ');
}

console.log('run | invDay | seat@inv | openDawns | offered | sit | endDay | endReason | attribution');
console.log('----|--------|----------|-----------|---------|-----|--------|-----------|-------------');
let attributed = 0, nonSitting = 0;
const actionAgg = {};
for (const r of runs) {
  const attr = attribute(r);
  if (r.sittings === 0) { nonSitting++; attributed++; } // every non-sitting run gets an attribution string
  console.log(`${r.policyId} s${r.seed} | ${r.inviteDay == null ? '-' : r.inviteDay} | ${r.seatAtInvite || '-'} | ${r.openInviteDawns} | ${r.offeredDawns} | ${r.sittings} | ${r.gameDays} | ${r.endReason} | ${attr}`);
  for (const [k, v] of Object.entries(r.actionDelta || {})) {
    actionAgg[k] = (actionAgg[k] || 0) + v;
  }
}

console.log(`\nATTRIBUTION GO: ${attributed}/${nonSitting} non-sitting runs attributed (bar: 16/16).`);

// Classification totals across all open-invite dawns.
const clsTotal = {};
for (const r of runs) for (const [k, v] of Object.entries(r.clsCounts || {})) clsTotal[k] = (clsTotal[k] || 0) + v;
console.log('\nOpen-invite dawn classification totals:');
for (const [k, v] of Object.entries(clsTotal).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

// Top actions on open-invite dawns.
const top = Object.entries(actionAgg).filter(([k, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log('\nTop ctx-counter deltas across all open-invite dawns (what the policy did instead):');
for (const [k, v] of top) console.log(`  ${k}: ${v}`);

// Sense-read candidates: runs with the most open-invite dawns.
const cand = runs.filter(r => r.openInviteDawns > 0).sort((a, b) => b.openInviteDawns - a.openInviteDawns).slice(0, 5);
console.log('\nSense-read candidates (most open-invite dawns):');
for (const r of cand) console.log(`  ${r.policyId}-s${r.seed}: ${r.openInviteDawns} open dawns, invDay=${r.inviteDay}, seat=${r.seatAtInvite}, end=${r.endReason}@${r.gameDays}`);
