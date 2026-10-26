#!/usr/bin/env node
// scripts/test-devotiongate-a.js — proof tests for sim-devotiongate-a
// (devotion-gate observation, DIAG arm, policy-side only).
//
// Covers, with no game-code change:
//   (1) refusalReason classification (reactor / devotion / other);
//   (2) classifyGate on synthetic gate rows: every decision
//       class plus every contradiction class the analyzer can
//       raise (a contradiction falsifies the header's
//       code-order claim, so each must be reachable);
//   (3) analyzeDevotiongate join completeness on synthetic
//       stores (aligned, misaligned-day, length mismatch);
//   (4) snapGate pure reads: it must NEVER call
//       feastedActive() or feastDrawPending() (both can clear
//       state) — proven with a Game stub whose probes throw;
//   (5) METHOD-LEVEL proof on the real game code (loaded via
//       sim-harness, one seed, no runDays): an unarmed,
//       reactor-free grant is refused by the devotion gate;
//       an armed grant passes both gates (fresh); a second
//       grant while live refreshes (gates passed again, no
//       new draw); and — when the reactor can be brought
//       online by state-setting in the test instance — an
//       unarmed reactor-online grant is refused as REACTOR,
//       not devotion, which is the code-order datum (the
//       reactor check runs first). If state-setting cannot
//       bring the reactor online in this instance, that
//       sub-case is reported SKIP (not pass): the order
//       proof then rests on the corpus (reactor refusals
//       with unarmed pre-state) plus the code quote.
// Exit 1 on any failure; prints "PASS n/n (+s skip)" on success.
'use strict';
const assert = require('assert');
const { classifyGate, analyzeDevotiongate, refusalReason, snapGate, layerOn } = require('./policies/devotiongate-diag');

let passed = 0, failed = 0, skipped = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`  PASS ${name}`); }
  catch (e) { failed++; console.log(`  FAIL ${name}: ${String((e && e.message) || e).slice(0, 200)}`); }
}
function skip(name, why) { skipped++; console.log(`  SKIP ${name}: ${why}`); }
function eq(a, b, msg) { assert.deepStrictEqual(a, b, msg || `${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

// ---- (1) refusal reasons ----
check('refusalReason reactor', () => eq(refusalReason('The feast is warm — but your reactor hums its steady note underneath. (Feast buff refused: the reactor is a ceiling as well as a floor.)'), 'reactor'));
check('refusalReason devotion', () => eq(refusalReason('The feast is warm — but no keepsake was channeled. (Feast buff refused: devotion gate.)'), 'devotion'));
check('refusalReason other', () => eq(refusalReason('grant failed: something odd'), 'other'));
check('refusalReason null-safe', () => eq(refusalReason(null), 'other'));

// ---- (2) classifyGate ----
const G = (granted, refreshed, why, pre) => ({ day: 10, granted, refreshed, why, pre });
check('classifyGate devotion-refusal clean', () => {
  const c = classifyGate(G(false, false, 'no keepsake was channeled (devotion gate).', { progFeastSurge: null, carriedSurge: 0, reactorOnline: false }));
  eq(c.decision, 'devotion-refusal'); eq(c.contradiction, null);
});
check('classifyGate devotion-refusal with reactor online is a contradiction', () => {
  const c = classifyGate(G(false, false, 'devotion gate.', { progFeastSurge: null, carriedSurge: null, reactorOnline: true }));
  eq(c.contradiction, 'devotion refusal with pre reactorOnline true (reactor check runs first)');
});
check('classifyGate devotion-refusal with arming is a contradiction', () => {
  const c = classifyGate(G(false, false, 'devotion gate.', { progFeastSurge: 1.5, carriedSurge: null, reactorOnline: false }));
  eq(c.contradiction, 'devotion refusal with an arming lane armed');
});
check('classifyGate reactor-refusal clean (armed pre-state still reactor)', () => {
  const c = classifyGate(G(false, false, 'the reactor is a ceiling as well as a floor.', { progFeastSurge: 1.5, carriedSurge: null, reactorOnline: true }));
  eq(c.decision, 'reactor-refusal'); eq(c.contradiction, null);
});
check('classifyGate reactor-refusal with reactor offline is a contradiction', () => {
  const c = classifyGate(G(false, false, 'reactor is a ceiling.', { progFeastSurge: null, carriedSurge: null, reactorOnline: false }));
  eq(c.contradiction, 'reactor refusal with pre reactorOnline false');
});
check('classifyGate reactor-refusal unarmed pre-state is the order datum (no contradiction)', () => {
  const c = classifyGate(G(false, false, 'reactor is a ceiling.', { progFeastSurge: null, carriedSurge: null, reactorOnline: true }));
  eq(c.decision, 'reactor-refusal'); eq(c.contradiction, null);
});
check('classifyGate gate-pass-fresh', () => {
  const c = classifyGate(G(true, false, null, { progFeastSurge: 1.5, carriedSurge: 1.5, reactorOnline: false }));
  eq(c.decision, 'gate-pass-fresh'); eq(c.contradiction, null);
});
check('classifyGate gate-pass-refresh', () => {
  const c = classifyGate(G(true, true, null, { progFeastSurge: 1.5, carriedSurge: 1.5, reactorOnline: false }));
  eq(c.decision, 'gate-pass-refresh'); eq(c.contradiction, null);
});
check('classifyGate grant with reactor online is a contradiction', () => {
  const c = classifyGate(G(true, false, null, { progFeastSurge: 1.5, carriedSurge: 1.5, reactorOnline: true }));
  eq(c.contradiction, 'grant with pre reactorOnline true (reactor check runs first)');
});
check('classifyGate grant with neither lane armed is a contradiction', () => {
  const c = classifyGate(G(true, false, null, { progFeastSurge: null, carriedSurge: 0, reactorOnline: false }));
  eq(c.contradiction, 'grant with neither arming lane armed');
});
check('classifyGate carried-surge-only grant passes (harvest_table lane)', () => {
  const c = classifyGate(G(true, false, null, { progFeastSurge: null, carriedSurge: 1.3, reactorOnline: false }));
  eq(c.decision, 'gate-pass-fresh'); eq(c.contradiction, null);
});
check('classifyGate other-refusal', () => {
  const c = classifyGate(G(false, false, 'grant failed: boom', { progFeastSurge: null, carriedSurge: null, reactorOnline: false }));
  eq(c.decision, 'other-refusal'); eq(c.contradiction, null);
});

// ---- (3) analyzeDevotiongate join ----
function synthGateStore(rows) { return { gates: rows }; }
function synthFeastStore(rows) { return { grants: rows, draws: [], faces: [], driveoffs: [], clears: [] }; }
const ALIGNED_GATES = [
  { day: 10, granted: true, refreshed: false, why: null, pre: { progFeastSurge: 1.5, carriedSurge: 1.5, reactorOnline: false } },
  { day: 11, granted: false, refreshed: false, why: 'no keepsake was channeled (devotion gate).', pre: { progFeastSurge: null, carriedSurge: 0, reactorOnline: false } },
  { day: 12, granted: false, refreshed: false, why: 'the reactor is a ceiling as well as a floor.', pre: { progFeastSurge: null, carriedSurge: null, reactorOnline: true } },
];
const ALIGNED_GRANTS = [
  { day: 10, granted: true, refreshed: false },
  { day: 11, granted: false, refreshed: false },
  { day: 12, granted: false, refreshed: false },
];
check('analyzeDevotiongate aligned join clean', () => {
  const da = analyzeDevotiongate(synthGateStore(ALIGNED_GATES), synthFeastStore(ALIGNED_GRANTS));
  eq(da.joinMismatch, 0); eq(da.counts, { 'gate-pass-fresh': 1, 'devotion-refusal': 1, 'reactor-refusal': 1 });
  eq(da.devotionRefusalCount, 1); eq(da.gatePassReactorFreeCount, 1); eq(da.contradictionCount, 0);
});
check('analyzeDevotiongate misaligned day counts join mismatch', () => {
  const grants = ALIGNED_GRANTS.slice(); grants[1] = Object.assign({}, grants[1], { day: 99 });
  const da = analyzeDevotiongate(synthGateStore(ALIGNED_GATES), synthFeastStore(grants));
  eq(da.joinMismatch >= 1, true);
});
check('analyzeDevotiongate length mismatch counts join mismatch', () => {
  const da = analyzeDevotiongate(synthGateStore(ALIGNED_GATES.slice(0, 2)), synthFeastStore(ALIGNED_GRANTS));
  eq(da.joinMismatch >= 1, true);
});

// ---- (4) snapGate pure reads ----
check('snapGate never probes feastedActive/feastDrawPending', () => {
  const Game = {
    state: { scholar: { day: 10, prog: { feastSurge: 1.5, sentimentTaught: true }, feastBuff: { quality: 1, mult: 2.03, untilDay: 12, used: false } } },
    fusionReactorOnline() { return false; },
    hasAbility() { return false; },
    feastedActive() { throw new Error('probe called'); },
    feastDrawPending() { throw new Error('probe called'); },
  };
  const st = snapGate(Game, { surge: 1.5 });
  eq(st.progFeastSurge, 1.5); eq(st.sentimentTaught, true); eq(st.reactorOnline, false);
  eq(st.carriedSurge, 1.5); eq(st.preBuff.quality, 1);
});
check('layerOn false when env unset', () => {
  delete process.env.DEVOTIONGATEDIAG;
  eq(layerOn(), false);
});

// ---- (5) method-level proof on real game code ----
async function methodProof() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 73671, mode: 'devotiongate-method-proof', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  check('method: game has grantFeastBuff', () => eq(typeof Game.grantFeastBuff, 'function'));
  let reactor = null;
  try { reactor = (typeof Game.fusionReactorOnline === 'function') ? Game.fusionReactorOnline() : false; } catch (e) { reactor = false; }
  check('method: reactor offline at setup', () => eq(reactor, false));
  // Force the unarmed state in this test instance only.
  try { s.prog.feastSurge = false; } catch (e) {}
  const rUnarmed = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 0 });
  check('method: unarmed reactor-free grant refused by devotion gate', () => {
    eq(rUnarmed.granted, false);
    eq(/devotion|keepsake/i.test(rUnarmed.why || ''), true);
  });
  // Arm the prog lane, grant fresh.
  try { s.prog.feastSurge = 1.5; } catch (e) {}
  const rFresh = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
  check('method: armed reactor-free grant passes both gates (fresh)', () => {
    eq(rFresh.granted, true); eq(rFresh.refreshed, false);
  });
  // Grant again while live: refresh (gates passed again, no new draw).
  const rRefresh = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
  check('method: armed live-buff grant refreshes (no draw field)', () => {
    eq(rRefresh.granted, true); eq(rRefresh.refreshed, true); eq(rRefresh.draw, undefined);
  });
  // Reactor online by state-setting in this test instance only.
  let online = false;
  try {
    s.fusionReactor = { installed: true, online: true };
    const ab = { id: 'fusion_reactor', level: 1, xp: 0, name: 'fusion_reactor' };
    if (Array.isArray(s.abilities)) s.abilities.push(ab);
    if (Array.isArray(s.backgroundAbilities)) s.backgroundAbilities.push(ab);
    online = (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : false;
  } catch (e) { online = false; }
  if (!online) {
    skip('method: reactor-online refusals (order datum)', 'state-setting could not bring fusionReactorOnline() true in this instance; order proof rests on corpus reactor-refusals with unarmed pre-state + the code quote');
    return;
  }
  check('method: reactor online at state-setting', () => eq(online, true));
  // Unarmed + reactor online: must refuse as REACTOR, not devotion.
  try { s.prog.feastSurge = false; } catch (e) {}
  const rReactorUnarmed = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 0 });
  check('method: unarmed reactor-online grant refused as reactor (order: reactor first)', () => {
    eq(rReactorUnarmed.granted, false);
    eq(/reactor/i.test(rReactorUnarmed.why || ''), true);
  });
  // Armed + reactor online: still reactor refusal.
  try { s.prog.feastSurge = 1.5; } catch (e) {}
  const rReactorArmed = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 });
  check('method: armed reactor-online grant refused as reactor', () => {
    eq(rReactorArmed.granted, false);
    eq(/reactor/i.test(rReactorArmed.why || ''), true);
  });
}

(async () => {
  await methodProof();
  console.log(`\nPASS ${passed}/${passed + failed} (skipped ${skipped})`);
  if (failed) process.exit(1);
})().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
