// test-tendfloor-guard-adopt-20261104.js — adoption proof for the stranded
// sim-tendfloor-guard-b confirm arm (Loop B run fleshout-loop-b-20261104T1735Z).
// Proves the ADOPTED corpus (not fixtures): 32 per-seed files on the fresh
// band 99217-99232, both legs present, zero instrument errors, and the
// prereg guard wrapper judges exactly NO-GO with legs (a) FAIL, (b) PASS,
// (c) FAIL, (d) PASS, (e) FAIL. Pure functions over the corpus; writes nothing.
// Usage: node scripts/test-tendfloor-guard-adopt-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const WRAP = require(path.join(REPO, 'scripts', 'test-tendfloor-guard-analyze-20261104'));
let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
function approx(name, got, want, tol) {
  if (got != null && Math.abs(got - want) <= tol) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + got + ' want~' + want); }
}
const dir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-tendfloor-guard-b');
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
eq('corpus file count', files.length, 32);
const bySeed = {};
for (const f of files) {
  const out = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  eq('arm field ' + f, out.arm, 'tendfloor-guard');
  bySeed[out.seed] = bySeed[out.seed] || {};
  bySeed[out.seed][out.run] = out;
}
eq('seed count', Object.keys(bySeed).length, 16);
const pairs = [];
let errTotal = 0;
for (let s = 99217; s <= 99232; s++) {
  const g = bySeed[s];
  eq('both legs seed ' + s, !!(g && g['tendfloor-guard-base'] && g['tendfloor-guard-armed']), true);
  if (g && g['tendfloor-guard-base'] && g['tendfloor-guard-armed']) {
    errTotal += g['tendfloor-guard-base'].instrumentErrors.length + g['tendfloor-guard-armed'].instrumentErrors.length;
    pairs.push(WRAP.pairSeeds(g['tendfloor-guard-base'], g['tendfloor-guard-armed']));
  }
}
eq('instrument errors total', errTotal, 0);
// Provenance: the 31 copied cells carry the stranded tip anchor; the one
// cell re-run by this adoption carries this worktree's HEAD anchor.
eq('copied cell anchor 99232 base', bySeed[99232]['tendfloor-guard-base'].anchorCommit, 'e533b4a2ecd4');
eq('adopted cell is the re-run 99232 armed', bySeed[99232]['tendfloor-guard-armed'].days, 180);
eq('adopted cell anchor differs from copied cells',
  bySeed[99232]['tendfloor-guard-armed'].anchorCommit !== 'e533b4a2ecd4', true);
// Prereg file present and carries all five guards.
const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-04', 'sim-tendfloor-guard-b-prereg.md'), 'utf8');
eq('prereg names drop-count guard (e)', prereg.indexOf('DROP-COUNT GUARD') >= 0, true);
const j = WRAP.judgeGo(pairs);
eq('judge verdict', j.verdict, 'NO-GO');
eq('guard (a) no regression FAILS', j.legA_noRegression, false);
eq('guard (a) regressions', j.regressions, [99224, 99225]);
eq('guard (b) median delta', j.legB_medianDelta, 0);
eq('guard (b) passes', j.legB_pass, true);
approx('guard (c) baseline hold', j.legC_baseHold, 1, 1e-9);
approx('guard (c) armed hold', j.legC_armedHold, 0.916243654822335, 1e-9);
eq('guard (c) FAILS', j.legC_pass, false);
eq('guard (d) wave4 base/armed', [j.legD_baseW4, j.legD_armedW4], [7, 7]);
eq('guard (d) wave5 base/armed', [j.legD_baseW5, j.legD_armedW5], [0, 1]);
eq('guard (d) passes', j.legD_pass, true);
eq('guard (e) drops base/armed', [j.legE_baseDrops, j.legE_armedDrops], [0, 3]);
eq('guard (e) FAILS', j.legE_pass, false);
console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
process.exitCode = fail ? 1 : 0;
