#!/usr/bin/env node
// probe-r141-trim.js — TEMPORARY diagnostic (not a proof test).
// Question: does the driver's 50k emit-trim break index-based daily
// slicing (c0 = captured.length), undercounting M6 line counts?
// Method: run seed 41801 with the socialite policy for 37 days, wrap
// emit, count (a) total emits, (b) the day the 50k cap is first hit,
// (c) word/debate/settle lines in the FULL stream, (d) the same counts
// via the driver's c0-slice method. If (d) << (c) after the cap day,
// the trim is the cause.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

(async () => {
  const { Game, manifest } = await loadGame({ seed: 41801, mode: 'probe-r141-trim', fullTelemetry: true, narration: true });
  const captured = [];
  let dropped = 0, capDay = null, totalEmits = 0;
  const _emit = Game.emit;
  Game.emit = function (...a) {
    totalEmits++;
    try { captured.push({ d: (Game.state.scholar || {}).day || 0, s: a[1] || 'narration', t: String(a[0] || '').slice(0, 300) }); } catch (e) {}
    if (captured.length > 50000) {
      if (capDay === null) capDay = (Game.state.scholar || {}).day || 0;
      const n = captured.length - 50000;
      dropped += n;
      captured.splice(0, n);
    }
    try { return _emit.apply(this, a); } catch (e) { return a[0]; }
  };
  await setupGame(Game);
  // driver's c0-slice method, reproduced
  const sliceCounts = { burst: 0, settle: 0 };
  const fullCounts = { burst: 0, settle: 0 };
  const WORD = /Word gets around the haven/;
  const DEBATE = /Back at the haven the argument starts:/;
  const SETTLE = /It's settled\. The village is calling it/;
  const isBurst = (t) => WORD.test(t) || DEBATE.test(t);
  const pol = Object.assign({}, socialite, {
    id: 'probe-trim',
    daily(G2, ctx) {
      const c0 = captured.length; // driver's method (BUGGY after trim)
      const g0 = dropped + captured.length; // global-index method
      socialite.daily(G2, ctx);
      for (const c of captured.slice(c0)) { if (isBurst(c.t)) sliceCounts.burst++; if (SETTLE.test(c.t)) sliceCounts.settle++; }
      // full-stream counts are tallied at the end instead
    },
  });
  await runDays(Game, pol, { days: 37, manifest });
  // full stream is gone (trimmed) — recount from a second identical run is
  // impossible; instead count what remains + dropped estimate is not
  // available. So: report cap day + slice counts + remaining-array counts.
  let remBurst = 0, remSettle = 0;
  for (const c of captured) { if (isBurst(c.t)) remBurst++; if (SETTLE.test(c.t)) remSettle++; }
  console.log('totalEmits=' + totalEmits + ' capDay=' + capDay + ' dropped=' + dropped + ' remainingLen=' + captured.length);
  console.log('slice-method burst=' + sliceCounts.burst + ' settle=' + sliceCounts.settle);
  console.log('remaining-array burst=' + remBurst + ' settle=' + remSettle);
  console.log('namingKicked=' + Object.values((Game.state.codex || {}).monsters || {}).filter(e => e.namingKicked).length + ' settled=' + Object.values((Game.state.codex || {}).monsters || {}).filter(e => e.villageName).length);
  console.log('pendingHavenNews=' + (Game.state.pendingHavenNews || []).length);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
