#!/usr/bin/env node
// scripts/test-homebody-a-sense.js — sim-homebody-a SENSE script.
// S1: the homebody-blocked triple trace quoted VERBATIM from the
// corpus: seed 75109 visjoin_174 / eulogy (funnel class
// GATE-BLOCKED-AT-PICK), all picks carrying the eulogy memory
// plus all notes for that villager, in corpus order; plus the
// fresh-window picks of the second homebody triple, seed 75109
// visjoin_138 / algorithm (funnel class MEMORY-OVERWRITTEN).
// Judgment is printed in plain words alongside the trace; the
// evidence file carries the same judgment. Exit 1 if either
// triple's picks are missing from the corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-homebody-a');

function trace(seed, vid, mid) {
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
  const picks = ((row.funnel || {}).picks || []).filter(p => p.vid === vid && (p.preSightings || []).some(s => s[0] === mid));
  const notes = ((row.funnel || {}).notes || []).filter(n => n.vid === vid);
  return { row, picks, notes };
}
function fmtPick(p) {
  const g = p.gates || {};
  const pre = JSON.stringify(p.preSightings);
  const cand = p.candidate ? `${p.candidate.mid}@(${p.candidate.tx},${p.candidate.ty})/day${p.candidate.day}` : 'null';
  const ch = p.chosen ? `${p.chosen.kind}${p.chosen.huntMid ? '/' + p.chosen.huntMid : ''}` : 'null';
  return `  PICK d${p.day} part=${p.part} ${p.vid} chosen=${ch} candidate=${cand} gates={armed:${g.armed},sheltered:${g.sheltered},postFleeResting:${g.postFleeResting},maxD:${g.maxD}} hx,hy=(${p.hx},${p.hy}) pre=${pre}`;
}
function fmtNote(n) {
  return `  NOTE d${n.day} part=${n.part} ${n.vid} ${n.mid}@(${n.tx},${n.ty}) refreshed=${n.refreshed} listLenAfter=${n.listLenAfter} evicted=${JSON.stringify(n.evicted)} post=${JSON.stringify(n.postSightings)}`;
}
let fail = false;
for (const [seed, vid, mid, label] of [
  [75109, 'visjoin_174', 'eulogy', 'S1-primary homebody-blocked triple'],
  [75109, 'visjoin_138', 'algorithm', 'S1-second homebody triple (first 6 picks: 4 fresh, then 2 stale)'],
]) {
  const { picks, notes } = trace(seed, vid, mid);
  console.log(`=== ${label}: s${seed} ${vid}/${mid} ===`);
  console.log(`picks carrying ${mid}: ${picks.length}; notes for ${vid}: ${notes.length}`);
  if (!picks.length) { console.log(`SENSE-FAIL: no picks for ${vid}/${mid}`); fail = true; continue; }
  const show = label.includes('second') ? picks.slice(0, 6) : picks;
  for (const p of show) console.log(fmtPick(p));
  if (!label.includes('second')) for (const n of notes) console.log(fmtNote(n));
  else console.log(`  (full note list for ${vid} is in the corpus row; fresh-window picks above are the sense leg for this triple)`);
}
console.log(`
SENSE JUDGMENT (plain words):
visjoin_174 fought a eulogy, came home with the memory still fresh,
and picked three times while it was fresh (d177, d179 twice) —
and all three times the game offered her nothing, because her
roaming range is zero tiles and no distance satisfies
1 <= d <= 0. That reads as a person kept
home by range: she is at haven, she is armed, she is not resting
off a fright, the memory is days old, and the only gate failing
is the range gate. It does not read as an artifact — the
candidate recompute returns null for exactly the reason the
range rule names, and the same villager's other picks show the
same maxD 0, not a one-off null.
visjoin_138 is the same shape with a longer tail: four fresh
picks (d142, d143, d144 twice) with maxD 0 and candidate null,
then stale picks, then an eviction weeks later. The eviction is
an epilogue, not the block — her funnel died in the fresh
window, on range. Both blocked memories sit ONE tile from
haven (174: (5,4); 138: (3,4) against haven (4,4)) — the
closest possible fight, still un-offerable. This is not a
story about distant beasts; it is a story about a range of
zero.
Neither trace shows a villager refusing a hunt, forgetting a
beast, or failing a lottery. Both show a villager who was never
asked.`);
if (fail) { console.log('HOMEBODY-SENSE: FAIL'); process.exit(1); }
console.log('HOMEBODY-SENSE: PASS');
