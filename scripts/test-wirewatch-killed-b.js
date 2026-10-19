// test-wirewatch-killed-b.js — POST-KILL verification for sim-wirewatch-b.
//
// The watch-drive layer was KILLED AT PILOT and deleted zero-trace per the
// kill protocol. This script verifies the post-kill state honestly: layer
// absent, wiring reverted, instruments intact, verdict documented.
//
// Run from the repo root: node scripts/test-wirewatch-killed-b.js
// Exit 0 = all checks pass.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function check(name, fn) {
  try {
    const ok = fn();
    if (ok) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name); }
  } catch (e) { fail++; console.log('ERROR ' + name + ': ' + e.message); }
}
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = p => fs.existsSync(path.join(ROOT, p));

// ---- V1: the layer file is gone -------------------------------------------
check('V1 layer file scripts/policies/wirewatch.js absent', () =>
  !exists('scripts/policies/wirewatch.js'));

// ---- V2: no wiring in the base policy --------------------------------------
check('V2 no wirewatch/WIREWATCH refs in scripts/policies/competent.js', () => {
  const src = read('scripts/policies/competent.js');
  return !/wirewatch/i.test(src);
});

// ---- V3: no src/js references to the deleted layer -------------------------
check('V3 no wirewatch refs in src/js/*.js', () => {
  const files = fs.readdirSync(path.join(ROOT, 'src/js')).filter(f => f.endsWith('.js'));
  return files.every(f => !/wirewatch/i.test(read('src/js/' + f)));
});

// ---- V4: instruments intact -------------------------------------------------
const instruments = [
  'scripts/test-wirewatch-20261019.js',
  'scripts/sweep-wirewatch-20261019.js',
  'scripts/det-gate-wirewatch-20261019.js',
  'scripts/probe-wirewatch-20261019.js',
  'scripts/screen-wirewatch-20261019.js',
  'scripts/sense-wirewatch-b.js',
  'scripts/analyze-wirewatch-b.js',
  'scripts/build-wirewatch-panels-b.js',
  'evidence/2026-10-19/sim-wirewatch-b.md',
];
check('V4 all 9 instruments present (' + instruments.length + ' checked)', () =>
  instruments.every(exists));

// ---- V5: the verdict is documented ------------------------------------------
check('V5 evidence records KILLED-AT-PILOT with pilot numbers', () => {
  const ev = read('evidence/2026-10-19/sim-wirewatch-b.md');
  return /killed-at-pilot/i.test(ev) && /0\/16/.test(ev);
});

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
