#!/usr/bin/env node
// test-unloaddiv-20261014.js — UNLOAD-TRUST DIVERGENCE instrument-honesty proof
// (sim-findings #155, scale-onramp r30 diagnostic).
//
// Modes:
//   --mode=armed    run with the r29 patch APPLIED: asserts the re-applied
//                   patch is char-identical to the preserved r29 block in
//                   evidence/2026-10-14/sim-ledgerunload.md, exactly one
//                   marker occurrence, anchored at the Haven homecoming site,
//                   and NOT at the exile-amends site.
//   --mode=pristine run AFTER the byte-clean revert: asserts zero marker
//                   occurrences and a clean tree (gate-off byte-identical to
//                   pristine control).
//
// The r29 RED->GREEN proof of the fix itself stands in
// scripts/test-ledgerunload-20261014.js; this test guards the measurement
// instrument only — no game-code change is landed by this arm.
'use strict';
const fs = require('fs');
const cp = require('child_process');

const mode = (process.argv.find(a => a.startsWith('--mode=')) || '=armed').split('=')[1];
const MARKER = 'LEDGER-BLIND UNLOADS (longsim scale-wall r29';

function preservedBlock() {
  const ev = fs.readFileSync('evidence/2026-10-14/sim-ledgerunload.md', 'utf8');
  const m = ev.match(/```js\n([\s\S]*?LEDGER-BLIND UNLOADS[\s\S]*?)```/);
  if (!m) throw new Error('preserved block not found in evidence/sim-ledgerunload.md');
  const lines = m[1].split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

if (mode === 'armed') {
  const gj = fs.readFileSync('src/js/game.js', 'utf8').split('\n');
  const hits = gj.map((l, i) => l.includes(MARKER) ? i : -1).filter(i => i >= 0);
  check('exactly one LEDGER-BLIND UNLOADS marker', hits.length === 1, 'found ' + hits.length);
  if (hits.length === 1) {
    // applied block = givenKcal context line + 14 added lines, dedented 8
    const applied = gj.slice(hits[0] - 1, hits[0] + 14).map(l => l.replace(/^ {8}/, ''));
    const preserved = preservedBlock();
    const same = preserved.length === applied.length && preserved.every((l, i) => l === applied[i]);
    check('re-applied patch char-identical to preserved r29 block', same,
      same ? '' : 'lengths ' + preserved.length + '/' + applied.length);
    // anchored at the Haven homecoming site (not the exile-amends site)
    const ctx = gj.slice(Math.max(0, hits[0] - 4), hits[0] + 18).join('\n');
    check('anchored at homecoming site (Haven pantry say nearby)',
      /unload \$\{givenKcal\} kcal into Haven's pantry/.test(ctx));
    check('exile-amends site untouched (oname fire say has no ledger write)',
      !gj.some((l, i) => /leave \$\{givenKcal\} kcal at/.test(l) &&
        gj.slice(i, i + 8).some(l2 => /vv\.gives/.test(l2) || /recordGiveHist/.test(l2))));
    check('no trust grant anywhere in the applied block',
      !applied.some(l => /trust/.test(l) && !/No trust grant/.test(l)));
  }
} else if (mode === 'pristine') {
  const gj = fs.readFileSync('src/js/game.js', 'utf8');
  check('zero LEDGER-BLIND UNLOADS markers after revert', !gj.includes(MARKER));
  let clean = false, detail = '';
  try { cp.execFileSync('git', ['diff', '--quiet'], { stdio: 'pipe' }); clean = true; }
  catch (e) { detail = 'git diff --quiet failed'; }
  check('tree byte-clean (git diff empty)', clean, detail);
  const ev = fs.readFileSync('evidence/2026-10-14/sim-ledgerunload.md', 'utf8');
  check('preserved r29 patch still present in evidence file', ev.includes(MARKER));
} else {
  console.error('usage: node scripts/test-unloaddiv-20261014.js --mode=armed|pristine');
  process.exit(2);
}

console.log(pass + '/' + (pass + fail) + ' checks pass');
process.exit(fail ? 1 : 0);
