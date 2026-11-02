#!/usr/bin/env node
// test-creekdetour-b.js — PROOF SKELETON at prereg commit (sim-creekdetour-b).
// The full proof (BFS detour, refusal-memory re-plan, bridge gate, swimmer
// lane, perception-law call audit) lands with the candidate policy, before
// any judged sim. This skeleton pins the prereg contract only: GO bar,
// horizon, and the allowed-read list the full proof will audit against.
// Usage: node scripts/test-creekdetour-b.js  (exit 0 = skeleton green)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let pass = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  pass++;
  console.log('ok - ' + name);
}

// Prereg contract, read from the committed prereg file itself.
const prereg = fs.readFileSync(
  path.join(__dirname, '..', 'evidence', '2026-11-02', 'sim-creekdetour-b-prereg.md'), 'utf8');
ok('prereg states GO bar 6/8', /≥ 6\/8 pilot seeds/.test(prereg) || /6\/8/.test(prereg));
ok('prereg names mandatory seed 97307', /97307/.test(prereg));
ok('prereg states DAYS=180 horizon', /DAYS=180/.test(prereg));
ok('prereg forbids worldMonsters in routing', /NEVER/.test(prereg) && /worldMonsters/.test(prereg));
ok('prereg defines DIAG-GO alternative', /DIAG-GO/.test(prereg));

// TODO (full proof, next commit): these are SKIPPED, not passing, until
// scripts/policies/creekdetour.js exists. A skip is not a pass.
const TODO = [
  'BFS avoids a needsBridge creek tile and reaches the lair',
  'a refused hop is remembered and the re-plan routes around it',
  'bridge fallback fires only when no path exists AND wood >= 4',
  'swimmer lane recorded separately from detour arrivals',
  'routing works on a stub Game with no worldMonsters (perception audit)',
  'greedy-regression: blocked greedy step does not end the march',
];
for (const t of TODO) console.log('skip (TODO) - ' + t);

console.log(`SKELETON GREEN: ${pass} contract checks passed, ${TODO.length} proof cases TODO.`);
