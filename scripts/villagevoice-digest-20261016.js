// scripts/villagevoice-digest-20261016.js — condensed sense-read digest for one
// beats JSON: roster start/end, events, then chronological UNIQUE villager
// beats (first occurrence of each text) with category. Dedup keeps the read
// tractable; template-fingerprint counts are reported separately.
'use strict';
const fs = require('fs');
const f = process.argv[2];
const cap = parseInt(process.argv[3] || '220', 10);
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
const SENSE = ['dialogue-with-stakes', 'goal-driven', 'event-reaction', 'routine-honest'];
console.log(`=== ${d.policyId} s${d.seed} ===`);
console.log('dist: ' + JSON.stringify(d.distribution));
console.log('--- roster start ---');
for (const p of (d.rosterStart || [])) console.log(`  ${p.name} [${p.occ}] trust=${p.trust}`);
console.log('--- deaths/events ---');
for (const e of (d.events || [])) console.log(`  d${e.d} [${e.type}] ${e.who || ''} ${e.cause || ''}`);
console.log('--- unique sense beats (chronological) ---');
const seen = new Set();
let n = 0;
for (const b of d.beats) {
  const isSense = SENSE.includes(b.c);
  const key = b.t.toLowerCase();
  if (seen.has(key)) continue;
  if (!isSense && b.c !== 'template-fingerprint') continue;
  if (b.c === 'template-fingerprint' && !(b.base && SENSE.includes(b.base))) continue;
  seen.add(key);
  const dup = d.beats.filter((x) => x.t.toLowerCase() === key).length;
  console.log(`d${b.d} [${b.c}${b.base ? '/' + b.base : ''}]${dup > 1 ? ' x' + dup : ''}: ${b.t.slice(0, 240)}`);
  if (++n >= cap) { console.log(`... (capped at ${cap})`); break; }
}
console.log('--- roster end ---');
for (const p of (d.rosterEnd || [])) console.log(`  ${p.name} [${p.occ}]${p.dead ? ' DEAD' : ''}`);
