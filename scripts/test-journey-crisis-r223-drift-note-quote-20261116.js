#!/usr/bin/env node
'use strict';
// Proof: drift-note stage direction must never quote as resume memory
// (journey-crisis r223).
//
// RED (wild case: crisis r223, seed 14475, Tamika d11): the d10 sitting
// opened with the bitterness drift note — "Tamika has an edge today —
// something curdled." — a stage-direction beat from convoDriftNote
// (one short stage-direction beat when a drift channel crosses >=2).
// The grief thread planted in that sitting carried the drift note as
// its snippet, and the d11 resume opener quoted it as the thread's
// memory: "We never finished talking about grief — we wandered off it.
// 'Tamika has an edge today — something curdled.'" A mood narration
// about the NPC, quoted as if she had said it. Root cause:
// convoSnippetIsStageDirection has no pattern for proper-name mood
// narration — its openings are "They ...", "A comfortable ...", and
// the like — so "{Name} has an edge today" passed convoSnippetIsRealBeat
// at plant time and again at resume time. All five convoDriftNote
// templates share the shape ("{Name} <present-tense phrase> — <clause>.",
// no quoted speech), so all five slip through.
//
// GREEN (post-fix): the five drift-note template tails are matched in
// convoSnippetIsStageDirection, so the plant walks back to substance (or
// plants nothing) and the resume-time guard drops quotes planted before
// the fix. Spoken content still passes: mourning lines, goodbyes, and
// quoted debate all remain quotable memories.
//
// The fix spends no RNG and touches no trajectory: the guard is a pure
// string test consulted at plant time (convoThreadOpen /
// convoLastThreadSnippet) and resume time (convoResumeOpener); it only
// changes which human phrase one spoken opener line uses. Uses the
// shared harness (scripts/sim-harness). Exits nonzero on failure.
const assert = require('assert');
const H = require('./sim-harness');

const BITTERNESS = 'Tamika has an edge today — something curdled.';
// The five convoDriftNote template tails, with different names.
const DRIFT_LINES = [
  'Tamika has an edge today — something curdled.',
  'Priya looks hollowed out — grief\'s been sitting heavy.',
  'Nino keeps glancing past you — braced for something.',
  'Delali seems lighter — something good landed recently.',
  'Jamie looks weathered — the hard days are showing.',
];
// Spoken content that must stay quotable.
const SPOKEN = [
  'Andre always took the burnt piece. Said someone had to. I take it now.',
  'I should go. You know where to find me.',
  "That's the whole of it. Sorry.",
  'The whole fire was arguing about Choir Toad last night.',
];

(async () => {
  await H.quietLog(async () => {
    const { Game: G } = await H.loadGame({ seed: 7 });
    await H.setupGame(G);

    // (1) Gate units: every drift-note template is stage direction.
    for (const line of DRIFT_LINES) {
      assert.strictEqual(G.convoSnippetIsStageDirection(line), true, 'drift note is stage direction: ' + line);
      assert.strictEqual(G.convoSnippetIsRealBeat(line), false, 'drift note is not a real beat: ' + line);
    }
    console.log('  ok gate units: 5 drift-note templates rejected');    // (2) Controls: spoken content still passes the real-beat gate.
    for (const line of SPOKEN) {
      assert.strictEqual(G.convoSnippetIsRealBeat(line), true, 'spoken line stays quotable: ' + line);
    }

    // (3) Plant ghost: a thread whose only snippet is a drift note
    // plants nothing (no ghost thread).
    const vid = (G.state.village.roster || []).find(id => id !== G.villagerId);
    G.state.village.trust = G.state.village.trust || {};
    G.state.village.trust[vid] = 40;
    const L = G.convoTopicLedger(vid);
    L.open = (L.open || []).filter(o => o.tid !== 'grief');
    const before = L.open.length;
    G.convoThreadOpen(vid, 'grief', 'grief', 'unfinished', BITTERNESS);
    assert.strictEqual(L.open.length, before, 'drift-note-only plant plants nothing');

    // (4) Resume guard (pre-fix plant): an open thread carrying a
    // drift-note snippet resumes WITHOUT quoting the drift note — mirror
    // the Nora seed99 shape in test-snippet-stage-direction.js.
    L.open.push({
      tid: 'grief',
      label: 'grief',
      day: (G.state.scholar || {}).day || 1,
      why: 'changed the subject',
      snippet: BITTERNESS,
    });
    let opener = null;
    for (let i = 0; i < 40 && !opener; i++) {
      const c = G.convoGet(vid);
      if (c) c._resumedOnce = false;
      opener = G.convoResumeOpener(vid);
    }
    assert.ok(opener && opener.line, 'resume opener fires');
    assert.ok(/grief/i.test(opener.line), 'thread label kept: ' + opener.line);
    assert.ok(!/has an edge today/i.test(opener.line), 'drift note not quoted: ' + opener.line);
    assert.ok(!/something curdled/i.test(opener.line), 'drift-note tail not quoted: ' + opener.line);

  });
  console.log('PASS test-journey-crisis-r223-drift-note-quote');
})().catch(e => { console.error('FAIL:', e && e.message || e); process.exit(1); });
