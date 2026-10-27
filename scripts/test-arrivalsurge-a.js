// test-arrivalsurge-a.js — READ-ONLY git-history proof for sim-arrivalsurge-a.
//
// Re-runs the archaeology's load-bearing queries and prints PASS/FAIL.
// No sims, no game-code changes, no writes anywhere (git log/diff only).
// Run from the repo root: node scripts/test-arrivalsurge-a.js
// Exit 0 iff every check passes.
'use strict';
const { execSync } = require('child_process');
let pass = 0, fail = 0;
function git(args) {
  try { return execSync('git ' + args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { return ''; }
}
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const BASE = '120ea4d3a';   // Oct 25 base: parent of w4funnel-a commit 2d1d35df2
const MID = '5c3c80013';    // 0615Z coordinator base
const TIP = 'fc57dd0bd';    // re-pin base (journey-scale r43 note)

// 1. Base pin: w4funnel-a's parent is the Oct 25 base.
check('base-pin parent', git('rev-parse 2d1d35df2^').trim().startsWith(BASE), '2d1d35df2^ == ' + BASE);
// 2. Game tree identical between w5chain base and Oct 25 base.
check('w5chain-to-oct25 game tree identical',
  git('diff --stat d5d28d44..' + BASE + ' -- src/js src/data').trim() === '',
  'd5d28d44..' + BASE + ' src/js+src/data empty');
// 3. Zero -S hits for spawn/standing symbols in the window.
const symbols = ['spawnWaveTarget', 'waveCombatReadiness', 'villageStandingTotal', 'readyDemand', 'monsterWavePool', 'scripted-titan', 'tile-entry'];
for (const s of symbols) {
  check('-S ' + s + ' empty', git('log --oneline -S"' + s + '" ' + BASE + '..' + MID + ' -- src/js').trim() === '', 'no commit touches ' + s);
}
// 4. Spawn/standing files untouched in the window.
check('standing.js + monster data untouched',
  git('diff --stat ' + BASE + '..' + MID + ' -- src/js/standing.js src/data/monsters.json src/data/wave-ledger.json').trim() === '',
  'zero diff');
// 5. Recorders, policies, harness identical between bases.
const substrate = ['scripts/policies/spawnsrc-diag.js', 'scripts/policies/oldcore-diag.js',
  'scripts/policies/raftdraft-diag.js', 'scripts/policies/w5births-diag.js',
  'scripts/policies/defwound-diag.js', 'scripts/policies/leanlinkrescue.js',
  'scripts/policies/tableseat-nowait.js', 'scripts/sim-harness.js', 'scripts/sweep-compare.js'];
check('substrate identical', git('diff --stat ' + BASE + '..' + MID + ' -- ' + substrate.join(' ')).trim() === '',
  'recorders + policies + harness empty diff');
// 6. r43 window is exactly two commits, neither touching src/js.
const r43 = git('log --format=%h ' + MID + '..' + TIP).trim().split('\n').filter(Boolean);
check('r43 window is 2 commits', r43.length === 2 && r43.includes('a33fe3c74') && r43.includes('fc57dd0bd'), r43.join(','));
check('r43 touches no src/js', git('diff --stat ' + MID + '..' + TIP + ' -- src/js').trim() === '', 'scripts/evidence only');
// 7. Staffing fallbacks are in the window (after base, at/before MID).
function inWindow(h) {
  const ancMid = git('merge-base --is-ancestor ' + h + ' ' + MID + ' && echo yes').trim() === 'yes';
  const ancBase = git('merge-base --is-ancestor ' + h + ' ' + BASE + ' && echo yes').trim() === 'yes';
  return ancMid && !ancBase;
}
check('cook fallback 908ad0f12 in window', inWindow('908ad0f12'), 'sim-stafffallback-b');
check('fish fallback 8a7540534 in window', inWindow('8a7540534'), 'sim-fishfallback-b');
// 8. Bystander hold is in the window (fate candidate, disposed in evidence).
check('bystander hold c04d4e0cb in window', inWindow('c04d4e0cb'), 'journey-scale r42');
// 9. Window commit count sanity (213 commits per the archaeology).
const n = git('rev-list --count ' + BASE + '..' + MID).trim();
check('window size 213', n === '213', 'rev-list count ' + n);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
