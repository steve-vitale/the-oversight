#!/usr/bin/env node
// test-bedroll-b.js — proof for sim-bedroll-b.
// Usage: node scripts/test-bedroll-b.js
//   [--before evidence/2026-10-30/sim-bedroll-b-corpus-before]
//   [--after evidence/2026-10-30/sim-bedroll-b-corpus-after]
//   [--compare evidence/2026-10-30/sim-bedroll-b-compare.json]
// Exits 0 with PROOF-GREEN only if every check passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) args[process.argv[i].slice(2)] = process.argv[++i];
}
const BEFORE = args.before || path.join(ROOT, 'evidence', '2026-10-30', 'sim-bedroll-b-corpus-before');
const AFTER = args.after || path.join(ROOT, 'evidence', '2026-10-30', 'sim-bedroll-b-corpus-after');
const COMPARE = args.compare || path.join(ROOT, 'evidence', '2026-10-30', 'sim-bedroll-b-compare.json');
const SEEDS = [10710, 10711, 10712, 10713, 10714, 10715, 10716, 10717, 10718, 10719, 10720, 10721, 10722, 10723, 10724, 10725];
const BASE = 'c795e7e2535921c21fd0c27d5cd180f34d0fb40a';
const failures = [];
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures.push(name);
}
function sh(cmd) { return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim(); }

// T1: prereg committed before judged legs (it is an ancestor commit's file).
let preregLog = '';
try { preregLog = sh('git log --oneline -- evidence/2026-10-30/sim-bedroll-b-prereg.md'); } catch (e) {}
check('T1 prereg committed', preregLog.length > 0, preregLog.split('\n')[0] || 'none');
// T2: corpus completeness, both legs.
let complete = true, daysDetail = '';
for (const dir of [BEFORE, AFTER]) {
  for (const s of SEEDS) {
    const f = path.join(dir, `bedroll-b-insideevening-s${s}.json`);
    if (!fs.existsSync(f)) { complete = false; daysDetail += `missing ${f}; `; continue; }
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.daysAlive !== 30 || (j.checkpoints || []).length !== 269) { complete = false; daysDetail += `seed ${s} days=${j.daysAlive} cps=${(j.checkpoints || []).length}; `; }
  }
}
check('T2 corpora complete 16+16, 30 days, 269 checkpoints', complete, daysDetail || 'all seeds');
// T3: primary metric from the compare analysis.
const cmp = JSON.parse(fs.readFileSync(COMPARE, 'utf8'));
check('T3a baseline reproduces >=1 never-slept bedroll lie', cmp.before.lieCount >= 1, `lie=${cmp.before.lieCount}`);
check('T3b after lie count is 0', cmp.after.lieCount === 0, `lie=${cmp.after.lieCount}`);
const beforeLies = cmp.before.nights.filter((n) => n.neverSlept);
const covered = beforeLies.filter((n) => cmp.after.nights.some((a) => a.seed === n.seed && a.callIdx === n.callIdx && a.kind === 'awake' && a.sleeping === false));
check('T3c every baseline lie replaced 1:1 by an awake line', covered.length === beforeLies.length, `${covered.length}/${beforeLies.length}`);
check('T3d slept bedroll nights unchanged', cmp.before.sleptBedroll === cmp.after.sleptBedroll, `${cmp.before.sleptBedroll} -> ${cmp.after.sleptBedroll}`);
check('T3e player-line night count unchanged', cmp.before.playerLineNights === cmp.after.playerLineNights, `${cmp.before.playerLineNights} -> ${cmp.after.playerLineNights}`);
// T4: neutrality — zero non-stack diffs, stack-normalized corpora equal.
check('T4a zero non-stack diffs on all 16 seeds', cmp.neutrality.nonStackDiffs.length === 0, `nonStackSeeds=${cmp.neutrality.nonStackDiffs.length}`);
check('T4b stack-normalized corpora fully equal', cmp.neutrality.stackNormalizedEqual === true, `stackNormalizedEqual=${cmp.neutrality.stackNormalizedEqual}`);
// T5: signal agreement, both legs.
check('T5 slept-signal agreement (0 disagreements, both legs)', cmp.before.disagreements.length === 0 && cmp.after.disagreements.length === 0, `before=${cmp.before.disagreements.length} after=${cmp.after.disagreements.length}`);
// T6: fix present, narration-only, single src/js file vs pinned base.
const src = fs.readFileSync(path.join(ROOT, 'src', 'js', 'havenGrowth.js'), 'utf8');
check('T6a _sleeping branch present', /if \(this\._sleeping\) \{\s*\n\s*this\.say\(`One of them is coming for YOU/.test(src));
check('T6b slept line byte-identical', src.includes('inside the haven, eyes on your bedroll.`);'));
check('T6c awake line present', src.includes('inside the haven, eyes on you.`);'));
let jsChanged = '';
try { jsChanged = sh(`git diff --name-only ${BASE} -- src/js`); } catch (e) { jsChanged = 'ERR:' + e.message; }
check('T6d only havenGrowth.js changed vs pinned base', jsChanged === 'src/js/havenGrowth.js', jsChanged || '(none)');
check('T6e no spawn/damage/economy value in the fix hunk', (() => {
  let hunk = '';
  try { hunk = sh(`git diff ${BASE} HEAD -- src/js/havenGrowth.js`); } catch (e) {}
  const added = hunk.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++') && !/^\+\s*\/\//.test(l));
  return added.every((l) => !/\.hp|damage|kcal|pantry|raidN|linger|pendingEncounter =/.test(l));
})());
if (failures.length) { console.log(`PROOF-RED: ${failures.length} failure(s): ${failures.join(', ')}`); process.exit(1); }
console.log('PROOF-GREEN: T1–T6 all pass');
