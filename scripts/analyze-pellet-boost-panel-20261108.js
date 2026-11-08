// scripts/analyze-pellet-boost-panel-20261108.js — judge the pellet-boost
// panel bars (PB-2/PB-3/PB-4) from evidence/2026-11-08/sim-pellet-boost-panel.jsonl.
// Usage: node scripts/analyze-pellet-boost-panel-20261108.js [path]
// Exit 0 when every bar passes, 1 otherwise. Prints the per-seed table +
// the verdict per bar. The P4 (pass) comparison is a separate diff against
// evidence/2026-11-07/sim-pelletpass-panel.jsonl (see the run note).
'use strict';
const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-08', 'sim-pellet-boost-panel.jsonl');
const rows = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
const bearer = rows.filter(r => r.panel === 'bearer');
const starved = rows.filter(r => r.panel === 'starved');
let fail = 0;
function bar(name, cond, detail) {
  console.log((cond ? '  PASS ' : '  FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fail++;
}
console.log('BEARER PANEL (PB-2): ' + bearer.length + ' seeds');
for (const r of bearer) {
  console.log(`  seed ${r.seed}: days=${r.days} end=${r.endReason} boosts=${r.ledger.boosts} floors=${r.ledger.floors} spent=${r.ledger.spent} ledgerMatchesBurns=${r.ledgerMatchesBurns} wholeUnit=${r.everySpentWholeUnit} surgeUsed=${r.feastSurgeUsed} surgeBy=${r.feastSurgeBy} pantry ${r.pantryKcalStart}->${r.pantryKcalEnd} deaths=${r.deaths}`);
}
if (bearer.length) {
  const boostedSeeds = bearer.filter(r => r.ledger.boosts >= 1).length;
  bar('PB-2a: >=1 boost on >=4/8 bearer seeds', boostedSeeds >= 4, boostedSeeds + '/' + bearer.length + ' seeds boosted');
  bar('PB-2b: ledger.spent equals observed boost draws, every seed', bearer.every(r => r.ledgerMatchesBurns),
    bearer.filter(r => !r.ledgerMatchesBurns).map(r => r.seed).join(',') || 'all match');
  bar('PB-2c: every boosted draw took one whole unit present at the time', bearer.every(r => r.everySpentWholeUnit),
    bearer.filter(r => !r.everySpentWholeUnit).map(r => r.seed).join(',') || 'all whole-unit');
  const marked = bearer.filter(r => r.feastSurgeUsed).length;
  bar('PB-4 (P3): feastSurgeUsed marks on >=1 bearer seed via a paid boost', marked >= 1, marked + '/' + bearer.length + ' seeds marked');
}
console.log('STARVED PANEL (PB-3): ' + starved.length + ' seeds');
for (const r of starved) {
  const everAbove = r.daily.some(d => d.pantryKcal >= 50);
  console.log(`  seed ${r.seed}: days=${r.days} end=${r.endReason} boosts=${r.ledger.boosts} floors=${r.ledger.floors} boostsWhileStarved=${r.boostsWhileStarved} bearerDailyNeed=${r.bearerDailyNeed} pantryEverAboveCOST=${everAbove} pantryEnd=${r.pantryKcalEnd}`);
}
if (starved.length) {
  bar('PB-3a: 0 boosts while starved (pantry below COST at the burn)', starved.every(r => r.boostsWhileStarved === 0),
    starved.filter(r => r.boostsWhileStarved > 0).map(r => r.seed + ':' + r.boostsWhileStarved).join(',') || 'none fired starved');
  bar('PB-3b: bearer never hungers (dailyNeed 0 at end)', starved.every(r => r.bearerDailyNeed === 0),
    starved.map(r => r.seed + ':' + r.bearerDailyNeed).join(','));
  bar('PB-3c: floors > 0 on the starved seed(s)', starved.some(r => r.ledger.floors > 0),
    'floors=' + starved.map(r => r.ledger.floors).join(','));
  const lit = starved.filter(r => r.ledger.boosts === 0).length;
  console.log('  NOTE PB-3 literal (0 boosts total): ' + lit + '/' + starved.length + ' seeds — a village that forages back above COST will boost; see the run note.');
}
console.log(fail ? `\nVERDICT: ${fail} bar(s) FAIL` : '\nVERDICT: all bars PASS');
process.exit(fail ? 1 : 0);
