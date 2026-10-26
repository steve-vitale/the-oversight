// scripts/test-journey-scale-r37-betray.js — journey-scale r37 proof test:
// the betrayal instrument is wired into the r37 driver (and absent from the
// r36 driver), and every r37 seed JSON carries the betray fields.
// Usage: node scripts/test-journey-scale-r37-betray.js [EVIDIR]
//   With no EVIDIR: static-wiring checks only (pass on r37, RED on r36).
//   With EVIDIR: also checks each seed JSON + betray txt file.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('PASS ' + label); } else { fail++; console.log('FAIL ' + label); } }
const r37 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r37-20261026.js'), 'utf8');
const r36 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r36-20261025.js'), 'utf8');
// Static wiring: all five betray hooks present in r37, absent in r36.
const hooks = [
  ['accept detection', "indexOf('[betrayal:accept]')"],
  ['subject registration', 'betraySubjects[vid] = { day, vid'],
  ['daily snapshot loop', "event: 'daily'"],
  ['census betray fields', 'betrayWatch: betrayWatch.slice()'],
  ['betray file write', 'journey-scale-r37-betray-'],
];
for (const [label, needle] of hooks) {
  ok(r37.indexOf(needle) !== -1, 'r37 driver has ' + label);
  ok(r36.indexOf(needle) === -1, 'r36 driver lacks ' + label + ' (RED on old driver)');
}
// Read-only claim: the instrument never writes engine state — it only reads
// person()/trust and pushes to driver-local arrays. Assert no assignment to
// Game state inside the betray blocks (personSnap + daily loop + accept block).
const betrayBlocks = (r37.match(/personSnap[\s\S]{0,400}/g) || []).join('\n');
ok(!/state\.\w+\s*=/.test(betrayBlocks), 'betray instrument performs no state writes');
const EVIDIR = process.argv[2];
if (EVIDIR) {
  const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r37-trust-\d+\.json$/.test(f)).sort();
  ok(files.length > 0, 'r37 seed JSONs present in ' + EVIDIR);
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8')).census;
    ok(Array.isArray(c.betrayWatch), f + ' has betrayWatch array');
    ok(c.betraySubjects && typeof c.betraySubjects === 'object', f + ' has betraySubjects object');
    const accepts = (c.betrayWatch || []).filter(b => b.event === 'accept');
    for (const a of accepts) {
      const snaps = (c.betrayWatch || []).filter(b => b.vid === a.vid);
      ok(snaps.length >= 1, f + ' accept ' + a.name + ' has snapshots (' + snaps.length + ')');
      ok(snaps[0].event === 'accept' && snaps[0].day === a.day, f + ' accept ' + a.name + ' first snapshot is the accept day');
    }
    const seed = f.match(/(\d+)\.json$/)[1];
    ok(fs.existsSync(path.join(EVIDIR, 'journey-scale-r37-betray-' + seed + '.txt')), f + ' betray txt exists');
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
