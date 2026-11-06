// scan-convo-dupes-r145-20261106.js — job (C) scan for journey social life r145.
// Walks EVERY pool under src/data/characterGen.json convo (arrays AND nested
// objects-of-arrays) and reports:
//   (1) exact-duplicate lines inside any single pool (normalized text) — a
//       defect: the "No repeats, ever" ledger (CONVERSATIONS.md) tracks said
//       lines by TEXT, so a duplicated line can fire twice for one villager.
//   (2) first-3-word collisions inside any single pool — REPORT ONLY, for
//       human adjudication: r144 showed most are same-opening / different-beat
//       (legitimate variety); a true same-beat pair is a defect to fix.
// Exit 0 always (report); the proof test (test-convo-dedupe-r145.js) carries
// the binding assertions. Usage: node scripts/scan-convo-dupes-r145-20261106.js
'use strict';
const fs = require('fs'), path = require('path');
const cg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
const convo = cg.convo || {};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const first3 = (s) => norm(s).split(' ').slice(0, 3).join(' ');

// Collect every pool as {name, lines}.
const pools = [];
for (const [key, val] of Object.entries(convo)) {
  if (key === 'questions' && Array.isArray(val)) {
    // Structured entries: scan the NPC-spoken lines as sub-pools, plus the
    // answer labels/reacts flattened across questions (a duplicate react in
    // two questions is the same NPC line in two contexts).
    const qs = val.map((q) => q.q).filter(Boolean);
    const follows = val.map((q) => q.follow).filter(Boolean);
    const deepers = val.map((q) => q.deeper).filter(Boolean);
    const labels = [], reacts = [];
    for (const q of val) for (const a of (q.answers || [])) {
      if (a.label) labels.push(a.label);
      if (a.react) reacts.push(a.react);
    }
    pools.push({ name: 'questions.q', lines: qs });
    pools.push({ name: 'questions.follow', lines: follows });
    pools.push({ name: 'questions.deeper', lines: deepers });
    pools.push({ name: 'questions.answers.label', lines: labels });
    pools.push({ name: 'questions.answers.react', lines: reacts });
    continue;
  }
  if (Array.isArray(val)) pools.push({ name: key, lines: val });
  else if (val && typeof val === 'object') {
    for (const [sub, lines] of Object.entries(val)) {
      if (Array.isArray(lines)) pools.push({ name: `${key}.${sub}`, lines });
    }
  }
}
console.log(`pools scanned: ${pools.length}, total lines: ${pools.reduce((n, p) => n + p.lines.length, 0)}`);
let exactDupes = 0, collisions = 0;
for (const p of pools) {
  const seen = new Map();
  for (const l of p.lines) {
    const k = norm(l);
    if (seen.has(k)) {
      console.log(`EXACT-DUPE ${p.name}: "${seen.get(k)}" || "${l}"`);
      exactDupes++;
    } else seen.set(k, l);
  }
  // First-3-word collisions (report only).
  const byOpen = new Map();
  for (const l of p.lines) {
    const k = first3(l);
    if (!byOpen.has(k)) byOpen.set(k, []);
    byOpen.get(k).push(l);
  }
  for (const [k, lines] of byOpen) {
    if (lines.length > 1) {
      collisions++;
      console.log(`OPEN-COLLISION ${p.name} [${k}] x${lines.length}:`);
      for (const l of lines) console.log(`    - ${l}`);
    }
  }
}
console.log(`RESULT: exact-dupes ${exactDupes}, first-3-word collision groups ${collisions}`);
