// titangate-det-compare.js — ON vs OFF end-field comparison for the
// sim-titangate-a neutrality leg. Usage:
//   node scripts/titangate-det-compare.js <on.json> <off.json>
// Prints DET-COMPARE lines and exits 1 on any compared-field mismatch.
'use strict';
const fs = require('fs');
const FIELDS = ['days', 'gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank', 'endReason'];
const a = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const b = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
let pass = true;
for (const f of FIELDS) {
  const same = JSON.stringify(a[f]) === JSON.stringify(b[f]);
  console.log(`DET-COMPARE s${a.seed} ${f}: ON=${JSON.stringify(a[f])} OFF=${JSON.stringify(b[f])} -> ${same ? 'PASS' : 'FAIL'}`);
  if (!same) pass = false;
}
console.log(pass ? 'DET-COMPARE OVERALL -> PASS' : 'DET-COMPARE OVERALL -> FAIL');
process.exit(pass ? 0 : 1);
