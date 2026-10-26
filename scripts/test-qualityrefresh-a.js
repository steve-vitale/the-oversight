#!/usr/bin/env node
// scripts/test-qualityrefresh-a.js — proof tests for sim-qualityrefresh-a
// (the QUALITY-STEP refresh question, DIAG arm, policy-side only).
//
// Covers, with no game-code change:
//   (1) analyzeQuality on synthetic stores: quality-step detection
//       (grant quality AND post quality must agree), hold, mult
//       change, window extended / reset, host-quality agreement,
//       steered-feast census, cold-seat census, refused-feast
//       pricing split by reason and armed-vs-unarmed, and
//       grants-without-host residuals;
//   (2) liveBuffDirect pure reads: it must NEVER call
//       feastedActive() (which clears expired buffs) — proven with
//       a Game stub whose probe throws; expired buffs read as null;
//   (3) steeringOn / recOn env gates;
//   (4) METHOD-LEVEL proof on the real game code (loaded via
//       sim-harness, one seed, no runDays): a q0 fresh grant
//       refreshed by a q2 grant STEPS quality to 2 and mult to
//       uplift(2) * surge, resets the window to grant day + 2,
//       draws nothing, and leaves a still-circling draw untouched;
//       a q2 fresh grant refreshed by a q0 grant HOLDS quality 2
//       (best wins, not last wins).
// Exit 1 on any failure; prints "PASS n/n" on success.
'use strict';
const assert = require('assert');
const { analyzeQuality } = require('./test-qualityrefresh-sweep');
const { liveBuffDirect, steeringOn, recOn, trySteeredRefreshFeast } = require('./policies/qualityrefresh');

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  PASS ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}: ${String((e && e.message) || e).slice(0, 200)}`); }
}
function eq(a, b, msg) { assert.deepStrictEqual(a, b, msg || `${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

// ---- (1) analyzeQuality on synthetic stores ----
function synthFeastStore() {
  return {
    grants: [
      { day: 10, granted: true, refreshed: false, mult: 2.03, quality: 1, preBuff: null, preDraw: null, postDraw: { monsterId: 'buffering', day: 10 } },
      { day: 11, granted: true, refreshed: true, mult: 2.25, quality: 2, preBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false }, preDraw: null, postDraw: null },
      { day: 12, granted: true, refreshed: true, mult: 2.25, quality: 1, preBuff: { quality: 2, mult: 2.25, untilDay: 13, used: false }, preDraw: null, postDraw: null },
      { day: 13, granted: false, refreshed: false, why: 'The feast is warm — but your reactor hums.' },
      { day: 14, granted: false, refreshed: false, why: 'No keepsake was channeled (devotion gate).' },
      { day: 15, granted: true, refreshed: false, mult: 2.03, quality: 1, preBuff: null, preDraw: null, postDraw: null },
    ],
    draws: [], faces: [], driveoffs: [], clears: [],
  };
}
function synthHostStore() {
  return {
    feasts: [
      { day: 10, ok: true, quality: 1, spent: 3000, surgeSpent: 1.5, buffGranted: true, steered: false, coldSeats: 1, showed: ['a', 'b'], invited: ['a', 'b'], factors: { variety: 2, centerpiece: false, heart: 'a', turnout: 1, invitedN: 2, showedN: 2, perHead: 1000 }, score: 2 },
      { day: 11, ok: true, quality: 2, spent: 3200, surgeSpent: 1.5, buffGranted: true, steered: true, coldSeats: 0, showed: ['a', 'b', 'c', 'd'], invited: ['a', 'b', 'c', 'd'], factors: { variety: 4, centerpiece: true, heart: 'a', turnout: 1, invitedN: 4, showedN: 4, perHead: 640 }, score: 5 },
      { day: 12, ok: true, quality: 1, spent: 3100, surgeSpent: 1.5, buffGranted: true, steered: false, coldSeats: 0, showed: ['a', 'b'], invited: ['a', 'b'], factors: { variety: 2, centerpiece: false, heart: 'a', turnout: 1, invitedN: 2, showedN: 2, perHead: 1033 }, score: 2 },
      { day: 13, ok: true, quality: 1, spent: 2800, surgeSpent: 1.5, buffGranted: false, steered: false, coldSeats: 0, showed: ['a', 'b'], invited: ['a', 'b'], factors: { variety: 2, centerpiece: false, heart: 'a', turnout: 1, invitedN: 2, showedN: 2, perHead: 933 }, score: 2 },
      { day: 14, ok: true, quality: 1, spent: 2000, surgeSpent: 0, buffGranted: false, steered: false, coldSeats: 0, showed: ['a', 'b'], invited: ['a', 'b'], factors: { variety: 2, centerpiece: false, heart: 'a', turnout: 1, invitedN: 2, showedN: 2, perHead: 666 }, score: 2 },
    ],
  };
}
const SYN_SNAPS = [
  { day: 11, part: 2, where: 'post', buff: { quality: 2, mult: 2.25, untilDay: 13, used: false }, draw: null },
  { day: 12, part: 2, where: 'post', buff: { quality: 2, mult: 2.25, untilDay: 14, used: false }, draw: null },
];
check('analyzeQuality counts refreshes and steps', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.refreshCount, 2); eq(qa.stepCount, 1); eq(qa.holdCount, 1);
});
check('analyzeQuality step grant details (pre 1 -> grant 2 -> post 2)', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  const r = qa.refreshGrants[0];
  eq(r.preQuality, 1); eq(r.grantQuality, 2); eq(r.postQuality, 2);
  eq(r.step, true); eq(r.stepByPost, true); eq(r.stepAgree, true);
  eq(r.multChange, true); eq(r.host.steered, true); eq(r.host.coldSeats, 0);
});
check('analyzeQuality hold grant details (best wins, not last wins)', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  const r = qa.refreshGrants[1];
  eq(r.preQuality, 2); eq(r.grantQuality, 1); eq(r.postQuality, 2);
  eq(r.step, false); eq(r.multChange, false); eq(r.host.quality, 1);
});
check('analyzeQuality window extended + reset on both refreshes', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.extendedCount, 2); eq(qa.resetCount, 2);
});
check('analyzeQuality agreement residuals zero', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.stepAgreeFailures, 0); eq(qa.hostQualityMismatch, 0); eq(qa.unmatchedHost, 0);
});
check('analyzeQuality refused-feast pricing split', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.refusedTotal, 4800); eq(qa.refusedArmedTotal, 2800); eq(qa.refusedUnarmedTotal, 2000);
  eq(qa.refusedByReason, { reactor: 1, devotion: 1 });
  eq(qa.refusedCosts.length, 2);
});
check('analyzeQuality steered + cold-seat censuses', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.steeredCount, 1);
  eq(qa.coldSeatDays.length, 1); eq(qa.coldSeatDays[0].day, 10);
});
check('analyzeQuality quality census over granted feasts', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.qualityCensus, { q1: 3, q2: 1 });
});
check('analyzeQuality grants-without-host residual', () => {
  const qa = analyzeQuality(synthFeastStore(), synthHostStore(), SYN_SNAPS);
  eq(qa.grantsWithoutHost.length, 1); eq(qa.grantsWithoutHost[0].day, 15);
});

// ---- (2) liveBuffDirect pure reads ----
check('liveBuffDirect never probes feastedActive', () => {
  const Game = {
    state: { scholar: { day: 10, feastBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false } } },
    feastedActive() { throw new Error('probe called'); },
  };
  eq(liveBuffDirect(Game), { quality: 1, mult: 2.03, untilDay: 12, used: false });
});
check('liveBuffDirect expired buff reads as null', () => {
  const Game = { state: { scholar: { day: 12, feastBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false } } } };
  eq(liveBuffDirect(Game), null);
});
check('liveBuffDirect no buff reads as null', () => {
  const Game = { state: { scholar: { day: 10 } } };
  eq(liveBuffDirect(Game), null);
});

// ---- (3) env gates ----
check('steeringOn false when env unset', () => {
  delete process.env.QUALITYREFRESH;
  eq(steeringOn(), false);
});
check('recOn false when env unset', () => {
  delete process.env.HOSTFEASTREC;
  eq(recOn(), false);
});
check('steeringOn true when env 1', () => {
  process.env.QUALITYREFRESH = '1';
  eq(steeringOn(), true);
  delete process.env.QUALITYREFRESH;
});

// ---- (3b) steering leg on a stub Game: it fires exactly when a live
// buff meets a reactor guest, and stands down when there is none ----
function stubGame(reactorGuest) {
  const calls = [];
  return {
    calls: calls,
    dayPart: 2,
    villagerId: 'me',
    state: {
      scholar: { day: 10, feastDay: null, feastBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false }, prog: { feastSurge: 1.5 } },
      village: { gives: { me: 2000 } },
    },
    playerAtHaven() { return true; },
    fusionReactorOnline() { return false; },
    feastPlan() { return { ok: true, have: 10000, guests: [{ vid: 'r1', status: 'here' }, { vid: 'c1', status: 'here' }, { vid: 'c2', status: 'here' }] }; },
    npcHasAbility(vid, abil) { return abil === 'fusion_reactor' && reactorGuest && vid === 'r1'; },
    hostFeast(opts) { calls.push(opts); return { ok: true, quality: 1, spent: 2000, buffGranted: true }; },
  };
}
check('steering fires on live buff + reactor guest, excluding the reactor guest', () => {
  process.env.QUALITYREFRESH = '1';
  const Game = stubGame(true);
  const ctx = { _givesHist: [{ day: 4, g: 0 }] };
  const rep = trySteeredRefreshFeast(Game, ctx, null);
  eq(rep != null, true);
  eq(Game.calls.length, 1);
  eq(Game.calls[0].guests, ['c1', 'c2']);
  eq(ctx._qrHostDay, 10);
  eq(ctx.qrInterventions.length, 1);
  eq(ctx.qrInterventions[0].reactorExcluded, ['r1']);
  delete process.env.QUALITYREFRESH;
});
check('steering stands down when no reactor guest is present', () => {
  process.env.QUALITYREFRESH = '1';
  const Game = stubGame(false);
  const ctx = { _givesHist: [{ day: 4, g: 0 }] };
  const rep = trySteeredRefreshFeast(Game, ctx, null);
  eq(rep, null);
  eq(Game.calls.length, 0);
  delete process.env.QUALITYREFRESH;
});
check('steering stands down when the buff is expired (fresh, not refresh)', () => {
  process.env.QUALITYREFRESH = '1';
  const Game = stubGame(true);
  Game.state.scholar.day = 12; // buff untilDay 12: dawn has come, not live
  const ctx = { _givesHist: [{ day: 4, g: 0 }] };
  const rep = trySteeredRefreshFeast(Game, ctx, null);
  eq(rep, null);
  eq(Game.calls.length, 0);
  delete process.env.QUALITYREFRESH;
});

// ---- (4) method-level proof on real game code ----
async function methodProof() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 73671, mode: 'qualityrefresh-method-proof', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  check('method: game has grantFeastBuff', () => eq(typeof Game.grantFeastBuff, 'function'));
  let reactor = null;
  try { reactor = (typeof Game.fusionReactorOnline === 'function') ? Game.fusionReactorOnline() : false; } catch (e) { reactor = false; }
  check('method: reactor offline at setup (else refresh unreachable here)', () => eq(reactor, false));
  // Scenario A: q0 fresh, refreshed by q2 — the step.
  s.prog = s.prog || {};
  s.prog.feastSurge = 2;
  const day0 = s.day || 0;
  const g1 = Game.grantFeastBuff({ quality: 0 });
  check('method A: q0 grant is fresh, mult = uplift(0) * surge = 2.4', () => {
    eq(g1.granted, true); eq(g1.refreshed, false); eq(g1.quality, 0); eq(g1.mult, 2.4);
  });
  const drawAfterFresh = s.feastDraw ? String(s.feastDraw.monsterId) : null;
  check('method A: fresh grant sets untilDay = day+2', () => eq(s.feastBuff ? s.feastBuff.untilDay : null, day0 + 2));
  // Advance one day inside the window and refresh with a better feast.
  s.day = day0 + 1;
  const g2 = Game.grantFeastBuff({ quality: 2 });
  check('method A: q2 grant while live is refreshed, no draw field', () => {
    eq(g2.granted, true); eq(g2.refreshed, true); eq(g2.draw, undefined);
  });
  check('method A: refresh STEPS quality 0 -> 2 and mult 2.4 -> 3.0', () => {
    eq(s.feastBuff ? s.feastBuff.quality : null, 2);
    eq(s.feastBuff ? s.feastBuff.mult : null, 3.0);
    eq(g2.quality, 2); eq(g2.mult, 3.0);
  });
  check('method A: refresh resets window to grant day + 2 (no stacking)', () => {
    eq(s.feastBuff ? s.feastBuff.untilDay : null, day0 + 3);
  });
  if (drawAfterFresh) {
    check('method A: circling draw survives refresh untouched', () => {
      eq(s.feastDraw ? String(s.feastDraw.monsterId) : null, drawAfterFresh);
      eq(Game.pendingEncounter, true);
      eq(String(Game.pendingMonsterId), drawAfterFresh);
    });
  } else {
    console.log('  NOTE method A: fresh grant drew nothing (pending encounter pre-existed?) — draw-survival check skipped, step checks still ran');
  }
  // Scenario B: q2 fresh, refreshed by q0 — best wins, not last wins.
  try { delete s.feastBuff; } catch (e) {}
  try { delete s.feastDraw; } catch (e) {}
  try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
  s.prog.feastSurge = 2;
  const dayB = s.day || 0;
  const h1 = Game.grantFeastBuff({ quality: 2 });
  check('method B: q2 grant is fresh, mult = 3.0', () => {
    eq(h1.granted, true); eq(h1.refreshed, false); eq(h1.quality, 2); eq(h1.mult, 3.0);
  });
  const h2 = Game.grantFeastBuff({ quality: 0 });
  check('method B: q0 refresh HOLDS quality 2 (best wins)', () => {
    eq(h2.granted, true); eq(h2.refreshed, true); eq(h2.quality, 2); eq(h2.mult, 3.0);
    eq(s.feastBuff ? s.feastBuff.quality : null, 2);
    eq(s.feastBuff ? s.feastBuff.mult : null, 3.0);
  });
  check('method B: hold-refresh still resets window to grant day + 2', () => {
    eq(s.feastBuff ? s.feastBuff.untilDay : null, dayB + 2);
  });
}

methodProof().then(() => {
  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}).catch(e => {
  console.error('METHOD PROOF FAILED:', (e && e.stack) || e);
  process.exit(1);
});
