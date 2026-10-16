// scripts/villagevoice-read-20261016.js — print a sense-test transcript for
// one beat-capture JSON: roster (who the villagers were), deaths/events,
// then every villager beat in chronological order with category + dup count.
// Usage: node scripts/villagevoice-read-20261016.js evidence/2026-10-16/villagevoice-beats/leadfeast-s118.json [--all]
'use strict';
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.error('usage: ... <beats-json> [--all]'); process.exit(2); }
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
const showAll = process.argv.includes('--all');
console.log(`=== ${d.policyId} s${d.seed} — villagerBeats=${d.villagerBeats} sensed=${d.sensed} unattributed=${d.unattributed} ===`);
console.log('distribution: ' + JSON.stringify(d.distribution));
console.log('\n--- roster at start ---');
for (const p of (d.rosterStart || [])) console.log(`  ${p.name} (${p.occ}) trust=${p.trust}`);
console.log('\n--- events ---');
for (const e of (d.events || [])) console.log(`  d${e.d} [${e.type}] ${e.who || ''} ${e.cause || ''}`);
console.log('\n--- villager beats (chronological) ---');
const SENSE = ['dialogue-with-stakes', 'goal-driven', 'event-reaction', 'routine-honest', 'template-fingerprint'];
const dupCount = {};
for (const b of (d.beats || [])) {
  const key = b.t.toLowerCase();
  dupCount[key] = (dupCount[key] || 0) + 1;
}
let shown = 0;
for (const b of (d.beats || [])) {
  if (!showAll && !(SENSE.includes(b.c) || b.base && SENSE.includes(b.base))) continue;
  const dup = dupCount[b.t.toLowerCase()] > 1 ? ` [x${dupCount[b.t.toLowerCase()]}]` : '';
  const base = b.base ? ` (base:${b.base})` : '';
  console.log(`d${b.d} [${b.c}]${base}${dup}: ${b.t.slice(0, 260)}`);
  shown++;
  if (!showAll && shown >= 400) { console.log('... (truncated at 400; pass --all)'); break; }
}
console.log('\n--- roster at end ---');
for (const p of (d.rosterEnd || [])) console.log(`  ${p.name} (${p.occ})${p.dead ? ' DEAD' : ''}`);
