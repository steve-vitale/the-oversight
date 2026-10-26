#!/usr/bin/env node
// scripts/test-feastrefresh-a.js — proof tests for sim-feastrefresh-a
// (feast refresh branch, DIAG arm, policy-side only).
//
// Covers, with no game-code change:
//   (1) refusalReason classification (reactor / devotion / other);
//   (2) matchPostSnap ordering (same-day part < 2 must NOT match);
//   (3) analyzeRefresh on synthetic stores: refresh counting,
//       draws-on-refresh counting, circling draws, window
//       extended / reset-to-fresh-length / quality-best-wins,
//       unmatched snapshots, chains, refusal reasons;
//   (4) snapBuffState pure reads: it must NEVER call
//       feastedActive() or feastDrawPending() (both can clear
//       state) — proven with a Game stub whose probes throw;
//   (5) METHOD-LEVEL proof on the real game code (loaded via
//       sim-harness, one seed, no runDays): a fresh armed grant
//       followed by a second grant while the buff is live
//       returns refreshed:true, draws NOTHING new, leaves a
//       still-circling draw untouched, extends the window to
//       grant day + 2, and keeps the better quality.
// Exit 1 on any failure; prints "PASS n/n" on success.
'use strict';
const assert = require('assert');
const { analyzeRefresh, refusalReason, matchPostSnap } = require('./test-feastrefresh-sweep');
const { snapBuffState, refreshLayerOn } = require('./policies/feastrefresh');
const { analyzeFeastdraw } = require('./policies/feastdraw-diag');

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  PASS ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}: ${String((e && e.message) || e).slice(0, 200)}`); }
}
function eq(a, b, msg) { assert.deepStrictEqual(a, b, msg || `${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

// ---- (1) refusal reasons ----
check('refusalReason reactor', () => eq(refusalReason('The feast is warm — but your reactor hums its steady note underneath, and the fire never catches.'), 'reactor'));
check('refusalReason devotion', () => eq(refusalReason('The feast is warm — but no keepsake was channeled. The surge must be armed (devotion gate).'), 'devotion'));
check('refusalReason other', () => eq(refusalReason('grant failed: something odd'), 'other'));
check('refusalReason null-safe', () => eq(refusalReason(null), 'other'));

// ---- (2) matchPostSnap ordering ----
const SNAPS = [
  { day: 10, part: 0, where: 'post', buff: { untilDay: 12 } },
  { day: 10, part: 1, where: 'post', buff: { untilDay: 12 } },
  { day: 10, part: 2, where: 'post', buff: { untilDay: 12 } },
  { day: 11, part: 0, where: 'post', buff: { untilDay: 13 } },
];
check('matchPostSnap skips same-day part<2', () => eq(matchPostSnap(SNAPS, 10).part, 2));
check('matchPostSnap later day', () => eq(matchPostSnap(SNAPS, 9).day, 10));
check('matchPostSnap none', () => eq(matchPostSnap(SNAPS, 99), null));
check('matchPostSnap pre snapshots ignored', () => {
  const only = [{ day: 10, part: 2, where: 'pre', buff: { untilDay: 12 } }];
  eq(matchPostSnap(only, 10), null);
});

// ---- (3) analyzeRefresh on synthetic stores ----
function synthStore() {
  return {
    grants: [
      // idx 0: fresh grant day 10, quality 1
      { day: 10, granted: true, refreshed: false, mult: 2.03, quality: 1, preBuff: null, preDraw: null, postDraw: { monsterId: 'buffering', veteran: false, day: 10 } },
      // idx 1: refresh day 11, quality 0 (best-wins keeps 1), circling draw present
      { day: 11, granted: true, refreshed: true, mult: 2.03, quality: 0, preBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false }, preDraw: { monsterId: 'buffering', veteran: false, day: 10 }, postDraw: { monsterId: 'buffering', veteran: false, day: 10 } },
      // idx 2: refresh day 12 with a NEW draw row attached (header contradiction probe)
      { day: 12, granted: true, refreshed: true, mult: 2.03, quality: 1, preBuff: { quality: 1, mult: 2.03, untilDay: 13, used: false }, preDraw: null, postDraw: null },
      // idx 3: reactor refusal day 13
      { day: 13, granted: false, refreshed: false, why: 'The feast is warm — but your reactor hums.' },
      // idx 4: devotion refusal day 14
      { day: 14, granted: false, refreshed: false, why: 'No keepsake was channeled (devotion gate).' },
    ],
    draws: [
      { day: 10, drawn: true, monsterId: 'buffering', veteran: false, wave: 3, grantIdx: 0 },
      { day: 12, drawn: true, monsterId: 'mirror_stag', veteran: false, wave: 2, grantIdx: 2 },
    ],
    faces: [], driveoffs: [], clears: [],
  };
}
const SYN_SNAPS = [
  { day: 11, part: 2, where: 'post', buff: { quality: 1, mult: 2.03, untilDay: 13, used: false }, draw: { monsterId: 'buffering', day: 10 } },
  { day: 12, part: 2, where: 'post', buff: { quality: 1, mult: 2.03, untilDay: 14, used: false }, draw: null },
];
check('analyzeRefresh counts refreshes', () => eq(analyzeRefresh(synthStore(), SYN_SNAPS).refreshCount, 2));
check('analyzeRefresh counts draws on refresh', () => eq(analyzeRefresh(synthStore(), SYN_SNAPS).drawsOnRefresh, 1));
check('analyzeRefresh circling + survived', () => {
  const ra = analyzeRefresh(synthStore(), SYN_SNAPS);
  eq(ra.circlingCount, 1); eq(ra.circlingSurvived, 1);
});
check('analyzeRefresh window extended + reset', () => {
  const ra = analyzeRefresh(synthStore(), SYN_SNAPS);
  eq(ra.extendedCount, 2); eq(ra.resetCount, 2);
});
check('analyzeRefresh quality best-wins', () => eq(analyzeRefresh(synthStore(), SYN_SNAPS).qualityBestCount, 2));
check('analyzeRefresh refusal reasons', () => {
  const ra = analyzeRefresh(synthStore(), SYN_SNAPS);
  eq(ra.reasonCounts, { reactor: 1, devotion: 1 });
});
check('analyzeRefresh chain', () => {
  const ra = analyzeRefresh(synthStore(), SYN_SNAPS);
  eq(ra.chains.length, 1);
  eq(ra.chains[0].freshDay, 10);
  eq(ra.chains[0].refreshDays, [11, 12]);
  eq(ra.longestChain, 3);
});
check('analyzeRefresh unmatched when no snapshot', () => {
  const ra = analyzeRefresh(synthStore(), []);
  eq(ra.unmatched, 2);
});
check('analyzeRefresh real analyzer agrees on fresh count', () => {
  const an = analyzeFeastdraw(synthStore(), null);
  eq(an.fresh, 1); eq(an.refreshed, 2); eq(an.refused, 2);
});

// ---- (4) snapBuffState pure reads ----
check('snapBuffState never probes feastedActive/feastDrawPending', () => {
  const Game = {
    state: { scholar: { feastBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false }, feastDraw: { monsterId: 'buffering', day: 10 } } },
    pendingEncounter: true, pendingMonsterId: 'buffering',
    feastedActive() { throw new Error('probe called'); },
    feastDrawPending() { throw new Error('probe called'); },
  };
  const st = snapBuffState(Game);
  eq(st.buff, { quality: 1, mult: 2.03, untilDay: 12, used: false });
  eq(st.draw, { monsterId: 'buffering', day: 10 });
  eq(st.pendingEncounter, true);
});
check('refreshLayerOn false when env unset', () => {
  delete process.env.FEASTREFRESH;
  eq(refreshLayerOn(), false);
});

// ---- (5) method-level proof on real game code ----
async function methodProof() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 73671, mode: 'feastrefresh-method-proof', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  check('method: game has grantFeastBuff', () => eq(typeof Game.grantFeastBuff, 'function'));
  let reactor = null;
  try { reactor = (typeof Game.fusionReactorOnline === 'function') ? Game.fusionReactorOnline() : false; } catch (e) { reactor = false; }
  check('method: reactor offline at setup (else refresh unreachable here)', () => eq(reactor, false));
  // Arm the devotion directly (test setup, not game play).
  s.prog = s.prog || {};
  s.prog.feastSurge = 2;
  const day0 = s.day || 0;
  const g1 = Game.grantFeastBuff({ quality: 1 });
  check('method: first grant is fresh', () => { eq(g1.granted, true); eq(g1.refreshed, false); });
  const drawAfterFresh = s.feastDraw ? String(s.feastDraw.monsterId) : null;
  const untilAfterFresh = s.feastBuff ? s.feastBuff.untilDay : null;
  check('method: fresh grant sets untilDay = day+2', () => eq(untilAfterFresh, day0 + 2));
  // Second grant while the buff is live: the refresh branch.
  const g2 = Game.grantFeastBuff({ quality: 0 });
  check('method: second grant is refreshed', () => { eq(g2.granted, true); eq(g2.refreshed, true); });
  check('method: refresh returns no draw field', () => eq(g2.draw, undefined));
  if (drawAfterFresh) {
    check('method: circling draw survives refresh untouched', () => {
      eq(s.feastDraw ? String(s.feastDraw.monsterId) : null, drawAfterFresh);
      eq(Game.pendingEncounter, true);
      eq(String(Game.pendingMonsterId), drawAfterFresh);
    });
  } else {
    console.log('  NOTE method: fresh grant drew nothing (pending encounter pre-existed?) — draw-survival check skipped, refresh checks still ran');
  }
  check('method: refresh keeps better quality (1 over 0)', () => eq(s.feastBuff ? s.feastBuff.quality : null, 1));
  // Advance one day inside the window and refresh again: extension.
  s.day = day0 + 1;
  const untilBefore = s.feastBuff ? s.feastBuff.untilDay : null;
  const g3 = Game.grantFeastBuff({ quality: 1 });
  check('method: next-day grant is refreshed', () => { eq(g3.granted, true); eq(g3.refreshed, true); });
  check('method: refresh extends window to grant day + 2', () => {
    eq(s.feastBuff ? s.feastBuff.untilDay : null, day0 + 3);
    assert.ok((s.feastBuff.untilDay) > untilBefore, 'untilDay must extend');
  });
}

methodProof().then(() => {
  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}).catch(e => {
  console.error('METHOD PROOF FAILED:', (e && e.stack) || e);
  process.exit(1);
});
