// test-transplant8c-dlgmore.js — targeted before/after proof for the
// narrowed family 8c hunk (arm sim-transplant8c-a).
//
// The 8c hunk (family-diff @@ -293,11 +308,27 @@, src/js/convo-dialogue.js)
// changes ONLY the dlg:more handler: the success return echoes what
// sayLine actually spoke (`line: said` instead of `line: composed`),
// a `_sayFellBack` early return retires "tell me more" without a
// second line, and the dry branch names unfinished work instead of
// "that's all" (inert on far-end substrate — the method it calls does
// not exist there). This script stages a ledger-blocked dlg:more beat
// and checks the two live effects:
//
//   Case A (blocked beat, dry pool available): sayLine falls back to
//     a dry line (truthy). FAR END (control): the handler returns the
//     phantom composed beat while the transcript holds the dry line
//     (r.line !== last spoken line). SUBJECT (8c): the handler returns
//     what was actually spoken (r.line === last spoken line).
//   Case B (blocked beat, dry pool exhausted: c.dryLines = 9): sayLine
//     returns null with _sayFellBack set. FAR END (control): falls
//     through to the dry branch and speaks a "that's all" line.
//     SUBJECT (8c): early return — r.line === null, threadDryFor is
//     set, no second line is emitted.
//
// Staging mirrors the dialog-audit #4 proof
// (scripts/test-live-thread-engage-dry-20261108.js): seed 1, a live
// villager, trust 40, thread 'past', depth 2, the whole pastFollow
// pool poisoned into the run ledger (convoPick's run-ledger
// awareness is a preference, not a hard filter, so a blocked beat is
// still served and sayLine falls back on it; convoComposeBeat returns
// the raw beat unchanged for a "tell me more" label, so the composed
// line's first chunk IS the beat's first chunk and the block fires).
//
// Usage: node scripts/test-transplant8c-dlgmore.js [--case a|b]
//   Exit 0 iff the 8c behaviors hold for the selected case(s).
//   EXPECTED: non-zero on the far end (the pre-fix control), 0 on the
//   8c subject. Run from the tree under test (pathspec extract for old
//   trees — never a full-tree extract, /tmp tmpfs is 512M).
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const DRY = /lost my train of thought|Never mind — go on|Actually, forget it|Where was I\? Gone|clean out of my head|slipped away from me|Wasn'?t important\. Probably/i;
const DRY_BRANCH = /pretty much all of it|I wish there was more to tell|That'?s the whole of it/i;

function lastThem(Game, vid) {
  const them = (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them');
  return them.length ? String(them[them.length - 1].text || '') : '';
}

async function stage() {
  const { Game } = await loadGame({ seed: 1, mode: 'transplant8c-dlgmore' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no villager');
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[vid] = 40;
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.thread = 'past';
  c.depth = 2;
  // Poison the whole pastFollow pool into the run ledger so whatever
  // beat convoThreadBeat serves is ledger-blocked at emission.
  const pastFollow = (((Game.data.characterGen || {}).convo || {}).pastFollow) || [];
  if (!pastFollow.length) throw new Error('pastFollow pool is empty — cannot stage a blocked beat');
  for (const pf of pastFollow) {
    for (const chunk of Game.convoSplitBeats(pf)) {
      Game.convoRunLedger().push(chunk.trim());
    }
  }
  return { Game, vid, c };
}

async function caseA() {
  const { Game, vid, c } = await stage();
  const r = Game.convoTurn(vid, 'dlg:more');
  const them = lastThem(Game, vid);
  const line = r && r.line != null ? String(r.line) : null;
  const checks = {
    sayFellBack: c._sayFellBack === true,
    returnedLineIsDry: line !== null && DRY.test(line),
    returnedLineIsSpoken: line !== null && line === them,
  };
  const pass = checks.sayFellBack && checks.returnedLineIsDry && checks.returnedLineIsSpoken;
  console.log(JSON.stringify({ case: 'A', pass: pass, checks: checks, line: line, them: them }, null, 2));
  return pass;
}

async function caseB() {
  const { Game, vid, c } = await stage();
  // Exhaust the 9-line dry pool so sayLine returns null with the flag set.
  c.dryLines = 9;
  const before = (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them' && DRY_BRANCH.test(String(t.text || ''))).length;
  const r = Game.convoTurn(vid, 'dlg:more');
  const after = (Game.convoGet(vid).transcript || []).filter(t => t && t.who === 'them' && DRY_BRANCH.test(String(t.text || ''))).length;
  const checks = {
    // Diagnostic only (not a pass input): post-turn _sayFellBack reflects
    // the LAST sayLine call of the turn. On the far end the dry-branch
    // emission resets it to false — which is itself the fall-through
    // evidence. On the subject the early return makes no second call.
    sayFellBack: c._sayFellBack === true,
    returnedNull: r !== null && r.line === null,
    threadDryForSet: c.threadDryFor === c.thread,
    noDryBranchLine: after === before,
  };
  const pass = checks.returnedNull && checks.threadDryForSet && checks.noDryBranchLine;
  console.log(JSON.stringify({ case: 'B', pass: pass, checks: checks, line: r ? r.line : '(no result)', threadDryFor: c.threadDryFor, thread: c.thread }, null, 2));
  return pass;
}

(async () => {
  const arg = process.argv[2] === '--case' ? process.argv[3] : null;
  let ok = true;
  if (!arg || arg === 'a') ok = (await caseA()) && ok;
  if (!arg || arg === 'b') ok = (await caseB()) && ok;
  console.log(ok ? 'TRANSPLANT8C DLGMORE: PASS (8c behavior holds)' : 'TRANSPLANT8C DLGMORE: FAIL (8c behavior absent)');
  process.exit(ok ? 0 : 1);
})().catch(function (e) { console.error('HARNESS ERROR', e && e.stack); process.exit(2); });
