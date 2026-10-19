#!/usr/bin/env node
// analyze-endgame-r23.js — full-seat gap analysis for journey-endgame r23.
// Reads the r23 summary JSON, prints per-seed full-seat criterion gaps at
// announce and at run end, and names the binding constraint per seed.
// Usage: node scripts/analyze-endgame-r23.js <summary.json>
const fs = require('fs');
const sumPath = process.argv[2];
if (!sumPath) { console.error('usage: analyze-endgame-r23.js <summary.json>'); process.exit(1); }
const rows = JSON.parse(fs.readFileSync(sumPath, 'utf8'));

// Full-seat bar (deedGateReady): waves 5/5/4/3/2 distinct, contests>=3,
// crises>=3, stage>=2, foodDeeds (sentimentTaught && feastSurgeUsed).
// Scale is reported, not gated (2026-10-13 standing).
const BARS = [
  ['w1', 'waves faced distinct', 5, g => g.w1],
  ['w2', 'waves faced distinct', 5, g => g.w2],
  ['w3', 'waves faced distinct', 4, g => g.w3],
  ['w4', 'waves faced distinct', 3, g => g.w4],
  ['w5', 'waves faced distinct', 2, g => g.w5],
  ['contests', 'contests survived', 3, g => g.contestsN],
  ['crises', 'crises weathered', 3, g => g.crisesN],
  ['stage', 'integration stage', 2, g => g.stage],
  ['food', 'food-thesis deeds', 1, g => (g.foodDeeds ? 1 : 0)],
];
function gapFor(g) {
  if (!g || !g.full) return null;
  const f = g.full;
  return BARS.map(([key, label, bar, read]) => {
    const have = read(f) | 0;
    return { key, label, bar, have, gap: bar - have, met: have >= bar };
  });
}
for (const r of rows) {
  if (!r.ok) { console.log(`seed ${r.seed}: RUN FAILED — ${String(r.err || '').slice(0, 100)}`); continue; }
  console.log(`=== seed ${r.seed} (days=${r.days}, won=${r.won}, announce=${r.announce}, sit=${r.sit}) ===`);
  const ga = gapFor(r.seatAtAnnounce);
  const ge = gapFor(r.seatAtEnd);
  const show = (tag, g2) => {
    if (!g2) { console.log(`  [${tag}] no snapshot`); return; }
    const rank = (tag === 'end' ? r.seatAtEnd : r.seatAtAnnounce).full.rank;
    console.log(`  [${tag}] fullSeat ok=${(tag === 'end' ? r.seatAtEnd : r.seatAtAnnounce).full.ok} scale=${rank}`);
    for (const c of g2) {
      console.log(`    ${c.key}: ${c.have}/${c.bar} ${c.met ? 'OK' : 'GAP ' + c.gap}`);
    }
    const binding = g2.filter(c => !c.met).sort((a, b) => b.gap - a.gap)[0];
    if (binding) console.log(`    binding: ${binding.key} (gap ${binding.gap})`);
    else console.log('    FULL SEAT EARNED');
  };
  show('announce', ga);
  show('end', ge);
  const de = r.doorEntries || [];
  for (const d of de) {
    const bs = d.branchSignals || {};
    console.log(`  door: ${d.path} branch=${d.branch} (light=${bs.light} dark=${bs.dark}) ledger=${JSON.stringify(d.ledger)}`);
  }
}
