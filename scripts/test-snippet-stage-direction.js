#!/usr/bin/env node
'use strict';
const assert = require('assert');
const H = require('./sim-harness');

(async () => {
  await H.quietLog(async () => {
    const { Game: G } = await H.loadGame({ seed: 7 });
    await H.setupGame(G);

    assert.strictEqual(G.convoSnippetIsRealBeat('They glance at the fire, then back.'), false);
    assert.strictEqual(G.convoSnippetIsRealBeat('A comfortable quiet settles between you.'), false);
    assert.strictEqual(G.convoSnippetIsRealBeat("You're a good listener. A tired smile."), false);
    assert.strictEqual(G.convoSnippetIsStageDirection('They glance at the fire, then back.'), true);

    // Real spoken content still counts.
    assert.strictEqual(G.convoSnippetIsRealBeat('The water haul went wrong after the storm.'), true);
    // characterGen reaction wrapper + dialogue is spoken memory, not mood pool.
    const still = 'They go still. "So it\'s not just me. Good. That\'s good to know."';
    assert.strictEqual(G.convoSnippetIsStageDirection(still), false);
    assert.strictEqual(G.convoSnippetIsRealBeat(still), true);

    console.log('PASS test-snippet-stage-direction');
  });
})().catch((e) => { console.error(e); process.exit(1); });
