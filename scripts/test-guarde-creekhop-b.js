#!/usr/bin/env node
// test-guarde-creekhop-b.js — PROOF for sim-guarde-creekhop-b.
// Prereg: evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
// Census (all must pass, else the instrument is broken and no
// leg may be judged against it):
//   (a) guard file + competent.js + homeconstruct policy/driver
//       unmodified in this worktree (git check);
//   (b) recorder on seed 69502 reproduces the prior corpus
//       exactly: day-5 start haven, forced moved-pattern
//       5 ok + 1 refused, hop (7,2)->(7,1) E pass + moved false;
//   (c) the 69502 disagreement classifies: entry blockers
//       non-empty AND engineBlock non-null, each naming a
//       blockType;
//   (d) destination tile attributes captured at hop time
//       (type/needsBridge/bridged/blockFrom key/swimmer);
//   (e) default A route parses to the 6 homewardac waypoints
//       ending (7,1), and the analyzer's PILOT_SEEDS are
//       exactly 69501-69508.
// The proof spawns the recorder as a child process (no repo
// writes; stdout captured in memory) with the homewardac
// substrate env. Exit 0 only if every check passes.
'use strict';
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function gitClean(files) {
  try {
    const out = execSync('git status --porcelain -- ' + files.join(' '), { cwd: ROOT, encoding: 'utf8' });
    return out.trim() === '';
  } catch (e) { return false; }
}
// (a) reused files unmodified
check('reused-files-unmodified', gitClean([
  'scripts/policies/competent-homewardstep-b.js',
  'scripts/policies/competent.js',
  'scripts/policies/competent-homewardconstruct-b.js',
  'scripts/homeconstruct-b-driver.js',
]));
// (e) route + pilot seeds
const { parseRoute } = require('./creekhop-b-recorder');
const route = parseRoute('5,4;6,4;7,4;7,3;7,2;7,1');
check('route-parses-6-waypoints', route.length === 6, route);
check('route-ends-7,1', route.length === 6 && route[5].x === 7 && route[5].y === 1, route[5]);
const { PILOT_SEEDS } = require('./analyze-guarde-creekhop-b');
check('pilot-seeds-69501-69508', JSON.stringify(PILOT_SEEDS) === JSON.stringify([69501, 69502, 69503, 69504, 69505, 69506, 69507, 69508]), PILOT_SEEDS);
// (b)(c)(d) recorder on 69502
const env = Object.assign({}, process.env, {
  COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '69502',
});
const run = spawnSync('node', ['scripts/creekhop-b-recorder.js'], { cwd: ROOT, env, encoding: 'utf8', timeout: 300000 });
check('recorder-exit-0', run.status === 0, (run.stderr || '').slice(-500));
let leg = null;
try {
  const lines = (run.stdout || '').split('\n').filter((l) => l.trim());
  leg = lines.length ? JSON.parse(lines[0]) : null;
} catch (e) { leg = null; }
check('recorder-emits-69502-leg', !!leg && leg.seed === 69502, leg && leg.seed);
if (leg) {
  check('day5-start-haven', leg.day5Start && leg.day5Start.x === 4 && leg.day5Start.y === 4, leg.day5Start);
  const attempted = (leg.hops || []).filter((h) => h.attempted);
  check('moved-pattern-5ok-1refused', JSON.stringify(attempted.map((h) => h.moved)) === JSON.stringify([true, true, true, true, true, false]), attempted.map((h) => h.moved));
  const last = attempted[attempted.length - 1];
  const isTarget = last && last.from.x === 7 && last.from.y === 2 && last.to.x === 7 && last.to.y === 1;
  check('target-hop-is-7,2->7,1', !!isTarget, last && { from: last.from, to: last.to });
  if (last) {
    check('target-E-pass', !!(last.E && last.E.ok), last.E);
    check('target-moved-false', last.moved === false, last.moved);
    // (c) classification available from BOTH models
    const entryTypes = ((last.entry && last.entry.blockers) || []).map((b) => b.blockType);
    check('target-entry-blockers-named', entryTypes.length > 0 && entryTypes.every(Boolean), entryTypes);
    check('target-engineBlock-named', !!(last.engineBlock && last.engineBlock.blockType), last.engineBlock);
    check('target-models-agree-on-blocker', entryTypes.includes(last.engineBlock && last.engineBlock.blockType), { entryTypes, engineType: last.engineBlock && last.engineBlock.blockType });
    // (d) tile attributes captured
    check('target-tile-captured', !!(last.tile && last.tile.type && typeof last.tile.needsBridge === 'boolean' && typeof last.tile.bridged === 'boolean' && ('blockFrom' in last.tile) && typeof last.swimmer === 'boolean'), last.tile);
    check('target-say-lines-captured', Array.isArray(last.sayLines) && last.sayLines.length > 0, last.sayLines);
  }
  check('no-recorder-error', !leg.error, leg.error);
}
console.log('test-guarde-creekhop-b: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
