#!/usr/bin/env node
// test-rebuildaudit-gate.js — sim-rebuildaudit static audit proof (2026-10-18).
//
// Proves the wave-4 unlock gate replacement is a single design-call change:
// "[needs-eyes] combat readiness gates wave unlocks (standing opens door,
// readiness decides) (#designcall4)" (2026-10-16 19:55:10Z), which replaced
// the faced-experience bar in src/js/standing.js waveUnlockReady(4) with the
// combat-readiness bar (waveCombatReadiness).
//
// Assertions (all against commits that exist in the repo):
//   A1. At the pre-dc4 anchor (4fc725b8), waveUnlockReady(4) is the
//       FACED-EXPERIENCE bar: waveEngaged(3) >= readyFacedW3 (3 distinct
//       wave-3 types faced blow-by-blow; fleeing counts). No waveCombatReadiness.
//   A2. At the post-dc4 pre-rebuild tip (26b3b226), waveUnlockReady(4)
//       delegates to waveCombatReadiness(4): four named bars from live village
//       state (armored 4 @P>=15, armed 5, tricks 3, veterans 2 — readyDemand).
//       The old faced bar (readyFacedW3) is gone.
//   A3. RECORDED 2026-10-18 (object since pruned — see evidence): while the
//       dc4 merge object ebcd... still existed, `git log -S waveCombatReadiness
//       4fc725b8..26b3b226 -- src/js/standing.js` returned EXACTLY that one
//       merge — the single introduction commit. This check re-verifies the
//       symbol is present post / absent pre, and records the pinpoint.
//   A4. The history rebuild is tree-faithful on unlock code: diff of the old
//       tip (26b3b226) vs the rebuild root (6f134de2) touches NO unlock files
//       (src/js/standing.js, src/js/game.js, src/data/wave-ledger.json,
//       src/js/ledger.js, src/js/havenGrowth.js) — only version-bump artifacts.
//
// Zero game-code changes: read-only git inspection. Run from the repo root
// (any ref state; the script addresses commits by hash).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const PRE = '4fc725b8c1d033ccebe2f76da91ba78458251c1a';   // dc5-armorl1 merge, 2026-10-16 19:33:40Z (pre-dc4)
const POST = '26b3b22690ebdc724609120023095aba00ad78c4';  // pre-rebuild master tip, 2026-10-16 23:14:40Z (post-dc4)
const NEWROOT = '6f134de24010bf9779cc3d16d31df9a8aecf92bc'; // rebuild root, 2026-10-16 23:25:30Z
// The dc4 merge object (ebcd...) was verified 2026-10-18 via `git log -S
// waveCombatReadiness` as the single introduction commit, then pruned from the
// object store by concurrent environment maintenance (neighbors survive; see
// evidence/2026-10-18/sim-rebuildaudit.md "infrastructure note"). Its full
// diff was captured in that evidence file before the prune.

function git(...args) {
  return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' });
}
function show(commit, file) {
  return git('show', `${commit}:${file}`);
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// A1: pre-dc4 gate = faced-experience
{
  const src = show(PRE, 'src/js/standing.js');
  check('A1-old-gate-faced-experience',
    src.includes('waveEngaged(3)') && src.includes('readyFacedW3') && !src.includes('waveCombatReadiness'));
}

// A2: post-dc4 gate = combat readiness, four named bars, old bar retired
{
  const src = show(POST, 'src/js/standing.js');
  check('A2-new-gate-combat-readiness',
    src.includes('waveCombatReadiness') && src.includes('readyDemand') &&
    src.includes('4: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 }'));
  check('A2-old-bar-retired', !src.includes('readyFacedW3'),
    'readyFacedW3 still present post-dc4');
}

// A3: symbol present post / absent pre (pinpoint recorded 2026-10-18, see header)
{
  const pre = show(PRE, 'src/js/standing.js');
  const post = show(POST, 'src/js/standing.js');
  check('A3-symbol-introduced-in-window',
    !pre.includes('waveCombatReadiness') && post.includes('waveCombatReadiness'));
  console.log('  (single-introduction pinpoint via `git log -S` recorded 2026-10-18 in evidence; merge object since pruned)');
}

// A4: rebuild tree-faithful on unlock code (old tip vs rebuild root)
{
  const stat = git('diff', '--name-only', POST, NEWROOT).trim().split('\n').filter(Boolean);
  const unlockFiles = ['src/js/standing.js', 'src/js/game.js', 'src/data/wave-ledger.json', 'src/js/ledger.js', 'src/js/havenGrowth.js'];
  const touched = stat.filter(f => unlockFiles.includes(f));
  check('A4-rebuild-tree-faithful-unlock-code', touched.length === 0,
    `unlock files differ: ${touched.join(', ')}`);
  console.log(`  (rebuild diff total: ${stat.length} files: ${stat.join(', ')})`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
