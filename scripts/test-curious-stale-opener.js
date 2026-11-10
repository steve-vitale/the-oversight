#!/usr/bin/env node
'use strict';
// Prove-out 2026-11-08: stale want openers must never speak raw want ids.
const assert = require('assert');
const H = require('./sim-harness');

(async () => {
  await H.quietLog(async () => {
    const { Game: G } = await H.loadGame({ seed: 42 });
    await H.setupGame(G);

    const curious = G.convoWantStaleOpener('v', { id: 'curious' });
    assert.ok(curious, 'curious generic line');
    assert.ok(!/About curious/i.test(curious), 'must not name want id: ' + curious);
    assert.ok(/what I asked you/i.test(curious), 'human topic: ' + curious);

    const favor = G.convoWantStaleOpener('v', { id: 'ask_favor' });
    assert.ok(!/About ask favor/i.test(favor), 'ask_favor must not name id: ' + favor);

    const repay = G.convoWantStaleOpener('v', { id: 'repay' });
    assert.ok(!/About repay/i.test(repay), 'repay must not name id: ' + repay);

    console.log('PASS test-curious-stale-opener');
  });
})().catch((e) => { console.error(e); process.exit(1); });
