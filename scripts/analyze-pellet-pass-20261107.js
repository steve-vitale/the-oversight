// ANALYZER: pellet-pass panel vs the preregged GO bar (2026-11-07).
//
// Reads evidence/2026-11-07/sim-pelletpass-panel.jsonl (one JSON line per
// case from scripts/panel-pellet-pass-20261107.js) and judges the four
// GO items pinned in sim-pelletpass-prereg.md + amendment A1:
//
//   1. Pass fires on the first dawn on >= 7/8 armed hungry-village seeds.
//   2. After the pass, feast grants + combat spends (feastSurgeUsed) +
//      tableSeat() returns a seat on >= 7/8 armed seeds.
//   3. Fed control: 0 passes in 3 dawns on 8/8 seeds.
//   4. Baseline arm: 0 passes and 0 seats on 8/8 seeds.
//
// Usage: node scripts/analyze-pellet-pass-20261107.js [panel.jsonl]
// Prints the table + verdict. Exit 0 on GO, 1 on NO-GO.
'use strict';
const fs = require('fs');

const file = process.argv[2] || 'evidence/2026-11-07/sim-pelletpass-panel.jsonl';
const rows = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

function group(arm, shape) { return rows.filter(r => r.arm === arm && r.shape === shape); }
function count(rs, pred) { return rs.filter(pred).length; }

const armedHungry = group('armed', 'hungry');
const baseHungry = group('baseline', 'hungry');
const armedFed = group('armed', 'fed');

const passDawn1 = count(armedHungry, r => r.passDay === 1);
const chainOk = count(armedHungry, r => r.passDay === 1 && r.feastGranted && r.feastSurgeUsed && r.seat !== 'none');
const fedPasses = count(armedFed, r => r.passDay != null);
const basePasses = count(baseHungry, r => r.passDay != null);
const baseSeats = count(baseHungry, r => r.seat !== 'none');

console.log('pellet-pass panel: ' + rows.length + ' cases');
console.log('--- armed / hungry (' + armedHungry.length + ' seeds) ---');
for (const r of armedHungry) {
  console.log(`  seed ${r.seed}: passDay=${r.passDay} holder=${r.holderAfter} feastGranted=${r.feastGranted} surgeUsed=${r.feastSurgeUsed} seat=${r.seat} over=${r.over}`);
}
console.log('--- baseline / hungry (' + baseHungry.length + ' seeds) ---');
for (const r of baseHungry) {
  console.log(`  seed ${r.seed}: passDay=${r.passDay} feastGranted=${r.feastGranted} surgeUsed=${r.feastSurgeUsed} seat=${r.seat} over=${r.over}`);
}
console.log('--- armed / fed (' + armedFed.length + ' seeds) ---');
for (const r of armedFed) {
  console.log(`  seed ${r.seed}: passDay=${r.passDay} holder=${r.holderAfter} over=${r.over}`);
}

const item1 = armedHungry.length === 8 && passDawn1 >= 7;
const item2 = armedHungry.length === 8 && chainOk >= 7;
const item3 = armedFed.length === 8 && fedPasses === 0;
const item4 = baseHungry.length === 8 && basePasses === 0 && baseSeats === 0;
console.log('--- GO bar ---');
console.log(`  1. pass on dawn 1, armed/hungry: ${passDawn1}/8 (need >=7) — ${item1 ? 'PASS' : 'FAIL'}`);
console.log(`  2. feast+spend+seat after pass: ${chainOk}/8 (need >=7) — ${item2 ? 'PASS' : 'FAIL'}`);
console.log(`  3. fed control passes: ${fedPasses}/8 (need 0) — ${item3 ? 'PASS' : 'FAIL'}`);
console.log(`  4. baseline passes/seats: ${basePasses} passes, ${baseSeats} seats /8 (need 0/0) — ${item4 ? 'PASS' : 'FAIL'}`);
const go = item1 && item2 && item3 && item4;
console.log(go ? 'VERDICT: GO' : 'VERDICT: NO-GO');
process.exitCode = go ? 0 : 1;
