#!/usr/bin/env node
'use strict';
// Dialog audit defect #2 + OVE-29 residual: mood/silence narration and
// recap-meta must never count as quotable resume memory.
const assert = require('assert');
const H = require('./sim-harness');

(async () => {
  await H.quietLog(async () => {
    const { Game: G } = await H.loadGame({ seed: 7 });
    await H.setupGame(G);

    // Landed PR #10 shapes.
    assert.strictEqual(G.convoSnippetIsRealBeat('They glance at the fire, then back.'), false);
    assert.strictEqual(G.convoSnippetIsRealBeat('A comfortable quiet settles between you.'), false);
    assert.strictEqual(G.convoSnippetIsRealBeat("You're a good listener. A tired smile."), false);
    assert.strictEqual(G.convoSnippetIsStageDirection('They glance at the fire, then back.'), true);

    // OVE-29 residual sampler (tip after #10/#14/#22): silence pool + recap meta.
    assert.strictEqual(
      G.convoSnippetIsStageDirection("You say nothing. Neither do they, for a while — and it's fine."),
      true,
      'warm silence pool is stage direction'
    );
    assert.strictEqual(
      G.convoSnippetIsRealBeat("You say nothing. Neither do they, for a while — and it's fine."),
      false,
      'warm silence must not quote into resume'
    );
    assert.strictEqual(G.convoSnippetIsStageDirection('Still on that hard time.'), true);
    assert.strictEqual(G.convoSnippetIsRealBeat('Still on that hard time.'), false);
    assert.strictEqual(G.convoSnippetIsStageDirection('Say it plain. Still on that hard time.'), true);
    assert.strictEqual(G.convoSnippetIsRealBeat('Say it plain. Still on that hard time.'), false);
    assert.strictEqual(G.convoSnippetIsStageDirection('Still on what they confided.'), true);

    // Pre-fix / residual ledgers may already hold a silence snippet (plant
    // used to accept them). Resume must keep the unfinished label and drop
    // the quote — mirror Nora seed99 day31 from the OVE-29 sampler.
    const vid = (G.state.village.roster || []).find(id => id !== G.villagerId);
    G.state.village.trust = G.state.village.trust || {};
    G.state.village.trust[vid] = 40;
    const L = G.convoTopicLedger(vid);
    L.open = (L.open || []).filter(o => o.tid !== 'skills');
    L.open.push({
      tid: 'skills',
      label: 'that plant lesson',
      day: (G.state.scholar || {}).day || 1,
      why: 'walked away mid-thread',
      snippet: "You say nothing. Neither do they, for a while — and it's fine.",
    });
    let opener = null;
    for (let i = 0; i < 40 && !opener; i++) {
      const c = G.convoGet(vid);
      if (c) c._resumedOnce = false;
      opener = G.convoResumeOpener(vid);
    }
    assert.ok(opener && opener.line, 'resume opener fires');
    assert.ok(/plant lesson/i.test(opener.line), 'thread label kept: ' + opener.line);
    assert.ok(!/You say nothing/i.test(opener.line), 'silence narration not quoted: ' + opener.line);

    // Party-join assent must not masquerade as topic memory.
    assert.strictEqual(G.convoSnippetIsRealBeat('...Fine. This had better be worth it.'), false);

    // Teach diegesis / wind-down stage tags (postfix OVE-29 sampler).
    assert.strictEqual(G.convoSnippetIsStageDirection('You show them Cacao — where it grows, how to tell it apart.'), true);
    assert.strictEqual(G.convoSnippetIsRealBeat('You show them Cacao — where it grows, how to tell it apart.'), false);
    assert.strictEqual(G.convoSnippetIsStageDirection('Anyway. A small smile.'), true);
    assert.strictEqual(G.convoSnippetIsRealBeat('Anyway. A small smile.'), false);

    // Real spoken content still counts.
    assert.strictEqual(G.convoSnippetIsRealBeat('The water haul went wrong after the storm.'), true);
    // characterGen reaction wrapper + dialogue is spoken memory, not mood pool.
    const still = 'They go still. "So it\'s not just me. Good. That\'s good to know."';
    assert.strictEqual(G.convoSnippetIsStageDirection(still), false);
    assert.strictEqual(G.convoSnippetIsRealBeat(still), true);
  });
  console.log('PASS test-snippet-stage-direction');
})().catch((e) => { console.error(e); process.exit(1); });
