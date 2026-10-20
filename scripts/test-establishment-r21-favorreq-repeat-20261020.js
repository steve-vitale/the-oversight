#!/usr/bin/env node
// test-establishment-r21-favorreq-repeat-20261020.js — proof test for the
// establishment-leg (r21) blank fix.
//
// BLANK (r21 M3 people-check): asking "why can't I do this now?"
// (dlg:favor_requirements) back-to-back re-served the VERBATIM requirements
// line — Angelo (seed 61), Ruth (seed 82), Erin (seed 103) each got the
// position-blocked line x6-7 identically, transcript-verified. The recap
// handler already solved this class (convoRecapLine's count-aware reframe);
// the favor branch never got the treatment.
//
// FIX (src/js/convo-dialogue.js, favor dlg branch): blocked requirements
// lines now reframe on repeat — "As I said — …", "Like I said — …",
// "Still the same thing — …", then "I've told you three times now — …".
// Keyed on the raw line so a state change (they move next to you -> ready)
// naturally resets the counter; blocked lines only (a successful
// favor_action performance is untouched); the choice stays in the menu
// because the underlying state can change.
//
// Method: extract the REAL favor-dlg branch source from the worktree (NEW)
// and from the immutable pre-fix parent (OLD), eval each against a fixture
// Game context, and assert the before/after delta. No copies of the logic.
//
// Usage: node scripts/test-establishment-r21-favorreq-repeat-20261020.js
//   SEED=7 node scripts/test-establishment-r21-favorreq-repeat-20261020.js
'use strict';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

// Seeded PRNG (mulberry32, fixed default, SEED env override). The branch
// under test is deterministic; the seed is installed for harness hygiene.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
Math.random = mulberry32(SEED);

const ROOT = path.join(__dirname, '..');
const NEW_SRC = fs.readFileSync(path.join(ROOT, 'src/js/convo-dialogue.js'), 'utf8');
// Keep the original RED assertions against the actual pre-fix source. A
// moving merge-base includes the fix after landing and reverses the fixture.
const OLD_REF = 'c7697540c';
const OLD_SRC = cp.execFileSync('git', ['show', OLD_REF + ':src/js/convo-dialogue.js'], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString();

let failures = 0;
function eq(actual, expected, label) {
  if (actual === expected) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

function extractBlock(src, startMarker) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('marker not found: ' + startMarker);
  const open = src.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(open, j + 1); }
  }
  throw new Error('unbalanced braces after: ' + startMarker);
}

const RAW = 'Move next to them, on the same side of the Haven door, to help.';

// Drive the REAL extracted branch N times against a fixture Game context.
// reasonFn: (callIndex) -> requirements reason string (lets the test change
// the underlying state mid-run). performFn: fixture convoPerformFavor.
function driveBranch(src, { turns, reasonFn, performFn, choiceId }) {
  const block = extractBlock(src, "if (dlg === 'favor_action'");
  const fn = new Function('vid', 'choiceId', 'dlg', 'c', block);
  const said = [];
  let call = 0;
  const favor = { vid: 'v1', kind: 'sick_help', state: 'asked', id: 'f1' };
  const c = { transcript: [], want: { favor } };
  const ctx = {
    state: { village: { promises: {} }, scholar: { day: 20 } },
    over: false,
    convoGetFavor: () => favor,
    convoFavorAction: () => ({ ready: false, reason: reasonFn(call) }),
    convoPerformFavor: () => performFn(call),
    journalFavorPromise: () => {},
    sayLine: (vid, line) => { said.push(String(line)); return line; },
    convoChoices: () => [],
    save: () => {},
  };
  const out = [];
  const dlg = choiceId.slice(4);
  for (let i = 0; i < turns; i++) {
    const r = fn.call(ctx, 'v1', choiceId, dlg, c);
    out.push(r.line);
    call++;
  }
  return { out, said, convo: c };
}

const alwaysBlocked = () => RAW;
const neverSucceeds = () => ({ ok: false, line: 'nope' });

console.log('RED — OLD branch (pre-fix): identical line every pick');
{
  const { out } = driveBranch(OLD_SRC, { turns: 5, reasonFn: alwaysBlocked, performFn: neverSucceeds, choiceId: 'dlg:favor_requirements' });
  eq(out.length, 5, 'OLD: 5 turns ran');
  ok(out.every(l => l === RAW), 'OLD: all 5 lines verbatim-identical (the bug)');
  const uniq = new Set(out).size;
  eq(uniq, 1, 'OLD: exactly 1 distinct line across 5 repeats');
}

console.log('GREEN — NEW branch: reframes, then names the repetition');
{
  const { out, said } = driveBranch(NEW_SRC, { turns: 5, reasonFn: alwaysBlocked, performFn: neverSucceeds, choiceId: 'dlg:favor_requirements' });
  eq(out[0], RAW, 'NEW: 1st pick serves the raw requirements line');
  eq(out[1], `As I said — ${RAW}`, 'NEW: 2nd pick reframes ("As I said")');
  eq(out[2], `Like I said — ${RAW}`, 'NEW: 3rd pick reframes ("Like I said")');
  eq(out[3], `Still the same thing — ${RAW}`, 'NEW: 4th pick reframes ("Still the same thing")');
  eq(out[4], `I've told you three times now — ${RAW}`, 'NEW: 5th pick names the repetition');
  eq(new Set(out).size, 5, 'NEW: 5 distinct lines — no verbatim cycle');
  ok(JSON.stringify(said) === JSON.stringify(out), 'NEW: sayLine emitted exactly the returned lines');
}

console.log('GREEN — NEW branch: a state change resets the counter');
{
  const reasons = [RAW, RAW, 'You need edible, unspoiled food in your pack.'];
  const { out } = driveBranch(NEW_SRC, {
    turns: 3, reasonFn: (i) => reasons[i], performFn: neverSucceeds,
    choiceId: 'dlg:favor_requirements',
  });
  eq(out[0], RAW, 'NEW: 1st pick raw');
  eq(out[1], `As I said — ${RAW}`, 'NEW: 2nd pick reframed');
  eq(out[2], reasons[2], 'NEW: changed reason serves verbatim (fresh counter)');
}

console.log('GREEN — NEW branch: successful favor_action is untouched');
{
  const { out } = driveBranch(NEW_SRC, {
    turns: 2,
    reasonFn: alwaysBlocked,
    performFn: () => ({ ok: true, line: 'You hand over the food. They eat like it matters.' }),
    choiceId: 'dlg:favor_action',
  });
  eq(out[0], 'You hand over the food. They eat like it matters.', 'NEW: success line passes through unreframed');
  eq(out[1], 'You hand over the food. They eat like it matters.', 'NEW: repeated success stays unreframed');
}

console.log('GREEN — NEW branch: favor_cancel unavailable line also reframes');
{
  const { out } = driveBranch(NEW_SRC, {
    turns: 2, reasonFn: alwaysBlocked, performFn: neverSucceeds,
    choiceId: 'dlg:favor_cancel',
  });
  // favor_cancel with a non-unsupported status falls to { ok:false, line: status.reason }
  eq(out[0], RAW, 'NEW: cancel 1st pick raw');
  eq(out[1], `As I said — ${RAW}`, 'NEW: cancel 2nd pick reframed');
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
