// scripts/test-journey-scale-r32-nogate.js — proof test for the r32 pantry-gate arm.
// Static + evidence proof (no harness boot needed):
//  1. The variant policy drops ONLY the courtship-block pantry gate.
//  2. Standing scalecourt.js still has that gate (untouched by the arm).
//  3. The variant keeps every pay-gate (tribute/trade/demand/counter).
//  4. The r32 census JSONs carry the poor-courtship instruments, and the
//     poor seed (85004) shows the arm firing (courtPoorDays >= 10,
//     pilgrimage completions >= 3, 3 covenants vs r31's 1).
// Usage: node scripts/test-journey-scale-r32-nogate.js [EVIDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'journey-scale-r32-nogate');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra || ''}`); }
}
const variant = fs.readFileSync(path.join(__dirname, 'policies', 'scalecourt-nogate.js'), 'utf8');
const standing = fs.readFileSync(path.join(__dirname, 'policies', 'scalecourt.js'), 'utf8');
const courtLineV = variant.split('\n').find(l => l.includes('courtship: day>=25') || (l.includes('day >= 25') && l.includes('pendingNational')));
check('variant courtship line has no pantry gate', !!courtLineV && !courtLineV.includes('pantryKcal'), courtLineV);
const courtLineS = standing.split('\n').find(l => l.includes('day >= 25') && l.includes('pendingNational'));
check('standing scalecourt keeps the pantry gate', !!courtLineS && courtLineS.includes('pantryKcal(Game) > 12000'), courtLineS);
for (const [name, re] of [['tribute gate >15000', /pantryKcal\(Game\) > 15000/], ['trade-call gate >10000', /pantryKcal\(Game\) > 10000/], ['demand gate >12000', /pantryKcal\(Game\) > 12000/], ['counter gate >25000', /pantryKcal\(Game\) > 25000/]]) {
  check(`variant keeps ${name}`, re.test(variant));
}
check('variant keeps r31 scholar.health pilgrimage fix', /s\.health/.test(variant) && /Game\.maxHealth/.test(variant));
const c85004 = JSON.parse(fs.readFileSync(path.join(EVIDIR, 'journey-scale-r32-nogate-85004.json'), 'utf8')).census;
check('85004 courtPoorDays >= 10', (c85004.courtPoorDays || 0) >= 10, `got ${c85004.courtPoorDays}`);
check('85004 pilgrimage completions (climbStudies) >= 3', (c85004.climbStudies || 0) >= 3, `got ${c85004.climbStudies}`);
check('85004 covenants == 3 (r31: 1)', (c85004.covLinks || []).length === 3, `got ${(c85004.covLinks || []).length}`);
for (const s of [85001, 85002, 85003, 85004]) {
  const c = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-scale-r32-nogate-${s}.json`), 'utf8')).census;
  check(`${s} census carries poor-courtship instruments`, c.courtPoorDays !== undefined && c.pilgrimagesPoor !== undefined && c.proposedPeerPoor !== undefined);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
