#!/usr/bin/env node
// scripts/test-flip73676-a.js — sim-flip73676-a proof (DIAG only).
// Certifies the diff-driven suspect ranking for the 73676 flip:
//   range ac98043a..e8f2ccad7, engine surface = src/js + src/data +
//   scripts/policies only. Asserts (1) the range is 13 commits,
//   (2) exactly one file in the engine surface changed across the
//   whole range, (3) exactly one commit in the range touches that
//   surface, (4) both dead-teacher guards are present in the
//   working tree's game.js, (5) the -1354 corpus rows for 73676
//   on both endpoints exist in git history (checked by the
//   evidence file, not by this script — corpora are data, and
//   this script only asserts git plumbing it can run).
// Usage: node scripts/test-flip73676-a.js  (exit 1 on any failure)
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
function git(args) {
  return execSync('git ' + args, { cwd: REPO, encoding: 'utf8' }).trim();
}
// 1. Range size.
const commits = git('rev-list ac98043a..e8f2ccad7').split('\n').filter(Boolean);
check('range is 13 commits', commits.length === 13, `got ${commits.length}`);
// 2. Engine-surface diff across the whole range: exactly one file.
const surf = git('diff --name-only ac98043a..e8f2ccad7 -- src/js src/data scripts/policies')
  .split('\n').filter(Boolean);
check('engine-surface diff is exactly src/js/game.js',
  surf.length === 1 && surf[0] === 'src/js/game.js', `got [${surf.join(', ')}]`);
// 3. Per-commit engine touch: exactly one commit touches the surface.
const touching = [];
for (const c of commits) {
  const names = git(`diff --name-only ${c}^ ${c} -- src/js src/data scripts/policies`).split('\n').filter(Boolean);
  if (names.length) touching.push({ c: c.slice(0, 8), names });
}
check('exactly one commit touches the engine surface',
  touching.length === 1, `got ${JSON.stringify(touching)}`);
check('the touching commit is e68a15e5f (journey crisis r51)',
  touching.length === 1 && touching[0].c === 'e68a15e5',
  touching.length ? touching[0].c : 'none');
// 4. Both guards present in the working tree's game.js.
const game = fs.readFileSync(path.join(REPO, 'src/js/game.js'), 'utf8');
check('animal-branch dead-teacher guard present',
  game.includes('aTeacherDead') && game.includes('DEAD TEACHERS DON\'T TEACH'));
check('plant-branch dead-discoverer guard present',
  game.includes('entry.discoveredBy') && game.includes('if (dvp && dvp.dead) return;'));
// 5. The range endpoints exist as commits.
for (const ref of ['ac98043a', 'e8f2ccad7']) {
  try { const h = git(`rev-parse --verify ${ref}^{commit}`); check(`endpoint ${ref} resolves`, h.length === 40, h); }
  catch (e) { check(`endpoint ${ref} resolves`, false, String(e.message).slice(0, 120)); }
}
console.log(`\nflip73676-a proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
