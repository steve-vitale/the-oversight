#!/usr/bin/env node
// analyze-strandnarr-b.js — tabulate the strandnarr pilot corpus
// (evidence/2026-11-04/sim-strandnarr-a-corpus/strandnarr-s*.json).
// Reads ONLY the committed analysis blocks (computed in-process on
// the full transcript by strandnarr-trace-b.js); prints the pooled
// census + per-seed table + the anchor verdict inputs. No sims.
// Usage: node scripts/analyze-strandnarr-b.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-strandnarr-a-corpus');
const files = fs.readdirSync(dir).filter((f) => /^strandnarr-s\d+\.json$/.test(f)).sort();
let stranded = 0, slept = 0, bedding = 0, refused = 0, woke = 0;
let gainM = 0, matchedM = 0, mornings = 0, remoteDraws = 0, remoteDrawKcal = 0, gossip = 0;
console.log('seed daysAlive stranded slept bedding refused woke | mornings gain matched remoteDraws gossip');
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const a = c.analysis;
  stranded += a.stranded.length; slept += a.sleptCount; bedding += a.beddingCount;
  refused += a.refusedCount; woke += a.wokeCount;
  gainM += a.gainMornings; matchedM += a.matchedMornings; mornings += a.mornings.length;
  for (const m of a.mornings) {
    gossip += m.gossipLines;
    if (m.pantryDelta != null && m.pantryDelta < 0 && (m.accessValues || []).includes('remote')) {
      remoteDraws++; remoteDrawKcal += -m.pantryDelta;
    }
  }
  console.log(c.seed + ' ' + c.daysAlive + ' ' + a.stranded.length + ' ' + a.sleptCount + ' ' + a.beddingCount + ' ' + a.refusedCount + ' ' + a.wokeCount
    + ' | ' + a.mornings.length + ' ' + a.gainMornings + ' ' + a.matchedMornings
    + ' remote=' + a.mornings.filter((m) => m.pantryDelta < 0 && (m.accessValues || []).includes('remote')).length
    + ' gossip=' + a.mornings.reduce((t, m) => t + m.gossipLines, 0));
}
console.log('POOLED stranded=' + stranded + ' slept=' + slept + ' bedding=' + bedding
  + ' coverage=' + (slept ? (bedding / slept).toFixed(3) : 'n/a')
  + ' refused=' + refused + ' woke=' + woke);
console.log('POOLED strandedMornings=' + mornings + ' gainMornings=' + gainM + ' matched=' + matchedM
  + ' upkeepCoverage=' + (gainM ? (matchedM / gainM).toFixed(3) : 'n/a'));
console.log('POOLED remotePantryDrawMornings=' + remoteDraws + ' remotePantryKcal=' + remoteDrawKcal + ' gossipLinesInStrandedUpkeeps=' + gossip);
